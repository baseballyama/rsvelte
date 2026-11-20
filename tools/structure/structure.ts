// structure
//
// Checks every tracked file against its line limit in limits.json. The crate graph's rules are
// crates.test.ts, which `mise run structure` runs first.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { checkFiles, parseLimits, workingTreeFiles } from './check.ts';

const root = resolve(import.meta.dirname, '../..');
const limits = parseLimits(
	JSON.parse(readFileSync(resolve(root, 'tools/structure/limits.json'), 'utf8')),
);
const result = checkFiles(root, workingTreeFiles(root), limits);
console.log(
	`${result.measured} source files measured; maximum ${result.largest} lines; default limit ${limits.maxLines}`,
);
for (const failure of result.failures) console.error(failure);
if (result.failures.length > 0) process.exitCode = 1;
