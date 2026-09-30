#!/usr/bin/env node
// string-width [--vectors <file>]
//
// Generates crates/rsv_kernel/src/doc/width_tables.rs from the oracle itself: Prettier's `getStringWidth`
// (the formatter's column measure) evaluated on every code point, in non-ASCII text. That is exact for text
// outside emoji sequences, because Prettier measures what its emoji regex did not match one code
// point at a time; the sequences are rsv's matcher (width.rs), checked against the oracle on the
// vectors this script writes (`--vectors`: per line, the code points in hex, then the width).
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { util } from 'prettier';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const OUT = path.join(ROOT, 'crates/rsv_kernel/src/doc/width_tables.rs');
const width = util.getStringWidth;

const { values } = parseArgs({ options: { vectors: { type: 'string' } } });

// Runs of equal width other than 1, over every scalar value.
const runs: [number, number, number][] = [];
for (let cp = 0; cp <= 0x10ffff; cp++) {
	if (cp >= 0xd800 && cp <= 0xdfff) continue;
	// Behind a non-ASCII character, so every code point is measured on the slow path (DEL alone
	// takes the ASCII fast path and counts 1; in other text it counts 0).
	const w = width(`\u00E9${String.fromCodePoint(cp)}`) - 1;
	if (w === 1) continue;
	const last = runs.at(-1);
	if (last && last[2] === w && last[1] === cp - 1) last[1] = cp;
	else if (last && last[2] === w && last[1] === 0xd7ff && cp === 0xe000) last[1] = cp;
	else runs.push([cp, cp, w]);
}

// Prettier's emoji regex, read from the bundle (it is not exported): the code points it matches
// alone are where rsv's sequence matcher may start.
const bundle = fs.readFileSync(path.join(import.meta.dirname, '../node_modules/prettier/doc.mjs'), 'utf8');
const literal = /var emoji_regex_default = \(\) => \{\n\s*return \/(.*)\/g;\n\};/.exec(bundle);
if (!literal) throw new Error('emoji regex not found in prettier/doc.mjs');
const emoji = new RegExp(`^(?:${literal[1]})$`);
const narrowLiteral = /var narrowEmojiRegexp = (\/.*\/);\n/.exec(bundle);
if (!narrowLiteral) throw new Error('narrow emoji regex not found in prettier/doc.mjs');
const narrow = new RegExp(narrowLiteral[1]!.slice(1, -1));
const starts: [number, number][] = [];
const narrows: [number, number][] = [];
for (let cp = 0; cp <= 0x10ffff; cp++) {
	if (cp >= 0xd800 && cp <= 0xdfff) continue;
	const c = String.fromCodePoint(cp);
	if (!emoji.test(c)) continue;
	for (const [set, hit] of [[starts, true], [narrows, narrow.test(c)]] as const) {
		if (!hit) continue;
		const last = set.at(-1);
		if (last && last[1] === cp - 1) last[1] = cp;
		else set.push([cp, cp]);
	}
}

// Every string the emoji regex matches. Its language is finite (alternations, `(?:…)`, `?` and
// classes; the one `*` is inside `[#*0-9]`), so it is expanded here, in UTF-16 code units.
function expand(src: string): string[] {
	let i = 0;
	const unit = (): number => {
		if (src[i] !== '\\') return src.charCodeAt(i++);
		const k = src[i + 1];
		if (k === 'u') {
			const n = parseInt(src.slice(i + 2, i + 6), 16);
			i += 6;
			return n;
		}
		if (k === 'x') {
			const n = parseInt(src.slice(i + 2, i + 4), 16);
			i += 4;
			return n;
		}
		i += 2;
		return k!.charCodeAt(0);
	};
	const alternation = (): string[] => {
		const out = [...sequence()];
		while (src[i] === '|') {
			i++;
			out.push(...sequence());
		}
		return out;
	};
	const sequence = (): string[] => {
		let acc = [''];
		while (i < src.length && src[i] !== '|' && src[i] !== ')') {
			let atom: string[];
			if (src.startsWith('(?:', i)) {
				i += 3;
				atom = alternation();
				if (src[i++] !== ')') throw new Error(`unclosed group at ${i}`);
			} else if (src[i] === '[') {
				i++;
				atom = [];
				while (src[i] !== ']') {
					const lo = unit();
					let hi = lo;
					if (src[i] === '-' && src[i + 1] !== ']') {
						i++;
						hi = unit();
					}
					for (let u = lo; u <= hi; u++) atom.push(String.fromCharCode(u));
				}
				i++;
			} else {
				atom = [String.fromCharCode(unit())];
			}
			if (src[i] === '?') {
				i++;
				atom = ['', ...atom];
			}
			const next: string[] = [];
			for (const a of acc) for (const b of atom) next.push(a + b);
			acc = next;
		}
		return acc;
	};
	const all = alternation();
	if (i !== src.length) throw new Error(`unparsed regex tail at ${i}`);
	return all;
}
const language = [...new Set(expand(literal[1]!))];
const sticky = new RegExp(literal[1]!, 'y');
const prefixFirst = language.filter((str) => {
	sticky.lastIndex = 0;
	return sticky.exec(str)?.[0] !== str;
});
if (prefixFirst.length) throw new Error(`${prefixFirst.length} strings of the language match a shorter alternative first; longest-match does not model the regex`);
const sequences = language
	.map((str) => [...str].map((c) => c.codePointAt(0)!))
	.filter((cps) => cps.length > 1)
	.sort((a, b) => {
		for (let k = 0; k < Math.min(a.length, b.length); k++) if (a[k] !== b[k]) return a[k]! - b[k]!;
		return a.length - b.length;
	});

