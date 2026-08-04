//! Dump `rsvelte_esrap` and `oxc_codegen` output for the same AST, side by side.
//!
//! The throughput ratio from `ab_print` is only actionable if the two printers
//! can be made to agree on layout, so this reports the size delta and the first
//! differing lines rather than a pass/fail.
//!
//! `.svelte` inputs are compiled first, because the layout question that matters
//! is about compiler output, not about arbitrary hand-written JS.
//!
//! Usage: `ab_dump [--write <dir>] [--server] <file.js|file.svelte> ...`

use oxc_allocator::Allocator;
use oxc_codegen::Codegen;
use oxc_parser::{ParseOptions, Parser};
use oxc_span::SourceType;
use rsvelte_core::{CompileOptions, GenerateMode};

fn main() {
    let mut write_dir: Option<String> = None;
    let mut server = false;
    let mut files: Vec<String> = Vec::new();

    let mut args = std::env::args().skip(1);
    while let Some(arg) = args.next() {
        match arg.as_str() {
            "--write" => write_dir = args.next(),
            "--server" => server = true,
            other => files.push(other.to_string()),
        }
    }

    if files.is_empty() {
        eprintln!("usage: ab_dump [--write <dir>] <file.js> ...");
        std::process::exit(2);
    }

    let opts = rsvelte_esrap::PrintOptions::default();
    for path in &files {
        let text = match std::fs::read_to_string(path) {
            Ok(text) => text,
            Err(err) => {
                eprintln!("cannot read {path}: {err}");
                continue;
            }
        };
        let text = if path.ends_with(".svelte") {
            let options = CompileOptions {
                generate: if server {
                    GenerateMode::Server
                } else {
                    GenerateMode::Client
                },
                ..CompileOptions::default()
            };
            match rsvelte_core::compile(&text, options) {
                Ok(result) => result.js.code,
                Err(err) => {
                    eprintln!("{path}: compile failed: {err:?}");
                    continue;
                }
            }
        } else {
            text
        };

        let allocator = Allocator::default();
        let ret = Parser::new(&allocator, &text, SourceType::mjs())
            .with_options(ParseOptions {
                preserve_parens: true,
                ..ParseOptions::default()
            })
            .parse();
        if ret.panicked {
            eprintln!("{path}: failed to parse");
            continue;
        }

        let esrap = rsvelte_esrap::print_with(&ret.program, &text, &opts);
        let oxc = Codegen::new().build(&ret.program).code;

        let delta = (oxc.len() as f64 - esrap.len() as f64) / esrap.len() as f64 * 100.0;
        let marker = if esrap == oxc { "  IDENTICAL" } else { "" };
        println!(
            "{path}: esrap {} B, oxc {} B ({delta:+.2}%){marker}",
            esrap.len(),
            oxc.len()
        );
        if esrap != oxc {
            report_first_diff(&esrap, &oxc);
        }

        if let Some(dir) = &write_dir {
            let stem = std::path::Path::new(path)
                .file_stem()
                .map_or("out", |s| s.to_str().unwrap_or("out"));
            let _ = std::fs::create_dir_all(dir);
            let _ = std::fs::write(format!("{dir}/{stem}.esrap.js"), &esrap);
            let _ = std::fs::write(format!("{dir}/{stem}.oxc.js"), &oxc);
        }
    }
}

/// A layout difference repeats on every following line, so a few examples say
/// as much as the whole diff.
fn report_first_diff(esrap: &str, oxc: &str) {
    let mut shown = 0;
    for (index, (left, right)) in esrap.lines().zip(oxc.lines()).enumerate() {
        if left == right {
            continue;
        }
        println!("  line {}:", index + 1);
        println!("    esrap: {left}");
        println!("    oxc  : {right}");
        shown += 1;
        if shown == 3 {
            break;
        }
    }
    if shown == 0 {
        println!("  (common prefix identical; lengths differ)");
    }
}
