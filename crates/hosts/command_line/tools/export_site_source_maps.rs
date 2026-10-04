//! Compiles one component and prints the generated JavaScript with the emitter's raw mappings,
//! which the compile task does not write out. The site's source-map figures are generated from
//! this, so they show what the pipeline produced rather than a hand-made example.
//!
//! `cargo run -p rsvelte_command_line --example export_site_source_maps -- <file.svelte> <client|server>`

#![expect(
    clippy::print_stdout,
    clippy::print_stderr,
    reason = "an example that prints its output"
)]

use std::process::ExitCode;

use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_svelte::compilation::compiler_syntax_tree;
use rsvelte_svelte::semantic::{analyze, resolve};
use rsvelte_svelte::svelte_input;
use rsvelte_svelte::syntax::parse;
use rsvelte_svelte_compile::lower;

fn main() -> ExitCode {
    let arguments: Vec<String> = std::env::args().skip(1).collect();
    let [path, target] = arguments.as_slice() else {
        eprintln!("usage: export_site_source_maps <file.svelte> <client|server>");
        return ExitCode::FAILURE;
    };
    let source_text = match std::fs::read_to_string(path) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("{path}: {e}");
            return ExitCode::FAILURE;
        }
    };
    let c = match parse::parse(&source_text) {
        Ok(c) => c,
        Err(d) => {
            eprintln!("{path}: {}", d.message);
            return ExitCode::FAILURE;
        }
    };
    let compiler_syntax_tree = compiler_syntax_tree::lower(&c, &source_text);
    let res = resolve::resolve(&c.javascript, c.program, &compiler_syntax_tree);
    let input = svelte_input(&c, &compiler_syntax_tree, &source_text, path);
    let an = analyze::analyze(&input, &res);
    let input = rsvelte_svelte_compile::CompileInput::from(input);
    let lowered = match target.as_str() {
        "client" => lower::lower(&input, &res, &an, rsvelte_svelte_compile::Target::Client),
        "server" => lower::lower(&input, &res, &an, rsvelte_svelte_compile::Target::Server),
        t => {
            eprintln!("unknown target {t}");
            return ExitCode::FAILURE;
        }
    };
    let module = match lowered {
        Ok(x) => x,
        Err(d) => {
            eprintln!("{path}: {}", d.message);
            return ExitCode::FAILURE;
        }
    };
    let e = module.emit();
    let mut w = StructuredDataWriter::new(true);
    w.begin_object()
        .key("source")
        .write_string(&source_text)
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
        .write_string(&e.source_map(&source_text, "App.svelte"))
        .end_object();
    print!("{}", w.finish());
    ExitCode::SUCCESS
}
