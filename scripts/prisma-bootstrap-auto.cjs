/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const databaseUrl = process.env.DATABASE_URL ?? "";
const explicitSchema = process.env.PRISMA_SCHEMA;
const isPostgres = /^postgres(ql)?:\/\//i.test(databaseUrl);
const schema = explicitSchema || "prisma/schema.postgres.prisma";

if (!isPostgres) {
  console.log("Skipping production database bootstrap because DATABASE_URL is not PostgreSQL.");
  process.exit(0);
}

const prismaBinary = path.resolve(
  process.cwd(),
  "node_modules",
  ".bin",
  process.platform === "win32" ? "prisma.cmd" : "prisma",
);

function runExecutable(executable, args) {
  if (process.platform === "win32") {
    const escapedArgs = args
      .map((arg) => `"${String(arg).replace(/"/g, '\\"')}"`)
      .join(" ");

    return spawnSync(`"${executable}" ${escapedArgs}`, {
      stdio: "inherit",
      env: process.env,
      shell: true,
    });
  }

  return spawnSync(executable, args, {
    stdio: "inherit",
    env: process.env,
  });
}

function runStep(label, args) {
  console.log(`\n==> ${label}`);
  const result = runExecutable(args[0], args.slice(1));

  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1);
  }
}

runStep("Syncing Prisma schema to PostgreSQL", [
  prismaBinary,
  "db",
  "push",
  "--schema",
  schema,
]);

if ((process.env.ADMIN_EMAILS ?? "").trim() && (process.env.SEED_ADMIN_PASSWORD ?? "").trim()) {
  runStep("Bootstrapping production admin account", [
    process.execPath,
    "scripts/bootstrap-production-admin.cjs",
  ]);
} else {
  console.log("Skipping admin bootstrap because ADMIN_EMAILS or SEED_ADMIN_PASSWORD is empty.");
}
