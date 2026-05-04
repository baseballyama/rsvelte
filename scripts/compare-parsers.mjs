#!/usr/bin/env node

/**
 * Compare the output of the Rust parser with the official Svelte parser.
 *
 * Usage:
 *   node scripts/compare-parsers.mjs <input.svelte>
 *
 * Prerequisites:
 *   - Build the Rust parser: cargo build --release
 *   - Have the Svelte submodule initialized
 */

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";
import { tmpdir } from "os";
import { parse } from "../submodules/svelte/packages/svelte/src/compiler/index.js";

const args = process.argv.slice(2);
const inputFile = args[0];

if (!inputFile) {
  console.error("Usage: node scripts/compare-parsers.mjs <input.svelte>");
  process.exit(1);
}

// Parse with Svelte
console.log("Parsing with Svelte...");
const source = readFileSync(inputFile, "utf-8");

let svelteAst;
try {
  svelteAst = parse(source, { modern: true });
} catch (error) {
  console.error("Svelte parse error:", error.message);
  process.exit(1);
}

// Clean metadata for comparison
const cleanSvelteAst = JSON.parse(
  JSON.stringify(svelteAst, (key, value) => {
    if (key === "metadata") return undefined;
    return value;
  })
);

// Parse with Rust
console.log("Parsing with Rust...");
let rustAst;
try {
  const rustOutput = execSync(
    `cargo run --release -- "${inputFile}"`,
    { encoding: "utf-8", cwd: process.cwd() }
  );
  rustAst = JSON.parse(rustOutput);
} catch (error) {
  console.error("Rust parse error:", error.message);
  process.exit(1);
}

// Compare
const svelteJson = JSON.stringify(cleanSvelteAst, null, 2);
const rustJson = JSON.stringify(rustAst, null, 2);

if (svelteJson === rustJson) {
  console.log("\n✅ ASTs match!");
} else {
  console.log("\n❌ ASTs differ!");

  // Write both outputs for comparison
  const tempDir = mkdtempSync(join(tmpdir(), "svelte-compare-"));
  const sveltePath = join(tempDir, "svelte.json");
  const rustPath = join(tempDir, "rust.json");

  writeFileSync(sveltePath, svelteJson);
  writeFileSync(rustPath, rustJson);

  console.log(`\nSvelte output: ${sveltePath}`);
  console.log(`Rust output: ${rustPath}`);
  console.log(`\nCompare with: diff ${sveltePath} ${rustPath}`);
}
