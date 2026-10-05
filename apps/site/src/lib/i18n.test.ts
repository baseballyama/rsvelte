// The properties proved in docs/site-i18n.md, checked on the real functions.
import { describe, expect, it } from 'vitest';
import { reroute } from '../hooks';
import { langOf, langs, localizedPath, pathWithoutLang, switchHref } from './i18n';
import { appendixIn, chapter, chapterByHref, chaptersIn } from './site';
import { chapterPositions } from './kernel/kernel-overview';

const shared = ['/', '/why', '/guide', '/learn', '/learn/kernel', '/learn/kernel/buffer-pool', '/learn/playground/doc', '/enx'];

describe('language paths', () => {
	it('decides the language at the /en boundary', () => {
		expect(['/en', '/en/', '/en/why'].map(langOf)).toEqual(['en', 'en', 'en']);
		expect(['/', '/enx', '/english', '/why', ''].map(langOf)).toEqual(['ja', 'ja', 'ja', 'ja', 'ja']);
		expect(['/en', '/en/', '/en/why'].map(pathWithoutLang)).toEqual(['/', '/', '/why']);
	});

	it('comes back to the shared path in each language', () => {
		for (const path of shared) {
			for (const lang of langs) {
				const localized = localizedPath(path, lang);
				expect(langOf(localized)).toBe(lang);
				expect(pathWithoutLang(localized)).toBe(path);
			}
		}
		expect(localizedPath('/', 'en')).toBe('/en');
		expect(localizedPath('/learn', 'en')).toBe('/en/learn');
	});

	it('keeps a hash or a query after the path', () => {
		for (const path of shared) {
			for (const suffix of ['#overview', '?x=1']) {
				expect(localizedPath(path + suffix, 'en')).toBe(localizedPath(path, 'en') + suffix);
			}
		}
	});

	it('resolves both paths of a page to the same route', () => {
		for (const path of shared) {
			expect(reroute({ url: new URL(`https://site${localizedPath(path, 'en')}`) } as Parameters<typeof reroute>[0])).toBe(path);
			expect(reroute({ url: new URL(`https://site${path}`) } as Parameters<typeof reroute>[0])).toBeUndefined();
		}
	});

	it('switches to the same page, query and hash in the other language', () => {
		expect(switchHref({ pathname: '/learn/kernel', search: '?a=1', hash: '#overview' }, 'en')).toBe('/en/learn/kernel?a=1#overview');
		expect(switchHref({ pathname: '/en/learn/kernel', search: '', hash: '#overview' }, 'ja')).toBe('/learn/kernel#overview');
		expect(switchHref({ pathname: '/en', search: '', hash: '#state=abc' }, 'ja')).toBe('/#state=abc');
		expect(switchHref({ pathname: '/', search: '', hash: '' }, 'en')).toBe('/en');
	});
});

describe('chapters in two languages', () => {
	it('keep slugs, numbers and section ids, and localize text and links', () => {
		const ja = chaptersIn('ja');
		const en = chaptersIn('en');
		expect(en.map((c) => c.slug)).toEqual(ja.map((c) => c.slug));
		expect(en.map((c) => c.number)).toEqual(ja.map((c) => c.number));
		expect(en.map((c) => c.sections.map((s) => s.id))).toEqual(ja.map((c) => c.sections.map((s) => s.id)));
		expect(en.map((c) => c.href)).toEqual(ja.map((c) => localizedPath(c.href, 'en')));
		expect(appendixIn('en').map((a) => a.href)).toEqual(appendixIn('ja').map((a) => localizedPath(a.href, 'en')));
		for (const c of en) expect(c.title).not.toBe(ja.find((x) => x.slug === c.slug)!.title);
	});

	it('find the chapter of a path in the language of that path', () => {
		for (const lang of langs) {
			for (const c of chaptersIn(lang)) {
				expect(chapterByHref(c.href)).toBe(c);
				expect(chapterByHref(`${c.href}/`)).toBe(c);
				expect(chapter(c.slug, lang)).toBe(c);
			}
		}
		expect(chapterByHref('/en/learn/kernel')!.sections[0].title).toBe(chapter('kernel', 'en').sections[0].title);
	});

	it('have a position marker for the same chapters in both languages', () => {
		const ja = chaptersIn('ja');
		const marked = ja.filter((c) => (chapterPositions[c.href] ?? []).length > 0);
		expect(marked.length).toBeGreaterThan(0);
		for (const c of chaptersIn('en')) {
			expect(chapterPositions[pathWithoutLang(c.href)]).toEqual(chapterPositions[ja.find((x) => x.slug === c.slug)!.href]);
		}
	});
});
