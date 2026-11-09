import { allModules, crateSizes, excerpts, sourceModule } from '#lib/server/source.ts';
import { chapters } from '#lib/site.ts';
import { moduleDescription } from '#lib/module-descriptions.ts';

export const load = () => {
	const modules = allModules()
		.filter((m) => m.key.startsWith('kernel/') && m.key !== 'kernel/lib')
		.map((m) => ({
			key: m.key,
			file: m.path.slice(m.path.indexOf('/src/') + 5),
			lines: m.lines,
			title: moduleDescription(m.key).title,
			summary: moduleDescription(m.key).summary,
			chapter: chapters.find((c) => c.module === m.key),
		}));
	return {
		modules,
		libDocs: sourceModule('kernel/lib').docs,
		crates: crateSizes(),
		code: excerpts({
			register: 'svelte/semantic/computation/register',
			vueRegister: 'vue/semantic/computation/register',
			vueParsed: 'vue/syntax/computation/impl Artifact for Parsed',
			registry: 'kernel/computation/registry/Registry',
			runDocument: 'kernel/computation/pipeline/run_document',
		}),
	};
};
