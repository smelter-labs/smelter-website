// Type-checks docs examples against the SDK version they document.
//
//   node typecheck-examples/check.mjs             all released versions
//   node typecheck-examples/check.mjs 0.4.x       selected targets
//   node typecheck-examples/check.mjs unreleased  current docs, not part of the default run
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const UNRELEASED = "unreleased";
const root = dirname(fileURLToPath(import.meta.url));

function releasedVersions() {
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== UNRELEASED)
    .map((entry) => entry.name)
    .sort();
}

function run(cwd, args) {
  return spawnSync("pnpm", args, { cwd, stdio: "inherit" }).status === 0;
}

function check(target) {
  console.log(`\n=== ${target}`);
  const cwd = join(root, target);
  return (
    run(cwd, ["install", "--silent", "--frozen-lockfile"]) &&
    run(cwd, ["exec", "tsc", "-p", "tsconfig.json", "--pretty", "false"])
  );
}

const args = process.argv.slice(2);
const targets = args.length > 0 ? args : releasedVersions();
const failed = targets.filter((target) => !check(target));

if (failed.length > 0) {
  console.error(`\nType check failed for: ${failed.join(", ")}`);
  process.exit(1);
}
console.log(`\nType check passed for: ${targets.join(", ")}`);
