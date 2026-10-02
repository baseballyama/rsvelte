// The behaviour oracle tested on itself, with no rsvelte output involved. Every cross-runtime case
// (the fixture cases of the svue and vuelte crates) has a twin in the other language written by hand
// to behave the same, so the twin compiled by its own official toolchain stands in for a correct
// cross-runtime translation and must match. Each file in behaviour/wrong/ is a deliberately wrong
// translation, and behaviour/controls.json pins, per build target, the exact difference the oracle
// reports for it (`null`: the target must still match, as a mistake in one place must not move the
// other).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { parse as parseToml } from 'smol-toml';
import { serializeHtml } from '../src/behaviour/dom.ts';
import type { Target } from '../src/behaviour/modules.ts';
import { svelteModule, vueModule } from '../src/behaviour/official.ts';
import { moduleFile, type Behaviour } from '../src/behaviour/runtime.ts';
import { ROOT } from '../src/paths.ts';
import { svueCompile, vuelteCompile } from '../src/tasks/behaviour.ts';
import type { Unit } from '../src/types.ts';

const TARGETS: Target[] = ['client', 'server'];
const CASES = [
	{ dir: 'crates/languages/vue/compile_svelte/tests/fixtures', lang: 'cross-vue', ext: '.vue' },
	{ dir: 'crates/languages/svelte/compile_vue/tests/fixtures', lang: 'cross-svelte', ext: '.svelte' }
];

/** A case as a unit: `path` is `<case><ext>`, and `behaviour.toml` holds its props and steps. */
const units: Unit[] = CASES.flatMap(({ dir, lang, ext }) =>
	fs.readdirSync(path.join(ROOT, dir)).sort().map((name) => {
		const caseDir = path.join(ROOT, dir, name);
		const behaviourFile = path.join(caseDir, 'behaviour.toml');
		const behaviour = fs.existsSync(behaviourFile) ? (parseToml(fs.readFileSync(behaviourFile, 'utf8')) as unknown as Behaviour) : undefined;
		return { family: 'cross', source: 'rsvelte', path: `${name}${ext}`, lang, ext, sha256: '', mode: '', fixture: { behaviour } };
	})
);
const input = (unit: Unit): string => {
	const dir = CASES.find((c) => c.lang === unit.lang)!.dir;
	return fs.readFileSync(path.join(ROOT, dir, unit.path.slice(0, -unit.ext.length), `input${unit.ext}`), 'utf8');
};
const taskOf = (unit: Unit) => (unit.lang === 'cross-vue' ? svueCompile : vuelteCompile);

/** The trace the official build of the unit itself gives: what a correct translation must match. */
async function expected(unit: Unit, target: Target): Promise<string> {
	const artifacts = await taskOf(unit).run(unit, input(unit), { id: target, options: {} });
	return artifacts.trace!.text;
}

/** What `fixtures compare` reports for `src` (a component in the target's language) translating `unit`: null on a match. */
async function verdict(unit: Unit, src: string, srcPath: string, target: Target): Promise<string | null> {
	const code = unit.lang === 'cross-vue' ? svelteModule(src, srcPath, target) : vueModule(src, srcPath, target);
	const observed = await taskOf(unit).observe!.derive(unit, { id: target, options: {} }, moduleFile(code, target));
	return observed.diff(await expected(unit, target));
}

test('every cross unit has a twin, and the twin built officially matches its trace', async () => {
	assert.ok(units.length > 0, 'no cross units');
	for (const unit of units) {
		const twinPath = unit.path.replace(/\.(vue|svelte)$/, (_, ext: string) => (ext === 'vue' ? '.svelte' : '.vue'));
		const twin = units.find((u) => u.path === twinPath);
		assert.ok(twin, `${unit.path} has no twin`);
		for (const target of TARGETS) assert.equal(await verdict(unit, input(twin), twin.path, target), null, `${unit.path} ${target}`);
	}
});

interface Control {
	file: string;
	unit: string;
	client: string | null;
	server: string | null;
}
const controls: Control[] = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'behaviour/controls.json'), 'utf8'));

