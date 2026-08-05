//! AST-based dev-mode `console.METHOD(args)` →
//! `console.METHOD(...$.log_if_contains_state('METHOD', args))`
//! wrapping for generated script text — module scripts
//! (`.svelte.js` / `.svelte.ts`), instance-script statements, and the settled
//! legacy instance script (whose `$:` bodies no per-statement pass ever sees).
//!
//! Replaces `props_transforms::transform_console_calls_dev`, whose
//! string-literal skip relied on `is_inside_string_literal` —
//! another quote-counting heuristic that breaks under escaped
//! quotes, regex literals, and template-literal interpolation.
//! The AST visitor descends only into call positions, so the rewrite
//! is correctness-by-structure.
//!
//! Skip cases (mirror the text predecessor):
//!
//! * Wrong method — only `debug` / `dir` / `error` / `group` /
//!   `groupCollapsed` / `info` / `log` / `trace` / `warn` get wrapped.
//! * Empty argument list (nothing to wrap).
//! * Single spread element of `$$args` — this is the
//!   `$.inspect()` default callback pattern, already handled
//!   downstream.
//! * No argument can evaluate to `UNKNOWN` — see `console_wrap`.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::ParseOptions;
use oxc_span::{GetSpan, SourceType};

use crate::compiler::phases::phase2_analyze::ComponentAnalysis;

use super::ast_rewrite::{self, Edit};
use super::console_wrap::{CONSOLE_METHODS, shape_can_be_unknown};

thread_local! {
    static MODULE_CONSOLE_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// AST-based `console.METHOD(args)` wrapping. Returns `None` if no
/// `console.` text appears, the source fails to parse, or no call
/// site needs wrapping.
pub(super) fn transform_console_calls_dev_ast(
    source: &str,
    is_ts: bool,
    analysis: Option<&ComponentAnalysis>,
) -> Option<String> {
    // Fast probe — most module scripts have no console calls at all.
    memchr::memmem::find(source.as_bytes(), b"console.")?;

    // Nested `console.log(console.warn(x))` needs the outer rewrite
    // to use the *already-rewritten* inner argument text. Same
    // strategy as `strict_equals_ast`: only rewrite calls whose
    // arguments are themselves leaf (no `console.<method>(` lurking
    // in their source span), then re-parse and repeat. Terminates
    // in O(max nesting depth) passes — typically 1.
    ast_rewrite::fixed_point(source, |src| {
        ast_rewrite::rewrite_once(
            &MODULE_CONSOLE_ALLOC,
            src,
            fragment_source_type(is_ts),
            ParseOptions::default(),
            false,
            |program| collect_console_edits(program, src, analysis),
        )
    })
}

fn fragment_source_type(is_ts: bool) -> SourceType {
    if is_ts {
        SourceType::ts().with_module(true)
    } else {
        SourceType::mjs()
    }
}

/// Dev console wrapping for one generated instance-script fragment.
///
/// The legacy text scanner is reached only for a fragment oxc rejects: it
/// cannot tell a real call from `console.log(...)` sitting inside a comment or
/// a string, so running it on a fragment that parsed but simply needed no wrap
/// rewrites commented-out code.
pub(super) fn transform_console_calls_dev_fragment(
    source: &str,
    is_ts: bool,
    analysis: Option<&ComponentAnalysis>,
) -> Option<String> {
    memchr::memmem::find(source.as_bytes(), b"console.")?;
    if let Some(rewritten) = transform_console_calls_dev_ast(source, is_ts, analysis) {
        return Some(rewritten);
    }
    let parsed = ast_rewrite::with_program(
        &MODULE_CONSOLE_ALLOC,
        source,
        fragment_source_type(is_ts),
        ParseOptions::default(),
        |_| Some(()),
    )
    .is_some();
    (!parsed).then(|| super::props_transforms::transform_console_calls_dev(source))
}

/// Collect leaf `console.METHOD(args)` wraps (calls whose arguments
/// hold no unwrapped nested console call) from a single parse. Nested
/// cases resolve across fixed-point iterations — the standalone
/// `transform_console_calls_dev_ast` loop and the batched module
/// dev-tail driver both drive that loop.
pub(super) fn collect_console_edits(
    program: &Program<'_>,
    source: &str,
    analysis: Option<&ComponentAnalysis>,
) -> Vec<Edit> {
    let mut collector = ConsoleCollector {
        source,
        analysis,
        replacements: Vec::new(),
    };
    collector.visit_program(program);
    collector.replacements
}

struct ConsoleCollector<'src> {
    source: &'src str,
    analysis: Option<&'src ComponentAnalysis>,
    replacements: Vec<Edit>,
}

