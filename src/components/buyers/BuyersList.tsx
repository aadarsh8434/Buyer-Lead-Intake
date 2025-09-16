// components/buyers/BuyersList.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Download,
  Upload,
  Eye,
  Edit,
  SortAsc,
  SortDesc,
} from "lucide-react";
import {
  Buyer,
  BuyerFilters as FilterType,
  SortField,
  SortDirection,
} from "@/types/buyer";
import {
  formatBudget,
  formatDate,
  formatPropertyType,
} from "@/utils/formatting";
import { exportBuyersToCSV } from "@/utils/csv";
import { Button } from "../ui/shadcn/button";
import { Card } from "../ui/shadcn/card";
import { BuyerFilters } from "./BuyerFilters";
import { StatusBadge } from "../ui/StatusBadge";
import { Pagination } from "../common/pagination";

interface BuyersListProps {
  buyers: Buyer[];
  loading?: boolean;
  onViewBuyer: (id: string) => void;
  onEditBuyer: (id: string) => void;
  onImportCSV: (file: File) => void;
  currentUser?: { id: string; role?: string };
}

export const BuyersList: React.FC<BuyersListProps> = ({
  buyers,
  loading = false,
  onViewBuyer,
  onEditBuyer,
  onImportCSV,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterType>({
    city: "",
    propertyType: "",
    status: "",
    timeline: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [showFilters, setShowFilters] = useState(false);

  const pageSize = 10;

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filtered and sorted data
  const filteredAndSortedBuyers = useMemo(() => {
    let filtered = buyers.filter((buyer) => {
      // Search filter
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        const matchesSearch =
          buyer.fullName.toLowerCase().includes(searchLower) ||
          buyer.phone.includes(searchLower) ||
          (buyer.email && buyer.email.toLowerCase().includes(searchLower));

        if (!matchesSearch) return false;
      }

      // Other filters
      if (filters.city && buyer.city !== filters.city) return false;
      if (filters.propertyType && buyer.propertyType !== filters.propertyType)
        return false;
      if (filters.status && buyer.status !== filters.status) return false;
      if (filters.timeline && buyer.timeline !== filters.timeline) return false;

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (aValue === undefined) aValue = "";
      if (bValue === undefined) bValue = "";

      const aStr = String(aValue);
      const bStr = String(bValue);

      const comparison = aStr.localeCompare(bStr);
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [buyers, debouncedSearchTerm, filters, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedBuyers.length / pageSize);
  const paginatedBuyers = filteredAndSortedBuyers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleFilterChange = (newFilters: FilterType) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ city: "", propertyType: "", status: "", timeline: "" });
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleExport = () => {
    exportBuyersToCSV(filteredAndSortedBuyers);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportCSV(file);
      event.target.value = ""; // Reset input
    }
  };

  const canEdit = (buyer: Buyer) => {
    return currentUser?.role === "admin" || buyer.ownerId === currentUser?.id;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buyer Leads</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your buyer leads
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" icon={Download} onClick={handleExport}>
            Export CSV
          </Button>

          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
            />
            <Button variant="primary" icon={Upload} role="span">
              Import CSV
            </Button>
          </label>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <BuyerFilters
            filters={filters}
            onFiltersChange={handleFilterChange}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onClearFilters={clearFilters}
          />
        </div>
      </Card>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {paginatedBuyers.length} of {filteredAndSortedBuyers.length}{" "}
        leads
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <SortableHeader
                  field="fullName"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                >
                  Name
                </SortableHeader>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Phone
                </th>
                <SortableHeader
                  field="city"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                >
                  City
                </SortableHeader>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Property
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Budget
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Timeline
                </th>
                <SortableHeader
                  field="status"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                >
                  Status
                </SortableHeader>
                <SortableHeader
                  field="updatedAt"
                  currentField={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                >
                  Updated
                </SortableHeader>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedBuyers.length > 0 ? (
                paginatedBuyers.map((buyer) => (
                  <tr key={buyer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {buyer.fullName}
                        </div>
                        {buyer.email && (
                          <div className="text-sm text-gray-500">
                            {buyer.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {buyer.phone}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {buyer.city}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div>
                        {formatPropertyType(buyer.propertyType, buyer.bhk)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {buyer.purpose}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatBudget(buyer.budgetMin, buyer.budgetMax)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {buyer.timeline}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={buyer.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(buyer.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onViewBuyer(buyer.id)}
                          className="p-1 text-gray-600 hover:text-blue-600 focus:ring-2 focus:ring-blue-500 rounded"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canEdit(buyer) && (
                          <button
                            onClick={() => onEditBuyer(buyer.id)}
                            className="p-1 text-gray-600 hover:text-green-600 focus:ring-2 focus:ring-green-500 rounded"
                            title="Edit buyer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No buyers found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t px-4 py-3">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

// Helper component for sortable headers
interface SortableHeaderProps {
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
  field,
  currentField,
  direction,
  onSort,
  children,
}) => (
  <th
    className="px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
    onClick={() => onSort(field)}
  >
    <div className="flex items-center gap-1">
      {children}
      {currentField === field &&
        (direction === "asc" ? (
          <SortAsc className="w-4 h-4" />
        ) : (
          <SortDesc className="w-4 h-4" />
        ))}
    </div>
  </th>
);
