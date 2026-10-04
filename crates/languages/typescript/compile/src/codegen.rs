//! Code generation: prints an [`SyntaxTree`] as JavaScript into an [`Emitter`].
//!
//! A source mapping is recorded at every node that carries a real span. Layout is fixed and simple
//! (tabs, one statement per line): generated code is compared as an AST, and the format task owns
//! canonical layout. TypeScript-only nodes are dropped.

use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_typescript::operators::{BinaryOperator, LogicalOperator, UnaryOperator};
use rsvelte_typescript::syntax_tree::{Kind, NodeIdentifier, SyntaxTree, Tag, flag};

#[must_use]
pub fn print_program(
    syntax_tree: &SyntaxTree,
    source_text: &str,
    program: NodeIdentifier,
) -> Emitter {
    let mut g = Gen {
        syntax_tree,
        source_text,
        e: Emitter::new(),
        indent: 0,
    };
    if let Kind::Program(body) = syntax_tree.kind(program) {
        let mut first = true;
        for &s in body {
            if !g.emits(s) {
                continue;
            }
            if !first {
                g.e.push("\n");
            }
            first = false;
            g.statement(s);
            g.e.push("\n");
        }
    }
    g.e
}

/// Prints one expression (for embedding in other output, e.g. tests).
#[must_use]
pub fn print_expression(syntax_tree: &SyntaxTree, source_text: &str, e: NodeIdentifier) -> String {
    let mut g = Gen {
        syntax_tree,
        source_text,
        e: Emitter::new(),
        indent: 0,
    };
    g.expression(e, 0);
    g.e.out
}

struct Gen<'a> {
    syntax_tree: &'a SyntaxTree,
    source_text: &'a str,
    e: Emitter,
    indent: u32,
}

mod prec {
    pub(super) const SEQ: u8 = 1;
    pub(super) const ASSIGN: u8 = 2;
    pub(super) const COND: u8 = 3;
    /// Binary/logical operators occupy BIN + op precedence (1..=12).
    pub(super) const BIN: u8 = 3;
    pub(super) const UNARY: u8 = 17;
    pub(super) const POSTFIX: u8 = 18;
    pub(super) const CALL: u8 = 19;
    pub(super) const PRIMARY: u8 = 20;
}

impl Gen<'_> {
    fn newline(&mut self) {
        self.e.push("\n");
        for _ in 0..self.indent {
            self.e.push("\t");
        }
    }

    fn mark(&mut self, identifier: NodeIdentifier) {
        if let Some(s) = self.syntax_tree.source_location(identifier).span() {
            self.e.mark(s.start_offset);
        }
    }

    /// Whether a statement produces output (TypeScript-only statements do not).
    fn emits(&self, s: NodeIdentifier) -> bool {
        match self.syntax_tree.kind(s) {
            Kind::TypeScriptDeclaration | Kind::TypeScriptInterface { .. } => false,
            Kind::Import {
                specifiers,
                type_only,
                ..
            } => {
                !type_only
                    && (specifiers.is_empty()
                        || specifiers
                            .iter()
                            .any(|&sp| self.syntax_tree.flags(sp) & flag::TYPE_ONLY == 0))
            }
            Kind::ExportNamed(d) => self.emits(d),
            _ => true,
        }
    }
}

pub use rsvelte_typescript::semantic::number::number;

/// Single-quoted JS string literal.
pub fn quote(out: &mut String, v: &str) {
    out.push('\'');
    for c in v.chars() {
        match c {
            '\'' => out.push_str("\\'"),
            '\\' => out.push_str("\\\\"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\u{2028}' => out.push_str("\\u2028"),
            '\u{2029}' => out.push_str("\\u2029"),
            c => out.push(c),
        }
    }
    out.push('\'');
}

#[cfg(test)]
mod tests;

mod control;
mod expressions;
mod statements;

mod classes;
