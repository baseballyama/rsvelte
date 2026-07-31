//! Block-header form for calls whose argument list oxc lays out "grouped".
//!
//! When a `{#if}` / `{#each}` / `{#key}` / `{#await}` header line does not fit
//! the print width, the oracle keeps it on one line but renders every such call
//! from its most-expanded layout — `callee( a, b )`, one space inside each
//! delimiter, arguments flat, no trailing comma. Calls oxc lays out ungrouped
//! keep `callee(a, b)`.
//!
//! The decision mirrors `arguments_grouped_layout` in
//! `oxc_formatter/src/print/call_like_expression/arguments.rs`, which is private
//! to that crate and so has to be reproduced here. Where a branch of the oracle
//! is only reachable through source constructs a block header cannot hold, this
//! port under-approximates: an unrecognised shape stays flat, which loses the
//! rewrite rather than emitting a wrong one.

use oxc_ast::Comment;
use oxc_ast::ast::*;
use oxc_ast_visit::{Visit, walk};
use oxc_span::{GetSpan, SourceType, Span};

use super::formatter_parse_options;
use crate::options::FormatOptions;

/// Rewrite every grouped-layout call in `flat` to its `callee( a, b )` form.
///
/// `flat` must be a single-line formatted expression. Returns `None` when it
/// does not parse or holds no grouped call, so the caller keeps `flat` as is.
pub(super) fn expand_grouped_call_parens(flat: &str, options: &FormatOptions) -> Option<String> {
    let allocator = crate::scratch::acquire();
    // The `(` wrapper shifts every offset by one byte, and lets a bare object
    // literal parse as an expression rather than a block.
    let wrapped = format!("({flat});");
    let source_type = if options.typescript {
        SourceType::ts().with_module(true)
    } else {
        SourceType::default()
    };
    let ret = oxc_parser::Parser::new(allocator, &wrapped, source_type)
        .with_options(formatter_parse_options())
        .parse();
    if !ret.diagnostics.is_empty() {
        return None;
    }

    let mut collector = GroupedCalls {
        source: &wrapped,
        comments: &ret.program.comments,
        parens: Vec::new(),
    };
    collector.visit_program(&ret.program);
    if collector.parens.is_empty() {
        return None;
    }

    // Validate every delimiter against the unmodified text, then collect the two
    // insertion points each call contributes. Nested calls interleave, so the
    // spaces go in as one descending pass rather than pair by pair — inserting a
    // pair at a time would shift an enclosing call's `)` out from under it.
    let mut points = Vec::with_capacity(collector.parens.len() * 2);
    for (open, close) in collector.parens {
        // Back out of the `(` wrapper.
        let (open, close) = (
            open.checked_sub(1)? as usize,
            close.checked_sub(1)? as usize,
        );
        if flat.as_bytes().get(open) != Some(&b'(')
            || flat.as_bytes().get(close) != Some(&b')')
            || close <= open + 1
        {
            return None;
        }
        points.push(open + 1);
        points.push(close);
    }
    points.sort_unstable();
    let mut out = flat.to_string();
    for point in points.into_iter().rev() {
        out.insert(point, ' ');
    }
    Some(out)
}

/// How much wider `src` prints once its grouped calls carry the expanded
/// spacing — two spaces per such call.
///
/// An `{#each}` header holds two expressions and the oracle settles them left to
/// right, so the iterable's fit is judged against the not-yet-settled key at its
/// widest, while the key's is judged against whatever the iterable ended up at.
/// Counting from the source is safe because grouping depends on the expression's
/// shape, which formatting preserves.
pub(super) fn grouped_call_expansion(src: &str, options: &FormatOptions) -> usize {
    let allocator = crate::scratch::acquire();
    let wrapped = format!("({src});");
    let source_type = if options.typescript {
        SourceType::ts().with_module(true)
    } else {
        SourceType::default()
    };
    let ret = oxc_parser::Parser::new(allocator, &wrapped, source_type)
        .with_options(formatter_parse_options())
        .parse();
    if !ret.diagnostics.is_empty() {
        return 0;
    }
    let mut collector = GroupedCalls {
        source: &wrapped,
        comments: &ret.program.comments,
        parens: Vec::new(),
    };
    collector.visit_program(&ret.program);
    collector.parens.len() * 2
}

struct GroupedCalls<'c> {
    source: &'c str,
    comments: &'c [Comment],
    /// `(open_paren, close_paren)` byte offsets into the wrapped source.
    parens: Vec<(u32, u32)>,
}

