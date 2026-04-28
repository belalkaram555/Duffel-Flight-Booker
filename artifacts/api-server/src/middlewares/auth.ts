import type { Request, RequestHandler } from "express";
import { validateSession } from "../lib/sessions.js";

export function getSessionFromRequest(req: Request) {
  const auth = req.headers["authorization"];
  if (!auth?.startsWith("Bearer ")) return null;
  return validateSession(auth.slice(7));
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const auth = req.headers["authorization"];
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "unauthorized", message: "Authentication required" });
    return;
  }
  const session = validateSession(auth.slice(7));
  if (!session) {
    res.status(401).json({ error: "unauthorized", message: "Session expired or invalid. Please log in again." });
    return;
  }
  next();
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  const auth = req.headers["authorization"];
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "unauthorized", message: "Authentication required" });
    return;
  }
  const session = validateSession(auth.slice(7));
  if (!session) {
    res.status(401).json({ error: "unauthorized", message: "Session expired or invalid. Please log in again." });
    return;
  }
  if (session.role !== "Administrator") {
    res.status(403).json({ error: "forbidden", message: "Administrator access required" });
    return;
  }
  next();
};
