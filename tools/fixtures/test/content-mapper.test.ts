import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { before, test } from 'node:test';
import { API } from 'typescript-7/unstable/sync';
import { SyntaxKind, SpanMapFeature, SpanMapFidelity } from 'typescript-7/unstable/ast';

import { ProjectTypeInfo } from '../../type-information/src/index.ts';

const repository = path.resolve(import.meta.dirname, '../../..');
const tools = path.join(repository, 'tools/fixtures');
const binary = path.join(repository, 'target/debug/rsvelte-svelte-content-mapper');

before(() => {
	const built = spawnSync('cargo', ['build', '--offline', '-p', 'rsvelte_svelte_typescript_projection', '--bin', 'rsvelte-svelte-content-mapper'], { cwd: repository, encoding: 'utf8' });
	assert.equal(built.status, 0, built.stderr);
});

function project(source: string, check: (api: API, config: string, file: string) => void, additionalFiles: Record<string, string> = {}): void {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-native-mapper-'));
	const config = path.join(directory, 'tsconfig.json'), file = path.join(directory, 'Component.svelte');
	const modules = path.join(directory, 'node_modules');
	fs.mkdirSync(modules);
	fs.symlinkSync(path.join(tools, 'node_modules/svelte'), path.join(modules, 'svelte'), 'dir');
	const mapper = path.join(modules, 'rsvelte-svelte-mapper');
	fs.mkdirSync(mapper);
	fs.writeFileSync(path.join(mapper, 'package.json'), JSON.stringify({
		name: 'rsvelte-svelte-mapper', version: '0.0.0', typescript: { contentMapper: { exec: [binary] } }
	}));
	fs.writeFileSync(file, source);
	fs.writeFileSync(path.join(directory, 'consumer.ts'), "import './Component.svelte';\n");
	for (const [name, text] of Object.entries(additionalFiles)) fs.writeFileSync(path.join(directory, name), text);
	fs.writeFileSync(config, JSON.stringify({
		compilerOptions: { strict: true, noEmit: true, skipLibCheck: true, target: 'esnext', module: 'esnext', moduleResolution: 'bundler', types: ['svelte'], paths: { svelte: [path.join(tools, 'node_modules/svelte/types/index.d.ts')], 'svelte/elements': [path.join(tools, 'node_modules/svelte/elements.d.ts')] } },
		contentMappers: [{ package: 'rsvelte-svelte-mapper', extensions: ['.svelte'] }],
		files: [path.join(directory, 'consumer.ts'), path.join(repository, 'crates/languages/svelte/typescript_projection/projection.d.ts'), path.join(repository, 'crates/languages/svelte/typescript_projection/vendor/svelte-jsx-v4.d.ts')]
	}));
	const api = new API({ cwd: directory, runExternalCode: true });
	try { check(api, config, file); }
	finally { api.close(); fs.rmSync(directory, { recursive: true, force: true }); }
}

test('native TS imports Svelte through the Rust mapper and preserves Unicode span mappings', () => {
	const source = '<script lang="ts">const café: string = "🚀"; const value: number = café;</script><p>{value}</p>';
	project(source, (api, config, file) => {
		const snapshot = api.createSnapshot({ openProjects: [config] });
		try {
			const program = snapshot.getConfiguredProject(config)!.program;
			assert.deepEqual(program.getProgramDiagnostics(), []);
			const ast = program.getSourceFile(file)!;
			assert.ok(ast.contentMapper);
			assert.equal(ast.originalText, source);
			assert.ok(ast.text.includes('const café'));
			const virtual = ast.text.indexOf('value: number');
			const mapped = ast.spanMap!.virtualToOriginalSpan({ pos: virtual, end: virtual + 5 });
			assert.equal(mapped.fidelity, SpanMapFidelity.Exact);
			assert.equal(source.slice(mapped.range.pos, mapped.range.end), 'value');
			assert.equal(ast.spanMap!.virtualToOriginalPosition(0).fidelity, SpanMapFidelity.None);
			const diagnostics = program.getSemanticDiagnostics(file);
			assert.ok(diagnostics.some((diagnostic) => diagnostic.code === 2322), JSON.stringify(diagnostics));
		} finally { snapshot.dispose(); }
	});
});

