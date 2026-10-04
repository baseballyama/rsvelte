import { ProjectTypeInfo } from '../../../type-information/src/index.ts';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { svelte2tsx } from 'svelte2tsx';
import { VERSION } from 'svelte/compiler';
import { API, type Snapshot, type Project, type Diagnostic, type Type } from 'typescript-7/unstable/sync';
import { oracleMappings, type MappingTuple } from './mappings.ts';
import { type Node } from 'typescript-7/unstable/ast';
import { ObservationIndex, SourceMappings, sourceObservations, type Observation } from './observations.ts';
import { TypeComparison, UnmeasuredType } from './types.ts';

export interface Projection {
	input: string;
	status: 'projected' | 'unsupported' | 'parse-error';
	code?: string;
	mappings?: MappingTuple[];
	detail?: string;
}

export interface QueryResult extends Observation {
	verdict: 'match' | 'mismatch' | 'UNMEASURED';
	left?: string;
	right?: string;
	detail?: string;
}

export interface UnitResult {
	input: string;
	verdict: 'match' | 'mismatch' | 'UNMEASURED' | 'unsupported';
	queries: QueryResult[];
	detail?: string;
	diagnostics?: { left: DiagnosticObservation[]; right: DiagnosticObservation[] };
	publicContract: 'match' | 'mismatch' | 'UNMEASURED';
	publicContractDetail?: string;
}

interface DiagnosticObservation {
	key: string | null;
	code: number;
	message: string;
}

export const COMPILER_OPTIONS = {
	strict: true, noEmit: true, skipLibCheck: true, target: 'esnext', module: 'esnext',
	moduleResolution: 'bundler', moduleDetection: 'force', types: ['svelte']
};

export const ORACLE_OPTIONS = { isTsFile: true, mode: 'ts' as const, version: VERSION };

export class SemanticChecker {
	private readonly directory: string;
	private readonly config: string;
	private readonly leftFile: string;
	private readonly rightFile: string;
	private readonly api: API;
	private snapshot: Snapshot;
	private readonly declarations: string[];
	readonly mapperBinary: string;
	readonly milliseconds = { startup: 0, oracle: 0, load: 0, queries: 0 };

	constructor(tools: string) {
		this.directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rsvelte-semantic-'));
		this.config = path.join(this.directory, 'tsconfig.json');
		this.leftFile = path.join(this.directory, 'left.svelte');
		this.rightFile = path.join(this.directory, 'right.svelte');
		const modules = path.join(this.directory, 'node_modules');
		fs.mkdirSync(modules);
		for (const entry of fs.readdirSync(path.join(tools, 'node_modules'))) {
			fs.symlinkSync(path.join(tools, 'node_modules', entry), path.join(modules, entry), 'dir');
		}
		this.mapperBinary = fs.realpathSync(process.env.RSVELTE_TYPESCRIPT_CONTENT_MAPPER ?? path.resolve(tools, '../../target/debug/rsvelte-typescript-content-mapper'));
		const mapper = path.join(modules, 'rsvelte-semantic-mapper');
		fs.mkdirSync(mapper);
		fs.writeFileSync(path.join(mapper, 'package.json'), JSON.stringify({
			name: 'rsvelte-semantic-mapper', version: '0.0.0',
			typescript: { contentMapper: { exec: [this.mapperBinary] } }
		}));
		this.declarations = [
			path.resolve(tools, '../../crates/languages/svelte/typescript_projection/vendor/svelte-jsx-v4.d.ts'),
			path.resolve(tools, '../../crates/languages/svelte/typescript_projection/projection.d.ts'),
			path.join(tools, 'node_modules/svelte2tsx/svelte-shims-v4.d.ts')
		];
		this.writeConfig('initial');
		fs.writeFileSync(this.leftFile, '');
		fs.writeFileSync(this.rightFile, '');
		for (const file of [this.leftFile, this.rightFile]) fs.writeFileSync(`${file}.projection.json`, JSON.stringify({ source: '', text: '', mappings: [] }));
		const started = performance.now();
		this.api = new API({ cwd: this.directory, collectTiming: true, runExternalCode: true });
		this.snapshot = this.api.createSnapshot({ openProjects: [this.config] });
		this.milliseconds.startup = performance.now() - started;
	}

