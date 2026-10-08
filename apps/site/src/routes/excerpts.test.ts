// Every excerpt a page quotes must exist, and every `mark` must hit a line of it. The page would
// throw at request time otherwise; this finds it before a deploy.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseRustModule, type RustItem } from '$lib/build/rust-items.ts';
import { CRATES, sources } from '$lib/build/sources.ts';
import { langs, type Lang } from '$lib/i18n';

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
// Each route has one page file per language; the wrapper `+page.svelte` only picks one.
const pages = readdirSync(routes, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('page.ja.svelte')).map((f) => path.dirname(f));

/** Each `data.code.X ... mark={[...]}` in a page file: the excerpt key and the strings it must contain. */
function marks(svelte: string): { name: string; needles: string[] }[] {
	// The list is read as quoted strings, so a `]` inside a needle does not end it.
	return [...svelte.matchAll(/data\.code\.(\w+)\}\s*mark=\{\[((?:\s*'(?:[^'\\]|\\.)*'\s*,?)*)\s*\]\}/g)].map((m) => ({
		name: m[1],
		needles: [...m[2].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((s) => s[1].replace(/\\'/g, "'"))
	}));
}

const checked: Record<Lang, number> = { ja: 0, en: 0 };
// Pages whose server loads crate excerpts (every one is checked for data.code), and the subset with mark checks.
const codePages: string[] = [];
const markedPages: Record<Lang, string[]> = { ja: [], en: [] };

describe('excerpts', () => {
	for (const dir of pages) {
		let server = '';
		try {
			server = readFileSync(path.join(routes, dir, '+page.server.ts'), 'utf8');
		} catch {
			continue;
		}
		const keys = new Map(
			[...server.matchAll(new RegExp(`(\\w+): '((?:${crateKeys})\\/[^']+)'`, 'g'))].map((m) => [m[1], m[2]])
		);
		if (keys.size === 0) continue;
		const files = Object.fromEntries(langs.map((lang) => [lang, readFileSync(path.join(routes, dir, `page.${lang}.svelte`), 'utf8')])) as Record<Lang, string>;
		codePages.push(dir || '/');
		for (const lang of langs) {
			checked[lang] += marks(files[lang]).length;
			if (marks(files[lang]).length > 0) markedPages[lang].push(dir || '/');
		}
		it(dir || '/', () => {
			const missing = [...keys].filter(([, key]) => item(key) === undefined).map(([name, key]) => `${name}: ${key}`);
			expect(missing.join(', ')).toBe('');
			for (const lang of langs) {
				for (const { name, needles } of marks(files[lang])) {
					const key = keys.get(name);
					expect(key, `${lang}: data.code.${name} is not loaded`).toBeDefined();
					const code = item(key!)!.code;
					for (const needle of needles) expect(code.includes(needle), `${lang} ${key}: mark ${JSON.stringify(needle)}`).toBe(true);
				}
				const used = [...files[lang].matchAll(/data\.code\.(\w+)/g)];
				expect(used.length, `${lang}: the page loads excerpts but shows none`).toBeGreaterThan(0);
				for (const m of used) expect(keys.has(m[1]), `${lang}: data.code.${m[1]}`).toBe(true);
			}
			expect(marks(files.en).length, 'the same marks in both languages').toBe(marks(files.ja).length);
		});
	}

	// A page file that is not read checks nothing and passes; this keeps the gate from going empty.
	it('checks marks in every language', () => {
		for (const lang of langs) expect(checked[lang], lang).toBeGreaterThan(0);
		expect(checked.en).toBe(checked.ja);
		// The mark domain is the pages with marks, not every page with excerpts (some quote code without marks).
		expect(markedPages.en).toEqual(markedPages.ja);
		expect(markedPages.ja.length).toBeGreaterThan(0);
		expect(codePages.length).toBeGreaterThanOrEqual(markedPages.ja.length);
		// The counts at the base tree (43eed05). Adding the English pages must not change the Japanese side; change
		// these only with a commit that adds or removes excerpts on purpose.
		expect([codePages.length, markedPages.ja.length, checked.ja]).toEqual([15, 13, 42]);
	});
});
