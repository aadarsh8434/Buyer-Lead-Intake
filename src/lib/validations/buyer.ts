// lib/validations/buyer.ts
// Additional validation schemas for API endpoints
import { z } from "zod";
import {
  cityEnum,
  propertyTypeEnum,
  statusEnum,
  timelineEnum,
  sourceEnum,
  bhkEnum,
  purposeEnum,
  buyerSchema,
} from "@/lib/validators";

// Create schema - exclude status and updatedAt from creation
export const createBuyerSchema = buyerSchema.omit({
  status: true,
  updatedAt: true,
});

// Update schema - use the full buyer schema (includes status and updatedAt)
export const updateBuyerSchema = buyerSchema;

// Query parameters schema for listing/filtering buyers
export const buyerQuerySchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val) || 1)
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .transform((val) => parseInt(val) || 10)
    .pipe(z.number().min(1).max(100)),
  search: z.string().optional(),
  city: cityEnum.optional(),
  propertyType: propertyTypeEnum.optional(),
  status: statusEnum.optional(),
  timeline: timelineEnum.optional(),
  sortBy: z
    .enum(["updatedAt", "createdAt", "fullName"])
    .optional()
    .default("updatedAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// CSV import schema - handles string inputs from CSV and transforms them
export const csvImportSchema = z
  .object({
    fullName: z.string().min(2).max(80),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().regex(/^\d{10,15}$/),
    city: cityEnum,
    propertyType: propertyTypeEnum,
    bhk: bhkEnum.optional().or(z.literal("")),
    purpose: purposeEnum,
    budgetMin: z
      .string()
      .transform((val) => (val ? parseInt(val) : undefined))
      .pipe(z.number().int().nonnegative().optional()),
    budgetMax: z
      .string()
      .transform((val) => (val ? parseInt(val) : undefined))
      .pipe(z.number().int().nonnegative().optional()),
    timeline: timelineEnum,
    source: sourceEnum,
    notes: z.string().max(1000).optional().or(z.literal("")),
    tags: z
      .string()
      .transform((val) => (val ? val.split(",").map((t) => t.trim()) : []))
      .optional(),
    status: statusEnum.optional().default("New"),
  })
  .refine(
    (data) => {
      if (["Apartment", "Villa"].includes(data.propertyType) && !data.bhk) {
        return false;
      }
      return true;
    },
    {
      message: "BHK is required for Apartment and Villa properties",
    }
  )
  .refine(
    (data) => {
      if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
        return false;
      }
      return true;
    },
    {
      message: "Budget max must be greater than or equal to budget min",
    }
  );
