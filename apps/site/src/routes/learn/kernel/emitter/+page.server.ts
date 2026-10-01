import counter from '$lib/data/emit/counter-client.json';
import { excerpts } from '$lib/server/source';

export const load = () => ({
	counter,
	code: excerpts({
		mapping: 'kernel/output/emitter/Mapping',
		emitter: 'kernel/output/emitter/Emitter',
		mark: 'kernel/output/emitter/Emitter::mark',
		copy: 'kernel/output/emitter/Emitter::copy',
		pushFor: 'kernel/output/emitter/Emitter::push_for',
		lookup: 'kernel/output/emitter/Emitter::lookup',
		lookupSpan: 'kernel/output/emitter/Emitter::lookup_span',
		spansTest: 'kernel/output/emitter/tests::spans_map_back_through_copies_and_quotes',
		points: 'kernel/output/emitter/Emitter::points',
		sourceMap: 'kernel/output/emitter/Emitter::source_map',
		vlq: 'kernel/output/emitter/vlq',
		edits: 'kernel/output/emitter/Edits',
		applyIn: 'kernel/output/emitter/Edits::apply_in',
		lookupOverlap: 'kernel/output/emitter/Emitter::lookup_overlap',
		mapBack: 'javascript/check/MapBack',
		checkProjected: 'javascript/check/check_projected'
	})
});
