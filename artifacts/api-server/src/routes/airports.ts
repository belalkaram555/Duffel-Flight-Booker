import { Router, type RequestHandler } from "express";
import { duffel } from "../lib/duffel";
import { validateSession } from "../lib/sessions.js";

const router = Router();

const requireAuth: RequestHandler = (req, res, next) => {
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

router.get("/airports/search", requireAuth, async (req, res) => {
  const query = String(req.query.query ?? "").trim();

  if (query.length < 1) {
    res.json({ airports: [] });
    return;
  }

  try {
    const response = await duffel.suggestions.list({ query });

    const airports = response.data
      .filter((place) => place.type === "airport")
      .slice(0, 10)
      .map((place) => ({
        iataCode: place.iata_code,
        name: place.name,
        cityName: place.city_name,
        countryName: place.iata_country_code,
      }));

    res.json({ airports });
  } catch (err: unknown) {
    req.log.error({ err }, "Error searching airports");
    res.json({ airports: [] });
  }
});

export default router;
