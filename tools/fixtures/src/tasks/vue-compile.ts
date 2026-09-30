import crypto from 'node:crypto';
import { compileScript, compileStyle, compileTemplate, parse } from '@vue/compiler-sfc';
import ts from 'typescript';
import type { Artifact, Task } from '../types.ts';

/** `@vitejs/plugin-vue`'s scope id: the first 8 hex digits of the SHA-256 of the root-relative path. */
export const scopeId = (path: string): string => crypto.createHash('sha256').update(path).digest('hex').slice(0, 8);

// What `@vitejs/plugin-vue` emits for a production build: the component bound to `_sfc_main`, the
// template compiled inline into `setup` (or, without a script, into a render function), and what
// the plugin attaches (`render`, `__scopeId`) passed to its `_export_sfc` helper. compileScript
// leaves TypeScript in place for Vite's own transform to erase; here `transpileModule` erases it,
// keeping every import as written (`verbatimModuleSyntax`, as Vite's esbuild transform does).
const task: Task = {
	id: 'vue.compile',
	storage: 'committed',
	oracles: ['@vue/compiler-sfc', 'typescript'],
	variants: [{ id: 'default', options: {} }],
	appliesTo: (unit) => unit.lang === 'vue',
	run(unit, src) {
		const { descriptor, errors } = parse(src, { filename: unit.path });
		if (errors.length) throw new Error(`${unit.path}: ${errors[0]}`);
		const id = scopeId(unit.path);
		const scoped = descriptor.styles.some((s) => s.scoped);
		const attached: string[] = [];
		const parts: string[] = [];
		if (descriptor.script || descriptor.scriptSetup) {
			parts.push(compileScript(descriptor, { id, inlineTemplate: true, genDefaultAs: '_sfc_main' }).content);
		} else {
			parts.push('const _sfc_main = {}');
			if (descriptor.template) {
				const t = compileTemplate({ source: descriptor.template.content, filename: unit.path, id, scoped });
				if (t.errors.length) throw new Error(`${unit.path}: ${t.errors[0]}`);
				parts.push(t.code.replace(/\nexport (function|const) (render|ssrRender)/, '\n$1 _sfc_$2'));
				attached.push(`['render',_sfc_render]`);
			}
		}
		if (scoped) attached.push(`['__scopeId',"data-v-${id}"]`);
		if (attached.length) {
			parts.push(`import _export_sfc from 'plugin-vue:export-helper'`);
			parts.push(`export default /*#__PURE__*/_export_sfc(_sfc_main, [${attached.join(',')}])`);
		} else {
			parts.push('export default _sfc_main');
		}
		let js = parts.join('\n') + '\n';
		if (descriptor.scriptSetup?.lang === 'ts' || descriptor.script?.lang === 'ts') {
			js = ts.transpileModule(js, {
				compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext, verbatimModuleSyntax: true }
			}).outputText;
		}
		const out: Record<string, Artifact> = { js: { text: js, ext: 'js', compare: 'js-ast' } };
		const css = descriptor.styles.map((s) => {
			const r = compileStyle({ source: s.content, filename: unit.path, id: `data-v-${id}`, scoped: s.scoped });
			if (r.errors.length) throw new Error(`${unit.path}: ${r.errors[0]}`);
			return r.code;
		});
		if (css.length) out.css = { text: css.join('\n'), ext: 'css', compare: 'text' };
		return out;
	}
};
export default task;