test('every wrong translation is a mismatch naming the step and the difference', async () => {
	const files = fs.readdirSync(path.join(import.meta.dirname, 'behaviour/wrong')).sort();
	assert.deepEqual(controls.map((c) => c.file).sort(), files, 'controls.json lists exactly the files in wrong/');
	for (const c of controls) {
		const unit = units.find((u) => u.path === c.unit);
		assert.ok(unit, `${c.file}: no unit ${c.unit}`);
		assert.ok(c.client !== null || c.server !== null, `${c.file}: a control must differ somewhere`);
		const src = fs.readFileSync(path.join(import.meta.dirname, 'behaviour/wrong', c.file), 'utf8');
		for (const target of TARGETS) assert.equal(await verdict(unit, src, c.file, target), c[target], `${c.file} ${target}`);
	}
});

test('emitted code that cannot be observed is reported, not skipped', async () => {
	const unit = units.find((u) => u.path === 'counter.vue')!;
	const observe = async (code: string, target: Target) =>
		(await svueCompile.observe!.derive(unit, { id: target, options: {} }, moduleFile(code, target))).diff(await expected(unit, target));
	assert.equal(await observe('export const x = 1;\n', 'client'), 'load: the module has no default export');
	assert.equal(await observe('export const x = 1;\n', 'server'), 'load: the module has no default export');
	assert.equal(await observe("export default function () { throw new Error('boom'); }\n", 'client'), 'step 0 "mount": boom');
	assert.match((await observe("import 'left-pad';\nexport default function () {}\n", 'client')) ?? '', /^load: Cannot find package 'left-pad'/);
});

// Pairs that look different in markup and the same on screen, and pairs that look different.
const same: [string, string][] = [
	['<p>a<!---->b</p>', '<p>ab</p>'],
	['<!--[--><p>x</p><!--]-->', '<p>x</p>'],
	['<p data-v-1a2b3c4d="">x</p>', '<p>x</p>'],
	['<p class="svelte-1x2y3z a">x</p>', '<p class="a">x</p>'],
	['<p class="b a a">x</p>', '<p class="a b">x</p>'],
	['<p class="svelte-1x2y3z">x</p>', '<p>x</p>'],
	['<p id="i" title="t">x</p>', '<p title="t" id="i">x</p>'],
	['<p style="color:red;margin: 0">x</p>', '<p style="margin:0; color: red;">x</p>'],
	['<div>\n  <p>x</p>\n  <p>y</p>\n</div>', '<div><p>x</p><p>y</p></div>'],
	['<p>  a \n b  </p>', '<p>a b</p>'],
	['<span>a</span> <p>b</p>', '<span>a</span><p>b</p>'],
	['<span>a</span><br> <span>b</span>', '<span>a</span><br><span>b</span>']
];
const different: [string, string][] = [
	['<span>a</span> <span>b</span>', '<span>a</span><span>b</span>'],
	['<span>a</span>\n<span>b</span>', '<span>a</span><span>b</span>'],
	['<pre> a  b</pre>', '<pre>a b</pre>'],
	['<p>a</p>', '<p>b</p>'],
	['<p title="t">x</p>', '<p title="u">x</p>'],
	['<p class="svelte-1x2y3z extra">x</p>', '<p>x</p>'],
	['<p hidden>x</p>', '<p>x</p>'],
	['<input value="a">', '<input value="b">'],
	['<input type="checkbox" checked>', '<input type="checkbox">'],
	['<select><option>a</option><option selected>b</option></select>', '<select><option>a</option><option>b</option></select>'],
	['<p>a</p><p>b</p>', '<p>b</p><p>a</p>']
];

test('normalization: invisible differences vanish, visible ones stay', () => {
	for (const [a, b] of same) assert.deepEqual(serializeHtml(a), serializeHtml(b), `${a} vs ${b}`);
	for (const [a, b] of different) assert.notDeepEqual(serializeHtml(a), serializeHtml(b), `${a} vs ${b}`);
});
