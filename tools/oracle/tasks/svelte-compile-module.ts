import ts from 'typescript';
import { TraceMap, traceSegment } from '@jridgewell/trace-mapping';
import { compileModule } from 'svelte/compiler';
import { compileArtifacts, type Position } from './svelte-shared.ts';
import type { Task } from '../types.ts';

/**
 * `compileModule` reads JavaScript only: a bundler strips the types of a `.svelte.ts` module
 * first. TypeScript's own `transpileModule` does it here, keeping every import and export as
 * written, so nothing but the types is removed.
 */
function stripTypes(src: string, filename: string): { js: string; map: TraceMap } {
	const { outputText, sourceMapText } = ts.transpileModule(src, {
		fileName: filename,
		compilerOptions: {
			target: ts.ScriptTarget.ESNext,
			module: ts.ModuleKind.ESNext,
			verbatimModuleSyntax: true,
			useDefineForClassFields: true,
			sourceMap: true,
		},
	});
	return { js: outputText, map: new TraceMap(sourceMapText!) };
}

/**
 * A position in the stripped text, moved back to the module as written: by the offset into the
 * token TypeScript mapped, which it copies unchanged.
 */
function original(map: TraceMap, starts: number[], p: Position): Position {
	const segment = traceSegment(map, p.line - 1, p.column);
	if (!segment || segment.length === 1) throw new Error(`no source for ${p.line}:${p.column}`);
	const [generated, , sourceLine, sourceColumn] = segment;
	const line = sourceLine + 1;
	const column = sourceColumn + (p.column - generated);
	return { line, column, character: starts[sourceLine]! + column };
}

function lineStarts(src: string): number[] {
	const starts = [0];
	for (let i = 0; i < src.length; i++) if (src[i] === '\n') starts.push(i + 1);
	return starts;
}

const task: Task = {
	id: 'svelte.compileModule',
	oracles: ['svelte', 'typescript'],
	variants: [
		{ id: 'client', options: { generate: 'client' } },
		{ id: 'server', options: { generate: 'server' } },
	],
	// A declaration file (`x.d.svelte.ts`) only describes a module; nothing compiles it at runtime.
	appliesTo: (unit) =>
		(unit.lang === 'svelte-module-js' || unit.lang === 'svelte-module-ts') &&
		!unit.path.endsWith('.d.svelte.ts'),
	run: (unit, src, variant) => {
		const compile = (js: string) => compileModule(js, { filename: unit.path, ...variant.options });
		if (unit.lang !== 'svelte-module-ts') return compileArtifacts(() => compile(src));
		const { js, map } = stripTypes(src, unit.path);
		const starts = lineStarts(src);
		return compileArtifacts(
			() => compile(js),
			(p) => original(map, starts, p),
		);
	},
};
export default task;
