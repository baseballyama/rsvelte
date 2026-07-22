// One-shot Tailwind class sorter for @rsvelte/fmt's `sortTailwindcss` JS path.
//
// A default `@import "tailwindcss";` setup sorts natively in Rust, but a custom
// stylesheet / config (`@theme`, `@plugin`, `@utility`, a v3 `tailwind.config`)
// changes the class order in ways only the real Tailwind engine knows. This
// script drives the same `prettier-plugin-tailwindcss` API oxfmt uses, so the
// result is byte-identical to the oxfmt oracle.
//
// Protocol: one JSON request on stdin, one JSON response on stdout.
//   request : { filepath, stylesheetPath?, configPath?, preserveWhitespace?,
//               preserveDuplicates?, classes: string[] }
//   response: { ok: true, sorted: string[] } | { ok: false, error: string }
//
// Never rejects or exits non-zero for a sort failure: the Rust side treats a
// non-`ok` (or absent) response as "leave classes as they are", so a missing
// plugin or a broken config degrades to unsorted output, never a crash.

// Guard the JSON channel: the plugin or `tailwindcss` may print to stdout (a
// deprecation notice, a debug line), which would corrupt our single-line
// response. Route all stray stdout to stderr and emit only the final JSON on the
// real stdout.
const realStdoutWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = process.stderr.write.bind(process.stderr);

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

	const classes = Array.isArray(req.classes) ? req.classes : [];
	if (classes.length === 0) {
		return { ok: true, sorted: [] };
	}

	let createSorter;
	try {
		({ createSorter } = await import('prettier-plugin-tailwindcss/sorter'));
	} catch (err) {
		return { ok: false, error: `prettier-plugin-tailwindcss not resolvable: ${err && err.message}` };
	}

	const sorter = await createSorter({
		filepath: req.filepath,
		stylesheetPath: req.stylesheetPath,
		configPath: req.configPath,
		preserveWhitespace: req.preserveWhitespace,
		preserveDuplicates: req.preserveDuplicates,
	});
	const sorted = sorter.sortClassAttributes(classes);
	if (!Array.isArray(sorted) || sorted.length !== classes.length) {
		return { ok: false, error: 'sorter returned an unexpected shape' };
	}
	return { ok: true, sorted };
}

function emit(result) {
	realStdoutWrite(JSON.stringify(result));
}

main()
	.then(emit)
	.catch((err) => emit({ ok: false, error: String(err && err.message) }));
