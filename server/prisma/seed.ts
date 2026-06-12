import {
  PrismaClient,
  Role,
  WebsiteStatus,
  IssueCategory,
  IssueSeverity,
  IssueStatus,
  ActivityType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const WEBSITE_STATUSES = [
  WebsiteStatus.ONLINE,
  WebsiteStatus.DEGRADED,
  WebsiteStatus.DOWN,
  WebsiteStatus.UNKNOWN,
] as const;

const EXTRA_WEBSITE_NAMES = [
  "Marketing Hub",
  "Support Desk",
  "Customer Portal",
  "Analytics Dashboard",
  "Documentation Site",
  "Partner Portal",
  "Mobile App API",
  "Staging Environment",
  "Internal Wiki",
  "HR Portal",
  "Inventory System",
  "Billing Console",
  "Newsletter Platform",
  "Community Forum",
  "Learning Center",
  "Careers Page",
  "Press Room",
  "Investor Relations",
  "Status Page",
  "CDN Edge",
  "Auth Service",
  "Payment Gateway",
  "Shipping Tracker",
  "Returns Portal",
  "Loyalty Program",
  "Gift Card Store",
  "Wholesale Portal",
  "Vendor Portal",
  "Affiliate Hub",
  "Events Calendar",
  "Booking System",
  "Live Chat Widget",
  "Help Center",
  "Knowledge Base",
  "Release Notes",
  "Sandbox API",
  "QA Environment",
  "Design System",
  "Brand Assets",
  "Media Library",
  "Video Streaming",
  "Podcast Feed",
  "Survey Platform",
  "Feedback Widget",
  "A/B Testing Console",
  "SEO Monitor",
  "Uptime Checker",
  "Log Aggregator",
  "Metrics Dashboard",
  "Alert Manager",
];

async function main() {
  const passwordHash = await bcrypt.hash("demo123", 10);

  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.website.deleteMany();
  await prisma.user.deleteMany();

  const client = await prisma.user.create({
    data: {
      email: "client@demo.com",
      name: "Demo Client",
      passwordHash,
      role: Role.CLIENT,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: "manager@demo.com",
      name: "Demo Manager",
      passwordHash,
      role: Role.MANAGER,
    },
  });

  await prisma.user.create({
    data: {
      email: "manager2@demo.com",
      name: "Support Lead",
      passwordHash,
      role: Role.MANAGER,
    },
  });

  const websites = await Promise.all([
    prisma.website.create({
      data: {
        name: "Acme Store",
        url: "https://acme-store.example.com",
        status: WebsiteStatus.ONLINE,
        lastCheckedAt: new Date(),
        clientId: client.id,
      },
    }),
    prisma.website.create({
      data: {
        name: "Acme Blog",
        url: "https://blog.acme.example.com",
        status: WebsiteStatus.DEGRADED,
        lastCheckedAt: new Date(Date.now() - 3600000),
        clientId: client.id,
      },
    }),
    prisma.website.create({
      data: {
        name: "Acme Portal",
        url: "https://portal.acme.example.com",
        status: WebsiteStatus.DOWN,
        lastCheckedAt: new Date(Date.now() - 7200000),
        clientId: client.id,
      },
    }),
    prisma.website.create({
      data: {
        name: "Acme API",
        url: "https://api.acme.example.com",
        status: WebsiteStatus.UNKNOWN,
        lastCheckedAt: new Date(Date.now() - 86400000),
        clientId: client.id,
      },
    }),
  ]);

  await prisma.website.createMany({
    data: EXTRA_WEBSITE_NAMES.map((label, index) => ({
      name: `Acme ${label}`,
      url: `https://${label.toLowerCase().replace(/\s+/g, "-")}.acme.example.com`,
      status: WEBSITE_STATUSES[index % WEBSITE_STATUSES.length],
      lastCheckedAt: new Date(Date.now() - (index + 1) * 3600000),
      clientId: client.id,
    })),
  });

  const issue1 = await prisma.issue.create({
    data: {
      title: "Checkout button not working",
      description:
        "Users report the checkout button is unresponsive on mobile Safari. This is blocking purchases.",
      category: IssueCategory.BUG,
      severity: IssueSeverity.CRITICAL,
      status: IssueStatus.IN_PROGRESS,
      websiteId: websites[0].id,
      createdById: client.id,
      assigneeId: manager.id,
    },
  });

  await prisma.activityLog.createMany({
    data: [
      {
        issueId: issue1.id,
        actorId: client.id,
        type: ActivityType.CREATED,
        message: "Issue created: Checkout button not working",
      },
      {
        issueId: issue1.id,
        actorId: manager.id,
        type: ActivityType.ASSIGNED,
        message: "Issue assigned to manager",
        metadata: { assigneeId: manager.id },
      },
      {
        issueId: issue1.id,
        actorId: manager.id,
        type: ActivityType.STATUS_CHANGED,
        message: "Status changed from OPEN to IN_PROGRESS",
        metadata: { from: "OPEN", to: "IN_PROGRESS" },
      },
    ],
  });

  await prisma.comment.create({
    data: {
      issueId: issue1.id,
      authorId: manager.id,
      body: "We are investigating the mobile Safari issue. A fix is in progress.",
      isManagerResponse: true,
    },
  });

  const issue2 = await prisma.issue.create({
    data: {
      title: "Add dark mode to dashboard",
      description: "It would improve usability if the client dashboard supported dark mode.",
      category: IssueCategory.SUGGESTION,
      severity: IssueSeverity.LOW,
      status: IssueStatus.OPEN,
      websiteId: websites[1].id,
      createdById: client.id,
    },
  });

  await prisma.activityLog.create({
    data: {
      issueId: issue2.id,
      actorId: client.id,
      type: ActivityType.CREATED,
      message: "Issue created: Add dark mode to dashboard",
    },
  });

  console.log("Seed complete");
  console.log(`Websites: ${websites.length + EXTRA_WEBSITE_NAMES.length} total for demo client`);
  console.log("Client: client@demo.com / demo123");
  console.log("Manager: manager@demo.com / demo123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
