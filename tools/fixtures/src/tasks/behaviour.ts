// Cross-runtime compilation has no upstream output to compare with, so correctness is behavioural:
// the component compiled for the other runtime must render and react as the official toolchain of
// its own language makes it render and react. The expected artifact is the trace of the official
// build on the source language's runtime; the actual one is the trace of rsvelte's emitted module
// on the target runtime, under the same props and steps (docs/fixtures.md §12).
import { svelteModule, vueModule } from '../behaviour/official.ts';
import type { Target } from '../behaviour/modules.ts';
import { moduleFile, trace, traceDiff, traceErrors, type Runtime, type Trace } from '../behaviour/runtime.ts';
import { stableStringify } from '../fsutil.ts';
import type { Task, Unit, Variant } from '../types.ts';

const traceText = (t: Trace): string => stableStringify(t) + '\n';

function behaviourTask(id: string, lang: string, source: Runtime, target: Runtime): Task {
	const official = source === 'svelte' ? svelteModule : vueModule;
	return {
		id,
		storage: 'committed',
		oracles: source === 'svelte' ? ['svelte', 'jsdom'] : ['@vue/compiler-sfc', 'vue', 'typescript', 'jsdom'],
		variants: [
			{ id: 'client', options: {} },
			{ id: 'server', options: {} }
		],
		appliesTo: (unit) => unit.lang === lang,
		async run(unit: Unit, src: string, variant: Variant) {
			const t = variant.id as Target;
			const result = await trace(source, t, moduleFile(official(src, unit.path, t), t), unit.fixture.behaviour ?? {});
			const errors = traceErrors(result);
			if (errors.length > 0) throw new Error(`${unit.path}: the official ${source} build fails its own steps: ${errors.join('; ')}`);
			return { trace: { text: traceText(result), ext: 'trace.json', compare: 'json' } };
		},
		observe: {
			ext: 'trace.json',
			async derive(unit: Unit, variant: Variant, file: string) {
				const result = await trace(target, variant.id as Target, file, unit.fixture.behaviour ?? {});
				const text = traceText(result);
				return { text, diff: (expected: string) => traceDiff(JSON.parse(expected), JSON.parse(text)) };
			}
		}
	};
}

/** A `.vue` component compiled for the Svelte runtime. */
export const svueBehaviour = behaviourTask('svue.behaviour', 'cross-vue', 'vue', 'svelte');
/** A `.svelte` component compiled for the Vue runtime. */
export const vuelteBehaviour = behaviourTask('vuelte.behaviour', 'cross-svelte', 'svelte', 'vue');
