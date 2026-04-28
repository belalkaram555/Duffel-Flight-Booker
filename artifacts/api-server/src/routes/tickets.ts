import { Router } from "express";
import { eq, desc, and } from "drizzle-orm";
import { db, ticketsTable, ticketStatusHistoryTable, paymentsTable, customersTable, insertTicketSchema, updateTicketSchema, insertPaymentSchema } from "@workspace/db";

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

router.get("/tickets", async (req, res) => {
  try {
    const { customerId, ticketStatus, paymentStatus } = req.query as Record<string, string | undefined>;

    const conditions = [];
    if (customerId) conditions.push(eq(ticketsTable.customerId, Number(customerId)));
    if (ticketStatus) conditions.push(eq(ticketsTable.ticketStatus, ticketStatus as typeof ticketsTable.ticketStatus._.data));
    if (paymentStatus) conditions.push(eq(ticketsTable.paymentStatus, paymentStatus as typeof ticketsTable.paymentStatus._.data));

    const rows = await db
      .select({
        ticket: ticketsTable,
        customerName: customersTable.fullName,
        customerPhone: customersTable.phone,
      })
      .from(ticketsTable)
      .leftJoin(customersTable, eq(ticketsTable.customerId, customersTable.id))
      .where(conditions.length > 0 ? and(...(conditions as [ReturnType<typeof eq>])) : undefined)
      .orderBy(desc(ticketsTable.createdAt));

    const tickets = rows.map((r) => ({
      ...r.ticket,
      customerName: r.customerName,
      customerPhone: r.customerPhone,
    }));

    res.json({ tickets });
  } catch (err) {
    req.log.error({ err }, "Error listing tickets");
    res.status(500).json({ error: "server_error", message: "Failed to list tickets" });
  }
});

router.post("/tickets", async (req, res) => {
  const parsed = insertTicketSchema.safeParse(coerceDates(req.body as Record<string, unknown>, "departureDatetime", "arrivalDatetime"));
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }
  try {
    const [ticket] = await db.insert(ticketsTable).values(parsed.data).returning();

    await db.insert(ticketStatusHistoryTable).values({
      ticketId: ticket!.id,
      oldStatus: null,
      newStatus: ticket!.ticketStatus,
      changedBy: "system",
    });

    res.status(201).json({ ticket });
  } catch (err) {
    req.log.error({ err }, "Error creating ticket");
    res.status(500).json({ error: "server_error", message: "Failed to create ticket" });
  }
});

router.get("/tickets/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "validation_error", message: "Invalid ticket ID" });
    return;
  }
  try {
    const [row] = await db
      .select({
        ticket: ticketsTable,
        customerName: customersTable.fullName,
        customerPhone: customersTable.phone,
        customerEmail: customersTable.email,
      })
      .from(ticketsTable)
      .leftJoin(customersTable, eq(ticketsTable.customerId, customersTable.id))
      .where(eq(ticketsTable.id, id));

    if (!row) {
      res.status(404).json({ error: "not_found", message: "Ticket not found" });
      return;
    }

    const history = await db
      .select()
      .from(ticketStatusHistoryTable)
      .where(eq(ticketStatusHistoryTable.ticketId, id))
      .orderBy(ticketStatusHistoryTable.createdAt);

    const payments = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.ticketId, id))
      .orderBy(paymentsTable.createdAt);

    res.json({
      ticket: {
        ...row.ticket,
        customerName: row.customerName,
        customerPhone: row.customerPhone,
        customerEmail: row.customerEmail,
      },
      history,
      payments,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting ticket");
    res.status(500).json({ error: "server_error", message: "Failed to get ticket" });
  }
});

router.put("/tickets/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "validation_error", message: "Invalid ticket ID" });
    return;
  }
  const parsed = updateTicketSchema.safeParse(coerceDates(req.body as Record<string, unknown>, "departureDatetime", "arrivalDatetime"));
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }
  try {
    const [existing] = await db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.id, id));
    if (!existing) {
      res.status(404).json({ error: "not_found", message: "Ticket not found" });
      return;
    }

    const [ticket] = await db
      .update(ticketsTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(ticketsTable.id, id))
      .returning();

    if (parsed.data.ticketStatus && parsed.data.ticketStatus !== existing.ticketStatus) {
      await db.insert(ticketStatusHistoryTable).values({
        ticketId: id,
        oldStatus: existing.ticketStatus,
        newStatus: parsed.data.ticketStatus,
        changedBy: req.headers["x-employee-name"] as string || "employee",
      });
    }

    res.json({ ticket });
  } catch (err) {
    req.log.error({ err }, "Error updating ticket");
    res.status(500).json({ error: "server_error", message: "Failed to update ticket" });
  }
});

router.delete("/tickets/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "validation_error", message: "Invalid ticket ID" });
    return;
  }
  try {
    const [deleted] = await db
      .delete(ticketsTable)
      .where(eq(ticketsTable.id, id))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "not_found", message: "Ticket not found" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error deleting ticket");
    res.status(500).json({ error: "server_error", message: "Failed to delete ticket" });
  }
});

router.post("/tickets/:id/payments", async (req, res) => {
  const ticketId = Number(req.params.id);
  if (isNaN(ticketId)) {
    res.status(400).json({ error: "validation_error", message: "Invalid ticket ID" });
    return;
  }
  const parsed = insertPaymentSchema.safeParse({ ...req.body, ticketId });
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }
  try {
    const [existing] = await db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.id, ticketId));
    if (!existing) {
      res.status(404).json({ error: "not_found", message: "Ticket not found" });
      return;
    }

    const [payment] = await db.insert(paymentsTable).values(parsed.data).returning();
    res.status(201).json({ payment });
  } catch (err) {
    req.log.error({ err }, "Error adding payment");
    res.status(500).json({ error: "server_error", message: "Failed to add payment" });
  }
});

export default router;
