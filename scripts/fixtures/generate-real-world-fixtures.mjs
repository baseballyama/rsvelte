#!/usr/bin/env node
/**
 * Generates real-world fixture tests from immich and gradio repositories.
 *
 * Each fixture consists of 5 files:
 *   - input.svelte         — The original Svelte source
 *   - options.json          — Compiler options used
 *   - expected_ast.json     — Parsed AST from the official Svelte compiler
 *   - expected_client.js    — Client-side JS output from the official Svelte compiler
 *   - expected_server.js    — Server-side JS output from the official Svelte compiler
 *
 * Usage:
 *   node scripts/fixtures/generate-real-world-fixtures.mjs
 */

import { compile, parse } from "../../submodules/svelte/packages/svelte/src/compiler/index.js";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "../..");
const FIXTURES_DIR = join(PROJECT_ROOT, "tests", "real_world", "fixtures");

// Base paths for real-world repos
const IMMICH_BASE = "/workspace/.real-world-tests/immich/web/src/lib/components";
const GRADIO_BASE = "/workspace/.real-world-tests/gradio/js";

/**
 * Fixture definitions organized by bug category.
 *
 * Each entry has:
 *   - name: unique fixture directory name
 *   - source: path to the .svelte file (absolute)
 *   - category: bug category for documentation
 *   - runes: whether to force runes mode (undefined = auto-detect)
 */
const FIXTURES = [
  // =========================================================================
  // Store subscriptions — files using $t(), $store patterns
  // (tests for the double-call bug)
  // =========================================================================
  {
    name: "immich-shared-link-expiration",
    source: `${IMMICH_BASE}/SharedLinkExpiration.svelte`,
    category: "store-subscriptions",
  },
  {
    name: "immich-shared-link-form-fields",
    source: `${IMMICH_BASE}/SharedLinkFormFields.svelte`,
    category: "store-subscriptions",
  },
  {
    name: "immich-utilities-menu",
    source: `${IMMICH_BASE}/utilities-page/utilities-menu.svelte`,
    category: "store-subscriptions",
  },
  {
    name: "immich-album-map",
    source: `${IMMICH_BASE}/album-page/album-map.svelte`,
    category: "store-subscriptions",
  },
  {
    name: "immich-album-shared-link",
    source: `${IMMICH_BASE}/album-page/album-shared-link.svelte`,
    category: "store-subscriptions",
  },

  // =========================================================================
  // Comments near props — files with eslint-disable / ts-ignore above export let
  // (tests for the comment leak bug)
  // =========================================================================
  {
    name: "immich-duplicates-compare-control",
    source: `${IMMICH_BASE}/utilities-page/duplicates/duplicates-compare-control.svelte`,
    category: "comments-near-props",
  },
  {
    name: "immich-albums-list",
    source: `${IMMICH_BASE}/album-page/albums-list.svelte`,
    category: "comments-near-props",
  },

  // =========================================================================
  // Complex props — files with $props() destructuring
  // (tests for $.get/$.set differences)
  // =========================================================================
  {
    name: "immich-sidebar",
    source: `${IMMICH_BASE}/sidebar/sidebar.svelte`,
    category: "complex-props",
  },
  {
    name: "immich-image-layer",
    source: `${IMMICH_BASE}/ImageLayer.svelte`,
    category: "complex-props",
  },
  {
    name: "immich-admin-card",
    source: `${IMMICH_BASE}/AdminCard.svelte`,
    category: "complex-props",
  },
  {
    name: "immich-on-events",
    source: `${IMMICH_BASE}/OnEvents.svelte`,
    category: "complex-props",
  },
  {
    name: "immich-queue-card",
    source: `${IMMICH_BASE}/QueueCard.svelte`,
    category: "complex-props",
  },
  {
    name: "gradio-dropdown-index",
    source: `${GRADIO_BASE}/dropdown/Index.svelte`,
    category: "complex-props",
  },
  {
    name: "gradio-statustracker-toast",
    source: `${GRADIO_BASE}/statustracker/static/Toast.svelte`,
    category: "complex-props",
  },

  // =========================================================================
  // Legacy mode — files without runes using export let
  // (tests for legacy reactivity handling)
  // =========================================================================
  {
    name: "gradio-tabs",
    source: `${GRADIO_BASE}/tabs/shared/Tabs.svelte`,
    category: "legacy-mode",
  },
  {
    name: "gradio-tooltip",
    source: `${GRADIO_BASE}/tooltip/src/Tooltip.svelte`,
    category: "legacy-mode",
  },
  {
    name: "gradio-block",
    source: `${GRADIO_BASE}/atoms/src/Block.svelte`,
    category: "legacy-mode",
  },
  {
    name: "gradio-block-label",
    source: `${GRADIO_BASE}/atoms/src/BlockLabel.svelte`,
    category: "legacy-mode",
  },
  {
    name: "gradio-download-link",
    source: `${GRADIO_BASE}/atoms/src/DownloadLink.svelte`,
    category: "legacy-mode",
  },
  {
    name: "gradio-share-button",
    source: `${GRADIO_BASE}/atoms/src/ShareButton.svelte`,
    category: "legacy-mode",
  },
  {
    name: "gradio-volume-control",
    source: `${GRADIO_BASE}/video/shared/VolumeControl.svelte`,
    category: "legacy-mode",
  },

  // =========================================================================
  // Template expressions — complex template logic
  // (tests for HTML template generation differences)
  // =========================================================================
  {
    name: "immich-queue-graph",
    source: `${IMMICH_BASE}/QueueGraph.svelte`,
    category: "template-expressions",
  },
  {
    name: "immich-queue-panel",
    source: `${IMMICH_BASE}/QueuePanel.svelte`,
    category: "template-expressions",
  },
  {
    name: "immich-photo-viewer",
    source: `${IMMICH_BASE}/asset-viewer/photo-viewer.svelte`,
    category: "template-expressions",
  },
  {
    name: "immich-album-card",
    source: `${IMMICH_BASE}/album-page/album-card.svelte`,
    category: "template-expressions",
  },
  {
    name: "gradio-sidebar",
    source: `${GRADIO_BASE}/sidebar/shared/Sidebar.svelte`,
    category: "template-expressions",
  },
  {
    name: "gradio-editable-cell",
    source: `${GRADIO_BASE}/dataframe/shared/EditableCell.svelte`,
    category: "template-expressions",
  },

  // =========================================================================
  // Simple components — should produce exact matches
  // (baseline / sanity checks)
  // =========================================================================
  {
    name: "immich-loading-dots",
    source: `${IMMICH_BASE}/LoadingDots.svelte`,
    category: "simple",
  },
  {
    name: "immich-link-to-docs",
    source: `${IMMICH_BASE}/LinkToDocs.svelte`,
    category: "simple",
  },
  {
    name: "immich-alpha-background",
    source: `${IMMICH_BASE}/AlphaBackground.svelte`,
    category: "simple",
  },
  {
    name: "immich-delayed-loading-spinner",
    source: `${IMMICH_BASE}/DelayedLoadingSpinner.svelte`,
    category: "simple",
  },
  {
    name: "gradio-empty",
    source: `${GRADIO_BASE}/atoms/src/Empty.svelte`,
    category: "simple",
  },
  {
    name: "gradio-block-title",
    source: `${GRADIO_BASE}/atoms/src/BlockTitle.svelte`,
    category: "simple",
  },
];

