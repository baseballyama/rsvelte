//! Blank-line handling between markup siblings and around the document
//! root's `<script>` / `<style>` blocks, matching prettier-plugin-svelte /
//! oxfmt: a single blank line is kept between siblings and where markup abuts
//! a root `<script>` / `<style>`; runs of blank lines collapse to one; and
//! leading/trailing blanks just inside an element are removed.

use rsvelte_formatter::{FormatOptions, format};

fn fmt(src: &str) -> String {
    format(src, &FormatOptions::default()).expect("format ok")
}

#[test]
fn keeps_blank_line_between_script_and_markup() {
    let src = "<script>\n  let x = 1;\n</script>\n\n<div>{x}</div>\n";
    assert_eq!(fmt(src), src);
}

#[test]
fn collapses_multiple_blank_lines_after_script_to_one() {
    let src = "<script>\n  let x = 1;\n</script>\n\n\n<div>{x}</div>\n";
    let want = "<script>\n  let x = 1;\n</script>\n\n<div>{x}</div>\n";
    assert_eq!(fmt(src), want);
}

#[test]
fn keeps_blank_line_before_style() {
    let src = "<div>x</div>\n\n<style>\n  .a {\n    color: red;\n  }\n</style>\n";
    assert_eq!(fmt(src), src);
}

#[test]
fn comment_glued_to_style_keeps_no_blank_between_comment_and_style() {
    // A comment that immediately precedes `<style>` (no blank line between the
    // `-->` and the tag) is the style's leading comment: the blank line goes
    // *before* the comment, not between it and `<style>`. Regression for the
    // section-reorder pass treating the whole markup gap (incl. the trailing
    // comment) as one unit and inserting a blank before `<style>` (#1166).
    let src =
        "<div>x</div>\n\n<!-- keep me glued -->\n<style>\n  .a {\n    color: red;\n  }\n</style>\n";
    assert_eq!(fmt(src), src);
}

#[test]
fn comment_glued_to_style_is_idempotent() {
    let src = "<div>x</div>\n\n<!-- c -->\n<style>\n  .a {\n    color: red;\n  }\n</style>\n";
    let once = fmt(src);
    assert_eq!(fmt(&once), once, "comment-before-style not idempotent");
}

#[test]
fn keeps_single_blank_line_between_siblings() {
    let src = "<div>a</div>\n\n<div>b</div>\n";
    assert_eq!(fmt(src), src);
}

#[test]
fn collapses_double_blank_between_siblings() {
    let src = "<div>a</div>\n\n\n<div>b</div>\n";
    let want = "<div>a</div>\n\n<div>b</div>\n";
    assert_eq!(fmt(src), want);
}

#[test]
fn strips_leading_blank_inside_element() {
    let src = "<div>\n\n  <span>x</span>\n</div>\n";
    let want = "<div>\n  <span>x</span>\n</div>\n";
    assert_eq!(fmt(src), want);
}

#[test]
fn strips_trailing_blank_inside_element() {
    let src = "<div>\n  <span>x</span>\n\n</div>\n";
    let want = "<div>\n  <span>x</span>\n</div>\n";
    assert_eq!(fmt(src), want);
}

#[test]
fn blank_line_handling_is_idempotent() {
    let src = "<script>\n  let x = 1;\n</script>\n\n\n<div>a</div>\n\n\n<div>b</div>\n";
    let once = fmt(src);
    let twice = fmt(&once);
    assert_eq!(once, twice, "blank-line normalization is not idempotent");
}

// ─────────────────────────────────────────────────────────────────────────
// A section that sits BETWEEN two markup runs is hoisted out, and the two
// runs rejoin. The gap that decides whether a blank line survives that join
// is the source's gap AFTER the section — not before it, and not the gap in
// the already-formatted output, which an earlier pass has normalised to a
// blank line either way.
//
// Every expectation below is the `oxfmt(svelte: true)` oracle's measured
// output for that exact input (oxfmt@0.64.0, `fmt-corpus.oxfmtrc.json`).
// ─────────────────────────────────────────────────────────────────────────

#[test]
fn hoisted_script_carries_the_blank_line_that_followed_it() {
    let src = "<div></div>\n<script>\n\tlet a = 1;\n</script>\n\n<button>x</button>\n";
    let want = "<script>\n  let a = 1;\n</script>\n\n<div></div>\n\n<button>x</button>\n";
    assert_eq!(fmt(src), want);
}