impl<'a> Visit<'a> for GroupedCalls<'_> {
    fn visit_call_expression(&mut self, it: &CallExpression<'a>) {
        if !is_bailout_callee(&it.callee, &it.arguments)
            && !is_react_hook_with_deps_array(&it.arguments)
            && !is_function_composition_args(&it.arguments)
            && self.is_grouped(&it.arguments)
        {
            let scan_from = it
                .type_arguments
                .as_ref()
                .map_or_else(|| it.callee.span().end, |t| t.span.end);
            self.record(scan_from, it.span);
        }
        walk::walk_call_expression(self, it);
    }

    fn visit_new_expression(&mut self, it: &NewExpression<'a>) {
        if !is_function_composition_args(&it.arguments) && self.is_grouped(&it.arguments) {
            let scan_from = it
                .type_arguments
                .as_ref()
                .map_or_else(|| it.callee.span().end, |t| t.span.end);
            self.record(scan_from, it.span);
        }
        walk::walk_new_expression(self, it);
    }
}

impl GroupedCalls<'_> {
    /// Record the argument list's delimiters. The closing `)` is the call's last
    /// byte; the opening `(` is the next one after the callee (or, when present,
    /// the type arguments), so `?.` and a parenthesised callee both fall out
    /// without re-lexing them.
    fn record(&mut self, scan_from: u32, call: Span) {
        let close = call.end - 1;
        if self.source.as_bytes().get(close as usize) != Some(&b')') {
            return;
        }
        let Some(gap) = self.source.get(scan_from as usize..close as usize) else {
            return;
        };
        let Some(offset) = gap.find('(') else {
            return;
        };
        let open = scan_from + offset as u32;
        // A comment between the callee and `(` could hold a paren of its own, so
        // leave the call alone rather than delimit it at the wrong byte.
        if has_comment_in(self.comments, Span::new(scan_from, open)) {
            return;
        }
        self.parens.push((open, close));
    }

    fn is_grouped(&self, args: &[Argument<'_>]) -> bool {
        let Some(last) = args.last().and_then(Argument::as_expression) else {
            return false;
        };
        // oxc checks both strategies for exactly two arguments, and only
        // last-argument grouping otherwise.
        if args.len() == 2 {
            let first = args[0].as_expression();
            if can_group_argument(last, self.comments) {
                return should_group_last(2, first, last, self.comments);
            }
            return first.is_some_and(|first| should_group_first(first, last, self.comments));
        }
        let penultimate = args
            .len()
            .checked_sub(2)
            .and_then(|i| args[i].as_expression());
        can_group_argument(last, self.comments)
            && should_group_last(args.len(), penultimate, last, self.comments)
    }
}

/// Callees oxc routes to a hugging layout that never gains the expanded spacing:
/// `require` / `define`, and the `it("…", fn)` test-call family.
fn is_bailout_callee(callee: &Expression<'_>, args: &[Argument<'_>]) -> bool {
    match callee {
        Expression::Identifier(ident) => match ident.name.as_str() {
            "require" | "define" => true,
            _ => is_test_call(ident.name.as_str(), args),
        },
        Expression::StaticMemberExpression(member) => {
            // `require.resolve("…")`, `require.resolve.paths("…")`.
            matches!(member.property.name.as_str(), "resolve" | "paths")
                && matches!(&member.object, Expression::Identifier(id) if id.name == "require")
                || is_test_call(member.property.name.as_str(), args)
        }
        _ => false,
    }
}

