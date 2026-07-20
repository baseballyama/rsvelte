#!/usr/bin/env node
// Generate `recommended.json` — an oxlint config fragment that turns on every
// rsvelte rule at its recommended severity — from the live rule catalog exposed
// by @rsvelte/compiler. Keeping it generated (rather than hand-maintained) means
// the fragment can never drift from the engine's actual rule set.
//
// Run via `pnpm --filter @rsvelte/oxlint-plugin run build` (needs the core wasm
// built: `pnpm run build:wasm:core`).

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { ruleCatalog } from '../src/engine.js';

const PLUGIN_NAME = 'svelte';

const rules = {};
for (const entry of ruleCatalog()) {
	if (entry.defaultSeverity === 'off') continue;
	rules[`${PLUGIN_NAME}/${entry.name}`] = entry.defaultSeverity === 'error' ? 'error' : 'warn';
}

// Deterministic ordering for stable diffs.
const sorted = Object.fromEntries(Object.keys(rules).sort().map((k) => [k, rules[k]]));

const config = {
	$schema:
		'https://raw.githubusercontent.com/oxc-project/oxc/main/npm/oxlint/configuration_schema.json',
	rules: sorted,
};

const out = fileURLToPath(new URL('../recommended.json', import.meta.url));
writeFileSync(out, JSON.stringify(config, null, 2) + '\n');
console.log(`Wrote ${Object.keys(sorted).length} rules to ${out}`);
