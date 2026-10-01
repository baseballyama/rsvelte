// Every excerpt a page quotes must exist, and every `mark` must hit a line of it. The page would
// throw at request time otherwise; this finds it before a deploy.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseRustModule, type RustItem } from '$lib/build/rust-items.ts';
import { CRATES, sources } from '$lib/build/sources.ts';

const crates = path.resolve(import.meta.dirname, '../../../../crates');
const files = new Map(sources(crates).map((s) => [s.key, s.file]));

const items = new Map<string, RustItem>();
function item(key: string): RustItem | undefined {
	if (!items.has(key)) {
		const mod = key.slice(0, key.lastIndexOf('/'));
		const file = files.get(mod);
		if (!file) return undefined;
		for (const it of parseRustModule(mod, file, readFileSync(path.join(crates, file), 'utf8')).items) items.set(it.key, it);
	}
	return items.get(key);
}

const crateKeys = Object.values(CRATES).join('|');

const routes = path.resolve(import.meta.dirname);
const pages = readdirSync(routes, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('+page.svelte'));

describe('excerpts', () => {
	for (const page of pages) {
		const dir = path.dirname(path.join(routes, page));
		let server = '';
		try {
			server = readFileSync(path.join(dir, '+page.server.ts'), 'utf8');
		} catch {
			continue;
		}
		const keys = new Map(
			[...server.matchAll(new RegExp(`(\\w+): '((?:${crateKeys})\\/[^']+)'`, 'g'))].map((m) => [m[1], m[2]])
		);
		if (keys.size === 0) continue;
		it(page, () => {
			const missing = [...keys].filter(([, key]) => item(key) === undefined).map(([name, key]) => `${name}: ${key}`);
			expect(missing.join(", ")).toBe("");
			const svelte = readFileSync(path.join(routes, page), 'utf8');
			for (const m of svelte.matchAll(/data\.code\.(\w+)\}\s*mark=\{\[([^\]]*)\]\}/g)) {
				const key = keys.get(m[1]);
				expect(key, `data.code.${m[1]} is not loaded`).toBeDefined();
				const code = item(key!)!.code;
				for (const s of m[2].matchAll(/'((?:[^'\\]|\\.)*)'/g)) {
					const needle = s[1].replace(/\\'/g, "'");
					expect(code.includes(needle), `${key}: mark ${JSON.stringify(needle)}`).toBe(true);
				}
			}
			for (const m of svelte.matchAll(/data\.code\.(\w+)/g)) expect(keys.has(m[1]), `data.code.${m[1]}`).toBe(true);
		});
	}
});
