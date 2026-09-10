#!/usr/bin/env node
// Gate for the compiler-only wasm (`crates/rsvelte_compiler_wasm`, #4541): the
// artifact must carry the compiler surface and NOT the lint engine or
// svelte2tsx, and its `compileModule` must agree with official Svelte.
//
// The absence assertions are the point of the crate, and an absence assertion
// passes vacuously on a module that failed to load — so the presence half runs
// first and its failure is what separates "lint is gone" from "nothing is here".
//
// Prereq: `pnpm run build:wasm:compiler`.

import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { compile as officialCompile, compileModule as officialCompileModule } from 'svelte/compiler';

const jsUrl = new URL('../../pkg-compiler/rsvelte_compiler.js', import.meta.url).href;
const wasmPath = fileURLToPath(new URL('../../pkg-compiler/rsvelte_compiler_bg.wasm', import.meta.url));

const compiler = await import(jsUrl);
compiler.initSync({ module: readFileSync(wasmPath) });

let pass = 0;
let fail = 0;
function assert(name, cond, detail) {
	if (cond) {
		pass += 1;
		console.log(`  ok   ${name}`);
	} else {
		fail += 1;
		console.error(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
	}
}

const exported = Object.keys(compiler).sort();
console.log(`exports (${exported.length}): ${exported.join(', ')}`);
console.log(`wasm size: ${statSync(wasmPath).size} bytes`);

for (const name of ['compile', 'compileModule', 'compile_client', 'compile_server', 'parse_svelte', 'version']) {
	assert(`exports ${name}`, typeof compiler[name] === 'function');
}
for (const name of ['lint', 'lint_with_config', 'lint_rules', 'lint_version', 'svelte2tsx']) {
	assert(`does not export ${name}`, compiler[name] === undefined);
}

const compile = (source, options) => JSON.parse(compiler.compile(source, options));
const compileModule = (source, options) => JSON.parse(compiler.compileModule(source, options));

// Official Svelte is the oracle on both entry points. Comparing this port to
// rsvelte's NAPI port instead would pass if both drifted the same way (#3664).
const componentSource = '<script>let count = $state(0);</script><h1>{count}</h1>';
for (const generate of ['client', 'server']) {
	const mine = compile(componentSource, { filename: 'C.svelte', generate });
	const official = officialCompile(componentSource, { filename: 'C.svelte', generate });
	assert(
		`compile(${generate}) matches official`,
		mine.js.code === official.js.code,
		`${mine.js.code.length} vs ${official.js.code.length} bytes`,
	);
}

const moduleSource = [
	'export function createCounter() {',
	'\tlet count = $state(0);',
	'\tconst doubled = $derived(count * 2);',
	'\treturn { get count() { return count; }, get doubled() { return doubled; } };',
	'}',
	'',
].join('\n');
for (const generate of ['client', 'server']) {
	const options = { filename: 'm.svelte.js', generate };
	const mine = compileModule(moduleSource, options);
	const official = officialCompileModule(moduleSource, options);
	assert(
		`compileModule(${generate}) matches official`,
		mine.js.code === official.js.code,
		`${mine.js.code.length} vs ${official.js.code.length} bytes`,
	);
	// Read the envelope off the oracle rather than writing the four constants
	// out here: they are official's answer, not this port's convention.
	for (const field of ['css', 'metadata', 'ast']) {
		assert(
			`compileModule(${generate}) ${field} matches official`,
			JSON.stringify(mine[field]) === JSON.stringify(official[field]),
			JSON.stringify({ mine: mine[field], official: official[field] }),
		);
	}
}

// A module compiled with `dev` differs from one without it, so the options
// object reaches the module compiler rather than being dropped on the floor.
// The oracle answers the same way, which is what makes the inequality a
// property of the input and not of this port.
const devModule = compileModule(moduleSource, { filename: 'm.svelte.js', generate: 'client', dev: true });
const prodModule = compileModule(moduleSource, { filename: 'm.svelte.js', generate: 'client', dev: false });
const officialDevDiffers =
	officialCompileModule(moduleSource, { filename: 'm.svelte.js', generate: 'client', dev: true }).js.code !==
	officialCompileModule(moduleSource, { filename: 'm.svelte.js', generate: 'client', dev: false }).js.code;
assert(
	'compileModule forwards dev',
	officialDevDiffers && devModule.js.code !== prodModule.js.code,
	JSON.stringify({ officialDevDiffers }),
);

function thrownBy(fn) {
	try {
		fn();
		return null;
	} catch (error) {
		return {
			code: error?.code ?? null,
			message: String(error?.message ?? error).split('\n')[0],
		};
	}
}
// Two of these throw and one does not (`legacy` is inert on a module), so the
// assertion is agreement with official rather than "both threw" — the throwing
// pair is what keeps the non-throwing one from passing vacuously.
for (const [name, options] of [
	['unknown key', { nonsense: 1 }],
	['wrong boolean type', { dev: 'yes' }],
	['invalid generate', { generate: 'nope' }],
	['removed option', { legacy: {} }],
]) {
	const official = thrownBy(() => officialCompileModule(moduleSource, options));
	const mine = thrownBy(() => compiler.compileModule(moduleSource, options));
	assert(
		`compileModule validation matches official: ${name}`,
		JSON.stringify(official) === JSON.stringify(mine),
		JSON.stringify({ official, mine }),
	);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
