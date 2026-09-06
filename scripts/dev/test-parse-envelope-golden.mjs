#!/usr/bin/env node
// Golden-envelope gate for the binary `parse()` wire format (issue #4284).
//
// The format has two implementations that must agree byte for byte:
// `crates/rsvelte_bindings_support/src/napi_raw_parse.rs` writes it and
// `apps/npm/vite-plugin-svelte-native/parse-envelope.js` reads it. Both carry a
// `VERSION` and the decoder throws on a mismatch — but that check only fires
// when somebody bumps one side. #4249 added two fields to a node's payload and
// bumped neither, so a writer and a decoder built from different commits read
// different offsets off the same bytes and produce a SILENT MISREAD rather than
// the throw the check exists for.
//
// Asserting the two `VERSION` literals are equal does NOT catch that: they were
// equal and consistent throughout. What catches it is encoding a known AST with
// the real writer and requiring the real decoder to reproduce a frozen JSON —
// a layout change that only one side made cannot survive it, and a layout change
// both sides made still fails until the golden is regenerated, which is where
// the author is looking at the layout and can decide about `VERSION`.
//
// The byte hash is asserted as well as the decoded JSON, because the two answer
// different questions. The JSON catches writer/decoder skew; the hash catches a
// layout change that happens to decode to the same tree, and makes the diff say
// so out loud.
//
// Regenerate deliberately: `UPDATE_PARSE_ENVELOPE_GOLDEN=1 pnpm run test:parse-envelope-golden`
// Prereq: `pnpm run build:vps-native`.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');
const goldenPath = resolve(here, 'parse-envelope-golden.json');
const update = process.env.UPDATE_PARSE_ENVELOPE_GOLDEN === '1';

let pass = 0;
let fail = 0;
function assert(label, cond, detail) {
	if (cond) {
		pass += 1;
		console.log(`  ok   ${label}`);
	} else {
		fail += 1;
		console.error(`  FAIL ${label}${detail ? `\n       ${detail}` : ''}`);
	}
}

// ---------------------------------------------------------------------------
// The input. Deliberately small and boring: every node in it is a shape the
// parser has emitted the same way for a long time, so this gate goes red for a
// wire-layout change rather than for parser churn. It still crosses the
// payload kinds the envelope encodes differently — a script with a function
// declaration (rest parameter, default), template blocks, an attribute, a
// directive, an expression tag, a comment, and a `<style>` (which the writer
// hands to the JSON fallback).
// ---------------------------------------------------------------------------
const GOLDEN_SOURCE = [
	'<script>',
	'\tlet items = [1, 2];',
	'\tlet promise = Promise.resolve(1);',
	'\tfunction sum(seed = 0, ...rest) {',
	'\t\treturn rest.reduce((a, b) => a + b, seed);',
	'\t}',
	'</script>',
	'',
	'<!-- a comment -->',
	'<div class="box" on:click={() => sum(1, 2)}>',
	'\t{#each items as item, i}',
	'\t\t{@const doubled = item * 2}',
	'\t\t<span>{doubled}{i}</span>',
	'\t{/each}',
	'\t{#await promise then value}',
	'\t\t{value}',
	'\t{/await}',
	'</div>',
	'',
	'<style>',
	'\t.box { color: red; }',
	'</style>',
	'',
].join('\n');

// ---------------------------------------------------------------------------
// Load the raw addon. Exactly one addon per process — two rsvelte addons
// required into the same process have been observed to SIGSEGV.
// ---------------------------------------------------------------------------
function resolveTriple() {
	const { platform, arch } = process;
	if (platform === 'darwin') {
		if (arch === 'arm64') return 'darwin-arm64';
		if (arch === 'x64') return 'darwin-x64';
	} else if (platform === 'linux') {
		let isMusl = false;
		try {
			isMusl = !process.report.getReport().header.glibcVersionRuntime;
		} catch {
			isMusl = false;
		}
		const libc = isMusl ? 'musl' : 'gnu';
		if (arch === 'x64') return `linux-x64-${libc}`;
		if (arch === 'arm64') return `linux-arm64-${libc}`;
	} else if (platform === 'win32') {
		if (arch === 'x64') return 'win32-x64-msvc';
	}
	return null;
}

