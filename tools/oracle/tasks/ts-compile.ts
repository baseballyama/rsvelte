import ts from 'typescript';
import type { Task } from '../types.ts';

/**
 * TypeScript's emit of a `.ts` file or a `.svelte.ts` module, with the options `svelte.compileModule` strips a
 * `.svelte.ts` module with: every import and export as written, nothing but the types removed.
 * The tree is compared with its parentheses, and the comments by the comment check; the rest of
 * TypeScript's layout is not compared.
 */
export function emit(src: string, fileName: string): ts.TranspileOutput {
	return ts.transpileModule(src, {
		fileName,
		reportDiagnostics: true,
		compilerOptions: {
			target: ts.ScriptTarget.ESNext,
			module: ts.ModuleKind.ESNext,
			verbatimModuleSyntax: true,
			useDefineForClassFields: true,
		},
	});
}

const task: Task = {
	id: 'ts.compile',
	oracles: ['typescript'],
	variants: [{ id: 'default', options: {} }],
	// TypeScript emits nothing for a declaration file (`x.d.svelte.ts`).
	appliesTo: (unit) =>
		unit.lang === 'ts' || (unit.lang === 'svelte-module-ts' && !unit.path.endsWith('.d.svelte.ts')),
	run: (unit, src) => ({
		js: { text: emit(src, unit.path).outputText, ext: 'js', compare: 'js-ast-parens' },
	}),
};
export default task;
