//! AST-based dev-mode `console.METHOD(args)` →
//! `console.METHOD(...$.log_if_contains_state("METHOD", args))`
//! wrapping for module scripts (`.svelte.js` / `.svelte.ts`).
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
//! * All arguments are simple literals (numbers, strings, booleans,
//!   `null`, `undefined`) — wrapping them adds noise without value.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::ParseOptions;
use oxc_span::{GetSpan, SourceType};

use super::ast_rewrite::{self, Edit};

thread_local! {
    static MODULE_CONSOLE_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

const CONSOLE_METHODS: &[&str] = &[
    "debug",
    "dir",
    "error",
    "group",
    "groupCollapsed",
    "info",
    "log",
    "trace",
    "warn",
];

/// AST-based `console.METHOD(args)` wrapping. Returns `None` if no
/// `console.` text appears, the source fails to parse, or no call
/// site needs wrapping.
pub fn transform_console_calls_dev_ast(source: &str, is_ts: bool) -> Option<String> {
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
            if is_ts {
                SourceType::ts().with_module(true)
            } else {
                SourceType::mjs()
            },
            ParseOptions::default(),
            false,
            |program| collect_console_edits(program, src),
        )
    })
}

/// Collect leaf `console.METHOD(args)` wraps (calls whose arguments
/// hold no unwrapped nested console call) from a single parse. Nested
/// cases resolve across fixed-point iterations — the standalone
/// `transform_console_calls_dev_ast` loop and the batched module
/// dev-tail driver both drive that loop.
pub(super) fn collect_console_edits(program: &Program<'_>, source: &str) -> Vec<Edit> {
    let mut collector = ConsoleCollector {
        source,
        replacements: Vec::new(),
    };
    collector.visit_program(program);
    collector.replacements
}

struct ConsoleCollector<'src> {
    source: &'src str,
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

        // If every argument is a "simple literal" (string / number /
        // boolean / null / undefined / void 0), wrapping is pure
        // noise — the runtime check would always return false.
        if call.arguments.iter().all(is_simple_literal_arg) {
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

        let rewrite = format!(
            "console.{}(...$.log_if_contains_state(\"{}\", {}))",
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

/// Mirror of `props_transforms::is_simple_literal` for AST args.
/// Simple = the result is a primitive known at parse time, with no
/// reactive references possible.
fn is_simple_literal_arg(arg: &Argument<'_>) -> bool {
    match arg {
        Argument::SpreadElement(_) => false, // could spread a reactive proxy
        _ => {
            // Argument is a wrapper around Expression — convert.
            let Some(expr) = arg.as_expression() else {
                return false;
            };
            is_simple_literal_expr(expr)
        }
    }
}

fn is_simple_literal_expr(expr: &Expression<'_>) -> bool {
    match expr {
        Expression::StringLiteral(_)
        | Expression::NumericLiteral(_)
        | Expression::BooleanLiteral(_)
        | Expression::NullLiteral(_)
        | Expression::BigIntLiteral(_) => true,
        // `undefined` is technically an Identifier, but only in
        // global scope. The text predecessor counted it as simple, so
        // mirror that.
        Expression::Identifier(id) if id.name == "undefined" => true,
        // `void 0` etc.
        Expression::UnaryExpression(u)
            if u.operator == oxc_syntax::operator::UnaryOperator::Void =>
        {
            true
        }
        Expression::TemplateLiteral(t) if t.expressions.is_empty() => true,
        _ => false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn wraps_console_log_with_identifier() {
        let out = transform_console_calls_dev_ast("console.log(x);", false).unwrap();
        assert_eq!(out, "console.log(...$.log_if_contains_state(\"log\", x));");
    }

    #[test]
    fn wraps_each_known_method() {
        for method in CONSOLE_METHODS {
            let src = format!("console.{}(x);", method);
            let out = transform_console_calls_dev_ast(&src, false).unwrap();
            let expected = format!(
                "console.{}(...$.log_if_contains_state(\"{}\", x));",
                method, method
            );
            assert_eq!(out, expected, "method {method}");
        }
    }

    #[test]
    fn skips_empty_args() {
        assert!(transform_console_calls_dev_ast("console.log();", false).is_none());
    }

    #[test]
    fn skips_default_inspect_callback() {
        // The shape `(...$$args) => console.log(...$$args)` is
        // emitted by $.inspect's default callback.
        let src = "(...$$args) => console.log(...$$args)";
        assert!(transform_console_calls_dev_ast(src, false).is_none());
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
                transform_console_calls_dev_ast(src, false).is_none(),
                "should skip: {src}"
            );
        }
    }

    #[test]
    fn wraps_mixed_literal_and_identifier() {
        let out = transform_console_calls_dev_ast(r#"console.log("x:", x);"#, false).unwrap();
        assert_eq!(
            out,
            r#"console.log(...$.log_if_contains_state("log", "x:", x));"#
        );
    }

    #[test]
    fn skips_non_console_methods() {
        // `console.bogus(x)` isn't one of the recognised methods.
        assert!(transform_console_calls_dev_ast("console.bogus(x);", false).is_none());
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        let src = r#"let s = "console.log(x)";"#;
        assert!(transform_console_calls_dev_ast(src, false).is_none());
    }

    #[test]
    fn rewrites_inside_template_literal_expression() {
        let src = "let s = `${console.log(x)}`;";
        let out = transform_console_calls_dev_ast(src, false).unwrap();
        assert_eq!(
            out,
            "let s = `${console.log(...$.log_if_contains_state(\"log\", x))}`;"
        );
    }

    #[test]
    fn nested_console_calls() {
        let src = "console.log(console.warn(x));";
        let out = transform_console_calls_dev_ast(src, false).unwrap();
        // Both wraps: inner first, then outer wraps the rewritten inner.
        assert_eq!(
            out,
            "console.log(...$.log_if_contains_state(\"log\", console.warn(...$.log_if_contains_state(\"warn\", x))));"
        );
    }

    #[test]
    fn ts_source_type_works() {
        let src = "let x: number = 1; console.log(x);";
        let out = transform_console_calls_dev_ast(src, true).unwrap();
        assert!(out.contains("$.log_if_contains_state(\"log\", x)"));
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(transform_console_calls_dev_ast("console.log(", false).is_none());
    }

    #[test]
    fn no_op_without_console_keyword() {
        assert!(transform_console_calls_dev_ast("let x = 1;", false).is_none());
    }

    #[test]
    fn skips_spread_with_other_identifier() {
        // `console.log(...args)` where `args` isn't `$$args` should
        // still wrap — could be reactive.
        let out = transform_console_calls_dev_ast("console.log(...args);", false).unwrap();
        assert_eq!(
            out,
            "console.log(...$.log_if_contains_state(\"log\", ...args));"
        );
    }
}
