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
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

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

/**
 * Run oxfmt in place over a whole output tree.
 *
 * oxfmt applies the repository's VCS ignore rules to its walk and (since 0.62)
 * `--ignore-path` no longer overrides them, so every corpus output tree — all
 * gitignored — would be silently skipped: zero files formatted, exit 0. The
 * walk therefore starts from a symlink in a directory outside the repository,
 * where no `.git` is found above the root.
 *
 * A canary file guards the whole arrangement: if the pass ever stops touching
 * the tree again, every entry would be compared RAW and the gate would report
 * failures it never measured, so that is a hard error, not a warning.
 */
export function oxfmtTree(tree, { config, label }) {
	const canaryText = 'const   canary   =   1;\n';
	const canary = path.join(tree, 'oxfmt_canary.js');
	fs.writeFileSync(canary, canaryText);
	const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'corpus-oxfmt-'));
	const root = path.join(stage, 'tree');
	fs.symlinkSync(tree, root);
	try {
		const bin = process.env.OXFMT_BIN || 'npx';
		const args = process.env.OXFMT_BIN
			? ['-c', config, '--no-error-on-unmatched-pattern', 'tree']
			: ['oxfmt', '-c', config, '--no-error-on-unmatched-pattern', 'tree'];
		execFileSync(bin, args, {
			cwd: stage,
			stdio: ['ignore', 'ignore', 'pipe'],
			maxBuffer: 1024 * 1024 * 64,
		});
	} catch (e) {
		// oxfmt exits non-zero when some files cannot be parsed (e.g. the official
		// compiler emits `await` inside non-async component functions for async
		// components). Those files are left unformatted in BOTH trees and compared
		// byte-for-byte instead.
		const stderr = e.stderr?.toString() ?? '';
		const unparsable = (stderr.match(/x `|x Expected|x Unexpected/g) ?? []).length;
		console.log(`[${label}]   oxfmt skipped unparsable files (${unparsable} parse diagnostics)`);
	}
	const formatted = fs.readFileSync(canary, 'utf8');
	fs.rmSync(canary, { force: true });
	fs.unlinkSync(root);
	fs.rmSync(stage, { recursive: true, force: true });
	if (formatted === canaryText) {
		console.error(`[${label}] oxfmt formatted NOTHING under ${tree}`);
		console.error('  normalization is a no-op, so every entry would be compared raw — refusing to report results');
		process.exit(3);
	}
}

/** Whether oxfmt can parse one file, checked out of tree so nothing is rewritten. */
export function oxfmtParses(absFile, { config }) {
	if (!fs.existsSync(absFile)) return false;
	const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'corpus-oxfmt-'));
	const copy = path.join(stage, path.basename(absFile));
	fs.copyFileSync(absFile, copy);
	try {
		const bin = process.env.OXFMT_BIN || 'npx';
		const args = process.env.OXFMT_BIN ? ['-c', config, copy] : ['oxfmt', '-c', config, copy];
		execFileSync(bin, args, { stdio: 'ignore' });
		return true;
	} catch {
		return false;
	} finally {
		fs.rmSync(stage, { recursive: true, force: true });
	}
}

/**
 * Read a file if it exists, else `null`. Shared by every verify/cluster
 * script that reads optional per-entry output files (`error.json`,
 * `client.js`, `index.tsx`, …).
 */
export function readIf(p) {
	return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
}

const EXCERPT = 120;
const LEAD = 40;

/**
 * Locate the first line at which two texts diverge, excerpted for display.
 * Returns `null` when the texts are identical. Shared by every verify
 * script's failure-detail reporting.
 *
 * The window is centred on the first differing COLUMN, not on the start of the
 * line: a divergence past column 120 used to leave both sides showing the same
 * prefix, so the evidence a ratchet entry has to be attributed from was absent
 * and two unrelated divergences clustered together under one identical excerpt.
 * Both sides take the same window so the two excerpts stay aligned.
 */
export function firstDiffLine(a, b) {
	const al = a.split('\n');
	const bl = b.split('\n');
	for (let i = 0; i < Math.max(al.length, bl.length); i++) {
		if (al[i] === bl[i]) continue;
		const e = al[i] ?? '<EOF>';
		const c = bl[i] ?? '<EOF>';
		let col = 0;
		while (col < e.length && col < c.length && e[col] === c[col]) col++;
		const start = Math.max(0, col - LEAD);
		const cut = (s) => {
			const head = start > 0 ? '…' : '';
			const body = s.slice(start, start + EXCERPT);
			return head + body + (start + EXCERPT < s.length ? '…' : '');
		};
		return { line: i + 1, column: col + 1, expected: cut(e), actual: cut(c) };
	}
	return null;
}

/**
 * Comment ranges, from the same single-pass scanner `stripBlankLines` uses.
 *
 * A plain regex cannot do this job: a `//` inside a string or template literal
 * starts a "comment" that runs to the end of the line, and the commonest
 * instance in generated Svelte output is `xmlns="http://www.w3.org/2000/svg"` —
 * every inline SVG. Measured on the official compiler's client output, the
 * regex discarded non-comment code from 3429 of 31546 corpus files, and
 * mislabelled 15 of the 231 output-ratchet entries as comment fidelity when
 * their sole difference was a CSS scope class.
 */
function commentRanges(src) {
	const out = [];
	let i = 0;
	const n = src.length;
	let state = 'code';
	let from = 0;
	const templateDepth = [];
	while (i < n) {
		const c = src[i];
		const c2 = src[i + 1];
		switch (state) {
			case 'code':
				if (c === '/' && c2 === '/') (state = 'line-comment'), (from = i), i++;
				else if (c === '/' && c2 === '*') (state = 'block-comment'), (from = i), i++;
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
				if (c === '\n') (state = 'code'), out.push([from, i]);
				break;
			case 'block-comment':
				if (c === '*' && c2 === '/') (state = 'code'), i++, out.push([from, i + 1]);
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
				else if (c === '`') (state = 'code'), templateDepth.pop();
				else if (c === '$' && c2 === '{') (state = 'code'), i++;
				break;
		}
		i++;
	}
	if (state === 'line-comment' || state === 'block-comment') out.push([from, n]);
	return out;
}

function stripComments(src) {
	let out = '';
	let at = 0;
	for (const [from, to] of commentRanges(src)) {
		out += src.slice(at, from);
		at = to;
	}
	return out + src.slice(at);
}

/**
 * What is left of a program once everything a relocated comment can move is
 * gone: the comments, all whitespace, and the trailing comma oxfmt adds when
 * (and only when) it breaks a construct across lines. A comma preceded by
 * another comma is array elision and stays.
 *
 * Two gates classify a divergence with this — `mutate-corpus.mjs`, whose
 * `code-mismatch` / `comment-mismatch` split it defines, and `matrix/run.mjs`.
 * It is a classifier, never a comparison: what a gate reports as the divergence
 * is always the un-normalized text.
 */
export function codeIdentity(source) {
	return (
		stripComments(source)
			.replace(/\s+/g, '')
			.replace(/([^,]),(?=[)\]}])/g, '$1')
			// Quote style is oxfmt's to choose, and it only survives here on pairs
			// oxfmt could not parse. Verified to reclassify 0 of 213 entries — it is
			// in for honest reporting (the first difference shown must be the reason
			// for the verdict), not to change any verdict.
			.replace(/'((?:[^'\\\n]|\\.)*)'/g, (m, inner) => (inner.includes('"') ? m : `"${inner}"`))
	);
}

/**
 * Where the two programs first differ IN THE STRING THE VERDICT WAS COMPUTED
 * FROM. A line-based diff cannot do this job: the leading textual difference is
 * routinely a quote style (oxfmt could not format the pair) or a line break,
 * both of which `codeIdentity` ignores — so a reviewer sees something cosmetic
 * and dismisses a real finding further down.
 */
export function codeDiffWindow(expected, actual) {
	const a = codeIdentity(expected);
	const b = codeIdentity(actual);
	let i = 0;
	while (i < a.length && i < b.length && a[i] === b[i]) i++;
	const from = Math.max(0, i - 40);
	return { expected: a.slice(from, i + 60), actual: b.slice(from, i + 60) };
}