test('parse errors and unsupported Svelte constructs remain mapper diagnostics', () => {
	for (const [source, code] of [['<p>{</p>', 1], ['{#await promise}{:then value}{value}{/await}', 2]] as const) {
		project(source, (api, config, file) => {
			const snapshot = api.createSnapshot({ openProjects: [config] });
			try {
				const program = snapshot.getConfiguredProject(config)!.program;
				const diagnostics = [...program.getSyntacticDiagnostics(file), ...program.getSemanticDiagnostics(file)];
				assert.ok(diagnostics.some((diagnostic) => diagnostic.code === code), JSON.stringify(diagnostics));
			} finally { snapshot.dispose(); }
		});
	}
});

test('each blocks preserve item, index, key and const types through native TS', () => {
	const source = `<script lang="ts">
const rows: Array<{ name: string }> = [{ name: 'first' }];
const numbers: Set<number> = new Set([1]);
const maybe: ArrayLike<number> | null = null as ArrayLike<number> | null;
</script>
{#each rows as { name: itemName }, index (itemName)}
{@const label = itemName.toUpperCase()}
<button onclick={() => itemName = "updated"}/>
<p>{label}{index.toFixed()}{itemName.toFixed()}</p>
{:else}<p>{itemName}</p>{/each}
{#each numbers as value}<p>{value.toUpperCase()}</p>{/each}
{#each maybe as value}<p>{value.toFixed()}</p>{/each}`;
	project(source, (api, config, file) => {
		const snapshot = api.createSnapshot({ openProjects: [config] });
		try {
			const program = snapshot.getConfiguredProject(config)!.program;
			assert.deepEqual(program.getProgramDiagnostics(), []);
			assert.deepEqual(program.getSyntacticDiagnostics(file), []);
			const diagnostics = program.getSemanticDiagnostics(file);
			assert.deepEqual(diagnostics.map((diagnostic) => diagnostic.code).sort(), [2304, 2339, 2551]);
			const ast = program.getSourceFile(file)!;
			assert.deepEqual(diagnostics.map((diagnostic) => source.slice(diagnostic.pos, diagnostic.end)).sort(), ['itemName', 'toFixed', 'toUpperCase']);
			for (const diagnostic of diagnostics) {
				const mapped = ast.spanMap!.originalToVirtualSpans({ pos: diagnostic.pos, end: diagnostic.end }, SpanMapFeature.Hover);
				assert.ok(mapped.some((mapping) => mapping.fidelity === SpanMapFidelity.Exact && ast.text.slice(mapping.range.pos, mapping.range.end) === source.slice(diagnostic.pos, diagnostic.end)));
			}
		} finally { snapshot.dispose(); }
	});
});

test('component props and bind:this retain their real types', () => {
	for (const [props, binding, expected] of [
		['value={1}', 'HTMLDivElement', []],
		['value="{1}"', 'HTMLDivElement', []],
		['value={"wrong"}', 'HTMLDivElement', [2322]],
		['', 'HTMLDivElement', [2741]],
		['value={1}', 'HTMLInputElement', [2740]],
	] as const) {
		project(`<script lang="ts">
import type { Component } from 'svelte';
declare const Action: Component<{ value: number }>;
let el = $state<${binding}>();
</script><Action ${props}/><div bind:this={el}></div>`, (api, config, file) => {
			const snapshot = api.createSnapshot({ openProjects: [config] });
			try {
				const program = snapshot.getConfiguredProject(config)!.program;
				assert.deepEqual(program.getProgramDiagnostics(), []);
				assert.deepEqual(program.getSyntacticDiagnostics(file), []);
				const diagnostics = program.getSemanticDiagnostics(file);
				assert.deepEqual(diagnostics.map((diagnostic) => diagnostic.code), expected, JSON.stringify(diagnostics));
			} finally { snapshot.dispose(); }
		});
	}
});

