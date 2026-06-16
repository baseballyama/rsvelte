//! Regression test for issue #923.
//!
//! A runes-mode generic component (`<script generics="T">` + `$props()`) whose
//! `T` is inferred from one prop must thread `T` into its other `T`-dependent
//! props (callback / snippet params). Previously rsvelte emitted
//! `__sveltets_2_fn_component($$render())`, which discards `T` (the component
//! type alias `type C<T> = ReturnType<typeof C>` never consumes its own `<T>`),
//! so `T` could not be inferred at the call site and those params collapsed to
//! `unknown`. The fix emits the upstream `__sveltets_Render<T>` +
//! `$$IsomorphicComponent` shape, whose generic constructor / call signatures
//! let TypeScript infer `T` from the supplied props.

use rsvelte_core::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn overlay(src: &str) -> String {
    svelte2tsx(
        src,
        Svelte2TsxOptions {
            filename: "G.svelte".into(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx")
    .code
}

const GENERIC: &str = "<script lang=\"ts\" generics=\"T\">\n\
    import type { Snippet } from 'svelte';\n\
    let { rows, getKey, rowSnippet }: { rows: T[]; getKey: (row: T) => string; rowSnippet: Snippet<[{ row: T }]>; } = $props();\n\
    </script>\n\
    {#each rows as r}{getKey(r)}{@render rowSnippet({ row: r })}{/each}";

#[test]
fn runes_generic_component_uses_isomorphic_component_shape() {
    let code = overlay(GENERIC);
    // The generic must be threaded through a generic constructor / call sig so
    // TypeScript can infer it from the props at the call site.
    assert!(
        code.contains("class __sveltets_Render<T>"),
        "missing generic __sveltets_Render<T>:\n{code}"
    );
    assert!(
        code.contains("props(): ReturnType<typeof $$render<T>>['props']"),
        "render props() not annotated with the generic render return type:\n{code}"
    );
    assert!(
        code.contains("interface $$IsomorphicComponent") && code.contains("new <T>(options:"),
        "missing $$IsomorphicComponent with a generic constructor:\n{code}"
    );
}

#[test]
fn runes_generic_component_does_not_discard_generic_via_fn_component() {
    let code = overlay(GENERIC);
    // The `fn_component` form discarded `T`; it must not be used for a generic
    // component, and the type alias must consume its own `<T>`.
    assert!(
        !code.contains("__sveltets_2_fn_component"),
        "generic component still lowered via fn_component (discards T):\n{code}"
    );
    assert!(
        code.contains("type G__SvelteComponent_<T> = InstanceType<typeof G__SvelteComponent_<T>>"),
        "component type alias does not consume its own <T>:\n{code}"
    );
}

#[test]
fn t_dependent_prop_types_are_preserved_in_props() {
    let code = overlay(GENERIC);
    // The props type must keep the `T`-dependent prop signatures verbatim so
    // that, once `T` is inferred, the callback / snippet params resolve.
    assert!(
        code.contains("getKey: (row: T) => string"),
        "callback prop type lost T:\n{code}"
    );
    assert!(
        code.contains("rowSnippet: Snippet<[{ row: T }]>"),
        "snippet prop type lost T:\n{code}"
    );
}

#[test]
fn non_generic_runes_component_still_uses_fn_component() {
    // Guard: the common (non-generic) runes path is unchanged.
    let src = "<script lang=\"ts\">let { a }: { a: number } = $props();</script>";
    let code = overlay(src);
    assert!(
        code.contains("__sveltets_2_fn_component($$render())"),
        "non-generic runes component should still use fn_component:\n{code}"
    );
    assert!(
        !code.contains("$$IsomorphicComponent"),
        "non-generic runes component should not emit IsomorphicComponent:\n{code}"
    );
}
