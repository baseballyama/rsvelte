//! TypeScript compilation: erase the types of an oxc tree and print it as JavaScript.

use oxc_allocator::Allocator;
use oxc_ast::ast::Program;
use oxc_ast_visit::VisitMut;
use oxc_parser::{ParseOptions, Parser};

use crate::original_text::OriginalText;
use crate::strip::Strip;

mod task;
pub use task::register;

pub mod build;
pub mod features;
pub mod original_text;
pub mod parentheses;
pub mod print;
pub mod prologue;
pub mod strip;

/// TypeScript's emit of a `.ts` file [`features::first_erasure_feature`] found nothing to refuse
/// in.
#[must_use]
pub fn emit(program: &Program<'_>) -> String {
    let allocator = Allocator::default();
    // The tree keeps no parentheses, and the emit keeps those of the source.
    let options = ParseOptions {
        preserve_parens: true,
        parse_regular_expression: true,
        ..ParseOptions::default()
    };
    let parsed = Parser::new(&allocator, program.source_text, program.source_type)
        .with_options(options)
        .parse();
    debug_assert!(parsed.diagnostics.is_empty(), "the tree read the same text");
    let mut program = parsed.program;
    // Before the types go: an `import type` still makes the file a module.
    prologue::ensure_use_strict(&allocator, &mut program);
    parentheses::AroundAssertions::new(&allocator).visit_program(&mut program);
    Strip::new(&allocator).visit_program(&mut program);
    parentheses::Factory::new(&allocator).visit_program(&mut program);
    OriginalText::new(&allocator).visit_program(&mut program);
    print::print_with_parentheses(&program)
}

/// Takes no options.
pub static EXTENSION: rsvelte_plugin_interface::Extension = rsvelte_plugin_interface::Extension {
    identifier: "typescript.compile",
    install: |registry, _| {
        register(registry);
        Ok(())
    },
};
