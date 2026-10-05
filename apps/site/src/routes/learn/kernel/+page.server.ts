import { allModules, crateSizes, excerpts, sourceModule } from '$lib/server/source';
import { chaptersIn } from '$lib/site';
import { moduleDescription } from '$lib/module-descriptions';

export const load = () => {
	const modules = allModules()
		.filter((m) => m.key.startsWith('kernel/') && m.key !== 'kernel/lib')
		.map((m) => ({
			key: m.key,
			file: m.path.slice(m.path.indexOf('/src/') + 5),
			lines: m.lines,
			...moduleDescription(m.key),
			chapter: chaptersIn('ja').find((c) => c.module === m.key || (c.slug === 'diagnostics' && m.key === 'kernel/diagnostics/diagnostic'))
		}));
	return {
		modules,
		libDocs: sourceModule('kernel/lib').docs,
		crates: crateSizes(),
		code: excerpts({
			register: 'svelte/computation/register',
			vueRegister: 'vue/computation/artifacts/register',
			vueParsed: 'vue/computation/artifacts/impl Artifact for Parsed',
			registry: 'kernel/computation/pipeline/Registry',
			runDocument: 'kernel/computation/pipeline/run_document'
		})
	};
};