test('each accepts unions of collection types and readonly tuples', () => {
	project(`<script lang="ts">
const choices: string[] | number[] = Math.random() > 0.5 ? ['ok'] : [1];
const tuple = ['ok', 1] as const;
declare const dynamic: any;
</script>
{#each choices as choice}<p>{typeof choice === 'string' ? choice.toUpperCase() : choice.toFixed()}</p>{/each}
{#each dynamic as choice}<p>{choice.arbitrary()}</p>{/each}
{#each tuple as choice}<p>{typeof choice === 'string' ? choice.toUpperCase() : choice.toFixed()}</p>{/each}`, (api, config, file) => {
		const snapshot = api.createSnapshot({ openProjects: [config] });
		try {
			const program = snapshot.getConfiguredProject(config)!.program;
			assert.deepEqual(program.getProgramDiagnostics(), []);
			assert.deepEqual(program.getSyntacticDiagnostics(file), []);
			assert.deepEqual(program.getSemanticDiagnostics(file), []);
		} finally { snapshot.dispose(); }
	});
});

test('component calls preserve generic signatures and require all union props', () => {
	project(`<script lang="ts">
import type { Component } from 'svelte';
declare function Generic<T>(internals: Parameters<Component>[0], props: { value: T; select: (value: T) => void }): {};
declare const First: Component<{ one: number }>;
declare const Second: Component<{ two: string }>;
const Choice = Math.random() > 0.5 ? First : Second;
</script>
<Generic value={42} select={(value) => value.toFixed()}/>
<Generic value={42} select={(value) => value.toUpperCase()}/>
<Choice one={1} two="ok"/>
<Choice one={1}/>`, (api, config, file) => {
		const snapshot = api.createSnapshot({ openProjects: [config] });
		try {
			const program = snapshot.getConfiguredProject(config)!.program;
			assert.deepEqual(program.getProgramDiagnostics(), []);
			assert.deepEqual(program.getSyntacticDiagnostics(file), []);
			const diagnostics = program.getSemanticDiagnostics(file);
			assert.equal(diagnostics.length, 2, JSON.stringify(diagnostics));
			assert.ok(diagnostics.some((diagnostic) => diagnostic.code === 2339 && diagnostic.text.includes('toUpperCase')));
			assert.ok(diagnostics.some((diagnostic) => diagnostic.text.includes('two') && JSON.stringify(diagnostic).includes('required')));
		} finally { snapshot.dispose(); }
	});
});


test('imported Svelte components expose props, callback types, exports and bindable keys', () => {
    const child = `<script module lang="ts">export const marker = "module";</script>
<script lang="ts">
type Props = { value: number; select: (value: number) => void; binding?: number };
let { value, select, binding = $bindable() }: Props = $props();
export const answer = 42;
export function reset(value: number) { return value.toFixed(); }
</script><p>{value}</p>`;
    const consumer = `import Child, { marker } from './Child.svelte';
import type { ComponentProps } from 'svelte';
const props: ComponentProps<typeof Child> = { value: 1, select: value => value.toFixed() };
const instance = Child({} as Parameters<typeof Child>[0], props);
instance.answer.toFixed();
instance.reset(1);
instance.reset('wrong');
instance.answer.toUpperCase();
const invalidBinding: NonNullable<typeof Child.z_$$bindings> = 'value';
const binding: NonNullable<typeof Child.z_$$bindings> = 'binding';
marker.toUpperCase();
import './Component.svelte';`;
    for (const [attributes, expected] of [
        ['value={1} select={(value) => value.toFixed()}', []],
        ['value={"wrong"} select={(value) => value.toFixed()}', [2322]],
        ['value={1} select={(value) => value.toUpperCase()}', [2339]],
        ['select={(value) => value.toFixed()}', [2741]],
    ] as const) {
        project(`<script lang="ts">import Child from './Child.svelte';</script><Child ${attributes}/>`, (api, config, file) => {
            const snapshot = api.createSnapshot({ openProjects: [config] });
            try {
                const program = snapshot.getConfiguredProject(config)!.program;
                assert.deepEqual(program.getProgramDiagnostics(), []);
                assert.deepEqual(program.getSemanticDiagnostics(file).map(diagnostic => diagnostic.code), expected);
                assert.deepEqual(program.getSemanticDiagnostics(path.join(path.dirname(file), 'Child.svelte')), []);
                assert.deepEqual(program.getSemanticDiagnostics(path.join(path.dirname(file), 'consumer.ts')).map(diagnostic => diagnostic.code).sort(), [2322, 2339, 2345]);
            } finally { snapshot.dispose(); }
        }, { 'Child.svelte': child, 'consumer.ts': consumer });
    }
});

