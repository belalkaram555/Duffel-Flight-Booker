import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import cookieSignature from "cookie-signature";

const COOKIE_SECRET = "test-secret-for-vitest-do-not-use-in-prod";

const { dbMocks, sessionMocks } = vi.hoisted(() => {
  return {
    dbMocks: {
      selectRows: [] as unknown[],
      insertRows: [] as unknown[],
    },
    sessionMocks: {
      validateSessionImpl: vi.fn<() => Promise<{
        employeeId: number;
        name: string;
        role: string;
        expiresAt: number;
        csrfToken: string;
      } | null>>().mockResolvedValue(null),
      createSessionImpl: vi.fn<() => Promise<string>>().mockResolvedValue("mock-session-token"),
      getCsrfTokenImpl: vi.fn<() => Promise<string | null>>().mockResolvedValue("mock-csrf-token"),
      deleteSessionImpl: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    },
  };
});

vi.mock("@workspace/db", () => {
  const makeChain = (resolveWith: () => unknown) => {
    const obj: Record<string, unknown> = {};
    for (const method of ["from", "where", "orderBy", "set", "values"]) {
      obj[method] = () => obj;
    }
    obj["returning"] = () => Promise.resolve(resolveWith());
    obj["then"] = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) =>
      Promise.resolve(resolveWith()).then(res, rej);
    obj["catch"] = (rej: (e: unknown) => unknown) =>
      Promise.resolve(resolveWith()).catch(rej);
    return obj;
  };

  return {
    db: {
      select: () => makeChain(() => dbMocks.selectRows),
      insert: () => makeChain(() => dbMocks.insertRows),
      update: () => makeChain(() => []),
      delete: () => makeChain(() => []),
    },
    employeesTable: { id: "id", name: "name", username: "username" },
    sessionsTable: {},
    customersTable: {},
    ticketsTable: {},
  };
});

vi.mock("../lib/sessions.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/sessions.js")>();
  return {
    ...actual,
    createSession: (...args: unknown[]) => sessionMocks.createSessionImpl(...(args as [])),
    deleteSession: (...args: unknown[]) => sessionMocks.deleteSessionImpl(...(args as [])),
    validateSession: (...args: unknown[]) => sessionMocks.validateSessionImpl(...(args as [])),
    getCsrfToken: (...args: unknown[]) => sessionMocks.getCsrfTokenImpl(...(args as [])),
  };
});

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn().mockResolvedValue(false),
    hash: vi.fn().mockResolvedValue("$2b$12$mockedhash"),
  },
}));

const bcrypt = await import("bcryptjs");

import app from "../app.js";

const SESSION_COOKIE_NAME = "aeroops_sid";
const CSRF_COOKIE_NAME = "aeroops_csrf";

function makeSignedCookie(value: string): string {
  return `s:${cookieSignature.sign(value, COOKIE_SECRET)}`;
}

function cookieHeader(name: string, value: string): string {
  return `${name}=${encodeURIComponent(makeSignedCookie(value))}`;
}

const ADMIN_EMPLOYEE = {
  id: 1,
  name: "Admin User",
  initials: "AU",
  role: "Administrator",
  username: "admin",
  pinHash: "$2b$12$hashedpinvalue",
  isActive: true,
};

const AGENT_EMPLOYEE = {
  id: 2,
  name: "Agent User",
  initials: "AU",
  role: "Agent",
  username: "agent",
  pinHash: "$2b$12$hashedpinvalue",
  isActive: true,
};

beforeEach(() => {
  dbMocks.selectRows = [];
  dbMocks.insertRows = [];
  vi.mocked(bcrypt.default.compare).mockResolvedValue(false as never);
  sessionMocks.validateSessionImpl.mockResolvedValue(null);
  sessionMocks.createSessionImpl.mockResolvedValue("mock-session-token");
  sessionMocks.getCsrfTokenImpl.mockResolvedValue("mock-csrf-token");
  sessionMocks.deleteSessionImpl.mockResolvedValue(undefined);
});

