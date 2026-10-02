#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { checkFiles, parseLimits } from '../src/check.ts';

const root = resolve(import.meta.dirname, '../../..');
const limits = parseLimits(JSON.parse(readFileSync(resolve(root, 'tools/structure/limits.json'), 'utf8')));
const files = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard',
	'--', 'crates', 'tools', 'apps'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
const deleted = new Set(execFileSync('git', ['ls-files', '-z', '--deleted', '--', 'crates', 'tools', 'apps'],
	{ cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean));
const result = checkFiles(root, files.filter(file => !deleted.has(file)), limits);
console.log(`${result.measured} source files measured; maximum ${result.largest} lines; default limit ${limits.maxLines}`);
for (const failure of result.failures) console.error(failure);
if (result.failures.length > 0) process.exitCode = 1;
