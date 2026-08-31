//! Upstream's `validate_mutation` resolves the mutation's root through
//! `state.scope`, so a local declaration that shadows a prop is not a prop
//! mutation. Phase 3's current scope for an inline event handler is the
//! template's, so a name-only lookup reaches the prop and wrapped a local
//! write in `$$ownership_validator.mutation`.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client_dev(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Shadowed.svelte".to_string()),
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
fn a_local_shadowing_a_prop_is_not_a_prop_mutation() {
    let out = compile_client_dev(
        r#"<script>
	export let data;
	export let load;
</script>
<button
	on:click={async () => {
		let data = await load();
		if (data) {
			data.done = true;
		}
	}}>shadowed</button
>
<button on:click={() => (data.done = true)}>prop</button>
"#,
    );
    // The second handler writes the prop, so exactly one wrap is expected; the
    // shadowed write must contribute none.
    assert_eq!(
        out.matches("$$ownership_validator.mutation").count(),
        1,
        "only the prop write may be validated, got:\n{out}"
    );
}
