use oxc_ast::AstKind;
use oxc_ast::ast::{
    Argument, ArrowFunctionExpression, CallExpression, Expression, FormalParameters, Function,
    FunctionBody, NewTarget, ReturnStatement, Statement, StaticMemberExpression, TSType,
    TSTypeAnnotation, TSTypeParameterDeclaration, ThisExpression,
};
use oxc_ast_visit::Visit;
use oxc_parser::Kind;
use oxc_syntax::scope::ScopeFlags;
use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::catalog::Category;
use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::TokenType;
use rsvelte_typescript_tree::{Recorded, document_span, node_span};

use super::shared::nodes::{is_named, only_statement, text};
use crate::rule::{File, Files, RuleDefinition, SvelteRule, without_options};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/prefer-derived-over-derived-by",
    files: Files::All,
    category: Category::Style,
    configure: without_options::<PreferDerivedOverDerivedBy>,
};

#[derive(Debug, Default)]
struct PreferDerivedOverDerivedBy;

impl SvelteRule for PreferDerivedOverDerivedBy {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        if file.runes() != Some(true) {
            return;
        }
        for node in file.nodes().iter() {
            let AstKind::CallExpression(call) = node.kind() else {
                continue;
            };
            let Some(derived) = DerivedBy::of(call) else {
                continue;
            };
            let mut report = Report::range(
                "Unnecessary use of `$derived.by()`. Use `$derived()` directly for simple \
                    expressions.",
                node_span(call),
            );
            if let Some(fix) = derived.fix(file) {
                report = report.fix(fix);
            }
            reporter.report(report);
        }
    }
}

/// A `$derived.by(callback)` call whose callback only returns `expression`.
struct DerivedBy<'a> {
    call: &'a CallExpression<'a>,
    callee: &'a StaticMemberExpression<'a>,
    callback: Callback<'a>,
    /// The statement that returns `expression`; `None` for an arrow's expression body.
    statement: Option<&'a ReturnStatement<'a>>,
    expression: &'a Expression<'a>,
}

#[derive(Clone, Copy)]
enum Callback<'a> {
    Arrow(&'a ArrowFunctionExpression<'a>),
    Function(&'a Function<'a>),
}

impl<'a> Callback<'a> {
    fn span(self) -> Span {
        match self {
            Self::Arrow(arrow) => node_span(arrow),
            Self::Function(function) => node_span(function),
        }
    }

    fn type_parameters(self) -> Option<&'a TSTypeParameterDeclaration<'a>> {
        match self {
            Self::Arrow(arrow) => arrow.type_parameters.as_deref(),
            Self::Function(function) => function.type_parameters.as_deref(),
        }
    }

    fn return_type(self) -> Option<&'a TSType<'a>> {
        let annotation: Option<&TSTypeAnnotation<'a>> = match self {
            Self::Arrow(arrow) => arrow.return_type.as_deref(),
            Self::Function(function) => function.return_type.as_deref(),
        };
        annotation.map(|annotation| &annotation.type_annotation)
    }
}

impl<'a> DerivedBy<'a> {
    fn of(call: &'a CallExpression<'a>) -> Option<Self> {
        let Expression::StaticMemberExpression(callee) = &call.callee else {
            return None;
        };
        if !is_named(&callee.object, "$derived") || callee.property.name != "by" {
            return None;
        }
        let [argument] = call.arguments.as_slice() else {
            return None;
        };
        let (callback, body) = match argument {
            Argument::ArrowFunctionExpression(arrow)
                if !arrow.r#async && no_parameters(&arrow.params) =>
            {
                if let Some(expression) = arrow.body.as_expression() {
                    return Some(Self {
                        call,
                        callee,
                        callback: Callback::Arrow(arrow),
                        statement: None,
                        expression,
                    });
                }
                (Callback::Arrow(arrow), arrow.body.as_function_body()?)
            }
            Argument::FunctionExpression(function)
                if !function.r#async && !function.generator && no_parameters(&function.params) =>
            {
                (Callback::Function(function), function.body.as_deref()?)
            }
            _ => return None,
        };
        let Statement::ReturnStatement(statement) = only_statement(body)? else {
            return None;
        };
        Some(Self {
            call,
            callee,
            callback,
            statement: Some(statement),
            expression: statement.argument.as_ref()?,
        })
    }

