//! Regression tests for #3609 — a `{@const}` that shadows an enclosing
//! `{#each}`'s item or index across a block boundary was still read as the
//! loop variable.
//!
//! Upstream resolves the reference through `scope.evaluate`, so the `{@const}`
//! wins and its literal initializer is *known*: `has_state` is false, the
//! element takes the `textContent` shortcut instead of a `$.template_effect`,
//! and the each callback drops an `index` parameter nothing reads any more.
//!
//! This port answers both questions by NAME — `each_binding_context` for the
//! reactivity probe, `each_index_name` for the callback parameter — and neither
//! could see the shadow, because the `{@const}` lives one block deeper than the
//! loop. With the const in the each body itself the two names collide in one
//! scope and both compilers reject it, so the defect only exists across a
//! boundary: `{#if}`, `{#key}`, a nested `{#each}`, `{#await … then}` or
//! `{#snippet}`.
//!
//! A snippet PARAMETER shadows the same way and is the same defect, so it is
//! the one shadowing construct here whose read stays reactive.
//!
//! Every expectation is the byte-exact output of the official compiler
//! (Svelte v5.56.9).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

const HEAD: &str = "<script>\n\tconst rows = [{ value: \"row\" }];\n\tconst q = 1;\n</script>\n\n";

fn compile_tpl(tpl: &str, generate: GenerateMode) -> String {
    compile(
        &format!("{HEAD}{tpl}\n"),
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// Every block boundary the `{@const}` can sit behind. With no boundary at all
/// the two declarations share a scope and both compilers raise
/// `declaration_duplicate`, so `none` is deliberately absent.
const BOUNDARIES: [(&str, &str); 5] = [
    ("if", "{#if q}\n%s\n{/if}"),
    ("key", "{#key q}\n%s\n{/key}"),
    ("each", "{#each rows as r}\n%s\n{/each}"),
    ("await", "{#await Promise.resolve(1) then _}\n%s\n{/await}"),
    ("snippet", "{#snippet s()}\n%s\n{/snippet}\n{@render s()}"),
];

/// The client half: a shadowed read is not state, so the element's text is set
/// once via `textContent` and the template carries no placeholder text node.
#[test]
fn a_const_shadowing_the_item_makes_the_read_static() {
    for (name, wrap) in BOUNDARIES {
        let inner = wrap.replace("%s", "{@const value = \"c\"}\n<b>{value}</b>");
        let code = compile_tpl(
            &format!("{{#each rows as value (value.value)}}\n{inner}\n{{/each}}"),
            GenerateMode::Client,
        );
        assert!(
            code.contains("var root = $.from_html(`<b></b>`);"),
            "boundary {name} in:\n{code}"
        );
        assert!(
            code.contains("b.textContent = $.get(value);"),
            "boundary {name} in:\n{code}"
        );
        assert!(
            !code.contains("$.template_effect"),
            "boundary {name} in:\n{code}"
        );
    }
}

/// The control that keeps the fix honest: a `{@const}` under a DIFFERENT name
/// shadows nothing, so the item read stays reactive and the text node returns.
#[test]
fn a_const_under_another_name_leaves_the_item_reactive() {
    for (name, wrap) in BOUNDARIES {
        let inner = wrap.replace("%s", "{@const other = \"c\"}\n<b>{other}{value}</b>");
        let code = compile_tpl(
            &format!("{{#each rows as value (value.value)}}\n{inner}\n{{/each}}"),
            GenerateMode::Client,
        );
        assert!(
            code.contains("var root = $.from_html(`<b> </b>`);"),
            "boundary {name} in:\n{code}"
        );
        assert!(
            code.contains("$.template_effect"),
            "boundary {name} in:\n{code}"
        );
    }
}

/// The index half is a second decision on the same name: upstream sets
/// `uses_index` from the index transform's `read` callback, which a shadowed
/// reference never reaches, so the callback signature loses the parameter.
#[test]
fn a_const_shadowing_the_index_drops_the_callback_parameter() {
    for (name, wrap) in BOUNDARIES {
        let inner = wrap.replace("%s", "{@const value = \"c\"}\n<b>{value}</b>");
        let code = compile_tpl(
            &format!("{{#each rows as _r, value}}\n{inner}\n{{/each}}"),
            GenerateMode::Client,
        );
        assert!(
            code.contains("$.each(node, 1, () => rows, $.index, ($$anchor, _r) => {"),
            "boundary {name} in:\n{code}"
        );
    }
}

/// …and the control for it: an unshadowed read of the index keeps the parameter.
#[test]
fn an_unshadowed_index_read_keeps_the_callback_parameter() {
    let code = compile_tpl(
        "{#each rows as _r, value}\n{#if q}\n<b>{value}</b>\n{/if}\n{/each}",
        GenerateMode::Client,
    );
    assert!(
        code.contains("$.each(node, 1, () => rows, $.index, ($$anchor, _r, value) => {"),
        "in:\n{code}"
    );
    assert!(code.contains("b.textContent = value;"), "in:\n{code}");
}

/// The server half — the fold reads the `{@const}`, not the loop variable, so
/// the text is inlined.
#[test]
fn the_server_folds_the_shadowing_const() {
    for (name, wrap) in BOUNDARIES {
        let inner = wrap.replace("%s", "{@const value = \"c\"}\n<b>{value}</b>");
        for outer in [
            "{#each rows as value (value.value)}\n%s\n{/each}",
            "{#each rows as _r, value}\n%s\n{/each}",
        ] {
            let code = compile_tpl(&outer.replace("%s", &inner), GenerateMode::Server);
            assert!(
                code.contains("$$renderer.push(`<b>c</b>`);"),
                "boundary {name} in:\n{code}"
            );
        }
    }
}

/// The other direction of the same shadow: an inner `{#each}` whose ITEM takes
/// the name back from an outer `{@const}`. The read is the item's, so it is
/// reactive again — a fix that only ever adds names to the shadow set fails
/// here.
#[test]
fn an_inner_each_item_takes_the_name_back() {
    let code = compile_tpl(
        "{#if q}\n{@const value = \"c\"}\n{#each rows as value (value.value)}\n<b>{value}</b>\n{/each}\n{/if}",
        GenerateMode::Client,
    );
    assert!(
        code.contains("var root = $.from_html(`<b> </b>`);"),
        "in:\n{code}"
    );
    assert!(
        code.contains("$.template_effect(() => $.set_text(text, $.get(value)));"),
        "in:\n{code}"
    );
}

/// A snippet PARAMETER shadowing an each index is the same defect through a
/// different declaration, and it is reactive rather than folded — so it also
/// separates "shadowed" from "not state".
#[test]
fn a_snippet_parameter_shadowing_the_index_is_still_reactive() {
    let code = compile_tpl(
        "{#each rows as _r, value}\n{#snippet s(value)}\n<b>{value}</b>\n{/snippet}\n{@render s(1)}\n{/each}",
        GenerateMode::Client,
    );
    assert!(
        code.contains("var root = $.from_html(`<b> </b>`);"),
        "in:\n{code}"
    );
    assert!(
        code.contains("$.template_effect(() => $.set_text(text, value()));"),
        "in:\n{code}"
    );
    assert!(
        code.contains("$.each(node, 1, () => rows, $.index, ($$anchor, _r) => {"),
        "in:\n{code}"
    );
}

/// The shadow ends with the block: a sibling read after the `{#if}` is the each
/// item again. Without a restore the const's entry would outlive its block.
#[test]
fn the_shadow_does_not_outlive_its_block() {
    let code = compile_tpl(
        "{#each rows as value (value.value)}\n{#if q}{@const value = \"c\"}<b>{value}</b>{/if}\n<i>{value}</i>\n{/each}",
        GenerateMode::Client,
    );
    assert!(
        code.contains("$.template_effect(() => $.set_text(text, $.get(value)));"),
        "in:\n{code}"
    );
}
