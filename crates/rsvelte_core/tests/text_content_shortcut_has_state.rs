//! Upstream gates the `element.textContent = …` shortcut on the expression's
//! REACTIVITY (`has_state` / `has_await` / `has_blockers`), never on whether its
//! value is known. rsvelte also accepted a known value, so `<em>x{void p}</em>`
//! — a prop read that folds to `undefined` — skipped its text node and the
//! whole element's node numbering shifted. The two controls below are the
//! neighbouring cells: neither-known-nor-reactive still takes the shortcut, and
//! reactive-and-unknown still gets its own text node.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

#[test]
fn a_known_value_that_reads_state_still_gets_its_own_text_node() {
    let out = client(
        "<script>\n\tlet { p } = $props();\n\tlet s = $state(1);\n\tconst fixed = 'k';\n</script>\n\n<em>x{void p}</em>\n<i>y{fixed}</i>\n<u>z{s}</u>\n<button onclick={() => s++}>go</button>\n",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    // The element keeps a text node in the template and writes through it.
    assert!(out.contains("`<em> </em>"), "{out}");
    assert!(out.contains("text.nodeValue = 'x';"), "{out}");
    assert!(!out.contains("em.textContent"), "{out}");
    // Control 1: neither known nor reactive — the shortcut still applies.
    assert!(out.contains("i.textContent = 'yk';"), "{out}");
    // Control 2: reactive and unknown — its own text node, updated in an effect.
    assert!(
        out.contains("$.set_text(text_1, `z${$.get(s) ?? ''}`)"),
        "{out}"
    );
}
