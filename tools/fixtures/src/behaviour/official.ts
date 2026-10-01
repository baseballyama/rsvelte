// A component compiled by its own language's official toolchain into the two modules a build
// emits, client and server, each with the component as its default export. These are the
// expected side of a behaviour trace.
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';
import { compile } from 'svelte/compiler';
import ts from 'typescript';
import { scopeId } from '../tasks/vue-compile.ts';
import type { Target } from './modules.ts';

/** `svelte/compiler` with the options `svelte.compile` uses. */
export function svelteModule(src: string, filename: string, target: Target): string {
	return compile(src, { filename, runes: true, generate: target }).js.code;
}

// As `@vitejs/plugin-vue` builds a component: the template inlined into `setup`, compiled for the
// DOM or, for the server build, to an SSR render function (`templateOptions.ssr`). Styles are not
// emitted, since traces do not compare them; the scope id is still attached so scoped markup is
// what a build renders.
export function vueModule(src: string, filename: string, target: Target): string {
	const { descriptor, errors } = parse(src, { filename });
	if (errors.length) throw new Error(`${filename}: ${errors[0]}`);
	const id = scopeId(filename);
	const scoped = descriptor.styles.some((s) => s.scoped);
	const ssr = target === 'server';
	const parts: string[] = [];
	if (descriptor.script || descriptor.scriptSetup) {
		parts.push(compileScript(descriptor, { id, inlineTemplate: true, genDefaultAs: '_sfc_main', templateOptions: { ssr, ssrCssVars: descriptor.cssVars } }).content);
	} else {
		parts.push('const _sfc_main = {}');
		if (descriptor.template) {
			const t = compileTemplate({ source: descriptor.template.content, filename, id, scoped, ssr, ssrCssVars: descriptor.cssVars });
			if (t.errors.length) throw new Error(`${filename}: ${t.errors[0]}`);
			const fn = ssr ? 'ssrRender' : 'render';
			parts.push(t.code.replace(new RegExp(`\\nexport (function|const) ${fn}`), `\n$1 _sfc_${fn}`), `_sfc_main.${fn} = _sfc_${fn}`);
		}
	}
	if (scoped) parts.push(`_sfc_main.__scopeId = "data-v-${id}"`);
	parts.push('export default _sfc_main');
	const js = parts.join('\n') + '\n';
	if (descriptor.scriptSetup?.lang !== 'ts' && descriptor.script?.lang !== 'ts') return js;
	return ts.transpileModule(js, { compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext, verbatimModuleSyntax: true } }).outputText;
}
