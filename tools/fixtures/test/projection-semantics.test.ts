import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import { API } from 'typescript-7/unstable/sync';
import { SyntaxKind, type VariableStatement } from 'typescript-7/unstable/ast';
import { SemanticChecker, type Projection } from '../src/semantic/checker.ts';
import { projections, comparePopulation } from '../src/semantic/run.ts';
import { TypeComparison, UnmeasuredType } from '../src/semantic/types.ts';

const tools = path.resolve(import.meta.dirname, '..');
const repository = path.resolve(tools, '../..');
const fixture = path.join(repository, 'crates/languages/svelte/compile/tests/fixtures/rsvelte/ts-props');
const binary = process.env.RSVELTE_SEMANTIC_PROJECTOR ?? path.join(repository, 'target/debug/examples/semantic');
let checker: SemanticChecker;
let projection: Projection;
let source: string;

before(async () => {
	if (!process.env.RSVELTE_SEMANTIC_PROJECTOR) {
		const built = spawnSync('cargo', ['build', '--offline', '-p', 'rsvelte_typescript_content_mapper', '-p', 'rsvelte_svelte_typescript_projection', '--bins', '--example', 'semantic'], { cwd: repository, encoding: 'utf8' });
		assert.equal(built.status, 0, built.stderr);
	}
	const rows: Projection[] = [];
	for await (const row of projections(binary, fixture)) rows.push(row);
	assert.equal(rows.length, 1);
	projection = rows[0]!;
	assert.equal(projection.status, 'projected');
	source = fs.readFileSync(projection.input, 'utf8');
	checker = new SemanticChecker(tools);
});
after(() => checker?.close());

test('real Rust and svelte2tsx output expose matching template and callback types through TS 7', () => {
	const result = checker.compare(projection, source);
	assert.notEqual(result.verdict, 'mismatch', JSON.stringify(result));
	assert.ok(result.queries.some((query) => query.verdict === 'match' && query.left === 'string'));
	assert.ok(result.queries.some((query) => query.verdict === 'match' && query.left?.includes('number')));
	assert.ok(result.queries.some((query) => query.verdict === 'match' && query.role === 'ArrowFunctionExpression'));
	assert.equal(result.publicContract, 'match', JSON.stringify(result));
});

function defect(before: string, after: string): Projection {
	assert.ok(projection.code?.includes(before), 'the control must change the actual Rust output');
	assert.equal(before.length, after.length, 'the control must preserve generated source positions');
	const start = Buffer.byteLength(projection.code!.slice(0, projection.code!.indexOf(before)));
	const end = start + Buffer.byteLength(before);
	const mappings = projection.mappings!.flatMap(([lo, length, from, copied, kind]) => {
		assert.equal(length, copied);
		if (lo + length <= start || lo >= end) return [[lo, length, from, copied, kind] as const];
		const ranges = [];
		if (lo < start) ranges.push([lo, start - lo, from, start - lo, kind] as const);
		if (lo + length > end) ranges.push([end, lo + length - end, from + end - lo, lo + length - end, kind] as const);
		return ranges;
	}).map((mapping) => [...mapping] as [number, number, number, number, number]);
	return { ...projection, code: projection.code!.replace(before, after), mappings };
}

test('removing a required property fails the semantic comparison', () => {
	const result = checker.compare(defect('name: string;', '             '), source);
	assert.equal(result.verdict, 'mismatch', JSON.stringify(result));
});

test('changing a callback parameter type fails the semantic comparison', () => {
	const result = checker.compare(defect('(s: string)', '(s: number)'), source);
	assert.equal(result.verdict, 'mismatch', JSON.stringify(result));
	assert.ok(result.queries.some((query) => query.verdict === 'mismatch'));
});

test('replacing an observed property type with any fails the semantic comparison', () => {
	const result = checker.compare(defect('name: string;', 'name: any   ;'), source);
	assert.equal(result.verdict, 'mismatch', JSON.stringify(result));
	assert.ok(result.queries.some((query) => query.verdict === 'mismatch' && query.left === 'any' && query.right === 'string'));
});