const hex = (n: number) => `0x${n.toString(16).toUpperCase()}`;
const lines = [
	'// @generated by tools/fixtures/bin/string-width.ts from Prettier\'s `getStringWidth`; do not edit.',
	'',
	'/// `(first, last, width)` for every run of code points whose width alone is not 1, sorted.',
	`pub(super) static WIDTHS: [(u32, u32, u8); ${runs.length}] = [`,
	...runs.map(([a, b, w]) => `    (${hex(a)}, ${hex(b)}, ${w}),`),
	'];',
	'',
	'/// `(first, last)` for every run of code points Prettier\'s emoji regex matches alone, sorted.',
	`pub(super) static EMOJI: [(u32, u32); ${starts.length}] = [`,
	...starts.map(([a, b]) => `    (${hex(a)}, ${hex(b)}),`),
	'];',
	'',
	'/// Every multi-code-point string the emoji regex matches, sorted; a match counts two columns.',
	`pub(super) static SEQUENCES: [&[u32]; ${sequences.length}] = [`,
	...sequences.map((cps) => `    &[${cps.map(hex).join(', ')}],`),
	'];',
	'',
	'/// The runs of [`EMOJI`] that count one column when matched alone (Prettier\'s narrow emoji).',
	`pub(super) static NARROW: [(u32, u32); ${narrows.length}] = [`,
	...narrows.map(([a, b]) => `    (${hex(a)}, ${hex(b)}),`),
	'];',
	''
];
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, lines.join('\n'));
console.log(`${path.relative(ROOT, OUT)}: ${runs.length} width runs, ${starts.length} emoji runs, ${sequences.length} sequences (language ${language.length})`);

if (values.vectors) {
	const out: string[] = [];
	const add = (s: string) => out.push(`${[...s].map((c) => c.codePointAt(0)!.toString(16)).join(' ')} ${width(s)}`);
	const pict: string[] = [];
	for (let cp = 0; cp <= 0x10ffff; cp++) {
		if (cp >= 0xd800 && cp <= 0xdfff) continue;
		const c = String.fromCodePoint(cp);
		if (/\p{Extended_Pictographic}|\p{Emoji}/u.test(c)) pict.push(c);
	}
	// Single code points in non-ASCII text: every one below U+3400 (where the shortcuts are), then a
	// sample.
	for (let cp = 0; cp <= 0x10ffff; cp += cp < 0x3400 ? 1 : 97) {
		if (cp >= 0xd800 && cp <= 0xdfff) continue;
		add(`\u00E9${String.fromCodePoint(cp)}x`);
	}
	const mods = ['\u{1F3FB}', '\u{1F3FC}', '\u{1F3FD}', '\u{1F3FE}', '\u{1F3FF}'];
	for (const c of pict) {
		add(c);
		add(`${c}️`);
		add(`${c}︎`);
		add(`${c}⃣`);
		add(`${c}️⃣`);
		add(`a${c}‍b`);
		for (const m of mods) add(c + m);
		add(`${c}${mods[2]}‍♂️`);
		add(`${c}‍♀️`);
	}
	// ZWJ pairs over a pseudo-random sample, plus the bases RGI sequences are built on.
	const bases = ['\u{1F468}', '\u{1F469}', '\u{1F9D1}', '\u{1F3F3}️', '\u{1F441}️', '❤️', '\u{1F415}', '\u{1F43B}', '\u{1F408}', '\u{1F426}'];
	let seed = 1;
	const rand = (n: number) => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) % n);
	for (const b of bases) for (const c of pict) add(`${b}‍${c}`);
	for (let i = 0; i < 20000; i++) {
		const a = pict[rand(pict.length)]!;
		const b = pict[rand(pict.length)]!;
		const c = pict[rand(pict.length)]!;
		add(`${a}‍${b}`);
		add(`${a}${mods[rand(5)]}‍${b}‍${c}`);
		add(`x${a}${b}y`);
	}
	for (let a = 0x1f1e6; a <= 0x1f1ff; a++) {
		add(String.fromCodePoint(a));
		for (let b = 0x1f1e6; b <= 0x1f1ff; b++) {
			add(String.fromCodePoint(a, b));
			add(String.fromCodePoint(a, b, 0x1f1e6));
		}
	}
	for (const str of language) {
		add(str);
		add(`a${str}\u200Db`);
		add(`${str}${str}`);
	}
	for (const k of '#*0123456789') {
		add(`${k}⃣`);
		add(`${k}️⃣`);
		add(`${k}️`);
	}
	const tag = (s: string) => [...s].map((c) => String.fromCodePoint(0xe0000 + c.charCodeAt(0))).join('');
	for (const t of ['gbeng', 'gbsct', 'gbwls', 'usca', 'zz']) {
		add(`\u{1F3F4}${tag(t)}\u{E007F}`);
		add(`\u{1F3F4}${tag(t)}`);
	}
	add('\u{1F3F4}‍☠️');
	add('é\t\u0007​­́️日本語');
	fs.writeFileSync(values.vectors, out.join('\n') + '\n');
	console.log(`${values.vectors}: ${out.length} vectors`);
}
