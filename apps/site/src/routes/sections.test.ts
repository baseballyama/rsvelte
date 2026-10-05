// Every `<H2 id>` on a chapter page must be a section of that chapter in site.ts; the page throws at
// request time otherwise.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { chaptersIn, moduleFile } from '$lib/site';

const chapters = chaptersIn('ja');

const routes = path.resolve(import.meta.dirname);

describe('chapter sections', () => {
	it.each(chapters.map((chapter) => [chapter.slug, chapter] as const))('%s lists every heading of its page, in order', (_, chapter) => {
		const file = path.join(routes, chapter.href, '+page.svelte');
		const ids = [...readFileSync(file, 'utf8').matchAll(/<H2 id="([^"]+)"/g)].map((m) => m[1]);
		expect(ids).toEqual(chapter.sections.map((section) => section.id));
	});
});

describe('chapter source files', () => {
	const root = path.resolve(import.meta.dirname, '../../../..');
	it.each(chapters.filter((chapter) => chapter.module).map((chapter) => [chapter.slug, chapter.module!] as const))('%s names a file that exists', (_, module) => {
		expect(existsSync(path.join(root, moduleFile(module)))).toBe(true);
	});
});
