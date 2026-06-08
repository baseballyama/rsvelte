//! #801: a runes-mode component declared with `generics="…"` must generate a
//! generic component type alias so `Foo<X>` references type-check under tsgo.

use rsvelte_core::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

#[test]
fn runes_generics_component_type_is_generic() {
    let src = "<script lang=\"ts\" generics=\"T extends string\">\n  let { items }: { items: T[] } = $props();\n</script>\n{#each items as it}<span>{it}</span>{/each}\n";
    let opts = Svelte2TsxOptions {
        filename: "G.svelte".to_string(),
        is_ts_file: true,
        ..Default::default()
    };
    let code = svelte2tsx(src, opts).expect("svelte2tsx ok").code;
    // The component type alias must carry the declared type parameters so a
    // `G<'a' | 'b'>` reference is valid (was non-generic → tsgo "is not generic").
    assert!(
        code.contains("type G__SvelteComponent_<T extends string> ="),
        "component type alias must be generic:\n{code}"
    );
    assert!(
        !code.contains("type G__SvelteComponent_ ="),
        "non-generic alias must not be emitted:\n{code}"
    );
}

#[test]
fn runes_without_generics_stays_non_generic() {
    let src = "<script lang=\"ts\">\n  let { n }: { n: number } = $props();\n</script>\n<span>{n}</span>\n";
    let opts = Svelte2TsxOptions {
        filename: "P.svelte".to_string(),
        is_ts_file: true,
        ..Default::default()
    };
    let code = svelte2tsx(src, opts).expect("svelte2tsx ok").code;
    assert!(
        code.contains("type P__SvelteComponent_ ="),
        "non-generic component keeps the plain alias:\n{code}"
    );
}
