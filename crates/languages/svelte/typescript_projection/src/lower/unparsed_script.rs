//! The imports, exports and refusals svelte2tsx finds in a script that Svelte does not parse.

use oxc_ast::ast::{Program, Statement};
use oxc_ast_visit::{Visit, walk};
use rsvelte_typescript_tree::document_span;

use super::generic::instance_only;
use super::{Refusal, Span};

/// What svelte2tsx does to a script that Svelte does not parse, which it still reads as
/// TypeScript.
#[derive(Debug, Default)]
pub struct UnparsedScript {
    /// The error it throws for a module script that declares `$$Generic`, `$$Events`, `$$Slots` or
    /// `$$Props`.
    pub refusal: Option<Refusal>,
    /// The instance script's imports, which move before the render function.
    pub imports: Vec<Span>,
    /// The export lists and `export` keywords it removes from the instance script.
    pub removed: Vec<Span>,
}

/// [`UnparsedScript`] for the script at `content` in `source_text`.
#[must_use]
pub fn unparsed_script(source_text: &str, content: Span, module: bool) -> UnparsedScript {
    let text = &source_text[content.start_offset as usize..content.end_offset as usize];
    rsvelte_typescript_tree::with_scratch_arena(|allocator| {
        let program = oxc_parser::Parser::new(allocator, text, oxc_span::SourceType::ts())
            .parse()
            .program;
        read_unparsed(&program, content.start_offset, module)
    })
}

/// [`unparsed_script`] of the parsed `program`, whose spans are `offset` bytes into the component.
fn read_unparsed(program: &Program<'_>, offset: u32, module: bool) -> UnparsedScript {
    let shift = |at: Span| Span::new(at.start_offset + offset, at.end_offset + offset);
    if module {
        return UnparsedScript {
            refusal: instance_only(program, offset),
            ..UnparsedScript::default()
        };
    }
    let mut moved = Moved::default();
    moved.visit_program(program);
    UnparsedScript {
        imports: moved.imports.into_iter().map(shift).collect(),
        removed: moved.removed.into_iter().map(shift).collect(),
        ..UnparsedScript::default()
    }
}

/// The imports svelte2tsx moves and the exports it removes in a script Svelte does not parse,
/// where they may stand at any depth.
#[derive(Default)]
struct Moved {
    imports: Vec<Span>,
    removed: Vec<Span>,
}

impl<'a> Visit<'a> for Moved {
    fn visit_statement(&mut self, it: &Statement<'a>) {
        if let Statement::ImportDeclaration(import) = it {
            self.imports.push(document_span(import.span));
        }
        self.removed.extend(super::namespace::removed_export(it));
        walk::walk_statement(self, it);
    }
}
