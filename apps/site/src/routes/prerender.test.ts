// The proof in docs/site-i18n.md (Prerendering.dfy) assumes the prerendered routes are exactly `/` and `/why`, and
// `/en` + each of them is a prerender entry. A third prerendered route would be served in Japanese at its English
// path, and every other check would still pass.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import config from '../../svelte.config.js';
import { localizedPath } from '$lib/i18n';

const routes = path.resolve(import.meta.dirname);
const settings = readdirSync(routes, { recursive: true, encoding: 'utf8' })
	.filter((file) => /(^|\/)\+(page|layout)(\.server)?\.(ts|js)$/.test(file))
	.flatMap((file) => {
		const value = /export const prerender\s*=\s*([^;\n]+)/.exec(readFileSync(path.join(routes, file), 'utf8'))?.[1].trim();
		return value === undefined ? [] : [{ file, value, route: `/${path.dirname(file)}`.replace(/\/\.?$/, '') || '/' }];
	});

describe('prerendered pages', () => {
	it('are exactly / and /why, set on the page and not on a layout', () => {
		expect(settings.filter((s) => s.file.includes('+layout'))).toEqual([]);
		expect(settings.every((s) => s.value === 'true'), JSON.stringify(settings)).toBe(true);
		expect(settings.map((s) => s.route).sort()).toEqual(['/', '/why']);
	});

	it('have their English paths as prerender entries', () => {
		const entries = config.kit?.prerender?.entries ?? [];
		for (const s of settings) expect(entries, s.route).toContain(localizedPath(s.route, 'en'));
		expect(entries).toContain('*');
	});
});
