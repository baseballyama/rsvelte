// Regression test for the envelope decoder's bounds validation (M-012).
//
// Hand-crafts valid and deliberately-corrupted envelopes (no NAPI
// binding required) and asserts that `decodeEnvelope` / `decodeBatch`
// throw on out-of-range offsets/lengths instead of silently truncating.

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '../..');
const { decodeEnvelope, decodeBatch } = await import(
	`file://${join(repoRoot, 'apps/npm/vite-plugin-svelte-native/envelope.js')}`
).then((m) => m.default ?? m);

const MAGIC = 0x31565352;
const VERSION = 1;
const HEADER_LEN = 60;
const BATCH_MAGIC = 0x42565352;
const BATCH_VERSION = 1;
const BATCH_HEADER_LEN = 16;
const BATCH_ENTRY_LEN = 12;

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

// --- builders --------------------------------------------------------------

// Build a v1 envelope. `over` lets a test scribble raw header values
// over the (otherwise-correct) ones to simulate corruption.
function buildEnvelope({ jsCode = '', jsMap = null, warnings = [] } = {}, over = {}) {
	const jsCodeBytes = Buffer.from(jsCode, 'utf8');
	const jsMapBytes = jsMap == null ? null : Buffer.from(jsMap, 'utf8');
	const warnBytes = Buffer.concat(warnings.map(encodeWarning));

	const jsCodeOff = HEADER_LEN;
	const jsMapOff = jsMapBytes ? jsCodeOff + jsCodeBytes.length : 0;
	const warningsOff = jsCodeOff + jsCodeBytes.length + (jsMapBytes ? jsMapBytes.length : 0);
	const total = warningsOff + warnBytes.length;

	const buf = Buffer.alloc(total);
	buf.writeUInt32LE(MAGIC, 0);
	buf.writeUInt32LE(VERSION, 4);
	buf.writeUInt32LE(total, 8);
	buf.writeUInt32LE(0, 12); // flags — no css
	buf.writeUInt32LE(jsCodeOff, 16);
	buf.writeUInt32LE(jsCodeBytes.length, 20);
	buf.writeUInt32LE(jsMapOff, 24);
	buf.writeUInt32LE(jsMapBytes ? jsMapBytes.length : 0, 28);
	buf.writeUInt32LE(warningsOff, 48);
	buf.writeUInt32LE(warnings.length, 52);
	buf.writeUInt32LE(warnBytes.length, 56);

	jsCodeBytes.copy(buf, jsCodeOff);
	if (jsMapBytes) jsMapBytes.copy(buf, jsMapOff);
	warnBytes.copy(buf, warningsOff);

	for (const [offset, value] of Object.entries(over)) {
		buf.writeUInt32LE(value >>> 0, Number(offset));
	}
	return buf;
}

function encodeWarning(w) {
	const code = Buffer.from(w.code ?? '', 'utf8');
	const msg = Buffer.from(w.message ?? '', 'utf8');
	const parts = [u32(code.length), code, u32(msg.length), msg, Buffer.from([0])];
	return Buffer.concat(parts);
}
function u32(n) {
	const b = Buffer.alloc(4);
	b.writeUInt32LE(n >>> 0, 0);
	return b;
}

function buildBatch(payloads, over = {}) {
	const count = payloads.length;
	const tableLen = count * BATCH_ENTRY_LEN;
	const body = Buffer.concat(payloads.map((p) => p.buf));
	const total = BATCH_HEADER_LEN + tableLen + body.length;
	const buf = Buffer.alloc(total);
	buf.writeUInt32LE(BATCH_MAGIC, 0);
	buf.writeUInt32LE(BATCH_VERSION, 4);
	buf.writeUInt32LE(total, 8);
	buf.writeUInt32LE(count, 12);
	let payloadOff = BATCH_HEADER_LEN + tableLen;
	for (let i = 0; i < count; i++) {
		const entryOff = BATCH_HEADER_LEN + i * BATCH_ENTRY_LEN;
		buf.writeUInt32LE(payloads[i].status, entryOff);
		buf.writeUInt32LE(payloadOff, entryOff + 4);
		buf.writeUInt32LE(payloads[i].buf.length, entryOff + 8);
		payloads[i].buf.copy(buf, payloadOff);
		payloadOff += payloads[i].buf.length;
	}
	for (const [offset, value] of Object.entries(over)) {
		buf.writeUInt32LE(value >>> 0, Number(offset));
	}
	return buf;
}

