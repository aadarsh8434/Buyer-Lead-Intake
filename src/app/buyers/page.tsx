"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BuyersList } from "@/components/buyers/BuyersList";
import { CSVImport } from "@/components/buyers/CSVImport";
import { Buyer } from "@/types/buyer";

// Mock data - replace with actual API calls
const mockBuyers: Buyer[] = [
  {
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
    tags: ["urgent", "pre-approved"],
    ownerId: "user1",
    updatedAt: "2024-03-15T10:30:00Z",
    createdAt: "2024-03-15T08:00:00Z",
  },
  // Add more mock data as needed...
];

function BuyersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [buyers, setBuyers] = useState<Buyer[]>(mockBuyers);
  const [loading, setLoading] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Mock current user - replace with actual auth context
  const currentUser = { id: "user1", role: "admin" };

  const handleViewBuyer = (id: string) => {
    router.push(`/buyers/${id}`);
  };

  const handleEditBuyer = (id: string) => {
    router.push(`/buyers/${id}/edit`);
  };

  const handleImportCSV = async (file: File) => {
    setShowImport(true);
  };

  const handleImportBuyers = async (newBuyers: Buyer[]) => {
    // Mock API call - replace with actual implementation
    try {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Add imported buyers to the list
      const buyersWithIds = newBuyers.map((buyer) => ({
        ...buyer,
        id: Math.random().toString(36).substr(2, 9),
        ownerId: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      setBuyers((prev) => [...buyersWithIds, ...prev]);
      setShowImport(false);
    } catch (error) {
      console.error("Import failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BuyersList
          buyers={buyers}
          loading={loading}
          onViewBuyer={handleViewBuyer}
          onEditBuyer={handleEditBuyer}
          onImportCSV={handleImportCSV}
          currentUser={currentUser}
        />
      </div>

      {showImport && (
        <CSVImport
          onImport={handleImportBuyers}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-6 w-64"></div>
          <div className="space-y-4">
            <div className="h-16 bg-gray-300 rounded"></div>
            <div className="h-16 bg-gray-300 rounded"></div>
            <div className="h-16 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BuyersPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BuyersContent />
    </Suspense>
  );
}
