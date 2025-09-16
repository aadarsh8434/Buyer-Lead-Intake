"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BuyerForm } from "@/components/buyers/BuyerForm";
import { CreateBuyerFormData } from "@/utils/validation";
import { Buyer } from "@/types/buyer";

export default function NewBuyerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateBuyerFormData) => {
    try {
      setIsSubmitting(true);

      // Mock API call - replace with actual implementation
      const response = await fetch("/api/buyers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create buyer");
      }

      const buyer: Buyer = await response.json();

      // Redirect to the buyer detail page
      router.push(`/buyers/${buyer.id}`);
    } catch (error) {
      console.error("Create buyer failed:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/buyers");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <BuyerForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
