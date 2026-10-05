// Every `<H2 id>` on a chapter page must be a section of that chapter in site.ts; the page throws at
// request time otherwise.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { langs, pathWithoutLang } from '$lib/i18n';
import { chaptersIn, moduleFile } from '$lib/site';

const chapters = chaptersIn('ja');

const routes = path.resolve(import.meta.dirname);

const ids = (file: string, pattern: RegExp) => [...readFileSync(file, 'utf8').matchAll(pattern)].map((m) => m[1]);

describe.each(langs)('chapter sections in %s', (lang) => {
	it.each(chaptersIn(lang).map((chapter) => [chapter.slug, chapter] as const))('%s lists every heading of its page, in order', (_, chapter) => {
		const file = path.join(routes, pathWithoutLang(chapter.href), `page.${lang}.svelte`);
		expect(ids(file, /<H2 id="([^"]+)"/g)).toEqual(chapter.sections.map((section) => section.id));
	});
});

describe('anchors', () => {
	const pages = readdirSync(routes, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('page.ja.svelte')).map((f) => path.dirname(f));
	it('exist for every route in both languages', () => {
		expect(pages.length).toBeGreaterThan(0);
	});
	it.each(pages)('%s has the same static ids in both languages', (dir) => {
		const [ja, en] = langs.map((lang) => new Set(ids(path.join(routes, dir, `page.${lang}.svelte`), /\sid="([^"{}]+)"/g)));
		expect([...en].sort()).toEqual([...ja].sort());
	});
});

describe('chapter source files', () => {
	const root = path.resolve(import.meta.dirname, '../../../..');
	it.each(chapters.filter((chapter) => chapter.module).map((chapter) => [chapter.slug, chapter.module!] as const))('%s names a file that exists', (_, module) => {
		expect(existsSync(path.join(root, moduleFile(module)))).toBe(true);
	});
});