/// `it("name", () => {…})` and friends: a string/template first argument, a
/// function-like second, at most three arguments.
fn is_test_call(name: &str, args: &[Argument<'_>]) -> bool {
    const TEST_NAMES: [&str; 10] = [
        "it",
        "test",
        "describe",
        "xit",
        "xtest",
        "xdescribe",
        "fit",
        "fdescribe",
        "skip",
        "only",
    ];
    if !TEST_NAMES.contains(&name) || args.len() < 2 || args.len() > 3 {
        return false;
    }
    matches!(
        args[0],
        Argument::StringLiteral(_) | Argument::TemplateLiteral(_)
    ) && matches!(
        args[1],
        Argument::FunctionExpression(_) | Argument::ArrowFunctionExpression(_)
    )
}

/// `useMemo(() => {…}, [deps])` — oxc hugs these instead of grouping.
fn is_react_hook_with_deps_array(args: &[Argument<'_>]) -> bool {
    if args.len() < 2 || args.len() > 3 {
        return false;
    }
    if args.len() == 3 && !matches!(args[0], Argument::Identifier(_)) {
        return false;
    }
    let (Some(Argument::ArrowFunctionExpression(callback)), Some(Argument::ArrayExpression(_))) =
        (args.get(args.len() - 2), args.last())
    else {
        return false;
    };
    !callback.params.has_parameter() && !callback.expression
}

/// `compose(a => a, b => b)`: oxc breaks every argument out unconditionally, so
/// the expression never reaches this path as a single line.
fn is_function_composition_args(args: &[Argument<'_>]) -> bool {
    if args.len() <= 1 {
        return false;
    }
    let mut seen_function_like = false;
    for arg in args {
        match arg {
            Argument::FunctionExpression(_) | Argument::ArrowFunctionExpression(_) => {
                if seen_function_like {
                    return true;
                }
                seen_function_like = true;
            }
            _ => {
                if let Some(call) = arg.as_expression().and_then(as_call_without_chain_wrappers)
                    && call.arguments.iter().any(|a| {
                        matches!(
                            a,
                            Argument::FunctionExpression(_) | Argument::ArrowFunctionExpression(_)
                        )
                    })
                {
                    return true;
                }
            }
        }
    }
    false
}

/// `can_group_expression_argument`: does this argument benefit from hugging?
fn can_group_argument(expr: &Expression<'_>, comments: &[Comment]) -> bool {
    match expr {
        Expression::ObjectExpression(object) => {
            !object.properties.is_empty() || has_comment_in(comments, object.span)
        }
        Expression::ArrayExpression(array) => {
            !array.elements.is_empty() || has_comment_in(comments, array.span)
        }
        Expression::TSTypeAssertion(e) => can_group_argument(&e.expression, comments),
        Expression::TSAsExpression(e) => can_group_argument(&e.expression, comments),
        Expression::TSSatisfiesExpression(e) => can_group_argument(&e.expression, comments),
        Expression::ArrowFunctionExpression(arrow) => can_group_arrow(arrow, false),
        Expression::FunctionExpression(_) => true,
        _ => false,
    }
}

/// `can_group_arrow_function_expression_argument`. A block body always groups;
/// an expression body only for the shapes that keep the braces huggable.
///
/// oxc additionally consults comments here (an empty block body carrying one
/// still groups; a JSDoc type cast before a call body suppresses it). Both are
/// dropped: each only ever removes a rewrite, never adds a wrong one.
fn can_group_arrow(arrow: &ArrowFunctionExpression<'_>, is_arrow_recursion: bool) -> bool {
    // A composite return type would break inside, so oxc refuses to group unless
    // the body is a non-empty block.
    if let Some(return_type) = &arrow.return_type
        && matches!(return_type.type_annotation, TSType::TSTypeReference(_))
        && (arrow.expression || arrow.body.statements.is_empty())
    {
        return false;
    }
    let Some(body) = arrow.get_expression() else {
        return true;
    };
    match body {
        Expression::ObjectExpression(_)
        | Expression::ArrayExpression(_)
        | Expression::JSXElement(_)
        | Expression::JSXFragment(_) => true,
        Expression::ArrowFunctionExpression(inner) => can_group_arrow(inner, true),
        Expression::ConditionalExpression(_) => !is_arrow_recursion,
        other => !is_arrow_recursion && as_call_without_chain_wrappers(other).is_some(),
    }
}

/// `should_group_last_argument_impl`.
fn should_group_last(
    args_len: usize,
    penultimate: Option<&Expression<'_>>,
    last: &Expression<'_>,
    comments: &[Comment],
) -> bool {
    // Two arguments of the same shape read better broken out than hugged.
    if let Some(penultimate) = penultimate
        && matches!(
            (penultimate, last),
            (
                Expression::ObjectExpression(_),
                Expression::ObjectExpression(_)
            ) | (
                Expression::ArrayExpression(_),
                Expression::ArrayExpression(_)
            ) | (Expression::TSAsExpression(_), Expression::TSAsExpression(_))
                | (
                    Expression::TSSatisfiesExpression(_),
                    Expression::TSSatisfiesExpression(_)
                )
                | (
                    Expression::ArrowFunctionExpression(_),
                    Expression::ArrowFunctionExpression(_)
                )
                | (
                    Expression::FunctionExpression(_),
                    Expression::FunctionExpression(_)
                )
        )
    {
        return false;
    }
    let last_span = last.span();
    let comment_start = penultimate.map_or(last_span.start, |p| p.span().end);
    if has_comment_in(comments, Span::new(comment_start, last_span.start)) {
        return false;
    }
    match last {
        Expression::ArrayExpression(array) if penultimate.is_some() => {
            // `useEffect(() => {…}, [deps])`.
            if args_len == 2 && matches!(penultimate, Some(Expression::ArrowFunctionExpression(_)))
            {
                return false;
            }
            !can_concisely_print_array(array, comments)
        }
        _ => true,
    }
}

/// `should_group_first_argument`: a leading function body hugged against `(`,
/// with a short trailing argument.
fn should_group_first(
    first: &Expression<'_>,
    second: &Expression<'_>,
    comments: &[Comment],
) -> bool {
    match first {
        Expression::FunctionExpression(_) => {}
        Expression::ArrowFunctionExpression(arrow) if !arrow.expression => {}
        _ => return false,
    }
    if matches!(
        second,
        Expression::ArrowFunctionExpression(_)
            | Expression::FunctionExpression(_)
            | Expression::ConditionalExpression(_)
    ) {
        return false;
    }
    if has_comment_in(comments, Span::new(first.span().end, second.span().start)) {
        return false;
    }
    is_relatively_short_argument(second)
}

/// `can_concisely_print_array_list`: every element a numeric literal, or a
/// signed one.
fn can_concisely_print_array(array: &ArrayExpression<'_>, comments: &[Comment]) -> bool {
    if array.elements.is_empty() || has_comment_in(comments, array.span) {
        return false;
    }
    array.elements.iter().all(|element| match element {
        ArrayExpressionElement::NumericLiteral(_) => true,
        ArrayExpressionElement::UnaryExpression(unary) => {
            unary.operator.is_arithmetic()
                && matches!(unary.argument, Expression::NumericLiteral(_))
        }
        _ => false,
    })
}

/// `is_relatively_short_argument`, narrowed to the shapes a block header can
/// realistically carry. Anything else reads as "not short", which only costs the
/// first-argument grouping.
fn is_relatively_short_argument(expr: &Expression<'_>) -> bool {
    match expr {
        Expression::RegExpLiteral(_) => true,
        Expression::CallExpression(call) => call.arguments.len() <= 1 && is_simple(expr, 0),
        Expression::NewExpression(new) => new.arguments.len() <= 1 && is_simple(expr, 0),
        _ => is_simple(expr, 0),
    }
}

/// `SimpleArgument::is_simple_impl`, restricted to leaf shapes.
fn is_simple(expr: &Expression<'_>, depth: u8) -> bool {
    if depth >= 2 {
        return false;
    }
    match expr {
        Expression::NullLiteral(_)
        | Expression::BooleanLiteral(_)
        | Expression::StringLiteral(_)
        | Expression::NumericLiteral(_)
        | Expression::BigIntLiteral(_)
        | Expression::ThisExpression(_)
        | Expression::Identifier(_)
        | Expression::Super(_) => true,
        Expression::RegExpLiteral(regex) => regex.regex.pattern.text.len() <= 5,
        Expression::UnaryExpression(unary) => {
            matches!(
                unary.operator,
                UnaryOperator::LogicalNot
                    | UnaryOperator::UnaryNegation
                    | UnaryOperator::UnaryPlus
                    | UnaryOperator::BitwiseNot
            ) && is_simple(&unary.argument, depth)
        }
        Expression::UpdateExpression(update) => is_simple_target(&update.argument, depth),
        Expression::TSNonNullExpression(e) => is_simple(&e.expression, depth),
        Expression::StaticMemberExpression(member) => is_simple(&member.object, depth),
        Expression::ComputedMemberExpression(member) => {
            is_simple(&member.object, depth) && is_simple(&member.expression, depth)
        }
        Expression::CallExpression(call) => {
            is_simple(&call.callee, depth + 1)
                && call.arguments.iter().all(|arg| {
                    arg.as_expression()
                        .is_some_and(|expr| is_simple(expr, depth + 1))
                })
        }
        _ => false,
    }
}

fn is_simple_target(target: &SimpleAssignmentTarget<'_>, depth: u8) -> bool {
    matches!(
        target,
        SimpleAssignmentTarget::AssignmentTargetIdentifier(_)
    ) || target
        .get_expression()
        .is_some_and(|expr| is_simple(expr, depth))
}

/// `as_call_expression_without_chain_wrappers`: see through `a?.b()` / `a.b()!`.
fn as_call_without_chain_wrappers<'a, 'b>(
    expr: &'b Expression<'a>,
) -> Option<&'b CallExpression<'a>> {
    match expr {
        Expression::CallExpression(call) => Some(call),
        Expression::ChainExpression(chain) => match &chain.expression {
            ChainElement::CallExpression(call) => Some(call),
            _ => None,
        },
        Expression::TSNonNullExpression(e) => as_call_without_chain_wrappers(&e.expression),
        _ => None,
    }
}

fn has_comment_in(comments: &[Comment], span: Span) -> bool {
    comments
        .iter()
        .any(|c| c.span.start >= span.start && c.span.end <= span.end)
}
