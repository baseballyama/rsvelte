// Official twins and broken translations check the oracle itself; Vapor snapshots check rsvelte.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { parse as parseToml } from 'smol-toml';
import { compile as compileSvelte } from 'svelte/compiler';
import type { Target } from '../src/behaviour/modules.ts';
import { svelteModule, vueModule } from '../src/behaviour/official.ts';
import {
	moduleFile,
	trace,
	traceDiff,
	type Behaviour,
} from '../src/behaviour/runtime.ts';
import { ROOT } from '../src/paths.ts';
import { svueCompile, vuelteCompile } from '../src/tasks/behaviour.ts';
import type { Unit } from '../src/types.ts';

const TARGETS: Target[] = ['client', 'server'];
const INVALID_AWAIT_DIRECTIVES = [
	'action',
	'attachment',
	'transition',
	'animation',
	'binding',
];
const DIAGNOSTIC_CASES = new Set(
	INVALID_AWAIT_DIRECTIVES.map(
		(directive) => `invalid-await-${directive}.svelte`,
	),
);
const CASES = [
	{
		dir: 'crates/languages/vue/compile_svelte/tests/fixtures',
		lang: 'cross-vue',
		ext: '.vue',
	},
	{
		dir: 'crates/languages/svelte/compile_vapor/tests/fixtures',
		lang: 'cross-svelte',
		ext: '.svelte',
	},
];

/** A case as a unit: `path` is `<case><ext>`, and `behaviour.toml` holds its props and steps. */
const units: Unit[] = CASES.flatMap(({ dir, lang, ext }) =>
	fs
		.readdirSync(path.join(ROOT, dir))
		.sort()
		.map((name) => {
			const caseDir = path.join(ROOT, dir, name);
			const behaviourFile = path.join(caseDir, 'behaviour.toml');
			const behaviour = fs.existsSync(behaviourFile)
				? (parseToml(
						fs.readFileSync(behaviourFile, 'utf8'),
					) as unknown as Behaviour)
				: undefined;
			return {
				family: 'cross',
				source: 'rsvelte',
				path: `${name}${ext}`,
				lang,
				ext,
				sha256: '',
				mode: '',
				fixture: { behaviour },
				sourceFile: path.join(caseDir, `input${ext}`),
			};
		}),
);
const input = (unit: Unit): string => {
	const dir = CASES.find((c) => c.lang === unit.lang)!.dir;
	return fs.readFileSync(
		path.join(
			ROOT,
			dir,
			unit.path.slice(0, -unit.ext.length),
			`input${unit.ext}`,
		),
		'utf8',
	);
};
const taskOf = (unit: Unit) =>
	unit.lang === 'cross-vue' ? svueCompile : vuelteCompile;

test('Vapor rejects the five directive await forms rejected by Svelte', () => {
	for (const directive of INVALID_AWAIT_DIRECTIVES) {
		const name = `invalid-await-${directive}`;
		const unit = units.find((unit) => unit.path === `${name}.svelte`)!;
		const code =
			directive === 'binding'
				? 'bind_invalid_expression'
				: 'illegal_await_expression';
		assert.throws(
			() => compileSvelte(input(unit), { experimental: { async: true } }),
			(error: unknown) =>
				typeof error === 'object' &&
				error !== null &&
				'code' in error &&
				error.code === code,
		);
		for (const target of TARGETS) {
			const diagnostic = fs.readFileSync(
				path.join(
					ROOT,
					CASES[1]!.dir,
					name,
					`expected/${target}.diagnostics.txt`,
				),
				'utf8',
			);
			assert.ok(diagnostic.includes(code));
		}
	}
});

/** The trace the official build of the unit itself gives: what a correct translation must match. */
async function expected(unit: Unit, target: Target): Promise<string> {
	const artifacts = await taskOf(unit).run(unit, input(unit), {
		id: target,
		options: {},
	});
	return artifacts.trace!.text;
}

