/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const databaseUrl = process.env.DATABASE_URL ?? "";
const explicitSchema = process.env.PRISMA_SCHEMA;

const schema = explicitSchema
  ? explicitSchema
  : /^postgres(ql)?:\/\//i.test(databaseUrl)
    ? "prisma/schema.postgres.prisma"
    : "prisma/schema.prisma";

console.log(`Using Prisma schema: ${schema}`);

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

const result = runExecutable(prismaBinary, ["generate", "--schema", schema]);

process.exit(result.status ?? 1);
