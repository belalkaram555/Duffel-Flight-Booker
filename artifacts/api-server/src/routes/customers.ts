import { Router } from "express";
import { eq, ilike, or, sql, and } from "drizzle-orm";
import { db, customersTable, ticketsTable, insertCustomerSchema, updateCustomerSchema } from "@workspace/db";

const router = Router();

router.get("/customers", async (req, res) => {
  try {
    const { search, status, assignedEmployeeId } = req.query as Record<string, string | undefined>;

    const conditions = [];
    if (search) {
      conditions.push(
        or(
          ilike(customersTable.fullName, `%${search}%`),
          ilike(customersTable.phone ?? sql`''`, `%${search}%`),
          ilike(customersTable.email ?? sql`''`, `%${search}%`),
        )
      );
    }
    if (status) {
      conditions.push(eq(customersTable.status, status as typeof customersTable.status._.data));
    }
    if (assignedEmployeeId) {
      conditions.push(eq(customersTable.assignedEmployeeId, Number(assignedEmployeeId)));
    }

    const customers = conditions.length
      ? await db.select().from(customersTable).where(conditions.length === 1 ? conditions[0]! : and(...(conditions as [ReturnType<typeof eq>]))).orderBy(sql`${customersTable.createdAt} desc`)
      : await db.select().from(customersTable).orderBy(sql`${customersTable.createdAt} desc`);

    res.json({ customers });
  } catch (err) {
    req.log.error({ err }, "Error listing customers");
    res.status(500).json({ error: "server_error", message: "Failed to list customers" });
  }
});

router.post("/customers", async (req, res) => {
  const parsed = insertCustomerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }
  try {
    const [customer] = await db
      .insert(customersTable)
      .values(parsed.data)
      .returning();
    res.status(201).json({ customer });
  } catch (err) {
    req.log.error({ err }, "Error creating customer");
    res.status(500).json({ error: "server_error", message: "Failed to create customer" });
  }
});

router.get("/customers/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "validation_error", message: "Invalid customer ID" });
    return;
  }
  try {
    const [customer] = await db
      .select()
      .from(customersTable)
      .where(eq(customersTable.id, id));
    if (!customer) {
      res.status(404).json({ error: "not_found", message: "Customer not found" });
      return;
    }
    res.json({ customer });
  } catch (err) {
    req.log.error({ err }, "Error getting customer");
    res.status(500).json({ error: "server_error", message: "Failed to get customer" });
  }
});

router.put("/customers/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "validation_error", message: "Invalid customer ID" });
    return;
  }
  const parsed = updateCustomerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }
  try {
    const [customer] = await db
      .update(customersTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(customersTable.id, id))
      .returning();
    if (!customer) {
      res.status(404).json({ error: "not_found", message: "Customer not found" });
      return;
    }
    res.json({ customer });
  } catch (err) {
    req.log.error({ err }, "Error updating customer");
    res.status(500).json({ error: "server_error", message: "Failed to update customer" });
  }
});

router.delete("/customers/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "validation_error", message: "Invalid customer ID" });
    return;
  }
  try {
    const linked = await db
      .select({ id: ticketsTable.id })
      .from(ticketsTable)
      .where(eq(ticketsTable.customerId, id))
      .limit(1);
    if (linked.length > 0) {
      res.status(409).json({
        error: "conflict",
        message: "Cannot delete customer with existing tickets. Remove tickets first.",
      });
      return;
    }
    const [deleted] = await db
      .delete(customersTable)
      .where(eq(customersTable.id, id))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "not_found", message: "Customer not found" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error deleting customer");
    res.status(500).json({ error: "server_error", message: "Failed to delete customer" });
  }
});

export default router;
