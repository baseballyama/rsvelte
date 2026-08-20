#!/usr/bin/env node
/**
 * Print the submodule path of every corpus source, space-separated, so CI steps
 * derive the list from `corpus-sources.json` instead of restating it — the
 * corpus is 100+ repositories and a hand-maintained copy drifts silently.
 *
 * Usage: git submodule update --init --depth 1 $(node scripts/compat-corpus/submodule-paths.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sources = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus-sources.json'), 'utf8'));

process.stdout.write(
	sources
		.map((s) => s.path)
		.filter((p) => p.startsWith('submodules/'))
		.join(' ')
);
