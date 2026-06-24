// Persistent oxfmt formatting daemon for @rsvelte/fmt (POSIX).
//
// Spawning `oxfmt` per `<style>` block pays a Node cold start (~370ms measured)
// every time — the dominant cost when format-on-save re-formats a changed CSS
// block. This long-lived process keeps oxfmt warm: the Rust binary connects
// over a Unix socket and sends already-resolved format requests, getting
// results back in ~ms instead of paying a fresh Node start per block.
//
// Deliberately "dumb": the Rust side resolves the per-file oxfmt options (base
// `.oxfmtrc` + the per-`<style>` print width) and sends them inline, so this
// daemon never touches config files or `overrides` — it just calls
// `format(fileName, content, options)`. That keeps the byte output identical to
// the spawn path (same engine, same options) with no config logic to drift.
//
// Protocol: newline-delimited JSON over the socket.
//   request : {"id": <number>, "fileName": "inline.css", "content": "...",
//              "options": { ...oxfmt FormatConfig... }}
//   response: {"id": <number>, "ok": <bool>, "code": "..."}            (success)
//             {"id": <number>, "ok": false, "code": "...", "error": "..."} (format
//              errors — `code` echoes the input unchanged, matching how the CLI
//              leaves an unparseable file untouched)
//
// Lifecycle: the socket path is version-keyed by the Rust side (oxfmt
// fingerprint + this protocol version), so an oxfmt upgrade naturally starts a
// fresh daemon. The daemon exits after `IDLE_TIMEOUT_MS` with no activity, and
// loses the listen race (EADDRINUSE) cleanly when another instance got there
// first.

import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Bump when the wire protocol changes. The Rust side mixes this into the socket
// path so old and new binaries never share an incompatible daemon.
const PROTOCOL_VERSION = 1;
const IDLE_TIMEOUT_MS = 60_000;

const socketPath = process.argv[2];
const oxfmtPkgDir = process.argv[3];

if (!socketPath || !oxfmtPkgDir) {
	console.error('usage: daemon.mjs <socketPath> <oxfmtPkgDir>');
	process.exit(2);
}

/// Resolve oxfmt's ESM entry from its package directory and import `format`.
/// Reading the package's own `package.json` keeps this robust across oxfmt
/// versions (no hard-coded `dist/index.js`).
async function loadOxfmtFormat(pkgDir) {
	const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
	const exp = pkgJson.exports && pkgJson.exports['.'];
	const entryRel =
		(exp && (exp.default || exp.import || (typeof exp === 'string' ? exp : null))) ||
		pkgJson.module ||
		pkgJson.main ||
		'index.js';
	const entryUrl = pathToFileURL(path.join(pkgDir, entryRel));
	const mod = await import(entryUrl.href);
	if (typeof mod.format !== 'function') {
		throw new Error('oxfmt module has no format() export');
	}
	return mod.format;
}

let format;
try {
	format = await loadOxfmtFormat(oxfmtPkgDir);
} catch (err) {
	// Can't load oxfmt — never listen, so the client's connect fails fast and it
	// falls back to spawning oxfmt directly.
	console.error(`[rsvelte-fmt daemon] failed to load oxfmt: ${err.message}`);
	process.exit(1);
}

let idleTimer = null;
function resetIdle() {
	if (idleTimer) clearTimeout(idleTimer);
	idleTimer = setTimeout(() => {
		server.close(() => cleanupAndExit(0));
	}, IDLE_TIMEOUT_MS);
}

function cleanupAndExit(code) {
	try {
		fs.unlinkSync(socketPath);
	} catch {
		// already gone
	}
	process.exit(code);
}

async function handleRequest(req) {
	const { id, fileName, content, options } = req;
	try {
		const result = await format(fileName, content, options || {});
		const ok = !result.errors || result.errors.length === 0;
		// On parse/format errors the CLI leaves the file unchanged; mirror that by
		// echoing the input so the caller round-trips it (and doesn't cache it).
		return { id, ok, code: ok ? result.code : content };
	} catch (err) {
		return { id, ok: false, code: content, error: String(err && err.message ? err.message : err) };
	}
}

const server = net.createServer((socket) => {
	resetIdle();
	socket.setEncoding('utf8');
	let buf = '';
	socket.on('data', (chunk) => {
		resetIdle();
		buf += chunk;
		let nl;
		while ((nl = buf.indexOf('\n')) >= 0) {
			const line = buf.slice(0, nl);
			buf = buf.slice(nl + 1);
			if (!line) continue;
			let req;
			try {
				req = JSON.parse(line);
			} catch {
				continue; // ignore malformed lines
			}
			// Process concurrently; respond as each completes (client matches by id).
			handleRequest(req).then((res) => {
				if (!socket.destroyed) socket.write(JSON.stringify(res) + '\n');
			});
		}
	});
	socket.on('error', () => {
		// Client went away mid-request; nothing to do.
	});
});

server.on('error', (err) => {
	if (err.code === 'EADDRINUSE') {
		// Another daemon won the race (or a stale socket the client will clear and
		// retry). Exit without removing the socket — it isn't ours.
		process.exit(0);
	}
	console.error(`[rsvelte-fmt daemon] server error: ${err.message}`);
	process.exit(1);
});

// A stale socket file from a crashed prior daemon would block listen with
// EADDRINUSE even though nothing is listening. The client unlinks a confirmed-
// stale socket before spawning us, so here we just listen; a genuine race
// surfaces as EADDRINUSE above and we bow out.
server.listen(socketPath, () => {
	resetIdle();
});

for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
	process.on(sig, () => cleanupAndExit(0));
}
