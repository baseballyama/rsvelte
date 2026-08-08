//! rsvelte emitted these five warnings with no span at all, so `warning.start`
//! was `undefined` where upstream reports a real position and an editor had
//! nothing to underline. The five do **not** share one cause: two have the
//! target node in hand, one has the wrong node in hand, and two have to
//! reconstruct the declaration identifier from a binding. Each test names the
//! upstream warn target it pins.

use rsvelte_core::{CompileOptions, GenerateMode, Warning, compile};

fn warnings(src: &str) -> Vec<Warning> {
    compile(
        src,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .warnings
}

/// The source text the first `code` warning spans. Panics if it has no span,
/// which is the pre-fix state every repro here starts from.
fn spanned(src: &str, code: &str) -> String {
    let ws = warnings(src);
    let w = ws.iter().find(|w| w.code == code).unwrap_or_else(|| {
        panic!(
            "no `{code}` warning in {:?}",
            ws.iter().map(|w| &w.code).collect::<Vec<_>>()
        )
    });
    let start = w
        .start
        .as_ref()
        .unwrap_or_else(|| panic!("`{code}` has no start"));
    let end = w
        .end
        .as_ref()
        .unwrap_or_else(|| panic!("`{code}` has no end"));
    // `column` is a count of UTF-16 code units, matching upstream's locator over
    // a JS string. Slicing by byte index panics on a non-ASCII name; slicing by
    // `char` is right across the BMP and wrong for an astral one, which the last
    // test below exists to catch.
    let line: Vec<u16> = src
        .lines()
        .nth(start.line - 1)
        .unwrap_or("")
        .encode_utf16()
        .collect();
    let to = if start.line == end.line {
        end.column.min(line.len())
    } else {
        line.len()
    };
    let text = String::from_utf16_lossy(&line[start.column..to]);
    if start.line == end.line {
        text
    } else {
        format!("{text}…")
    }
}

// Mechanism A: the warn target is the template node the visitor already holds.

/// Upstream `RegularElement.js:223` warns on `node`, the whole element.
#[test]
fn self_closing_tag_spans_the_element() {
    assert_eq!(
        spanned("<div />", "element_invalid_self_closing_tag"),
        "<div />"
    );
}

/// Upstream `OnDirective.js:16` warns on `node`, the directive — not the
/// element that carries it.
#[test]
fn event_directive_spans_the_directive_not_the_element() {
    let src = "<svelte:options runes />\n<div on:click={() => {}}></div>";
    assert_eq!(
        spanned(src, "event_directive_deprecated"),
        "on:click={() => {}}"
    );
}

// Mechanism B: the visitor holds `<svelte:options>`, but upstream warns on the
// `customElement` attribute inside it. Attaching the node in hand would be
// wrong here in exactly the way the a11y element-vs-attribute bucket was.

/// Upstream `index.js:692` warns on `attribute`, not on `root.options`.
#[test]
fn options_missing_custom_element_spans_the_attribute() {
    let src = "<svelte:options customElement=\"my-el\" />\n<div></div>";
    assert_eq!(
        spanned(src, "options_missing_custom_element"),
        "customElement=\"my-el\""
    );
}

// Mechanism C: the warn target is `binding.node`, the declaration identifier.
// The binding records only a start offset, so the end has to be reconstructed.

/// Upstream `index.js:815` warns on `binding.node` — the identifier alone, not
/// the declaration.
#[test]
fn export_let_unused_spans_the_identifier() {
    let src = "<script>export let unusedProp;</script>\n<div></div>";
    assert_eq!(spanned(src, "export_let_unused"), "unusedProp");
}

/// Upstream `index.js:765` warns on `binding.node`. The upstream fixture
/// `validator/samples/runes-referenced-nonstate` pins column 5-6 for `b`, i.e.
/// the identifier and nothing else.
#[test]
fn non_reactive_update_spans_the_identifier() {
    let src = "<script>\n\tlet a = $state(1);\n\tlet b = 2;\n</script>\n\
               <button onclick={() => b += 1}>b</button>\n<p>{a} {b}</p>";
    assert_eq!(spanned(src, "non_reactive_update"), "b");
}

/// `end` is derived from the name's **byte** length while the reported column is
/// a **UTF-16** count. This pins that the units survive the conversion: upstream
/// reports 19-23 here, so a byte-length `end` leaking into the column would show
/// as 31.
///
/// It settles byte-end against column, and nothing more — every character here
/// is in the BMP, where a UTF-16 count and a `char` count are equal. The astral
/// case below is what separates those two.
#[test]
fn bmp_identifier_span_survives_the_byte_to_column_conversion() {
    let src = "<script>export let プロップ;</script>\n<div></div>";
    assert_eq!(spanned(src, "export_let_unused"), "プロップ");
}

/// The column unit itself. `𝕏` (U+1D54F, a valid `ID_Start`) is 1 `char`, 2
/// UTF-16 code units and 4 bytes, so it is the only kind of input that can tell
/// the three apart. Upstream reports 19-21 — UTF-16, not characters — and
/// rsvelte agrees; a `char`-based column would report 19-20.
#[test]
fn astral_identifier_column_is_utf16_not_chars() {
    let src = "<script>export let 𝕏;</script>\n<div></div>";
    assert_eq!(spanned(src, "export_let_unused"), "𝕏");
}
