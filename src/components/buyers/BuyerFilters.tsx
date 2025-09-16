// components/buyers/BuyerFilters.tsx
import React from "react";
import { Filter, X } from "lucide-react";
import { BuyerFilters as FilterType } from "@/types/buyer";
import { Button } from "../ui/shadcn/button";
import { Select } from "../ui/select";

interface BuyerFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onClearFilters: () => void;
}

export const BuyerFilters: React.FC<BuyerFiltersProps> = ({
  filters,
  onFiltersChange,
  showFilters,
  onToggleFilters,
  onClearFilters,
}) => {
  const handleFilterChange = (key: keyof FilterType, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  const cityOptions = [
    { value: "", label: "All Cities" },
    { value: "Chandigarh", label: "Chandigarh" },
    { value: "Mohali", label: "Mohali" },
    { value: "Zirakpur", label: "Zirakpur" },
    { value: "Panchkula", label: "Panchkula" },
    { value: "Other", label: "Other" },
  ];

  const propertyTypeOptions = [
    { value: "", label: "All Property Types" },
    { value: "Apartment", label: "Apartment" },
    { value: "Villa", label: "Villa" },
    { value: "Plot", label: "Plot" },
    { value: "Office", label: "Office" },
    { value: "Retail", label: "Retail" },
  ];

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "New", label: "New" },
    { value: "Qualified", label: "Qualified" },
    { value: "Contacted", label: "Contacted" },
    { value: "Visited", label: "Visited" },
    { value: "Negotiation", label: "Negotiation" },
    { value: "Converted", label: "Converted" },
    { value: "Dropped", label: "Dropped" },
  ];

  const timelineOptions = [
    { value: "", label: "All Timelines" },
    { value: "0-3m", label: "0-3 months" },
    { value: "3-6m", label: "3-6 months" },
    { value: ">6m", label: "More than 6 months" },
    { value: "Exploring", label: "Just exploring" },
  ];

  return (
    <div className="space-y-4">
      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          icon={Filter}
          onClick={onToggleFilters}
          className={hasActiveFilters ? "text-blue-600" : ""}
        >
          Filters{" "}
          {hasActiveFilters &&
            `(${Object.values(filters).filter((v) => v).length})`}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} icon={X}>
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <Select
            options={cityOptions}
            value={filters.city}
            onChange={(e) => handleFilterChange("city", e.target.value)}
          />

          <Select
            options={propertyTypeOptions}
            value={filters.propertyType}
            onChange={(e) => handleFilterChange("propertyType", e.target.value)}
          />

          <Select
            options={statusOptions}
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          />

          <Select
            options={timelineOptions}
            value={filters.timeline}
            onChange={(e) => handleFilterChange("timeline", e.target.value)}
          />
        </div>
      )}
    </div>
  );
};
