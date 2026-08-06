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
    // `column` counts characters, not bytes — slicing by byte index here would
    // panic on the non-ASCII case below rather than report it.
    let line: Vec<char> = src
        .lines()
        .nth(start.line - 1)
        .unwrap_or("")
        .chars()
        .collect();
    let to = if start.line == end.line {
        end.column.min(line.len())
    } else {
        line.len()
    };
    let text: String = line[start.column..to].iter().collect();
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

/// `end` is derived from the name's byte length, but the reported column counts
/// characters. This pins that the two units survive the conversion: upstream
/// reports 19-23 here, so a byte-length `end` that leaked into the column would
/// show as 31.
#[test]
fn non_ascii_identifier_span_is_byte_correct() {
    let src = "<script>export let プロップ;</script>\n<div></div>";
    assert_eq!(spanned(src, "export_let_unused"), "プロップ");
}
