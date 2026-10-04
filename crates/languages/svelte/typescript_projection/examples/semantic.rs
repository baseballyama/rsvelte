use std::io::{BufWriter, Write as _};
use std::path::Path;

use rsvelte_kernel::output::structured_data::StructuredDataWriter;

#[path = "support/inputs.rs"]
mod input;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let root = std::env::args().nth(1).ok_or("expected <fixture root>")?;
    let files = input::inputs(Path::new(&root))?;
    if files.is_empty() {
        return Err("the input population is empty".into());
    }
    let mut output = BufWriter::new(std::io::stdout().lock());
    for file in files {
        let source = std::fs::read_to_string(&file)?;
        let mut record = StructuredDataWriter::new(false);
        record
            .begin_object()
            .key("input")
            .write_string(&file.to_string_lossy());
        match rsvelte_svelte_parser::parse::parse(&source) {
            Err(error) => {
                record
                    .key("status")
                    .write_string("parse-error")
                    .key("detail")
                    .write_string(&error.message);
            }
            Ok(component) => match rsvelte_svelte_typescript_projection::lower(&component, &source)
            {
                Err(error) => {
                    record
                        .key("status")
                        .write_string("unsupported")
                        .key("detail")
                        .write_string(error.what);
                }
                Ok(tree) => {
                    let projection = rsvelte_svelte_typescript_projection::emit(&tree, &source);
                    rsvelte_svelte_typescript_projection::content_mapper::write_mappings(
                        &projection.mappings,
                        &mut record,
                    );
                    record
                        .key("status")
                        .write_string("projected")
                        .key("code")
                        .write_string(&projection.out);
                }
            },
        }
        record.end_object();
        writeln!(output, "{}", record.finish())?;
    }
    Ok(())
}
