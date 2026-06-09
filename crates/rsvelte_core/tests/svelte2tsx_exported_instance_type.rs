//! #963: a type/interface declared with `export` in the **instance**
//! `<script>` (`export type Phase = …`) must stay visible to same-component
//! references under `--tsgo`.
//!
//! In TypeScript, `export type Phase` is a `TypeAliasDeclaration` carrying an
//! `export` modifier, so upstream svelte2tsx's `HoistableInterfaces` collects
//! it like any other type. OXC instead wraps it in an `ExportNamedDeclaration`,
//! so rsvelte used to miss it: a dependent `interface Props { phase: Phase }`
//! got hoisted above `function $$render()` while the exported `Phase` stayed
//! inside, breaking the reference (`Cannot find name 'Phase'`).
//!
//! The fix registers exported instance-script type/interface declarations as
//! hoist candidates, so `Phase` hoists *with* (and before) `Props`.

use rsvelte_core::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn tsx(src: &str) -> String {
    svelte2tsx(
        src,
        Svelte2TsxOptions {
            filename: "PreReleaseLabel.svelte".to_string(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx ok")
    .code
}

#[test]
fn exported_instance_type_hoists_with_dependent_interface() {
    let src = "<script lang=\"ts\">\n  export type Phase = 'a' | 'b';\n  interface Props { phase: Phase }\n  let { phase }: Props = $props();\n  const labels: Record<Phase, string> = { a: 'A', b: 'B' };\n</script>\n<span>{labels[phase]}</span>\n";
    let code = tsx(src);

    let render_pos = code.find("function $$render").expect("must emit $$render");
    let phase_pos = code
        .find("type Phase =")
        .expect("exported `Phase` must survive in the overlay");
    let props_pos = code
        .find("interface Props")
        .expect("`Props` must survive in the overlay");

    // Both the exported type and the dependent interface must be hoisted above
    // `function $$render()` so the `interface Props { phase: Phase }` reference
    // resolves at module scope.
    assert!(
        phase_pos < render_pos,
        "exported `type Phase` must be hoisted above $$render():\n{code}"
    );
    assert!(
        props_pos < render_pos,
        "`interface Props` must be hoisted above $$render():\n{code}"
    );
    // Topological order: the dependency (`Phase`) must precede the dependent
    // (`Props`).
    assert!(
        phase_pos < props_pos,
        "`type Phase` must precede `interface Props`:\n{code}"
    );
    // The `export` keyword is stripped from the instance script (it's not a
    // real module export of the overlay).
    assert!(
        !code.contains("export type Phase"),
        "instance `export` keyword must be stripped:\n{code}"
    );
}
