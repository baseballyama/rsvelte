interface Boundary {
    byteStart: number;
    byteEnd: number;
    utf16Start: number;
    utf16End: number;
}

export class Coordinates {
    private readonly boundaries: Boundary[] = [];
    readonly byteLength: number;
    readonly utf16Length: number;

    constructor(source: string) {
        let byte = 0, utf16 = 0;
        for (const char of source) {
            const code = char.codePointAt(0)!;
            const bytes = code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4;
            if (bytes !== 1) this.boundaries.push({ byteStart: byte, byteEnd: byte + bytes, utf16Start: utf16, utf16End: utf16 + char.length });
            byte += bytes;
            utf16 += char.length;
        }
        this.byteLength = byte;
        this.utf16Length = utf16;
    }

    toUtf16(byte: number): number {
        return this.convert(byte, this.byteLength, 'byteStart', 'byteEnd', 'utf16End');
    }

    toByte(utf16: number): number {
        return this.convert(utf16, this.utf16Length, 'utf16Start', 'utf16End', 'byteEnd');
    }

    private convert(position: number, length: number, start: 'byteStart' | 'utf16Start', end: 'byteEnd' | 'utf16End', target: 'byteEnd' | 'utf16End'): number {
        if (!Number.isSafeInteger(position) || position < 0 || position > length) throw new RangeError('position is outside the source');
        let lo = 0, hi = this.boundaries.length;
        while (lo < hi) {
            const middle = (lo + hi) >>> 1;
            if (this.boundaries[middle]![end] <= position) lo = middle + 1;
            else hi = middle;
        }
        const next = this.boundaries[lo];
        if (next && position > next[start] && position < next[end]) throw new RangeError('position splits a Unicode code point');
        const previous = this.boundaries[lo - 1];
        return previous ? position + previous[target] - previous[end] : position;
    }
}
