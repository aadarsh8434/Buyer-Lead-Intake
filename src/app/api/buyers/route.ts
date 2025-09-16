import { NextRequest, NextResponse } from "next/server";
import { createBuyerSchema, buyerQuerySchema } from "@/lib/validations/buyer";
import { getSessionUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams);

    // Add defaults for missing parameters
    const paramsWithDefaults = {
      page: "1",
      limit: "10",
      sortBy: "updatedAt",
      sortOrder: "desc",
      ...params,
    };

    const validatedParams = buyerQuerySchema.parse(paramsWithDefaults);
    const {
      page,
      limit,
      search,
      city,
      propertyType,
      status,
      timeline,
      sortBy,
      sortOrder,
    } = validatedParams;

    // Now page and limit are already numbers from the schema transformation
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (city) where.city = city;
    if (propertyType) where.propertyType = propertyType;
    if (status) where.status = status;
    if (timeline) where.timeline = timeline;

    // Get total count for pagination
    const total = await prisma.buyer.count({ where });

    // Get buyers
    const buyers = await prisma.buyer.findMany({
      where,
      skip,
      take: limit, // Already a number
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: buyers,
      pagination: {
        page, // Already a number
        limit, // Already a number
        total,
        totalPages: Math.ceil(total / limit), // Already a number
      },
    });
  } catch (error) {
    console.error("GET /api/buyers error:", error);

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = rateLimit(`create_${user.id}`, 10, 60000); // 10 per minute
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": new Date(
              rateLimitResult.resetTime
            ).toISOString(),
          },
        }
      );
    }

    const body = await request.json();
    const validatedData = createBuyerSchema.parse(body);

    // Clean email field
    if (validatedData.email === "") {
      validatedData.email = undefined;
    }

    const buyer = await prisma.$transaction(async (tx) => {
      // Create buyer
      const newBuyer = await tx.buyer.create({
        data: {
          ...validatedData,
          ownerId: user.id,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Create history entry
      await tx.buyerHistory.create({
        data: {
          buyerId: newBuyer.id,
          changedBy: user.id,
          diff: {
            action: "created",
            fields: validatedData,
          },
        },
      });

      return newBuyer;
    });

    return NextResponse.json(buyer, {
      status: 201,
      headers: {
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      },
    });
  } catch (error) {
    console.error("POST /api/buyers error:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
