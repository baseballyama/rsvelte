//! `<svelte:options>` validation, gridded against the official compiler
//! (issues #3324, #3325 and #3290).
//!
//! Upstream splits this across three points that rsvelte had collapsed into one
//! parse-time function, so the *order* the checks run in was observable — and
//! wrong in opposite directions for the two structural checks:
//!
//! 1. `1-parse/state/element.js` L155-165 — `svelte_meta_duplicate` /
//!    `svelte_meta_invalid_placement`, decided from the parser stack while the
//!    tag name is being read, so they precede everything the element's own
//!    attributes or children can raise.
//! 2. `1-parse/index.js` L164 — `read_options`, run once the **whole template**
//!    has been parsed, which is where every attribute-value error comes from.
//! 3. `1-parse/index.js` L166 — `disallow_children`, run *after* `read_options`.
//!
//! Every row was measured on the official compiler in a fresh process (upstream's
//! `deprecate()` warns once per process, so a shared one measures nothing after
//! the first cell) and is asserted on `(code, message, start, end)` for an error
//! and on the full `(code, start, end)` shape for a warning.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

#[derive(Debug, PartialEq, Eq)]
enum Expect {
    /// Compiles, emitting these `(code, start, end)` warnings in order.
    Ok(&'static [(&'static str, usize, usize)]),
    /// Rejected with this `(code, message, span)`.
    Err(&'static str, &'static str, (u32, u32)),
    /// Rejected with this `(code, message)` and **no position at all** upstream:
    /// the object form of `customElement` hands `validate_tag` the `[name,
    /// value]` pair rather than the attribute node, so `e()` throws with
    /// `start`/`end` undefined. rsvelte deliberately keeps the attribute's span,
    /// which is strictly more useful (#3325, "Also observed, not an rsvelte
    /// defect"), so only the code and the message are compared here.
    ErrUnpositioned(&'static str, &'static str),
}

type Observed = Result<Vec<(String, usize, usize)>, (String, String, Option<(u32, u32)>)>;

fn observed(src: &str, generate: GenerateMode) -> Observed {
    match compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate,
            dev: false,
            ..Default::default()
        },
    ) {
        Ok(result) => Ok(result
            .warnings
            .into_iter()
            .map(|w| {
                let at = |p: Option<rsvelte_core::compiler::Position>| {
                    p.map(|p| p.character).unwrap_or(usize::MAX)
                };
                (w.code, at(w.start), at(w.end))
            })
            .collect()),
        Err(err) => {
            let d = err.diagnostic();
            Err((d.code.unwrap_or_default(), d.message, d.span))
        }
    }
}

fn check(id: &str, src: &str, expect: &Expect) {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        match (observed(src, generate), expect) {
            (Ok(warnings), Expect::Ok(want)) => {
                let want: Vec<(String, usize, usize)> = want
                    .iter()
                    .map(|(c, s, e)| ((*c).to_string(), *s, *e))
                    .collect();
                assert_eq!(warnings, want, "[{id}] generate={generate:?} warnings");
            }
            (Err((code, message, span)), Expect::Err(want_code, want_message, want_span)) => {
                assert_eq!(code, *want_code, "[{id}] generate={generate:?} code");
                assert_eq!(
                    message, *want_message,
                    "[{id}] generate={generate:?} message"
                );
                assert_eq!(span, Some(*want_span), "[{id}] generate={generate:?} span");
            }
            (Err((code, message, _)), Expect::ErrUnpositioned(want_code, want_message)) => {
                assert_eq!(code, *want_code, "[{id}] generate={generate:?} code");
                assert_eq!(
                    message, *want_message,
                    "[{id}] generate={generate:?} message"
                );
            }
            (got, want) => panic!("[{id}] generate={generate:?}: got {got:?}, want {want:?}"),
        }
    }
}

