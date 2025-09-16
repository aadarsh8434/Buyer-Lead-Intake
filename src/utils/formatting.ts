// utils/formatting.ts

export const formatCurrency = (value?: number): string => {
  if (!value) return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatBudget = (min?: number, max?: number): string => {
  if (!min && !max) return "-";
  if (min && max) return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  if (min) return `${formatCurrency(min)}+`;
  return `Up to ${formatCurrency(max)}`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatPhoneNumber = (phone: string): string => {
  // Format: +91 98765 43210
  if (phone.length === 10) {
    return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
  }
  return phone;
};

export const getStatusColor = (status: string): string => {
  const colors = {
    New: "bg-blue-100 text-blue-800",
    Qualified: "bg-green-100 text-green-800",
    Contacted: "bg-yellow-100 text-yellow-800",
    Visited: "bg-purple-100 text-purple-800",
    Negotiation: "bg-orange-100 text-orange-800",
    Converted: "bg-emerald-100 text-emerald-800",
    Dropped: "bg-red-100 text-red-800",
  };
  return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
};

export const formatTimelineLabel = (timeline: string): string => {
  const labels = {
    "0-3m": "0-3 months",
    "3-6m": "3-6 months",
    ">6m": "More than 6 months",
    Exploring: "Just exploring",
  };
  return labels[timeline as keyof typeof labels] || timeline;
};

export const formatPropertyType = (
  propertyType: string,
  bhk?: string
): string => {
  if (bhk && (propertyType === "Apartment" || propertyType === "Villa")) {
    return `${bhk} BHK ${propertyType}`;
  }
  return propertyType;
};
