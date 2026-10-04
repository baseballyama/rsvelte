// Expected values are the Rust tests' own, or were printed by the Rust kernel for the same input
// (marked "oracle"); none is inferred from this port.
import { describe, expect, it } from 'vitest';
import { consumerLookup, decodeMappings, Emitter, vlq } from './emit.ts';
import { Interner } from './interner.ts';
import { StructuredDataWriter } from './structured-data.ts';
import { LineIndex } from './source.ts';

function ariaExample() {
	const source = '<p aria-label={x}>';
	const e = new Emitter();
	e.push('f({ ');
	e.mark(3);
	e.push('"');
	e.copy(source, { startOffset: 3, endOffset: 13 });
	e.push('": ');
	e.copy(source, { startOffset: 15, endOffset: 16 });
	e.push(' });');
	return { source, e };
}

describe('source', () => {
	it('an offset inside a character rounds down to its start (source.rs test)', () => {
		const index = new LineIndex('é😀x');
		expect([1, 2, 4, 6, 7, 99].map((b) => index.utf16(b))).toEqual([0, 1, 1, 3, 4, 4]);
		expect(index.lineCol(99).line).toBe(1);
	});

	it('utf16 columns count surrogate pairs', () => {
		const source = 'a😀b\nc';
		const index = new LineIndex(source);
		const b = 1 + 4;
		expect(index.lineCol(b)).toEqual({ line: 1, column: 3, character: 3 });
		expect(index.lineCol(b + 2)).toEqual({ line: 2, column: 0, character: 5 });
		expect(index.offset(1, 3)).toBe(b);
	});

	it('matches the oracle on every char boundary, and refuses columns that do not exist', () => {
		const index = new LineIndex('é😀\nab');
		const lc = [0, 2, 6, 7, 8, 9].map((b) => {
			const x = index.lineCol(b);
			return `${b}:${x.line}:${x.column}:${x.character}`;
		});
		expect(lc.join(',')).toBe('0:1:0:0,2:1:1:1,6:1:3:3,7:2:0:4,8:2:1:5,9:2:2:6');
		const cells: [number, number][] = [[1, 9], [2, 9], [3, 0], [1, 1], [1, 2], [2, 2]];
		expect(cells.map(([l, c]) => index.offset(l, c))).toEqual([null, null, null, 2, null, 9]);
	});

	it('does not count a CRLF terminator as part of the line (positions.rs test)', () => {
		const index = new LineIndex('a\r\nb');
		expect([index.offset(1, 1), index.offset(1, 2), index.offset(2, 0)]).toEqual([1, null, 3]);
		expect(index.crlf).toEqual([0]);
	});

	it('keeps the CR of a lone CR and the columns of LF lines', () => {
		const lf = new LineIndex('a\nb');
		expect([lf.offset(1, 1), lf.offset(1, 2), lf.offset(2, 0)]).toEqual([1, null, 2]);
		expect(lf.crlf).toEqual([]);
		const cr = new LineIndex('a\rb\n');
		expect([cr.offset(1, 2), cr.offset(1, 3), cr.offset(1, 4)]).toEqual([2, 3, null]);
		expect(cr.crlf).toEqual([]);
	});

	it('keeps no wide table for ASCII', () => {
		expect(new LineIndex('abc\ndef').wide).toEqual([]);
	});
});

describe('interner', () => {
	it('records ends as UTF-8 byte offsets, as Rust does', () => {
		const i = new Interner();
		for (const name of ['a', 'é', '名前', '😀']) i.intern(name);
		expect(i.ends).toEqual([1, 3, 9, 13]);
		expect([0, 1, 2, 3].map((atom) => i.get(atom))).toEqual(['a', 'é', '名前', '😀']);
		expect(i.lookup('名前')).toBe(2);
	});

	it('keeps ends equal to string lengths for ASCII names', () => {
		const i = new Interner();
		for (const name of ['ab', 'c', 'def']) i.intern(name);
		expect(i.ends).toEqual([2, 3, 6]);
	});

	it('interning is idempotent and survives growth', () => {
		const i = new Interner();
		const names = Array.from({ length: 500 }, (_, n) => `n${n}`);
		const atoms = names.map((n) => i.intern(n).atom);
		names.forEach((n, k) => {
			expect(i.intern(n).atom).toBe(atoms[k]);
			expect(i.get(atoms[k])).toBe(n);
			expect(i.lookup(n)).toBe(atoms[k]);
		});
		expect(i.lookup('missing')).toBe(null);
		expect(i.table.length).toBe(1024);
	});
});

