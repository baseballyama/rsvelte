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
    dual_run::count_parse(
        dual_run::current_or(std::panic::Location::caller().file()),
        source.len(),
    );
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
    let pass = dual_run::current_or(std::panic::Location::caller().file());
    dual_run::in_path(dual_run::Path::Ast, || {
        dual_run::count_parse(pass, source.len());
        arena.with(|cell| {
            let allocator = std::mem::take(&mut *cell.borrow_mut());
            let mut parsed = Parser::new(&allocator, source, source_type)
                .with_options(parse_options)
                .parse();
            let out = if parsed.diagnostics.is_empty() && f(&allocator, &mut parsed.program) {
                let mut printed = rsvelte_esrap::print(&parsed.program, source);
                dual_run::count_print(pass, printed.len());
                keep_fragment_termination(source, &mut printed);
                (printed != source).then_some(printed)
            } else {
                None
            };
            *cell.borrow_mut() = allocator;
            out
        })
    })
}

/// Drop the terminator the printer adds to a fragment that did not carry one.
///
/// Phase-3 hands these passes a fragment, not a program, and the caller owns
/// whatever follows it — for an unterminated fragment the caller appends the
/// `;` itself. Splicing preserved that because it never rewrote bytes outside
/// an edit span; printing a throwaway `Program` terminates every statement, so
/// the fragment comes back with a `;` its caller then doubles.
///
/// This has to be decided per input rather than per call site: a single call
/// site is reached through several outer callers, and terminated and
/// unterminated fragments both arrive there, so no static per-site declaration
/// can express the convention.
///
/// The contract has a second half: the fragment must also bind the text that
/// follows it the way the source did. Dropping the terminator is what can break
/// that — `x++` ends a statement, `$.update_prop(x)` does not — so the drop only
/// happens when the shortened fragment still parses the same way against text
/// that binds leftwards.
///
/// This does not hold on its own: a fragment that keeps its `;` here is one the
/// caller must not terminate again, which is why `reactive_transforms.rs`'s
/// `body_needs_semicolon` re-derives the terminator from the rewritten text
/// instead of the source.
fn keep_fragment_termination(source: &str, printed: &mut String) {
    if !printed.ends_with(';') || source.trim_end().ends_with(';') {
        return;
    }
    let shortened = &printed[..printed.len() - 1];
    let before = statements_with_following_text(source);
    if before != statements_with_following_text(shortened) {
        return;
    }
    printed.truncate(printed.len() - 1);
    dual_run::count_termination(before.is_none());
}

/// How many statements a fragment is once text follows it, or `None` when the
/// fragment does not stand alone (a class-member body, say).
///
/// This is the second half of the fragment contract, and it has to be parsed
/// rather than eyeballed from the last byte: a trailing `}` ends the statement
/// when it closes a block but not when it closes an object literal, and both
/// readings produce valid JavaScript, so nothing downstream can catch a wrong
/// guess. The probe suffixes are the ones that bind leftwards.
fn statements_with_following_text(fragment: &str) -> Option<Vec<usize>> {
    ["(c)", "[c]", "`t`"]
        .into_iter()
        .map(|suffix| {
            let source = format!("{fragment}\n{suffix}");
            let allocator = Allocator::default();
            let parsed = Parser::new(&allocator, &source, SourceType::mjs()).parse();
            parsed
                .diagnostics
                .is_empty()
                .then(|| parsed.program.body.len())
        })
        .collect()
}

/// Class wrapper for method-body fragments that Phase-3 hands around without
/// their enclosing `class`, and the indentation the printer puts every member
/// of that wrapper behind.
const CLASS_FRAGMENT_PREFIX: &str = "class _Dummy_ {\n";
const CLASS_FRAGMENT_INDENT: &str = "\t";

