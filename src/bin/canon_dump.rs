//! Canonicalize a JS file using OXC and print to stdout.
//! Usage: canon_dump `<file>`

// Use jemalloc as the global allocator for better multi-threaded
// performance. Defined per-bin rather than once in the lib because the lib
// is built as both rlib and cdylib, and a lib-level `#[global_allocator]`
// is duplicated across both outputs at link time — cargo issue
// rust-lang/cargo#6313.
#[cfg(all(
    feature = "jemalloc",
    not(feature = "napi"),
    not(target_arch = "wasm32"),
    not(target_os = "windows")
))]
#[global_allocator]
static GLOBAL: tikv_jemallocator::Jemalloc = tikv_jemallocator::Jemalloc;

use oxc_allocator::Allocator;
use oxc_codegen::{Codegen, CodegenOptions, CommentOptions, LegalComment};
use oxc_parser::Parser;
use oxc_span::SourceType;
use std::env;
use std::fs;

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() != 2 {
        eprintln!("Usage: {} <file>", args[0]);
        std::process::exit(2);
    }
    let code = fs::read_to_string(&args[1]).unwrap_or_default();
    let allocator = Allocator::new();
    let source_type = SourceType::mjs();
    let parsed = Parser::new(&allocator, &code, source_type).parse();
    if parsed.panicked {
        print!("{}", code);
        return;
    }
    let options = CodegenOptions {
        single_quote: true,
        comments: CommentOptions {
            normal: false,
            jsdoc: false,
            annotation: true,
            legal: LegalComment::None,
        },
        ..Default::default()
    };
    let out = Codegen::new()
        .with_options(options)
        .build(&parsed.program)
        .code;
    let normalized = normalize_import_quotes(&out);
    print!("{}", normalized);
}

/// Normalize `import ... from "..."` to single quotes (post-processing for
/// OXC's incomplete `single_quote: true` support).
fn normalize_import_quotes(code: &str) -> String {
    let mut out = String::with_capacity(code.len());
    for (i, line) in code.lines().enumerate() {
        if i > 0 {
            out.push('\n');
        }
        let trimmed = line.trim_start();
        let is_module_line = trimmed.starts_with("import ")
            || trimmed.starts_with("import\"")
            || trimmed.starts_with("import'")
            || trimmed.starts_with("export ")
            || trimmed.starts_with("export\"")
            || trimmed.starts_with("export'");
        if !is_module_line {
            out.push_str(line);
            continue;
        }
        let bytes = line.as_bytes();
        let mut i = 0;
        let mut buf = String::with_capacity(line.len());
        while i < bytes.len() {
            if bytes[i] == b'"' {
                let mut j = i + 1;
                let mut has_escape = false;
                while j < bytes.len() {
                    if bytes[j] == b'\\' {
                        has_escape = true;
                        j += 2;
                        continue;
                    }
                    if bytes[j] == b'"' {
                        break;
                    }
                    j += 1;
                }
                if j < bytes.len() {
                    let inner = &line[i + 1..j];
                    if !has_escape && !inner.contains('\'') {
                        buf.push('\'');
                        buf.push_str(inner);
                        buf.push('\'');
                    } else {
                        buf.push_str(&line[i..=j]);
                    }
                    i = j + 1;
                    continue;
                }
            }
            buf.push(bytes[i] as char);
            i += 1;
        }
        out.push_str(&buf);
    }
    out
}
