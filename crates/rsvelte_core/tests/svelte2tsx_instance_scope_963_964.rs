//! Regression tests for the `--tsgo` / svelte-check overlay scoping bugs
//! #963 and #964. Both were cases where the TSX overlay relocated an
//! instance-`<script>` type declaration out of the scope where the rest of the
//! script referenced it, so a name went out of scope and tsgo reported a
//! spurious "Cannot find name" error. Official svelte-check reports 0 errors
//! for every component below.
//!
//! The assertions check the structural property that makes tsgo resolve the
//! names — i.e. the overlay matches official svelte2tsx's scoping strategy
//! (`HoistableInterfaces.moveHoistableInterfaces`):
//!   * a hoisted interface's type dependencies are hoisted with it (#963), and
//!   * nothing is hoisted out of `function $$render<...>()` when the props
//!     interface references a component `generics=` parameter, so the generic
//!     parameters stay in scope for local type aliases (#964).

use rsvelte_core::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn convert(name: &str, src: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: format!("{name}.svelte"),
        is_ts_file: true,
        ..Default::default()
    };
    svelte2tsx(src, opts).expect("svelte2tsx ok").code
}

/// Byte index of `function $$render` in the overlay — the boundary between
/// module scope (before) and the render-function body (after).
fn render_start(code: &str) -> usize {
    code.find("function $$render")
        .unwrap_or_else(|| panic!("no $$render in:\n{code}"))
}

/// #963: an instance `export type` that a hoisted interface depends on must be
/// hoisted with it (i.e. kept in scope), and its `export` keyword preserved.
#[test]
fn issue_963_exported_type_referenced_by_props_interface_stays_in_scope() {
    let src = "<script lang=\"ts\">\n  export type Phase = 'a' | 'b';\n  interface Props { phase: Phase }\n  let { phase }: Props = $props();\n  const labels: Record<Phase, string> = { a: 'A', b: 'B' };\n</script>\n<span>{labels[phase]}</span>\n";
    let code = convert("Issue963", src);
    let render = render_start(&code);

    // `export type Phase` is hoisted ABOVE `$$render` (so the also-hoisted
    // `interface Props` that references it can see it) and keeps its `export`.
    let phase_pos = code
        .find("export type Phase")
        .unwrap_or_else(|| panic!("Phase export dropped:\n{code}"));
    assert!(
        phase_pos < render,
        "`export type Phase` must be hoisted before $$render:\n{code}"
    );

    // `interface Props` is also above `$$render` and AFTER `Phase` (dependency
    // ordering — a type lands before the interface that depends on it).
    let props_pos = code
        .find("interface Props")
        .unwrap_or_else(|| panic!("no interface Props:\n{code}"));
    assert!(
        props_pos < render && phase_pos < props_pos,
        "`Phase` must precede `interface Props`, both before $$render:\n{code}"
    );
}

/// #964: a local generic `type` alias must not displace the component
/// `generics=` parameters. Because the props interface references `L`, nothing
/// is hoisted out of `$$render<L>()`, so both `L` and the alias's own `<A>`
/// coexist.
#[test]
fn issue_964_local_generic_alias_keeps_component_generics_in_scope() {
    let src = "<script lang=\"ts\" generics=\"L\">\n  type Wrapper<A> = { value: A };\n  let { item }: { item: Wrapper<L> } = $props();\n</script>\n<span>{item.value}</span>\n";
    let code = convert("Issue964", src);
    let render = render_start(&code);

    // The render function is generic over `L`.
    assert!(
        code.contains("function $$render<L>"),
        "render function must be generic over L:\n{code}"
    );

    // The local alias stays INSIDE $$render<L>() (not hoisted to module scope).
    let wrapper_pos = code
        .find("type Wrapper<A>")
        .unwrap_or_else(|| panic!("no Wrapper alias:\n{code}"));
    assert!(
        wrapper_pos > render,
        "`type Wrapper<A>` must stay inside $$render:\n{code}"
    );

    // The synthetic props type referencing `L` also stays INSIDE $$render<L>().
    let cp_pos = code
        .find("type $$ComponentProps")
        .unwrap_or_else(|| panic!("no $$ComponentProps:\n{code}"));
    assert!(
        cp_pos > render,
        "`type $$ComponentProps` referencing L must stay inside $$render:\n{code}"
    );
    assert!(
        code.contains("Wrapper<L>"),
        "props type must reference Wrapper<L>:\n{code}"
    );
}

/// #964 two-parameter variant: `generics="L, R"` + local `type Q<A, B>`.
#[test]
fn issue_964_two_param_generics_with_local_alias() {
    let src = "<script lang=\"ts\" generics=\"L, R\">\n  type Q<A, B> = { a: A; b: B };\n  let { q }: { q: Q<L, R> } = $props();\n</script>\n<span>{q.a}</span>\n";
    let code = convert("Issue964b", src);
    let render = render_start(&code);

    assert!(
        code.contains("function $$render<L, R>"),
        "render function must be generic over L, R:\n{code}"
    );
    let q_pos = code
        .find("type Q<A, B>")
        .unwrap_or_else(|| panic!("no Q alias:\n{code}"));
    let cp_pos = code
        .find("type $$ComponentProps")
        .unwrap_or_else(|| panic!("no $$ComponentProps:\n{code}"));
    assert!(
        q_pos > render && cp_pos > render,
        "local alias and $$ComponentProps must stay inside $$render<L, R>:\n{code}"
    );
    assert!(
        code.contains("Q<L, R>"),
        "props type must reference Q<L, R>:\n{code}"
    );
}
