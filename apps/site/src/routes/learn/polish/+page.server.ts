import { polishArms } from '$lib/server/benchmark';
import { performanceHistory } from '$lib/server/performance';
import { excerpts } from '$lib/server/source';

export const load = () => ({
	polish: polishArms(),
	history: performanceHistory(),
	code: excerpts({
		replaceParts: 'kernel/output/document/LayoutInstructions::replace_parts',
		trimLeft: 'kernel/output/document/LayoutInstructions::trim_left',
		take: 'kernel/performance/buffer_pool/take',
		runEach: 'kernel/computation/pipeline/run_each',
		punct: 'typescript/syntax/lexer/Lexer::punct',
		punctTest: 'typescript/syntax/lexer/tests/punctuators_are_the_longest_match_of_the_operator_table',
		parserClose: 'typescript/syntax/parser/Parser::close',
		recorded: 'typescript/syntax/syntax_tree/SyntaxTree::recorded_since',
		num: 'kernel/output/structured_data/StructuredDataWriter::write_number',
		fixed: 'kernel/output/structured_data/StructuredDataWriter::fixed'
	})
});