    /// The fix that removes the code around the expression and keeps everything else in place.
    fn fix(&self, file: &File<'_>) -> Option<Fix> {
        let source = file.source();
        let type_arguments = self.call.type_arguments.as_deref();
        let return_type = self.callback.return_type();
        // `$derived()` has no place for a type parameter of the function itself.
        if self.callback.type_parameters().is_some()
            // A type predicate is only allowed as a return type.
            || matches!(return_type, Some(TSType::TSTypePredicate(_)))
            // Only one of the two type annotations can be kept.
            || type_arguments.zip(return_type).is_some_and(|(arguments, returned)| {
                text(arguments, source) != format!("<{}>", text(returned, source))
            })
            || matches!(self.callback, Callback::Function(function)
                if uses_own_bindings(file, function))
        {
            return None;
        }
        let tokens = CodeTokens::of(file, node_span(self.call));
        let callback = self.callback.span();
        let expression = node_span(self.expression);
        let (before_expression, parent) = match self.statement {
            Some(statement) => (tokens.after(statement.span.start)?, node_span(statement)),
            None => (tokens.arrow_before(expression.start_offset)?, callback),
        };
        let kept_start = tokens.next(before_expression.end_offset)?.start_offset;
        let kept_end = match self.statement {
            Some(_) => tokens.parenthesized(expression, parent).end_offset,
            None => callback.end_offset,
        };
        let return_type = return_type.filter(|_| type_arguments.is_none());
        let removed = [
            Span::new(
                node_span(&self.callee.object).end_offset,
                node_span(self.callee).end_offset,
            ),
            Span::new(callback.start_offset, kept_start),
            Span::new(kept_end, callback.end_offset),
        ];
        let kept_type = return_type.map(node_span);
        let loses_comment = tokens.comments().any(|comment| {
            !kept_type.is_some_and(|kept| contains(kept, comment))
                && removed.iter().any(|&range| contains(range, comment))
        });
        if loses_comment {
            return None;
        }
        // A sequence expression would otherwise become multiple arguments.
        let needs_parentheses = matches!(self.expression, Expression::SequenceExpression(_))
            && tokens.parenthesized(expression, parent).start_offset == expression.start_offset;
        let (open, close) = if needs_parentheses {
            ("(", ")")
        } else {
            ("", "")
        };
        let type_text = return_type.map_or_else(String::new, |returned| {
            format!("<{}>", text(returned, source))
        });
        let mut fix = Fix::replace(removed[0], type_text);
        fix.push(removed[1], open);
        fix.push(removed[2], close);
        Some(fix)
    }
}

const fn contains(outer: Span, inner: Span) -> bool {
    outer.start_offset <= inner.start_offset && inner.end_offset <= outer.end_offset
}

fn no_parameters(parameters: &FormalParameters<'_>) -> bool {
    parameters.items.is_empty() && parameters.rest.is_none()
}

/// Whether the function uses a binding that `$derived()` would change: `this`, `arguments`,
/// `new.target`, or its own name.
fn uses_own_bindings(file: &File<'_>, function: &Function<'_>) -> bool {
    let scoping = file.semantic().scoping();
    let scope = function.scope_id();
    // eslint-scope declares `arguments` in every function that is not an arrow.
    let arguments = scoping
        .root_unresolved_references()
        .iter()
        .filter(|(name, _)| name.as_str() == "arguments")
        .flat_map(|(_, references)| references.iter())
        .any(|&reference| {
            scoping
                .scope_ancestors(scoping.get_reference(reference).scope_id())
                .find(|&ancestor| {
                    let flags = scoping.scope_flags(ancestor);
                    flags.is_function() && !flags.is_arrow()
                })
                == Some(scope)
        });
    arguments
        || function.id.as_ref().is_some_and(|name| {
            !scoping
                .get_resolved_reference_ids(name.symbol_id())
                .is_empty()
        })
        || function
            .body
            .as_deref()
            .is_some_and(uses_this_or_new_target)
}

fn uses_this_or_new_target(body: &FunctionBody<'_>) -> bool {
    let mut finder = ThisOrNewTarget(false);
    finder.visit_function_body(body);
    finder.0
}