describe("POST /api/auth/login", () => {
  it("returns 200 and employee data on successful login", async () => {
    dbMocks.selectRows = [ADMIN_EMPLOYEE];
    vi.mocked(bcrypt.default.compare).mockResolvedValue(true as never);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "admin", pin: "1234" });

    expect(res.status).toBe(200);
    expect(res.body.employee).toBeDefined();
    expect(res.body.employee.id).toBe(ADMIN_EMPLOYEE.id);
    expect(res.body.employee.name).toBe(ADMIN_EMPLOYEE.name);
    expect(res.body.employee.role).toBe(ADMIN_EMPLOYEE.role);
    expect(res.body.csrfToken).toBe("mock-csrf-token");
  });

  it("never exposes pinHash in the login response", async () => {
    dbMocks.selectRows = [ADMIN_EMPLOYEE];
    vi.mocked(bcrypt.default.compare).mockResolvedValue(true as never);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "admin", pin: "1234" });

    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain("pinHash");
    expect(JSON.stringify(res.body)).not.toContain("hashedpinvalue");
  });

  it("sets session cookie with HttpOnly flag on successful login", async () => {
    dbMocks.selectRows = [ADMIN_EMPLOYEE];
    vi.mocked(bcrypt.default.compare).mockResolvedValue(true as never);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "admin", pin: "1234" });

    expect(res.status).toBe(200);
    const cookies = res.headers["set-cookie"] as unknown as string[];
    const sessionCookie = cookies.find((c) => c.startsWith(SESSION_COOKIE_NAME));
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie!.toLowerCase()).toContain("httponly");
  });

  it("sets session cookie with SameSite=Lax on successful login", async () => {
    dbMocks.selectRows = [ADMIN_EMPLOYEE];
    vi.mocked(bcrypt.default.compare).mockResolvedValue(true as never);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "admin", pin: "1234" });

    expect(res.status).toBe(200);
    const cookies = res.headers["set-cookie"] as unknown as string[];
    const sessionCookie = cookies.find((c) => c.startsWith(SESSION_COOKIE_NAME));
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie!.toLowerCase()).toContain("samesite=lax");
  });

  it("sets CSRF cookie without HttpOnly so JavaScript can read it", async () => {
    dbMocks.selectRows = [ADMIN_EMPLOYEE];
    vi.mocked(bcrypt.default.compare).mockResolvedValue(true as never);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "admin", pin: "1234" });

    expect(res.status).toBe(200);
    const cookies = res.headers["set-cookie"] as unknown as string[];
    const csrfCookie = cookies.find((c) => c.startsWith(CSRF_COOKIE_NAME));
    expect(csrfCookie).toBeDefined();
    expect(csrfCookie!.toLowerCase()).not.toContain("httponly");
  });

  it("returns 401 when employee does not exist", async () => {
    dbMocks.selectRows = [];

    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "nonexistent", pin: "1234" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("unauthorized");
  });

  it("returns 401 when PIN is wrong", async () => {
    dbMocks.selectRows = [{ ...ADMIN_EMPLOYEE, username: "wrong_pin_user" }];
    vi.mocked(bcrypt.default.compare).mockResolvedValue(false as never);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "wrong_pin_user", pin: "0000" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("unauthorized");
  });

  it("returns 401 when account is inactive", async () => {
    dbMocks.selectRows = [{ ...ADMIN_EMPLOYEE, isActive: false, username: "inactive_user" }];

    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "inactive_user", pin: "1234" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("unauthorized");
  });

  it("returns 400 when username is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ pin: "1234" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("validation_error");
  });

  it("returns 400 when PIN is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "uniquepintestuser" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("validation_error");
  });

  it("rate-limits login after 5 failed attempts with same username", async () => {
    const username = `rl-target-${Date.now()}`;
    dbMocks.selectRows = [];

    for (let i = 0; i < 5; i++) {
      const r = await request(app)
        .post("/api/auth/login")
        .set("X-Forwarded-For", "10.0.0.99")
        .send({ username, pin: "0000" });
      expect(r.status).toBe(401);
    }

    const blocked = await request(app)
      .post("/api/auth/login")
      .set("X-Forwarded-For", "10.0.0.99")
      .send({ username, pin: "0000" });

    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toBe("too_many_requests");
  });
});

describe("GET /api/auth/me", () => {
  it("returns 401 when no session cookie is sent", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("unauthorized");
  });

  it("returns 401 when session cookie is invalid", async () => {
    sessionMocks.validateSessionImpl.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", cookieHeader(SESSION_COOKIE_NAME, "bogus-invalid-token"));

    expect(res.status).toBe(401);
  });

  it("returns 200 and employee data for a valid session", async () => {
    sessionMocks.validateSessionImpl.mockResolvedValue({
      employeeId: ADMIN_EMPLOYEE.id,
      name: ADMIN_EMPLOYEE.name,
      role: ADMIN_EMPLOYEE.role,
      expiresAt: Date.now() + 60_000,
      csrfToken: "mock-csrf-token",
    });
    dbMocks.selectRows = [
      {
        id: ADMIN_EMPLOYEE.id,
        name: ADMIN_EMPLOYEE.name,
        initials: ADMIN_EMPLOYEE.initials,
        role: ADMIN_EMPLOYEE.role,
        username: ADMIN_EMPLOYEE.username,
      },
    ];

    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", cookieHeader(SESSION_COOKIE_NAME, "valid-session-token"));

    expect(res.status).toBe(200);
    expect(res.body.employee.id).toBe(ADMIN_EMPLOYEE.id);
  });

  it("never exposes pinHash in /auth/me response", async () => {
    sessionMocks.validateSessionImpl.mockResolvedValue({
      employeeId: ADMIN_EMPLOYEE.id,
      name: ADMIN_EMPLOYEE.name,
      role: ADMIN_EMPLOYEE.role,
      expiresAt: Date.now() + 60_000,
      csrfToken: "mock-csrf-token",
    });
    dbMocks.selectRows = [
      {
        id: ADMIN_EMPLOYEE.id,
        name: ADMIN_EMPLOYEE.name,
        initials: ADMIN_EMPLOYEE.initials,
        role: ADMIN_EMPLOYEE.role,
        username: ADMIN_EMPLOYEE.username,
      },
    ];

    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", cookieHeader(SESSION_COOKIE_NAME, "valid-session-token"));

    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain("pinHash");
  });
});

