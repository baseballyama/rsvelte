//! Canonicalize JavaScript on stdin via OXC parse → codegen and emit on stdout.
//!
//! Used by the verify-svelte-compat skill's compare-app.mjs to do semantic
//! comparison of compiler outputs that differ only in formatting/comments.
//!
//! Usage: cat input.js | canonicalize_js > canonical.js

use oxc_allocator::Allocator;
use oxc_codegen::{Codegen, CodegenOptions, CommentOptions, LegalComment};
use oxc_parser::Parser;
use oxc_span::SourceType;
use std::io::{Read, Write};

fn main() {
    let mut input = String::new();
    std::io::stdin().read_to_string(&mut input).ok();

    let allocator = Allocator::new();
    let source_type = SourceType::mjs();
    let parsed = Parser::new(&allocator, &input, source_type).parse();

    if parsed.panicked || !parsed.errors.is_empty() {
        // Parse failure: fall back to whitespace-collapsed text so two
        // formatting-only different inputs still compare close.
        let normalized = normalize_whitespace(&input);
        std::io::stdout().write_all(normalized.as_bytes()).ok();
        return;
    }

    let options = CodegenOptions {
        single_quote: true,
        comments: CommentOptions {
            normal: false,
            jsdoc: false,
            annotation: false,
            legal: LegalComment::None,
        },
        ..Default::default()
    };
    let out = Codegen::new()
        .with_options(options)
        .build(&parsed.program)
        .code
        .trim()
        .to_string();
    std::io::stdout().write_all(out.as_bytes()).ok();
}

fn normalize_whitespace(code: &str) -> String {
    let mut out = String::with_capacity(code.len());
    let mut prev_ws = true;
    for c in code.chars() {
        if c.is_whitespace() {
            if !prev_ws {
                out.push(' ');
                prev_ws = true;
            }
        } else {
            out.push(c);
            prev_ws = false;
        }
    }
    out.trim().to_string()
}