/** What `fixtures compare` reports for `src` (a component in the target's language) translating `unit`: null on a match. */
async function verdict(
	unit: Unit,
	src: string,
	srcPath: string,
	target: Target,
): Promise<string | null> {
	const code =
		unit.lang === 'cross-vue'
			? svelteModule(src, srcPath, target)
			: vueModule(src, srcPath, target);
	const runtime = unit.lang === 'cross-vue' ? 'svelte' : 'vue';
	const observed = await trace(
		runtime,
		target,
		moduleFile(code, target),
		unit.fixture.behaviour ?? {},
	);
	return traceDiff(JSON.parse(await expected(unit, target)), observed);
}

test('every Svelte to Vapor snapshot matches the official Svelte trace', async (context) => {
	const selection = process.env.RSVELTE_VAPOR_CASES;
	const selected =
		selection === undefined ? undefined : new Set(selection.split(','));
	const cases = units.filter(
		(u) =>
			u.lang === 'cross-svelte' &&
			!DIAGNOSTIC_CASES.has(u.path) &&
			(!selected || selected.has(u.path.slice(0, -u.ext.length))),
	);
	if (selected)
		assert.equal(cases.length, selected.size, 'unknown Vapor case names');
	assert.ok(cases.length > 0, 'no Vapor cases');
	const failures: string[] = [];
	let measured = 0;
	for (const unit of cases) {
		for (const target of TARGETS) {
			if (
				target === 'client' &&
				unit.fixture.behaviour?.browser &&
				!unit.fixture.behaviour.node
			)
				continue;
			measured++;
			try {
				const file = path.join(
					ROOT,
					CASES[1]!.dir,
					unit.path.slice(0, -unit.ext.length),
					'expected',
					`${target}.js`,
				);
				const observed = await vuelteCompile.observe!.derive(
					unit,
					{ id: target, options: {} },
					file,
				);
				const difference = observed.diff(await expected(unit, target));
				if (difference !== null)
					failures.push(`${unit.path} ${target}: ${difference}`);
			} catch (error) {
				failures.push(`${unit.path} ${target}: ${String(error)}`);
			}
		}
	}
	context.diagnostic(
		`${cases.length} cases, ${measured} target traces; browser clients run in vapor-browser.test.ts`,
	);
	assert.deepEqual(failures, []);
});

function vaporSource(name: string): [Unit, string] {
	const unit = units.find((unit) => unit.path === `${name}.svelte`);
	assert.ok(unit, `unknown Vapor case: ${name}`);
	const file = path.join(ROOT, CASES[1]!.dir, name, 'expected/client.js');
	return [unit, fs.readFileSync(file, 'utf8')];
}

test('the Vapor trace detects checked attribute reflection', async () => {
	const [unit, code] = vaporSource('boolean-attributes');
	const assignment = /(\$\$v_n\d+)\.checked = Boolean\(value.value\)/;
	assert.match(code, assignment);
	const broken = code.replace(
		assignment,
		"($&, $1.setAttribute('checked', ''))",
	);
	const observed = await vuelteCompile.observe!.derive(
		unit,
		{ id: 'client', options: {} },
		moduleFile(broken, 'client'),
	);
	assert.match(observed.diff(await expected(unit, 'client')) ?? '', /step 0/);
});

test('the Vapor trace detects omitted autofocus', async () => {
	const [unit, code] = vaporSource('autofocus');
	assert.ok(code.includes('element.focus();'));
	const observed = await vuelteCompile.observe!.derive(
		unit,
		{ id: 'client', options: {} },
		moduleFile(code.replace('element.focus();', 'undefined;'), 'client'),
	);
	assert.match(observed.diff(await expected(unit, 'client')) ?? '', /step 0/);
});

test('the Vapor trace detects boolean coercion of a normal attribute', async () => {
	const [unit, code] = vaporSource('ordinary-attributes');
	const value = "'answer', active.value ? 42 : false";
	assert.ok(code.includes(value));
	const observed = await vuelteCompile.observe!.derive(
		unit,
		{ id: 'client', options: {} },
		moduleFile(
			code.replace(value, "'answer', Boolean(active.value ? 42 : false)"),
			'client',
		),
	);
	assert.match(observed.diff(await expected(unit, 'client')) ?? '', /step 1/);
});

