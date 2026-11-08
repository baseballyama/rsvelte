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
		replaceParts: 'kernel/output/document/LayoutInstructions::replace_parts',
		trimLeft: 'kernel/output/document/LayoutInstructions::trim_left',
		take: 'kernel/performance/buffer_pool/take',
		runEach: 'kernel/computation/pipeline/run_each',
		punct: 'typescript/syntax/lexer/Lexer::punct',
		punctTest:
			'typescript/syntax/lexer/tests/punctuators_are_the_longest_match_of_the_operator_table',
		parserClose: 'typescript/syntax/parser/Parser::close',
		recorded: 'typescript/syntax/syntax_tree/SyntaxTree::recorded_since',
		num: 'kernel/output/structured_data/StructuredDataWriter::write_number',
		fixed: 'kernel/output/structured_data/StructuredDataWriter::fixed',
	}),
});
