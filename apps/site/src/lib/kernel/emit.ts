// Port of `rsv_kernel::emit`: an output buffer that records where each piece came from, the
// greatest-lower-bound reverse lookup, and source map v3 encoding. Offsets are UTF-8 bytes as in
// Rust; `out` is kept as a string and every example on the site is ASCII, which `push` checks.

import { LineIndex, byteLength, spanText, type Span } from './source.ts';
import { writeStr } from './json.ts';

export interface Mapping {
	generated: number;
	src: number;
	/** `> 0`: bytes copied verbatim, mapping 1:1. `0`: a point mapping. */
	len: number;
}

export class Emitter {
	out = '';
	mappings: Mapping[] = [];

	private get pos(): number {
		return byteLength(this.out);
	}

	push(s: string) {
		this.out += s;
	}

	mark(src: number) {
		this.mappings.push({ generated: this.pos, src, len: 0 });
	}

	copy(source: string, span: Span) {
		this.mappings.push({ generated: this.pos, src: span.lo, len: span.hi - span.lo });
		this.out += spanText(source, span);
	}

	pushFor(s: string, span: Span | null) {
		if (span) this.mark(span.lo);
		this.out += s;
	}

	/** Index of the mapping that answers `pos`, or -1: Rust's `partition_point(generated <= pos) - 1`. */
	mappingAt(pos: number): number {
		let lo = 0;
		let hi = this.mappings.length;
		while (lo < hi) {
			const mid = (lo + hi) >> 1;
			if (this.mappings[mid].generated <= pos) lo = mid + 1;
			else hi = mid;
		}
		return lo - 1;
	}

	lookup(pos: number): number | null {
		const i = this.mappingAt(pos);
		if (i < 0) return null;
		const m = this.mappings[i];
		return pos < m.generated + m.len ? m.src + (pos - m.generated) : m.src + Math.max(0, m.len - 1);
	}

	lookupSpan(span: Span): Span | null {
		const lo = this.lookup(span.lo);
		if (lo === null) return null;
		const hi = this.lookup(span.hi);
		if (hi === null) return null;
		return { lo, hi: Math.max(hi, lo) };
	}

	/** Every segment `source_map` writes, before VLQ encoding. */
	segments(source: string): { genLine: number; genCol: number; srcLine: number; srcCol: number }[] {
		const src = new LineIndex(source);
		const gen = new LineIndex(this.out);
		return [...this.mappings]
			.sort((a, b) => a.generated - b.generated)
			.map((m) => {
				const g = gen.lineCol(m.generated);
				const s = src.lineCol(m.src);
				return { genLine: g.line, genCol: g.column, srcLine: s.line, srcCol: s.column };
			});
	}

	sourceMap(source: string, sourceName: string): string {
		let mappings = '';
		let prevGenLine = 1;
		let prevGenCol = 0;
		let prevSrcLine = 0;
		let prevSrcCol = 0;
		let firstInLine = true;
		for (const s of this.segments(source)) {
			while (prevGenLine < s.genLine) {
				mappings += ';';
				prevGenLine++;
				prevGenCol = 0;
				firstInLine = true;
			}
			if (!firstInLine) mappings += ',';
			firstInLine = false;
			mappings += vlq(s.genCol - prevGenCol) + vlq(0) + vlq(s.srcLine - 1 - prevSrcLine) + vlq(s.srcCol - prevSrcCol);
			prevGenCol = s.genCol;
			prevSrcLine = s.srcLine - 1;
			prevSrcCol = s.srcCol;
		}
		return `{"version":3,"sources":[${writeStr(sourceName)}],"names":[],"mappings":${writeStr(mappings)}}`;
	}
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export interface VlqDigit {
	bits: number;
	continued: boolean;
	char: string;
}

/** The base64 digits of one VLQ value, least significant first, as the widget draws them. */
export function vlqDigits(value: number): VlqDigit[] {
	let v = value < 0 ? (-value * 2) | 1 : value * 2;
	const out: VlqDigit[] = [];
	for (;;) {
		let digit = v & 31;
		v = Math.floor(v / 32);
		const continued = v > 0;
		if (continued) digit |= 32;
		out.push({ bits: digit & 31, continued, char: B64[digit] });
		if (!continued) return out;
	}
}

export function vlq(value: number): string {
	return vlqDigits(value)
		.map((d) => d.char)
		.join('');
}

/** Decodes a `mappings` string into absolute segments, as a standard source map consumer does. */
export function decodeMappings(mappings: string): { genLine: number; genCol: number; srcLine: number; srcCol: number }[] {
	const out: { genLine: number; genCol: number; srcLine: number; srcCol: number }[] = [];
	let srcLine = 0;
	let srcCol = 0;
	mappings.split(';').forEach((line, li) => {
		let genCol = 0;
		for (const seg of line.split(',').filter(Boolean)) {
			const fields: number[] = [];
			let shift = 0;
			let acc = 0;
			for (const c of seg) {
				const d = B64.indexOf(c);
				if (d < 0) throw new Error(`not base64: ${c}`);
				acc += (d & 31) * 2 ** shift;
				if (d & 32) shift += 5;
				else {
					fields.push(acc & 1 ? -Math.floor(acc / 2) : Math.floor(acc / 2));
					acc = 0;
					shift = 0;
				}
			}
			genCol += fields[0];
			srcLine += fields[2];
			srcCol += fields[3];
			out.push({ genLine: li + 1, genCol, srcLine: srcLine + 1, srcCol });
		}
	});
	return out;
}

/** What a standard consumer answers for a generated column: the source position of the segment at or before it. */
export function consumerLookup(
	segments: { genLine: number; genCol: number; srcLine: number; srcCol: number }[],
	genLine: number,
	genCol: number
): { srcLine: number; srcCol: number } | null {
	let best: { srcLine: number; srcCol: number } | null = null;
	for (const s of segments) if (s.genLine === genLine && s.genCol <= genCol) best = s;
	return best && { srcLine: best.srcLine, srcCol: best.srcCol };
}
