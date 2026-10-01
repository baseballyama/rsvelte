import { excerpts } from '$lib/server/source';

export const load = () => ({
	code: excerpts({
		writer: 'kernel/output/structured_data/StructuredDataWriter',
		beforeValue: 'kernel/output/structured_data/StructuredDataWriter::before_value',
		close: 'kernel/output/structured_data/StructuredDataWriter::close',
		key: 'kernel/output/structured_data/StructuredDataWriter::key',
		integer: 'kernel/output/structured_data/Integer',
		num: 'kernel/output/structured_data/StructuredDataWriter::write_number',
		fixed: 'kernel/output/structured_data/StructuredDataWriter::fixed',
		escapeTest: 'kernel/output/structured_data/tests::strings_are_escaped_as_one_character_at_a_time',
		writeString: 'kernel/output/structured_data/write_string',
		test: 'kernel/output/structured_data/tests::nested_values_and_keys'
	})
});
