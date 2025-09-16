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

    // ✅ Remove pagination params for export
    delete params.page;
    delete params.limit;

    const validatedParams = buyerQuerySchema
      .omit({ page: true, limit: true })
      .parse(params);

    const { search, city, propertyType, status, timeline, sortBy, sortOrder } =
      validatedParams;

    // ✅ Build Prisma where clause dynamically
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

    // ✅ Fetch all matching buyers (no pagination)
    const buyers = await prisma.buyer.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
    });

    // ✅ Define CSV headers
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

    // ✅ Build CSV rows
    const csvRows = buyers.map((buyer) => {
      // Ensure tags is always a string (never null or undefined)
      let tagsString = "";

      if (typeof buyer.tags === "string") {
        tagsString = buyer.tags;
      } else if (Array.isArray(buyer.tags)) {
        tagsString = buyer.tags.join(",");
      }

      return [
        buyer.fullName ?? "",
        buyer.email ?? "",
        buyer.phone ?? "",
        buyer.city ?? "",
        buyer.propertyType ?? "",
        buyer.bhk ?? "",
        buyer.purpose ?? "",
        buyer.budgetMin ?? "",
        buyer.budgetMax ?? "",
        buyer.timeline ?? "",
        buyer.source ?? "",
        buyer.notes ?? "",
        tagsString,
        buyer.status ?? "",
        buyer.createdAt.toISOString(),
        buyer.updatedAt.toISOString(),
      ];
    });

    // ✅ Create CSV content safely
    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) =>
        row
          .map((field) =>
            typeof field === "string" &&
            (field.includes(",") || field.includes('"') || field.includes("\n"))
              ? `"${field.replace(/"/g, '""')}"` // escape commas/quotes/newlines
              : field
          )
          .join(",")
      ),
    ].join("\n");

    // ✅ Send CSV as file download
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
