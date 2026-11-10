//! Compiles one component as the compile task does ([`lower_document`]) and prints the generated
//! JavaScript with the emitter's raw mappings, which the task does not write out. The site's
//! source-map figures are generated from this, so they show what the pipeline produced rather than
//! a hand-made example. Offsets are UTF-8 bytes, as the figure explains them.
//!
//! `cargo run -p rsvelte_site --bin export_site_source_maps -- <file> <target>`, where
//! `<target>` is `client` or `server`.

#![expect(
    clippy::print_stdout,
    clippy::print_stderr,
    reason = "a tool that prints its output"
)]

use std::path::Path;
use std::process::ExitCode;

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::document::Document;
use rsvelte_svelte_compile::{Target, lower_document};

fn main() -> ExitCode {
    let arguments: Vec<String> = std::env::args().skip(1).collect();
    let [path, target] = arguments.as_slice() else {
        eprintln!("usage: export_site_source_maps <file.svelte> <client|server>");
        return ExitCode::FAILURE;
    };
    let target = match target.as_str() {
        "client" => Target::Client,
        "server" => Target::Server,
        t => {
            eprintln!("unknown target {t}");
            return ExitCode::FAILURE;
        }
    };
    let source_text = match std::fs::read_to_string(path) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("{path}: {e}");
            return ExitCode::FAILURE;
        }
    };
    // The file name alone, so output that depends on the filename does not depend on the directory.
    let Some(name) = Path::new(path).file_name().and_then(|n| n.to_str()) else {
        eprintln!("{path}: expected a UTF-8 file name");
        return ExitCode::FAILURE;
    };
    let document = match Document::new(name.to_owned(), source_text) {
        Ok(document) => document,
        Err(error) => {
            eprintln!("{path}: {error:?}");
            return ExitCode::FAILURE;
        }
    };
    let mut registry = Registry::new();
    rsvelte_svelte_compile::register(&mut registry);
    let context = DocumentContext::new(&document, registry.artifacts());
    let allocator = oxc_allocator::Allocator::default();
    let program = match lower_document(&context, target, &allocator) {
        Ok(program) => program,
        Err(d) => {
            eprintln!("{path}: {}", d.message);
            return ExitCode::FAILURE;
        }
    };
    let e = rsvelte_typescript_compile::print::print_mapped(&program);
    let mut w = StructuredDataWriter::new(true);
    w.begin_object()
        .key("source")
        .write_string(&document.text)
        .key("out")
        .write_string(&e.out)
        .key("mappings")
        .begin_array();
    for m in &e.mappings {
        w.begin_array()
            .write_number(m.generated)
            .write_number(m.source_text)
            .write_number(m.len)
            .end_array();
    }
    w.end_array()
        .key("source_map")
        .write_string(&e.source_map(context.line_index(), name))
        .end_object();
    print!("{}", w.finish());
    ExitCode::SUCCESS
}
