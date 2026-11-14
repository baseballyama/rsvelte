//! The syntax oxc parses and acorn, the parser of a host that reports as acorn does, rejects:
//! acorn throws where it stops, and acorn-typescript where a TypeScript rule fails.

use oxc_ast::AstKind;
use oxc_ast::ast::{
    ClassElement, Declaration, Statement, VariableDeclarationKind, WithClauseKeyword,
};
use oxc_ast_visit::Visit;
use oxc_parser::Token;
use oxc_span::GetSpan;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;

use crate::syntax_error::{Acorn, SyntaxError};

/// Why acorn rejects a part.
#[derive(Clone, Copy, Debug)]
pub(crate) enum Rejection {
    /// acorn stops at a token of syntax it does not parse.
    Unexpected,
    /// `override` in a class that extends nothing.
    Override,
    /// `export declare global { … }`.
    ExportedGlobal,
}

impl Rejection {
    const fn message(self) -> &'static str {
        match self {
            Self::Unexpected => "Unexpected token",
            Self::Override => concat!(
                "This member cannot have an 'override' modifier because its containing class does ",
                "not extend another class."
            ),
            Self::ExportedGlobal => "'export declare' must be followed by an ambient declaration.",
        }
    }
}

/// Where acorn rejects a node of a kind it does not parse, and why; `None` for one it parses. A
/// TypeScript part is read by acorn-typescript, which knows `assert` and checks TypeScript's
/// rules; `tokens` are the part's.
fn stop(kind: AstKind<'_>, typescript: bool, tokens: &[Token]) -> Option<(u32, Rejection)> {
    let unexpected = |at: Option<u32>| at.map(|at| (at, Rejection::Unexpected));
    match kind {
        // `using x` and `await using x`: acorn reads `using` as a name and stops at the binding.
        AstKind::VariableDeclaration(declaration)
            if matches!(
                declaration.kind,
                VariableDeclarationKind::Using | VariableDeclarationKind::AwaitUsing
            ) =>
        {
            unexpected(
                declaration
                    .declarations
                    .first()
                    .map(|declarator| declarator.id.span().start),
            )
        }
        // `import defer * as x` and `import source x`: acorn reads the phase as the default
        // import and stops at what follows it.
        AstKind::ImportDeclaration(import) if import.phase.is_some() => unexpected(
            import
                .specifiers
                .as_ref()
                .and_then(|specifiers| specifiers.first())
                .map(|specifier| specifier.span().start),
        ),
        // `assert { … }`: acorn knows only `with` for import attributes, and stops at the keyword,
        // the token before the clause's braces.
        AstKind::WithClause(clause)
            if clause.keyword == WithClauseKeyword::Assert && !typescript =>
        {
            let braces = tokens.partition_point(|token| token.start() < clause.span.start);
            unexpected(braces.checked_sub(1).map(|keyword| tokens[keyword].start()))
        }
        // A function declared as the body of a statement: acorn reads module code, which is
        // strict, and stops at the declaration.
        AstKind::IfStatement(it) => unexpected(
            [Some(&it.consequent), it.alternate.as_ref()]
                .into_iter()
                .flatten()
                .find_map(declared_function),
        ),
        AstKind::LabeledStatement(it) => unexpected(declared_function(&it.body)),
        AstKind::WhileStatement(it) => unexpected(declared_function(&it.body)),
        AstKind::DoWhileStatement(it) => unexpected(declared_function(&it.body)),
        AstKind::ForStatement(it) => unexpected(declared_function(&it.body)),
        AstKind::ForInStatement(it) => unexpected(declared_function(&it.body)),
        AstKind::ForOfStatement(it) => unexpected(declared_function(&it.body)),
        AstKind::WithStatement(it) => unexpected(declared_function(&it.body)),
        AstKind::Class(class) if typescript && class.heritage.is_none() => class
            .body
            .body
            .iter()
            .find(|member| match member {
                ClassElement::MethodDefinition(method) => method.r#override,
                ClassElement::PropertyDefinition(property) => property.r#override,
                ClassElement::AccessorProperty(accessor) => accessor.r#override,
                ClassElement::StaticBlock(_) | ClassElement::TSIndexSignature(_) => false,
            })
            .map(|member| (member.span().start, Rejection::Override)),
        AstKind::ExportDeclaration(export) if typescript => match &export.declaration {
            Declaration::TSGlobalDeclaration(global) if global.declare => {
                Some((global.global_span.start, Rejection::ExportedGlobal))
            }
            _ => None,
        },
        _ => None,
    }
}

/// The start of `statement` when it declares a function.
fn declared_function(statement: &Statement<'_>) -> Option<u32> {
    match statement {
        Statement::FunctionDeclaration(function) => Some(function.span.start),
        _ => None,
    }
}

/// The earliest place acorn rejects in the part it walks.
pub(crate) struct Unsupported<'t> {
    typescript: bool,
    tokens: &'t [Token],
    pub(crate) first: Option<(u32, Rejection)>,
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
        if let Some(found) = stop(kind, self.typescript, self.tokens)
            && self.first.is_none_or(|(first, _)| found.0 < first)
        {
            self.first = Some(found);
        }
    }
}

/// What acorn throws where it rejects at `at`.
pub(crate) fn rejection((at, why): (u32, Rejection)) -> SyntaxError {
    let message = why.message();
    SyntaxError {
        diagnostic: Diagnostic::error("parse_error", message, Span::new(at, at)),
        acorn: Some(Acorn::Fails {
            message: std::borrow::Cow::Borrowed(message),
            at,
        }),
        typescript_code: None,
    }
}

#[cfg(test)]
mod tests;
