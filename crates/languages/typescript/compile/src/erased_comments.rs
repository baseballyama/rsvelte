//! The comments TypeScript's emit removes with what it erases.

use oxc_ast::Comment;
use oxc_ast::ast::{ClassElement, CommentPosition, FunctionBody, Program, Statement};
use oxc_ast_visit::{Visit, walk};
use oxc_span::{GetSpan, Span};

use crate::strip::{is_erased_statement, is_type_only_element};

/// The comments TypeScript's emit removes with the declarations it erases.
///
/// That is each comment inside one, before it back to the previous token, or after it on its
/// line. A file or a function body keeps a header: its first comments, which a blank line
/// separates from what follows.
#[derive(Debug, Default)]
pub struct ErasedComments {
    /// The erased declarations that no other erased declaration holds, in source order.
    declarations: Vec<Span>,
    /// The starts of the erased first statements of the file and of the function bodies.
    bodies: Vec<u32>,
}

impl ErasedComments {
    #[must_use]
    pub fn new(program: &Program<'_>) -> Self {
        let mut erased = Self::default();
        if program.directives.is_empty() {
            erased.body(&program.body);
        }
        erased.visit_program(program);
        erased.bodies.sort_unstable();
        erased
    }

    /// The comments of `program` that its emit keeps.
    pub fn kept<'c>(
        &self,
        program: &'c Program<'_>,
    ) -> impl Iterator<Item = &'c Comment> + use<'c, '_> {
        let text = program.source_text;
        let headers: Vec<Span> = (self.bodies.iter())
            .flat_map(|&start| header(&program.comments, text, start))
            .collect();
        (program.comments.iter()).filter(move |c| headers.contains(&c.span) || !self.erases(c))
    }

    fn erases(&self, comment: &Comment) -> bool {
        let inside = self
            .declarations
            .partition_point(|d| d.start <= comment.span.start);
        (inside > 0 && comment.span.end <= self.declarations[inside - 1].end)
            || match comment.position {
                CommentPosition::Leading => self.starts(comment.attached_to),
                CommentPosition::Trailing => (self.declarations)
                    .binary_search_by_key(&comment.attached_to, |d| d.end)
                    .is_ok(),
            }
    }

    /// Notes a body whose header TypeScript would keep: one that starts with an erased statement.
    fn body(&mut self, statements: &[Statement<'_>]) {
        if let Some(first) = statements.first().filter(|s| is_erased_statement(s)) {
            self.bodies.push(first.span().start);
        }
    }

    fn starts(&self, at: u32) -> bool {
        (self.declarations)
            .binary_search_by_key(&at, |d| d.start)
            .is_ok()
    }
}

/// TypeScript's detached comments: the leading comments of the statement at `start` up to the
/// first blank line, if a blank line follows them.
fn header(comments: &[Comment], text: &str, start: u32) -> Vec<Span> {
    let blank = |from: u32, to: u32| text[from as usize..to as usize].matches('\n').count() >= 2;
    let leading = comments
        .iter()
        .filter(|c| c.position == CommentPosition::Leading && c.attached_to == start);
    let mut group: Vec<Span> = Vec::new();
    for comment in leading {
        if group
            .last()
            .is_some_and(|last| blank(last.end, comment.span.start))
        {
            break;
        }
        group.push(comment.span);
    }
    match group.last() {
        Some(last) if blank(last.end, start) => group,
        _ => Vec::new(),
    }
}

impl<'a> Visit<'a> for ErasedComments {
    fn visit_statement(&mut self, it: &Statement<'a>) {
        if is_erased_statement(it) {
            self.declarations.push(it.span());
        } else {
            walk::walk_statement(self, it);
        }
    }

    fn visit_class_element(&mut self, it: &ClassElement<'a>) {
        if is_type_only_element(it) {
            self.declarations.push(it.span());
        } else {
            walk::walk_class_element(self, it);
        }
    }

    fn visit_function_body(&mut self, it: &FunctionBody<'a>) {
        if it.directives.is_empty() {
            self.body(&it.statements);
        }
        walk::walk_function_body(self, it);
    }
}