// --- tests -----------------------------------------------------------------

console.log('=== envelope decoder bounds validation (M-012) ===\n');

console.log('valid envelopes still decode:');
const good = expectNoThrow('js.code-only envelope decodes', () =>
	decodeEnvelope(buildEnvelope({ jsCode: 'let x = 1;' })),
);
if (good) assertEq('js.code round-trips', good.js.code, 'let x = 1;');

const withWarn = expectNoThrow('envelope with one warning decodes', () =>
	decodeEnvelope(buildEnvelope({ jsCode: 'x', warnings: [{ code: 'a11y_x', message: 'bad' }] })),
);
if (withWarn) {
	assertEq('warnings length', withWarn.warnings.length, 1);
	assertEq('warning code', withWarn.warnings[0].code, 'a11y_x');
}

console.log('\nmalformed envelopes throw:');
// jsCodeLen far beyond the buffer (offset 20).
expectThrow(
	'oversized js.code length throws',
	() => decodeEnvelope(buildEnvelope({ jsCode: 'x' }, { 20: 0xffffff })),
	/js\.code out of bounds/,
);
// jsMapOff points past the end (offset 24) with a non-zero len (offset 28).
expectThrow(
	'js.map offset past buffer throws',
	() => decodeEnvelope(buildEnvelope({ jsCode: 'x' }, { 24: 0xffffff, 28: 4 })),
	/js\.map out of bounds/,
);
// warnings region length too large (offset 56), warnings touched lazily.
expectThrow(
	'oversized warnings region throws on read',
	() => {
		const r = decodeEnvelope(
			buildEnvelope({ jsCode: 'x', warnings: [{ code: 'c', message: 'm' }] }, { 56: 0xffffff }),
		);
		void r.warnings;
	},
	/warnings out of bounds/,
);
// warnings region is the right size, but an internal code length is corrupt.
expectThrow(
	'corrupt warning code length throws on read',
	() => {
		const buf = buildEnvelope({ jsCode: 'x', warnings: [{ code: 'c', message: 'm' }] });
		// The first warning's code-length u32 sits at warningsOff (read it back).
		const warningsOff = buf.readUInt32LE(48);
		buf.writeUInt32LE(0xffff, warningsOff); // claim a 64KB code field
		void decodeEnvelope(buf).warnings;
	},
	/truncated warning/,
);
// too small to even hold a header.
expectThrow(
	'sub-header buffer throws',
	() => decodeEnvelope(Buffer.alloc(HEADER_LEN - 1)),
	/too small/,
);

console.log('\nbatch envelopes:');
const okPayload = { status: 0, buf: buildEnvelope({ jsCode: 'let a = 1;' }) };
const errPayload = { status: 1, buf: Buffer.from('parse error', 'utf8') };
const batch = expectNoThrow('valid mixed batch decodes', () =>
	decodeBatch(buildBatch([okPayload, errPayload])),
);
if (batch) {
	assertEq('batch length', batch.length, 2);
	assertEq('batch[0] ok', batch[0] instanceof Error, false);
	assertEq('batch[1] err', batch[1] instanceof Error, true);
}
// Corrupt entry-0 payload length (entry table starts at 16; len field at +8).
expectThrow(
	'batch payload past buffer throws',
	() => decodeBatch(buildBatch([okPayload, errPayload], { [BATCH_HEADER_LEN + 8]: 0xffffff })),
	/batch entry 0 out of bounds/,
);
// Corrupt entry count (offset 12) so the entry table overruns the buffer.
expectThrow(
	'batch entry table overrun throws',
	() => decodeBatch(buildBatch([okPayload], { 12: 0xffff })),
	/batch entry table/,
);

console.log('');
if (failures) {
	console.error(`❌ ${failures} assertion(s) failed`);
	process.exit(1);
} else {
	console.log('✅ all envelope-validation assertions passed');
}