/// [`with_program_mut`] for a source that may only parse as class members — a
/// method body extracted without its enclosing `class`. The wrapper is added
/// before parsing and taken back off the printed text, so the caller both sees
/// and returns the fragment it passed in.
///
/// `f` additionally receives the text the program's spans index into, which is
/// the wrapped copy whenever the bare parse failed.
#[track_caller]
pub fn with_class_fragment_program_mut(
    arena: &'static LocalKey<RefCell<Allocator>>,
    source: &str,
    parse_options: ParseOptions,
    f: impl for<'p> FnOnce(&'p Allocator, &mut Program<'p>, &str) -> bool,
) -> Option<String> {
    let pass = dual_run::current_or(std::panic::Location::caller().file());
    dual_run::in_path(dual_run::Path::Ast, || {
        dual_run::count_parse(pass, source.len());
        arena.with(|cell| {
            let allocator = std::mem::take(&mut *cell.borrow_mut());
            let out = (|| {
                let bare = Parser::new(&allocator, source, SourceType::mjs())
                    .with_options(parse_options)
                    .parse();
                let wrapped_source;
                let (mut parsed, parse_str, wrapped) = if bare.diagnostics.is_empty() {
                    (bare, source, false)
                } else {
                    wrapped_source = format!("{CLASS_FRAGMENT_PREFIX}{source}\n}}");
                    dual_run::count_parse(pass, wrapped_source.len());
                    let ret = Parser::new(&allocator, &wrapped_source, SourceType::mjs())
                        .with_options(parse_options)
                        .parse();
                    if !ret.diagnostics.is_empty() {
                        return None;
                    }
                    (ret, wrapped_source.as_str(), true)
                };
                if !f(&allocator, &mut parsed.program, parse_str) {
                    return None;
                }
                // `unwrap_class_fragment` strips exactly one level of the
                // printer's indentation, so `CLASS_FRAGMENT_INDENT` has to stay
                // equal to the printer's — which is what it is set to.
                let printed = rsvelte_esrap::print(&parsed.program, parse_str);
                dual_run::count_print(pass, printed.len());
                let mut printed = if wrapped {
                    unwrap_class_fragment(&printed)?
                } else {
                    printed
                };
                keep_fragment_termination(source, &mut printed);
                (printed != source).then_some(printed)
            })();
            *cell.borrow_mut() = allocator;
            out
        })
    })
}

