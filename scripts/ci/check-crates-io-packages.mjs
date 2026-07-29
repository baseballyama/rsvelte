#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
const MINIMUM_MSRV = "1.95";
// Dependency order is also the only safe first-publication order.
const CRATES = [
  "rsvelte_esrap",
  "rsvelte_core",
  "rsvelte_projection",
  "rsvelte",
];
const FORBIDDEN_CORE_NORMAL_DEPENDENCIES = new Set([
  "chrono",
  "clap",
  "console_error_panic_hook",
  "js-sys",
  "mimalloc",
  "notify",
  "oxc_resolver",
  "pprof",
  "tikv-jemallocator",
  "walkdir",
  "wasm-bindgen",
]);

const errors = [];

function cargo(...args) {
  return execFileSync("cargo", args, {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
}

function fail(message) {
  errors.push(message);
}

function compareVersions(left, right) {
  const width = Math.max(left.split(".").length, right.split(".").length);
  const a = left.split(".").map(Number);
  const b = right.split(".").map(Number);
  for (let index = 0; index < width; index += 1) {
    const difference = (a[index] ?? 0) - (b[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

function requireString(pkg, field) {
  if (typeof pkg[field] !== "string" || pkg[field].trim() === "") {
    fail(`${pkg.name}: package.${field} must be a non-empty string`);
  }
}

function checkMetadata(pkg) {
  requireString(pkg, "description");
  requireString(pkg, "documentation");
  requireString(pkg, "homepage");
  requireString(pkg, "repository");
  requireString(pkg, "license");

  if (
    !pkg.rust_version ||
    compareVersions(pkg.rust_version, MINIMUM_MSRV) < 0
  ) {
    fail(
      `${pkg.name}: rust-version must be at least ${MINIMUM_MSRV} ` +
        `(the OXC 0.141 dependency graph requires Rust 1.95; found ${pkg.rust_version ?? "none"})`,
    );
  }

  const readmePath =
    typeof pkg.readme === "string"
      ? path.resolve(path.dirname(pkg.manifest_path), pkg.readme)
      : null;
  if (!readmePath || !existsSync(readmePath)) {
    fail(`${pkg.name}: package.readme must point to a crate-local README`);
  } else if (path.dirname(readmePath) !== path.dirname(pkg.manifest_path)) {
    fail(`${pkg.name}: README must live next to the crate manifest`);
  }

  if (!Array.isArray(pkg.categories) || pkg.categories.length === 0) {
    fail(`${pkg.name}: package.categories must not be empty`);
  }
  if (!Array.isArray(pkg.keywords) || pkg.keywords.length === 0) {
    fail(`${pkg.name}: package.keywords must not be empty`);
  }
  if (
    !Array.isArray(pkg.publish) ||
    pkg.publish.length !== 1 ||
    pkg.publish[0] !== "crates-io"
  ) {
    fail(
      `${pkg.name}: package.publish must be the explicit allowlist ["crates-io"]`,
    );
  }

  if (pkg.metadata?.docs?.rs?.["all-features"] !== true) {
    fail(`${pkg.name}: package.metadata.docs.rs.all-features must be true`);
  }
}

function checkLibraryPackage(pkg) {
  const defaultFeatures = pkg.features.default ?? [];
  if (defaultFeatures.length !== 0) {
    fail(
      `${pkg.name}: default feature set must be empty; found ${JSON.stringify(defaultFeatures)}`,
    );
  }

  const binaries = pkg.targets.filter((target) => target.kind.includes("bin"));
  if (binaries.length !== 0) {
    fail(
      `${pkg.name}: must not publish binary targets; found ${binaries.map((target) => target.name).join(", ")}`,
    );
  }
}

function checkCore(pkg) {
  const forbidden = pkg.dependencies
    .filter((dependency) => dependency.kind === null)
    .map((dependency) => dependency.name)
    .filter((name) => FORBIDDEN_CORE_NORMAL_DEPENDENCIES.has(name))
    .sort();
  if (forbidden.length !== 0) {
    fail(
      `rsvelte_core: host-policy/binding dependencies belong in dedicated crates, not normal dependencies: ` +
        forbidden.join(", "),
    );
  }
}

function checkExactInternalDependency(pkg, dependencyName) {
  const dependencyPackage = packages.get(dependencyName);
  const dependency = pkg.dependencies.find(
    (candidate) => candidate.kind === null && candidate.name === dependencyName,
  );
  if (!dependencyPackage) {
    fail(`${pkg.name}: internal dependency package ${dependencyName} is missing`);
  } else if (!dependency) {
    fail(
      `${pkg.name}: ${dependencyName} must be an explicit normal dependency`,
    );
  } else if (dependency.req !== `=${dependencyPackage.version}`) {
    fail(
      `${pkg.name}: ${dependencyName} must exactly match the workspace package ` +
        `version =${dependencyPackage.version}; found ${dependency.req}`,
    );
  }
}

function checkPackageFiles(pkg) {
  let entries;
  try {
    entries = cargo(
      "package",
      "--list",
      "--locked",
      "--allow-dirty",
      "-p",
      pkg.name,
    )
      .split(/\r?\n/)
      .filter(Boolean);
  } catch (error) {
    fail(`${pkg.name}: cargo package --list failed: ${error.message}`);
    return;
  }

  const unwanted = entries.filter(
    (entry) =>
      entry === "src/main.rs" ||
      entry.startsWith("src/bin/") ||
      entry.startsWith("benches/") ||
      entry.startsWith("examples/") ||
      entry.startsWith("tests/"),
  );
  if (unwanted.length !== 0) {
    fail(
      `${pkg.name}: published package contains non-library targets/test payload (${unwanted.length} files): ` +
        `${unwanted.slice(0, 8).join(", ")}${unwanted.length > 8 ? ", …" : ""}`,
    );
  }

  if (!entries.includes("README.md")) {
    fail(`${pkg.name}: published package must contain README.md`);
  }
  if (!entries.includes("LICENSE")) {
    fail(
      `${pkg.name}: published package must contain the MIT license text as LICENSE`,
    );
  }
}

let metadata;
try {
  metadata = JSON.parse(
    cargo("metadata", "--format-version", "1", "--no-deps"),
  );
} catch (error) {
  console.error(`Unable to read cargo metadata: ${error.message}`);
  process.exit(1);
}

const packages = new Map(metadata.packages.map((pkg) => [pkg.name, pkg]));
for (const name of CRATES) {
  const pkg = packages.get(name);
  if (!pkg) {
    fail(`${name}: package is missing from the workspace`);
    continue;
  }
  checkMetadata(pkg);
  checkLibraryPackage(pkg);
  checkPackageFiles(pkg);
}

const core = packages.get("rsvelte_core");
if (core) checkCore(core);
if (core) checkExactInternalDependency(core, "rsvelte_esrap");

const projection = packages.get("rsvelte_projection");
if (projection) checkExactInternalDependency(projection, "rsvelte_core");

const facade = packages.get("rsvelte");
if (facade) checkExactInternalDependency(facade, "rsvelte_core");
if (facade) checkExactInternalDependency(facade, "rsvelte_projection");

if (errors.length !== 0) {
  console.error("crates.io package policy failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`crates.io package policy passed for ${CRATES.join(", ")}.`);