describe('json', () => {
	it('nested values and keys', () => {
		let w = new StructuredDataWriter(false);
		w.beginObject().key('a').writeNumber(1).key('b').beginArray().writeString('x\n').null().endArray().key('c').beginObject().endObject().endObject();
		expect(w.finish()).toBe('{"a":1,"b":["x\\n",null],"c":{}}');
		w = new StructuredDataWriter(true);
		w.beginArray().beginObject().key('k').writeBoolean(true).endObject().endArray();
		expect(w.finish()).toBe('[\n\t{\n\t\t"k": true\n\t}\n]\n');
	});
});

describe('emit', () => {
	it('vlq matches the spec examples', () => {
		expect([0, 1, -1, 16, 1000].map(vlq).join(' ')).toBe('A C D gB w+B');
	});

	it('lookup maps inside copied chunks', () => {
		const e = new Emitter();
		e.push('// header\n');
		e.copy('let answer = 42;', { startOffset: 4, endOffset: 10 });
		expect(e.lookup(10)).toBe(4);
		expect(e.lookup(13)).toBe(7);
	});

	it('spans map back through copies and quotes', () => {
		const { source, e } = ariaExample();
		expect(e.out.slice(4, 16)).toBe('"aria-label"');
		expect(e.lookupSpan({ startOffset: 4, endOffset: 16 })).toEqual({ startOffset: 3, endOffset: 12 });
		expect(e.lookupSpan({ startOffset: 18, endOffset: 19 })).toEqual({ startOffset: 15, endOffset: 15 });
		expect(e.lookupSpan({ startOffset: 0, endOffset: 2 })).toBe(null);
		const marked = new Emitter();
		marked.copy(source, { startOffset: 15, endOffset: 16 });
		marked.mark(16);
		marked.push(';');
		expect(marked.lookupSpan({ startOffset: 0, endOffset: 1 })).toEqual({ startOffset: 15, endOffset: 16 });
	});

	it('matches the oracle source map and per-byte lookup', () => {
		const { source, e } = ariaExample();
		expect(e.sourceMap(source, 'App.svelte')).toBe(
			'{"version":3,"sources":["App.svelte"],"names":[],"mappings":"IAAG,CAAA,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAG"}'
		);
		const lookups = Array.from(e.out, (_, p) => e.lookup(p));
		expect(lookups).toEqual([null, null, null, null, 3, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 12, 12, 15, 15, 15, 15, 15]);
	});

	it('a standard consumer answers what lookup answers', () => {
		const { source, e } = ariaExample();
		const segs = decodeMappings(JSON.parse(e.sourceMap(source, 'App.svelte')).mappings);
		for (let p = 0; p <= e.out.length; p++) {
			const c = consumerLookup(segs, 1, p);
			expect(c && new LineIndex(source).offset(c.sourceLine, c.sourceCol)).toBe(e.lookup(p));
		}
	});

	it('matches the oracle across generated lines', () => {
		const m = new Emitter();
		m.copy('ab\ncd', { startOffset: 0, endOffset: 5 });
		m.push('\n;');
		expect(m.sourceMap('ab\ncd', 'a')).toBe('{"version":3,"sources":["a"],"names":[],"mappings":"AAAA,CAAC,CAAC;AACF,CAAC"}');
		const lookups = Array.from({ length: m.out.length + 1 }, (_, p) => m.lookup(p));
		expect(lookups).toEqual([0, 1, 2, 3, 4, 4, null, null]);
	});
});
