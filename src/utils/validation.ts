// utils/validation.ts
import * as z from "zod";

export const createBuyerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(80, "Full name must be at most 80 characters"),
    email: z
      .string()
      .email("Invalid email format")
      .optional()
      .or(z.literal("")),
    phone: z.string().regex(/^\d{10,15}$/, "Phone must be 10-15 digits"),
    city: z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]),
    propertyType: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]),
    bhk: z.enum(["1", "2", "3", "4", "Studio"]).optional(),
    purpose: z.enum(["Buy", "Rent"]),
    budgetMin: z.number().int().positive().optional(),
    budgetMax: z.number().int().positive().optional(),
    timeline: z.enum(["0-3m", "3-6m", ">6m", "Exploring"]),
    source: z.enum(["Website", "Referral", "Walk-in", "Call", "Other"]),
    notes: z
      .string()
      .max(1000, "Notes must be at most 1000 characters")
      .optional(),
    tags: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // BHK required for Apartment/Villa
      if (
        (data.propertyType === "Apartment" || data.propertyType === "Villa") &&
        !data.bhk
      ) {
        return false;
      }
      return true;
    },
    {
      message: "BHK is required for Apartment and Villa properties",
      path: ["bhk"],
    }
  )
  .refine(
    (data) => {
      // Budget validation
      if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
        return false;
      }
      return true;
    },
    {
      message: "Maximum budget must be greater than or equal to minimum budget",
      path: ["budgetMax"],
    }
  );

export const updateBuyerSchema = createBuyerSchema.safeExtend({
  status: z.enum([
    "New",
    "Qualified",
    "Contacted",
    "Visited",
    "Negotiation",
    "Converted",
    "Dropped",
  ]),
  updatedAt: z.string(),
});

export const csvRowSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().regex(/^\d{10,15}$/),
  city: z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]),
  propertyType: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]),
  bhk: z.enum(["1", "2", "3", "4", "Studio", ""]).optional(),
  purpose: z.enum(["Buy", "Rent"]),
  budgetMin: z.string().optional(),
  budgetMax: z.string().optional(),
  timeline: z.enum(["0-3m", "3-6m", ">6m", "Exploring"]),
  source: z.enum(["Website", "Referral", "Walk-in", "Call", "Other"]),
  notes: z.string().max(1000).optional(),
  tags: z.string().optional(),
  status: z
    .enum([
      "New",
      "Qualified",
      "Contacted",
      "Visited",
      "Negotiation",
      "Converted",
      "Dropped",
    ])
    .optional(),
});

export type CreateBuyerFormData = z.infer<typeof createBuyerSchema>;
export type UpdateBuyerFormData = z.infer<typeof updateBuyerSchema>;
export type CsvRowData = z.infer<typeof csvRowSchema>;
