import { allModules, crateSizes, excerpts, sourceModule } from '$lib/server/source';
import { chapters } from '$lib/site';

export const load = () => {
	const modules = allModules()
		.filter((m) => m.key.startsWith('kernel/') && m.key !== 'kernel/lib')
		.map((m) => ({
			key: m.key,
			file: m.path.split('/').at(-1)!,
			lines: m.lines,
			// The first sentence of the module comment is its summary.
			summary: m.docs.split(/(?<=[.:])\s/)[0].replace(/\n/g, ' '),
			chapter: chapters.find((c) => c.module === m.key || (c.slug === 'diagnostics' && m.key === 'kernel/diag'))
		}));
	return {
		modules,
		libDocs: sourceModule('kernel/lib').docs,
		vueDocs: sourceModule('vue/lib').docs,
		crates: crateSizes(),
		code: excerpts({
			register: 'svelte/lib/register',
			vueRegister: 'vue/lib/register',
			vueParsed: 'vue/lib/impl Artifact for Parsed',
			registry: 'kernel/pipeline/Registry',
			runDocument: 'kernel/pipeline/run_document'
		})
	};
};
