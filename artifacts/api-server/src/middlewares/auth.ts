import type { Request, RequestHandler } from "express";
import { validateSession } from "../lib/sessions.js";

export interface EmployeeSession {
  employeeId: number;
  name: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      employee?: EmployeeSession;
    }
  }
}

export function getSessionFromRequest(req: Request): EmployeeSession | null {
  const auth = req.headers["authorization"];
  if (!auth?.startsWith("Bearer ")) return null;
  const session = validateSession(auth.slice(7));
  if (!session) return null;
  return { employeeId: session.employeeId, name: session.name, role: session.role };
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const session = getSessionFromRequest(req);
  if (!session) {
    const auth = req.headers["authorization"];
    if (!auth?.startsWith("Bearer ")) {
      res.status(401).json({ error: "unauthorized", message: "Authentication required" });
    } else {
      res.status(401).json({ error: "unauthorized", message: "Session expired or invalid. Please log in again." });
    }
    return;
  }
  req.employee = session;
  next();
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  const session = getSessionFromRequest(req);
  if (!session) {
    const auth = req.headers["authorization"];
    if (!auth?.startsWith("Bearer ")) {
      res.status(401).json({ error: "unauthorized", message: "Authentication required" });
    } else {
      res.status(401).json({ error: "unauthorized", message: "Session expired or invalid. Please log in again." });
    }
    return;
  }
  if (session.role !== "Administrator") {
    res.status(403).json({ error: "forbidden", message: "Administrator access required" });
    return;
  }
  req.employee = session;
  next();
};
