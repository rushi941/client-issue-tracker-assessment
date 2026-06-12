/**
 * End-to-end API test script — run with: node scripts/e2e-test.mjs
 * Requires server on :3001 and seeded database.
 */
const BASE = "http://localhost:3001/api";

const results = [];

function log(id, name, pass, detail = "") {
  results.push({ id, name, pass, detail });
  const icon = pass ? "PASS" : "FAIL";
  console.log(`[${icon}] ${id}: ${name}${detail ? ` — ${detail}` : ""}`);
}

class Session {
  constructor() {
    this.cookie = "";
  }

  async req(method, path, body) {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(this.cookie ? { Cookie: this.cookie } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const setCookie = res.headers.getSetCookie?.() ?? [];
    if (setCookie.length) {
      this.cookie = setCookie.map((c) => c.split(";")[0]).join("; ");
    }
    const json = await res.json().catch(() => ({}));
    return { status: res.status, json };
  }
}

async function main() {
  const client = new Session();
  const manager = new Session();
  let issueId;
  let websiteId;

  // --- Client flow ---
  let r = await client.req("POST", "/auth/login", {
    email: "client@demo.com",
    password: "demo123",
  });
  log("C01", "Client login", r.status === 200 && r.json.data?.user?.role === "CLIENT");

  r = await client.req("GET", "/websites");
  const websiteList = r.json.data ?? {};
  const websites = websiteList.items ?? [];
  websiteId = websites[0]?.id ?? "";
  log(
    "C02",
    "View websites",
    r.status === 200 && websites.length > 0,
    `${websiteList.pagination?.total ?? websites.length} site(s)`,
  );

  r = await client.req("POST", "/issues", {
    title: "E2E Test Issue",
    description: "Automated end-to-end test issue created by tester agent.",
    websiteId,
    category: "BUG",
    severity: "MEDIUM",
  });
  issueId = r.json.data?.id ?? "";
  log("C03", "Create issue", r.status === 201 && !!issueId);

  r = await client.req("GET", `/issues/${issueId}`);
  log("C04", "View issue", r.status === 200 && r.json.data?.title === "E2E Test Issue");

  r = await client.req("POST", `/issues/${issueId}/comments`, {
    body: "Client comment from E2E test",
  });
  log("C05", "Add comment", r.status === 201);

  r = await client.req("GET", `/issues/${issueId}/timeline`);
  const timeline = r.json.data ?? [];
  const hasCreated = timeline.some((e) => e.type === "CREATED");
  const hasComment = timeline.some((e) => e.type === "COMMENT");
  log(
    "C06",
    "Timeline after client actions",
    hasCreated && hasComment,
    `${timeline.length} events`,
  );

  // --- Manager flow ---
  r = await manager.req("POST", "/auth/login", {
    email: "manager@demo.com",
    password: "demo123",
  });
  log("M01", "Manager login", r.status === 200 && r.json.data?.user?.role === "MANAGER");

  r = await manager.req("GET", "/analytics/dashboard");
  const analytics = r.json.data ?? {};
  log("M02", "View analytics", r.status === 200 && typeof analytics.openIssues === "number");

  r = await manager.req("GET", "/issues");
  const issueList = r.json.data ?? {};
  const issues = issueList.items ?? [];
  log(
    "M03",
    "View issue queue",
    r.status === 200 && issues.length > 0,
    `${issues.length} issue(s) on page 1`,
  );

  r = await manager.req("GET", "/issues/managers");
  const managers = r.json.data ?? [];
  const assigneeId = managers[0]?.id ?? "";
  log("M04", "List managers for assign", r.status === 200 && !!assigneeId);

  r = await manager.req("PATCH", `/issues/${issueId}/manage`, {
    assigneeId,
    severity: "HIGH",
    status: "IN_PROGRESS",
  });
  log("M05", "Assign issue + update severity", r.status === 200);

  r = await manager.req("POST", `/issues/${issueId}/responses`, {
    body: "Manager response from E2E test",
  });
  log("M06", "Add manager response", r.status === 201);

  r = await manager.req("PATCH", `/issues/${issueId}/manage`, { status: "RESOLVED" });
  log("M07", "Resolve issue", r.status === 200 && r.json.data?.status === "RESOLVED");

  r = await client.req("GET", "/notifications");
  const notifs = r.json.data?.notifications ?? [];
  const unread = r.json.data?.unreadCount ?? 0;
  const hasResolvedNotif = notifs.some((n) => n.type === "ISSUE_RESOLVED");
  log(
    "C07",
    "Client notifications after resolve",
    r.status === 200 && hasResolvedNotif,
    `unread=${unread}`,
  );

  r = await manager.req("GET", `/issues/${issueId}/timeline`);
  const mgrTimeline = r.json.data ?? [];
  const types = new Set(mgrTimeline.map((e) => e.type));
  log(
    "M08",
    "Timeline complete",
    types.has("ASSIGNED") &&
      types.has("SEVERITY_CHANGED") &&
      types.has("STATUS_CHANGED") &&
      types.has("RESPONSE") &&
      types.has("RESOLVED"),
    [...types].join(", "),
  );

  // --- RBAC ---
  r = await client.req("PATCH", `/issues/${issueId}/manage`, { status: "OPEN" });
  log("R01", "Client blocked from /manage", r.status === 403);

  r = await client.req("POST", `/issues/${issueId}/responses`, { body: "hack" });
  log("R02", "Client blocked from /responses", r.status === 403);

  r = await manager.req("PATCH", `/issues/${issueId}`, { title: "Hacked" });
  log("R03", "Manager blocked from client PATCH", r.status === 403);

  r = await manager.req("POST", "/issues", {
    title: "Should fail",
    description: "Manager cannot create client issues",
    websiteId,
    category: "BUG",
  });
  log("R04", "Manager blocked from POST /issues", r.status === 403);

  // --- API health ---
  const health = await fetch("http://localhost:3001/health");
  log("H01", "Health check", health.status === 200);

  const failed = results.filter((x) => !x.pass);
  console.log("\n--- SUMMARY ---");
  console.log(
    `Total: ${results.length}, Passed: ${results.length - failed.length}, Failed: ${failed.length}`,
  );
  if (failed.length) {
    console.log("Failures:", failed);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
