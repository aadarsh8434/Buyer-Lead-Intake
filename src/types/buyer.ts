// types/buyer.ts
export interface Buyer {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  city: "Chandigarh" | "Mohali" | "Zirakpur" | "Panchkula" | "Other";
  propertyType: "Apartment" | "Villa" | "Plot" | "Office" | "Retail";
  bhk?: "1" | "2" | "3" | "4" | "Studio";
  purpose: "Buy" | "Rent";
  budgetMin?: number;
  budgetMax?: number;
  timeline: "0-3m" | "3-6m" | ">6m" | "Exploring";
  source: "Website" | "Referral" | "Walk-in" | "Call" | "Other";
  status:
    | "New"
    | "Qualified"
    | "Contacted"
    | "Visited"
    | "Negotiation"
    | "Converted"
    | "Dropped";
  notes?: string;
  tags?: string[];
  ownerId: string;
  updatedAt: string;
  createdAt: string;
}

export interface BuyerHistory {
  id: string;
  buyerId: string;
  changedBy: string;
  changedAt: string;
  diff: Record<string, { old: any; new: any }>;
}

export interface BuyerFilters {
  city: string;
  propertyType: string;
  status: string;
  timeline: string;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export type SortField = keyof Buyer;
export type SortDirection = "asc" | "desc";

export interface CreateBuyerRequest {
  fullName: string;
  email?: string;
  phone: string;
  city: Buyer["city"];
  propertyType: Buyer["propertyType"];
  bhk?: Buyer["bhk"];
  purpose: Buyer["purpose"];
  budgetMin?: number;
  budgetMax?: number;
  timeline: Buyer["timeline"];
  source: Buyer["source"];
  notes?: string;
  tags?: string[];
}

export interface UpdateBuyerRequest extends CreateBuyerRequest {
  status: Buyer["status"];
  updatedAt: string; // For concurrency check
}
