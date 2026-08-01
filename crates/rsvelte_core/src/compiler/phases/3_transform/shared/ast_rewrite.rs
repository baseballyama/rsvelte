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
#[track_caller]
pub fn with_program<R>(
    arena: &'static LocalKey<RefCell<Allocator>>,
    source: &str,
    source_type: SourceType,
    parse_options: ParseOptions,
    f: impl FnOnce(&Program<'_>) -> Option<R>,
) -> Option<R> {
    dual_run::count_parse(dual_run::current_or(std::panic::Location::caller().file()));
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

/// Parse `source`, hand the program to `f` for in-place mutation, and print the
/// result. `f` returns whether it changed anything; `None` comes back when it
/// did not, when the source fails to parse, or when the printed form is byte-
/// identical to the input — the same "nothing to report" contract the splice
/// helpers use.
///
/// This is the port target for the collect-and-splice passes. Mutating in place
/// removes the reason `splice`'s `innermost_only` exists: a pass that moves an
/// existing subtree into a new wrapper composes with an inner rewrite for free,
/// as long as it visits children before rewriting their parent.
///
/// `f` also receives the allocator the program lives in, because a replacement
/// is not always built from subtrees of that program: a pass that splices in
/// caller-supplied source (`invalidate_bodies`, for one) has to parse it into
/// the same arena before it can be moved into place.
#[track_caller]
pub fn with_program_mut(
    arena: &'static LocalKey<RefCell<Allocator>>,
    source: &str,
    source_type: SourceType,
    parse_options: ParseOptions,
    f: impl for<'p> FnOnce(&'p Allocator, &mut Program<'p>) -> bool,
) -> Option<String> {
    dual_run::count_parse(dual_run::current_or(std::panic::Location::caller().file()));
    arena.with(|cell| {
        let allocator = std::mem::take(&mut *cell.borrow_mut());
        let mut parsed = Parser::new(&allocator, source, source_type)
            .with_options(parse_options)
            .parse();
        let out = if parsed.diagnostics.is_empty() && f(&allocator, &mut parsed.program) {
            let printed = rsvelte_esrap::print(&parsed.program, source);
            (printed != source).then_some(printed)
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
#[track_caller]
pub fn splice(source: &str, edits: Vec<Edit>, innermost_only: bool) -> Option<String> {
    splice_with_deferred(source, edits, innermost_only).map(|(rewritten, _)| rewritten)
}

/// [`splice`] plus whether an outer edit was deferred by `innermost_only`.
///
/// A caller whose collector finds every target in the current AST, and whose
/// replacements cannot create fresh targets, may stop after this pass when the
/// returned flag is `false` instead of re-parsing only to confirm a no-op.
#[track_caller]
pub fn splice_with_deferred(
    source: &str,
    mut edits: Vec<Edit>,
    innermost_only: bool,
) -> Option<(String, bool)> {
    let pass = dual_run::current_or(std::panic::Location::caller().file());
    if edits.is_empty() {
        return None;
    }

    let mut deferred = false;
    if innermost_only {
        let edit_count = edits.len();
        let spans: Vec<(u32, u32)> = edits.iter().map(|&(s, e, _)| (s, e)).collect();
        edits.retain(|&(s, e, _)| {
            !spans
                .iter()
                .any(|&(s2, e2)| (s2 > s && e2 <= e) || (s2 >= s && e2 < e))
        });
        deferred = edits.len() != edit_count;
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
    dual_run::check_normalize_idempotent(pass, &out);
    Some((out, deferred))
}

/// Convenience: [`with_program`] + collect + [`splice`] in one pass. The
/// collector closure returns the edits for this parse; the rest is wiring.
#[track_caller]
pub fn rewrite_once(
    arena: &'static LocalKey<RefCell<Allocator>>,
    source: &str,
    source_type: SourceType,
    parse_options: ParseOptions,
    innermost_only: bool,
    collect: impl FnOnce(&Program<'_>) -> Vec<Edit>,
) -> Option<String> {
    let _pass =
        dual_run::PassGuard::enter(dual_run::pass_of(std::panic::Location::caller().file()));
    with_program(arena, source, source_type, parse_options, |program| {
        splice(source, collect(program), innermost_only)
    })
}

/// Run several collectors against a *single* parse of `source`, unioning their
/// edits before one splice, then drive that to a fixed point. This folds a group
/// of passes that share a source type and parse options — and whose edits target
/// disjoint syntax — into one parse per iteration instead of one parse per pass.
///
/// `collect` receives the parsed program and the exact text it was parsed from
/// (so span-derived slices stay valid), and returns the union of every grouped
/// pass's edits. Splicing uses `innermost_only` + the fixed-point loop so the
/// rare case of one pass's target nested inside another's — which a single flat
/// splice cannot represent — still resolves exactly as the equivalent sequential
/// per-pass application would: the inner edit lands this iteration, the next one
/// re-parses and re-collects the now-settled outer node.
pub fn rewrite_batched(
    arena: &'static LocalKey<RefCell<Allocator>>,
    source: &str,
    source_type: SourceType,
    parse_options: ParseOptions,
    mut collect: impl FnMut(&Program<'_>, &str) -> Vec<Edit>,
) -> Option<String> {
    fixed_point(source, |current| {
        with_program(arena, current, source_type, parse_options, |program| {
            splice(current, collect(program, current), true)
        })
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

/// Drive `pass` only while its previous splice deferred an overlapping edit.
///
/// This is narrower than [`fixed_point`]: callers must guarantee that a pass
/// without deferred edits has exhausted every target in the rewritten source.
pub fn fixed_point_while_deferred(
    source: &str,
    mut pass: impl FnMut(&str) -> Option<(String, bool)>,
) -> Option<String> {
    let (mut current, mut deferred) = pass(source)?;
    for _ in 1..MAX_FIXED_POINT_ITERS {
        if !deferred {
            break;
        }
        match pass(&current) {
            Some((next, next_deferred)) => {
                current = next;
                deferred = next_deferred;
            }
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
    fn splice_reports_deferred_outer_edit() {
        let edits = vec![(0, 5, "OUTER".to_string()), (2, 3, "I".to_string())];
        assert_eq!(
            splice_with_deferred("abcde", edits, true),
            Some(("abIde".to_string(), true))
        );
    }

    #[test]
    fn splice_reports_no_deferred_disjoint_edit() {
        let edits = vec![(0, 1, "X".to_string()), (2, 3, "Y".to_string())];
        assert_eq!(
            splice_with_deferred("abc", edits, true),
            Some(("XbY".to_string(), false))
        );
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

    #[test]
    fn fixed_point_while_deferred_stops_without_confirmation_pass() {
        let mut calls = 0;
        let out = fixed_point_while_deferred("x", |_| {
            calls += 1;
            Some(("y".to_string(), false))
        });
        assert_eq!(out.as_deref(), Some("y"));
        assert_eq!(calls, 1);
    }

    #[test]
    fn fixed_point_while_deferred_runs_required_follow_up() {
        let mut calls = 0;
        let out = fixed_point_while_deferred("x", |_| {
            calls += 1;
            Some((calls.to_string(), calls == 1))
        });
        assert_eq!(out.as_deref(), Some("2"));
        assert_eq!(calls, 2);
    }

    #[test]
    fn fixed_point_while_deferred_returns_none_for_initial_noop() {
        let mut calls = 0;
        let out = fixed_point_while_deferred("x", |_| {
            calls += 1;
            None
        });
        assert_eq!(out, None);
        assert_eq!(calls, 1);
    }
}

/// Equivalence checking for the migration of these passes off text splicing.
///
/// A pass is being rewritten from "collect edits, splice the source" to
/// "mutate the shared `Program` in place". The two cannot be compared by their
/// raw output — the splice version returns the original text with holes
/// replaced, the in-place version is printed by esrap, and esrap normalises.
/// So equivalence is judged after putting BOTH sides through esrap exactly
/// once: `normalize(spliced) == print(mutated)`. That is the property the
/// final pipeline actually needs, because it prints the mutated program with
/// esrap too.
///
/// That basis is only sound if esrap normalisation is idempotent — otherwise
/// `normalize` would keep moving and comparing across it would be meaningless.
/// [`check_normalize_idempotent`] asserts that on every real pass output when
/// `RSVELTE_AST_DUAL_RUN=1`, so the assumption is measured on the corpus
/// before any pass depends on it.
pub mod dual_run {
    use super::*;
    use std::cell::RefCell as StdRefCell;
    use std::sync::LazyLock;

    static ENABLED: LazyLock<bool> =
        LazyLock::new(|| std::env::var_os("RSVELTE_AST_DUAL_RUN").is_some());

    thread_local! {
        static TALLY: StdRefCell<Vec<(&'static str, u32, u32)>> =
            const { StdRefCell::new(Vec::new()) };
    }

    #[inline]
    pub fn enabled() -> bool {
        *ENABLED
    }

    thread_local! {
        static PARSES: std::cell::Cell<u32> = const { std::cell::Cell::new(0) };
        static PARSE_BY_PASS: StdRefCell<Vec<(&'static str, u32)>> =
            const { StdRefCell::new(Vec::new()) };
    }

    /// The pass a call came from, named by its source file (`state_reads_ast`).
    /// `#[track_caller]` on the driver entry points makes this the pass file
    /// rather than this module, with no signature churn across 37 call sites.
    thread_local! {
        static CURRENT: std::cell::Cell<Option<&'static str>> =
            const { std::cell::Cell::new(None) };
    }

    /// Pin `pass` as the originating pass for the duration of the guard, so a
    /// driver helper calling another driver helper does not re-attribute the
    /// work to `ast_rewrite` itself.
    pub struct PassGuard(Option<&'static str>);

    impl PassGuard {
        pub fn enter(pass: &'static str) -> Self {
            PassGuard(CURRENT.with(|c| c.replace(Some(pass))))
        }
    }

    impl Drop for PassGuard {
        fn drop(&mut self) {
            CURRENT.with(|c| c.set(self.0));
        }
    }

    /// The pinned pass, falling back to `file`'s own name.
    pub fn current_or(file: &'static str) -> &'static str {
        CURRENT
            .with(std::cell::Cell::get)
            .unwrap_or_else(|| pass_of(file))
    }

    pub fn pass_of(file: &'static str) -> &'static str {
        file.rsplit('/')
            .next()
            .and_then(|f| f.strip_suffix(".rs"))
            .unwrap_or(file)
    }

    /// One `with_program` entry — i.e. one re-parse of an intermediate script.
    #[inline]
    pub fn count_parse(pass: &'static str) {
        if !enabled() {
            return;
        }
        PARSES.with(|c| c.set(c.get() + 1));
        PARSE_BY_PASS.with(|t| {
            let mut t = t.borrow_mut();
            match t.iter_mut().find(|(name, _)| *name == pass) {
                Some(entry) => entry.1 += 1,
                None => t.push((pass, 1)),
            }
        });
    }

    /// `(pass, re-parses)` for this thread, most-run first.
    pub fn parses_by_pass() -> Vec<(&'static str, u32)> {
        PARSE_BY_PASS.with(|t| {
            let mut v = t.borrow().clone();
            v.sort_by_key(|&(_, n)| std::cmp::Reverse(n));
            v
        })
    }

    pub fn parses() -> u32 {
        PARSES.with(std::cell::Cell::get)
    }

    thread_local! {
        static NORMALIZE_ARENA: RefCell<Allocator> = RefCell::new(Allocator::default());
    }

    /// `esrap(parse(source))` — the single normalisation both sides of a
    /// comparison pass through. `None` when `source` does not parse, which is
    /// not a verdict: an intermediate that no longer parses is the splice
    /// pipeline's own business, not evidence about the pass.
    pub fn normalize(source: &str) -> Option<String> {
        with_program(
            &NORMALIZE_ARENA,
            source,
            SourceType::mjs(),
            ParseOptions::default(),
            |program| Some(rsvelte_esrap::print(program, source)),
        )
    }

    /// Record whether esrap normalisation is a fixed point for `output`.
    ///
    /// Counts one run for `pass`, and one mismatch if normalising twice differs
    /// from normalising once.
    pub fn check_normalize_idempotent(pass: &'static str, output: &str) {
        if !enabled() {
            return;
        }
        let Some(once) = normalize(output) else {
            return;
        };
        let stable = normalize(&once).is_some_and(|twice| twice == once);
        TALLY.with(|t| {
            let mut t = t.borrow_mut();
            match t.iter_mut().find(|(name, ..)| *name == pass) {
                Some(entry) => {
                    entry.1 += 1;
                    entry.2 += u32::from(!stable);
                }
                None => t.push((pass, 1, u32::from(!stable))),
            }
        });
    }

    /// Score a ported pass: does the `&mut Program` path land where the splice
    /// path lands? Both sides go through [`normalize`] exactly once, so esrap
    /// formatting cancels and only a real difference in what the pass did shows
    /// up. Counts one run, and one mismatch when the two disagree — including
    /// when one produced a rewrite and the other did not.
    ///
    /// The two paths apply their edits in different orders (collect-then-splice
    /// versus post-order in place), so an order-sensitive pass is exactly what
    /// this is here to catch. A mismatch is a mismatch; it is never explained
    /// away as "just ordering".
    pub fn compare_pass(
        pass: &'static str,
        source: &str,
        spliced: Option<&str>,
        ast: Option<&str>,
    ) {
        if !enabled() {
            return;
        }
        let left = spliced.map_or_else(|| normalize(source), normalize);
        let right = ast.map_or_else(|| normalize(source), normalize);
        let agreed = match (left, right) {
            (Some(l), Some(r)) => l == r,
            // Neither side parsing is not a disagreement about the rewrite.
            (None, None) => true,
            _ => false,
        };
        TALLY.with(|t| {
            let mut t = t.borrow_mut();
            match t.iter_mut().find(|(name, ..)| *name == pass) {
                Some(entry) => {
                    entry.1 += 1;
                    entry.2 += u32::from(!agreed);
                }
                None => t.push((pass, 1, u32::from(!agreed))),
            }
        });
    }

    /// `(pass, runs, mismatches)` for this thread, sorted by run count.
    pub fn tally() -> Vec<(&'static str, u32, u32)> {
        TALLY.with(|t| {
            let mut v = t.borrow().clone();
            v.sort_by_key(|&(_, runs, _)| std::cmp::Reverse(runs));
            v
        })
    }

    pub fn reset() {
        TALLY.with(|t| t.borrow_mut().clear());
    }
}
