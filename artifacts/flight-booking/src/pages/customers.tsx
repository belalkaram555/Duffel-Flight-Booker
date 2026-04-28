import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Users, Plus, Search, ChevronRight, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { formatShortDate } from "@/lib/formatters";
import { CustomerForm, EMPTY_CUSTOMER_FORM } from "@/components/customer-form";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  interested: "bg-yellow-100 text-yellow-800",
  follow_up: "bg-purple-100 text-purple-800",
  booked: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  lost: "bg-gray-100 text-gray-600",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  interested: "Interested",
  follow_up: "Follow-up",
  booked: "Booked",
  cancelled: "Cancelled",
  lost: "Lost",
};

const CUSTOMER_STATUSES = ["new", "interested", "follow_up", "booked", "cancelled", "lost"];
const CUSTOMER_SOURCES = ["facebook", "whatsapp", "walk_in", "referral", "other"];
const SOURCE_LABELS: Record<string, string> = {
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  walk_in: "Walk-in",
  referral: "Referral",
  other: "Other",
};

interface Customer {
  id: number;
  fullName: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  nationality: string | null;
  passportNumber: string | null;
  nationalId: string | null;
  address: string | null;
  source: string | null;
  status: string;
  assignedEmployeeId: number | null;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
}


async function fetchCustomers(search: string, status: string): Promise<{ customers: Customer[] }> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status && status !== "all") params.set("status", status);
  const url = `${BASE}/api/customers${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch customers");
  return res.json();
}

async function createCustomer(data: Record<string, unknown>): Promise<{ customer: Customer }> {
  const res = await fetch(`${BASE}/api/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create customer");
  return json;
}

export function CustomerFormSheet({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: (data) => {
      toast({ title: "Customer added", description: `${data.customer.fullName} has been added.` });
      qc.invalidateQueries({ queryKey: ["customers"] });
      onSuccess();
      onClose();
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add New Customer</SheetTitle>
        </SheetHeader>
        <CustomerForm
          initialValues={EMPTY_CUSTOMER_FORM}
          submitLabel="Add Customer"
          isPending={mutation.isPending}
          onSubmit={(data) => mutation.mutate(data)}
          onCancel={onClose}
        />
      </SheetContent>
    </Sheet>
  );
}

export { STATUS_COLORS, STATUS_LABELS, SOURCE_LABELS, CUSTOMER_STATUSES, CUSTOMER_SOURCES };

export default function Customers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["customers", search, statusFilter],
    queryFn: () => fetchCustomers(search, statusFilter),
    staleTime: 30_000,
  });

  const customers = data?.customers ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage all your customer relationships and interactions.</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Customer
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by name, phone, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {CUSTOMER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading && (
            <div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3 border-b last:border-0">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16 rounded-full ml-auto" />
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="text-center py-12 text-destructive">Failed to load customers.</div>
          )}

          {!isLoading && !isError && customers.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">No customers found</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {search || statusFilter !== "all" ? "Try adjusting your search or filters." : "Add your first customer to get started."}
              </p>
            </div>
          )}

          {!isLoading && customers.length > 0 && (
            <>
              {/* Table header */}
              <div className="hidden md:grid grid-cols-[2fr_1.5fr_0.8fr_0.8fr_0.8fr_0.8fr_auto] gap-3 px-6 py-2 border-b bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <span>Name</span>
                <span>Phone / Email</span>
                <span>Status</span>
                <span>Source</span>
                <span>Assigned Emp.</span>
                <span>Last Contacted</span>
                <span className="w-4" />
              </div>

              <div className="divide-y">
                {customers.map((c) => (
                  <Link key={c.id} href={`/customers/${c.id}`}>
                    <div className="grid md:grid-cols-[2fr_1.5fr_0.8fr_0.8fr_0.8fr_0.8fr_auto] grid-cols-1 gap-2 md:gap-3 px-6 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer group items-center">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                          style={{ background: "linear-gradient(135deg, #d4af37 0%, #f5d76e 50%, #d4af37 100%)", color: "#022c22" }}>
                          {c.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold truncate group-hover:text-primary transition-colors text-sm">{c.fullName}</div>
                        </div>
                      </div>

                      <div className="min-w-0 hidden md:block">
                        {c.phone && (
                          <div className="flex items-center gap-1 text-sm truncate">
                            <Phone className="h-3 w-3 flex-shrink-0 text-muted-foreground" /> {c.phone}
                          </div>
                        )}
                        {c.email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                            <Mail className="h-3 w-3 flex-shrink-0" /> {c.email}
                          </div>
                        )}
                      </div>

                      <div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {STATUS_LABELS[c.status] ?? c.status}
                        </span>
                      </div>

                      <div className="hidden md:block text-sm text-muted-foreground">
                        {c.source ? (SOURCE_LABELS[c.source] ?? c.source) : "—"}
                      </div>

                      <div className="hidden md:block text-sm text-muted-foreground">
                        {c.assignedEmployeeId ? `Emp #${c.assignedEmployeeId}` : "—"}
                      </div>

                      <div className="hidden md:block text-sm text-muted-foreground">
                        {c.lastContactedAt ? formatShortDate(c.lastContactedAt) : "—"}
                      </div>

                      <div className="hidden md:flex justify-end">
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="px-6 py-3 border-t text-xs text-muted-foreground">
                {customers.length} customer{customers.length !== 1 ? "s" : ""}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <CustomerFormSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}
