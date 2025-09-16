import { NextRequest, NextResponse } from "next/server";
import { buyerQuerySchema } from "@/lib/validations/buyer";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams);

    // Remove pagination for export (we want all matching records)
    delete params.page;
    delete params.limit;

    const validatedParams = buyerQuerySchema
      .omit({ page: true, limit: true })
      .parse(params);
    const { search, city, propertyType, status, timeline, sortBy, sortOrder } =
      validatedParams;

    // Build where clause (same as GET /api/buyers)
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

    // Get all matching buyers
    const buyers = await prisma.buyer.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    // Convert to CSV format
    const csvHeaders = [
      "fullName",
      "email",
      "phone",
      "city",
      "propertyType",
      "bhk",
      "purpose",
      "budgetMin",
      "budgetMax",
      "timeline",
      "source",
      "notes",
      "tags",
      "status",
      "createdAt",
      "updatedAt",
    ];

    const csvRows = buyers.map((buyer) => [
      buyer.fullName,
      buyer.email || "",
      buyer.phone,
      buyer.city,
      buyer.propertyType,
      buyer.bhk || "",
      buyer.purpose,
      buyer.budgetMin || "",
      buyer.budgetMax || "",
      buyer.timeline,
      buyer.source,
      buyer.notes || "",
      buyer.tags.join(","),
      buyer.status,
      buyer.createdAt.toISOString(),
      buyer.updatedAt.toISOString(),
    ]);

    // Create CSV content
    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) =>
        row
          .map((field) =>
            typeof field === "string" &&
            (field.includes(",") || field.includes('"') || field.includes("\n"))
              ? `"${field.replace(/"/g, '""')}"` // Escape quotes and wrap in quotes
              : field
          )
          .join(",")
      ),
    ].join("\n");

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="buyers-export-${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (error) {
    console.error("GET /api/buyers/export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
