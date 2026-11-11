import { polishArms } from '#lib/server/benchmark.ts';
import { performanceHistory } from '#lib/server/performance.ts';
import { excerpts } from '#lib/server/source.ts';

// Instructions counted over different samples of the files do not compare.
function history() {
	const all = performanceHistory();
	const last = all.at(-1)!;
	const most = (sample: number) =>
		Math.max(...all.filter((r) => r.instruction_sample === sample).map((r) => r.instructions ?? 0));
	return {
		rows: all.map((r, i) => {
			const prev = all[i - 1];
			const comparable = prev?.instruction_sample === r.instruction_sample;
			return {
				...r,
				prev,
				instructionsWas: comparable ? prev.instructions : null,
				loadWas: comparable ? prev.load_instructions : null,
				instructionsWidth:
					r.instructions === null ? 0 : r.instructions / most(r.instruction_sample),
			};
		}),
		last,
		first: all[0],
		firstInstr: all.find(
			(r) => r.instructions !== null && r.instruction_sample === last.instruction_sample,
		)!,
		firstLoad: all.find(
			(r) => r.load_instructions !== null && r.instruction_sample === last.instruction_sample,
		)!,
	};
}

export const load = () => ({
	polish: polishArms(),
	history: history(),
	code: excerpts({
		trimLeft: 'document_printer/rewrite/LayoutInstructions::trim_left_range',
		take: 'kernel/performance/buffer_pool/take',
		runEach: 'kernel/computation/pipeline/run_each',
		num: 'kernel/output/structured_data/StructuredDataWriter::write_number',
		fixed: 'kernel/output/structured_data/StructuredDataWriter::fixed',
	}),
});
