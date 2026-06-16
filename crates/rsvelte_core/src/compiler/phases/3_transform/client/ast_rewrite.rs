//! Shared driver for the `*_ast.rs` collect-and-splice rewrite passes.
//!
//! Every `transform_*_ast` pass in this directory follows the same shape:
//! parse the current script in a thread-local arena, walk the AST with a
//! bespoke `Visit` collector that records `(start, end, replacement)` edits,
//! then splice those edits back into the source text (innermost-first, so a
//! later fixed-point pass can rewrite an outer node once its children are
//! settled). The *only* part that differs between passes is the collector.
//!
//! This module factors out everything else — arena take/restore, parse-error
//! bail, edit splicing, and the bounded fixed-point loop — so each pass file
//! is just its probe + collector + a few lines of wiring. The helpers are
//! intentionally small and composable rather than a single mega-driver,
//! because the passes vary along independent axes (TS vs. mjs source type,
//! `allow_return_outside_function`, single-pass vs. fixed-point, whether
//! nested edits need innermost-first deferral).

use std::cell::RefCell;
use std::thread::LocalKey;

use oxc_allocator::Allocator;
use oxc_ast::ast::Program;
use oxc_parser::{ParseOptions, Parser};
use oxc_span::SourceType;

/// A single text edit: `(start, end, replacement)` over byte offsets into the
/// source the edit was collected from. Replacement text is owned so it can
/// outlive the arena the AST was parsed into.
pub type Edit = (u32, u32, String);

/// The shared bound on fixed-point iteration. Each pass strictly reduces the
/// remaining work (a rewritten node no longer matches), so real inputs settle
/// in one or two passes; the cap is a safety net against pathological nesting.
pub const MAX_FIXED_POINT_ITERS: usize = 16;

/// Parse `source` in `arena` and hand the program to `f`, restoring the arena
/// afterwards so it is reused across calls. Returns `None` (without calling
/// `f`) when the source fails to parse — a malformed intermediate is never the
/// rewrite pass's responsibility to surface, so it is left untouched.
///
/// `f` receives only `&Program`, which is enough to build an
/// [`oxc_semantic::Semantic`] in-closure when a pass needs scope information.
pub fn with_program<R>(
    arena: &'static LocalKey<RefCell<Allocator>>,
    source: &str,
    source_type: SourceType,
    parse_options: ParseOptions,
    f: impl FnOnce(&Program<'_>) -> Option<R>,
) -> Option<R> {
    arena.with(|cell| {
        let allocator = std::mem::take(&mut *cell.borrow_mut());
        let parsed = Parser::new(&allocator, source, source_type)
            .with_options(parse_options)
            .parse();
        let out = if parsed.diagnostics.is_empty() {
            f(&parsed.program)
        } else {
            None
        };
        *cell.borrow_mut() = allocator;
        out
    })
}

/// Splice `edits` into `source`, returning the rewritten text or `None` when
/// there is nothing to apply.
///
/// When `innermost_only` is set, an edit whose span strictly contains another
/// edit's span is dropped from this pass: the inner rewrite lands first and a
/// subsequent fixed-point pass re-collects the (now smaller) outer node. This
/// is what makes nested rewrites such as `a = b = 1` resolve correctly without
/// the collector having to reason about overlap. Passes whose edits provably
/// never nest pass `false` and skip the O(n²) containment check.
pub fn splice(source: &str, mut edits: Vec<Edit>, innermost_only: bool) -> Option<String> {
    if edits.is_empty() {
        return None;
    }

    if innermost_only {
        let spans: Vec<(u32, u32)> = edits.iter().map(|&(s, e, _)| (s, e)).collect();
        edits.retain(|&(s, e, _)| {
            !spans
                .iter()
                .any(|&(s2, e2)| (s2 > s && e2 <= e) || (s2 >= s && e2 < e))
        });
        if edits.is_empty() {
            return None;
        }
    }

    // Apply right-to-left so earlier offsets stay valid as we mutate.
    edits.sort_by_key(|&(start, ..)| std::cmp::Reverse(start));
    let mut out = source.to_string();
    for (start, end, replacement) in &edits {
        out.replace_range(*start as usize..*end as usize, replacement);
    }
    Some(out)
}

/// Convenience: [`with_program`] + collect + [`splice`] in one pass. The
/// collector closure returns the edits for this parse; the rest is wiring.
pub fn rewrite_once(
    arena: &'static LocalKey<RefCell<Allocator>>,
    source: &str,
    source_type: SourceType,
    parse_options: ParseOptions,
    innermost_only: bool,
    collect: impl FnOnce(&Program<'_>) -> Vec<Edit>,
) -> Option<String> {
    with_program(arena, source, source_type, parse_options, |program| {
        splice(source, collect(program), innermost_only)
    })
}

/// Drive `pass` to a fixed point, capped at [`MAX_FIXED_POINT_ITERS`]. Returns
/// `Some(rewritten)` if at least one pass changed the source, `None` if the
/// very first pass was already a no-op. Each call to `pass` re-parses the
/// previous output, which is how outer nodes pick up their rewritten children.
pub fn fixed_point(source: &str, mut pass: impl FnMut(&str) -> Option<String>) -> Option<String> {
    let mut current = pass(source)?;
    for _ in 1..MAX_FIXED_POINT_ITERS {
        match pass(&current) {
            Some(next) => current = next,
            None => break,
        }
    }
    Some(current)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn splice_empty_is_none() {
        assert!(splice("abc", vec![], false).is_none());
    }

    #[test]
    fn splice_applies_right_to_left() {
        // Two non-overlapping edits; offsets must stay valid regardless of the
        // length change from the later edit.
        let edits = vec![(0, 1, "XX".to_string()), (2, 3, "Y".to_string())];
        assert_eq!(splice("abc", edits, false).unwrap(), "XXbY");
    }

    #[test]
    fn splice_innermost_only_defers_outer() {
        // Outer span (0,5) strictly contains inner (2,3): only the inner edit
        // applies this pass.
        let edits = vec![(0, 5, "OUTER".to_string()), (2, 3, "I".to_string())];
        assert_eq!(splice("abcde", edits, true).unwrap(), "abIde");
    }

    #[test]
    fn splice_innermost_only_keeps_disjoint() {
        let edits = vec![(0, 1, "X".to_string()), (2, 3, "Y".to_string())];
        assert_eq!(splice("abc", edits, true).unwrap(), "XbY");
    }

    #[test]
    fn fixed_point_returns_none_when_first_pass_noop() {
        assert!(fixed_point("x", |_| None).is_none());
    }

    #[test]
    fn fixed_point_runs_until_stable() {
        // Replace the first 'a' with 'b' each pass; converges when none remain.
        let out = fixed_point("aaa", |s| {
            s.find('a').map(|i| {
                let mut t = s.to_string();
                t.replace_range(i..i + 1, "b");
                t
            })
        });
        assert_eq!(out.unwrap(), "bbb");
    }

    #[test]
    fn fixed_point_respects_iteration_cap() {
        // A pass that always reports a change stops after MAX_FIXED_POINT_ITERS
        // calls rather than looping forever.
        let mut calls = 0;
        let _ = fixed_point("x", |s| {
            calls += 1;
            Some(format!("{s}."))
        });
        assert_eq!(calls, MAX_FIXED_POINT_ITERS);
    }
}