test('the Vapor trace detects a broken character reference', async () => {
	const [unit, code] = vaporSource('character-references');
	assert.ok(code.includes('&fjlig;'));
	const observed = await vuelteCompile.observe!.derive(
		unit,
		{ id: 'client', options: {} },
		moduleFile(code.replace('&fjlig;', '&ffi;'), 'client'),
	);
	assert.match(observed.diff(await expected(unit, 'client')) ?? '', /step 0/);
});

test('the Vapor trace detects a preserved static pre newline', async () => {
	const [unit, code] = vaporSource('preformatted-text');
	const markup = '<pre>\\nstatic &amp; text</pre>';
	assert.ok(code.includes(markup));
	const observed = await vuelteCompile.observe!.derive(
		unit,
		{ id: 'client', options: {} },
		moduleFile(
			code.replace(markup, '<span>\\nstatic &amp; text</span>'),
			'client',
		),
	);
	assert.match(observed.diff(await expected(unit, 'client')) ?? '', /step 0/);
});

test('the Vapor trace detects a stale nonreactive attribute', async () => {
	const [unit, code] = vaporSource('nonreactive-reads');
	const value = "'title', $$attr(plain)";
	assert.ok(code.includes(value));
	const observed = await vuelteCompile.observe!.derive(
		unit,
		{ id: 'client', options: {} },
		moduleFile(
			code.replace(value, () => "'title', $$attr(0)"),
			'client',
		),
	);
	assert.match(observed.diff(await expected(unit, 'client')) ?? '', /step 2/);
});

test('the Vapor trace detects a call evaluated after a DOM update', async () => {
	const [unit, code] = vaporSource('call-before-dom-updates');
	const reads = /^\t+\$\$v_n\d+\.value;\n/gm;
	assert.ok((code.match(reads)?.length ?? 0) > 0);
	const observed = await vuelteCompile.observe!.derive(
		unit,
		{ id: 'client', options: {} },
		moduleFile(code.replace(reads, ''), 'client'),
	);
	assert.match(observed.diff(await expected(unit, 'client')) ?? '', /step 1/);
});

test('the Vapor trace detects changed attribute whitespace', async () => {
	const [unit, code] = vaporSource('static-attribute-whitespace');
	assert.ok(code.includes(' a  b '));
	const observed = await vuelteCompile.observe!.derive(
		unit,
		{ id: 'client', options: {} },
		moduleFile(code.replaceAll(' a  b ', ' a b '), 'client'),
	);
	assert.match(observed.diff(await expected(unit, 'client')) ?? '', /step 1/);
});

test('the Vapor trace detects a missing component reference', async () => {
	const [unit, code] = vaporSource('component-exports-parent');
	const assignment = 'child.value = $$component';
	assert.ok(code.includes(assignment));
	const broken = code.replace(assignment, 'undefined');
	const observed = await vuelteCompile.observe!.derive(
		unit,
		{ id: 'client', options: {} },
		moduleFile(broken, 'client'),
	);
	assert.match(observed.diff(await expected(unit, 'client')) ?? '', /step 0/);
});

test('the Vapor trace detects lost async server context', async () => {
	const unit = units.find((unit) => unit.path === 'async-context.svelte')!;
	const file = path.join(
		ROOT,
		CASES[1]!.dir,
		'async-context/expected/server.js',
	);
	const code = fs.readFileSync(file, 'utf8');
	assert.ok(code.includes('restore();'));
	const broken = code.replace('restore();', '');
	const observed = await vuelteCompile.observe!.derive(
		unit,
		{ id: 'server', options: {} },
		moduleFile(broken, 'server'),
	);
	assert.match(
		observed.diff(await expected(unit, 'server')) ?? '',
		/^server html:/,
	);
});

