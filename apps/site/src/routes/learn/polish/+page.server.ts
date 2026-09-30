import { polishArms } from '$lib/server/bench';
import { perfHistory } from '$lib/server/perf';
import { excerpts } from '$lib/server/source';

export const load = () => ({
	arms: polishArms(),
	history: perfHistory(),
	code: excerpts({
		replaceParts: 'kernel/doc/Docs::replace_parts',
		trimLeft: 'kernel/doc/Docs::trim_left',
		take: 'kernel/pool/take',
		runEach: 'kernel/pipeline/run_each',
		punct: 'js/lexer/Lexer::punct',
		punctTest: 'js/lexer/tests::punctuators_are_the_longest_match_of_the_operator_table',
		parserClose: 'js/parser/Parser::close',
		recorded: 'js/ast/Ast::recorded_since',
		num: 'kernel/json/JsonWriter::num',
		fixed: 'kernel/json/JsonWriter::fixed'
	})
});
