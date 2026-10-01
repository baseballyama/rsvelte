#!/usr/bin/env node
// run-all [--binary <binary>]
//
// Runs every rsvelte task over every fixture unit, the check tasks with the oracle's own TypeScript 7
// and packages, so `fixtures check` compares a complete run. `--binary` defaults to the release build.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import getExePath from '../node_modules/typescript-7/lib/getExePath.js';
import { FIXTURES, ROOT } from '../src/paths.ts';

const { values } = parseArgs({ options: { binary: { type: 'string', default: path.join(ROOT, 'target/release/rsvelte') } } });
const pkg = (name: string) => fs.realpathSync(path.join(import.meta.dirname, '../node_modules', name));
const families = fs.readdirSync(FIXTURES).filter((d) => !d.startsWith('_') && fs.statSync(path.join(FIXTURES, d)).isDirectory());
const args = ['fixtures', ...families.map((f) => path.join(FIXTURES, f)), '--tsc', getExePath(), '--svelte', pkg('svelte'), '--vue', pkg('vue'), '--tsconfig', path.join(FIXTURES, 'svelte/rsvelte/tsconfig.json')];
const r = spawnSync(values.binary, args, { stdio: 'inherit' });
process.exit(r.status ?? 1);
