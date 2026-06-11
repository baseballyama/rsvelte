/**
 * Formatting-difference absorption for corpus comparison.
 *
 * The official compiler prints through esrap, which re-derives blank lines
 * from its own layout rules; rsvelte preserves source blank lines and does
 * NOT re-create esrap's margins (doing so would require re-parsing every
 * compile output — an unacceptable cost for a compiler targeting 100x
 * performance). Blank lines are pure formatting, so they are normalized
 * away here, in the comparison layer, alongside oxfmt.
 *
 * Blank lines inside template literals and block comments are real content
 * and are preserved: a single-pass scanner tracks string / template (with
 * ${} nesting) / comment state, and only lines whose newline is outside
 * any multi-line token are eligible for removal.
 */
import { parse } from 'acorn';

/**
 * Collapse newlines inside template-literal HOLES (`${ ... }`) into a single
 * space, leaving static template text untouched.
 *
 * esrap (the official compiler's printer) wraps long expressions inside
 * `${}` holes across lines; rsvelte emits them on one line. oxfmt preserves
 * the multiline-ness of template holes from its input, so this is the one
 * formatting difference oxfmt cannot absorb on its own. Whitespace inside a
 * hole is insignificant JS, so flattening it BEFORE oxfmt makes both sides
 * converge to the identical single-line form.
 *
 * Newlines that terminate `//` line comments inside a hole are preserved
 * (collapsing them would change what the comment swallows), as are newlines
 * inside nested template literals' static parts and block comments.
 * The transform is deterministic and idempotent, so it can never turn two
 * identical files into different ones (no new failures possible).
 */
export function flattenTemplateHoles(src) {
	const n = src.length;
	let state = 'code'; // code | line-comment | block-comment | squote | dquote | template
	const templateDepth = []; // ${} brace nesting per template level
	let out = '';
	let i = 0;
	while (i < n) {
		const c = src[i];
		const c2 = src[i + 1];
		switch (state) {
			case 'code':
				if (c === '/' && c2 === '/') {
					state = 'line-comment';
					out += '//';
					i += 2;
					continue;
				} else if (c === '/' && c2 === '*') {
					state = 'block-comment';
					out += '/*';
					i += 2;
					continue;
				} else if (c === "'") state = 'squote';
				else if (c === '"') state = 'dquote';
				else if (c === '`') (state = 'template'), templateDepth.push(0);
				else if (c === '}' && templateDepth.length && templateDepth[templateDepth.length - 1] === 0) {
					state = 'template';
				} else if (c === '{' && templateDepth.length) {
					templateDepth[templateDepth.length - 1]++;
				} else if (c === '}' && templateDepth.length) {
					templateDepth[templateDepth.length - 1]--;
				} else if (templateDepth.length && (c === ' ' || c === '\t' || c === '\n' || c === '\r')) {
					// inside a ${} hole: collapse a whitespace run containing a
					// newline into a single space
					let j = i;
					let sawNewline = false;
					while (j < n && (src[j] === ' ' || src[j] === '\t' || src[j] === '\n' || src[j] === '\r')) {
						if (src[j] === '\n') sawNewline = true;
						j++;
					}
					if (sawNewline) {
						out += ' ';
						i = j;
						continue;
					}
				}
				break;
			case 'line-comment':
				if (c === '\n') state = 'code';
				break;
			case 'block-comment':
				if (c === '*' && c2 === '/') {
					state = 'code';
					out += '*/';
					i += 2;
					continue;
				}
				break;
			case 'squote':
				if (c === '\\') {
					out += c + (src[i + 1] ?? '');
					i += 2;
					continue;
				} else if (c === "'" || c === '\n') state = 'code';
				break;
			case 'dquote':
				if (c === '\\') {
					out += c + (src[i + 1] ?? '');
					i += 2;
					continue;
				} else if (c === '"' || c === '\n') state = 'code';
				break;
			case 'template':
				if (c === '\\') {
					out += c + (src[i + 1] ?? '');
					i += 2;
					continue;
				} else if (c === '`') (state = 'code'), templateDepth.pop();
				else if (c === '$' && c2 === '{') {
					state = 'code';
					out += '${';
					i += 2;
					continue;
				}
				break;
		}
		out += c;
		i++;
	}
	return out;
}

/**
 * Canonical structural signature of a JS module, via a real parser (acorn) —
 * NOT regex. `start`/`end`/`loc`/`range` are dropped so source positions don't
 * matter, and comments are never attached to the AST, so comment placement is
 * absorbed. Line wrapping (including inside template-literal `${}`
 * interpolations) and redundant parentheses are not represented in the AST
 * either, so they are absorbed too. Literal `raw` is KEPT, so number-spelling
 * and quote differences still register (the corpus already canonicalises those
 * via oxfmt). Returns `null` when the code can't be parsed (e.g. the official
 * compiler's `await` inside a non-async async-component function) — callers
 * then fall back to the byte comparison.
 *
 * Because both inputs are produced the same way (acorn builds each node type's
 * properties in a fixed order), `JSON.stringify` is a sound structural-equality
 * key: two structurally identical trees serialise to identical strings.
 */
