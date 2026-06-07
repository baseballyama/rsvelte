//! Regression test for issue #726: Svelte 5 function bindings
//! `bind:prop={getFn, setFn}` must be lowered to a valid TSX overlay that
//! type-checks both callables via `__sveltets_2_get_set_binding(...)`, instead
//! of splicing the raw `getFn, setFn` tuple into the props object literal
//! (which produces `Property assignment expected.` syntax errors).
//!
//! Mirrors the `isGetSetBinding` branch of upstream svelte2tsx
//! (`htmlxtojsx_v2/nodes/Binding.ts`).

use rsvelte_core::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn to_tsx(src: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: "Bind.svelte".to_string(),
        is_ts_file: true,
        ..Default::default()
    };
    svelte2tsx(src, opts).expect("svelte2tsx").code
}

#[test]
fn component_function_binding_uses_get_set_binding() {
    let src = r#"<script lang="ts">
  import Child from './Child.svelte';
  let open = $state(false);
</script>
<Child bind:expanded={() => open, (v: boolean) => { open = v; }} />
"#;
    let out = to_tsx(src);

    // The getter/setter pair must be wrapped so both callables are checked.
    assert!(
        out.contains(
            "expanded:__sveltets_2_get_set_binding(() => open,(v: boolean) => { open = v; })"
        ),
        "function binding should be wrapped in __sveltets_2_get_set_binding, got:\n{out}"
    );

    // The raw tuple must NOT appear in the props literal (invalid TSX).
    assert!(
        !out.contains("expanded:() => open, (v: boolean)"),
        "raw getter/setter tuple must not be spliced into props, got:\n{out}"
    );
}

#[test]
fn ordinary_component_binding_unchanged() {
    let src = r#"<script lang="ts">
  import Child from './Child.svelte';
  let open = $state(false);
</script>
<Child bind:expanded={open} />
"#;
    let out = to_tsx(src);

    assert!(
        out.contains("expanded:open"),
        "ordinary binding should pass the expression through unchanged, got:\n{out}"
    );
    assert!(
        !out.contains("__sveltets_2_get_set_binding"),
        "ordinary binding must not use the get/set wrapper, got:\n{out}"
    );
}

#[test]
fn element_function_binding_uses_get_set_binding() {
    let src = r#"<script lang="ts">
  let v = $state("");
</script>
<input bind:value={() => v, (nv: string) => v = nv} />
"#;
    let out = to_tsx(src);

    assert!(
        out.contains("\"bind:value\":__sveltets_2_get_set_binding(() => v,(nv: string) => v = nv)"),
        "element function binding should be wrapped in __sveltets_2_get_set_binding, got:\n{out}"
    );
}
