import React, { useState } from "react";
import {
  ArrowLeft,
  Edit,
  RefreshCw,
  Clock,
  User,
  AlertCircle,
} from "lucide-react";
import { BuyerForm } from "./BuyerForm";
import { Buyer, BuyerHistory } from "@/types/buyer";
import {
  formatBudget,
  formatDate,
  formatPhoneNumber,
  formatTimelineLabel,
  formatPropertyType,
} from "@/utils/formatting";
import { UpdateBuyerFormData } from "@/utils/validation";
import { Button } from "../ui/shadcn/button";
import { Card } from "../ui/shadcn/card";
import { StatusBadge } from "../ui/StatusBadge";

interface BuyerDetailProps {
  buyer: Buyer;
  history?: BuyerHistory[];
  loading?: boolean;
  onBack: () => void;
  onUpdate: (data: UpdateBuyerFormData) => Promise<void>;
  onRefresh: () => void;
  canEdit?: boolean;
  currentUser?: { id: string; name: string };
}

export const BuyerDetail: React.FC<BuyerDetailProps> = ({
  buyer,
  history = [],
  loading = false,
  onBack,
  onUpdate,
  onRefresh,
  canEdit = false,
  currentUser,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const handleUpdate = async (data: UpdateBuyerFormData) => {
    try {
      setIsUpdating(true);
      setUpdateError(null);
      await onUpdate(data);
      setIsEditing(false);
    } catch (error: any) {
      if (
        error.message?.includes("stale") ||
        error.message?.includes("concurrency")
      ) {
        setUpdateError(
          "This record has been updated by someone else. Please refresh and try again."
        );
      } else {
        setUpdateError(error.message || "Failed to update buyer");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefresh = () => {
    onRefresh();
    setUpdateError(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <BuyerForm
        mode="edit"
        initialData={buyer}
        onSubmit={(data) => handleUpdate(data as UpdateBuyerFormData)}
        onCancel={() => {
          setIsEditing(false);
          setUpdateError(null);
        }}
        isLoading={isUpdating}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" icon={ArrowLeft} onClick={onBack}>
            Back to List
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {buyer.fullName}
            </h1>
            <p className="text-gray-600">Lead Details</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" icon={RefreshCw} onClick={handleRefresh}>
            Refresh
          </Button>
          {canEdit && (
            <Button icon={Edit} onClick={() => setIsEditing(true)}>
              Edit Lead
            </Button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {updateError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800">{updateError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card title="Contact Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Full Name
                </label>
                <p className="text-gray-900 font-medium">{buyer.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Phone
                </label>
                <p className="text-gray-900">
                  {formatPhoneNumber(buyer.phone)}
                </p>
              </div>
              {buyer.email && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-gray-900">{buyer.email}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">
                  City
                </label>
                <p className="text-gray-900">{buyer.city}</p>
              </div>
            </div>
          </Card>

          {/* Property Requirements */}
          <Card title="Property Requirements">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Property Type
                </label>
                <p className="text-gray-900">
                  {formatPropertyType(buyer.propertyType, buyer.bhk)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Purpose
                </label>
                <p className="text-gray-900">{buyer.purpose}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Budget
                </label>
                <p className="text-gray-900">
                  {formatBudget(buyer.budgetMin, buyer.budgetMax)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Timeline
                </label>
                <p className="text-gray-900">
                  {formatTimelineLabel(buyer.timeline)}
                </p>
              </div>
            </div>
          </Card>

          {/* Additional Information */}
          <Card title="Additional Information">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Source
                </label>
                <p className="text-gray-900">{buyer.source}</p>
              </div>

              {buyer.tags && buyer.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {buyer.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {buyer.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Notes
                  </label>
                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                    {buyer.notes}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Dates */}
          <Card title="Status & Timeline">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Current Status
                </label>
                <div className="mt-1">
                  <StatusBadge status={buyer.status} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Created
                </label>
                <p className="text-gray-900 text-sm">
                  {formatDate(buyer.createdAt)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Last Updated
                </label>
                <p className="text-gray-900 text-sm">
                  {formatDate(buyer.updatedAt)}
                </p>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          {history.length > 0 && (
            <Card title="Recent Activity">
              <div className="space-y-3">
                {history.slice(0, 5).map((entry) => (
                  <div
                    key={entry.id}
                    className="border-l-2 border-blue-200 pl-3 pb-3"
                  >
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-3 h-3" />
                      {formatDate(entry.changedAt)}
                    </div>
                    <div className="mt-1 space-y-1">
                      {Object.entries(entry.diff).map(([field, change]) => (
                        <div key={field} className="text-sm">
                          <span className="font-medium text-gray-700 capitalize">
                            {field.replace(/([A-Z])/g, " $1").toLowerCase()}:
                          </span>
                          <br />
                          <span className="text-red-600 line-through">
                            {String(change.old)}
                          </span>
                          {" → "}
                          <span className="text-green-600">
                            {String(change.new)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Changed by {entry.changedBy}
                    </div>
                  </div>
                ))}

                {history.length > 5 && (
                  <div className="text-center">
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      View all {history.length} changes
                    </button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Quick Stats */}
          <Card title="Quick Stats">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Owner</span>
                <span className="text-sm font-medium">
                  {buyer.ownerId === currentUser?.id ? "You" : "Other User"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Days Active</span>
                <span className="text-sm font-medium">
                  {Math.ceil(
                    (new Date().getTime() -
                      new Date(buyer.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Updates</span>
                <span className="text-sm font-medium">{history.length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