test('missing mappings, dependencies and unsupported projections are never accepted', () => {
	const unmapped = checker.compare({ ...projection, mappings: [] }, source);
	assert.equal(unmapped.verdict, 'UNMEASURED');
	assert.equal(unmapped.queries.filter((query) => query.verdict === 'match').length, 0);
	const prefix = "import missing from 'missing-semantic-control-package';\n";
	const missing = checker.compare({ ...projection, code: prefix + projection.code, mappings: projection.mappings!.map(([lo, ...rest]) => [lo + Buffer.byteLength(prefix), ...rest]) }, source);
	assert.equal(missing.verdict, 'UNMEASURED');
	assert.match(missing.detail!, /missing dependencies/);
	assert.equal(checker.compare({ input: 'unsupported', status: 'unsupported' }, source).verdict, 'unsupported');
});

test('the population report records versions, source identity and measured contracts', async () => {
	const report = await comparePopulation({ tools, projector: binary, inputs: fixture });
	assert.equal(report.population, 1);
	assert.equal(report.selected, 1);
	assert.equal(report.versions.typescript, '7.1.0-dev.20261003.1');
	assert.equal(report.versions.svelte2tsx, '0.7.61');
	assert.equal(report.rows[0]!.sourceHash.length, 64);
	assert.ok(report.queries.match > 0);
	assert.equal(report.publicContracts.match, 1);
	assert.equal(report.publicContracts.UNMEASURED, 0);
});

test('JavaScript, scriptless expressions and Unicode source positions are measured', async () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-source-controls-'));
	const sources = [
		'<script>const value = "ok";</script><p>{value}</p>',
		'<p>{42}</p>',
		'<script lang="ts">const café: string = "🚀"; const value = café;</script><p>{value}</p>'
	];
	try {
		for (const [index, input] of sources.entries()) {
			const unit = path.join(directory, String(index));
			fs.mkdirSync(unit);
			fs.writeFileSync(path.join(unit, 'input.svelte'), input);
		}
		let count = 0;
		for await (const row of projections(binary, directory)) {
			const result = checker.compare(row, fs.readFileSync(row.input, 'utf8'));
			assert.notEqual(result.verdict, 'mismatch', JSON.stringify(result));
			assert.ok(result.queries.length > 0);
			assert.ok(result.queries.every(query => query.verdict === 'match'));
			count++;
		}
		assert.equal(count, sources.length);
	} finally { fs.rmSync(directory, { recursive: true, force: true }); }
});

test('structural comparison checks special types, recursive objects, unions and signatures', () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-type-controls-'));
	const config = path.join(directory, 'tsconfig.json');
	const file = path.join(directory, 'input.ts');
	const cases: [string, string, boolean][] = [
		['any', 'unknown', false], ['unknown', 'never', false], ['any', 'never', false],
		['1n', '1n', true], ['1n', '2n', false],
		['{value: string}', '{value: any}', false],
		['{required: string}', '{required?: string}', false],
		['{readonly value: string}', '{value: string}', false],
		['Readonly<{value: string}>', '{value: string}', false],
		['(value: string) => number', '(value: number) => number', false],
		['(value?: string) => void', '(value: string) => void', false],
		['string | number', 'number | string', true],
		['{a: string} & {b: number}', '{b: number; a: string}', true],
		['{[key: string]: any}', '{[key: string]: string}', false],
		['readonly [string, number?]', '[string, number?]', false],
		['Array<any>', 'Array<string>', false],
		['<T extends string>(value: T) => T', '<U extends string>(value: U) => U', true],
		['<T extends string>(value: T) => T', '<U extends number>(value: U) => U', false],
		['<T = string>() => T', '<U = number>() => U', false],
		['RecursiveA', 'RecursiveB', true], ['RecursiveA', 'RecursiveC', false],
		['{inner: MissingType}', '{inner: MissingType}', false]
	];
	fs.writeFileSync(file, 'type RecursiveA = {value: string; next?: RecursiveA};\n' +
		'type RecursiveB = {next?: RecursiveB; value: string};\n' +
		'type RecursiveC = {next?: RecursiveC; value: any};\n' +
		cases.map(([left, right], index) => `declare let left${index}: ${left};\ndeclare let right${index}: ${right};`).join('\n'));
	fs.writeFileSync(config, JSON.stringify({ compilerOptions: { strict: true, noEmit: true }, files: [file] }));
	const api = new API({ cwd: directory });
	try {
		const snapshot = api.createSnapshot({ openProjects: [config] });
		try {
			const project = snapshot.getConfiguredProject(config)!;
			const tree = project.program.getSourceFile(file)!;
			const variables = tree.statements.filter((statement) => statement.kind === SyntaxKind.VariableStatement) as VariableStatement[];
			const types = project.checker.getTypeAtLocation(variables.map((statement) => statement.declarationList.declarations[0]!.name));
			for (const [index, [left, right, expected]] of cases.entries()) {
				const compare = () => new TypeComparison(project.checker).compare(types[index * 2], types[index * 2 + 1]);
				if (left.includes('MissingType')) assert.throws(compare, UnmeasuredType);
				else assert.equal(compare(), expected, `${left} versus ${right}`);
			}
		} finally { snapshot.dispose(); }
	} finally {
		api.close();
		fs.rmSync(directory, { recursive: true, force: true });
	}
});

