import { excerpts } from '$lib/server/source';

export const load = () => ({
	code: excerpts({
		writer: 'kernel/json/JsonWriter',
		beforeValue: 'kernel/json/JsonWriter::before_value',
		close: 'kernel/json/JsonWriter::close',
		key: 'kernel/json/JsonWriter::key',
		integer: 'kernel/json/Integer',
		num: 'kernel/json/JsonWriter::num',
		fixed: 'kernel/json/JsonWriter::fixed',
		escapeTest: 'kernel/json/tests::strings_are_escaped_as_one_character_at_a_time',
		writeStr: 'kernel/json/write_str',
		test: 'kernel/json/tests::nested_values_and_keys'
	})
});
