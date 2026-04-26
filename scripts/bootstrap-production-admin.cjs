/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient, Role } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

function slugUsername(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^_+|_+$/g, "") || "admin";
}

async function getAvailableUsername(baseUsername) {
  const base = slugUsername(baseUsername);
  let username = base;
  let counter = 2;

  while (await prisma.user.findUnique({ where: { username }, select: { id: true } })) {
    username = `${base}${counter}`;
    counter += 1;
  }

  return username;
}

async function main() {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!adminEmails.length) {
    console.log("No admin emails configured, skipping production admin bootstrap.");
    return;
  }

  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "";
  if (!adminPassword) {
    throw new Error("SEED_ADMIN_PASSWORD is required for production admin bootstrap.");
  }

  const passwordHash = await hash(adminPassword, 12);

  for (const email of adminEmails) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, username: true, name: true },
    });

    if (existingUser) {
      await prisma.user.update({
        where: { email },
        data: {
          role: Role.ADMIN,
          passwordHash,
          bannedAt: null,
          banReason: null,
          name: existingUser.name || "Website Owner",
        },
      });
      continue;
    }

    const username = await getAvailableUsername(email.split("@")[0]);

    await prisma.user.create({
      data: {
        email,
        name: "Website Owner",
        username,
        role: Role.ADMIN,
        passwordHash,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Production admin bootstrap failed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
