//! Regression test for member-expression mutations of a legacy `export let` prop.
//!
//! The prop list that drives `$$ownership_validator.mutation(...)` was gated on
//! `analysis.runes`, so legacy components emitted neither the wrapper nor the
//! `$.create_ownership_validator($$props)` preamble.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client_dev(src: &str) -> String {
    let result = compile(
        src,
        CompileOptions {
            filename: Some("LegacyPropMutation.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile");
    result.js.code
}

#[test]
fn legacy_prop_member_assignment_is_ownership_validated() {
    let src = r#"<script>
	export let item = {};
	function go() {
		item.name = 1;
	}
</script>
<button on:click={go}>x</button>
"#;
    let out = compile_client_dev(src);
    assert!(
        out.contains("$ownership_validator = $.create_ownership_validator($$props)"),
        "expected the ownership validator preamble, got:\n{out}"
    );
    // Upstream only assigns `prop_alias` from a `$props()` key, so legacy props report `null`.
    assert!(
        out.contains(
            "$ownership_validator.mutation(null, ['item', 'name'], item(item().name = 1, true), 4, 2)"
        ),
        "expected the legacy mutation to be wrapped, got:\n{out}"
    );
}

#[test]
fn legacy_computed_member_assignment_is_ownership_validated() {
    let src = r#"<script>
	export let foo = {};
	let bar = 'baz';
	foo[bar] = 1;
</script>
"#;
    let out = compile_client_dev(src);
    assert!(
        out.contains(
            "$ownership_validator.mutation(null, ['foo', bar], foo(foo()[bar] = 1, true), 4, 1)"
        ),
        "expected the computed legacy mutation to be wrapped, got:\n{out}"
    );
}

#[test]
fn runes_prop_alias_is_still_reported() {
    let src = r#"<script>
	let { item } = $props();
	function go() {
		item.name = 1;
	}
</script>
<button onclick={go}>x</button>
"#;
    let out = compile_client_dev(src);
    assert!(
        out.contains("$ownership_validator.mutation('item', ['item', 'name'], item().name = 1"),
        "expected the runes alias to stay a string literal, got:\n{out}"
    );
}
