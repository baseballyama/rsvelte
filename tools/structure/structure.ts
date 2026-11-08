// structure
//
// Checks every tracked file against its line limit in limits.json. The crate graph's rules are
// crates.test.ts, which `mise run structure` runs first.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { checkFiles, parseLimits } from './check.ts';

const root = resolve(import.meta.dirname, '../..');
const limits = parseLimits(
	JSON.parse(readFileSync(resolve(root, 'tools/structure/limits.json'), 'utf8')),
);
// Crate fixtures list tens of thousands of paths, past the default 1 MiB output limit.
const git = { cwd: root, encoding: 'utf8', maxBuffer: Infinity } as const;
const checked = ['crates', 'examples', 'tools', 'apps'];
const files = execFileSync(
	'git',
	['ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', ...checked],
	git,
)
	.split('\0')
	.filter(Boolean);
const deleted = new Set(
	execFileSync('git', ['ls-files', '-z', '--deleted', '--', ...checked], git)
		.split('\0')
		.filter(Boolean),
);
const result = checkFiles(
	root,
	files.filter((file) => !deleted.has(file)),
	limits,
);
console.log(
	`${result.measured} source files measured; maximum ${result.largest} lines; default limit ${limits.maxLines}`,
);
for (const failure of result.failures) console.error(failure);
if (result.failures.length > 0) process.exitCode = 1;
