// components/buyers/BuyerForm.tsx
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Save, AlertCircle } from "lucide-react";
import {
  createBuyerSchema,
  updateBuyerSchema,
  CreateBuyerFormData,
  UpdateBuyerFormData,
} from "@/utils/validation";
import { Buyer } from "@/types/buyer";
import { Button } from "../ui/shadcn/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Select } from "../ui/select";

interface BuyerFormProps {
  mode: "create" | "edit";
  initialData?: Buyer;
  onSubmit: (data: CreateBuyerFormData | UpdateBuyerFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const BuyerForm: React.FC<BuyerFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [tagInput, setTagInput] = useState("");

  const schema = mode === "create" ? createBuyerSchema : updateBuyerSchema;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CreateBuyerFormData | UpdateBuyerFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          fullName: initialData.fullName,
          email: initialData.email || "",
          phone: initialData.phone,
          city: initialData.city,
          propertyType: initialData.propertyType,
          bhk: initialData.bhk,
          purpose: initialData.purpose,
          budgetMin: initialData.budgetMin,
          budgetMax: initialData.budgetMax,
          timeline: initialData.timeline,
          source: initialData.source,
          notes: initialData.notes || "",
          tags: initialData.tags || [],
          ...(mode === "edit" && {
            status: initialData.status,
            updatedAt: initialData.updatedAt,
          }),
        }
      : {
          tags: [],
        },
  });

  const watchedPropertyType = watch("propertyType");
  const watchedTags = watch("tags") || [];

  const addTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      setValue("tags", [...watchedTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue(
      "tags",
      watchedTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleFormSubmit = async (
    data: CreateBuyerFormData | UpdateBuyerFormData
  ) => {
    try {
      const cleanData = {
        ...data,
        email: data.email || undefined,
        budgetMin: data.budgetMin || undefined,
        budgetMax: data.budgetMax || undefined,
        notes: data.notes || undefined,
        bhk:
          watchedPropertyType === "Apartment" || watchedPropertyType === "Villa"
            ? data.bhk
            : undefined,
      };

      await onSubmit(cleanData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const cityOptions = [
    { value: "Chandigarh", label: "Chandigarh" },
    { value: "Mohali", label: "Mohali" },
    { value: "Zirakpur", label: "Zirakpur" },
    { value: "Panchkula", label: "Panchkula" },
    { value: "Other", label: "Other" },
  ];

  const propertyTypeOptions = [
    { value: "Apartment", label: "Apartment" },
    { value: "Villa", label: "Villa" },
    { value: "Plot", label: "Plot" },
    { value: "Office", label: "Office" },
    { value: "Retail", label: "Retail" },
  ];

  const bhkOptions = [
    { value: "Studio", label: "Studio" },
    { value: "1", label: "1 BHK" },
    { value: "2", label: "2 BHK" },
    { value: "3", label: "3 BHK" },
    { value: "4", label: "4 BHK" },
  ];

  const purposeOptions = [
    { value: "Buy", label: "Buy" },
    { value: "Rent", label: "Rent" },
  ];

  const timelineOptions = [
    { value: "0-3m", label: "0-3 months" },
    { value: "3-6m", label: "3-6 months" },
    { value: ">6m", label: "More than 6 months" },
    { value: "Exploring", label: "Just exploring" },
  ];

  const sourceOptions = [
    { value: "Website", label: "Website" },
    { value: "Referral", label: "Referral" },
    { value: "Walk-in", label: "Walk-in" },
    { value: "Call", label: "Call" },
    { value: "Other", label: "Other" },
  ];

  const statusOptions = [
    { value: "New", label: "New" },
    { value: "Qualified", label: "Qualified" },
    { value: "Contacted", label: "Contacted" },
    { value: "Visited", label: "Visited" },
    { value: "Negotiation", label: "Negotiation" },
    { value: "Converted", label: "Converted" },
    { value: "Dropped", label: "Dropped" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <Card
        title={mode === "create" ? "Create New Lead" : "Edit Lead"}
        subtitle={
          mode === "create"
            ? "Capture buyer information and preferences"
            : "Update buyer information"
        }
      >
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                {...register("fullName")}
                error={errors.fullName?.message}
                placeholder="Enter full name"
                required
              />

              <Input
                label="Phone Number"
                {...register("phone")}
                error={errors.phone?.message}
                placeholder="10-15 digits only"
                required
              />

              <Input
                label="Email"
                type="email"
                {...register("email")}
                error={errors.email?.message}
                placeholder="Optional email address"
              />

              <Select
                label="City"
                {...register("city")}
                options={cityOptions}
                placeholder="Select city"
                error={errors.city?.message}
                required
              />
            </div>
          </div>

          {/* Property Requirements */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Property Requirements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Property Type"
                {...register("propertyType")}
                options={propertyTypeOptions}
                placeholder="Select property type"
                error={errors.propertyType?.message}
                required
              />

              {(watchedPropertyType === "Apartment" ||
                watchedPropertyType === "Villa") && (
                <Select
                  label="BHK"
                  {...register("bhk")}
                  options={bhkOptions}
                  placeholder="Select BHK"
                  error={errors.bhk?.message}
                  required
                />
              )}

              <Select
                label="Purpose"
                {...register("purpose")}
                options={purposeOptions}
                placeholder="Select purpose"
                error={errors.purpose?.message}
                required
              />

              <Select
                label="Timeline"
                {...register("timeline")}
                options={timelineOptions}
                placeholder="Select timeline"
                error={errors.timeline?.message}
                required
              />
            </div>
          </div>

          {/* Budget & Source */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Budget & Source
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="budgetMin"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Minimum Budget (INR)"
                    type="number"
                    value={value || ""}
                    onChange={(e) =>
                      onChange(
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    error={errors.budgetMin?.message}
                    placeholder="e.g., 2500000"
                  />
                )}
              />

              <Controller
                name="budgetMax"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Maximum Budget (INR)"
                    type="number"
                    value={value || ""}
                    onChange={(e) =>
                      onChange(
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    error={errors.budgetMax?.message}
                    placeholder="e.g., 5000000"
                  />
                )}
              />

              <div className="md:col-span-2">
                <Select
                  label="Source"
                  {...register("source")}
                  options={sourceOptions}
                  placeholder="Select source"
                  error={errors.source?.message}
                  required
                />
              </div>
            </div>
          </div>

          {/* Status (only in edit mode) */}
          {mode === "edit" && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Lead Status"
                  {...register("status")}
                  options={statusOptions}
                  error={(errors as any).status?.message}
                  required
                />
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Additional Information
            </h3>

            {/* Tags */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add a tag"
                />
                <Button type="button" onClick={addTag} icon={Plus} size="sm">
                  Add
                </Button>
              </div>
              {watchedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {watchedTags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                {...register("notes")}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.notes ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Additional notes or comments..."
              />
              {errors.notes && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.notes.message}
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="button" variant="secondary" onClick={() => reset()}>
              Reset
            </Button>
            <Button
              type="button"
              onClick={handleSubmit(handleFormSubmit)}
              loading={isLoading}
              icon={Save}
            >
              {mode === "create" ? "Create Lead" : "Update Lead"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