#[test]
fn the_corpus_repro_leads_the_hoisted_script_with_a_comment() {
    // The id the corpus gate scored NEW:
    // `pattern/issues/leading-comment-ignore-stops-at-a-non-comment-sibling.svelte`.
    // Same firing shape as the test above, but the markup run it leaves behind
    // opens with a comment — the one form the hand-written cases did not carry.
    let src = "<!-- svelte-ignore non_reactive_update -->\n<div></div>\n<script>\n\tlet runes = $state(0);\n\tlet noisy;\n\tnoisy = 0;\n</script>\n\n<button onclick={() => (runes = noisy += 1)}>{noisy}</button>\n";
    let want = "<script>\n  let runes = $state(0);\n  let noisy;\n  noisy = 0;\n</script>\n\n<!-- svelte-ignore non_reactive_update -->\n<div></div>\n\n<button onclick={() => (runes = noisy += 1)}>{noisy}</button>\n";
    assert_eq!(fmt(src), want);
}

#[test]
fn hoisted_script_with_no_blank_after_it_rejoins_on_one_newline() {
    // The control for the test above: same shape, blank line removed.
    let src = "<div></div>\n<script>\n\tlet a = 1;\n</script>\n<button>x</button>\n";
    let want = "<script>\n  let a = 1;\n</script>\n\n<div></div>\n<button>x</button>\n";
    assert_eq!(fmt(src), want);
}

#[test]
fn a_blank_line_before_the_hoisted_script_does_not_rejoin_the_runs() {
    // The deciding gap is the one after the section, so this stays one newline.
    let src = "<div></div>\n\n<script>\n\tlet a = 1;\n</script>\n<button>x</button>\n";
    let want = "<script>\n  let a = 1;\n</script>\n\n<div></div>\n<button>x</button>\n";
    assert_eq!(fmt(src), want);
}

#[test]
fn blank_lines_on_both_sides_of_a_hoisted_script_collapse_to_one() {
    let src = "<div></div>\n\n<script>\n\tlet a = 1;\n</script>\n\n<button>x</button>\n";
    let want = "<script>\n  let a = 1;\n</script>\n\n<div></div>\n\n<button>x</button>\n";
    assert_eq!(fmt(src), want);
}

#[test]
fn two_blank_lines_after_a_hoisted_script_collapse_to_one() {
    let src = "<div></div>\n<script>\n\tlet a = 1;\n</script>\n\n\n<button>x</button>\n";
    let want = "<script>\n  let a = 1;\n</script>\n\n<div></div>\n\n<button>x</button>\n";
    assert_eq!(fmt(src), want);
}

#[test]
fn a_hoisted_style_between_markup_runs_answers_the_same_way() {
    // The CSS body is written already-formatted: `FormatOptions::default()`
    // has no `style_formatter`, so a `<style>` body survives verbatim here
    // while the CLI reindents it — an axis this test is not about.
    let src = "<div></div>\n<style>\n  p {\n    color: red;\n  }\n</style>\n\n<button>x</button>\n";
    let want =
        "<div></div>\n\n<button>x</button>\n\n<style>\n  p {\n    color: red;\n  }\n</style>\n";
    assert_eq!(fmt(src), want);
}

#[test]
fn two_adjacent_sections_answer_from_the_gap_after_the_last_one() {
    let src = "<div></div>\n<script context=\"module\">\n\tlet m = 1;\n</script>\n\
               <script>\n\tlet a = 1;\n</script>\n<button>x</button>\n";
    let want = "<script context=\"module\">\n  let m = 1;\n</script>\n\n\
                <script>\n  let a = 1;\n</script>\n\n<div></div>\n<button>x</button>\n";
    assert_eq!(fmt(src), want);
}

#[test]
fn each_join_of_three_markup_runs_answers_from_its_own_gap() {
    let src = "<div></div>\n<script>\n\tlet a = 1;\n</script>\n\n<button>x</button>\n\
               <style>\n  p {\n    color: red;\n  }\n</style>\n\n<span>y</span>\n";
    let want = "<script>\n  let a = 1;\n</script>\n\n<div></div>\n\n<button>x</button>\n\n\
                <span>y</span>\n\n<style>\n  p {\n    color: red;\n  }\n</style>\n";
    assert_eq!(fmt(src), want);
}

#[test]
fn a_leading_comment_run_travels_with_the_markup_it_precedes() {
    // The `compatibility/pattern-corpus` repro that made the corpus see this.
    let src = "<!-- svelte-ignore non_reactive_update -->\n<div></div>\n\
               <script>\n\tlet runes = $state(0);\n\tlet noisy;\n\tnoisy = 0;\n</script>\n\n\
               <button onclick={() => (runes = noisy += 1)}>{noisy}</button>\n";
    let want = "<script>\n  let runes = $state(0);\n  let noisy;\n  noisy = 0;\n</script>\n\n\
                <!-- svelte-ignore non_reactive_update -->\n<div></div>\n\n\
                <button onclick={() => (runes = noisy += 1)}>{noisy}</button>\n";
    assert_eq!(fmt(src), want);
}
