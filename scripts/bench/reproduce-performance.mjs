#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const env = {
  ...process.env,
  REPORT_WARMUPS: process.env.REPORT_WARMUPS ?? "1",
  REPORT_RUNS: process.env.REPORT_RUNS ?? "5",
};

function run(command, args, options = {}) {
  console.error(`\n[reproduce] ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd: root,
    env,
    stdio: "inherit",
    ...options,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const requiredSubmodules = [
  "submodules/svelte/package.json",
  "submodules/language-tools/package.json",
];
const missingSubmodule = requiredSubmodules.find((path) => !existsSync(join(root, path)));
if (missingSubmodule) {
  throw new Error(
    `${missingSubmodule} is missing; initialize the checkout with git submodule update --init --recursive`,
  );
}
if (!existsSync(join(root, "node_modules"))) {
  throw new Error("Root dependencies are missing; run pnpm install --frozen-lockfile first");
}

run(pnpm, ["run", "corpus:collect"]);
run(pnpm, ["run", "report:competitors:install"]);
run("cargo", ["build", "--release", "--bin", "ast_equiv_batch"]);

if (!existsSync(join(root, "submodules/svelte/packages/svelte/compiler/index.js"))) {
  run(pnpm, ["--dir", "submodules/svelte", "install", "--frozen-lockfile"]);
  run(pnpm, ["--dir", "submodules/svelte", "build"]);
}

run(process.execPath, ["scripts/reports/run-performance.mjs"]);
console.error("\n[reproduce] wrote apps/playground/static/performance-report.json");
