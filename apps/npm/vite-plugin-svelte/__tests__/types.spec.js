import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
const read = (/** @type {string} */ rel) => readFileSync(path.join(pkgDir, rel), 'utf8');

/** @param {string} specifier */
function packageName(specifier) {
	const parts = specifier.split('/');
	return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

describe('published types', () => {
	const entry = pkg.exports['.'].types;

	it('point `types` and the `types` export condition at the same entry', () => {
		expect(path.normalize(pkg.types)).toBe(path.normalize(entry));
		expect(Object.keys(pkg.exports['.'])[0]).toBe('types');
	});

	// dts-buddy wraps the declarations in `declare module '<name>'`, which only
	// resolves under that exact name; installed under the upstream name through an
	// override alias, an entry without a top-level export is "not a module" (TS2306).
	it('expose a module entry that re-exports the named declarations', () => {
		const source = read(entry);
		const generated = read('types/index.d.ts');
		expect(generated).toContain(`declare module '${pkg.name}'`);
		expect(source).toMatch(/^\/\/\/ <reference path="\.\/index\.d\.ts" \/>$/m);
		expect(source).toMatch(new RegExp(`^export \\* from '${pkg.name.replace('/', '\\/')}';$`, 'm'));
	});

	it('import only packages a consumer installs with the plugin', () => {
		const installed = new Set([
			pkg.name,
			...Object.keys(pkg.dependencies ?? {}),
			...Object.keys(pkg.peerDependencies ?? {})
		]);
		const files = readdirSync(path.join(pkgDir, 'types')).filter((f) => f.endsWith('.d.ts'));
		expect(files.length).toBeGreaterThan(0);
		const missing = [];
		for (const file of files) {
			const source = read(`types/${file}`);
			for (const m of source.matchAll(/(?:from\s+|import\s*\(\s*)['"]([^'"]+)['"]/g)) {
				const specifier = m[1];
				if (specifier.startsWith('.')) continue;
				if (!installed.has(packageName(specifier))) missing.push(`${file}: ${specifier}`);
			}
		}
		expect(missing).toEqual([]);
	});

	it('are included in the published files', () => {
		expect(pkg.files).toContain('types');
	});
});
