import { Router } from "express";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";
import { db, employeesTable } from "@workspace/db";
import { createSession, deleteSession } from "../lib/sessions.js";

const router = Router();

function hashPin(pin: string): string {
  return createHash("sha256").update(pin).digest("hex");
}

router.post("/auth/login", async (req, res) => {
  const { username, pin } = req.body as { username?: string; pin?: string };

  if (!username || !pin) {
    res.status(400).json({ error: "validation_error", message: "Username and PIN are required" });
    return;
  }

  try {
    const [employee] = await db
      .select()
      .from(employeesTable)
      .where(eq(employeesTable.username, username.toLowerCase().trim()));

    if (!employee) {
      res.status(401).json({ error: "unauthorized", message: "Invalid username or PIN" });
      return;
    }

    if (!employee.isActive) {
      res.status(401).json({ error: "unauthorized", message: "Account is inactive. Please contact an administrator." });
      return;
    }

    const pinHash = hashPin(pin);
    if (pinHash !== employee.pinHash) {
      res.status(401).json({ error: "unauthorized", message: "Invalid username or PIN" });
      return;
    }

    const sessionToken = createSession(employee.id, employee.role);

    res.json({
      sessionToken,
      employee: {
        id: employee.id,
        name: employee.name,
        initials: employee.initials,
        role: employee.role,
        username: employee.username,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Error during login");
    res.status(500).json({ error: "server_error", message: "Failed to log in" });
  }
});

router.post("/auth/logout", (req, res) => {
  const auth = req.headers["authorization"];
  if (auth?.startsWith("Bearer ")) {
    deleteSession(auth.slice(7));
  }
  res.json({ ok: true });
});

router.get("/auth/employees", async (req, res) => {
  try {
    const employees = await db
      .select({
        id: employeesTable.id,
        name: employeesTable.name,
        initials: employeesTable.initials,
        role: employeesTable.role,
        username: employeesTable.username,
      })
      .from(employeesTable)
      .orderBy(employeesTable.name);

    res.json({ employees });
  } catch (err) {
    req.log.error({ err }, "Error listing employees");
    res.status(500).json({ error: "server_error", message: "Failed to list employees" });
  }
});

export { hashPin };
export default router;