	compare(projection: Projection, source: string): UnitResult {
		const base = { input: projection.input, queries: [], publicContract: 'UNMEASURED' as const };
		if (projection.status !== 'projected') {
			return { ...base, verdict: projection.status === 'unsupported' ? 'unsupported' : 'UNMEASURED', detail: projection.detail ?? projection.status };
		}
		if (projection.code === undefined || projection.mappings === undefined) throw new Error('projected result must include code and span mappings');
		let observations: Observation[], oracle: ReturnType<typeof svelte2tsx>;
		const oracleStarted = performance.now();
		try {
			const parsed = sourceObservations(source);
			observations = parsed.observations;
			oracle = svelte2tsx(source, { filename: projection.input, ...ORACLE_OPTIONS });
		} catch (error) {
			return { ...base, verdict: 'UNMEASURED', detail: `oracle: ${message(error)}` };
		} finally {
			this.milliseconds.oracle += performance.now() - oracleStarted;
		}
		fs.writeFileSync(this.leftFile, source);
		fs.writeFileSync(this.rightFile, source);
		if (oracle.map.version !== 3) throw new Error('oracle returned an unsupported source map version');
		const leftOutput = { source, text: projection.code, mappings: projection.mappings };
		const rightOutput = { source, text: oracle.code, mappings: oracleMappings(source, oracle.code, { ...oracle.map, version: 3 }) };
		const leftData = JSON.stringify(leftOutput), rightData = JSON.stringify(rightOutput);
		fs.writeFileSync(`${this.leftFile}.projection.json`, leftData);
		fs.writeFileSync(`${this.rightFile}.projection.json`, rightData);
		// Mapper options are part of native transform identity, including defect-control changes.
		this.writeConfig(createHash('sha256').update(leftData).update(rightData).digest('hex'));
		const loadStarted = performance.now();
		const snapshot = this.snapshot.update({ ensurePrograms: true, fileNotifications: { changed: [this.config, this.leftFile, this.rightFile] } });
		if (snapshot !== this.snapshot) this.snapshot.dispose();
		this.snapshot = snapshot;
		this.api.clearSourceFileCache();
		this.milliseconds.load += performance.now() - loadStarted;
		try {
			const project = snapshot.getConfiguredProject(this.config);
			if (!project) throw new Error('native checker did not load the project');
			const global = [...project.program.getConfigFileParsingDiagnostics(), ...project.program.getProgramDiagnostics(), ...project.program.getGlobalDiagnostics()];
			if (global.length) return { ...base, verdict: 'UNMEASURED', detail: `project diagnostics: ${JSON.stringify(global)}` };
			const left = project.program.getSourceFile(this.leftFile), right = project.program.getSourceFile(this.rightFile);
			if (!left || !right) throw new Error(`native checker did not load both projections: ${JSON.stringify(project.program.getConfigFileParsingDiagnostics())}`);
			if (left.text !== projection.code || right.text !== oracle.code || left.originalText !== source || right.originalText !== source) throw new Error('native source tree does not match the current projection');

			const syntax = [...project.program.getSyntacticDiagnostics(this.leftFile), ...project.program.getSyntacticDiagnostics(this.rightFile)];
			if (syntax.length) return { ...base, verdict: 'UNMEASURED', detail: `invalid generated TS: ${JSON.stringify(syntax)}` };
			const info = new ProjectTypeInfo(project);
			const leftMap = new SourceMappings(info.mappedNodes(left));
			const rightMap = new SourceMappings(info.mappedNodes(right));
			const queryStarted = performance.now();
			try {
				const leftDiagnostics = info.semanticDiagnostics(left);
				const rightDiagnostics = info.semanticDiagnostics(right);
				const missing = [...leftDiagnostics, ...rightDiagnostics].filter((diagnostic) => [2307, 2688, 7016].includes(diagnostic.code));
				if (missing.length) return { ...base, verdict: 'UNMEASURED', detail: `missing dependencies: ${JSON.stringify(missing)}` };
				const leftNodes = leftMap.nodes(observations), rightNodes = rightMap.nodes(observations);
				const queries = compareQueries(info, observations, leftNodes, rightNodes);
				const diagnostics = {
					left: diagnosticObservations(leftDiagnostics, observations),
					right: diagnosticObservations(rightDiagnostics, observations)
				};
				const keys = (rows: DiagnosticObservation[]) => [...new Set(rows.flatMap((row) => row.key === null ? [] : [row.key]))].sort();
				const unmappedDiagnostic = [...diagnostics.left, ...diagnostics.right].some((diagnostic) => diagnostic.key === null);
				const diagnosticMismatch = !unmappedDiagnostic && JSON.stringify(keys(diagnostics.left)) !== JSON.stringify(keys(diagnostics.right));
				const contract = compareContract(project, this.leftFile, this.rightFile);
				const unmeasured = contract.publicContract === 'UNMEASURED' || !queries.length || queries.some((query) => query.verdict === 'UNMEASURED') ||
					unmappedDiagnostic;
				const mismatch = contract.publicContract === 'mismatch' || diagnosticMismatch || queries.some((query) => query.verdict === 'mismatch');
				return { ...base, ...contract, queries, diagnostics, verdict: mismatch ? 'mismatch' : unmeasured ? 'UNMEASURED' : 'match',
					...(!queries.length ? { detail: 'no observable source expressions' } : diagnosticMismatch ? { detail: 'source diagnostic coverage differs' } : {}) };
			} finally {
				this.milliseconds.queries += performance.now() - queryStarted;
			}
		} catch (error) {
			return { ...base, verdict: 'UNMEASURED', detail: `native checker: ${message(error)}` };
		}
	}

