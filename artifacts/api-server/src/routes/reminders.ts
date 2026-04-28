import { Router } from "express";
import { eq, and, gte, lt, desc, isNotNull } from "drizzle-orm";
import { db, remindersTable, customerNotesTable, customersTable, insertReminderSchema } from "@workspace/db";

const router = Router();

function coerceDates(body: Record<string, unknown>, ...fields: string[]) {
  const result = { ...body };
  for (const field of fields) {
    if (result[field] && typeof result[field] === "string") {
      result[field] = new Date(result[field] as string);
    }
  }
  return result;
}

router.get("/reminders", async (req, res) => {
  try {
    const { status, employeeId } = req.query as Record<string, string | undefined>;

    let rows = await db
      .select({
        reminder: remindersTable,
        customerName: customersTable.fullName,
        customerPhone: customersTable.phone,
      })
      .from(remindersTable)
      .leftJoin(customersTable, eq(remindersTable.customerId, customersTable.id))
      .orderBy(desc(remindersTable.reminderDate));

    if (status) {
      rows = rows.filter((r) => r.reminder.status === status);
    }
    if (employeeId) {
      rows = rows.filter((r) => r.reminder.employeeId === Number(employeeId));
    }

    const reminders = rows.map((r) => ({
      ...r.reminder,
      customerName: r.customerName,
      customerPhone: r.customerPhone,
    }));

    res.json({ reminders });
  } catch (err) {
    req.log.error({ err }, "Error listing reminders");
    res.status(500).json({ error: "server_error", message: "Failed to list reminders" });
  }
});

router.post("/reminders", async (req, res) => {
  const parsed = insertReminderSchema.safeParse(coerceDates(req.body as Record<string, unknown>, "reminderDate"));
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }
  try {
    const [reminder] = await db.insert(remindersTable).values(parsed.data).returning();
    res.status(201).json({ reminder });
  } catch (err) {
    req.log.error({ err }, "Error creating reminder");
    res.status(500).json({ error: "server_error", message: "Failed to create reminder" });
  }
});

router.put("/reminders/:id/status", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "validation_error", message: "Invalid reminder ID" });
    return;
  }
  const { status } = req.body as { status?: string };
  if (!status || !["pending", "done", "missed"].includes(status)) {
    res.status(400).json({ error: "validation_error", message: "status must be pending, done, or missed" });
    return;
  }
  try {
    const [reminder] = await db
      .update(remindersTable)
      .set({ status: status as "pending" | "done" | "missed", updatedAt: new Date() })
      .where(eq(remindersTable.id, id))
      .returning();
    if (!reminder) {
      res.status(404).json({ error: "not_found", message: "Reminder not found" });
      return;
    }
    res.json({ reminder });
  } catch (err) {
    req.log.error({ err }, "Error updating reminder status");
    res.status(500).json({ error: "server_error", message: "Failed to update reminder" });
  }
});

router.get("/followups", async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    const notes = await db
      .select({
        note: customerNotesTable,
        customerName: customersTable.fullName,
        customerPhone: customersTable.phone,
        customerId: customersTable.id,
      })
      .from(customerNotesTable)
      .leftJoin(customersTable, eq(customerNotesTable.customerId, customersTable.id))
      .where(isNotNull(customerNotesTable.followUpDate))
      .orderBy(desc(customerNotesTable.followUpDate));

    const enriched = notes.map((r) => {
      const isOverdue =
        r.note.followUpDate &&
        r.note.followUpDate < now &&
        r.note.followUpStatus === "pending";
      return {
        ...r.note,
        followUpStatus: isOverdue ? "missed" : r.note.followUpStatus,
        customerName: r.customerName,
        customerPhone: r.customerPhone,
        customerId: r.customerId,
      };
    });

    const today = enriched.filter(
      (n) => n.followUpDate && n.followUpDate >= todayStart && n.followUpDate < todayEnd
    );
    const upcoming = enriched.filter(
      (n) => n.followUpDate && n.followUpDate >= todayEnd && n.followUpStatus === "pending"
    );
    const missed = enriched.filter((n) => n.followUpStatus === "missed");
    const done = enriched.filter((n) => n.followUpStatus === "done");

    res.json({ today, upcoming, missed, done, all: enriched });
  } catch (err) {
    req.log.error({ err }, "Error listing follow-ups");
    res.status(500).json({ error: "server_error", message: "Failed to list follow-ups" });
  }
});

export default router;
