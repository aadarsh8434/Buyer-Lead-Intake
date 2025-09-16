import { NextRequest, NextResponse } from "next/server";
import { updateBuyerSchema } from "@/lib/validations/buyer";
import { getSessionUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

/**
 * ===========================
 * GET /api/buyers/[id]
 * ===========================
 * Fetch a buyer by ID.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract ID
    const { id } = await params;

    // Get session user
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find buyer by ID
    const buyer = await prisma.buyer.findUnique({
      where: { id },
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

    if (!buyer) {
      return NextResponse.json(
        { error: "Buyer not found" },
        { status: 404 }
      );
    }

    // ✅ Convert tags string → array for frontend
    const buyerResponse = {
      ...buyer,
      tags: buyer.tags ? buyer.tags.split(",") : [],
    };

    return NextResponse.json(buyerResponse);

  } catch (error) {
    console.error("GET /api/buyers/[id] error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * ===========================
 * PUT /api/buyers/[id]
 * ===========================
 * Update a buyer record.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ Apply rate limiting (20 updates per minute per user)
    const rateLimitResult = rateLimit(`update_${user.id}`, 20, 60_000);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    // Parse and validate input
    const body = await request.json();

    const validatedData = updateBuyerSchema.parse(body);

    // Get current record for concurrency and ownership checks
    const currentBuyer = await prisma.buyer.findUnique({
      where: { id },
    });

    if (!currentBuyer) {
      return NextResponse.json(
        { error: "Buyer not found" },
        { status: 404 }
      );
    }

    // Ownership check
    if (currentBuyer.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only edit your own leads" },
        { status: 403 }
      );
    }

    // Concurrency control: reject stale updates
    if (validatedData.updatedAt) {
      const providedUpdatedAt = new Date(validatedData.updatedAt);

      if (currentBuyer.updatedAt.getTime() !== providedUpdatedAt.getTime()) {
        return NextResponse.json(
          {
            error:
              "Record has been modified by another user. Please refresh and try again.",
          },
          { status: 409 }
        );
      }
    }

    // Clean empty email field
    if (validatedData.email === "") {
      validatedData.email = undefined;
    }

    // Build updateData safely
    const { updatedAt, ...rest } = validatedData;

    const updateData: Record<string, any> = {
      ...rest,
      tags: Array.isArray(rest.tags) ? rest.tags.join(",") : rest.tags,
    };

    // Calculate diff for history
    const diff: Record<string, { from: any; to: any }> = {};

    Object.keys(updateData).forEach((key) => {
      const previousValue = currentBuyer[key as keyof typeof currentBuyer];
      const newValue = updateData[key];

      if (previousValue !== newValue) {
        diff[key] = {
          from: previousValue,
          to: newValue,
        };
      }
    });

    // Run Prisma transaction
    const updatedBuyer = await prisma.$transaction(async (tx) => {
      const buyer = await tx.buyer.update({
        where: { id },
        data: updateData,
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

      // Record history only if changes were made
      if (Object.keys(diff).length > 0) {
        await tx.buyerHistory.create({
          data: {
            buyerId: id,
            changedBy: user.id,
            diff: {
              action: "updated",
              changes: diff,
            },
          },
        });
      }

      return buyer;
    });

    // ✅ Convert tags back to array before sending to frontend
    return NextResponse.json({
      ...updatedBuyer,
      tags: updatedBuyer.tags ? updatedBuyer.tags.split(",") : [],
    });

  } catch (error) {
    console.error("PUT /api/buyers/[id] error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * ===========================
 * DELETE /api/buyers/[id]
 * ===========================
 * Delete a buyer record.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const currentBuyer = await prisma.buyer.findUnique({
      where: { id },
    });

    if (!currentBuyer) {
      return NextResponse.json(
        { error: "Buyer not found" },
        { status: 404 }
      );
    }

    // Ownership check
    if (currentBuyer.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own leads" },
        { status: 403 }
      );
    }

    // Delete inside a transaction
    await prisma.$transaction(async (tx) => {
      await tx.buyerHistory.deleteMany({
        where: { buyerId: id },
      });

      await tx.buyer.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      message: "Buyer deleted successfully",
    });

  } catch (error) {
    console.error("DELETE /api/buyers/[id] error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
