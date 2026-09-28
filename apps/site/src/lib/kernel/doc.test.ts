// The Rust tests of `rsv_kernel::doc`, with the same inputs and expected values.
import { describe, expect, it } from 'vitest';
import { Docs, Refused, defaultOptions, stringWidth, type DocId, type TraceEvent } from './doc.ts';

function call(d: Docs, args: string[]): DocId {
	const open = d.text('f(');
	const inner: DocId[] = [];
	args.forEach((a, i) => {
		if (i > 0) inner.push(d.text(','), d.line());
		inner.push(d.text(a));
	});
	const body = d.indent(d.concat([d.softline(), d.concat(inner)]));
	return d.group([open, body, d.softline(), d.text(')')]);
}

describe('doc printer (ported from doc.rs)', () => {
	it('group prints flat when it fits and breaks otherwise', () => {
		let d = new Docs();
		expect(d.print(call(d, ['a', 'b']))).toBe('f(a, b)');
		d = new Docs();
		const long = 'x'.repeat(50);
		expect(d.print(call(d, [long, long]))).toBe(`f(\n  ${long},\n  ${long}\n)`);
	});

	it('hardline breaks enclosing groups and trims trailing space', () => {
		const d = new Docs();
		const ind = d.indent(d.concat([d.text('a '), d.hardline(), d.text('b')]));
		const g = d.group([ind, d.line()]);
		expect(d.print(g, { ...defaultOptions, indentSpaces: null })).toBe('a\n\tb\n');
	});

	it('literal line keeps trailing space and skips indentation', () => {
		const d = new Docs();
		const ind = d.indent(d.concat([d.text('a '), d.literalline(), d.text('b')]));
		expect(d.print(ind)).toBe('a \nb');
	});

	it('fill packs words', () => {
		const d = new Docs();
		const items: DocId[] = [];
		for (let i = 0; i < 30; i++) {
			if (i > 0) items.push(d.line());
			items.push(d.text('word'));
		}
		const out = d.print(d.fill(items), { ...defaultOptions, width: 20 });
		expect(out.split('\n').every((l) => l.length <= 20)).toBe(true);
		expect(out.split('\n')[0]).toBe('word word word word');
	});

	it('if_break follows a named group', () => {
		const d = new Docs();
		const id = d.newGroupId();
		const g = d.groupWithId([d.text('x'.repeat(90)), d.line()], id);
		const root = d.concat([g, d.ifBreakOf(d.text('broken'), d.text('flat'), id)]);
		expect(d.print(root).endsWith('\nbroken')).toBe(true);
	});

	it('flat_only refuses when it does not fit', () => {
		let d = new Docs();
		expect(d.print(d.flatOnly(d.text('short')))).toBe('short');
		d = new Docs();
		const bad = d.flatOnly(d.text('x'.repeat(90)));
		expect(() => d.print(bad)).toThrow(Refused);
	});

	it('trim descends into the last part', () => {
		const d = new Docs();
		const docs = [d.concat([d.text('a'), d.hardline()])];
		d.trimRight(docs, (d, x) => d.isLine(x));
		expect(d.print(d.concat(docs))).toBe('a');
	});
});

describe('site additions', () => {
	it('breaks a fill separator after content holding a broken group (mustBeFlat)', () => {
		const d = new Docs();
		const content = d.groupBroken([d.text('a'), d.line(), d.text('b')]);
		expect(d.print(d.fill([content, d.line(), d.text('c')]))).toBe('a\nb\nc');
	});

	it('counts East Asian wide characters as two columns', () => {
		expect(stringWidth('abc')).toBe(3);
		expect(stringWidth('日本語')).toBe(6);
		expect(stringWidth('é')).toBe(1);
	});

	it('traces why each group chose its mode', () => {
		const d = new Docs();
		const long = 'x'.repeat(50);
		const trace: TraceEvent[] = [];
		d.print(call(d, [long, long]), defaultOptions, trace);
		expect(trace).toEqual([{ kind: 'group', doc: expect.any(Number), pos: 0, rem: 80, mode: 'break', why: 'does-not-fit' }]);
	});
});
