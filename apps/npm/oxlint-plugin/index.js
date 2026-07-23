// @rsvelte/oxlint-plugin — surfaces rsvelte's Svelte diagnostics (the native
// eslint-plugin-svelte rule ports + the compiler/validator/a11y warning wrap)
// as oxlint rules, so `oxlint` reports Svelte issues in the same pass and the
// same output as its JS/TS rules.
//
// How it works (see ./src/locate.js for the coordinate details): oxlint only
// hands a JS plugin the extracted `<script>` block of a `.svelte` file. On each
// `Program` visit we read the *whole* component from disk, run rsvelte's linter
// over all of it once (cached), then report each diagnostic under `svelte/<id>`.
// Diagnostics inside the current `<script>` block are mapped to accurate
// positions; diagnostics in markup/style (which oxlint's alpha `.svelte`
// support cannot place) are surfaced at the top of the block with their real
// line/column in the message. Scriptless `.svelte` files are not visited by
// oxlint at all — see the README "Limitations".

import { readFileSync } from 'node:fs';

import {
	lineColumnOf,
	lineStarts,
	offsetOf,
	scriptContentRanges,
} from './src/locate.js';
import { lintSource, ruleCatalog } from './src/engine.js';

const PLUGIN_NAME = 'svelte';

// rsvelte native-rule codes carry a `svelte/` prefix; the compiler warning codes
// do not. The oxlint rule name (and catalog `name`) is always the unprefixed id,
// so strip a leading `svelte/` to line diagnostics up with their rule.
function ruleKey(code) {
	return code.startsWith(`${PLUGIN_NAME}/`) ? code.slice(PLUGIN_NAME.length + 1) : code;
}

// Cache the expensive part (running rsvelte over the whole file) keyed by the
// exact source, so all ~160 rule visitors for one file share a single lint.
const MAX_ANALYSIS_CACHE = 64;
const analysisCache = new Map();

function analyze(fullSource, filename) {
	const cached = analysisCache.get(fullSource);
	if (cached) return cached;

	const starts = lineStarts(fullSource);
	const ranges = scriptContentRanges(fullSource);
	const inSomeScript = (offset) => ranges.some((r) => offset >= r.start && offset < r.end);

	const byKey = new Map();
	for (const d of lintSource(fullSource, filename)) {
		const startOffset = offsetOf(starts, d.line, d.column);
		const endOffset = offsetOf(starts, d.endLine, d.endColumn);
		const key = ruleKey(d.code);
		let list = byKey.get(key);
		if (!list) byKey.set(key, (list = []));
		list.push({ ...d, startOffset, endOffset, inScript: inSomeScript(startOffset) });
	}

	const analysis = { byKey };
	if (analysisCache.size >= MAX_ANALYSIS_CACHE) {
		analysisCache.delete(analysisCache.keys().next().value);
	}
	analysisCache.set(fullSource, analysis);
	return analysis;
}

// Per (rule, file) de-dup: a dual-`<script>` component is visited once per
// block, so markup diagnostics would otherwise repeat. `createOnce` runs its
// returned visitor once for the *whole* oxlint invocation, so its closure
// state is shared across every file being linted, and oxlint does not
// guarantee a file's several blocks are visited back-to-back during a
// multi-file run — tracking "the previously seen source" in that shared
// closure breaks as soon as another file's block is visited in between (it
// looks like a new file, so the de-dup set resets and the diagnostic is
// reported again on the next block of the same file).
//
// Keyed by absolute filename in its own cache, deliberately *not* piggybacked
// on `analysisCache` (which is keyed by file *content*, to reuse the one
// expensive lint call across ~160 rule visitors of the same file): two
// distinct files with byte-identical content share one `analysisCache` entry,
// so a reported-state Set living on that shared entry would make the second
// file's diagnostics look "already reported" and silently vanish — trading
// the duplicate-report bug for a worse dropped-report bug. Keeping the two
// caches separate also decouples their eviction: `analysisCache`'s tight
// 64-entry bound (sized for the expensive-relint cost) evicting a file's
// analysis no longer touches this Set, so it can no longer resurrect the
// original duplicate-report bug the way a shared cache entry could.
//
// Bounded generously and independently of `analysisCache` for the same
// reason — a long-lived process (oxlint's LSP/watch mode) must not grow this
// forever, but the bound only needs to be "large enough that this file's
// entry is very unlikely to be evicted between visits to its own blocks",
// not "cheap to recompute" like the content cache. There's no reliable
// "this file's every block visit is now done" signal to release the entry
// on completion instead: blocks and ~160 rules are visited in an
// oxlint-controlled interleaving no single rule's `Program` visitor can
// observe the end of, so eviction-by-size is the only practical option.
const MAX_REPORTED_FILES = 2048;
const reportedByFile = new Map();

