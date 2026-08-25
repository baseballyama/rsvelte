//! A top-level snippet that closes over an instance binding moves to the same
//! render-function anchor used by an inferred `$$ComponentProps` declaration.
//! Upstream applies the script edits first and moves the snippet afterwards,
//! so the moved snippet precedes the declaration at that shared anchor.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

#[test]
fn instance_hoisted_snippet_precedes_inferred_component_props() {
    let source = r#"<script lang="ts">
	let { x = 1 } = $props();
</script>

{#snippet row(v: number)}<i>{v}</i>{/snippet}
{@render row(x)}
"#;
    let code = svelte2tsx(
        source,
        Svelte2TsxOptions {
            filename: "snip.svelte".into(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx")
    .code;

    let snippet = code
        .find("const row")
        .unwrap_or_else(|| panic!("hoisted snippet missing:\n{code}"));
    let props = code
        .find("type $$ComponentProps")
        .unwrap_or_else(|| panic!("inferred component props missing:\n{code}"));
    assert!(
        snippet < props,
        "the later snippet move must precede the props edit at their shared anchor:\n{code}"
    );
}
