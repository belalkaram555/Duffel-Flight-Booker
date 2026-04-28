import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCircle2, Clock, AlertCircle, Calendar, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatShortDate, formatDateTime } from "@/lib/formatters";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface FollowUpNote {
  id: number;
  customerId: number | null;
  note: string;
  followUpDate: string | null;
  followUpStatus: string | null;
  employeeId: number | null;
  ticketId: number | null;
  createdAt: string;
  customerName: string | null;
  customerPhone: string | null;
}

interface FollowUpsResponse {
  today: FollowUpNote[];
  upcoming: FollowUpNote[];
  missed: FollowUpNote[];
  done: FollowUpNote[];
  all: FollowUpNote[];
  pending: FollowUpNote[];
}

async function fetchFollowUps(): Promise<FollowUpsResponse> {
  const res = await fetch(`${BASE}/api/followups`);
  if (!res.ok) throw new Error("Failed to fetch follow-ups");
  return res.json();
}

async function markNoteDone(id: number): Promise<void> {
  const res = await fetch(`${BASE}/api/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ followUpStatus: "done" }),
  });
  if (!res.ok) throw new Error("Failed to mark as done");
}

function NoteCard({ note, showMarkDone }: { note: FollowUpNote; showMarkDone?: boolean }) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const markDone = useMutation({
    mutationFn: () => markNoteDone(note.id),
    onSuccess: () => {
      toast({ title: "Marked as done" });
      qc.invalidateQueries({ queryKey: ["followups"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {note.customerName && note.customerId ? (
                <Link href={`/customers/${note.customerId}`}>
                  <span className="font-semibold text-sm hover:underline text-primary cursor-pointer">
                    {note.customerName}
                  </span>
                </Link>
              ) : (
                <span className="font-semibold text-sm text-muted-foreground">Unknown customer</span>
              )}
              {note.ticketId && (
                <Link href={`/tickets/${note.ticketId}`}>
                  <span className="text-xs text-muted-foreground hover:underline cursor-pointer">Ticket #{note.ticketId}</span>
                </Link>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{note.note}</p>
            {note.followUpDate && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span>{formatDateTime(note.followUpDate)}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {showMarkDone && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs px-2"
                disabled={markDone.isPending}
                onClick={() => markDone.mutate()}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" /> Mark Done
              </Button>
            )}
            {note.customerId && (
              <Link href={`/customers/${note.customerId}`}>
                <Button size="sm" variant="ghost" className="h-7 text-xs px-2">
                  View <ChevronRight className="h-3 w-3 ml-0.5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyTab({ label }: { label: string }) {
  return (
    <div className="text-center py-16 text-muted-foreground">
      <Bell className="h-10 w-10 mx-auto mb-3 opacity-20" />
      <p className="font-medium">No {label} follow-ups</p>
    </div>
  );
}

function TabList({ notes, showMarkDone }: { notes: FollowUpNote[]; showMarkDone?: boolean }) {
  if (notes.length === 0) return null;
  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} showMarkDone={showMarkDone} />
      ))}
    </div>
  );
}

export default function Reminders() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["followups"],
    queryFn: fetchFollowUps,
    staleTime: 30_000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Reminders & Follow-ups</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Track and action all customer follow-up notes.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      )}

      {isError && <div className="text-destructive">Failed to load follow-ups.</div>}

      {data && (
        <Tabs defaultValue="today">
          <TabsList className="mb-4">
            <TabsTrigger value="today" className="gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Today
              {data.today.length > 0 && (
                <span className="ml-1 rounded-full bg-primary text-primary-foreground text-xs px-1.5 py-0.5 font-medium">
                  {data.today.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Upcoming
              {data.upcoming.length > 0 && (
                <span className="ml-1 rounded-full bg-blue-500 text-white text-xs px-1.5 py-0.5 font-medium">
                  {data.upcoming.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="missed" className="gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              Missed
              {data.missed.length > 0 && (
                <span className="ml-1 rounded-full bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 font-medium">
                  {data.missed.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="done" className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Done
              {data.done.length > 0 && (
                <span className="ml-1 rounded-full bg-green-500 text-white text-xs px-1.5 py-0.5 font-medium">
                  {data.done.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today">
            {data.today.length === 0 ? (
              <EmptyTab label="today's" />
            ) : (
              <TabList notes={data.today} showMarkDone />
            )}
          </TabsContent>

          <TabsContent value="upcoming">
            {data.upcoming.length === 0 ? (
              <EmptyTab label="upcoming" />
            ) : (
              <TabList notes={data.upcoming} showMarkDone />
            )}
          </TabsContent>

          <TabsContent value="missed">
            {data.missed.length === 0 ? (
              <EmptyTab label="missed" />
            ) : (
              <TabList notes={data.missed} showMarkDone />
            )}
          </TabsContent>

          <TabsContent value="done">
            {data.done.length === 0 ? (
              <EmptyTab label="done" />
            ) : (
              <TabList notes={data.done} />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