impl<'a, 'src> Visit<'a> for ConsoleCollector<'src> {
    fn visit_call_expression(&mut self, call: &CallExpression<'a>) {
        walk::walk_call_expression(self, call);

        // Match callee `console.<method>`.
        let Expression::StaticMemberExpression(member) = &call.callee else {
            return;
        };
        let Expression::Identifier(obj) = &member.object else {
            return;
        };
        if obj.name != "console" {
            return;
        }
        let method = member.property.name.as_str();
        if !CONSOLE_METHODS.contains(&method) {
            return;
        }

        // Empty arg list — nothing to wrap.
        if call.arguments.is_empty() {
            return;
        }

        // `$.inspect()` default callback emits `console.log(...$$args)`.
        // Skip wrapping in that exact shape so we don't double-wrap.
        if call.arguments.len() == 1
            && let Argument::SpreadElement(spread) = &call.arguments[0]
            && let Expression::Identifier(id) = &spread.argument
            && id.name == "$$args"
        {
            return;
        }

        // Upstream wraps only when some argument's `scope.evaluate` can be
        // `UNKNOWN`. This pass sees generated JS, so it applies the scope-free
        // half of that lattice.
        if !call
            .arguments
            .iter()
            .any(|arg| arg_can_be_unknown(arg, self.analysis))
        {
            return;
        }

        // Build the rewrite. We rebuild the whole call from source
        // text to preserve formatting / comments inside the arg list.
        let args_start = call.arguments[0].span().start;
        let args_end = call.arguments.last().unwrap().span().end;
        let args_text = &self.source[args_start as usize..args_end as usize];

        // Already wrapped on a prior pass? The wrapper shape
        // `...$.log_if_contains_state(...)` as a single arg is our
        // own emission — re-wrapping would loop forever.
        if is_already_wrapped(&call.arguments) {
            return;
        }

        // Defer: if the argument source itself contains another
        // *unwrapped* `console.<known method>(` invocation, leave
        // the outer wrap for the next fixed-point pass — by then
        // the inner call has been rewritten and the outer can use
        // the updated text verbatim.
        if args_contain_unwrapped_console_call(args_text) {
            return;
        }

        // Single quotes: the method name is a plain `b.literal`, which esrap prints
        // single-quoted, and this text path bypasses the printer.
        let rewrite = format!(
            "console.{}(...$.log_if_contains_state('{}', {}))",
            method, method, args_text
        );
        self.replacements
            .push((call.span.start, call.span.end, rewrite));
    }
}

/// True when this call's argument list is exactly the wrapper shape
/// we emit: one SpreadElement whose argument is a call to
/// `$.log_if_contains_state(...)`. Detecting it prevents the
/// fixed-point loop from re-wrapping its own output.
fn is_already_wrapped<'a>(args: &oxc_allocator::Vec<'a, Argument<'a>>) -> bool {
    if args.len() != 1 {
        return false;
    }
    let Argument::SpreadElement(spread) = &args[0] else {
        return false;
    };
    let Expression::CallExpression(call) = &spread.argument else {
        return false;
    };
    let Expression::StaticMemberExpression(member) = &call.callee else {
        return false;
    };
    let Expression::Identifier(obj) = &member.object else {
        return false;
    };
    obj.name == "$" && member.property.name == "log_if_contains_state"
}

/// Cheap byte-level check: does `s` contain `console.<known>(` that
/// is *not* immediately followed by `...$.log_if_contains_state(`?
/// Used by the collector to defer outer wraps until the inner call
/// has been rewritten on a prior fixed-point iteration. False
/// positives (substrings inside a string literal) just delay the
/// wrap by one iteration — they never produce wrong output.
fn args_contain_unwrapped_console_call(s: &str) -> bool {
    let bytes = s.as_bytes();
    let wrapped_marker: &[u8] = b"...$.log_if_contains_state(";
    let mut search = 0;
    while let Some(rel) = memchr::memmem::find(&bytes[search..], b"console.") {
        let after = search + rel + b"console.".len();
        let mut end = after;
        while end < bytes.len() && (bytes[end].is_ascii_alphanumeric() || bytes[end] == b'_') {
            end += 1;
        }
        if end < bytes.len() && bytes[end] == b'(' {
            let method = &s[after..end];
            if CONSOLE_METHODS.contains(&method) {
                // Check if this call is already wrapped: the bytes
                // right after the `(` should match the wrapper marker.
                let inside = end + 1;
                let is_wrapped = inside + wrapped_marker.len() <= bytes.len()
                    && &bytes[inside..inside + wrapped_marker.len()] == wrapped_marker;
                if !is_wrapped {
                    return true;
                }
            }
        }
        search = after;
    }
    false
}