/// Finds `this` or `new.target` of the function whose body it visits.
struct ThisOrNewTarget(bool);

impl<'a> Visit<'a> for ThisOrNewTarget {
    fn visit_this_expression(&mut self, _: &ThisExpression) {
        self.0 = true;
    }

    fn visit_new_target(&mut self, _: &NewTarget) {
        self.0 = true;
    }

    // A nested function has its own `this` and `new.target`.
    fn visit_function(&mut self, _: &Function<'a>, _: ScopeFlags) {}
}

/// The tokens and comments that start inside a span, in document order: what `ESLint`'s token
/// store answers about it.
struct CodeTokens(Vec<Recorded>);

impl CodeTokens {
    fn of(file: &File<'_>, span: Span) -> Self {
        if let Some(component) = file.component() {
            let tokens = component.tokens.within(span).iter();
            return Self(
                tokens
                    .filter_map(|token| {
                        let kind = match token.kind {
                            TokenType::JavaScript(kind) => Some(kind),
                            TokenType::JavaScriptComment => None,
                            _ => return None,
                        };
                        Some(Recorded {
                            kind,
                            span: token.span,
                        })
                    })
                    .collect(),
            );
        }
        let tree = file.javascript();
        let tokens = file.programs().iter().flat_map(|&program| {
            let tokens = tree.get_program_tokens(program);
            let start = tokens.partition_point(|token| token.start() < span.start_offset);
            let end = tokens.partition_point(|token| token.start() < span.end_offset);
            tokens[start..end.max(start)].iter().map(|token| Recorded {
                kind: Some(token.kind()),
                span: Span::new(token.start(), token.end()),
            })
        });
        let comments = file.comments();
        let start = comments.partition_point(|comment| comment.span.start < span.start_offset);
        let end = comments.partition_point(|comment| comment.span.start < span.end_offset);
        let comments = comments[start..end.max(start)]
            .iter()
            .map(|comment| Recorded {
                kind: None,
                span: document_span(comment.span),
            });
        let mut all: Vec<_> = tokens.chain(comments).collect();
        all.sort_unstable_by_key(|token| token.span.start_offset);
        Self(all)
    }

    fn comments(&self) -> impl Iterator<Item = Span> + '_ {
        self.0
            .iter()
            .filter(|token| token.kind.is_none())
            .map(|token| token.span)
    }

    fn code(&self) -> impl DoubleEndedIterator<Item = &Recorded> {
        self.0.iter().filter(|token| token.kind.is_some())
    }

    /// `getTokenAfter`, comments skipped: the first token that starts at or after `offset`.
    fn after(&self, offset: u32) -> Option<Span> {
        self.code()
            .find(|token| token.span.start_offset >= offset)
            .map(|token| token.span)
    }

    /// `getTokenAfter` with comments: the first token or comment at or after `offset`.
    fn next(&self, offset: u32) -> Option<Span> {
        self.0
            .iter()
            .find(|token| token.span.start_offset >= offset)
            .map(|token| token.span)
    }

    /// `getTokenBefore` when it is of `kind`.
    fn last_before(&self, offset: u32, kind: Kind) -> Option<&Recorded> {
        self.code()
            .rev()
            .find(|token| token.span.end_offset <= offset)
            .filter(|token| token.kind == Some(kind))
    }

    /// The `=>` of the arrow whose expression body starts at `offset`.
    fn arrow_before(&self, offset: u32) -> Option<Span> {
        self.code()
            .rev()
            .find(|token| token.span.end_offset <= offset && token.kind == Some(Kind::Arrow))
            .map(|token| token.span)
    }

    /// `span` with the parentheses around it that start inside `parent`.
    fn parenthesized(&self, mut span: Span, parent: Span) -> Span {
        loop {
            let open = self.last_before(span.start_offset, Kind::LParen);
            let close = self
                .code()
                .find(|token| token.span.start_offset >= span.end_offset)
                .filter(|token| token.kind == Some(Kind::RParen));
            match (open, close) {
                (Some(open), Some(close)) if open.span.start_offset >= parent.start_offset => {
                    span = Span::new(open.span.start_offset, close.span.end_offset);
                }
                _ => return span,
            }
        }
    }
}
