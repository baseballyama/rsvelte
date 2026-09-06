//! A block-local binding — an `{#each}` item or index, an `{#await}` value or
//! error — is in scope only inside its own block. `ScopeRoot`'s scope 0 is
//! intentionally polluted with every child-scope declaration, so a name-keyed
//! lookup answers with such a binding for a reference nowhere near its block,
//! and the reference then lands in `binding.references` — which is what
//! `binding_at_reference` replays, so even the position-keyed resolution
//! inherits it.
//!
//! Every expected string below was read out of the official compiler
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`, 5.56.10) rather
//! than inferred from rsvelte's own output. The grid carries both directions:
//! the reads that must stay reactive (inside the block, and an each INDEX,
//! which upstream renders with a plain `nodeValue` write inside the block) fail
//! a predicate that never wraps, and the outer reads fail one that always does.
//!
//! `{#await p catch code}` is deliberately absent. Upstream leaks a catch
//! binding past its own block on the client and leaks both `then` and `catch`
//! on the server, emitting `$.get(code)` / `$.escape(code)` at component scope
//! where `code` is only a callback parameter; pinning that here would pin an
//! upstream defect. `upstream_issues/` carries the report.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

const HEAD: &str = "<script>\n\tconst p = Promise.resolve(1);\n\tconst xs = [1];\n</script>\n\n";

/// The lines that carry a text update, which is where the wrap decision is
/// visible: `text_1.nodeValue = …` is the non-reactive form and
/// `$.template_effect(() => $.set_text(…))` the reactive one.
fn text_updates(tail: &str) -> Vec<String> {
    let js = compile(
        &format!("{HEAD}{tail}"),
        CompileOptions {
            filename: Some("C.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    js.lines()
        .filter(|l| l.contains("nodeValue") || l.contains("set_text"))
        .map(|l| l.trim().to_string())
        .collect()
}

/// `(name, template, official's text-update lines in order)`.
#[allow(clippy::type_complexity)]
const CELLS: &[(&str, &str, &[&str])] = &[
    (
        "await-then, read after the block",
        "{#await p then code}{code}{/await}\n{code}\n",
        &[
            "$.template_effect(() => $.set_text(text, $.get(code)));",
            "text_1.nodeValue = ` ${code ?? ''}`;",
        ],
    ),
    (
        // No read inside the block at all: the leak does not need one.
        "await-then, no read inside the block",
        "{#await p then code}x{/await}\n{code}\n",
        &["text_1.nodeValue = ` ${code ?? ''}`;"],
    ),
    (
        // Before the block, so a fix keyed on "have we entered the block yet"
        // is not enough.
        "await-then, read before the block",
        "{code}\n{#await p then code}{code}{/await}\n",
        &[
            "text.nodeValue = `${code ?? ''} `;",
            "$.template_effect(() => $.set_text(text_1, $.get(code)));",
        ],
    ),
    (
        // Control: a different name never had the leak, so it cannot report a
        // fix that over-rejects.
        "await-then, outer read of another name",
        "{#await p then code}{code}{/await}\n{other}\n",
        &[
            "$.template_effect(() => $.set_text(text, $.get(code)));",
            "text_1.nodeValue = ` ${other ?? ''}`;",
        ],
    ),
    (
        "each item, read after the block",
        "{#each xs as code}{code}{/each}\n{code}\n",
        &[
            "$.template_effect(() => $.set_text(text, $.get(code)));",
            "text_1.nodeValue = ` ${code ?? ''}`;",
        ],
    ),
    (
        "each item, no read inside the block",
        "{#each xs as code}x{/each}\n{code}\n",
        &["text_1.nodeValue = ` ${code ?? ''}`;"],
    ),
    (
        // An each INDEX is not reactive even inside the block, so this row
        // fails a predicate that answers the kind rather than the scope.
        "each index, read after the block",
        "{#each xs as v, code}{code}{/each}\n{code}\n",
        &[
            "text.nodeValue = code;",
            "text_1.nodeValue = ` ${code ?? ''}`;",
        ],
    ),
    (
        "control: no block at all",
        "{code}\n",
        &["text.nodeValue = code;"],
    ),
    (
        // The read that must stay reactive: a fix that rejects the binding
        // everywhere breaks this one.
        "control: read inside the block only",
        "{#each xs as code}{code}{/each}\n",
        &["$.template_effect(() => $.set_text(text, $.get(code)));"],
    ),
];

#[test]
fn a_block_local_binding_does_not_reach_a_reference_outside_its_block() {
    for &(name, tail, expected) in CELLS {
        assert_eq!(text_updates(tail), expected, "{name}");
    }
}