/// Upstream's per-argument half of the wrap test: a `SpreadElement` always
/// forces the wrap, everything else goes through the shape lattice.
fn arg_can_be_unknown(arg: &Argument<'_>, analysis: Option<&ComponentAnalysis>) -> bool {
    match arg {
        Argument::SpreadElement(_) => true,
        _ => arg
            .as_expression()
            .is_none_or(|expr| shape_can_be_unknown(expr, analysis)),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// No analysis: every identifier stays unresolved, which is what a
    /// standalone fragment looks like to this pass.
    fn transform_console_calls_dev_ast_for_test(source: &str, is_ts: bool) -> Option<String> {
        transform_console_calls_dev_ast(source, is_ts, None)
    }

    #[test]
    fn wraps_console_log_with_identifier() {
        let out = transform_console_calls_dev_ast_for_test("console.log(x);", false).unwrap();
        assert_eq!(out, "console.log(...$.log_if_contains_state('log', x));");
    }

    #[test]
    fn wraps_each_known_method() {
        for method in CONSOLE_METHODS {
            let src = format!("console.{}(x);", method);
            let out = transform_console_calls_dev_ast_for_test(&src, false).unwrap();
            let expected = format!(
                "console.{}(...$.log_if_contains_state('{}', x));",
                method, method
            );
            assert_eq!(out, expected, "method {method}");
        }
    }

    #[test]
    fn skips_empty_args() {
        assert!(transform_console_calls_dev_ast_for_test("console.log();", false).is_none());
    }

    #[test]
    fn skips_default_inspect_callback() {
        // The shape `(...$$args) => console.log(...$$args)` is
        // emitted by $.inspect's default callback.
        let src = "(...$$args) => console.log(...$$args)";
        assert!(transform_console_calls_dev_ast_for_test(src, false).is_none());
    }

    #[test]
    fn skips_all_literal_args() {
        for src in [
            r#"console.log("hello");"#,
            "console.log(42);",
            "console.log(true);",
            "console.log(null);",
            "console.log(undefined);",
            "console.log(void 0);",
            r#"console.log("a", 42, true);"#,
            "console.log(`static`);",
        ] {
            assert!(
                transform_console_calls_dev_ast_for_test(src, false).is_none(),
                "should skip: {src}"
            );
        }
    }

    /// `scope.evaluate` resolves every one of these to a value set without
    /// `UNKNOWN`, whatever the operands are, so upstream never wraps them.
    #[test]
    fn skips_arguments_no_operator_can_leave_unknown() {
        for src in [
            "console.log(`n is ${n}`);",
            r#"console.log("n is " + n);"#,
            "console.log(a + b);",
            "console.log(a === b);",
            "console.log($.strict_equals(a, b));",
            "console.log(!!x);",
            "console.log(typeof x);",
            "console.log($effect.tracking());",
            "console.log($.effect_tracking());",
            "console.log(() => x);",
            "console.log(a ? `y` : `n`);",
        ] {
            assert!(
                transform_console_calls_dev_ast_for_test(src, false).is_none(),
                "should skip: {src}"
            );
        }
    }

    /// The legacy text scanner cannot see comments; it must not be reached for
    /// a fragment that parses and simply needs no wrap.
    #[test]
    fn commented_out_call_is_left_alone() {
        let src = "// console.log('data: ', data)\nlet x = 1;";
        assert!(transform_console_calls_dev_fragment(src, false, None).is_none());
    }

    #[test]
    fn unparsable_fragment_still_reaches_the_text_scanner() {
        let out = transform_console_calls_dev_fragment("console.log(x); let =;", false, None);
        assert_eq!(
            out.as_deref(),
            Some("console.log(...$.log_if_contains_state('log', x)); let =;")
        );
    }

    #[test]
    fn wraps_mixed_literal_and_identifier() {
        let out =
            transform_console_calls_dev_ast_for_test(r#"console.log("x:", x);"#, false).unwrap();
        assert_eq!(
            out,
            r#"console.log(...$.log_if_contains_state('log', "x:", x));"#
        );
    }

    #[test]
    fn skips_non_console_methods() {
        // `console.bogus(x)` isn't one of the recognised methods.
        assert!(transform_console_calls_dev_ast_for_test("console.bogus(x);", false).is_none());
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        let src = r#"let s = "console.log(x)";"#;
        assert!(transform_console_calls_dev_ast_for_test(src, false).is_none());
    }

    #[test]
    fn rewrites_inside_template_literal_expression() {
        let src = "let s = `${console.log(x)}`;";
        let out = transform_console_calls_dev_ast_for_test(src, false).unwrap();
        assert_eq!(
            out,
            "let s = `${console.log(...$.log_if_contains_state('log', x))}`;"
        );
    }

    #[test]
    fn nested_console_calls() {
        let src = "console.log(console.warn(x));";
        let out = transform_console_calls_dev_ast_for_test(src, false).unwrap();
        // Both wraps: inner first, then outer wraps the rewritten inner.
        assert_eq!(
            out,
            "console.log(...$.log_if_contains_state('log', console.warn(...$.log_if_contains_state('warn', x))));"
        );
    }

    #[test]
    fn ts_source_type_works() {
        let src = "let x: number = 1; console.log(x);";
        let out = transform_console_calls_dev_ast_for_test(src, true).unwrap();
        assert!(out.contains("$.log_if_contains_state('log', x)"));
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(transform_console_calls_dev_ast_for_test("console.log(", false).is_none());
    }

    #[test]
    fn no_op_without_console_keyword() {
        assert!(transform_console_calls_dev_ast_for_test("let x = 1;", false).is_none());
    }

    #[test]
    fn skips_spread_with_other_identifier() {
        // `console.log(...args)` where `args` isn't `$$args` should
        // still wrap — could be reactive.
        let out = transform_console_calls_dev_ast_for_test("console.log(...args);", false).unwrap();
        assert_eq!(
            out,
            "console.log(...$.log_if_contains_state('log', ...args));"
        );
    }
}
