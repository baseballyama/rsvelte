import { TraceMap, decodedMappings, type EncodedSourceMap } from '@jridgewell/trace-mapping';

export type MappingTuple = [number, number, number, number, number];

function utf8Offsets(text: string): Map<number, number> {
	const offsets = new Map<number, number>([[0, 0]]);
	let bytes = 0, units = 0;
	for (const character of text) {
		bytes += Buffer.byteLength(character);
		units += character.length;
		offsets.set(units, bytes);
	}
	return offsets;
}

function lineStarts(text: string): number[] {
	const starts = [0];
	for (let index = 0; index < text.length; index++) if (text.charCodeAt(index) === 10) starts.push(index + 1);
	return starts;
}

export function oracleMappings(source: string, text: string, map: EncodedSourceMap): MappingTuple[] {
	const original = lineStarts(source), virtual = lineStarts(text);
	const output: MappingTuple[] = [];
	for (const [line, segments] of decodedMappings(new TraceMap(map)).entries()) {
		const lineStart = virtual[line];
		if (lineStart === undefined) throw new Error('generated mapping line is outside the output');
		for (const segment of segments) {
			if (segment.length < 4) continue;
			const originalLine = original[segment[2]!];
			if (originalLine === undefined) throw new Error('original mapping line is outside the source');
			const start = lineStart + segment[0], from = originalLine + segment[3]!;
			const character = text.codePointAt(start);
			if (character !== undefined && character >= 0xdc00 && character <= 0xdfff) continue;
			if (character === undefined || character !== source.codePointAt(from)) continue;
			const length = character > 0xffff ? 2 : 1;
			const previous = output.at(-1);
			if (previous && previous[0] + previous[1] === start && previous[2] + previous[3] === from) {
				previous[1] += length;
				previous[3] += length;
			} else output.push([start, length, from, length, 0]);
		}
	}
	const originalBytes = utf8Offsets(source), virtualBytes = utf8Offsets(text);
	return output.map(([start, length, from, copied, kind]) => {
		const lo = virtualBytes.get(start), hi = virtualBytes.get(start + length);
		const originalLo = originalBytes.get(from), originalHi = originalBytes.get(from + copied);
		if (lo === undefined || hi === undefined || originalLo === undefined || originalHi === undefined) throw new Error('oracle mapping splits a Unicode character');
		return [lo, hi - lo, originalLo, originalHi - originalLo, kind];
	});
}
