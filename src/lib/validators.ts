// lib/validators.ts
import { z } from "zod";

// --- ENUMS (aligned with Prisma) ---
export const cityEnum = z.enum([
  "Chandigarh",
  "Mohali",
  "Zirakpur",
  "Panchkula",
  "Other",
]);

export const propertyTypeEnum = z.enum([
  "Apartment",
  "Villa",
  "Plot",
  "Office",
  "Retail",
]);

export const bhkEnum = z.enum(["Studio", "One", "Two", "Three", "Four"]);
export const purposeEnum = z.enum(["Buy", "Rent"]);

export const timelineEnum = z.enum([
  "ZERO_TO_THREE_MONTHS",
  "THREE_TO_SIX_MONTHS",
  "GREATER_THAN_SIX_MONTHS",
  "EXPLORING",
]);

export const sourceEnum = z.enum([
  "Website",
  "Referral",
  "Walk_in", // match Prisma schema exactly
  "Call",
  "Other",
]);

export const statusEnum = z.enum([
  "New",
  "Qualified",
  "Contacted",
  "Visited",
  "Negotiation",
  "Converted",
  "Dropped",
]);

// --- Buyer Validator ---
export const buyerSchema = z
  .object({
    fullName: z.string().min(2).max(80),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().regex(/^\d{10,15}$/, "Phone must be 10–15 digits"),
    city: cityEnum,
    propertyType: propertyTypeEnum,
    bhk: bhkEnum.optional(),
    purpose: purposeEnum,
    budgetMin: z.number().int().nonnegative().optional(),
    budgetMax: z.number().int().nonnegative().optional(),
    timeline: timelineEnum,
    source: sourceEnum,
    status: statusEnum.default("New"),
    notes: z.string().max(1000).optional(),
    tags: z.array(z.string()).optional(),
    attachmentUrl: z.string().url().optional(),
    updatedAt: z.string().optional(), // for optimistic concurrency
  })
  .refine(
    (data) => {
      if (data.budgetMin != null && data.budgetMax != null) {
        return data.budgetMax >= data.budgetMin;
      }
      return true;
    },
    { message: "budgetMax must be ≥ budgetMin", path: ["budgetMax"] }
  )
  .refine(
    (data) => {
      if (["Apartment", "Villa"].includes(data.propertyType)) {
        return !!data.bhk;
      }
      return true;
    },
    { message: "BHK is required for Apartment/Villa", path: ["bhk"] }
  );

// Infer type
export type BuyerInput = z.infer<typeof buyerSchema>;
export type BuyerInputRaw = z.input<typeof buyerSchema>;
export type BuyerOutput = z.output<typeof buyerSchema>;
