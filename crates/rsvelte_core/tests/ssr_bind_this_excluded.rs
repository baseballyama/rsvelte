//! Regression test: `bind:this` must NOT appear in server-side attribute output.
//!
//! `bind:this` is a client-only binding that captures a DOM reference; it has no
//! server representation. The official compiler filters it in
//! `build_element_attributes` (shared/element.js line 113) before assembling the
//! `$.attributes({…})` spread object.
//!
//! Bug: the rsvelte `build_svelte_element_spread_attributes` (svelte_element.rs)
//! was adding a `this: <expr>` property to the spread object because it processed
//! every `BindDirective` without skipping the `"this"` variant. The regular-element
//! spread path in `element.rs` already handled this correctly.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn ssr(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// `<svelte:element>` with `bind:this` and a spread must NOT include `this: ref`
/// in the `$.attributes({…})` object.
#[test]
fn svelte_element_bind_this_not_in_spread_object() {
    let src = r#"<script>
let ref = $state(null);
let tag = $state('div');
let restProps = {};
</script>
<svelte:element this={tag} bind:this={ref} tabindex={0} {...restProps} />"#;

    let out = ssr(src);
    // Must NOT contain a `this:` property in the output.
    assert!(
        !out.contains("this: ref"),
        "`this: ref` must be absent in server output, got:\n{out}"
    );
    // Sanity: the element call is still emitted.
    assert!(
        out.contains("$.element") || out.contains("$.attributes"),
        "expected $.element or $.attributes in output, got:\n{out}"
    );
}

/// Regular element with `bind:this` and a spread must also NOT include `this: ref`.
/// This was already fixed but is confirmed here as a guard.
#[test]
fn regular_element_bind_this_not_in_spread_object() {
    let src = r#"<script>
let ref = $state(null);
let restProps = {};
</script>
<div bind:this={ref} tabindex={0} {...restProps}></div>"#;

    let out = ssr(src);
    assert!(
        !out.contains("this: ref"),
        "`this: ref` must be absent in server output, got:\n{out}"
    );
}