describe("GET /api/auth/employees", () => {
  it("never exposes pinHash in the employees list", async () => {
    dbMocks.selectRows = [
      {
        id: ADMIN_EMPLOYEE.id,
        name: ADMIN_EMPLOYEE.name,
        initials: ADMIN_EMPLOYEE.initials,
        role: ADMIN_EMPLOYEE.role,
        username: ADMIN_EMPLOYEE.username,
      },
    ];

    const res = await request(app).get("/api/auth/employees");

    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain("pinHash");
  });
});

describe("Admin-only endpoints", () => {
  it("returns 401 on POST /api/employees with no session", async () => {
    const res = await request(app)
      .post("/api/employees")
      .send({ name: "New", initials: "NE", role: "Agent", username: "newuser", pin: "12345" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("unauthorized");
  });

  it("returns 403 on POST /api/employees when authenticated as Agent", async () => {
    sessionMocks.validateSessionImpl.mockResolvedValue({
      employeeId: AGENT_EMPLOYEE.id,
      name: AGENT_EMPLOYEE.name,
      role: AGENT_EMPLOYEE.role,
      expiresAt: Date.now() + 60_000,
      csrfToken: "mock-csrf-token",
    });

    const res = await request(app)
      .post("/api/employees")
      .set("Cookie", cookieHeader(SESSION_COOKIE_NAME, "agent-session-token"))
      .set("x-csrf-token", "mock-csrf-token")
      .send({ name: "New", initials: "NE", role: "Agent", username: "newuser", pin: "12345" });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("forbidden");
  });

  it("returns 401 on PUT /api/employees/:id with no session", async () => {
    const res = await request(app)
      .put("/api/employees/1")
      .send({ name: "Updated" });

    expect(res.status).toBe(401);
  });

  it("returns 403 on PUT /api/employees/:id when authenticated as Agent", async () => {
    sessionMocks.validateSessionImpl.mockResolvedValue({
      employeeId: AGENT_EMPLOYEE.id,
      name: AGENT_EMPLOYEE.name,
      role: AGENT_EMPLOYEE.role,
      expiresAt: Date.now() + 60_000,
      csrfToken: "mock-csrf-token",
    });

    const res = await request(app)
      .put("/api/employees/1")
      .set("Cookie", cookieHeader(SESSION_COOKIE_NAME, "agent-session-token"))
      .set("x-csrf-token", "mock-csrf-token")
      .send({ name: "Updated" });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("forbidden");
  });

  it("returns 401 on PATCH /api/employees/:id/deactivate with no session", async () => {
    const res = await request(app).patch("/api/employees/1/deactivate");

    expect(res.status).toBe(401);
  });

  it("returns 403 on PATCH /api/employees/:id/deactivate when authenticated as Agent", async () => {
    sessionMocks.validateSessionImpl.mockResolvedValue({
      employeeId: AGENT_EMPLOYEE.id,
      name: AGENT_EMPLOYEE.name,
      role: AGENT_EMPLOYEE.role,
      expiresAt: Date.now() + 60_000,
      csrfToken: "mock-csrf-token",
    });

    const res = await request(app)
      .patch("/api/employees/1/deactivate")
      .set("Cookie", cookieHeader(SESSION_COOKIE_NAME, "agent-session-token"))
      .set("x-csrf-token", "mock-csrf-token");

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("forbidden");
  });

  it("returns 403 on GET /api/employees?includeInactive=true when authenticated as Agent", async () => {
    sessionMocks.validateSessionImpl.mockResolvedValue({
      employeeId: AGENT_EMPLOYEE.id,
      name: AGENT_EMPLOYEE.name,
      role: AGENT_EMPLOYEE.role,
      expiresAt: Date.now() + 60_000,
      csrfToken: "mock-csrf-token",
    });

    const res = await request(app)
      .get("/api/employees?includeInactive=true")
      .set("Cookie", cookieHeader(SESSION_COOKIE_NAME, "agent-session-token"));

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("forbidden");
  });

  it("returns 401 on GET /api/employees?includeInactive=true with no session", async () => {
    const res = await request(app).get("/api/employees?includeInactive=true");

    expect(res.status).toBe(401);
  });
});
