//! `RegularElement.js:333` gives an element's children the PARENT's `consts`
//! array itself whenever the element declares none of its own
//! (`has_declarations` is `!fragment.metadata.transparent`, and only a
//! `DeclarationTag` — `{const x = …}`, no `@` — clears that flag). `:443` then
//! splices that same array into the `{ … }` wrapper an element grows when its
//! fragment holds a `{#snippet}`, so an enclosing `{@const}` is declared a
//! second time inside the wrapper.
//!
//! Every expected count was taken from the official Svelte compiler
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// How many times `const h = …` is declared in the client output.
fn declarations_of_h(template: &str) -> usize {
    let src = format!("<script>\n\tlet {{ v }} = $props();\n</script>\n{template}\n");
    let js = compile(
        &src,
        CompileOptions {
            filename: Some("M.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    js.lines().filter(|l| l.contains("const h = ")).count()
}

/// `(name, template, official's count)`.
const CELLS: &[(&str, &str, usize)] = &[
    (
        "element, no snippet: nothing wraps",
        "{#if v}{@const h = v}<div>{h}</div>{/if}",
        1,
    ),
    (
        // `{const g = h}` makes the fragment non-transparent, so the children get
        // a FRESH array and the wrapper carries only what the element declares.
        // This is the cell that separates \"splice whenever a snippet wraps\" from
        // \"splice only when the array is the parent's\".
        "element with its own `{const}` + snippet",
        "{#if v}{@const h = v}<div>{const g = h}{#snippet s()}{h}{g}{/snippet}{@render s()}</div>{/if}",
        1,
    ),
    (
        "element with its own `{const}`, no snippet",
        "{#if v}{@const h = v}<div>{const g = h}{h}{g}</div>{/if}",
        1,
    ),
    (
        "element, no declaration of its own, WITH a snippet",
        "{#if v}{@const h = v}<div>{#snippet s()}{h}{/snippet}{@render s()}</div>{/if}",
        2,
    ),
    (
        // `SvelteElement.js:110` delegates to `Fragment.js:68`, whose `consts` is a
        // fresh `[]` — so the same arrangement does NOT re-expand here.
        "`<svelte:element>` with a snippet",
        "{#if v}{@const h = v}<svelte:element this={'div'}>{#snippet s()}{h}{/snippet}{@render s()}</svelte:element>{/if}",
        1,
    ),
    (
        "no enclosing `{@const}` at all",
        "{#if v}<div>{#snippet s()}{v}{/snippet}{@render s()}</div>{/if}",
        0,
    ),
];

#[test]
fn an_enclosing_const_is_re_expanded_into_an_elements_snippet_wrapper() {
    // A rule that always splices, or never does, fails one of these halves.
    assert!(
        CELLS.iter().any(|(_, _, n)| *n == 2),
        "no cell observes the re-expansion"
    );
    assert!(
        CELLS.iter().filter(|(_, _, n)| *n == 1).count() >= 4,
        "too few cells pin the single-declaration shape"
    );

    for (name, template, want) in CELLS {
        assert_eq!(declarations_of_h(template), *want, "cell `{name}`");
    }
}