test('unannotated props infer defaults for callers and internal expressions', () => {
    const child = `<script lang="ts">
const __rsvelte_public_props0 = 1;
const initial = 1;
let { count = initial, title = 'ok', select = (value: number) => value, binding = $bindable(0), required } = $props();
</script><p>{count.toUpperCase()}</p>`;
    project(`<script lang="ts">import Child from './Child.svelte';</script>
<Child required={true}/><Child required={true} count={"wrong"}/>
<Child required={true} select={(value) => value.toUpperCase()}/><Child/>`, (api, config, file) => {
        const snapshot = api.createSnapshot({ openProjects: [config] });
        try {
            const program = snapshot.getConfiguredProject(config)!.program;
            assert.deepEqual(program.getProgramDiagnostics(), []);
            const parent = program.getSemanticDiagnostics(file);
            assert.deepEqual(parent.map(diagnostic => diagnostic.code).sort(), [2322, 2339, 2345]);
            const diagnostics = program.getSemanticDiagnostics(path.join(path.dirname(file), 'Child.svelte'));
            assert.equal(diagnostics.length, 1, JSON.stringify(diagnostics));
            assert.equal(diagnostics[0]!.code, 2339);
            assert.equal(child.slice(diagnostics[0]!.pos, diagnostics[0]!.end), 'toUpperCase');
        } finally { snapshot.dispose(); }
    }, { 'Child.svelte': child });
});


test('type checking and typed lint share a native Program and cached type facts', () => {
    const source = '<script lang="ts">const café: string = "🚀"; const value: number = café;</script><p>{café}</p>';
    project(source, (api, config, file) => {
        const snapshot = api.createSnapshot({ openProjects: [config] });
        try {
            const native = snapshot.getConfiguredProject(config)!;
            const ast = native.program.getSourceFile(file)!;
            const info = new ProjectTypeInfo(native);
            const diagnostics = info.semanticDiagnostics(ast);
            assert.equal(diagnostics.length, 1);
            assert.equal(info.semanticDiagnostics(ast), diagnostics);
            const start = source.lastIndexOf('café');
            const query = { start: Buffer.byteLength(source.slice(0, start)), end: Buffer.byteLength(source.slice(0, start + 4)), kind: SyntaxKind.Identifier };
            const check = info.typesAt(ast, query);
            const lint = info.typesAt(ast, query);
            assert.equal(check.status, 'measured');
            assert.equal(lint.types[0], check.types[0]);
            assert.equal(native.checker.typeToString(lint.types[0]!), 'string');
            assert.equal(info.measurements.typeRequests, 1);
            assert.equal(info.measurements.diagnosticRequests, 1);
            const mapped = info.diagnosticSpan(ast, diagnostics[0]!);
            assert.ok(mapped);
            assert.equal(Buffer.from(source).subarray(mapped.start, mapped.end).toString(), 'value');
            assert.equal(info.typesAt(ast, { start: 0, end: 1, kind: SyntaxKind.Identifier }).status, 'unmapped');
            assert.equal(info.measurements.typeRequests, 1);
            const empty = info.typesAt(ast, { start: query.start, end: query.end, kind: SyntaxKind.CallExpression });
            assert.equal(empty.status, 'unmapped');
            assert.throws(() => info.typesAt(ast, { ...query, start: query.start + 4 }), /Unicode code point/);
        } finally { snapshot.dispose(); }
    });
});


test('empty prop defaults accept evolving arrays and preserve explicit bindable type arguments', () => {
    const child = `<script lang="ts">let { items = $bindable([]), typed = $bindable<string[]>([]) } = $props();</script>
<button onclick={() => items.push(items.length)}>{typed[0]?.toUpperCase()}</button>`;
    project(`<script lang="ts">import Child from './Child.svelte';</script>
<Child items={[1, "ok"]} typed={["ok"]}/><Child typed={[1]}/>`, (api, config, file) => {
        const snapshot = api.createSnapshot({ openProjects: [config] });
        try {
            const program = snapshot.getConfiguredProject(config)!.program;
            assert.deepEqual(program.getProgramDiagnostics(), []);
            assert.deepEqual(program.getSemanticDiagnostics(path.join(path.dirname(file), 'Child.svelte')), []);
            assert.deepEqual(program.getSemanticDiagnostics(file).map(diagnostic => diagnostic.code), [2322]);
        } finally { snapshot.dispose(); }
    }, { 'Child.svelte': child });
});