/**
 * Compile a Svelte source file with the official compiler.
 */
function compileSource(source, filename, generate) {
  return compile(source, {
    filename,
    generate,
    css: "external",
    dev: false,
  });
}

/**
 * Parse a Svelte source file with the official compiler.
 */
function parseSource(source, filename) {
  return parse(source, { filename, modern: true });
}

/**
 * Generate fixtures for a single entry.
 */
function generateFixture(fixture) {
  const { name, source: sourcePath, category } = fixture;

  // Read source file
  if (!existsSync(sourcePath)) {
    console.error(`  SKIP: ${name} — source file not found: ${sourcePath}`);
    return false;
  }

  const sourceCode = readFileSync(sourcePath, "utf-8");

  // Create fixture directory
  const fixtureDir = join(FIXTURES_DIR, name);
  mkdirSync(fixtureDir, { recursive: true });

  // Write input.svelte
  writeFileSync(join(fixtureDir, "input.svelte"), sourceCode);

  // Write options.json
  const options = {
    filename: "input.svelte",
    css: "external",
    dev: false,
    category,
  };
  writeFileSync(join(fixtureDir, "options.json"), JSON.stringify(options, null, 2) + "\n");

  // Generate AST
  try {
    const ast = parseSource(sourceCode, "input.svelte");
    writeFileSync(join(fixtureDir, "expected_ast.json"), JSON.stringify(ast, null, 2) + "\n");
  } catch (e) {
    console.error(`  WARN: ${name} — AST parse failed: ${e.message}`);
    writeFileSync(
      join(fixtureDir, "expected_ast.json"),
      JSON.stringify({ error: e.message }) + "\n",
    );
  }

  // Generate client JS
  try {
    const clientResult = compileSource(sourceCode, "input.svelte", "client");
    writeFileSync(join(fixtureDir, "expected_client.js"), clientResult.js.code);
  } catch (e) {
    console.error(`  WARN: ${name} — client compile failed: ${e.message}`);
    writeFileSync(join(fixtureDir, "expected_client.js"), `// COMPILE ERROR: ${e.message}\n`);
  }

  // Generate server JS
  try {
    const serverResult = compileSource(sourceCode, "input.svelte", "server");
    writeFileSync(join(fixtureDir, "expected_server.js"), serverResult.js.code);
  } catch (e) {
    console.error(`  WARN: ${name} — server compile failed: ${e.message}`);
    writeFileSync(join(fixtureDir, "expected_server.js"), `// COMPILE ERROR: ${e.message}\n`);
  }

  return true;
}

// ============================================================================
// Main
// ============================================================================

console.log("Generating real-world fixtures...");
console.log(`Output directory: ${FIXTURES_DIR}`);
console.log(`Total fixtures to generate: ${FIXTURES.length}`);
console.log("");

mkdirSync(FIXTURES_DIR, { recursive: true });

let generated = 0;
let skipped = 0;
const byCategory = {};

for (const fixture of FIXTURES) {
  process.stdout.write(`  Generating: ${fixture.name}...`);
  if (generateFixture(fixture)) {
    generated++;
    process.stdout.write(" OK\n");
  } else {
    skipped++;
    process.stdout.write(" SKIPPED\n");
  }

  // Track by category
  byCategory[fixture.category] = (byCategory[fixture.category] || 0) + 1;
}

console.log("");
console.log("=== Summary ===");
console.log(`Generated: ${generated}`);
console.log(`Skipped:   ${skipped}`);
console.log("");
console.log("By category:");
for (const [cat, count] of Object.entries(byCategory).sort()) {
  console.log(`  ${cat}: ${count}`);
}
console.log("");
console.log("Done!");