const triple = resolveTriple();
if (!triple) {
	console.error(`[parse-envelope-golden] unsupported platform ${process.platform}/${process.arch}`);
	process.exit(2);
}
const addonPath = resolve(repoRoot, `apps/npm/vite-plugin-svelte-native-${triple}/rsvelte.node`);
const require_ = createRequire(import.meta.url);
let napi;
try {
	napi = require_(addonPath);
} catch (e) {
	console.error(
		`[parse-envelope-golden] cannot load ${addonPath}\n  run \`pnpm run build:vps-native\` first\n  ${e.message}`
	);
	process.exit(2);
}

const decoderPath = resolve(repoRoot, 'apps/npm/vite-plugin-svelte-native/parse-envelope.js');
const { decodeParseEnvelope } = require_(decoderPath);

// ---------------------------------------------------------------------------
// Encode with the real writer.
// ---------------------------------------------------------------------------
const buf = Buffer.from(napi.parseEnvelope(GOLDEN_SOURCE));
const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
const magic = view.getUint32(0, true);
const version = view.getUint32(4, true);
const sha256 = createHash('sha256').update(buf).digest('hex');

// The decoder's own literal, read out of its source rather than copied here:
// a third copy of the number is exactly what this gate exists to make
// unnecessary.
const decoderSource = readFileSync(decoderPath, 'utf8');
const decoderVersionMatch = decoderSource.match(/^const VERSION = (\d+);$/m);
assert('the decoder declares a VERSION literal this gate can read', decoderVersionMatch !== null);
const decoderVersion = decoderVersionMatch ? Number(decoderVersionMatch[1]) : null;

assert('the envelope carries the "RPV1" magic', magic === 0x3156_5052, `got 0x${magic.toString(16)}`);
assert(
	"the writer's version word equals the decoder's VERSION",
	version === decoderVersion,
	`writer ${version} vs decoder ${decoderVersion}`
);

// ---------------------------------------------------------------------------
// Decode with the real decoder. This is the half that a one-sided layout
// change cannot pass.
// ---------------------------------------------------------------------------
let decoded = null;
try {
	decoded = decodeParseEnvelope(buf);
	assert('the decoder accepts the writer output', true);
} catch (e) {
	assert('the decoder accepts the writer output', false, e.message);
}

if (update) {
	writeFileSync(
		goldenPath,
		`${JSON.stringify({ source: GOLDEN_SOURCE, version, byteLength: buf.byteLength, sha256, ast: decoded }, null, '\t')}\n`
	);
	console.log(`[parse-envelope-golden] wrote ${goldenPath}`);
	console.log(`  version=${version} byteLength=${buf.byteLength} sha256=${sha256}`);
	process.exit(0);
}

let golden;
try {
	golden = JSON.parse(readFileSync(goldenPath, 'utf8'));
} catch (e) {
	console.error(
		`[parse-envelope-golden] cannot read ${goldenPath}\n  ${e.message}\n` +
			'  regenerate with UPDATE_PARSE_ENVELOPE_GOLDEN=1'
	);
	process.exit(2);
}

const REGEN =
	'the wire layout moved. Bump VERSION in crates/rsvelte_bindings_support/src/napi_raw_parse.rs, ' +
	'apps/npm/vite-plugin-svelte-native/parse-envelope.js and ' +
	'scripts/dev/test-parse-envelope-validation.mjs, then regenerate with ' +
	'UPDATE_PARSE_ENVELOPE_GOLDEN=1 pnpm run test:parse-envelope-golden';

assert(
	'the golden was generated from this source',
	golden.source === GOLDEN_SOURCE,
	'the input changed without the golden being regenerated'
);
assert(
	'the envelope byte length is unchanged',
	golden.byteLength === buf.byteLength,
	`golden ${golden.byteLength} vs ${buf.byteLength} — ${REGEN}`
);
assert(
	'the envelope bytes are unchanged',
	golden.sha256 === sha256,
	`golden ${golden.sha256} vs ${sha256} — ${REGEN}`
);
assert(
	'the decoded tree is unchanged',
	JSON.stringify(decoded) === JSON.stringify(golden.ast),
	`the decoder produced a different tree from the same input — ${REGEN}`
);
assert(
	'the golden records the version it was generated with',
	golden.version === version,
	`golden ${golden.version} vs writer ${version}`
);

console.log(`\n[parse-envelope-golden] ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
