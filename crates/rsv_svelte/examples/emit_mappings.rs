//! Compiles one component and prints the generated JavaScript with the emitter's raw mappings,
//! which the compile task does not write out. The site's source-map figures are generated from
//! this, so they show what the pipeline produced rather than a hand-made example.
//!
//! `cargo run -p rsv_svelte --example emit_mappings -- <file.svelte> <client|server>`

#![expect(
    clippy::print_stdout,
    clippy::print_stderr,
    reason = "an example that prints its output"
)]

use std::process::ExitCode;

use rsv_kernel::json::JsonWriter;
use rsv_svelte::{analyze, hir, lower, parse, resolve, svelte_input};

fn main() -> ExitCode {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let [path, target] = args.as_slice() else {
        eprintln!("usage: emit_mappings <file.svelte> <client|server>");
        return ExitCode::FAILURE;
    };
    let src = match std::fs::read_to_string(path) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("{path}: {e}");
            return ExitCode::FAILURE;
        }
    };
    let c = match parse::parse(&src) {
        Ok(c) => c,
        Err(d) => {
            eprintln!("{path}: {}", d.message);
            return ExitCode::FAILURE;
        }
    };
    let res = resolve::resolve(&c.js, c.program, &c.template_exprs);
    let hir = hir::lower(&c, &src);
    let input = svelte_input(&c, &hir, &src);
    let an = analyze::analyze(&input, &res, path);
    let lowered = match target.as_str() {
        "client" => lower::client::lower(&input, &res, &an),
        "server" => lower::server::lower(&input, &res, &an),
        t => {
            eprintln!("unknown target {t}");
            return ExitCode::FAILURE;
        }
    };
    let (ast, root) = match lowered {
        Ok(x) => x,
        Err(d) => {
            eprintln!("{path}: {}", d.message);
            return ExitCode::FAILURE;
        }
    };
    let e = rsv_js::codegen::print_program(&ast, &src, root);
    let mut w = JsonWriter::new(true);
    w.begin_object()
        .key("src")
        .str(&src)
        .key("out")
        .str(&e.out)
        .key("mappings")
        .begin_array();
    for m in &e.mappings {
        w.begin_array()
            .num(m.generated)
            .num(m.src)
            .num(m.len)
            .end_array();
    }
    w.end_array()
        .key("source_map")
        .str(&e.source_map(&src, "App.svelte"))
        .end_object();
    print!("{}", w.finish());
    ExitCode::SUCCESS
}
