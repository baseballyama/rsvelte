// Regression test for the parse-envelope decoder's bounds validation
// (same class of check as scripts/dev/test-envelope-validation.mjs, but
// for the parse envelope instead of the compile envelope).
//
// Hand-crafts a minimal valid parse envelope (a single TAG_JSON root node,
// see `napi_raw_parse.rs` for the wire format) plus deliberately-corrupted
// variants, and asserts that `decodeParseEnvelope` throws on out-of-range
// string/JSON windows instead of silently truncating.

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '../..');
const { decodeParseEnvelope } = await import(
	`file://${join(repoRoot, 'apps/npm/vite-plugin-svelte-native/parse-envelope.js')}`
).then((m) => m.default ?? m);

const MAGIC = 0x3156_5052; // "RPV1"
const VERSION = 4;
const HEADER_LEN = 24;
const TAG_JSON = 0x00;
const JS_IDENTIFIER = 0x80;
const FLAG_JSNODE_NO_LOC = 1 << 0;

let failures = 0;
function ok(label) {
	console.log(`  ✓ ${label}`);
}
function fail(label, detail) {
	failures++;
	console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`);
}
function expectThrow(label, fn, matcher) {
	let threw = null;
	try {
		fn();
	} catch (e) {
		threw = e;
	}
	if (!threw) return fail(label, 'expected a throw, got none');
	if (matcher && !matcher.test(threw.message)) {
		return fail(label, `message ${JSON.stringify(threw.message)} !~ ${matcher}`);
	}
	ok(label);
}
function expectNoThrow(label, fn) {
	try {
		const v = fn();
		ok(label);
		return v;
	} catch (e) {
		fail(label, e.message);
		return null;
	}
}
function assertEq(label, a, b) {
	if (a === b) ok(label);
	else fail(label, `${JSON.stringify(a)} !== ${JSON.stringify(b)}`);
}

// Build a minimal v1 parse envelope: header + one TAG_JSON root node whose
// payload is a length-prefixed JSON string. `over` scribbles raw values over
// (otherwise-correct) byte offsets to simulate corruption.
function buildParseEnvelope(json, over = {}) {
	const jsonBytes = Buffer.from(json, 'utf8');
	const rootOffset = HEADER_LEN;
	// root node: tag(1) + start(4) + end(4) + jsonLen(4) + jsonBytes
	const nodeLen = 1 + 4 + 4 + 4 + jsonBytes.length;
	const total = HEADER_LEN + nodeLen;

	const buf = Buffer.alloc(total);
	buf.writeUInt32LE(MAGIC, 0);
	buf.writeUInt32LE(VERSION, 4);
	buf.writeUInt32LE(total, 8);
	buf.writeUInt32LE(rootOffset, 12);
	buf.writeUInt32LE(0, 16); // source_len — unused by the decoder
	buf.writeUInt32LE(0, 20); // flags

	let p = rootOffset;
	buf.writeUInt8(TAG_JSON, p);
	p += 1;
	buf.writeUInt32LE(0, p); // start
	p += 4;
	buf.writeUInt32LE(0, p); // end
	p += 4;
	buf.writeUInt32LE(jsonBytes.length, p); // json len
	p += 4;
	jsonBytes.copy(buf, p);

	for (const [offset, value] of Object.entries(over)) {
		buf.writeUInt32LE(value >>> 0, Number(offset));
	}
	return buf;
}

// Build a minimal v1 envelope whose root is a JS_IDENTIFIER node (exercises
// `readStr`, as opposed to `buildParseEnvelope`'s TAG_JSON which exercises
// `readInlineJson`). `FLAG_JSNODE_NO_LOC` is set so `readTypedLoc` is a no-op.
function buildIdentifierEnvelope(name, over = {}) {
	const nameBytes = Buffer.from(name, 'utf8');
	const rootOffset = HEADER_LEN;
	// node: tag(1) + start(4) + end(4) + nameLen(4) + nameBytes + optionalFlag(1) + typeAnnotationFlag(1)
	const nodeLen = 1 + 4 + 4 + 4 + nameBytes.length + 1 + 1;
	const total = HEADER_LEN + nodeLen;

	const buf = Buffer.alloc(total);
	buf.writeUInt32LE(MAGIC, 0);
	buf.writeUInt32LE(VERSION, 4);
	buf.writeUInt32LE(total, 8);
	buf.writeUInt32LE(rootOffset, 12);
	buf.writeUInt32LE(0, 16); // source_len
	buf.writeUInt32LE(FLAG_JSNODE_NO_LOC, 20);

	let p = rootOffset;
	buf.writeUInt8(JS_IDENTIFIER, p);
	p += 1;
	buf.writeUInt32LE(0, p); // start
	p += 4;
	buf.writeUInt32LE(0, p); // end
	p += 4;
	buf.writeUInt32LE(nameBytes.length, p); // name len
	p += 4;
	nameBytes.copy(buf, p);
	p += nameBytes.length;
	buf.writeUInt8(0, p); // optional = false
	p += 1;
	buf.writeUInt8(0, p); // no typeAnnotation

	for (const [offset, value] of Object.entries(over)) {
		buf.writeUInt32LE(value >>> 0, Number(offset));
	}
	return buf;
}

console.log('=== parse-envelope decoder bounds validation (M-012) ===\n');

console.log('valid envelopes still decode:');
const good = expectNoThrow('minimal JSON-root envelope decodes', () =>
	decodeParseEnvelope(buildParseEnvelope('{"type":"Foo","value":1}')),
);
if (good) assertEq('root round-trips', good.type, 'Foo');

const goodId = expectNoThrow('minimal identifier-root envelope decodes', () =>
	decodeParseEnvelope(buildIdentifierEnvelope('foo')),
);
if (goodId) assertEq('identifier name round-trips', goodId.name, 'foo');

console.log('\nmalformed envelopes throw:');
// The inline-JSON length field sits right after the node preamble
// (HEADER_LEN + 1 tag byte + 4 start + 4 end = offset 33).
const jsonLenOffset = HEADER_LEN + 1 + 4 + 4;
expectThrow(
	'oversized inline JSON length throws',
	() => decodeParseEnvelope(buildParseEnvelope('{"type":"Foo"}', { [jsonLenOffset]: 0xffffff })),
	/inline JSON out of bounds/,
);
// The identifier name-length field sits at the same relative offset.
const nameLenOffset = HEADER_LEN + 1 + 4 + 4;
expectThrow(
	'oversized string length throws',
	() => decodeParseEnvelope(buildIdentifierEnvelope('foo', { [nameLenOffset]: 0xffffff })),
	/string out of bounds/,
);
// too small to even hold a header.
expectThrow(
	'sub-header buffer throws',
	() => decodeParseEnvelope(Buffer.alloc(HEADER_LEN - 1)),
	/buffer too small/,
);
// bad magic.
expectThrow(
	'bad magic throws',
	() => {
		const buf = buildParseEnvelope('{"type":"Foo"}');
		buf.writeUInt32LE(0, 0);
		decodeParseEnvelope(buf);
	},
	/bad magic/,
);

console.log('');
if (failures) {
	console.error(`❌ ${failures} assertion(s) failed`);
	process.exit(1);
} else {
	console.log('✅ all parse-envelope-validation assertions passed');
}