test('the Vapor trace detects stale async results', async () => {
	const unit = units.find((unit) => unit.path === 'async-stale.svelte')!;
	const file = path.join(ROOT, CASES[1]!.dir, 'async-stale/expected/client.js');
	const code = fs.readFileSync(file, 'utf8');
	const guard = 'if (active && current === version) {';
	assert.ok(code.includes(guard));
	const broken = code.replace(guard, 'if (active) {');
	const observed = await vuelteCompile.observe!.derive(
		unit,
		{ id: 'client', options: {} },
		moduleFile(broken, 'client'),
	);
	assert.match(observed.diff(await expected(unit, 'client')) ?? '', /step 5/);
});

test('the Vapor trace detects missing boundary recovery', async () => {
	const unit = units.find((unit) => unit.path === 'boundary.svelte')!;
	const file = path.join(ROOT, CASES[1]!.dir, 'boundary/expected/client.js');
	const code = fs.readFileSync(file, 'utf8');
	assert.ok(
		code.includes('failure.value = { error, reset, failed: options.failed };'),
	);
	const broken = code.replace(
		'failure.value = { error, reset, failed: options.failed };',
		'',
	);
	const observed = await vuelteCompile.observe!.derive(
		unit,
		{ id: 'client', options: {} },
		moduleFile(broken, 'client'),
	);
	assert.match(observed.diff(await expected(unit, 'client')) ?? '', /step 1/);
});

test('the Vapor trace detects a broken state update', async () => {
	const unit = units.find((u) => u.path === 'counter.svelte')!;
	const file = path.join(ROOT, CASES[1]!.dir, 'counter/expected/client.js');
	const code = fs.readFileSync(file, 'utf8');
	assert.ok(code.includes('count.value++'));
	const broken = code.replace('count.value++', 'count.value--');
	const observed = await vuelteCompile.observe!.derive(
		unit,
		{ id: 'client', options: {} },
		moduleFile(broken, 'client'),
	);
	assert.match(observed.diff(await expected(unit, 'client')) ?? '', /step 1/);
});

test('the Vapor trace detects missing server head content', async () => {
	const unit = units.find((unit) => unit.path === 'head.svelte')!;
	const file = path.join(ROOT, CASES[1]!.dir, 'head/expected/server.js');
	const code = fs.readFileSync(file, 'utf8');
	assert.ok(code.includes('$$render_head($$ssr_context,'));
	const broken = code.replace(
		'$$render_head($$ssr_context,',
		() => '$$render_head(null,',
	);
	const observed = await vuelteCompile.observe!.derive(
		unit,
		{ id: 'server', options: {} },
		moduleFile(broken, 'server'),
	);
	assert.match(
		observed.diff(await expected(unit, 'server')) ?? '',
		/^server head:/,
	);
});

test('the Vapor trace detects a wrong SVG namespace', async () => {
	const unit = units.find((unit) => unit.path === 'namespaces.svelte')!;
	const file = path.join(ROOT, CASES[1]!.dir, 'namespaces/expected/client.js');
	const code = fs.readFileSync(file, 'utf8');
	const factory = `$$v_template('<circle cx="5" cy="5">', 0, 1)`;
	assert.ok(code.includes(factory));
	const broken = code.replace(
		factory,
		() => `$$v_template('<circle cx="5" cy="5">')`,
	);
	const observed = await vuelteCompile.observe!.derive(
		unit,
		{ id: 'client', options: {} },
		moduleFile(broken, 'client'),
	);
	assert.match(
		observed.diff(await expected(unit, 'client')) ?? '',
		/http:\/\/www\.w3\.org\/(2000\/svg|1999\/xhtml)/,
	);
});

