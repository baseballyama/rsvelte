#!/usr/bin/env node

/**
 * Parse a Svelte file using the official Svelte compiler and output JSON.
 *
 * Usage:
 *   node scripts/diff/parse-with-svelte.mjs <input.svelte> [--modern]
 *
 * This script is used to generate expected output for comparison with the Rust parser.
 */

import { readFileSync, writeFileSync } from "fs";
import { parse } from "../../submodules/svelte/packages/svelte/src/compiler/index.js";

const args = process.argv.slice(2);
const modern = args.includes("--modern");
const inputFile = args.find((arg) => !arg.startsWith("--"));

if (!inputFile) {
  console.error("Usage: node scripts/diff/parse-with-svelte.mjs <input.svelte> [--modern]");
  process.exit(1);
}

try {
  const source = readFileSync(inputFile, "utf-8");
  const ast = parse(source, { modern });

  // Remove internal metadata fields for comparison
  const cleanAst = JSON.parse(
    JSON.stringify(ast, (key, value) => {
      if (key === "metadata") return undefined;
      return value;
    })
  );

  console.log(JSON.stringify(cleanAst, null, 2));
} catch (error) {
  console.error("Parse error:", error.message);
  process.exit(1);
}
