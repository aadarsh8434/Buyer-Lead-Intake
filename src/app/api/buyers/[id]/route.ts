import { NextRequest, NextResponse } from "next/server";
import { updateBuyerSchema } from "@/lib/validations/buyer";
import { getSessionUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const buyer = await prisma.buyer.findUnique({
      where: { id: id },
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
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    // ✅ Convert tags back to array for frontend
    if (buyer.tags) {
      buyer.tags = buyer.tags.split(","); // SQLite stores as string
    }

    return NextResponse.json(buyer);
  } catch (error) {
    console.error("GET /api/buyers/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Rate limiting
    const rateLimitResult = rateLimit(`update_${user.id}`, 20, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validatedData = updateBuyerSchema.parse(body);

    // ✅ Get current buyer for ownership check
    const currentBuyer = await prisma.buyer.findUnique({
      where: { id: id },
    });

    if (!currentBuyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    if (currentBuyer.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only edit your own leads" },
        { status: 403 }
      );
    }

    // ✅ Concurrency control
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

    if (validatedData.email === "") {
      validatedData.email = undefined;
    }

    const { updatedAt, ...updateData } = validatedData;

    // ✅ Convert tags array → string for SQLite
    if (Array.isArray(updateData.tags)) {
      updateData.tags = updateData.tags.join(",");
    }

    // ✅ Calculate diff
    const diff: any = {};
    Object.keys(updateData).forEach((key) => {
      const typedKey = key as keyof typeof updateData;
      if (currentBuyer[typedKey] !== updateData[typedKey]) {
        diff[key] = {
          from: currentBuyer[typedKey],
          to: updateData[typedKey],
        };
      }
    });

    const updatedBuyer = await prisma.$transaction(async (tx) => {
      const buyer = await tx.buyer.update({
        where: { id: id },
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

    return NextResponse.json(updatedBuyer);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentBuyer = await prisma.buyer.findUnique({
      where: { id: id },
    });

    if (!currentBuyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    if (currentBuyer.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own leads" },
        { status: 403 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.buyerHistory.deleteMany({
        where: { buyerId: id },
      });

      await tx.buyer.delete({
        where: { id: id },
      });
    });

    return NextResponse.json({ message: "Buyer deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/buyers/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