/// Undo [`CLASS_FRAGMENT_PREFIX`]: drop the synthetic class's header and closing
/// brace, and pull every member back out of the level of indentation the printer
/// put it behind, so the result nests where the input did.
fn unwrap_class_fragment(printed: &str) -> Option<String> {
    let body = printed
        .strip_prefix(CLASS_FRAGMENT_PREFIX)?
        .trim_end()
        .strip_suffix('}')?
        .trim_end_matches('\n');
    let mut out = String::with_capacity(body.len());
    for (i, line) in body.split('\n').enumerate() {
        if i > 0 {
            out.push('\n');
        }
        out.push_str(line.strip_prefix(CLASS_FRAGMENT_INDENT).unwrap_or(line));
    }
    Some(out)
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
    // One full copy of the source, then per edit the tail `replace_range`
    // shifts — the byte traffic an in-place rewrite does not pay.
    let mut moved = source.len() as u64;
    for (start, end, replacement) in &edits {
        moved += (out.len() - *end as usize) as u64;
        out.replace_range(*start as usize..*end as usize, replacement);
    }
    dual_run::count_splice(pass, edits.len(), moved);
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

    /// The text path is unreachable in production now, so nothing else walks it:
    /// without this it could stop working and only say so the first time someone
    /// needs the fallback.
    #[test]
    fn a_pass_falls_back_to_the_text_path_when_the_in_place_path_declines() {
        assert!(
            dual_run::prefer_in_place(),
            "RSVELTE_AST_SPLICE must not be set while running the tests"
        );
        let out = dual_run::resolve(
            "fallback:test",
            "x = 1",
            || Some("SPLICED".to_string()),
            || None,
        );
        assert_eq!(out.as_deref(), Some("SPLICED"));
    }

    #[test]
    fn the_in_place_result_is_what_a_pass_returns_when_there_is_one() {
        let out = dual_run::resolve(
            "fallback:test",
            "x = 1",
            || Some("SPLICED".to_string()),
            || Some("IN_PLACE".to_string()),
        );
        assert_eq!(out.as_deref(), Some("IN_PLACE"));
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
/// "mutate the shared `Program` in place". Most of the two sides' raw output
/// differs for reasons that do not matter — the splice version returns the
/// original text with holes replaced, the in-place version is printed by esrap,
/// and esrap normalises. So equivalence is judged after putting BOTH sides
/// through esrap exactly once: `normalize(spliced) == print(mutated)`. That is
/// the property the final pipeline actually needs, because it prints the
/// mutated program with esrap too.
///
/// But normalisation is not free of consequence: it also cancels differences
/// that the *callers* of these passes can see, because a pass returns a
/// fragment that is spliced back into a larger text. So the raw bytes are
/// counted too, as their own class, and a report that gives a mismatch count
/// without the raw-diff count beside it is not a report on this migration.
///
/// That basis is only sound if esrap normalisation is idempotent — otherwise
/// `normalize` would keep moving and comparing across it would be meaningless.
/// [`dual_run::check_normalize_idempotent`] asserts that on every real pass
/// output when `RSVELTE_AST_DUAL_RUN=1`, so the assumption is measured on the
/// corpus before any pass depends on it.
pub mod dual_run {
    use super::*;
    use std::cell::RefCell as StdRefCell;
    use std::sync::LazyLock;

    static ENABLED: LazyLock<bool> =
        LazyLock::new(|| std::env::var_os("RSVELTE_AST_DUAL_RUN").is_some());

    static PREFER_IN_PLACE: LazyLock<bool> =
        LazyLock::new(|| std::env::var_os("RSVELTE_AST_SPLICE").is_none());

    /// How many differing runs per pass and class to dump both sides of. A bare
    /// count says a port differs but not how, and the two sides are far too
    /// large to print in full for every fixture.
    static DUMP: LazyLock<u32> = LazyLock::new(|| {
        std::env::var("RSVELTE_AST_DUAL_RUN_DUMP")
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or(0)
    });

    thread_local! {
        static DUMPED: StdRefCell<Vec<(&'static str, &'static str, u32)>> =
            const { StdRefCell::new(Vec::new()) };
    }

    /// Show the raw bytes both paths produced for a run that did not match byte
    /// for byte. The sides shown are unnormalised on purpose: a run whose two
    /// sides differ only in what esrap cancels still needs classifying, and the
    /// normalised text of such a run is identical and so shows nothing.
    fn dump(
        pass: &'static str,
        kind: &'static str,
        sides: [&'static str; 2],
        source: &str,
        left: &str,
        right: &str,
    ) {
        let budget = *DUMP;
        if budget == 0 {
            return;
        }
        let seen = DUMPED.with(|d| {
            let mut d = d.borrow_mut();
            match d
                .iter_mut()
                .find(|(name, class, _)| *name == pass && *class == kind)
            {
                Some(entry) => {
                    entry.2 += 1;
                    entry.2
                }
                None => {
                    d.push((pass, kind, 1));
                    1
                }
            }
        });
        if seen > budget {
            return;
        }
        eprintln!("=== {pass} {kind} #{seen} ===");
        eprintln!("--- input ---\n{source}");
        eprintln!("--- {} ---\n{left}", sides[0]);
        eprintln!("--- {} ---\n{right}", sides[1]);
    }

    thread_local! {
        static TALLY: StdRefCell<Vec<Entry>> = const { StdRefCell::new(Vec::new()) };
    }

    /// `(pass, runs, raw diffs, mismatches, unverified)`. `raw diffs` counts
    /// every run whose two sides differed byte for byte, so `mismatches` and
    /// `unverified` are both subsets of it: a run can only reach normalisation
    /// after the raw bytes have already disagreed.
    pub type Entry = (&'static str, u32, u32, u32, u32);

    /// What one scored run established about a pass.
    enum Verdict {
        /// The two sides are the same bytes. Nothing was cancelled to get
        /// there, so this is the only verdict that says the port is faithful
        /// down to the terminators and the statement-versus-expression shape.
        RawMatch,
        /// The raw bytes differ but normalising both sides makes them equal.
        /// Not a mismatch, and not a clean port either — whatever esrap cancels
        /// here is a real difference this gate is structurally blind to, so it
        /// is counted separately instead of being folded into a match.
        NormalizedMatch,
        Mismatch,
        /// The comparison never happened — normalisation could not read one or
        /// both sides. Kept apart from the matches because a no-op satisfies
        /// "no mismatch" just as well as a faithful port does.
        Unverified,
    }

    impl Verdict {
        fn label(&self) -> &'static str {
            match self {
                Verdict::RawMatch => "raw match",
                Verdict::NormalizedMatch => "raw diff",
                Verdict::Mismatch => "mismatch",
                Verdict::Unverified => "unverified",
            }
        }
    }

    fn record(pass: &'static str, verdict: &Verdict) {
        let raw_diff = u32::from(!matches!(verdict, Verdict::RawMatch));
        let mismatch = u32::from(matches!(verdict, Verdict::Mismatch));
        let unverified = u32::from(matches!(verdict, Verdict::Unverified));
        TALLY.with(|t| {
            let mut t = t.borrow_mut();
            match t.iter_mut().find(|(name, ..)| *name == pass) {
                Some(entry) => {
                    entry.1 += 1;
                    entry.2 += raw_diff;
                    entry.3 += mismatch;
                    entry.4 += unverified;
                }
                None => t.push((pass, 1, raw_diff, mismatch, unverified)),
            }
        });
    }

    #[inline]
    pub fn enabled() -> bool {
        *ENABLED
    }

    thread_local! {
        /// `(terminators dropped, of those the ones the gate could not check)`.
        ///
        /// Whether dropping a terminator changed what follows is not counted:
        /// the drop only happens when it does not, so that answer is fixed at
        /// zero and counting it would only re-parse what the gate just parsed.
        /// How often the gate had nothing to compare is not fixed — a fragment
        /// that does not stand alone parses to `None` on both sides, which the
        /// gate reads as agreement and drops on — so that stays.
        static TERMINATION: std::cell::Cell<(u32, u32)> =
            const { std::cell::Cell::new((0, 0)) };
    }

    /// Record one dropped terminator, and whether the gate had two parses to
    /// compare or two `None`s. The caller passes what it already parsed.
    pub(super) fn count_termination(unchecked: bool) {
        TERMINATION.with(|t| {
            let (pops, unverifiable) = t.get();
            t.set((pops + 1, unverifiable + u32::from(unchecked)));
        });
    }

    /// `(terminators dropped, of those the ones the gate could not check)`. The
    /// first is the denominator; the second says how much of it the gate's
    /// check could not speak for.
    pub fn termination_counts() -> (u32, u32) {
        TERMINATION.with(std::cell::Cell::get)
    }

    /// Whether a ported pass returns its in-place result instead of the spliced
    /// one. On by default: the in-place path is the production path, and
    /// `RSVELTE_AST_SPLICE` puts the text path back so a divergence found in the
    /// field can be attributed without a rebuild.
    #[inline]
    pub fn prefer_in_place() -> bool {
        *PREFER_IN_PLACE
    }

    /// Run a ported pass and decide which result it returns.
    ///
    /// The text path stays as the fallback: a fragment the in-place path cannot
    /// parse on its own — a class-member body, say, which is not a program —
    /// still has to be rewritten, and dropping the rewrite there would lose it
    /// silently. `None` does not distinguish "could not parse" from "nothing to
    /// rewrite", so the fallback also covers the second, which is the harmless
    /// direction: the text path is the behaviour being replaced.
    ///
    /// Under the gate both paths run whatever the flip says, because the gate
    /// exists to compare them.
    pub fn resolve(
        pass: &'static str,
        source: &str,
        spliced: impl FnOnce() -> Option<String>,
        in_place: impl FnOnce() -> Option<String>,
    ) -> Option<String> {
        if enabled() {
            let spliced = spliced();
            let in_place = in_place();
            compare_pass(pass, source, spliced.as_deref(), in_place.as_deref());
            return if prefer_in_place() {
                in_place.or(spliced)
            } else {
                spliced
            };
        }
        if !prefer_in_place() {
            return spliced();
        }
        in_place().or_else(spliced)
    }

    /// Which implementation of a pass did the work being counted.
    #[derive(Clone, Copy, PartialEq, Eq)]
    pub enum Path {
        /// The collect-and-splice text path being replaced.
        Text,
        /// The in-place `&mut Program` path replacing it.
        Ast,
    }

    /// Deterministic per-pass work counters, in units that do not move with
    /// machine load: how many times each path parsed, rebuilt or printed a
    /// script, and how many bytes it copied doing so.
    ///
    /// `moved_bytes` is what a splice costs in byte traffic — one full copy of
    /// the source plus, per edit, the tail that `replace_range` shifts. It is a
    /// lower bound on the text path's total: the replacement strings each pass
    /// formats before splicing are not counted here.
    #[derive(Default, Clone, Copy)]
    pub struct Work {
        pub parses: u32,
        pub parsed_bytes: u64,
        pub splices: u32,
        pub edits: u32,
        pub moved_bytes: u64,
        pub prints: u32,
        pub printed_bytes: u64,
    }

    thread_local! {
        static WORK: StdRefCell<Vec<(&'static str, [Work; 2])>> =
            const { StdRefCell::new(Vec::new()) };
        static PATH: std::cell::Cell<Path> = const { std::cell::Cell::new(Path::Text) };
        /// Set while the harness itself is parsing and printing, so normalising
        /// the two sides of a comparison is not billed to the pass under test.
        static HARNESS: std::cell::Cell<bool> = const { std::cell::Cell::new(false) };
    }

    fn with_work(pass: &'static str, f: impl FnOnce(&mut Work)) {
        if !enabled() || HARNESS.with(std::cell::Cell::get) {
            return;
        }
        let slot = PATH.with(std::cell::Cell::get) as usize;
        WORK.with(|w| {
            let mut w = w.borrow_mut();
            match w.iter_mut().find(|(name, _)| *name == pass) {
                Some(entry) => f(&mut entry.1[slot]),
                None => {
                    let mut fresh = [Work::default(), Work::default()];
                    f(&mut fresh[slot]);
                    w.push((pass, fresh));
                }
            }
        });
    }

    /// Attribute everything `f` does to `path`, restoring the previous
    /// attribution afterwards so a nested parse inside an in-place rewrite is
    /// not billed to the text path it is replacing.
    pub fn in_path<R>(path: Path, f: impl FnOnce() -> R) -> R {
        let previous = PATH.with(|p| p.replace(path));
        let out = f();
        PATH.with(|p| p.set(previous));
        out
    }

    /// Suppress work accounting for the duration of `f`.
    fn in_harness<R>(f: impl FnOnce() -> R) -> R {
        let previous = HARNESS.with(|h| h.replace(true));
        let out = f();
        HARNESS.with(|h| h.set(previous));
        out
    }

    /// One rebuilt script: `edits` replacements applied over `moved` bytes.
    #[inline]
    pub fn count_splice(pass: &'static str, edits: usize, moved: u64) {
        with_work(pass, |w| {
            w.splices += 1;
            w.edits += edits as u32;
            w.moved_bytes += moved;
        });
    }

    /// One printed script of `len` bytes.
    #[inline]
    pub fn count_print(pass: &'static str, len: usize) {
        with_work(pass, |w| {
            w.prints += 1;
            w.printed_bytes += len as u64;
        });
    }

    /// `(pass, text-path work, in-place work)` for this thread, by parse count.
    pub fn work() -> Vec<(&'static str, Work, Work)> {
        WORK.with(|w| {
            let mut v: Vec<_> = w
                .borrow()
                .iter()
                .map(|&(name, [text, ast])| (name, text, ast))
                .collect();
            v.sort_by_key(|(_, text, ast)| std::cmp::Reverse(text.parses + ast.parses));
            v
        })
    }

    // `#[track_caller]` on the driver entry points names the pass by its own
    // source file, so no call site needs a pass-name parameter.
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

    /// One driver-helper entry — i.e. one re-parse of an intermediate script of
    /// `len` bytes.
    #[inline]
    pub fn count_parse(pass: &'static str, len: usize) {
        with_work(pass, |w| {
            w.parses += 1;
            w.parsed_bytes += len as u64;
        });
    }

    /// `(pass, re-parses)` for this thread, most-run first.
    pub fn parses_by_pass() -> Vec<(&'static str, u32)> {
        let mut v: Vec<_> = work()
            .into_iter()
            .map(|(name, text, ast)| (name, text.parses + ast.parses))
            .collect();
        v.sort_by_key(|&(_, n)| std::cmp::Reverse(n));
        v
    }

    pub fn parses() -> u32 {
        work()
            .iter()
            .map(|(_, text, ast)| text.parses + ast.parses)
            .sum()
    }

    thread_local! {
        static NORMALIZE_ARENA: RefCell<Allocator> = RefCell::new(Allocator::default());
    }

    /// How `normalize` managed to read a fragment. Part of the compared value:
    /// two sides that needed different shapes to parse did different things,
    /// even when the printed text coincides.
    #[derive(PartialEq, Eq, Debug)]
    pub enum Shape {
        /// Parses as a module on its own.
        Bare,
        /// Only parses as class members, so it is a method-body fragment
        /// extracted without its enclosing `class`.
        ClassBody,
    }

    /// Class wrapper for fragments that Phase-3 passes hand around without
    /// their enclosing `class`, mirroring what those passes parse with.
    const CLASS_PREFIX: &str = "class _Dummy_ {\n";

    fn print_normalized(source: &str) -> Option<String> {
        in_harness(|| print_normalized_inner(source))
    }

    fn print_normalized_inner(source: &str) -> Option<String> {
        with_program(
            &NORMALIZE_ARENA,
            source,
            SourceType::mjs(),
            ParseOptions {
                allow_return_outside_function: true,
                ..ParseOptions::default()
            },
            |program| Some(rsvelte_esrap::print(program, source)),
        )
    }

    /// `esrap(parse(source))` — the single normalisation both sides of a
    /// comparison pass through. `None` when `source` reads in neither shape,
    /// which is not a verdict but an admission that nothing was established.
    pub fn normalize(source: &str) -> Option<(Shape, String)> {
        if let Some(printed) = print_normalized(source) {
            return Some((Shape::Bare, printed));
        }
        let wrapped = format!("{CLASS_PREFIX}{source}\n}}");
        print_normalized(&wrapped).map(|printed| (Shape::ClassBody, printed))
    }

    /// Record whether esrap normalisation is a fixed point for `output`.
    ///
    /// Counts one run for `pass`, and one mismatch if normalising twice differs
    /// from normalising once. A failure here dumps its two normalisations under
    /// `RSVELTE_AST_DUAL_RUN_DUMP` for the same reason a failed port does: the
    /// count says the normaliser moved, not what it moved.
    pub fn check_normalize_idempotent(pass: &'static str, output: &str) {
        if !enabled() {
            return;
        }
        let verdict = match normalize(output) {
            None => Verdict::Unverified,
            // A wrapped fragment prints as a whole class, which then reads bare,
            // so only the text can be a fixed point here — not the shape.
            Some((_, once)) => match normalize(&once) {
                Some((_, twice)) if twice == once => Verdict::RawMatch,
                twice => {
                    dump(
                        pass,
                        "normalise not a fixed point",
                        ["normalised once", "normalised twice"],
                        output,
                        &once,
                        twice.as_ref().map_or("<did not read>", |(_, text)| text),
                    );
                    Verdict::Mismatch
                }
            },
        };
        record(pass, &verdict);
    }

    /// Score a ported pass: does the `&mut Program` path land where the splice
    /// path lands? The raw bytes are compared first, and only a run whose sides
    /// already differ is put through [`normalize`] once each to say whether the
    /// difference survives esrap. Counts one run, one raw diff whenever the
    /// bytes differ at all, and one mismatch when the difference survives
    /// normalisation — including when one side produced a rewrite and the other
    /// did not.
    ///
    /// Comparing only the normalised sides would report a clean port for any
    /// difference esrap cancels, which is not a class this migration may ignore:
    /// these passes rewrite *fragments*, and whether a fragment comes back as a
    /// statement or an expression is exactly the kind of thing normalisation
    /// hides while the caller splicing it back in does not.
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
        // Both sides declining to rewrite says nothing about whether the port
        // is faithful, and counting those would bury the runs that do.
        if spliced.is_none() && ast.is_none() {
            return;
        }
        // A side that did not rewrite stands for the source it left alone.
        let raw_left = spliced.unwrap_or(source);
        let raw_right = ast.unwrap_or(source);
        if raw_left == raw_right {
            record(pass, &Verdict::RawMatch);
            return;
        }
        let left = spliced.map_or_else(|| normalize(source), normalize);
        let right = ast.map_or_else(|| normalize(source), normalize);
        let verdict = match (&left, &right) {
            (Some(l), Some(r)) if l == r => Verdict::NormalizedMatch,
            // Only one side reaching an AST is itself a disagreement.
            (Some(_), Some(_)) | (Some(_), None) | (None, Some(_)) => Verdict::Mismatch,
            // Nothing was compared, so nothing was established.
            (None, None) => Verdict::Unverified,
        };
        dump(
            pass,
            verdict.label(),
            ["spliced", "in place"],
            source,
            raw_left,
            raw_right,
        );
        record(pass, &verdict);
    }

    /// `(pass, runs, raw diffs, mismatches, unverified)` for this thread, by run
    /// count.
    pub fn tally() -> Vec<Entry> {
        TALLY.with(|t| {
            let mut v = t.borrow().clone();
            v.sort_by_key(|&(_, runs, ..)| std::cmp::Reverse(runs));
            v
        })
    }

    pub fn reset() {
        TALLY.with(|t| t.borrow_mut().clear());
        WORK.with(|w| w.borrow_mut().clear());
    }
}
