export const TICKET_STATUS_COLORS: Record<string, string> = {
  quoted: "bg-gray-100 text-gray-700",
  reserved: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  paid: "bg-teal-100 text-teal-800",
  issued: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-orange-100 text-orange-800",
};

export const TICKET_STATUS_LABELS: Record<string, string> = {
  quoted: "Quoted",
  reserved: "Reserved",
  confirmed: "Confirmed",
  paid: "Paid",
  issued: "Issued",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  unpaid: "bg-red-100 text-red-800",
  partially_paid: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  refunded: "bg-gray-100 text-gray-600",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "Unpaid",
  partially_paid: "Partially Paid",
  paid: "Paid",
  refunded: "Refunded",
};

export const TICKET_STATUSES = ["quoted", "reserved", "confirmed", "paid", "issued", "cancelled", "refunded"];
export const PAYMENT_STATUSES = ["unpaid", "partially_paid", "paid", "refunded"];

export const CURRENCIES = ["USD", "EUR", "GBP", "EGP", "AED", "SAR", "QAR", "KWD", "BHD", "OMR", "JOD", "TRY", "CAD", "AUD"];

export const PAYMENT_METHODS = ["cash", "card", "bank_transfer", "online", "other"];
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  bank_transfer: "Bank Transfer",
  online: "Online",
  other: "Other",
};
