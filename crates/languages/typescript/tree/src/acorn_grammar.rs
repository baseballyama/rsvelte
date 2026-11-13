//! The syntax oxc parses and acorn, the parser of a host that reports as acorn does, does not:
//! acorn throws "Unexpected token" at the token it stops at.

use oxc_ast::AstKind;
use oxc_ast::ast::{VariableDeclarationKind, WithClauseKeyword};
use oxc_ast_visit::Visit;
use oxc_parser::Token;
use oxc_span::GetSpan;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;

use crate::syntax_error::{Acorn, SyntaxError};

/// Where acorn stops in a node of a kind it does not parse; `None` for one it parses. A
/// TypeScript part is read by acorn-typescript, which knows `assert`; `tokens` are the part's.
fn stop(kind: AstKind<'_>, typescript: bool, tokens: &[Token]) -> Option<u32> {
    match kind {
        // `using x` and `await using x`: acorn reads `using` as a name and stops at the binding.
        AstKind::VariableDeclaration(declaration)
            if matches!(
                declaration.kind,
                VariableDeclarationKind::Using | VariableDeclarationKind::AwaitUsing
            ) =>
        {
            declaration
                .declarations
                .first()
                .map(|declarator| declarator.id.span().start)
        }
        // `import defer * as x` and `import source x`: acorn reads the phase as the default
        // import and stops at what follows it.
        AstKind::ImportDeclaration(import) if import.phase.is_some() => import
            .specifiers
            .as_ref()
            .and_then(|specifiers| specifiers.first())
            .map(|specifier| specifier.span().start),
        // `assert { … }`: acorn knows only `with` for import attributes, and stops at the keyword,
        // the token before the clause's braces.
        AstKind::WithClause(clause)
            if clause.keyword == WithClauseKeyword::Assert && !typescript =>
        {
            let braces = tokens.partition_point(|token| token.start() < clause.span.start);
            braces.checked_sub(1).map(|keyword| tokens[keyword].start())
        }
        _ => None,
    }
}

/// The earliest place acorn stops in the part it walks.
pub(crate) struct Unsupported<'t> {
    typescript: bool,
    tokens: &'t [Token],
    pub(crate) first: Option<u32>,
}

impl<'t> Unsupported<'t> {
    pub(crate) const fn new(typescript: bool, tokens: &'t [Token]) -> Self {
        Self {
            typescript,
            tokens,
            first: None,
        }
    }
}

impl<'a> Visit<'a> for Unsupported<'_> {
    fn enter_node(&mut self, kind: AstKind<'a>) {
        if let Some(at) = stop(kind, self.typescript, self.tokens) {
            self.first = Some(self.first.map_or(at, |first| first.min(at)));
        }
    }
}

/// What acorn throws where it stops at `at`.
pub(crate) fn rejection(at: u32) -> SyntaxError {
    SyntaxError {
        diagnostic: Diagnostic::error("parse_error", "Unexpected token", Span::new(at, at)),
        acorn: Some(Acorn::Fails {
            message: std::borrow::Cow::Borrowed("Unexpected token"),
            at,
        }),
    }
}
