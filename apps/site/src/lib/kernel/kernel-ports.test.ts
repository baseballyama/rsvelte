// Expected values are the Rust tests' own, or were printed by the Rust kernel for the same input
// (marked "oracle"); none is inferred from this port.
import { describe, expect, it } from 'vitest';
import { consumerLookup, decodeMappings, Emitter, vlq } from './emit.ts';
import { Interner } from './interner.ts';
import { JsonWriter } from './json.ts';
import { LineIndex } from './source.ts';

function ariaExample() {
	const src = '<p aria-label={x}>';
	const e = new Emitter();
	e.push('f({ ');
	e.mark(3);
	e.push('"');
	e.copy(src, { lo: 3, hi: 13 });
	e.push('": ');
	e.copy(src, { lo: 15, hi: 16 });
	e.push(' });');
	return { src, e };
}

describe('source', () => {
	it('utf16 columns count surrogate pairs', () => {
		const src = 'a😀b\nc';
		const idx = new LineIndex(src);
		const b = 1 + 4;
		expect(idx.lineCol(b)).toEqual({ line: 1, column: 3, character: 3 });
		expect(idx.lineCol(b + 2)).toEqual({ line: 2, column: 0, character: 5 });
		expect(idx.offset(1, 3)).toBe(b);
	});

	it('matches the oracle on every char boundary, and refuses columns that do not exist', () => {
		const idx = new LineIndex('é😀\nab');
		const lc = [0, 2, 6, 7, 8, 9].map((b) => {
			const x = idx.lineCol(b);
			return `${b}:${x.line}:${x.column}:${x.character}`;
		});
		expect(lc.join(',')).toBe('0:1:0:0,2:1:1:1,6:1:3:3,7:2:0:4,8:2:1:5,9:2:2:6');
		const cells: [number, number][] = [[1, 9], [2, 9], [3, 0], [1, 1], [1, 2], [2, 2]];
		expect(cells.map(([l, c]) => idx.offset(l, c))).toEqual([null, null, null, 2, null, 9]);
	});

	it('keeps no wide table for ASCII', () => {
		expect(new LineIndex('abc\ndef').wide).toEqual([]);
	});
});

describe('interner', () => {
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
		let w = new JsonWriter(false);
		w.beginObject().key('a').num(1).key('b').beginArray().str('x\n').null().endArray().key('c').beginObject().endObject().endObject();
		expect(w.finish()).toBe('{"a":1,"b":["x\\n",null],"c":{}}');
		w = new JsonWriter(true);
		w.beginArray().beginObject().key('k').bool(true).endObject().endArray();
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
		e.copy('let answer = 42;', { lo: 4, hi: 10 });
		expect(e.lookup(10)).toBe(4);
		expect(e.lookup(13)).toBe(7);
	});

	it('spans map back through copies and quotes', () => {
		const { src, e } = ariaExample();
		expect(e.out.slice(4, 16)).toBe('"aria-label"');
		expect(e.lookupSpan({ lo: 4, hi: 16 })).toEqual({ lo: 3, hi: 12 });
		expect(e.lookupSpan({ lo: 18, hi: 19 })).toEqual({ lo: 15, hi: 15 });
		expect(e.lookupSpan({ lo: 0, hi: 2 })).toBe(null);
		const marked = new Emitter();
		marked.copy(src, { lo: 15, hi: 16 });
		marked.mark(16);
		marked.push(';');
		expect(marked.lookupSpan({ lo: 0, hi: 1 })).toEqual({ lo: 15, hi: 16 });
	});

	it('matches the oracle source map and per-byte lookup', () => {
		const { src, e } = ariaExample();
		expect(e.sourceMap(src, 'App.svelte')).toBe(
			'{"version":3,"sources":["App.svelte"],"names":[],"mappings":"IAAG,CAAA,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAG"}'
		);
		const lookups = Array.from(e.out, (_, p) => e.lookup(p));
		expect(lookups).toEqual([null, null, null, null, 3, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 12, 12, 15, 15, 15, 15, 15]);
	});

	it('a standard consumer answers what lookup answers', () => {
		const { src, e } = ariaExample();
		const segs = decodeMappings(JSON.parse(e.sourceMap(src, 'App.svelte')).mappings);
		for (let p = 0; p <= e.out.length; p++) {
			const c = consumerLookup(segs, 1, p);
			expect(c && new LineIndex(src).offset(c.srcLine, c.srcCol)).toBe(e.lookup(p));
		}
	});

	it('matches the oracle across generated lines', () => {
		const m = new Emitter();
		m.copy('ab\ncd', { lo: 0, hi: 5 });
		m.push('\n;');
		expect(m.sourceMap('ab\ncd', 'a')).toBe('{"version":3,"sources":["a"],"names":[],"mappings":"AAAA,CAAC,CAAC;AACF,CAAC"}');
		const lookups = Array.from({ length: m.out.length + 1 }, (_, p) => m.lookup(p));
		expect(lookups).toEqual([0, 1, 2, 3, 4, 4, null, null]);
	});
});
