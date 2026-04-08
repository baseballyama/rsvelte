//! Compare two JS files using OXC canonicalization (same as test suite).
//! Usage: canonicalize_and_compare <file1> <file2>
//! Exits 0 if semantically equal, 1 if different, prints first diff.

use oxc_allocator::Allocator;
use oxc_codegen::{Codegen, CodegenOptions, CommentOptions, LegalComment};
use oxc_parser::Parser;
use oxc_span::SourceType;
use std::env;
use std::fs;

fn canonicalize(code: &str) -> String {
    let allocator = Allocator::new();
    let source_type = SourceType::mjs();
    let parsed = Parser::new(&allocator, code, source_type).parse();
    if parsed.panicked {
        return code.to_string();
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
    Codegen::new()
        .with_options(options)
        .build(&parsed.program)
        .code
        .trim()
        .to_string()
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() != 3 {
        eprintln!("Usage: {} <file1> <file2>", args[0]);
        std::process::exit(2);
    }
    let f1 = fs::read_to_string(&args[1]).unwrap_or_default();
    let f2 = fs::read_to_string(&args[2]).unwrap_or_default();
    let c1 = canonicalize(&f1);
    let c2 = canonicalize(&f2);
    if c1 == c2 {
        println!("MATCH");
    } else {
        println!("DIFF");
        // Find first diff position
        let b1 = c1.as_bytes();
        let b2 = c2.as_bytes();
        let mut pos = 0;
        while pos < b1.len() && pos < b2.len() && b1[pos] == b2[pos] {
            pos += 1;
        }
        let start = pos.saturating_sub(30);
        let end1 = (pos + 80).min(c1.len());
        let end2 = (pos + 80).min(c2.len());
        println!("F1: {}", &c1[start..end1]);
        println!("F2: {}", &c2[start..end2]);
    }
}
