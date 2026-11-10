//! Printing a JavaScript tree with `oxc_codegen`.
//!
//! The corpus compares output as syntax trees, so the printer's layout is free.

use oxc_ast::ast::Program;
use oxc_codegen::{Codegen, CodegenOptions};
use rsvelte_kernel::output::emitter::{Emitter, Mapping};
use rsvelte_kernel::source::positions::LineIndex;

#[must_use]
pub fn print(program: &Program<'_>) -> String {
    Codegen::new().build(program).code
}

/// [`print`], with a point mapping wherever the printer maps a node back into
/// `program.source_text`.
#[must_use]
pub fn print_mapped(program: &Program<'_>) -> Emitter {
    let printed = Codegen::new()
        .with_options(CodegenOptions {
            source_map_path: Some("source".into()),
            ..CodegenOptions::default()
        })
        .build(program);
    let mut emitter = Emitter::new();
    if let Some(map) = printed.map {
        let generated = LineIndex::new(&printed.code);
        let source = LineIndex::new(program.source_text);
        emitter.mappings = map
            .get_tokens()
            .filter_map(|token| {
                Some(Mapping {
                    generated: generated.offset(token.get_dst_line() + 1, token.get_dst_col())?,
                    source_text: source.offset(token.get_src_line() + 1, token.get_src_col())?,
                    len: 0,
                })
            })
            .collect();
    }
    emitter.out = printed.code;
    emitter
}
