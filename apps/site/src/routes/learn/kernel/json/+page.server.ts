import { excerpts } from '$lib/server/source';

export const load = () => ({
	code: excerpts({
		writer: 'kernel/json/JsonWriter',
		beforeValue: 'kernel/json/JsonWriter::before_value',
		close: 'kernel/json/JsonWriter::close',
		key: 'kernel/json/JsonWriter::key',
		num: 'kernel/json/JsonWriter::num',
		writeStr: 'kernel/json/write_str',
		test: 'kernel/json/tests::nested_values_and_keys'
	})
});
