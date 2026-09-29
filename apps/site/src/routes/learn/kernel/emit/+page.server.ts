import counter from '$lib/data/emit/counter-client.json';
import { excerpts } from '$lib/server/source';

export const load = () => ({
	counter,
	code: excerpts({
		mapping: 'kernel/emit/Mapping',
		emitter: 'kernel/emit/Emitter',
		mark: 'kernel/emit/Emitter::mark',
		copy: 'kernel/emit/Emitter::copy',
		pushFor: 'kernel/emit/Emitter::push_for',
		lookup: 'kernel/emit/Emitter::lookup',
		lookupSpan: 'kernel/emit/Emitter::lookup_span',
		spansTest: 'kernel/emit/tests::spans_map_back_through_copies_and_quotes',
		points: 'kernel/emit/Emitter::points',
		sourceMap: 'kernel/emit/Emitter::source_map',
		vlq: 'kernel/emit/vlq',
		edits: 'kernel/emit/Edits',
		applyIn: 'kernel/emit/Edits::apply_in',
		checkFinish: 'svelte/tasks/Check::finish'
	})
});
