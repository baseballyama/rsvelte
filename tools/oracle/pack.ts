// A pack holds many files in one text file, so the corpus is a few hundred files for git and CI
// instead of tens of thousands. Each entry is a header line and the body's exact bytes:
//
//   === <body length in UTF-8 bytes> <path>[\t<attribute>]...\n<body>\n
//
// The length makes any body safe without escaping, and the text stays readable in a git diff.
// crates/language_independent/corpus/src/pack.rs reads the same format.
import fs from 'node:fs';
import path from 'node:path';

const HEADER = '# rsvelte pack 1\n';
const MARK = '=== ';

export interface Entry {
	path: string;
	attributes: string[];
	body: string;
}

// UTF-8 byte order, the order Rust's `str` comparison gives.
const compare = (a: string, b: string): number => Buffer.compare(Buffer.from(a), Buffer.from(b));
const key = (e: Entry): string => [e.path, ...e.attributes].join('\t');

/** The pack text of `entries`, sorted by path and then attributes, as the reader expects. */
export function formatPack(entries: Entry[]): string {
	const sorted = entries.toSorted((a, b) => compare(key(a), key(b)));
	const parts = [HEADER];
	for (let i = 0; i < sorted.length; i++) {
		const e = sorted[i]!;
		for (const field of [e.path, ...e.attributes])
			if (/[\t\n]/.test(field) || field === '')
				throw new Error(`pack field ${JSON.stringify(field)}`);
		if (i > 0 && key(sorted[i - 1]!) === key(e)) throw new Error(`pack entry ${key(e)} twice`);
		parts.push(`${MARK}${Buffer.byteLength(e.body)} ${key(e)}\n`, e.body, '\n');
	}
	return parts.join('');
}

export function parsePack(bytes: Buffer, name: string): Entry[] {
	const fail = (at: number, why: string): never => {
		throw new Error(`${name}: byte ${at}: ${why}`);
	};
	if (bytes.subarray(0, HEADER.length).toString() !== HEADER) fail(0, 'not a pack');
	const entries: Entry[] = [];
	let at = HEADER.length;
	while (at < bytes.length) {
		const eol = bytes.indexOf(0x0a, at);
		if (eol < 0) fail(at, 'header without a newline');
		const header = bytes.subarray(at, eol).toString();
		if (!header.startsWith(MARK)) fail(at, 'expected an entry header');
		const space = header.indexOf(' ', MARK.length);
		const length = Number(header.slice(MARK.length, space));
		if (space < 0 || !Number.isSafeInteger(length)) fail(at, 'bad body length');
		const [file = '', ...attributes] = header.slice(space + 1).split('\t');
		const start = eol + 1;
		const end = start + length;
		if (bytes[end] !== 0x0a) fail(end, 'body does not end where its length says');
		entries.push({ path: file, attributes, body: bytes.subarray(start, end).toString() });
		at = end + 1;
	}
	return entries;
}

export function readPack(file: string): Entry[] {
	return parsePack(fs.readFileSync(file), file);
}

/** Writes `entries` to `file` when they changed; removes the file when there are none. */
export function writePack(file: string, entries: Entry[]): boolean {
	if (entries.length === 0) {
		const existed = fs.existsSync(file);
		fs.rmSync(file, { force: true });
		return existed;
	}
	const text = formatPack(entries);
	try {
		if (fs.readFileSync(file, 'utf8') === text) return false;
	} catch {}
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, text);
	return true;
}
