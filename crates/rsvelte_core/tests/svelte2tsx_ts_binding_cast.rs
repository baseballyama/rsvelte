//! Regression tests for #1645 follow-up: TypeScript assertion wrappers are now
//! preserved in the parse AST, but svelte2tsx's template lowering expects them
//! stripped (it moves a binding's trailing cast onto the assignment RHS and uses
//! the bare target on the reactive-widener shim). svelte2tsx strips TS wrappers
//! from the fragment before lowering, so a cast must never land on an assignment
//! LHS. Mirrors the bits-ui / shadcn-svelte corpus failures.

use rsvelte_core::svelte2tsx::{
    Svelte2TsxMode, Svelte2TsxNamespace, Svelte2TsxOptions, SvelteVersion, svelte2tsx,
};

fn run(src: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: "Main.svelte".into(),
        is_ts_file: true,
        mode: Svelte2TsxMode::Ts,
        accessors: false,
        namespace: Svelte2TsxNamespace::Html,
        version: SvelteVersion::V5,
        runes: None,
        emit_jsdoc: false,
        rewrite_external_imports: None,
    };
    svelte2tsx(src, opts)
        .expect("svelte2tsx should succeed")
        .code
}

#[test]
fn bind_this_cast_moves_to_rhs() {
    // `bind:this={el as HTMLElement}` → `el = $$_var as HTMLElement;`, never
    // `(el as HTMLElement) = $$_var;`.
    let src = "<script lang=\"ts\">let el;</script><div bind:this={el as HTMLElement}></div>";
    let out = run(src);
    assert!(
        !out.contains("(el as HTMLElement) ="),
        "cast must not land on the assignment LHS:\n{out}"
    );
    assert!(
        out.contains("el = ") && out.contains("as HTMLElement;"),
        "cast should move onto the RHS:\n{out}"
    );
}

#[test]
fn bind_value_whole_cast_target_is_bare() {
    // `bind:value={value as never}` on a component: the reactive widener uses the
    // bare `value`, while the prop value keeps the cast.
    let src = "<script lang=\"ts\">let value: string = \"\";</script><Combobox bind:value={value as never} />";
    let out = run(src);
    assert!(
        !out.contains("(value as never) ="),
        "cast must not land on the assignment LHS:\n{out}"
    );
    assert!(
        out.contains("() => value = __sveltets_2_any(null);"),
        "reactive widener should use the bare target:\n{out}"
    );
    assert!(
        out.contains("value:value as never"),
        "the prop value should keep the cast:\n{out}"
    );
}

#[test]
fn bind_value_non_null_target_is_bare() {
    let src = "<script lang=\"ts\">let binding = null;</script><input type=\"number\" bind:value={binding!} />";
    let out = run(src);
    assert!(
        !out.contains("binding!) = ") && !out.contains("(binding!) ="),
        "non-null assertion must not land on the assignment LHS:\n{out}"
    );
    assert!(
        out.contains("() => binding = __sveltets_2_any(null);"),
        "reactive widener should use the bare target:\n{out}"
    );
}
