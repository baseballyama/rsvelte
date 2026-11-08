import ts from 'typescript';
import { compileModule } from 'svelte/compiler';
import { compileArtifacts } from './svelte-shared.ts';
import type { Task } from '../types.ts';

/**
 * `compileModule` reads JavaScript only: a bundler strips the types of a `.svelte.ts` module
 * first. TypeScript's own `transpileModule` does it here, keeping every import and export as
 * written, so nothing but the types is removed.
 */
function stripTypes(src: string, filename: string): string {
	return ts.transpileModule(src, {
		fileName: filename,
		compilerOptions: {
			target: ts.ScriptTarget.ESNext,
			module: ts.ModuleKind.ESNext,
			verbatimModuleSyntax: true,
			useDefineForClassFields: true,
		},
	}).outputText;
}

const task: Task = {
	id: 'svelte.compileModule',
	oracles: ['svelte', 'typescript'],
	variants: [
		{ id: 'client', options: { generate: 'client' } },
		{ id: 'server', options: { generate: 'server' } },
	],
	appliesTo: (unit) => unit.lang === 'svelte-module-js' || unit.lang === 'svelte-module-ts',
	run: (unit, src, variant) => {
		const js = unit.lang === 'svelte-module-ts' ? stripTypes(src, unit.path) : src;
		return compileArtifacts(() => compileModule(js, { filename: unit.path, ...variant.options }));
	},
};
export default task;
