//! Drop the redundant parentheses that wrap a rune call.
//!
//! acorn builds no `ParenthesizedExpression`, so upstream's `get_rune` sees
//! `($state(1))` and `$state(1)` as the same node. oxc parses with
//! `preserve_parens: true`, so every rsvelte decision point — the AST ones and
//! the source scans alike — sees a node/shape it does not recognise and leaves
//! the rune name in the output. Normalising the source once, before any of them
//! run, is what makes the two agree; the parens are pure grouping around a call,
//! so removing them can never change what the program means.

use oxc_allocator::Allocator;
use oxc_ast::ast::{Expression, NewExpression};
use oxc_ast_visit::{Visit, walk};
use oxc_parser::Parser;
use oxc_span::{GetSpan, SourceType};

use crate::compiler::phases::phase2_analyze::visitors::shared::function::is_rune;

/// Cap on the re-run that catches a rune paren nested inside another one's
/// argument. Every pass strictly shortens the source, so real inputs settle in
/// one or two.
const MAX_PASSES: usize = 8;

/// Remove the parentheses wrapping every rune call in `src`. Returns `None` when
/// nothing is removed — including a parse failure, so a caller mid-pipeline
/// keeps text that is not yet valid on its own exactly as it was.
pub fn strip_rune_parens(src: &str) -> Option<String> {
    let mut current: Option<String> = None;
    for _ in 0..MAX_PASSES {
        let text = current.as_deref().unwrap_or(src);
        match strip_once(text) {
            Some(next) => current = Some(next),
            None => break,
        }
    }
    current
}

fn strip_once(src: &str) -> Option<String> {
    if !may_have_rune_parens(src) {
        return None;
    }
    let allocator = Allocator::default();
    // A component's instance script reaches phase 3 already TypeScript-stripped,
    // but a `<script lang="ts">` whose stripping was declined still carries type
    // syntax, so the JS parse is only the first of two attempts.
    let mut collector = Collector { spans: Vec::new() };
    let mut parsed = false;
    for source_type in [SourceType::mjs(), SourceType::ts()] {
        let ret = Parser::new(&allocator, src, source_type).parse();
        if ret.diagnostics.is_empty() {
            collector.visit_program(&ret.program);
            parsed = true;
            break;
        }
    }
    if !parsed {
        return None;
    }
    if collector.spans.is_empty() {
        return None;
    }
    let mut out = String::with_capacity(src.len());
    let mut cursor = 0usize;
    for (start, end) in collector.spans {
        if start < cursor {
            continue;
        }
        out.push_str(&src[cursor..start]);
        // Keep the interior verbatim apart from its padding: a comment inside the
        // parens is one upstream still prints, and the surrounding whitespace is
        // what the source scans downstream expect to have already been trimmed.
        out.push_str(src[start + 1..end - 1].trim());
        cursor = end;
    }
    out.push_str(&src[cursor..]);
    Some(out)
}

/// The identifier a rune keypath starts with. A `$`-prefixed name that is not
/// one of these can never head a rune call, which is what keeps the precondition
/// below off the store subscriptions (`f($count)`) that fill legacy scripts.
const RUNE_HEADS: &[&str] = &[
    "$state",
    "$derived",
    "$props",
    "$bindable",
    "$effect",
    "$inspect",
    "$host",
];

/// Cheap precondition: an `(` whose next significant token heads a rune call.
/// Deliberately allows a call argument (`f($state.snapshot(v))`), which the
/// parse then rejects — the point is only to keep the parse off scripts that
/// cannot contain the shape at all.
fn may_have_rune_parens(src: &str) -> bool {
    let bytes = src.as_bytes();
    let mut i = 0usize;
    while i < bytes.len() {
        if bytes[i] != b'(' {
            i += 1;
            continue;
        }
        let mut j = i + 1;
        loop {
            while j < bytes.len() && bytes[j].is_ascii_whitespace() {
                j += 1;
            }
            if j + 1 < bytes.len() && bytes[j] == b'/' && bytes[j + 1] == b'/' {
                while j < bytes.len() && bytes[j] != b'\n' {
                    j += 1;
                }
                continue;
            }
            if j + 1 < bytes.len() && bytes[j] == b'/' && bytes[j + 1] == b'*' {
                j += 2;
                while j + 1 < bytes.len() && !(bytes[j] == b'*' && bytes[j + 1] == b'/') {
                    j += 1;
                }
                j = (j + 2).min(bytes.len());
                continue;
            }
            break;
        }
        if bytes.get(j) == Some(&b'$') {
            let mut k = j + 1;
            while k < bytes.len() && (bytes[k].is_ascii_alphanumeric() || bytes[k] == b'_') {
                k += 1;
            }
            if RUNE_HEADS.contains(&&src[j..k]) && matches!(bytes.get(k), Some(b'(') | Some(b'.')) {
                return true;
            }
        }
        i += 1;
    }
    false
}