function reportedSetFor(filename, ruleName) {
	let perRule = reportedByFile.get(filename);
	if (!perRule) {
		if (reportedByFile.size >= MAX_REPORTED_FILES) {
			reportedByFile.delete(reportedByFile.keys().next().value);
		}
		reportedByFile.set(filename, (perRule = new Map()));
	}
	let set = perRule.get(ruleName);
	if (!set) perRule.set(ruleName, (set = new Set()));
	return set;
}

// Map a whole-file offset span into the current `<script>` block's coordinate
// space (what oxlint's `report({ loc })` expects), using oxlint's *exact*
// extracted text as the origin so it maps back to the right file position.
// Clamped so an out-of-range loc can never throw inside oxlint.
function mapToBlock(blockStarts, blockLen, scriptOffset, startOffset, endOffset) {
	const rel = (o) => Math.min(Math.max(o - scriptOffset, 0), blockLen);
	return {
		start: lineColumnOf(blockStarts, rel(startOffset)),
		end: lineColumnOf(blockStarts, rel(endOffset)),
	};
}

function makeRule(entry) {
	return {
		meta: {
			type: entry.category === 'a11y' || entry.category === 'correctness' ? 'problem' : 'suggestion',
			docs: { description: entry.description },
		},
		createOnce(context) {
			return {
				Program() {
					const filename = context.physicalFilename || context.filename;
					if (!filename || !filename.endsWith('.svelte')) return;

					let fullSource;
					try {
						fullSource = readFileSync(filename, 'utf8');
					} catch {
						return;
					}

					const analysis = analyze(fullSource, filename);
					const diags = analysis.byKey.get(entry.name);
					if (!diags || diags.length === 0) return;
					const emitted = reportedSetFor(filename, entry.name);

					// The block oxlint is showing us right now, in the file's own
					// offsets. Use oxlint's exact extracted text as the origin so our
					// mapped locs land where oxlint expects.
					const blockText = context.sourceCode.text;
					const scriptOffset = fullSource.indexOf(blockText);
					const blockEnd = scriptOffset < 0 ? -1 : scriptOffset + blockText.length;
					const blockStarts = lineStarts(blockText);

					for (const d of diags) {
						const identity = `${d.line}:${d.column}:${d.endLine}:${d.endColumn}:${d.message}`;
						if (emitted.has(identity)) continue;

						if (scriptOffset >= 0 && d.startOffset >= scriptOffset && d.startOffset < blockEnd) {
							// Inside the block currently being visited: map accurately.
							emitted.add(identity);
							context.report({
								message: d.message,
								loc: mapToBlock(blockStarts, blockText.length, scriptOffset, d.startOffset, d.endOffset),
							});
						} else if (!d.inScript) {
							// Markup / style / outside any script block: oxlint cannot place
							// it, so anchor it at the block top and carry the real location
							// in the message.
							emitted.add(identity);
							context.report({
								message: `[${d.line}:${d.column + 1}] ${d.message}`,
								loc: { start: { line: 1, column: 0 } },
							});
						}
						// Diagnostics inside a *different* `<script>` block are left for
						// that block's own visit.
					}
				},
			};
		},
	};
}

const rules = {};
for (const entry of ruleCatalog()) {
	rules[entry.name] = makeRule(entry);
}

/** @type {{ meta: { name: string }, rules: Record<string, unknown> }} */
const plugin = {
	meta: { name: PLUGIN_NAME },
	rules,
};

export default plugin;