test('the Vapor trace detects lowercased namespaced spread attributes', async () => {
	const [unit, code] = vaporSource('namespace-spreads');
	const namespace = "el.namespaceURI === 'http://www.w3.org/1999/xhtml'";
	assert.ok(code.includes(namespace));
	const broken = code.replace(namespace, 'true');
	const observed = await vuelteCompile.observe!.derive(
		unit,
		{ id: 'client', options: {} },
		moduleFile(broken, 'client'),
	);
	assert.match(
		observed.diff(await expected(unit, 'client')) ?? '',
		/step 0.*viewBox/,
	);
});

test('the Vapor trace detects attachment cleanup omissions', async () => {
	const unit = units.find((unit) => unit.path === 'attachments-spread.svelte')!;
	const file = path.join(
		ROOT,
		CASES[1]!.dir,
		'attachments-spread/expected/client.js',
	);
	const code = fs.readFileSync(file, 'utf8');
	const cleanup = 'entry.scope.stop();';
	assert.ok(code.includes(cleanup));
	const broken = code.replace(cleanup, '');
	const observed = await vuelteCompile.observe!.derive(
		unit,
		{ id: 'client', options: {} },
		moduleFile(broken, 'client'),
	);
	assert.match(
		observed.diff(await expected(unit, 'client')) ?? '',
		/step [1-9]/,
	);
});

test('every Vue unit has a Svelte twin, and both official translations match', async () => {
	const pairs = units.filter((u) => u.lang === 'cross-vue');
	assert.ok(pairs.length > 0, 'no Vue units');
	for (const unit of pairs) {
		const twinPath = unit.path.replace(/\.vue$/, '.svelte');
		const twin = units.find((u) => u.path === twinPath);
		assert.ok(twin, `${unit.path} has no twin`);
		for (const target of TARGETS) {
			assert.equal(
				await verdict(unit, input(twin), twin.path, target),
				null,
				`${unit.path} ${target}`,
			);
			assert.equal(
				await verdict(twin, input(unit), unit.path, target),
				null,
				`${twin.path} ${target}`,
			);
		}
	}
});

interface Control {
	file: string;
	unit: string;
	client: string | null;
	server: string | null;
}
const controls: Control[] = JSON.parse(
	fs.readFileSync(
		path.join(import.meta.dirname, 'behaviour/controls.json'),
		'utf8',
	),
);

test('every wrong translation is a mismatch naming the step and the difference', async () => {
	const files = fs
		.readdirSync(path.join(import.meta.dirname, 'behaviour/wrong'))
		.sort();
	assert.deepEqual(
		controls.map((c) => c.file).sort(),
		files,
		'controls.json lists exactly the files in wrong/',
	);
	for (const c of controls) {
		const unit = units.find((u) => u.path === c.unit);
		assert.ok(unit, `${c.file}: no unit ${c.unit}`);
		assert.ok(
			c.client !== null || c.server !== null,
			`${c.file}: a control must differ somewhere`,
		);
		const src = fs.readFileSync(
			path.join(import.meta.dirname, 'behaviour/wrong', c.file),
			'utf8',
		);
		for (const target of TARGETS)
			assert.equal(
				await verdict(unit, src, c.file, target),
				c[target],
				`${c.file} ${target}`,
			);
	}
});

test('emitted code that cannot be observed is reported, not skipped', async () => {
	const unit = units.find((u) => u.path === 'counter.vue')!;
	const observe = async (code: string, target: Target) =>
		(
			await svueCompile.observe!.derive(
				unit,
				{ id: target, options: {} },
				moduleFile(code, target),
			)
		).diff(await expected(unit, target));
	assert.equal(
		await observe('export const x = 1;\n', 'client'),
		'load: the module has no default export',
	);
	assert.equal(
		await observe('export const x = 1;\n', 'server'),
		'load: the module has no default export',
	);
	assert.equal(
		await observe(
			"export default function () { throw new Error('boom'); }\n",
			'client',
		),
		'step 0 "mount": boom',
	);
	assert.match(
		(await observe(
			"import 'left-pad';\nexport default function () {}\n",
			'client',
		)) ?? '',
		/^load: Cannot find package 'left-pad'/,
	);
});
