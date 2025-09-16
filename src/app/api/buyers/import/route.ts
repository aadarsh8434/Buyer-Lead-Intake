import { NextRequest, NextResponse } from "next/server";
import { csvImportSchema } from "@/lib/validations/buyer";
import { getSessionUser } from "@/lib/auth";
import Papa from "papaparse";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "File must be a CSV" },
        { status: 400 }
      );
    }

    const text = await file.text();

    const { data: csvData, errors: parseErrors } = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
    });

    if (parseErrors.length > 0) {
      return NextResponse.json(
        { error: "CSV parsing failed", details: parseErrors },
        { status: 400 }
      );
    }

    if (csvData.length > 200) {
      return NextResponse.json(
        { error: "Maximum 200 rows allowed" },
        { status: 400 }
      );
    }

    // Validate each row
    const validRows: any[] = [];
    const errors: { row: number; errors: string[] }[] = [];

    csvData.forEach((row: any, index: number) => {
      try {
        const validatedRow = csvImportSchema.parse(row);

        // Clean email
        if (validatedRow.email === "") {
          validatedRow.email = undefined;
        }

        validRows.push({
          ...validatedRow,
          ownerId: user.id,
        });
      } catch (error: any) {
        const errorMessages = error.errors?.map(
          (e: any) => `${e.path.join(".")}: ${e.message}`
        ) || [error.message];
        errors.push({
          row: index + 2, // +2 because index starts at 0 and we have header row
          errors: errorMessages,
        });
      }
    });

    if (validRows.length === 0) {
      return NextResponse.json(
        {
          message: "No valid rows to import",
          errors,
          imported: 0,
          total: csvData.length,
        },
        { status: 400 }
      );
    }

    // Import valid rows in transaction
    const result = await prisma.$transaction(async (tx) => {
      const createdBuyers = [];

      for (const rowData of validRows) {
        const buyer = await tx.buyer.create({
          data: rowData,
        });

        await tx.buyerHistory.create({
          data: {
            buyerId: buyer.id,
            changedBy: user.id,
            diff: {
              action: "imported",
              fields: rowData,
            },
          },
        });

        createdBuyers.push(buyer);
      }

      return createdBuyers;
    });

    return NextResponse.json({
      message: `Successfully imported ${result.length} buyers`,
      imported: result.length,
      total: csvData.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("POST /api/buyers/import error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
