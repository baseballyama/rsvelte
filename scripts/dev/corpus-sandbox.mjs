/**
 * Shared scaffolding for the tests that run scripts/compat-corpus/verify.mjs
 * against a synthetic corpus in a throwaway directory.
 *
 * The sandbox lives outside the repo, so `parseable.mjs`'s bare `import 'acorn'`
 * has nothing to resolve against. Symlinking the resolved package (rather than
 * the repo's whole `node_modules`) keeps this working from a git worktree, which
 * has no `node_modules` of its own.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/** The directory of an installed package, found from its resolved main file. */
function packageDir(name) {
	let dir = path.dirname(require.resolve(name));
	for (let i = 0; i < 8; i++) {
		const pkg = path.join(dir, 'package.json');
		if (fs.existsSync(pkg) && JSON.parse(fs.readFileSync(pkg, 'utf8')).name === name) return dir;
		const up = path.dirname(dir);
		if (up === dir) break;
		dir = up;
	}
	throw new Error(`cannot locate the ${name} package directory (run pnpm install)`);
}

/** Give `sandbox` a `node_modules` holding just the packages verify.mjs imports. */
export function linkDependencies(sandbox, names = ['acorn']) {
	const nm = path.join(sandbox, 'node_modules');
	fs.mkdirSync(nm, { recursive: true });
	for (const name of names) {
		const link = path.join(nm, name);
		if (!fs.existsSync(link)) fs.symlinkSync(packageDir(name), link, 'dir');
	}
}
