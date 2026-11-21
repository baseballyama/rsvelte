use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_content_mapper::write_mappings;

use crate::Unprojected;

/// The projection of the component at `path`, as the check prints it.
pub fn write_transform(path: &str, source: &str, output: &mut StructuredDataWriter) {
    let component = crate::read_alone(source);
    let result = match &component {
        Err(error) => Err((1, error.message.clone(), error.span, Unprojected::Thrown)),
        Ok(component) => crate::lower_alone(component, source, path)
            .map(|tree| (tree.extension(), crate::emit(&tree, source, path)))
            .map_err(|error| match error {
                crate::Refusal::Unsupported(unsupported) => (
                    2,
                    format!("unsupported projection: {}", unsupported.what),
                    unsupported.span(),
                    Unprojected::Unsupported(component),
                ),
                crate::Refusal::Thrown { message, span } => {
                    (2, message.to_owned(), span, Unprojected::Thrown)
                }
            }),
    };
    output.begin_object().key("extension");
    match result {
        Ok((extension, projection)) => {
            output.write_string(extension);
            output.key("text").write_string(&projection.out);
            write_mappings(&projection.mappings, &projection.atoms, output);
        }
        Err((code, message, span, why)) => {
            output
                .write_string(".ts")
                .key("text")
                .write_string(&crate::unprojected(source, why))
                .key("diagnostics")
                .begin_array();
            write_diagnostic(code, &message, span, output);
            output.end_array();
        }
    }
    output.end_object();
}

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
