// Splits Rust source into items (functions, types, impl blocks and the methods inside them) so the
// site can quote code by name. Runs at build time only. Literals and comments are skipped when
// matching braces, so a `{` inside a string or a `'{'` char literal never changes the structure.

export interface RustItem {
	/** `kernel/computation/pipeline/run_each`, `kernel/output/emitter/Emitter::lookup`, `kernel/output/emitter/impl Emitter`. */
	key: string;
	kind: string;
	/** `run_each`, `Emitter::lookup`, `impl Emitter`. */
	name: string;
	/** 1-based, inclusive, including the item's doc comments and attributes. */
	startLine: number;
	endLine: number;
	code: string;
	/** The `///` comment above the item, without the slashes. */
	docs: string;
}

export interface RustModule {
	/** `kernel/pipeline`. */
	key: string;
	path: string;
	/** The `//!` comment at the top of the file. */
	docs: string;
	lines: number;
	items: RustItem[];
}

const KEYWORDS = /^(?:pub(?:\([^)]*\))?\s+)?(?:unsafe\s+|async\s+|const\s+(?=fn)|extern\s+"[^"]*"\s+)*(fn|struct|enum|trait|impl|mod|const|static|type|macro_rules!|thread_local!)(?:(?<=!)|\b)/;

/** Per byte: brace depth before that byte, or -1 inside a comment or literal. */
export function scan(source: string): Int32Array {
	const depth = new Int32Array(source.length + 1);
	let d = 0;
	let i = 0;
	const opaque = (from: number, to: number) => depth.fill(-1, from, to);
	while (i < source.length) {
		const c = source[i];
		const next = source[i + 1];
		if (c === '/' && next === '/') {
			const end = source.indexOf('\n', i);
			const stop = end === -1 ? source.length : end;
			opaque(i, stop);
			i = stop;
			continue;
		}
		if (c === '/' && next === '*') {
			let level = 1;
			let j = i + 2;
			while (j < source.length && level > 0) {
				if (source[j] === '/' && source[j + 1] === '*') (level++, (j += 2));
				else if (source[j] === '*' && source[j + 1] === '/') (level--, (j += 2));
				else j++;
			}
			opaque(i, j);
			i = j;
			continue;
		}
		const raw = /^b?r(#*)"/.exec(source.slice(i, i + 12));
		if (raw && (i === 0 || !/[\w]/.test(source[i - 1]))) {
			const close = '"' + raw[1];
			const end = source.indexOf(close, i + raw[0].length);
			if (end === -1) throw new Error(`unterminated raw string at ${i}`);
			opaque(i, end + close.length);
			i = end + close.length;
			continue;
		}
		if (c === '"' || (c === 'b' && next === '"' && !/[\w]/.test(source[i - 1] ?? ''))) {
			let j = c === 'b' ? i + 2 : i + 1;
			while (j < source.length && source[j] !== '"') j += source[j] === '\\' ? 2 : 1;
			opaque(i, j + 1);
			i = j + 1;
			continue;
		}
		if (c === "'") {
			// A char literal is 'x' or '\…'; otherwise this is a lifetime or a label.
			const esc = next === '\\';
			const close = esc ? source.indexOf("'", i + 3) : source[i + 2] === "'" ? i + 2 : -1;
			const astral = !esc && source.codePointAt(i + 1)! > 0xffff && source[i + 3] === "'" ? i + 3 : -1;
			const end = close !== -1 ? close : astral;
			if (end !== -1 && end - i <= 12) {
				opaque(i, end + 1);
				i = end + 1;
				continue;
			}
		}
		depth[i] = d;
		if (c === '{') d++;
		else if (c === '}') {
			d--;
			depth[i] = d;
		}
		i++;
	}
	depth[source.length] = d;
	if (d !== 0) throw new Error(`unbalanced braces (depth ${d} at end of file)`);
	return depth;
}

function lineStarts(source: string): number[] {
	const starts = [0];
	for (let i = 0; i < source.length; i++) if (source[i] === '\n') starts.push(i + 1);
	return starts;
}

function lineOf(starts: number[], offset: number): number {
	let startOffset = 0;
	let endOffset = starts.length - 1;
	while (startOffset < endOffset) {
		const mid = (startOffset + endOffset + 1) >> 1;
		if (starts[mid] <= offset) startOffset = mid;
		else endOffset = mid - 1;
	}
	return startOffset;
}

/** The offset just past an item that starts at `from` with brace depth `d`. */
function itemEnd(source: string, depth: Int32Array, from: number, d: number, kind: string): number {
	const semicolonOnly = kind === 'const' || kind === 'static' || kind === 'type';
	// `[u8; 4]` and `(a; b)` hold semicolons that do not end the item.
	let nest = 0;
	for (let i = from; i < source.length; i++) {
		if (depth[i] !== d) continue;
		if (source[i] === '(' || source[i] === '[') nest++;
		else if (source[i] === ')' || source[i] === ']') nest--;
		if (nest > 0) continue;
		if (source[i] === ';') return i + 1;
		if (source[i] === '{' && !semicolonOnly) {
			for (let j = i + 1; j < source.length; j++) {
				if (source[j] === '}' && depth[j] === d) return j + 1;
			}
		}
	}
	throw new Error(`no end for the ${kind} at offset ${from}`);
}

function stripGenerics(s: string): string {
	let out = '';
	let level = 0;
	for (const ch of s) {
		if (ch === '<') level++;
		else if (ch === '>' && level > 0) level--;
		else if (level === 0) out += ch;
	}
	return out.replace(/\s+/g, ' ').trim();
}

function itemName(kind: string, header: string): string {
	if (kind === 'impl') {
		const h = stripGenerics(header.slice(header.indexOf('impl') + 4).split('{')[0].split(' where ')[0]);
		return `impl ${h}`;
	}
	if (kind === 'macro_rules!' || kind === 'thread_local!') {
		const m = /macro_rules!\s*(\w+)/.exec(header);
		return m ? `${m[1]}!` : kind;
	}
	const m = new RegExp(`\\b${kind}\\s+([A-Za-z_]\\w*)`).exec(header);
	if (!m) throw new Error(`cannot name the ${kind} in: ${header}`);
	return m[1];
}

/** The type methods of an impl or trait block are named after: `impl Rule for X` → `X`. */
function containerName(kind: string, name: string): string {
	if (kind === 'trait' || kind === 'mod') return name;
	const body = name.slice('impl '.length);
	const forAt = body.lastIndexOf(' for ');
	return (forAt === -1 ? body : body.slice(forAt + 5)).replace(/[&']|\bdyn\b/g, '').trim();
}

export function parseRustModule(key: string, path: string, source: string): RustModule {
	const depth = scan(source);
	const starts = lineStarts(source);
	const items: RustItem[] = [];
	const seen = new Map<string, number>();

	const docsAbove = (line: number) => {
		let first = line;
		while (first > 0) {
			const t = source.slice(starts[first - 1], starts[first]).trim();
			if (t.startsWith('///') || t.startsWith('#[')) first--;
			else break;
		}
		return first;
	};

	const walk = (from: number, to: number, d: number, prefix: string) => {
		let line = lineOf(starts, from);
		while (line < starts.length && starts[line] < to) {
			const at = starts[line];
			const text = source.slice(at, starts[line + 1] ?? source.length);
			const lead = text.length - text.trimStart().length;
			const m = KEYWORDS.exec(text.trimStart());
			if (!m || depth[at + lead] !== d) {
				line++;
				continue;
			}
			const kind = m[1];
			const begin = at + lead;
			const end = itemEnd(source, depth, begin, d, kind);
			const header = source.slice(begin, Math.min(end, source.indexOf('{', begin) === -1 ? end : source.indexOf('{', begin) + 1));
			const own = itemName(kind, header);
			const name = prefix + own;
			const first = docsAbove(line);
			const last = lineOf(starts, end - 1);
			const docs = source
				.slice(starts[first], at)
				.split('\n')
				.map((l) => l.trim())
				.filter((l) => l.startsWith('///'))
				.map((l) => l.replace(/^\/\/\/ ?/, ''))
				.join('\n');
			const n = (seen.get(name) ?? 0) + 1;
			seen.set(name, n);
			const unique = n === 1 ? name : `${name}#${n}`;
			items.push({
				key: `${key}/${unique}`,
				kind,
				name: unique,
				startLine: first + 1,
				endLine: last + 1,
				code: source.slice(starts[first], starts[last + 1] ?? source.length).replace(/\n$/, ''),
				docs
			});
			if (kind === 'impl' || kind === 'trait' || kind === 'mod') {
				const open = source.indexOf('{', begin);
				if (open !== -1 && open < end && depth[open] === d) {
					walk(open + 1, end - 1, d + 1, `${prefix}${containerName(kind, own)}::`);
				}
			}
			line = last + 1;
		}
	};
	walk(0, source.length, 0, '');

	const header: string[] = [];
	for (const l of source.split('\n')) {
		const t = l.trim();
		if (t.startsWith('//!')) header.push(t.replace(/^\/\/! ?/, ''));
		else if (t !== '') break;
	}
	const docs = header.join('\n');

	return { key, path, docs, lines: starts.length - (source.endsWith('\n') ? 1 : 0), items };
}
