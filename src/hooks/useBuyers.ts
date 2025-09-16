import { useState, useEffect } from "react";
import { Buyer, BuyerFilters, SortField, SortDirection } from "@/types/buyer";

export const useBuyers = () => {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBuyers = async (
    filters?: BuyerFilters,
    sort?: { field: SortField; direction: SortDirection },
    page?: number,
    search?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.city) params.append("city", filters.city);
      if (filters?.propertyType)
        params.append("propertyType", filters.propertyType);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.timeline) params.append("timeline", filters.timeline);
      if (sort) {
        params.append("sortField", sort.field);
        params.append("sortDirection", sort.direction);
      }
      if (page) params.append("page", page.toString());
      if (search) params.append("search", search);

      const response = await fetch(`/api/buyers?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch buyers");
      }

      const data = await response.json();
      setBuyers(data.buyers);

      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createBuyer = async (buyerData: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/buyers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buyerData),
      });

      if (!response.ok) {
        throw new Error("Failed to create buyer");
      }

      const newBuyer = await response.json();
      setBuyers((prev) => [newBuyer, ...prev]);

      return newBuyer;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBuyer = async (id: string, buyerData: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/buyers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buyerData),
      });

      if (!response.ok) {
        throw new Error("Failed to update buyer");
      }

      const updatedBuyer = await response.json();
      setBuyers((prev) => prev.map((b) => (b.id === id ? updatedBuyer : b)));

      return updatedBuyer;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    buyers,
    loading,
    error,
    fetchBuyers,
    createBuyer,
    updateBuyer,
  };
};