test('each bindings and const values match the oracle as real native types', async () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-each-types-'));
	const input = `<script lang="ts">
const rows: { name: string; count: number }[] = [{ name: 'first', count: 1 }];
const choices: string[] | number[] = Math.random() > 0.5 ? ['ok'] : [1];
</script>
{#each rows as { name, count }, index (name)}
{@const label = name.toUpperCase()}
<button onclick={() => name = "updated"}/>
<p>{label}{count.toFixed()}{index.toFixed()}</p>
{/each}
{#each choices as choice}<p>{typeof choice === 'string' ? choice.toUpperCase() : choice.toFixed()}</p>{/each}`;
	try {
		fs.writeFileSync(path.join(directory, 'input.svelte'), input);
		let count = 0;
		for await (const row of projections(binary, directory)) {
			assert.equal(row.status, 'projected');
			const result = checker.compare(row, input);
			assert.notEqual(result.verdict, 'mismatch', JSON.stringify(result));
			assert.ok(result.queries.some((query) => query.verdict === 'match' && query.left === 'string'));
			assert.ok(result.queries.some((query) => query.verdict === 'match' && query.left === 'number'));
			count++;
		}
		assert.equal(count, 1);
	} finally { fs.rmSync(directory, { recursive: true, force: true }); }
});

test('native diagnostics compare original positions without mapping twice', async () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-diagnostic-types-'));
	const input = '<script lang="ts">const café: string[] = ["🚀"];</script>{#each café as name}<p>{name.toFixed()}</p>{/each}';
	try {
		fs.writeFileSync(path.join(directory, 'input.svelte'), input);
		let count = 0;
		for await (const row of projections(binary, directory)) {
			const result = checker.compare(row, input);
			assert.notEqual(result.verdict, 'mismatch', JSON.stringify(result));
			assert.equal(result.diagnostics!.left.length, 1);
			assert.equal(result.diagnostics!.right.length, 1);
			assert.ok(result.diagnostics!.left[0]!.key);
			assert.equal(result.diagnostics!.left[0]!.key, result.diagnostics!.right[0]!.key);
			assert.equal(result.diagnostics!.left[0]!.code, 2551);
			count++;
		}
		assert.equal(count, 1);
	} finally { fs.rmSync(directory, { recursive: true, force: true }); }
});


test('a missing public component export fails even when internal source types still match', () => {
    const code = projection.code!.replace('export default ', 'void           ');
    assert.notEqual(code, projection.code);
    const result = checker.compare({ ...projection, code }, source);
    assert.equal(result.publicContract, 'mismatch', JSON.stringify(result));
    assert.equal(result.publicContractDetail, 'missing default component export');
    assert.equal(result.verdict, 'mismatch');
    assert.ok(result.queries.every(query => query.verdict === 'match'));
});


test('JavaScript props are measured from TypeScript oracle syntax rather than ignored JSDoc', async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-js-props-'));
    const input = '<script>let { count = 0, label = "ok" } = $props();</script><p>{count.toFixed()}{label.toUpperCase()}</p>';
    try {
        fs.writeFileSync(path.join(directory, 'input.svelte'), input);
        for await (const row of projections(binary, directory)) {
            const result = checker.compare(row, input);
            assert.equal(result.publicContract, 'match', JSON.stringify(result));
            assert.equal(result.verdict, 'match', JSON.stringify(result));
            assert.ok(result.queries.some(query => query.left === 'number' && query.verdict === 'match'));
        }
    } finally { fs.rmSync(directory, { recursive: true, force: true }); }
});
