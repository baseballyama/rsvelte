use rsvelte_kernel::output::emitter::Mapping;
use rsvelte_kernel::output::structured_data::StructuredDataWriter;

const VERBATIM: u32 = 0;

pub fn write_mappings(mappings: &[Mapping], output: &mut StructuredDataWriter) {
    output.key("mappings").begin_array();
    // Point mappings have no range and cannot make generated helpers appear source-authored.
    for mapping in mappings.iter().filter(|mapping| mapping.len > 0) {
        output.begin_array();
        for value in [
            mapping.generated,
            mapping.len,
            mapping.source_text,
            mapping.len,
            VERBATIM,
        ] {
            output.write_number(value);
        }
        output.end_array();
    }
    output.end_array();
}