function astSignature(code) {
	let ast;
	try {
		ast = parse(code, {
			ecmaVersion: 'latest',
			sourceType: 'module',
			allowAwaitOutsideFunction: true,
			allowReturnOutsideFunction: true,
			allowImportExportEverywhere: true,
			allowSuperOutsideMethod: true,
			preserveParens: false,
		});
	} catch {
		return null;
	}
	// Drop `raw` from STRING literals so quote style (`"x"` vs `'x'`) is absorbed
	// — oxfmt normalizes quotes when it can parse, so this only matters for the
	// files it can't (await-in-non-async); the cooked `value` is still compared,
	// so a real string-content difference still fails. Numeric / bigint / regex
	// `raw` is kept (spelling is meaningful and the corpus tracks it).
	stripStringRaw(ast);
	// Drop `shorthand` on object/pattern Property nodes: `{ a }` and `{ a: a }`
	// are the same AST except for this pure-syntax flag (key and value are still
	// compared, so `{ a: b }` still differs). esrap collapses `key: key` to the
	// shorthand form; rsvelte's text-based instance/module transforms emit the
	// source verbatim. Absorbed here, like quote style and source positions.
	return JSON.stringify(ast, (key, value) =>
		key === 'start' || key === 'end' || key === 'loc' || key === 'range' || key === 'shorthand'
			? undefined
			: value
	);
}

function stripStringRaw(node) {
	if (Array.isArray(node)) {
		for (const child of node) stripStringRaw(child);
		return;
	}
	if (node === null || typeof node !== 'object') return;
	if (node.type === 'Literal' && typeof node.value === 'string') {
		node.raw = undefined;
	}
	for (const key in node) {
		if (key === 'start' || key === 'end' || key === 'loc' || key === 'range') continue;
		const v = node[key];
		if (v !== null && typeof v === 'object') stripStringRaw(v);
	}
}

/**
 * True when two JS outputs are structurally identical modulo source position
 * and comments — i.e. the same code, differing only in formatting / comment
 * placement / wrapping. Lets the corpus comparison absorb esrap's positional-
 * comment and template-literal-wrapping cosmetics without the fragility of
 * regex-based text munging. Returns false if either side is unparseable, so
 * genuinely-different code (and unparseable output) still registers as a
 * mismatch.
 */
export function astEquivalent(a, b) {
	const sa = astSignature(a);
	if (sa === null) return false;
	const sb = astSignature(b);
	return sb !== null && sa === sb;
}

export function stripBlankLines(src) {
	const keep = new Set(); // offsets of newlines inside template literals / block comments
	let i = 0;
	const n = src.length;
	let state = 'code'; // code | line-comment | block-comment | squote | dquote | template
	const templateDepth = []; // ${} brace nesting per template level
	while (i < n) {
		const c = src[i];
		const c2 = src[i + 1];
		switch (state) {
			case 'code':
				if (c === '/' && c2 === '/') (state = 'line-comment'), i++;
				else if (c === '/' && c2 === '*') (state = 'block-comment'), i++;
				else if (c === "'") state = 'squote';
				else if (c === '"') state = 'dquote';
				else if (c === '`') (state = 'template'), templateDepth.push(0);
				else if (c === '}' && templateDepth.length && templateDepth[templateDepth.length - 1] === 0) {
					state = 'template';
				} else if (c === '{' && templateDepth.length) {
					templateDepth[templateDepth.length - 1]++;
				} else if (c === '}' && templateDepth.length) {
					templateDepth[templateDepth.length - 1]--;
				}
				break;
			case 'line-comment':
				if (c === '\n') state = 'code';
				break;
			case 'block-comment':
				if (c === '\n') keep.add(i);
				else if (c === '*' && c2 === '/') (state = 'code'), i++;
				break;
			case 'squote':
				if (c === '\\') i++;
				else if (c === "'" || c === '\n') state = 'code';
				break;
			case 'dquote':
				if (c === '\\') i++;
				else if (c === '"' || c === '\n') state = 'code';
				break;
			case 'template':
				if (c === '\\') i++;
				else if (c === '\n') keep.add(i);
				else if (c === '`') (state = 'code'), templateDepth.pop();
				else if (c === '$' && c2 === '{') (state = 'code'), i++;
				break;
		}
		i++;
	}
	const out = [];
	let lineStart = 0;
	for (let j = 0; j <= n; j++) {
		if (j === n || src[j] === '\n') {
			const line = src.slice(lineStart, j);
			if (line.trim() !== '' || keep.has(j)) out.push(line);
			lineStart = j + 1;
		}
	}
	return out.join('\n');
}
