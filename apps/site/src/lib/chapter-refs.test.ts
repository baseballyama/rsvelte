import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { chapters } from './site.ts';

// Prose names chapters by number ("（<a href="/learn/kernel/database">04</a>）", "13 実測"); inserting a
// chapter renumbers the rest, so every such number is checked against the table of contents.
const root = path.resolve(import.meta.dirname, '..');
const files = readdirSync(root, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.svelte'));
const byHref = new Map(chapters.map((c) => [c.href, c]));

describe('chapter numbers in prose', () => {
	it('match the table of contents', () => {
		const wrong: string[] = [];
		let checked = 0;
		for (const f of files) {
			const source = readFileSync(path.join(root, f), 'utf8');
			for (const m of source.matchAll(/href="(\/learn[^"#]*)[^"]*"[^>]*>\s*(\d\d)(?=[ <])/g)) {
				const c = byHref.get(m[1].replace(/\/$/, '') || '/learn');
				if (!c) continue;
				checked++;
				if (c.number !== m[2]) wrong.push(`${f}: ${m[1]} says ${m[2]}, is ${c.number}`);
			}
		}
		expect(wrong).toEqual([]);
		expect(checked).toBeGreaterThan(20);
	});
});