/// The outermost, non-overlapping parenthesis spans that wrap a rune call.
struct Collector {
    spans: Vec<(usize, usize)>,
}

impl<'a> Visit<'a> for Collector {
    fn visit_expression(&mut self, expr: &Expression<'a>) {
        if let Expression::ParenthesizedExpression(paren) = expr
            && wraps_rune_call(&paren.expression)
        {
            let span = paren.span();
            self.spans.push((span.start as usize, span.end as usize));
            // Keep walking the interior: a rune inside this one's arguments is a
            // separate span, and a later pass would find it anyway.
        }
        walk::walk_expression(self, expr);
    }

    fn visit_new_expression(&mut self, it: &NewExpression<'a>) {
        // `new (f(1))()` is not `new f(1)()`, so the callee's parens are load
        // bearing. The arguments are ordinary expression positions.
        for arg in &it.arguments {
            self.visit_argument(arg);
        }
        if let Some(type_arguments) = &it.type_arguments {
            self.visit_ts_type_parameter_instantiation(type_arguments);
        }
    }
}

/// Is `expr` — after any further parentheses — a rune call?
fn wraps_rune_call(expr: &Expression<'_>) -> bool {
    match expr {
        Expression::ParenthesizedExpression(inner) => wraps_rune_call(&inner.expression),
        Expression::CallExpression(call) => {
            rune_keypath(&call.callee).is_some_and(|path| is_rune(&path))
        }
        _ => false,
    }
}

/// Port of upstream `get_global_keypath` (`phases/scope.js`), minus the binding
/// lookup: a shadowed rune name still makes the parentheses redundant, so the
/// scope is irrelevant to this decision.
fn rune_keypath(callee: &Expression<'_>) -> Option<String> {
    let mut node = callee;
    let mut joined = String::new();
    while let Expression::StaticMemberExpression(member) = node {
        joined.insert_str(0, member.property.name.as_str());
        joined.insert(0, '.');
        node = &member.object;
    }
    if let Expression::CallExpression(call) = node
        && let Expression::Identifier(id) = &call.callee
    {
        joined.insert_str(0, "()");
        return Some(format!("{}{}", id.name.as_str(), joined));
    }
    let Expression::Identifier(id) = node else {
        return None;
    };
    Some(format!("{}{}", id.name.as_str(), joined))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn strip(src: &str) -> Option<String> {
        strip_rune_parens(src)
    }

    #[test]
    fn removes_the_parens_around_a_declarator_initializer() {
        assert_eq!(strip("let v = ($state(1));").unwrap(), "let v = $state(1);");
        assert_eq!(
            strip("let v = (($state(1)));").unwrap(),
            "let v = $state(1);"
        );
        assert_eq!(
            strip("let v = (   $state(1)   );").unwrap(),
            "let v = $state(1);"
        );
    }

    #[test]
    fn keeps_an_interior_comment() {
        assert_eq!(
            strip("let v = (/*c*/ $state(1));").unwrap(),
            "let v = /*c*/ $state(1);"
        );
    }

    #[test]
    fn reaches_every_rune_keypath() {
        assert_eq!(
            strip("let v = ($state.raw(1));").unwrap(),
            "let v = $state.raw(1);"
        );
        assert_eq!(
            strip("let v = ($derived.by(() => 1));").unwrap(),
            "let v = $derived.by(() => 1);"
        );
        assert_eq!(
            strip("const i = ($props.id());").unwrap(),
            "const i = $props.id();"
        );
        assert_eq!(
            strip("let { a = ($bindable(1)) } = $props();").unwrap(),
            "let { a = $bindable(1) } = $props();"
        );
        assert_eq!(strip("($inspect(a));").unwrap(), "$inspect(a);");
        assert_eq!(
            strip("($inspect(a).with(f));").unwrap(),
            "$inspect(a).with(f);"
        );
        assert_eq!(
            strip("class K { f = ($state(1)); }").unwrap(),
            "class K { f = $state(1); }"
        );
    }

    #[test]
    fn leaves_a_non_rune_call_alone() {
        assert!(strip("let v = (plain(1));").is_none());
        assert!(strip("let v = (a, b);").is_none());
        assert!(strip("let v = ($state);").is_none());
    }

    #[test]
    fn leaves_a_new_callee_alone() {
        // `new ($state(1))()` and `new $state(1)()` are different programs.
        assert!(strip("let v = new ($state(1))();").is_none());
    }

    #[test]
    fn the_precondition_ignores_a_store_subscription() {
        // `f($count)` fills legacy scripts; paying a parse for each one would be
        // the whole cost of this pass on code that cannot contain the shape.
        assert!(!may_have_rune_parens("f($count); g(  $count  );"));
        assert!(may_have_rune_parens("let v = ($state(1));"));
        assert!(may_have_rune_parens("let v = (  $derived.by(f)  );"));
    }

    #[test]
    fn an_unparseable_script_reports_nothing() {
        assert!(strip("let v = ($state(1);").is_none());
    }
}
