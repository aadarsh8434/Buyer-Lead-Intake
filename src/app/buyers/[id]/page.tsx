"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Buyer, BuyerHistory } from "@/types/buyer";
import { UpdateBuyerFormData } from "@/utils/validation";
import { BuyerDetail } from "@/components/buyers/Buyerdetail";

// Mock data
const mockBuyer: Buyer = {
  id: "1",
  fullName: "Rahul Sharma",
  email: "rahul.sharma@email.com",
  phone: "9876543210",
  city: "Chandigarh",
  propertyType: "Apartment",
  bhk: "3",
  purpose: "Buy",
  budgetMin: 5000000,
  budgetMax: 7000000,
  timeline: "0-3m",
  source: "Website",
  status: "New",
  notes:
    "Looking for a 3BHK apartment in Sector 43. Preference for ready-to-move properties.",
  tags: ["urgent", "pre-approved", "first-time-buyer"],
  ownerId: "user1",
  updatedAt: "2024-03-15T10:30:00Z",
  createdAt: "2024-03-15T08:00:00Z",
};

const mockHistory: BuyerHistory[] = [
  {
    id: "1",
    buyerId: "1",
    changedBy: "John Doe",
    changedAt: "2024-03-15T10:30:00Z",
    diff: {
      status: { old: "New", new: "Qualified" },
      budgetMax: { old: 6000000, new: 7000000 },
    },
  },
  {
    id: "2",
    buyerId: "1",
    changedBy: "Jane Smith",
    changedAt: "2024-03-14T15:45:00Z",
    diff: {
      notes: {
        old: "Basic inquiry",
        new: "Looking for a 3BHK apartment in Sector 43...",
      },
    },
  },
];

export default function BuyerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [history, setHistory] = useState<BuyerHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock current user
  const currentUser = { id: "user1", name: "John Doe" };

  useEffect(() => {
    // Mock API call - replace with actual implementation
    const fetchBuyer = async () => {
      try {
        setLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        setBuyer(mockBuyer);
        setHistory(mockHistory);
      } catch (error) {
        console.error("Failed to fetch buyer:", error);
        router.push("/buyers");
      } finally {
        setLoading(false);
      }
    };

    fetchBuyer();
  }, [params.id, router]);

  const handleUpdate = async (data: UpdateBuyerFormData) => {
    if (!buyer) return;

    try {
      // Check for concurrency conflicts
      if (data.updatedAt !== buyer.updatedAt) {
        throw new Error(
          "This record has been updated by someone else. Please refresh and try again."
        );
      }

      // Mock API call - replace with actual implementation
      const response = await fetch(`/api/buyers/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update buyer");
      }

      const updatedBuyer: Buyer = await response.json();
      setBuyer(updatedBuyer);
    } catch (error) {
      console.error("Update failed:", error);
      throw error;
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleBack = () => {
    router.push("/buyers");
  };

  const canEdit =
    buyer && (currentUser.id === buyer.ownerId || currentUser.id === "admin");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!buyer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Buyer not found</h1>
          <button
            onClick={handleBack}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Buyers List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="px-4 sm:px-6 lg:px-8">
        <BuyerDetail
          buyer={buyer}
          history={history}
          loading={loading}
          onBack={handleBack}
          onUpdate={handleUpdate}
          onRefresh={handleRefresh}
          canEdit={canEdit as boolean}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}
