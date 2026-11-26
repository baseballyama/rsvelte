//! TypeScript compilation: erase the types of an oxc tree and print it as JavaScript.

use oxc_allocator::{Allocator, CloneIn};
use oxc_ast::ast::Program;
use oxc_ast_visit::VisitMut;

use crate::original_text::OriginalText;
use crate::strip::Strip;

mod task;
pub use task::register;

pub mod build;
pub mod features;
pub mod original_text;
pub mod print;
pub mod strip;

/// TypeScript's emit of a `.ts` file [`features::first_runtime_feature`] found nothing to refuse
/// in.
#[must_use]
pub fn emit(program: &Program<'_>) -> String {
    let allocator = Allocator::default();
    let mut program = program.clone_in(&allocator);
    Strip::new(&allocator).visit_program(&mut program);
    OriginalText::new(&allocator).visit_program(&mut program);
    print::print(&program)
}

/// Takes no options.
pub static EXTENSION: rsvelte_plugin_interface::Extension = rsvelte_plugin_interface::Extension {
    identifier: "typescript.compile",
    install: |registry, _| {
        register(registry);
        Ok(())
    },
};
