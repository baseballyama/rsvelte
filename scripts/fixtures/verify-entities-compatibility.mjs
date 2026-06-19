#!/usr/bin/env node

/**
 * Script to verify that the generated Rust entities match Svelte's entities.js
 */

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load Svelte's entities.js
const entitiesPath = join(
  __dirname,
  "../../submodules/svelte/packages/svelte/src/compiler/phases/1-parse/utils/entities.js",
);
const entitiesModule = await import(entitiesPath);
const svelteEntities = entitiesModule.default;

// Load generated Rust file
const rustPath = join(__dirname, "../../src/compiler/phases/1_parse/utils/entities_data.rs");
const rustCode = readFileSync(rustPath, "utf-8");

// Parse Rust entities
const rustEntities = new Map();
const entityRegex = /\("([^"]+)",\s*&\[([^\]]+)\]\)/g;
let match;
while ((match = entityRegex.exec(rustCode)) !== null) {
  const name = match[1];
  const codepoints = match[2].split(",").map((s) => parseInt(s.trim()));
  rustEntities.set(name, codepoints);
}

// Build expected entities from Svelte (deduplicated)
const expectedEntities = new Map();
for (const [name, codepoint] of Object.entries(svelteEntities)) {
  // Remove & prefix if present
  const cleanName = name.startsWith("&") ? name.slice(1) : name;
  // Remove ; suffix if present
  const finalName = cleanName.endsWith(";") ? cleanName.slice(0, -1) : cleanName;

  // Convert single codepoint to array for consistency
  const codepoints = Array.isArray(codepoint) ? codepoint : [codepoint];

  // Prefer semicolon version if both exist
  if (!expectedEntities.has(finalName) || cleanName.endsWith(";")) {
    expectedEntities.set(finalName, codepoints);
  }
}

// Verify counts
console.log(`Svelte entities (deduplicated): ${expectedEntities.size}`);
console.log(`Rust entities: ${rustEntities.size}`);

if (expectedEntities.size !== rustEntities.size) {
  console.error(`❌ Entity count mismatch!`);
  process.exit(1);
}

// Verify each entity
let errors = 0;
let checked = 0;

for (const [name, expectedCodepoints] of expectedEntities.entries()) {
  checked++;
  const rustCodepoints = rustEntities.get(name);

  if (!rustCodepoints) {
    console.error(`❌ Missing entity in Rust: ${name}`);
    errors++;
    continue;
  }

  // Compare codepoints
  if (rustCodepoints.length !== expectedCodepoints.length) {
    console.error(
      `❌ Codepoint count mismatch for ${name}: expected ${expectedCodepoints.length}, got ${rustCodepoints.length}`,
    );
    errors++;
    continue;
  }

  for (let i = 0; i < expectedCodepoints.length; i++) {
    if (rustCodepoints[i] !== expectedCodepoints[i]) {
      console.error(
        `❌ Codepoint mismatch for ${name}[${i}]: expected ${expectedCodepoints[i]}, got ${rustCodepoints[i]}`,
      );
      errors++;
      break;
    }
  }
}

// Check for extra entities in Rust
for (const name of rustEntities.keys()) {
  if (!expectedEntities.has(name)) {
    console.error(`❌ Extra entity in Rust: ${name}`);
    errors++;
  }
}

console.log(`\nChecked ${checked} entities`);

if (errors === 0) {
  console.log("✅ All entities match perfectly!");
  process.exit(0);
} else {
  console.error(`\n❌ Found ${errors} error(s)`);
  process.exit(1);
}
