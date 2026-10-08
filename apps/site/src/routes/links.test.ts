// Links in the page files stay in their language and resolve (docs/site-i18n.md, LinkRules.dfy). The classifier
// checks in the order of `Classify`, so the kinds never overlap.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { langOf, langs, pathWithoutLang, type Lang } from '$lib/i18n';

const routes = path.resolve(import.meta.dirname);
const assets = new Set(readdirSync(path.resolve(routes, '../../static'), { recursive: true, encoding: 'utf8' }).map((f) => `/${f}`));
const pages = readdirSync(routes, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('page.ja.svelte')).map((f) => path.dirname(f).replace(/^\.$/, ''));
const routeOf = (dir: string) => (dir ? `/${dir}` : '/');
const read = (dir: string, lang: Lang) => readFileSync(path.join(routes, dir, `page.${lang}.svelte`), 'utf8');

type Kind = 'anchor' | 'external' | 'endpoint' | 'asset' | 'page';
function classify(href: string): Kind {
	if (href.startsWith('#')) return 'anchor';
	if (/^(https?:|mailto:)/.test(href)) return 'external';
	if (href.startsWith('/api/')) return 'endpoint';
	if (assets.has(href.split(/[?#]/)[0])) return 'asset';
	return 'page';
}

// Ids a link can target: static `id="..."` in the page file, including `<H2 id>`.
const ids = (source: string) => new Set([...source.matchAll(/\sid="([^"{}]+)"/g)].map((m) => m[1]));
const hrefs = (source: string) => [...source.matchAll(/\shref="([^"{}]+)"/g)].map((m) => m[1]);

describe('links in page files', () => {
	const counted: Record<Lang, number> = { ja: 0, en: 0 };
	for (const dir of pages) {
		for (const lang of langs) {
			it(`stay in ${lang} and resolve: ${routeOf(dir)}`, () => {
				const problems: string[] = [];
				for (const href of hrefs(read(dir, lang))) {
					if (classify(href) !== 'page') continue;
					counted[lang]++;
					const [pathname, hash] = href.split('#') as [string, string | undefined];
					if (langOf(pathname) !== lang) problems.push(`${href}: not a ${lang} path`);
					const target = pathWithoutLang(pathname.split('?')[0]).replace(/(.)\/$/, '$1');
					const targetDir = target.slice(1);
					if (!pages.includes(targetDir)) problems.push(`${href}: no route ${target}`);
					else if (hash && !ids(read(targetDir, lang)).has(hash)) problems.push(`${href}: no id ${hash} in ${target} (${lang})`);
				}
				expect(problems).toEqual([]);
			});
		}
	}

	it('checks links in both languages', () => {
		expect(counted.ja).toBeGreaterThan(0);
		expect(counted.en).toBe(counted.ja);
	});

	it('classifies links in one order', () => {
		expect(['#x', 'https://a.example', '/api/source/x', '/favicon.svg', '/learn'].map(classify)).toEqual(['anchor', 'external', 'endpoint', assets.has('/favicon.svg') ? 'asset' : 'page', 'page']);
	});
});
