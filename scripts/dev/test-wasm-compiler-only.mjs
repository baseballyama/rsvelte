#!/usr/bin/env node
// Run after building both wasm entries and finalizing pkg/.

import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { compile as officialCompile, compileModule as officialCompileModule } from '../../submodules/svelte/packages/svelte/src/compiler/index.js';

const jsUrl = new URL('../../pkg/rsvelte_compiler.js', import.meta.url).href;
const wasmPath = fileURLToPath(new URL('../../pkg/rsvelte_compiler_bg.wasm', import.meta.url));

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

const playground = await import('../../pkg/playground/rsvelte_lint.js');
playground.initSync({ module: readFileSync(new URL('../../pkg/playground/rsvelte_lint_bg.wasm', import.meta.url)) });
for (const name of ['compile', 'compileModule', 'lint', 'svelte2tsx']) {
	assert(`playground exports ${name}`, typeof playground[name] === 'function');
}
const playgroundSize = statSync(new URL('../../pkg/playground/rsvelte_lint_bg.wasm', import.meta.url)).size;
assert('compiler wasm is smaller than playground', statSync(wasmPath).size < playgroundSize,
	JSON.stringify({ compiler: statSync(wasmPath).size, playground: playgroundSize }));
const manifest = JSON.parse(readFileSync(new URL('../../pkg/package.json', import.meta.url)));
assert('stable wasm subpath selects compiler', manifest.exports['./wasm'] === './rsvelte_compiler_bg.wasm');
assert('version matches package', compiler.version() === manifest.version);

for (const source of [moduleSource, '\ufeff' + moduleSource, 'export const message = "こんにちは 🌏";']) {
	for (const generate of ['client', 'server', false]) {
		for (const dev of [false, true]) {
			const options = { filename: '/project/src/state.svelte.js', rootDir: '/project', generate, dev };
			const official = officialCompileModule(source, options);
			for (const [label, entry] of [['compiler', compiler], ['playground', playground]]) {
				const mine = JSON.parse(entry.compileModule(source, options));
				assert(`${label} module ${generate}/${dev}/${JSON.stringify(source.slice(0, 20))}`,
					(official.js === null ? mine.js === null : mine.js?.code === official.js.code) && JSON.stringify(mine.metadata) === JSON.stringify(official.metadata));
			}
		}
	}
}

const warningSource = 'let n = $state(0); const x = n;';
for (const [label, entry] of [['compiler', compiler], ['playground', playground]]) {
	const compileModule = (source, options) => JSON.parse(entry.compileModule(source, options));
	for (const generate of ['client', 'server', false]) {
		const options = { filename: 'warning.svelte.js', generate };
		const official = officialCompileModule(warningSource, options);
		const mine = compileModule(warningSource, options);
		const warningKey = (w) => ({ code: w.code, message: w.message, filename: w.filename, start: w.start, end: w.end, position: w.position });
		assert(`${label} module ${generate} warning positive control`, official.warnings.length > 0 &&
			JSON.stringify(mine.warnings.map(warningKey)) === JSON.stringify(official.warnings.map(warningKey)));
		for (const keep of [true, false, 0, null, undefined, '', 'keep']) {
			const seen = [];
			const filtered = compileModule(warningSource, { ...options, warningFilter: (w) => { seen.push(w.code); return keep; } });
			const expected = officialCompileModule(warningSource, { ...options, warningFilter: () => keep });
			assert(`${label} module ${generate} warningFilter ${keep}`, seen.length > 0 && JSON.stringify(filtered.warnings.map(warningKey)) === JSON.stringify(expected.warnings.map(warningKey)));
		}
		assert(`${label} module ${generate} throwing warningFilter`, thrownBy(() => entry.compileModule(warningSource,
			{ ...options, warningFilter: () => { throw new Error('module-filter-boom'); } }))?.message === 'module-filter-boom');
	}
}
for (const [name, options] of [
	['warningFilter type', { warningFilter: true }],
	['rootDir type', { rootDir: false }],
	['experimental flag', { experimental: { async: 'yes' } }],
	['ignored component options', { css: 'invalid', runes: () => { throw new Error('must not call'); }, customElement: 'invalid', namespace: 'invalid', cssHash: 7 }],
]) {
	const official = thrownBy(() => officialCompileModule(moduleSource, options));
	const mine = thrownBy(() => compiler.compileModule(moduleSource, options));
	assert(`module options: ${name}`, JSON.stringify(mine) === JSON.stringify(official), JSON.stringify({ mine, official }));
}
// Upstream throws a TypeError before validating a non-string filename.
assert('non-string filename rejected', thrownBy(() => officialCompileModule(moduleSource, { filename: 7 })) !== null &&
	thrownBy(() => compiler.compileModule(moduleSource, { filename: 7 }))?.code === 'options_invalid_value');
for (const source of ['let = ;', 'let n: number = 0;']) {
	assert(`invalid module rejected: ${source}`, thrownBy(() => officialCompileModule(source, { filename: 'state.svelte.ts' })) !== null &&
		thrownBy(() => compiler.compileModule(source, { filename: 'state.svelte.ts' })) !== null);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
