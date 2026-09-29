import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { TOOLBAR as d } from './index.ts';

describe('layer data', () => {
	it('was printed from the component next to it', () => {
		expect(d.src).toBe(readFileSync(new URL('./Toolbar.svelte.txt', import.meta.url), 'utf8'));
	});

	it('links every HIR row with an origin to a surface row', () => {
		const surface = new Set(d.ast.map((r) => r.id));
		for (const r of d.hir) if (r.origin !== null) expect(surface.has(r.origin), r.label).toBe(true);
	});

	it('resolves every template reference to a binding or to nothing', () => {
		const ids = new Set(d.bindings.map((b) => b.id));
		for (const r of d.refs) if (r.binding !== null) expect(ids.has(r.binding)).toBe(true);
		for (const r of d.refs) expect(d.src.slice(...r.span)).toMatch(/^[\w$]+$/);
	});
});
