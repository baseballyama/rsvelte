use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::positions::Span;

/// The projection of the component at `path`, as the check prints it.
pub fn write_transform(path: &str, source: &str, output: &mut StructuredDataWriter) {
    let result = rsvelte_svelte_syntax::parse::parse(source)
        .map_err(|error| (1, error.message, error.span))
        .and_then(|component| {
            crate::lower_alone(&component, source)
                .map(|tree| (tree.extension(), crate::emit_named(&tree, source, path)))
                .map_err(|error| match error {
                    crate::Refusal::Unsupported(unsupported) => (
                        2,
                        format!("unsupported projection: {}", unsupported.what),
                        unsupported.span(),
                    ),
                    crate::Refusal::Thrown { message, span } => (2, message.to_owned(), span),
                })
        });
    output.begin_object().key("extension");
    match result {
        Ok((extension, projection)) => {
            output.write_string(extension);
            output.key("text").write_string(&projection.out);
            write_mappings(&projection.mappings, &projection.atoms, output);
        }
        Err((code, message, span)) => {
            output
                .write_string(".ts")
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