	private writeConfig(identity: string): void {
		fs.writeFileSync(this.config, JSON.stringify({
			compilerOptions: COMPILER_OPTIONS,
			contentMappers: [{ package: 'rsvelte-semantic-mapper', extensions: ['.svelte'], options: { identity } }],
			files: [this.leftFile, this.rightFile, ...this.declarations]
		}));
	}

	close(): void {
		this.snapshot.dispose();
		this.api.close();
		fs.rmSync(this.directory, { recursive: true, force: true });
	}
}

function compareQueries(info: ProjectTypeInfo, observations: Observation[], leftNodes: Map<string, Node[]>, rightNodes: Map<string, Node[]>): QueryResult[] {
	const project = info.project;
    const query = (nodes: Map<string, Node[]>) => {
        const all = [...nodes.values()].flat();
        const types = info.typesOf(all);
        return new Map(all.map((node, index) => [node, types[index]]));
    };
    const leftTypes = query(leftNodes), rightTypes = query(rightNodes);
    const comparison = new TypeComparison(project.checker);
	return observations.map((observation): QueryResult => {
		const a = leftNodes.get(observation.key), b = rightNodes.get(observation.key);
		if (!a?.length || !b?.length) return { ...observation, verdict: 'UNMEASURED', detail: `mapped node missing: rsvelte=${a?.length ?? 0}, oracle=${b?.length ?? 0}` };
		const first = leftTypes.get(a[0]!);
		const describe = (type: Type | undefined) => type ? project.checker.typeToString(type) : '<missing>';
		try {
			for (const node of [...a, ...b]) {
				const other = leftTypes.has(node) ? leftTypes.get(node) : rightTypes.get(node);
				if (!comparison.compare(first, other)) {
					return { ...observation, verdict: 'mismatch', left: describe(first), right: describe(other) };
				}
			}
			return { ...observation, verdict: 'match', left: describe(first), right: describe(rightTypes.get(b[0]!)) };
		} catch (error) {
			if (!(error instanceof UnmeasuredType)) throw error;
			return { ...observation, verdict: 'UNMEASURED', detail: error.message };
		}
	});
}

const VIRTUAL_DIAGNOSTIC_LOCATION = 18074;

function diagnosticObservations(diagnostics: readonly Diagnostic[], observations: Observation[]): DiagnosticObservation[] {
	const index = new ObservationIndex(observations);
	return diagnostics.map((diagnostic) => {
		const virtualLocation = diagnostic.messageChain?.some((message) => message.code === VIRTUAL_DIAGNOSTIC_LOCATION);
		const start = diagnostic.pos < 0 || virtualLocation ? undefined : diagnostic.pos;
		const containing = start === undefined ? undefined : index.at(start);
		return { key: containing?.key ?? (start === undefined ? null : `source:${start}`), code: diagnostic.code,
			message: diagnostic.text };
	});
}

function message(error: unknown): string { return error instanceof Error ? error.message : String(error); }


function compareContract(project: Project, leftFile: string, rightFile: string): Pick<UnitResult, 'publicContract' | 'publicContractDetail'> {
    const type = (file: string) => {
        const module = project.checker.getSymbolOfSourceFile(file);
        const symbol = module && project.checker.getMemberInModuleExports(module, 'default');
        return symbol ? project.checker.getTypeOfSymbol(symbol) : undefined;
    };
    const parts = (type: Type | undefined): { props: Type; exports: Type; bindings: Type; legacy: boolean } => {
        if (!type?.isTypeReference()) throw new UnmeasuredType('unsupported component contract');
        const name = type.getSymbol()?.name;
        const args = project.checker.getTypeArguments(type);
        if (name === 'Component' && args.length === 3) return { props: args[0]!, exports: args[1]!, bindings: args[2]!, legacy: false };
        if (name === '__sveltets_2_IsomorphicComponent' && args.length === 5) return { props: args[0]!, exports: args[3]!, bindings: args[4]!, legacy: true };
        throw new UnmeasuredType(`unsupported component contract ${name}`);
    };
    try {
        const left = type(leftFile), right = type(rightFile);
        if (!left && right) return { publicContract: 'mismatch', publicContractDetail: 'missing default component export' };
        const a = parts(left), b = parts(right);
        if (b.legacy && b.bindings.isIntrinsicType() && b.bindings.intrinsicName === 'string') {
            throw new UnmeasuredType('legacy oracle does not expose bindable keys');
        }
        const comparison = new TypeComparison(project.checker);
        for (const part of ['props', 'exports', 'bindings'] as const) {
            if (!comparison.compare(a[part], b[part])) return { publicContract: 'mismatch', publicContractDetail: `${part}: ${project.checker.typeToString(a[part])} != ${project.checker.typeToString(b[part])}` };
        }
        return { publicContract: 'match' };
    } catch (error) {
        if (!(error instanceof UnmeasuredType)) throw error;
        return { publicContract: 'UNMEASURED', publicContractDetail: error.message };
    }
}
