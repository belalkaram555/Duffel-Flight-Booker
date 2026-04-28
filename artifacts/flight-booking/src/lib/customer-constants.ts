export const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  interested: "bg-yellow-100 text-yellow-800",
  follow_up: "bg-purple-100 text-purple-800",
  booked: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  lost: "bg-gray-100 text-gray-600",
};

export const STATUS_LABELS: Record<string, string> = {
  new: "New",
  interested: "Interested",
  follow_up: "Follow-up",
  booked: "Booked",
  cancelled: "Cancelled",
  lost: "Lost",
};

export const SOURCE_LABELS: Record<string, string> = {
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  walk_in: "Walk-in",
  referral: "Referral",
  other: "Other",
};

export const CUSTOMER_STATUSES = ["new", "interested", "follow_up", "booked", "cancelled", "lost"];
export const CUSTOMER_SOURCES = ["facebook", "whatsapp", "walk_in", "referral", "other"];
