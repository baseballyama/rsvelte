// Port of `rsv_kernel::source`: byte spans, and the line index that turns a UTF-8 byte offset into
// the 1-based line / UTF-16 column JavaScript tools report. JS strings are UTF-16, so this port keeps
// the Rust bytes explicitly (TextEncoder) instead of indexing the string.

export interface Span {
	lo: number;
	hi: number;
}

export interface LineCol {
	/** 1-based. */
	line: number;
	/** 0-based, in UTF-16 code units. */
	column: number;
	/** 0-based offset from the start of the document, in UTF-16 code units. */
	character: number;
}

export interface WideChar {
	/** Byte offset of a non-ASCII char. */
	byte: number;
	/** UTF-16 length of the text before it. */
	utf16: number;
	ch: string;
	utf8Len: number;
	utf16Len: number;
}

const utf8Len = (cp: number) => (cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4);

export class LineIndex {
	readonly lineStarts: number[] = [0];
	/** Empty for ASCII-only text, exactly as in Rust. */
	readonly wide: WideChar[] = [];
	readonly bytes: Uint8Array;

	constructor(readonly src: string) {
		this.bytes = new TextEncoder().encode(src);
		this.bytes.forEach((b, i) => {
			if (b === 0x0a) this.lineStarts.push(i + 1);
		});
		let byte = 0;
		let utf16 = 0;
		for (const ch of src) {
			const cp = ch.codePointAt(0)!;
			const n8 = utf8Len(cp);
			if (cp >= 0x80) this.wide.push({ byte, utf16, ch, utf8Len: n8, utf16Len: ch.length });
			byte += n8;
			utf16 += ch.length;
		}
	}

	/** Index of the last wide char at or before `byte` plus one: Rust's `partition_point(b < byte)`. */
	private widePoint(byte: number): number {
		let lo = 0;
		let hi = this.wide.length;
		while (lo < hi) {
			const mid = (lo + hi) >> 1;
			if (this.wide[mid].byte < byte) lo = mid + 1;
			else hi = mid;
		}
		return lo;
	}

	utf16(byte: number): number {
		if (this.wide.length === 0) return byte;
		const i = this.widePoint(byte);
		if (i === 0) return byte;
		const w = this.wide[i - 1];
		return w.utf16 + w.utf16Len + (byte - w.byte - w.utf8Len);
	}

	lineCol(byte: number): LineCol {
		let lo = 0;
		let hi = this.lineStarts.length;
		while (lo < hi) {
			const mid = (lo + hi) >> 1;
			if (this.lineStarts[mid] <= byte) lo = mid + 1;
			else hi = mid;
		}
		const line = lo - 1;
		const character = this.utf16(byte);
		return { line: line + 1, column: character - this.utf16(this.lineStarts[line]), character };
	}

	/** Byte offset of a 1-based line and 0-based UTF-16 column; clamps like the Rust version. */
	offset(line: number, column: number): number | null {
		if (line < 1 || line > this.lineStarts.length) return null;
		const start = this.lineStarts[line - 1];
		let units = 0;
		let byte = start;
		const rest = new TextDecoder().decode(this.bytes.subarray(start));
		for (const ch of rest) {
			if (units === column) return byte;
			if (units > column || ch === '\n') return null;
			units += ch.length;
			byte += utf8Len(ch.codePointAt(0)!);
		}
		return units === column ? this.bytes.length : null;
	}

	/** The byte range of every char, for drawing the text byte by byte. */
	chars(): { ch: string; byte: number; len: number }[] {
		const out: { ch: string; byte: number; len: number }[] = [];
		let byte = 0;
		for (const ch of this.src) {
			const len = utf8Len(ch.codePointAt(0)!);
			out.push({ ch, byte, len });
			byte += len;
		}
		return out;
	}
}

export function byteLength(s: string): number {
	return new TextEncoder().encode(s).length;
}

export function spanText(src: string, span: Span): string {
	const b = new TextEncoder().encode(src);
	return new TextDecoder().decode(b.subarray(span.lo, span.hi));
}
