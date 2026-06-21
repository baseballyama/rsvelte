//! AST-based `await <expr>` → `(await $.save(<expr>))()` rewrite for the
//! server target.
//!
//! Replaces the hand-rolled byte scanner (`transform_await_to_save` /
//! `find_await_arg_end` in `helpers.rs`). The old scanner approximated each
//! `await` operand's extent by enumerating the operators that terminate it;
//! any token it forgot leaked the rest of the expression into the `$.save(…)`
//! argument list. The omission that motivated this port was the ternary
//! alternate separator `:` — `cond ? await fn() : alt` swallowed `: alt`
//! into `$.save(fn() : alt)` (issue #1036, bug 2).
//!
//! Parsing the expression and reading each `AwaitExpression`'s span removes the
//! entire class of "forgot an operator" bugs: the operand extent is exactly
//! the argument node's span, so everything outside it (the `:` alternate,
//! trailing binary operators, …) stays untouched.
//!
//! Scope note: awaits inside a nested function / arrow body belong to a
//! different async region and are left alone, mirroring `expr_contains_await`
//! (which gates every call site). Only awaits at the current expression level
//! are wrapped; nested awaits inside a wrapped operand are handled by the
//! recursive emit, not by a second parse.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::{Visit, walk};
use oxc_parser::{ParseOptions, Parser};
use oxc_span::{GetSpan, SourceType};
use oxc_syntax::scope::ScopeFlags;

