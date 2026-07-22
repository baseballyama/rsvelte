// One-shot warning-filter sidecar for @rsvelte/svelte-check.
//
// `compilerOptions.warningFilter` is a JS predicate the native Rust compiler
// can't evaluate. This script imports the project's Svelte config, pulls out the
// function, and applies it to the batch of warnings collected across the whole
// run — a single post-pass that is exactly equivalent to Svelte's emit-time
// filter (it's a pure per-warning predicate).
//
// Protocol: one JSON request on stdin, one framed JSON response on stdout.
//   request : { configPath, warnings: Warning[] }
//   response: { ok: true, keep: boolean[] } | { ok: false, error: string }
//
// Never rejects or exits non-zero: the Rust side treats a non-`ok` (or absent)
// response as "keep every warning", so a missing config or a throwing filter
// fails open — a warningFilter that can't run must never silently drop warnings.

import { pathToFileURL } from 'node:url';

// Guard the JSON channel: importing the config may print to stdout (a banner, a
// debug line). Route all stray stdout to stderr and emit only the framed JSON on
// the real stdout.
const realStdoutWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = process.stderr.write.bind(process.stderr);

// A native addon can write straight to fd 1, bypassing the patch above. Framing
// the response between markers lets the Rust side extract only the payload. Kept
// byte-identical to `RESP_MARKER` in `warning_filter.rs`.
const RESP_MARKER = '\x00<<rsvelte-warning-filter>>\x00';

function readStdin() {
	return new Promise((resolve) => {
		let data = '';
		process.stdin.setEncoding('utf8');
		process.stdin.on('data', (chunk) => {
			data += chunk;
		});
		process.stdin.on('end', () => resolve(data));
		process.stdin.on('error', () => resolve(data));
	});
}

async function main() {
	let req;
	try {
		req = JSON.parse(await readStdin());
	} catch (err) {
		return { ok: false, error: `invalid request: ${err && err.message}` };
	}

	const warnings = Array.isArray(req.warnings) ? req.warnings : [];
	if (warnings.length === 0) {
		return { ok: true, keep: [] };
	}

	let mod;
	try {
		mod = await import(pathToFileURL(req.configPath).href);
	} catch (err) {
		return { ok: false, error: `config not importable: ${err && err.message}` };
	}

	const config = mod && mod.default != null ? mod.default : mod;
	const filter = config && config.compilerOptions && config.compilerOptions.warningFilter;
	if (typeof filter !== 'function') {
		// No usable filter after loading: keep everything (fail open).
		return { ok: true, keep: warnings.map(() => true) };
	}

	const keep = warnings.map((warning) => {
		try {
			// Match Svelte's `if (!warning_filter(warning)) return;` — a *truthiness*
			// test, so any falsy return (`undefined`/`0`/`''`/`null`/`NaN`) drops the
			// warning, not only a strict `false`.
			return Boolean(filter(warning));
		} catch {
			// A throwing predicate keeps the warning rather than dropping it.
			return true;
		}
	});
	return { ok: true, keep };
}

function emit(result) {
	realStdoutWrite(RESP_MARKER + JSON.stringify(result) + RESP_MARKER);
}

main()
	.then(emit)
	.catch((err) => emit({ ok: false, error: String(err && err.message) }));
