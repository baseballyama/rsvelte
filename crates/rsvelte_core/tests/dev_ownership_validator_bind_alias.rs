//! `$$ownership_validator.mutation(...)`'s first argument is `binding.prop_alias`
//! verbatim (`shared/utils.js:436`), and upstream only ever assigns that alias
//! from a `$props()` destructuring key — so a legacy `export let` prop mutated
//! through a `bind:` directive must report `null`, not the variable name.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client_dev(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("BindAlias.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn legacy_component_bind_member_reports_a_null_alias() {
    let out = compile_client_dev(
        r#"<script>
	import Child from './Child.svelte';
	export let field = {};
</script>
<Child bind:value={field.name} />
"#,
    );
    assert!(
        out.contains("$ownership_validator.mutation(null, ['field', 'name'],"),
        "expected a null alias for the legacy prop, got:\n{out}"
    );
}

#[test]
fn runes_component_bind_member_reports_the_props_key() {
    let out = compile_client_dev(
        r#"<script>
	import Child from './Child.svelte';
	let { 'data-field': field = $bindable({}) } = $props();
</script>
<Child bind:value={field.name} />
"#,
    );
    assert!(
        out.contains("$ownership_validator.mutation('data-field', ['field', 'name'],"),
        "expected the $props() key as the alias, got:\n{out}"
    );
}

#[test]
fn legacy_element_bind_member_reports_a_null_alias() {
    let out = compile_client_dev(
        r#"<script>
	export let field = {};
</script>
<input bind:value={field.name} />
"#,
    );
    assert!(
        out.contains("$ownership_validator.mutation(null, ['field', 'name'],"),
        "expected a null alias for the legacy prop, got:\n{out}"
    );
}
