use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::positions::Span;

pub fn write_transform(source: &str, output: &mut StructuredDataWriter) {
    let result = rsvelte_svelte_parser::parse::parse(source)
        .map_err(|error| (1, error.message, error.span))
        .and_then(|component| {
            crate::lower(&component, source)
                .map(|tree| crate::emit(&tree, source))
                .map_err(|error| {
                    (
                        2,
                        format!("unsupported projection: {}", error.what),
                        error.span(),
                    )
                })
        });
    output.begin_object().key("extension").write_string(".ts");
    match result {
        Ok(projection) => {
            output.key("text").write_string(&projection.out);
            write_mappings(&projection.mappings, output);
        }
        Err((code, message, span)) => {
            output
                .key("text")
                .write_string("")
                .key("diagnostics")
                .begin_array();
            write_diagnostic(code, &message, span, output);
            output.end_array();
        }
    }
    output.end_object();
}

pub use rsvelte_typescript_content_mapper::write_mappings;

fn write_diagnostic(code: u32, message: &str, span: Span, output: &mut StructuredDataWriter) {
    output
        .begin_object()
        .key("code")
        .write_number(code)
        .key("messageText")
        .write_string(message)
        .key("start")
        .write_number(span.start_offset)
        .key("length")
        .write_number(span.len())
        .end_object();
}