/// attribute form x shape. Ids are shared with the probe that measured them.
#[rustfmt::skip]
const GRID: &[(&str, &str, Expect)] = &[
    ("runes_text_true/plain", "<svelte:options runes=\"true\" />\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 28))),
    ("runes_text_true/two_elements", "<svelte:options runes=\"true\" />\n<svelte:options runes=\"true\" />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (32, 32))),
    ("runes_text_true/with_children", "<svelte:options runes=\"true\">x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 28))),
    ("runes_text_true/whitespace_children", "<svelte:options runes=\"true\"> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 28))),
    ("runes_text_yes/plain", "<svelte:options runes=\"yes\" />\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 27))),
    ("runes_text_yes/two_elements", "<svelte:options runes=\"yes\" />\n<svelte:options runes=\"yes\" />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (31, 31))),
    ("runes_text_yes/with_children", "<svelte:options runes=\"yes\">x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 27))),
    ("runes_text_yes/whitespace_children", "<svelte:options runes=\"yes\"> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 27))),
    ("runes_num/plain", "<svelte:options runes={1} />\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 25))),
    ("runes_num/two_elements", "<svelte:options runes={1} />\n<svelte:options runes={1} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (29, 29))),
    ("runes_num/with_children", "<svelte:options runes={1}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 25))),
    ("runes_num/whitespace_children", "<svelte:options runes={1}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 25))),
    ("runes_str_expr/plain", "<svelte:options runes={\"true\"} />\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 30))),
    ("runes_str_expr/two_elements", "<svelte:options runes={\"true\"} />\n<svelte:options runes={\"true\"} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (34, 34))),
    ("runes_str_expr/with_children", "<svelte:options runes={\"true\"}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 30))),
    ("runes_str_expr/whitespace_children", "<svelte:options runes={\"true\"}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 30))),
    ("ns_bad_text/plain", "<svelte:options namespace=\"nope\" />\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be \"html\", \"mathml\" or \"svg\", if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 32))),
    ("ns_bad_text/two_elements", "<svelte:options namespace=\"nope\" />\n<svelte:options namespace=\"nope\" />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (36, 36))),
    ("ns_bad_text/with_children", "<svelte:options namespace=\"nope\">x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be \"html\", \"mathml\" or \"svg\", if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 32))),
    ("ns_bad_text/whitespace_children", "<svelte:options namespace=\"nope\"> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be \"html\", \"mathml\" or \"svg\", if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 32))),
    ("ns_num/plain", "<svelte:options namespace={1} />\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be \"html\", \"mathml\" or \"svg\", if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 29))),
    ("ns_num/two_elements", "<svelte:options namespace={1} />\n<svelte:options namespace={1} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (33, 33))),
    ("ns_num/with_children", "<svelte:options namespace={1}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be \"html\", \"mathml\" or \"svg\", if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 29))),
    ("ns_num/whitespace_children", "<svelte:options namespace={1}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be \"html\", \"mathml\" or \"svg\", if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 29))),
    ("ns_bare/plain", "<svelte:options namespace />\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be \"html\", \"mathml\" or \"svg\", if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 25))),
    ("ns_bare/two_elements", "<svelte:options namespace />\n<svelte:options namespace />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (29, 29))),
    ("ns_bare/with_children", "<svelte:options namespace>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be \"html\", \"mathml\" or \"svg\", if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 25))),
    ("ns_bare/whitespace_children", "<svelte:options namespace> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be \"html\", \"mathml\" or \"svg\", if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 25))),
    ("ns_tpl/plain", "<svelte:options namespace={`svg`} />\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be \"html\", \"mathml\" or \"svg\", if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 33))),
    ("ns_tpl/two_elements", "<svelte:options namespace={`svg`} />\n<svelte:options namespace={`svg`} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (37, 37))),
    ("ns_tpl/with_children", "<svelte:options namespace={`svg`}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be \"html\", \"mathml\" or \"svg\", if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 33))),
    ("ns_tpl/whitespace_children", "<svelte:options namespace={`svg`}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be \"html\", \"mathml\" or \"svg\", if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 33))),
    ("css_external/plain", "<svelte:options css=\"external\" />\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be \"injected\", if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 30))),
    ("css_external/two_elements", "<svelte:options css=\"external\" />\n<svelte:options css=\"external\" />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (34, 34))),
    ("css_external/with_children", "<svelte:options css=\"external\">x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be \"injected\", if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 30))),
    ("css_external/whitespace_children", "<svelte:options css=\"external\"> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be \"injected\", if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 30))),
    ("css_bare/plain", "<svelte:options css />\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be \"injected\", if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 19))),
    ("css_bare/two_elements", "<svelte:options css />\n<svelte:options css />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (23, 23))),
    ("css_bare/with_children", "<svelte:options css>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be \"injected\", if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 19))),
    ("css_bare/whitespace_children", "<svelte:options css> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be \"injected\", if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 19))),
    ("css_external_expr/plain", "<svelte:options css={\"external\"} />\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be \"injected\", if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 32))),
    ("css_external_expr/two_elements", "<svelte:options css={\"external\"} />\n<svelte:options css={\"external\"} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (36, 36))),
    ("css_external_expr/with_children", "<svelte:options css={\"external\"}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be \"injected\", if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 32))),
    ("css_external_expr/whitespace_children", "<svelte:options css={\"external\"}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be \"injected\", if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 32))),
    ("pw_text/plain", "<svelte:options preserveWhitespace=\"true\" />\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 41))),
    ("pw_text/two_elements", "<svelte:options preserveWhitespace=\"true\" />\n<svelte:options preserveWhitespace=\"true\" />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (45, 45))),
    ("pw_text/with_children", "<svelte:options preserveWhitespace=\"true\">x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 41))),
    ("pw_text/whitespace_children", "<svelte:options preserveWhitespace=\"true\"> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 41))),
    ("pw_num/plain", "<svelte:options preserveWhitespace={1} />\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 38))),
    ("pw_num/two_elements", "<svelte:options preserveWhitespace={1} />\n<svelte:options preserveWhitespace={1} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (42, 42))),
    ("pw_num/with_children", "<svelte:options preserveWhitespace={1}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 38))),
    ("pw_num/whitespace_children", "<svelte:options preserveWhitespace={1}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 38))),
    ("acc_text/plain", "<svelte:options accessors=\"true\" />\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 32))),
    ("acc_text/two_elements", "<svelte:options accessors=\"true\" />\n<svelte:options accessors=\"true\" />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (36, 36))),
    ("acc_text/with_children", "<svelte:options accessors=\"true\">x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 32))),
    ("acc_text/whitespace_children", "<svelte:options accessors=\"true\"> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 32))),
    ("acc_num/plain", "<svelte:options accessors={1} />\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 29))),
    ("acc_num/two_elements", "<svelte:options accessors={1} />\n<svelte:options accessors={1} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (33, 33))),
    ("acc_num/with_children", "<svelte:options accessors={1}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 29))),
    ("acc_num/whitespace_children", "<svelte:options accessors={1}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 29))),
    ("imm_text/plain", "<svelte:options immutable=\"true\" />\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 32))),
    ("imm_text/two_elements", "<svelte:options immutable=\"true\" />\n<svelte:options immutable=\"true\" />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (36, 36))),
    ("imm_text/with_children", "<svelte:options immutable=\"true\">x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 32))),
    ("imm_text/whitespace_children", "<svelte:options immutable=\"true\"> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 32))),
    ("imm_num/plain", "<svelte:options immutable={1} />\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 29))),
    ("imm_num/two_elements", "<svelte:options immutable={1} />\n<svelte:options immutable={1} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (33, 33))),
    ("imm_num/with_children", "<svelte:options immutable={1}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 29))),
    ("imm_num/whitespace_children", "<svelte:options immutable={1}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 29))),
    ("ce_bare/plain", "<svelte:options customElement />\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement", "\"customElement\" must be a string literal defining a valid custom element name or an object of the form { tag?: string; shadow?: \"open\" | \"none\" | `ShadowRootInit`; props?: { [key: string]: { attribute?: string; reflect?: boolean; type: .. } } }\nhttps://svelte.dev/e/svelte_options_invalid_customelement", (16, 29))),
    ("ce_bare/two_elements", "<svelte:options customElement />\n<svelte:options customElement />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (33, 33))),
    ("ce_bare/with_children", "<svelte:options customElement>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement", "\"customElement\" must be a string literal defining a valid custom element name or an object of the form { tag?: string; shadow?: \"open\" | \"none\" | `ShadowRootInit`; props?: { [key: string]: { attribute?: string; reflect?: boolean; type: .. } } }\nhttps://svelte.dev/e/svelte_options_invalid_customelement", (16, 29))),
    ("ce_bare/whitespace_children", "<svelte:options customElement> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement", "\"customElement\" must be a string literal defining a valid custom element name or an object of the form { tag?: string; shadow?: \"open\" | \"none\" | `ShadowRootInit`; props?: { [key: string]: { attribute?: string; reflect?: boolean; type: .. } } }\nhttps://svelte.dev/e/svelte_options_invalid_customelement", (16, 29))),
    ("ce_num/plain", "<svelte:options customElement={1} />\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement", "\"customElement\" must be a string literal defining a valid custom element name or an object of the form { tag?: string; shadow?: \"open\" | \"none\" | `ShadowRootInit`; props?: { [key: string]: { attribute?: string; reflect?: boolean; type: .. } } }\nhttps://svelte.dev/e/svelte_options_invalid_customelement", (16, 33))),
    ("ce_num/two_elements", "<svelte:options customElement={1} />\n<svelte:options customElement={1} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (37, 37))),
    ("ce_num/with_children", "<svelte:options customElement={1}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement", "\"customElement\" must be a string literal defining a valid custom element name or an object of the form { tag?: string; shadow?: \"open\" | \"none\" | `ShadowRootInit`; props?: { [key: string]: { attribute?: string; reflect?: boolean; type: .. } } }\nhttps://svelte.dev/e/svelte_options_invalid_customelement", (16, 33))),
    ("ce_num/whitespace_children", "<svelte:options customElement={1}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement", "\"customElement\" must be a string literal defining a valid custom element name or an object of the form { tag?: string; shadow?: \"open\" | \"none\" | `ShadowRootInit`; props?: { [key: string]: { attribute?: string; reflect?: boolean; type: .. } } }\nhttps://svelte.dev/e/svelte_options_invalid_customelement", (16, 33))),
    ("ce_str_expr/plain", "<svelte:options customElement={\"my-el\"} />\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement", "\"customElement\" must be a string literal defining a valid custom element name or an object of the form { tag?: string; shadow?: \"open\" | \"none\" | `ShadowRootInit`; props?: { [key: string]: { attribute?: string; reflect?: boolean; type: .. } } }\nhttps://svelte.dev/e/svelte_options_invalid_customelement", (16, 39))),
    ("ce_str_expr/two_elements", "<svelte:options customElement={\"my-el\"} />\n<svelte:options customElement={\"my-el\"} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (43, 43))),
    ("ce_str_expr/with_children", "<svelte:options customElement={\"my-el\"}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement", "\"customElement\" must be a string literal defining a valid custom element name or an object of the form { tag?: string; shadow?: \"open\" | \"none\" | `ShadowRootInit`; props?: { [key: string]: { attribute?: string; reflect?: boolean; type: .. } } }\nhttps://svelte.dev/e/svelte_options_invalid_customelement", (16, 39))),
    ("ce_str_expr/whitespace_children", "<svelte:options customElement={\"my-el\"}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement", "\"customElement\" must be a string literal defining a valid custom element name or an object of the form { tag?: string; shadow?: \"open\" | \"none\" | `ShadowRootInit`; props?: { [key: string]: { attribute?: string; reflect?: boolean; type: .. } } }\nhttps://svelte.dev/e/svelte_options_invalid_customelement", (16, 39))),
    ("ce_notdashed/plain", "<svelte:options customElement=\"notdashed\" />\n<p>x</p>", Expect::Err("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname", (16, 41))),
    ("ce_notdashed/two_elements", "<svelte:options customElement=\"notdashed\" />\n<svelte:options customElement=\"notdashed\" />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (45, 45))),
    ("ce_notdashed/with_children", "<svelte:options customElement=\"notdashed\">x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname", (16, 41))),
    ("ce_notdashed/whitespace_children", "<svelte:options customElement=\"notdashed\"> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname", (16, 41))),
    ("ce_obj_tag_notdashed/plain", "<svelte:options customElement={{ tag: \"notdashed\" }} />\n<p>x</p>", Expect::ErrUnpositioned("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname")),
    ("ce_obj_tag_notdashed/two_elements", "<svelte:options customElement={{ tag: \"notdashed\" }} />\n<svelte:options customElement={{ tag: \"notdashed\" }} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (56, 56))),
    ("ce_obj_tag_notdashed/with_children", "<svelte:options customElement={{ tag: \"notdashed\" }}>x</svelte:options>\n<p>x</p>", Expect::ErrUnpositioned("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname")),
    ("ce_obj_tag_notdashed/whitespace_children", "<svelte:options customElement={{ tag: \"notdashed\" }}> </svelte:options>\n<p>x</p>", Expect::ErrUnpositioned("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname")),
    ("ce_obj_tag_num/plain", "<svelte:options customElement={{ tag: 1 }} />\n<p>x</p>", Expect::ErrUnpositioned("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname")),
    ("ce_obj_tag_num/two_elements", "<svelte:options customElement={{ tag: 1 }} />\n<svelte:options customElement={{ tag: 1 }} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (46, 46))),
    ("ce_obj_tag_num/with_children", "<svelte:options customElement={{ tag: 1 }}>x</svelte:options>\n<p>x</p>", Expect::ErrUnpositioned("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname")),
    ("ce_obj_tag_num/whitespace_children", "<svelte:options customElement={{ tag: 1 }}> </svelte:options>\n<p>x</p>", Expect::ErrUnpositioned("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname")),
    ("ce_obj_shadow_bad/plain", "<svelte:options customElement={{ tag: \"my-el\", shadow: \"nope\" }} />\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement_shadow", "\"shadow\" must be either \"open\", \"none\" or `ShadowRootInit` object.\nhttps://svelte.dev/e/svelte_options_invalid_customelement_shadow", (16, 64))),
    ("ce_obj_shadow_bad/two_elements", "<svelte:options customElement={{ tag: \"my-el\", shadow: \"nope\" }} />\n<svelte:options customElement={{ tag: \"my-el\", shadow: \"nope\" }} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (68, 68))),
    ("ce_obj_shadow_bad/with_children", "<svelte:options customElement={{ tag: \"my-el\", shadow: \"nope\" }}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement_shadow", "\"shadow\" must be either \"open\", \"none\" or `ShadowRootInit` object.\nhttps://svelte.dev/e/svelte_options_invalid_customelement_shadow", (16, 64))),
    ("ce_obj_shadow_bad/whitespace_children", "<svelte:options customElement={{ tag: \"my-el\", shadow: \"nope\" }}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement_shadow", "\"shadow\" must be either \"open\", \"none\" or `ShadowRootInit` object.\nhttps://svelte.dev/e/svelte_options_invalid_customelement_shadow", (16, 64))),
    ("ce_props_type_bad/plain", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { type: \"Nope\" } } }} />\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement_props", "\"props\" must be a statically analyzable object literal of the form \"{ [key: string]: { attribute?: string; reflect?: boolean; type?: \"String\" | \"Boolean\" | \"Number\" | \"Array\" | \"Object\" }\"\nhttps://svelte.dev/e/svelte_options_invalid_customelement_props", (16, 80))),
    ("ce_props_type_bad/two_elements", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { type: \"Nope\" } } }} />\n<svelte:options customElement={{ tag: \"my-el\", props: { a: { type: \"Nope\" } } }} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (84, 84))),
    ("ce_props_type_bad/with_children", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { type: \"Nope\" } } }}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement_props", "\"props\" must be a statically analyzable object literal of the form \"{ [key: string]: { attribute?: string; reflect?: boolean; type?: \"String\" | \"Boolean\" | \"Number\" | \"Array\" | \"Object\" }\"\nhttps://svelte.dev/e/svelte_options_invalid_customelement_props", (16, 80))),
    ("ce_props_type_bad/whitespace_children", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { type: \"Nope\" } } }}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement_props", "\"props\" must be a statically analyzable object literal of the form \"{ [key: string]: { attribute?: string; reflect?: boolean; type?: \"String\" | \"Boolean\" | \"Number\" | \"Array\" | \"Object\" }\"\nhttps://svelte.dev/e/svelte_options_invalid_customelement_props", (16, 80))),
    ("ce_props_num/plain", "<svelte:options customElement={{ tag: \"my-el\", props: 1 }} />\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement_props", "\"props\" must be a statically analyzable object literal of the form \"{ [key: string]: { attribute?: string; reflect?: boolean; type?: \"String\" | \"Boolean\" | \"Number\" | \"Array\" | \"Object\" }\"\nhttps://svelte.dev/e/svelte_options_invalid_customelement_props", (16, 58))),
    ("ce_props_num/two_elements", "<svelte:options customElement={{ tag: \"my-el\", props: 1 }} />\n<svelte:options customElement={{ tag: \"my-el\", props: 1 }} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (62, 62))),
    ("ce_props_num/with_children", "<svelte:options customElement={{ tag: \"my-el\", props: 1 }}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement_props", "\"props\" must be a statically analyzable object literal of the form \"{ [key: string]: { attribute?: string; reflect?: boolean; type?: \"String\" | \"Boolean\" | \"Number\" | \"Array\" | \"Object\" }\"\nhttps://svelte.dev/e/svelte_options_invalid_customelement_props", (16, 58))),
    ("ce_props_num/whitespace_children", "<svelte:options customElement={{ tag: \"my-el\", props: 1 }}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement_props", "\"props\" must be a statically analyzable object literal of the form \"{ [key: string]: { attribute?: string; reflect?: boolean; type?: \"String\" | \"Boolean\" | \"Number\" | \"Array\" | \"Object\" }\"\nhttps://svelte.dev/e/svelte_options_invalid_customelement_props", (16, 58))),
    ("ce_props_entry_num/plain", "<svelte:options customElement={{ tag: \"my-el\", props: { a: 1 } }} />\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement_props", "\"props\" must be a statically analyzable object literal of the form \"{ [key: string]: { attribute?: string; reflect?: boolean; type?: \"String\" | \"Boolean\" | \"Number\" | \"Array\" | \"Object\" }\"\nhttps://svelte.dev/e/svelte_options_invalid_customelement_props", (16, 65))),
    ("ce_props_entry_num/two_elements", "<svelte:options customElement={{ tag: \"my-el\", props: { a: 1 } }} />\n<svelte:options customElement={{ tag: \"my-el\", props: { a: 1 } }} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (69, 69))),
    ("ce_props_entry_num/with_children", "<svelte:options customElement={{ tag: \"my-el\", props: { a: 1 } }}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement_props", "\"props\" must be a statically analyzable object literal of the form \"{ [key: string]: { attribute?: string; reflect?: boolean; type?: \"String\" | \"Boolean\" | \"Number\" | \"Array\" | \"Object\" }\"\nhttps://svelte.dev/e/svelte_options_invalid_customelement_props", (16, 65))),
    ("ce_props_entry_num/whitespace_children", "<svelte:options customElement={{ tag: \"my-el\", props: { a: 1 } }}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement_props", "\"props\" must be a statically analyzable object literal of the form \"{ [key: string]: { attribute?: string; reflect?: boolean; type?: \"String\" | \"Boolean\" | \"Number\" | \"Array\" | \"Object\" }\"\nhttps://svelte.dev/e/svelte_options_invalid_customelement_props", (16, 65))),
    ("ce_props_reflect_bad/plain", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { reflect: 1 } } }} />\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement_props", "\"props\" must be a statically analyzable object literal of the form \"{ [key: string]: { attribute?: string; reflect?: boolean; type?: \"String\" | \"Boolean\" | \"Number\" | \"Array\" | \"Object\" }\"\nhttps://svelte.dev/e/svelte_options_invalid_customelement_props", (16, 78))),
    ("ce_props_reflect_bad/two_elements", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { reflect: 1 } } }} />\n<svelte:options customElement={{ tag: \"my-el\", props: { a: { reflect: 1 } } }} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (82, 82))),
    ("ce_props_reflect_bad/with_children", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { reflect: 1 } } }}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement_props", "\"props\" must be a statically analyzable object literal of the form \"{ [key: string]: { attribute?: string; reflect?: boolean; type?: \"String\" | \"Boolean\" | \"Number\" | \"Array\" | \"Object\" }\"\nhttps://svelte.dev/e/svelte_options_invalid_customelement_props", (16, 78))),
    ("ce_props_reflect_bad/whitespace_children", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { reflect: 1 } } }}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement_props", "\"props\" must be a statically analyzable object literal of the form \"{ [key: string]: { attribute?: string; reflect?: boolean; type?: \"String\" | \"Boolean\" | \"Number\" | \"Array\" | \"Object\" }\"\nhttps://svelte.dev/e/svelte_options_invalid_customelement_props", (16, 78))),
    ("ce_props_attribute_bad/plain", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { attribute: 1 } } }} />\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement_props", "\"props\" must be a statically analyzable object literal of the form \"{ [key: string]: { attribute?: string; reflect?: boolean; type?: \"String\" | \"Boolean\" | \"Number\" | \"Array\" | \"Object\" }\"\nhttps://svelte.dev/e/svelte_options_invalid_customelement_props", (16, 80))),
    ("ce_props_attribute_bad/two_elements", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { attribute: 1 } } }} />\n<svelte:options customElement={{ tag: \"my-el\", props: { a: { attribute: 1 } } }} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (84, 84))),
    ("ce_props_attribute_bad/with_children", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { attribute: 1 } } }}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement_props", "\"props\" must be a statically analyzable object literal of the form \"{ [key: string]: { attribute?: string; reflect?: boolean; type?: \"String\" | \"Boolean\" | \"Number\" | \"Array\" | \"Object\" }\"\nhttps://svelte.dev/e/svelte_options_invalid_customelement_props", (16, 80))),
    ("ce_props_attribute_bad/whitespace_children", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { attribute: 1 } } }}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement_props", "\"props\" must be a statically analyzable object literal of the form \"{ [key: string]: { attribute?: string; reflect?: boolean; type?: \"String\" | \"Boolean\" | \"Number\" | \"Array\" | \"Object\" }\"\nhttps://svelte.dev/e/svelte_options_invalid_customelement_props", (16, 80))),
    ("ce_props_unknown_key/plain", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { nope: 1 } } }} />\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement_props", "\"props\" must be a statically analyzable object literal of the form \"{ [key: string]: { attribute?: string; reflect?: boolean; type?: \"String\" | \"Boolean\" | \"Number\" | \"Array\" | \"Object\" }\"\nhttps://svelte.dev/e/svelte_options_invalid_customelement_props", (16, 75))),
    ("ce_props_unknown_key/two_elements", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { nope: 1 } } }} />\n<svelte:options customElement={{ tag: \"my-el\", props: { a: { nope: 1 } } }} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (79, 79))),
    ("ce_props_unknown_key/with_children", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { nope: 1 } } }}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement_props", "\"props\" must be a statically analyzable object literal of the form \"{ [key: string]: { attribute?: string; reflect?: boolean; type?: \"String\" | \"Boolean\" | \"Number\" | \"Array\" | \"Object\" }\"\nhttps://svelte.dev/e/svelte_options_invalid_customelement_props", (16, 75))),
    ("ce_props_unknown_key/whitespace_children", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { nope: 1 } } }}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement_props", "\"props\" must be a statically analyzable object literal of the form \"{ [key: string]: { attribute?: string; reflect?: boolean; type?: \"String\" | \"Boolean\" | \"Number\" | \"Array\" | \"Object\" }\"\nhttps://svelte.dev/e/svelte_options_invalid_customelement_props", (16, 75))),
    ("ce_reserved/plain", "<svelte:options customElement=\"annotation-xml\" />\n<p>x</p>", Expect::Err("svelte_options_reserved_tagname", "Tag name is reserved\nhttps://svelte.dev/e/svelte_options_reserved_tagname", (16, 46))),
    ("ce_reserved/two_elements", "<svelte:options customElement=\"annotation-xml\" />\n<svelte:options customElement=\"annotation-xml\" />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (50, 50))),
    ("ce_reserved/with_children", "<svelte:options customElement=\"annotation-xml\">x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_reserved_tagname", "Tag name is reserved\nhttps://svelte.dev/e/svelte_options_reserved_tagname", (16, 46))),
    ("ce_reserved/whitespace_children", "<svelte:options customElement=\"annotation-xml\"> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_reserved_tagname", "Tag name is reserved\nhttps://svelte.dev/e/svelte_options_reserved_tagname", (16, 46))),
    ("unknown_bare/plain", "<svelte:options bogus />\n<p>x</p>", Expect::Err("svelte_options_unknown_attribute", "`<svelte:options>` unknown attribute 'bogus'\nhttps://svelte.dev/e/svelte_options_unknown_attribute", (16, 21))),
    ("unknown_bare/two_elements", "<svelte:options bogus />\n<svelte:options bogus />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (25, 25))),
    ("unknown_bare/with_children", "<svelte:options bogus>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_unknown_attribute", "`<svelte:options>` unknown attribute 'bogus'\nhttps://svelte.dev/e/svelte_options_unknown_attribute", (16, 21))),
    ("unknown_bare/whitespace_children", "<svelte:options bogus> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_unknown_attribute", "`<svelte:options>` unknown attribute 'bogus'\nhttps://svelte.dev/e/svelte_options_unknown_attribute", (16, 21))),
    ("unknown_text/plain", "<svelte:options bogus=\"x\" />\n<p>x</p>", Expect::Err("svelte_options_unknown_attribute", "`<svelte:options>` unknown attribute 'bogus'\nhttps://svelte.dev/e/svelte_options_unknown_attribute", (16, 25))),
    ("unknown_text/two_elements", "<svelte:options bogus=\"x\" />\n<svelte:options bogus=\"x\" />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (29, 29))),
    ("unknown_text/with_children", "<svelte:options bogus=\"x\">x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_unknown_attribute", "`<svelte:options>` unknown attribute 'bogus'\nhttps://svelte.dev/e/svelte_options_unknown_attribute", (16, 25))),
    ("unknown_text/whitespace_children", "<svelte:options bogus=\"x\"> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_unknown_attribute", "`<svelte:options>` unknown attribute 'bogus'\nhttps://svelte.dev/e/svelte_options_unknown_attribute", (16, 25))),
    ("tag_deprecated/plain", "<svelte:options tag=\"my-el\" />\n<p>x</p>", Expect::Err("svelte_options_deprecated_tag", "\"tag\" option is deprecated — use \"customElement\" instead\nhttps://svelte.dev/e/svelte_options_deprecated_tag", (16, 27))),
    ("tag_deprecated/two_elements", "<svelte:options tag=\"my-el\" />\n<svelte:options tag=\"my-el\" />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (31, 31))),
    ("tag_deprecated/with_children", "<svelte:options tag=\"my-el\">x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_deprecated_tag", "\"tag\" option is deprecated — use \"customElement\" instead\nhttps://svelte.dev/e/svelte_options_deprecated_tag", (16, 27))),
    ("tag_deprecated/whitespace_children", "<svelte:options tag=\"my-el\"> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_deprecated_tag", "\"tag\" option is deprecated — use \"customElement\" instead\nhttps://svelte.dev/e/svelte_options_deprecated_tag", (16, 27))),
    ("ce_obj_tag_ident/plain", "<svelte:options customElement={{ tag: someIdent }} />\n<p>x</p>", Expect::ErrUnpositioned("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname")),
    ("ce_obj_tag_ident/two_elements", "<svelte:options customElement={{ tag: someIdent }} />\n<svelte:options customElement={{ tag: someIdent }} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (54, 54))),
    ("ce_obj_tag_ident/with_children", "<svelte:options customElement={{ tag: someIdent }}>x</svelte:options>\n<p>x</p>", Expect::ErrUnpositioned("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname")),
    ("ce_obj_tag_ident/whitespace_children", "<svelte:options customElement={{ tag: someIdent }}> </svelte:options>\n<p>x</p>", Expect::ErrUnpositioned("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname")),
    ("ce_obj_tag_true/plain", "<svelte:options customElement={{ tag: true }} />\n<p>x</p>", Expect::ErrUnpositioned("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname")),
    ("ce_obj_tag_true/two_elements", "<svelte:options customElement={{ tag: true }} />\n<svelte:options customElement={{ tag: true }} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (49, 49))),
    ("ce_obj_tag_true/with_children", "<svelte:options customElement={{ tag: true }}>x</svelte:options>\n<p>x</p>", Expect::ErrUnpositioned("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname")),
    ("ce_obj_tag_true/whitespace_children", "<svelte:options customElement={{ tag: true }}> </svelte:options>\n<p>x</p>", Expect::ErrUnpositioned("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname")),
    ("ce_obj_tag_obj/plain", "<svelte:options customElement={{ tag: {} }} />\n<p>x</p>", Expect::ErrUnpositioned("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname")),
    ("ce_obj_tag_obj/two_elements", "<svelte:options customElement={{ tag: {} }} />\n<svelte:options customElement={{ tag: {} }} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (47, 47))),
    ("ce_obj_tag_obj/with_children", "<svelte:options customElement={{ tag: {} }}>x</svelte:options>\n<p>x</p>", Expect::ErrUnpositioned("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname")),
    ("ce_obj_tag_obj/whitespace_children", "<svelte:options customElement={{ tag: {} }}> </svelte:options>\n<p>x</p>", Expect::ErrUnpositioned("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname")),
    ("ce_obj_tag_null/plain", "<svelte:options customElement={{ tag: null }} />\n<p>x</p>", Expect::ErrUnpositioned("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname")),
    ("ce_obj_tag_null/two_elements", "<svelte:options customElement={{ tag: null }} />\n<svelte:options customElement={{ tag: null }} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (49, 49))),
    ("ce_obj_tag_null/with_children", "<svelte:options customElement={{ tag: null }}>x</svelte:options>\n<p>x</p>", Expect::ErrUnpositioned("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname")),
    ("ce_obj_tag_null/whitespace_children", "<svelte:options customElement={{ tag: null }}> </svelte:options>\n<p>x</p>", Expect::ErrUnpositioned("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname")),
    ("ce_tag_no_hyphen/plain", "<svelte:options customElement=\"myel\" />\n<p>x</p>", Expect::Err("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname", (16, 36))),
    ("ce_tag_no_hyphen/two_elements", "<svelte:options customElement=\"myel\" />\n<svelte:options customElement=\"myel\" />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (40, 40))),
    ("ce_tag_no_hyphen/with_children", "<svelte:options customElement=\"myel\">x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname", (16, 36))),
    ("ce_tag_no_hyphen/whitespace_children", "<svelte:options customElement=\"myel\"> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname", (16, 36))),
    ("ce_tag_upper/plain", "<svelte:options customElement=\"My-El\" />\n<p>x</p>", Expect::Err("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname", (16, 37))),
    ("ce_tag_upper/two_elements", "<svelte:options customElement=\"My-El\" />\n<svelte:options customElement=\"My-El\" />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (41, 41))),
    ("ce_tag_upper/with_children", "<svelte:options customElement=\"My-El\">x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname", (16, 37))),
    ("ce_tag_upper/whitespace_children", "<svelte:options customElement=\"My-El\"> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname", (16, 37))),
    ("ce_tag_digit_start/plain", "<svelte:options customElement=\"0-el\" />\n<p>x</p>", Expect::Err("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname", (16, 36))),
    ("ce_tag_digit_start/two_elements", "<svelte:options customElement=\"0-el\" />\n<svelte:options customElement=\"0-el\" />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (40, 40))),
    ("ce_tag_digit_start/with_children", "<svelte:options customElement=\"0-el\">x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname", (16, 36))),
    ("ce_tag_digit_start/whitespace_children", "<svelte:options customElement=\"0-el\"> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname", (16, 36))),
    ("ce_tag_mixed/plain", "<svelte:options customElement=\"my-El\" />\n<p>x</p>", Expect::Err("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname", (16, 37))),
    ("ce_tag_mixed/two_elements", "<svelte:options customElement=\"my-El\" />\n<svelte:options customElement=\"my-El\" />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (41, 41))),
    ("ce_tag_mixed/with_children", "<svelte:options customElement=\"my-El\">x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname", (16, 37))),
    ("ce_tag_mixed/whitespace_children", "<svelte:options customElement=\"my-El\"> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_tagname", "Tag name must be lowercase and hyphenated\nhttps://svelte.dev/e/svelte_options_invalid_tagname", (16, 37))),
    ("ce_obj_spread/plain", "<svelte:options customElement={{ ...x }} />\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement", "\"customElement\" must be a string literal defining a valid custom element name or an object of the form { tag?: string; shadow?: \"open\" | \"none\" | `ShadowRootInit`; props?: { [key: string]: { attribute?: string; reflect?: boolean; type: .. } } }\nhttps://svelte.dev/e/svelte_options_invalid_customelement", (16, 40))),
    ("ce_obj_spread/two_elements", "<svelte:options customElement={{ ...x }} />\n<svelte:options customElement={{ ...x }} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (44, 44))),
    ("ce_obj_spread/with_children", "<svelte:options customElement={{ ...x }}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement", "\"customElement\" must be a string literal defining a valid custom element name or an object of the form { tag?: string; shadow?: \"open\" | \"none\" | `ShadowRootInit`; props?: { [key: string]: { attribute?: string; reflect?: boolean; type: .. } } }\nhttps://svelte.dev/e/svelte_options_invalid_customelement", (16, 40))),
    ("ce_obj_spread/whitespace_children", "<svelte:options customElement={{ ...x }}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement", "\"customElement\" must be a string literal defining a valid custom element name or an object of the form { tag?: string; shadow?: \"open\" | \"none\" | `ShadowRootInit`; props?: { [key: string]: { attribute?: string; reflect?: boolean; type: .. } } }\nhttps://svelte.dev/e/svelte_options_invalid_customelement", (16, 40))),
    ("ce_obj_computed_key/plain", "<svelte:options customElement={{ [\"tag\"]: \"my-el\" }} />\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement", "\"customElement\" must be a string literal defining a valid custom element name or an object of the form { tag?: string; shadow?: \"open\" | \"none\" | `ShadowRootInit`; props?: { [key: string]: { attribute?: string; reflect?: boolean; type: .. } } }\nhttps://svelte.dev/e/svelte_options_invalid_customelement", (16, 52))),
    ("ce_obj_computed_key/two_elements", "<svelte:options customElement={{ [\"tag\"]: \"my-el\" }} />\n<svelte:options customElement={{ [\"tag\"]: \"my-el\" }} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (56, 56))),
    ("ce_obj_computed_key/with_children", "<svelte:options customElement={{ [\"tag\"]: \"my-el\" }}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement", "\"customElement\" must be a string literal defining a valid custom element name or an object of the form { tag?: string; shadow?: \"open\" | \"none\" | `ShadowRootInit`; props?: { [key: string]: { attribute?: string; reflect?: boolean; type: .. } } }\nhttps://svelte.dev/e/svelte_options_invalid_customelement", (16, 52))),
    ("ce_obj_computed_key/whitespace_children", "<svelte:options customElement={{ [\"tag\"]: \"my-el\" }}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement", "\"customElement\" must be a string literal defining a valid custom element name or an object of the form { tag?: string; shadow?: \"open\" | \"none\" | `ShadowRootInit`; props?: { [key: string]: { attribute?: string; reflect?: boolean; type: .. } } }\nhttps://svelte.dev/e/svelte_options_invalid_customelement", (16, 52))),
    ("ce_obj_shadow_ident/plain", "<svelte:options customElement={{ tag: \"my-el\", shadow: someIdent }} />\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement_shadow", "\"shadow\" must be either \"open\", \"none\" or `ShadowRootInit` object.\nhttps://svelte.dev/e/svelte_options_invalid_customelement_shadow", (16, 67))),
    ("ce_obj_shadow_ident/two_elements", "<svelte:options customElement={{ tag: \"my-el\", shadow: someIdent }} />\n<svelte:options customElement={{ tag: \"my-el\", shadow: someIdent }} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (71, 71))),
    ("ce_obj_shadow_ident/with_children", "<svelte:options customElement={{ tag: \"my-el\", shadow: someIdent }}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement_shadow", "\"shadow\" must be either \"open\", \"none\" or `ShadowRootInit` object.\nhttps://svelte.dev/e/svelte_options_invalid_customelement_shadow", (16, 67))),
    ("ce_obj_shadow_ident/whitespace_children", "<svelte:options customElement={{ tag: \"my-el\", shadow: someIdent }}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_customelement_shadow", "\"shadow\" must be either \"open\", \"none\" or `ShadowRootInit` object.\nhttps://svelte.dev/e/svelte_options_invalid_customelement_shadow", (16, 67))),
    ("spread/plain", "<svelte:options {...spread} />\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute", "`<svelte:options>` can only receive static attributes\nhttps://svelte.dev/e/svelte_options_invalid_attribute", (16, 27))),
    ("spread/two_elements", "<svelte:options {...spread} />\n<svelte:options {...spread} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (31, 31))),
    ("spread/with_children", "<svelte:options {...spread}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute", "`<svelte:options>` can only receive static attributes\nhttps://svelte.dev/e/svelte_options_invalid_attribute", (16, 27))),
    ("spread/whitespace_children", "<svelte:options {...spread}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute", "`<svelte:options>` can only receive static attributes\nhttps://svelte.dev/e/svelte_options_invalid_attribute", (16, 27))),
    ("on_directive/plain", "<svelte:options on:click={f} />\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute", "`<svelte:options>` can only receive static attributes\nhttps://svelte.dev/e/svelte_options_invalid_attribute", (16, 28))),
    ("on_directive/two_elements", "<svelte:options on:click={f} />\n<svelte:options on:click={f} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (32, 32))),
    ("on_directive/with_children", "<svelte:options on:click={f}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute", "`<svelte:options>` can only receive static attributes\nhttps://svelte.dev/e/svelte_options_invalid_attribute", (16, 28))),
    ("on_directive/whitespace_children", "<svelte:options on:click={f}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute", "`<svelte:options>` can only receive static attributes\nhttps://svelte.dev/e/svelte_options_invalid_attribute", (16, 28))),
    ("bind_directive/plain", "<svelte:options bind:x={y} />\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute", "`<svelte:options>` can only receive static attributes\nhttps://svelte.dev/e/svelte_options_invalid_attribute", (16, 26))),
    ("bind_directive/two_elements", "<svelte:options bind:x={y} />\n<svelte:options bind:x={y} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (30, 30))),
    ("bind_directive/with_children", "<svelte:options bind:x={y}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute", "`<svelte:options>` can only receive static attributes\nhttps://svelte.dev/e/svelte_options_invalid_attribute", (16, 26))),
    ("bind_directive/whitespace_children", "<svelte:options bind:x={y}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_options_invalid_attribute", "`<svelte:options>` can only receive static attributes\nhttps://svelte.dev/e/svelte_options_invalid_attribute", (16, 26))),
    ("ok_runes/plain", "<svelte:options runes />\n<p>x</p>", Expect::Ok(&[])),
    ("ok_runes/two_elements", "<svelte:options runes />\n<svelte:options runes />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (25, 25))),
    ("ok_runes/with_children", "<svelte:options runes>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (22, 23))),
    ("ok_runes/whitespace_children", "<svelte:options runes> </svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (22, 23))),
    ("ok_accessors/plain", "<svelte:options accessors />\n<p>x</p>", Expect::Ok(&[])),
    ("ok_accessors/two_elements", "<svelte:options accessors />\n<svelte:options accessors />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (29, 29))),
    ("ok_accessors/with_children", "<svelte:options accessors>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (26, 27))),
    ("ok_accessors/whitespace_children", "<svelte:options accessors> </svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (26, 27))),
    ("ok_ns_svg_expr/plain", "<svelte:options namespace={\"svg\"} />\n<p>x</p>", Expect::Ok(&[])),
    ("ok_ns_svg_expr/two_elements", "<svelte:options namespace={\"svg\"} />\n<svelte:options namespace={\"svg\"} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (37, 37))),
    ("ok_ns_svg_expr/with_children", "<svelte:options namespace={\"svg\"}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (34, 35))),
    ("ok_ns_svg_expr/whitespace_children", "<svelte:options namespace={\"svg\"}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (34, 35))),
    ("ok_ns_svg_expr_sq/plain", "<svelte:options namespace={'svg'} />\n<p>x</p>", Expect::Ok(&[])),
    ("ok_ns_svg_expr_sq/two_elements", "<svelte:options namespace={'svg'} />\n<svelte:options namespace={'svg'} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (37, 37))),
    ("ok_ns_svg_expr_sq/with_children", "<svelte:options namespace={'svg'}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (34, 35))),
    ("ok_ns_svg_expr_sq/whitespace_children", "<svelte:options namespace={'svg'}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (34, 35))),
    ("ok_ns_html_expr/plain", "<svelte:options namespace={\"html\"} />\n<p>x</p>", Expect::Ok(&[])),
    ("ok_ns_html_expr/two_elements", "<svelte:options namespace={\"html\"} />\n<svelte:options namespace={\"html\"} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (38, 38))),
    ("ok_ns_html_expr/with_children", "<svelte:options namespace={\"html\"}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (35, 36))),
    ("ok_ns_html_expr/whitespace_children", "<svelte:options namespace={\"html\"}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (35, 36))),
    ("ok_ns_mathml_expr/plain", "<svelte:options namespace={\"mathml\"} />\n<p>x</p>", Expect::Ok(&[])),
    ("ok_ns_mathml_expr/two_elements", "<svelte:options namespace={\"mathml\"} />\n<svelte:options namespace={\"mathml\"} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (40, 40))),
    ("ok_ns_mathml_expr/with_children", "<svelte:options namespace={\"mathml\"}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (37, 38))),
    ("ok_ns_mathml_expr/whitespace_children", "<svelte:options namespace={\"mathml\"}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (37, 38))),
    ("ok_css_expr/plain", "<svelte:options css={\"injected\"} />\n<p>x</p>", Expect::Ok(&[])),
    ("ok_css_expr/two_elements", "<svelte:options css={\"injected\"} />\n<svelte:options css={\"injected\"} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (36, 36))),
    ("ok_css_expr/with_children", "<svelte:options css={\"injected\"}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (33, 34))),
    ("ok_css_expr/whitespace_children", "<svelte:options css={\"injected\"}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (33, 34))),
    ("ok_runes_expr/plain", "<svelte:options runes={true} />\n<p>x</p>", Expect::Ok(&[])),
    ("ok_runes_expr/two_elements", "<svelte:options runes={true} />\n<svelte:options runes={true} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (32, 32))),
    ("ok_runes_expr/with_children", "<svelte:options runes={true}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (29, 30))),
    ("ok_runes_expr/whitespace_children", "<svelte:options runes={true}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (29, 30))),
    ("ok_ce_null/plain", "<svelte:options customElement={null} />\n<p>x</p>", Expect::Ok(&[("options_missing_custom_element", 16, 36)])),
    ("ok_ce_null/two_elements", "<svelte:options customElement={null} />\n<svelte:options customElement={null} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (40, 40))),
    ("ok_ce_null/with_children", "<svelte:options customElement={null}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (37, 38))),
    ("ok_ce_null/whitespace_children", "<svelte:options customElement={null}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (37, 38))),
    ("ok_ce_obj/plain", "<svelte:options customElement={{ tag: \"my-el\" }} />\n<p>x</p>", Expect::Ok(&[("options_missing_custom_element", 16, 48)])),
    ("ok_ce_obj/two_elements", "<svelte:options customElement={{ tag: \"my-el\" }} />\n<svelte:options customElement={{ tag: \"my-el\" }} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (52, 52))),
    ("ok_ce_obj/with_children", "<svelte:options customElement={{ tag: \"my-el\" }}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (49, 50))),
    ("ok_ce_obj/whitespace_children", "<svelte:options customElement={{ tag: \"my-el\" }}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (49, 50))),
    ("ok_ce_props_empty/plain", "<svelte:options customElement={{ tag: \"my-el\", props: {} }} />\n<p>x</p>", Expect::Ok(&[("options_missing_custom_element", 16, 59)])),
    ("ok_ce_props_empty/two_elements", "<svelte:options customElement={{ tag: \"my-el\", props: {} }} />\n<svelte:options customElement={{ tag: \"my-el\", props: {} }} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (63, 63))),
    ("ok_ce_props_empty/with_children", "<svelte:options customElement={{ tag: \"my-el\", props: {} }}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (60, 61))),
    ("ok_ce_props_empty/whitespace_children", "<svelte:options customElement={{ tag: \"my-el\", props: {} }}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (60, 61))),
    ("ok_ce_props_type/plain", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { type: \"Number\" } } }} />\n<p>x</p>", Expect::Ok(&[("options_missing_custom_element", 16, 82)])),
    ("ok_ce_props_type/two_elements", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { type: \"Number\" } } }} />\n<svelte:options customElement={{ tag: \"my-el\", props: { a: { type: \"Number\" } } }} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (86, 86))),
    ("ok_ce_props_type/with_children", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { type: \"Number\" } } }}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (83, 84))),
    ("ok_ce_props_type/whitespace_children", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { type: \"Number\" } } }}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (83, 84))),
    ("ok_ce_props_reflect/plain", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { reflect: true, type: \"Number\" } } }} />\n<p>x</p>", Expect::Ok(&[("options_missing_custom_element", 16, 97)])),
    ("ok_ce_props_reflect/two_elements", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { reflect: true, type: \"Number\" } } }} />\n<svelte:options customElement={{ tag: \"my-el\", props: { a: { reflect: true, type: \"Number\" } } }} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (101, 101))),
    ("ok_ce_props_reflect/with_children", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { reflect: true, type: \"Number\" } } }}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (98, 99))),
    ("ok_ce_props_reflect/whitespace_children", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { reflect: true, type: \"Number\" } } }}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (98, 99))),
    ("ok_ce_props_attribute/plain", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { attribute: \"x-a\" } } }} />\n<p>x</p>", Expect::Ok(&[("options_missing_custom_element", 16, 84)])),
    ("ok_ce_props_attribute/two_elements", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { attribute: \"x-a\" } } }} />\n<svelte:options customElement={{ tag: \"my-el\", props: { a: { attribute: \"x-a\" } } }} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (88, 88))),
    ("ok_ce_props_attribute/with_children", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { attribute: \"x-a\" } } }}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (85, 86))),
    ("ok_ce_props_attribute/whitespace_children", "<svelte:options customElement={{ tag: \"my-el\", props: { a: { attribute: \"x-a\" } } }}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (85, 86))),
    ("ok_ce_shadow_open/plain", "<svelte:options customElement={{ tag: \"my-el\", shadow: \"open\" }} />\n<p>x</p>", Expect::Ok(&[("options_missing_custom_element", 16, 64)])),
    ("ok_ce_shadow_open/two_elements", "<svelte:options customElement={{ tag: \"my-el\", shadow: \"open\" }} />\n<svelte:options customElement={{ tag: \"my-el\", shadow: \"open\" }} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (68, 68))),
    ("ok_ce_shadow_open/with_children", "<svelte:options customElement={{ tag: \"my-el\", shadow: \"open\" }}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (65, 66))),
    ("ok_ce_shadow_open/whitespace_children", "<svelte:options customElement={{ tag: \"my-el\", shadow: \"open\" }}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (65, 66))),
    ("ok_ce_shadow_obj/plain", "<svelte:options customElement={{ tag: \"my-el\", shadow: { mode: \"open\" } }} />\n<p>x</p>", Expect::Ok(&[("options_missing_custom_element", 16, 74)])),
    ("ok_ce_shadow_obj/two_elements", "<svelte:options customElement={{ tag: \"my-el\", shadow: { mode: \"open\" } }} />\n<svelte:options customElement={{ tag: \"my-el\", shadow: { mode: \"open\" } }} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (78, 78))),
    ("ok_ce_shadow_obj/with_children", "<svelte:options customElement={{ tag: \"my-el\", shadow: { mode: \"open\" } }}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (75, 76))),
    ("ok_ce_shadow_obj/whitespace_children", "<svelte:options customElement={{ tag: \"my-el\", shadow: { mode: \"open\" } }}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (75, 76))),
    ("ok_ce_extend/plain", "<svelte:options customElement={{ tag: \"my-el\", extend: (c) => c }} />\n<p>x</p>", Expect::Ok(&[("options_missing_custom_element", 16, 66)])),
    ("ok_ce_extend/two_elements", "<svelte:options customElement={{ tag: \"my-el\", extend: (c) => c }} />\n<svelte:options customElement={{ tag: \"my-el\", extend: (c) => c }} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (70, 70))),
    ("ok_ce_extend/with_children", "<svelte:options customElement={{ tag: \"my-el\", extend: (c) => c }}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (67, 68))),
    ("ok_ce_extend/whitespace_children", "<svelte:options customElement={{ tag: \"my-el\", extend: (c) => c }}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (67, 68))),
    ("ok_ce_empty/plain", "<svelte:options customElement=\"\" />\n<p>x</p>", Expect::Ok(&[("options_missing_custom_element", 16, 32)])),
    ("ok_ce_empty/two_elements", "<svelte:options customElement=\"\" />\n<svelte:options customElement=\"\" />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (36, 36))),
    ("ok_ce_empty/with_children", "<svelte:options customElement=\"\">x</svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (33, 34))),
    ("ok_ce_empty/whitespace_children", "<svelte:options customElement=\"\"> </svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (33, 34))),
    ("ok_ce_obj_tag_empty/plain", "<svelte:options customElement={{ tag: \"\" }} />\n<p>x</p>", Expect::Ok(&[("options_missing_custom_element", 16, 43)])),
    ("ok_ce_obj_tag_empty/two_elements", "<svelte:options customElement={{ tag: \"\" }} />\n<svelte:options customElement={{ tag: \"\" }} />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (47, 47))),
    ("ok_ce_obj_tag_empty/with_children", "<svelte:options customElement={{ tag: \"\" }}>x</svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (44, 45))),
    ("ok_ce_obj_tag_empty/whitespace_children", "<svelte:options customElement={{ tag: \"\" }}> </svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (44, 45))),
    ("ok_ce_tag_dots/plain", "<svelte:options customElement=\"a-0._\" />\n<p>x</p>", Expect::Ok(&[("options_missing_custom_element", 16, 37)])),
    ("ok_ce_tag_dots/two_elements", "<svelte:options customElement=\"a-0._\" />\n<svelte:options customElement=\"a-0._\" />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (41, 41))),
    ("ok_ce_tag_dots/with_children", "<svelte:options customElement=\"a-0._\">x</svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (38, 39))),
    ("ok_ce_tag_dots/whitespace_children", "<svelte:options customElement=\"a-0._\"> </svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (38, 39))),
    ("ok_ce_tag_xyz/plain", "<svelte:options customElement=\"x-y-z\" />\n<p>x</p>", Expect::Ok(&[("options_missing_custom_element", 16, 37)])),
    ("ok_ce_tag_xyz/two_elements", "<svelte:options customElement=\"x-y-z\" />\n<svelte:options customElement=\"x-y-z\" />\n<p>x</p>", Expect::Err("svelte_meta_duplicate", "A component can only have one `<svelte:options>` element\nhttps://svelte.dev/e/svelte_meta_duplicate", (41, 41))),
    ("ok_ce_tag_xyz/with_children", "<svelte:options customElement=\"x-y-z\">x</svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (38, 39))),
    ("ok_ce_tag_xyz/whitespace_children", "<svelte:options customElement=\"x-y-z\"> </svelte:options>\n<p>x</p>", Expect::Err("svelte_meta_invalid_content", "<svelte:options> cannot have children\nhttps://svelte.dev/e/svelte_meta_invalid_content", (38, 39))),
];

/// What deferring `read_options` to the end of the parse must **not** change:
/// it is now outranked by every parse error in the file, and still outranks
/// every phase-2 analysis error. Measured the same way as `GRID`.
#[rustfmt::skip]
const ORDERING: &[(&str, &str, Expect)] = &[
    ("placement_beats_attribute", "<div><svelte:options runes=\"x\" /></div>", Expect::Err("svelte_meta_invalid_placement", "`<svelte:options>` tags cannot be inside elements or blocks\nhttps://svelte.dev/e/svelte_meta_invalid_placement", (5, 5))),
    ("unclosed_element_beats_attribute", "<svelte:options runes=\"x\" />\n<div>", Expect::Err("element_unclosed", "`<div>` was left open\nhttps://svelte.dev/e/element_unclosed", (29, 30))),
    ("block_parse_error_beats_attribute", "<svelte:options runes=\"x\" />\n{#if}", Expect::Err("expected_whitespace", "Expected whitespace\nhttps://svelte.dev/e/expected_whitespace", (33, 33))),
    ("attribute_beats_analysis", "<svelte:options runes=\"x\" />\n<input bind:value={notdeclared} />", Expect::Err("svelte_options_invalid_attribute_value", "Value must be true or false, if specified\nhttps://svelte.dev/e/svelte_options_invalid_attribute_value", (16, 25))),
];

/// A tag name is validated with upstream's `tag_name_char` class, which the old
/// `(c as u32) < 0xB7` approximation accepted past `\xB7`. Kept out of `GRID`
/// because upstream reports `character` in UTF-16 units and rsvelte's span is in
/// bytes, so a non-ASCII source is not offset-comparable.
#[test]
fn tag_name_char_class_rejects_the_byte_after_middle_dot() {
    for (tag, want) in [
        ("my-\u{B7}el", None),
        ("my-\u{B8}el", Some("svelte_options_invalid_tagname")),
    ] {
        let src = format!("<svelte:options customElement=\"{tag}\" />\n<p>x</p>");
        let got = compile(
            &src,
            CompileOptions {
                filename: Some("T.svelte".to_string()),
                generate: GenerateMode::Client,
                dev: false,
                ..Default::default()
            },
        )
        .err()
        .and_then(|e| e.diagnostic().code);
        assert_eq!(got.as_deref(), want, "customElement=\"{tag}\"");
    }
}

#[test]
fn svelte_options_grid_matches_official() {
    let hook = std::panic::take_hook();
    std::panic::set_hook(Box::new(|_| {}));
    let mut failures = Vec::new();
    for (id, src, expect) in GRID.iter().chain(ORDERING) {
        if let Err(payload) = std::panic::catch_unwind(|| check(id, src, expect)) {
            let msg = payload
                .downcast_ref::<String>()
                .cloned()
                .or_else(|| payload.downcast_ref::<&str>().map(|s| (*s).to_string()))
                .unwrap_or_else(|| "<non-string panic>".to_string());
            failures.push(format!("  {msg}"));
        }
    }
    std::panic::set_hook(hook);
    assert!(
        failures.is_empty(),
        "{} of {} cells diverge:\n{}",
        failures.len(),
        GRID.len() + ORDERING.len(),
        failures.join("\n")
    );
}

/// `ErrUnpositioned` drops the span from the comparison, which is right for the
/// oracle — upstream's `validate_tag` gets the `[name, value]` pair rather than
/// the attribute node, so `e()` throws with `start`/`end` undefined — and leaves
/// rsvelte's own span checked by nothing. No other gate covers it either: no
/// `compatibility/` ratchet holds a `svelte_options_invalid_tagname` entry (a
/// collected corpus is published code, and published code compiles), and
/// `matrix/axes.mjs` has no `<svelte:options>` family. A later change that
/// dropped the span to match upstream more closely would pass every gate.
///
/// The span is asserted as a *property* rather than as copied numbers: it must
/// be the `customElement={…}` attribute's own extent, which is what makes it
/// more useful than upstream's absent one.
#[test]
fn the_unpositioned_rows_keep_rsveltes_attribute_span() {
    let mut checked = 0;
    for (id, src, expect) in GRID.iter().chain(ORDERING) {
        if !matches!(expect, Expect::ErrUnpositioned(..)) {
            continue;
        }
        let start = src
            .find("customElement=")
            .unwrap_or_else(|| panic!("[{id}] every unpositioned row is a customElement row"));
        let end = src[start..]
            .find("}}")
            .map(|at| start + at + 2)
            .unwrap_or_else(|| panic!("[{id}] expected the object form"));

        for generate in [GenerateMode::Client, GenerateMode::Server] {
            let Err((_, _, span)) = observed(src, generate) else {
                panic!("[{id}] generate={generate:?}: expected a rejection");
            };
            assert_eq!(
                span,
                Some((start as u32, end as u32)),
                "[{id}] generate={generate:?}: span must be the `customElement={{…}}` attribute"
            );
        }
        checked += 1;
    }
    assert!(
        checked >= 12,
        "only {checked} unpositioned rows were reached — the grid or the variant moved"
    );
}