thread_local! {
    static AWAIT_SAVE_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// Byte ranges of one `await` operand: the full `await …` span and the inner
/// argument span. `(await_start, await_end, arg_start, arg_end)`.
type AwaitSpan = (u32, u32, u32, u32);

/// Transform every top-level `await <operand>` in `expr` into
/// `(await $.save(<operand>))()`, returning `None` when the expression does
/// not parse cleanly (the caller falls back to the textual scanner) or when
/// it contains no expression-level `await`.
pub(crate) fn transform_await_to_save_ast(expr: &str) -> Option<String> {
    AWAIT_SAVE_ALLOC.with(|cell| {
        let allocator = std::mem::take(&mut *cell.borrow_mut());
        let out = transform_with(&allocator, expr);
        *cell.borrow_mut() = allocator;
        out
    })
}

fn transform_with(allocator: &Allocator, expr: &str) -> Option<String> {
    // A bare expression isn't a valid program on its own (e.g. a leading `{`
    // would parse as a block, top-level `await` needs module mode). Parse it
    // as a module expression statement: `cond ? await f() : g` is a valid
    // top-level ExpressionStatement and top-level `await` is allowed in a
    // module. TS source type keeps `as`/`satisfies` casts parseable.
    let source_type = SourceType::ts().with_module(true);
    let parsed = Parser::new(allocator, expr, source_type)
        .with_options(ParseOptions {
            // The expression alone may sit outside any function; permit a
            // stray `return`/`await` rather than bailing to the textual path.
            allow_return_outside_function: true,
            ..ParseOptions::default()
        })
        .parse();
    if !parsed.diagnostics.is_empty() {
        return None;
    }

    let mut collector = AwaitCollector {
        function_depth: 0,
        awaits: Vec::new(),
    };
    collector.visit_program(&parsed.program);
    if collector.awaits.is_empty() {
        return None;
    }

    // Sort by start so the linear emit walks the source left-to-right.
    collector.awaits.sort_by_key(|&(start, ..)| start);
    Some(emit_range(expr, &collector.awaits, 0, expr.len() as u32))
}

/// Whether `expr` contains an expression-level `await` — one that is *not*
/// nested inside a function / arrow body (those belong to a different async
/// region). Returns `None` when `expr` doesn't parse as a standalone module,
/// so the caller can fall back to the textual scanner.
///
/// Mirrors `helpers::expr_contains_await`'s nesting semantics via real AST
/// scoping instead of a byte scan with hand-rolled `function`/`=>` body
/// skipping. Callers should keep a cheap `memmem("await")` pre-check before
/// calling this (parsing is only worth it when the word is actually present).
pub(crate) fn contains_top_level_await(expr: &str) -> Option<bool> {
    AWAIT_SAVE_ALLOC.with(|cell| {
        let allocator = std::mem::take(&mut *cell.borrow_mut());
        let out = contains_with(&allocator, expr);
        *cell.borrow_mut() = allocator;
        out
    })
}

fn contains_with(allocator: &Allocator, expr: &str) -> Option<bool> {
    let source_type = SourceType::ts().with_module(true);
    let parsed = Parser::new(allocator, expr, source_type)
        .with_options(ParseOptions {
            allow_return_outside_function: true,
            ..ParseOptions::default()
        })
        .parse();
    if !parsed.diagnostics.is_empty() {
        return None;
    }
    let mut collector = AwaitCollector {
        function_depth: 0,
        awaits: Vec::new(),
    };
    collector.visit_program(&parsed.program);
    Some(!collector.awaits.is_empty())
}

/// Emit `source[lo..hi]`, wrapping each top-level `await` operand within the
/// range. An `await` is "top-level within the range" when it is not nested
/// inside an earlier wrapped operand — `emit_range` advances its cursor past
/// each wrapped operand's full span, so awaits inside that span are handled by
/// the recursive call on the operand range, never re-wrapped here.
fn emit_range(source: &str, awaits: &[AwaitSpan], lo: u32, hi: u32) -> String {
    let mut out = String::new();
    let mut cursor = lo;
    for &(await_start, await_end, arg_start, arg_end) in awaits {
        if await_start < cursor || await_end > hi {
            // Either already consumed by an enclosing operand, or outside the
            // range we're emitting.
            continue;
        }
        out.push_str(&source[cursor as usize..await_start as usize]);
        out.push_str("(await $.save(");
        // Recurse into the operand so nested awaits get wrapped too.
        out.push_str(&emit_range(source, awaits, arg_start, arg_end));
        out.push_str("))()");
        cursor = await_end;
    }
    out.push_str(&source[cursor as usize..hi as usize]);
    out
}

struct AwaitCollector {
    function_depth: u32,
    awaits: Vec<AwaitSpan>,
}

impl<'a> Visit<'a> for AwaitCollector {
    fn visit_function(&mut self, it: &Function<'a>, flags: ScopeFlags) {
        // Awaits inside a nested function belong to that function's async
        // region — skip the whole body.
        self.function_depth += 1;
        walk::walk_function(self, it, flags);
        self.function_depth -= 1;
    }

    fn visit_arrow_function_expression(&mut self, it: &ArrowFunctionExpression<'a>) {
        self.function_depth += 1;
        walk::walk_arrow_function_expression(self, it);
        self.function_depth -= 1;
    }

    fn visit_await_expression(&mut self, await_expr: &AwaitExpression<'a>) {
        if self.function_depth == 0 {
            let arg = await_expr.argument.span();
            self.awaits.push((
                await_expr.span.start,
                await_expr.span.end,
                arg.start,
                arg.end,
            ));
        }
        // Walk the operand so a nested `await` inside it is collected too; the
        // recursive emit relies on having every await span available.
        walk::walk_await_expression(self, await_expr);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn contains_top_level_await_basic() {
        assert_eq!(contains_top_level_await("await foo()"), Some(true));
        assert_eq!(contains_top_level_await("foo + bar"), Some(false));
    }

    #[test]
    fn contains_top_level_await_ignores_nested_function() {
        // The await belongs to a nested arrow's async region, not the top level.
        assert_eq!(
            contains_top_level_await("fn(async () => await inner())"),
            Some(false)
        );
        // But a top-level await alongside a nested one still counts.
        assert_eq!(
            contains_top_level_await("await outer(async () => await inner())"),
            Some(true)
        );
    }

    #[test]
    fn contains_top_level_await_unparseable_is_none() {
        assert_eq!(contains_top_level_await("await ((("), None);
    }

    #[test]
    fn ternary_consequent_await_keeps_alternate_outside_save() {
        // Issue #1036 bug 2: the `: undefined` alternate must stay outside the
        // `$.save(…)` call.
        let got = transform_await_to_save_ast(
            "cond ? await getWorkspacesRetrieve({ path: { id: cond } }) : undefined",
        )
        .unwrap();
        assert_eq!(
            got,
            "cond ? (await $.save(getWorkspacesRetrieve({ path: { id: cond } })))() : undefined"
        );
    }

    #[test]
    fn plain_await_wraps_operand() {
        let got = transform_await_to_save_ast("await foo(1, 2)").unwrap();
        assert_eq!(got, "(await $.save(foo(1, 2)))()");
    }

    #[test]
    fn binary_after_await_stays_outside() {
        // `await foo > 10` parses as `(await foo) > 10` — only `foo` is the
        // operand.
        let got = transform_await_to_save_ast("await foo > 10").unwrap();
        assert_eq!(got, "(await $.save(foo))() > 10");
    }

    #[test]
    fn nested_await_wraps_both() {
        let got = transform_await_to_save_ast("await foo(await bar())").unwrap();
        assert_eq!(got, "(await $.save(foo((await $.save(bar()))())))()");
    }

    #[test]
    fn await_inside_nested_arrow_is_left_alone() {
        // The arrow's await belongs to a different async scope.
        let got = transform_await_to_save_ast("await fn(async () => await inner())");
        assert_eq!(
            got.unwrap(),
            "(await $.save(fn(async () => await inner())))()"
        );
    }

    #[test]
    fn no_await_returns_none() {
        assert!(transform_await_to_save_ast("a ? b : c").is_none());
    }

    #[test]
    fn arg_ends_bounds_operand_before_ternary_colon() {
        // `...await fn({a:1}) : x` — the operand ends at the call's `)`, not at
        // the ternary `:` (issue #1036 in the attribute-extraction path).
        let expr = "cond ? await fn({ a: 1 }) : undefined";
        let kw = expr.find("await").unwrap() as u32;
        let ends = await_arg_ends(expr).unwrap();
        let (_, end) = ends.iter().find(|&&(s, _)| s == kw).unwrap();
        // operand text is `fn({ a: 1 })`
        assert_eq!(&expr[kw as usize + 6..*end as usize], "fn({ a: 1 })");
    }

    #[test]
    fn arg_ends_includes_nested_function_awaits() {
        let expr = "fn(async () => await inner())";
        let ends = await_arg_ends(expr).unwrap();
        // the await inside the nested arrow is present
        assert_eq!(ends.len(), 1);
    }

    #[test]
    fn unparseable_returns_none() {
        assert!(transform_await_to_save_ast("await (((").is_none());
    }
}
