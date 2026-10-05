// The English page tells the same facts as the Japanese page: the same numbers, commit ids, expressions and
// excerpts in the markup. A difference is allowed only with an entry in fact-exceptions.json.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import exceptions from './fact-exceptions.json';
import { facts, type Fact } from './facts';

const routes = path.resolve(import.meta.dirname);
const pages = readdirSync(routes, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('page.ja.svelte')).map((f) => path.dirname(f).replace(/^\.$/, ''));

/** Facts in `a` that `b` does not have, counted with multiplicity. */
function minus(a: Fact[], b: Fact[]): string[] {
	const left = [...b];
	return a.filter((fact) => {
		const i = left.indexOf(fact);
		if (i < 0) return true;
		left.splice(i, 1);
		return false;
	}).sort();
}

function difference(ja: string, en: string) {
	const [j, e] = [facts(ja), facts(en)];
	return { ja: minus(j, e), en: minus(e, j), count: j.length };
}

describe('facts', () => {
	it('finds numbers, commit ids, expressions and excerpts in the markup only', () => {
		const found = facts("<script>const x = 99;</script><p class=\"w-[4.5rem]\">2 files in a5822ee26f, 4,000 bytes of UTF-8</p><Code item={data.code.span} /><p>{n} {#if ready}ok{/if}</p><style>p { margin: 7px; }</style>");
		expect(found.sort()).toEqual(['commit:a5822ee26f', 'excerpt:span', 'expression:data.code.span', 'expression:n', 'expression:ready', 'number:2', 'number:4000'].sort());
		expect(facts("<p>{label('P1', '日本語')}</p>")).toEqual(facts("<p>{label('P1', 'English')}</p>"));
	});

	// Positive control: one changed number or one changed expression is a difference.
	it('reports a changed number or expression', () => {
		expect(difference('<p>13 runs</p>', '<p>14 runs</p>')).toMatchObject({ ja: ['number:13'], en: ['number:14'] });
		expect(difference('<p>{a.length}</p>', '<p>{b.length}</p>')).toMatchObject({ ja: ['expression:a.length'], en: ['expression:b.length'] });
		expect(difference('<p>ユニコードの16ビット符号化方式</p>', '<p>UTF-16</p>')).toMatchObject({ ja: [], en: [] });
	});

	const used = new Set<number>();
	let compared = 0;
	for (const route of pages) {
		it(`are the same in both languages: ${route || '/'}`, () => {
			const read = (lang: string) => readFileSync(path.join(routes, route, `page.${lang}.svelte`), 'utf8');
			const diff = difference(read('ja'), read('en'));
			compared += diff.count;
			const allowed = exceptions.flatMap((entry, i) => (entry.route === route ? [{ ...entry, i }] : []));
			for (const entry of allowed) used.add(entry.i);
			expect(diff.ja, 'only in Japanese').toEqual(allowed.flatMap((entry) => entry.ja).sort());
			expect(diff.en, 'only in English').toEqual(allowed.flatMap((entry) => entry.en).sort());
		});
	}

	it('compares facts on every page and uses every exception', () => {
		expect(pages.length).toBeGreaterThan(0);
		expect(compared).toBeGreaterThan(0);
		for (const [i, entry] of exceptions.entries()) {
			expect(entry.reason, `exception ${i}`).toBeTruthy();
			expect(used.has(i), `exception ${i} names a route without both files: ${entry.route}`).toBe(true);
		}
	});
});
