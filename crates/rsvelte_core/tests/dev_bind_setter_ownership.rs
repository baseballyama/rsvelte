//! A component `bind:` whose expression is a member of a prop still goes
//! through `validate_mutation` (`shared/utils.js:390`) — it gates on the root
//! binding being a prop, not on whether the mutation itself is wrapped. A
//! non-bindable prop in runes mode assigns the member directly, and that bare
//! assignment is what the ownership wrap receives.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client_dev(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
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
fn a_runes_prop_member_bind_setter_is_validated() {
    let out = compile_client_dev(
        r#"<script>
	import Checkbox from './Checkbox.svelte';

	let { workspace } = $props();
</script>

<Checkbox bind:checked={workspace.vim} />
"#,
    );
    assert!(
        out.contains("$$ownership_validator.mutation("),
        "got:\n{out}"
    );
    assert!(out.contains("['workspace', 'vim']"), "got:\n{out}");
}

#[test]
fn a_state_member_bind_setter_is_not() {
    let out = compile_client_dev(
        r#"<script>
	import Checkbox from './Checkbox.svelte';

	let options = $state({ vim: false });
</script>

<Checkbox bind:checked={options.vim} />
"#,
    );
    assert!(
        !out.contains("$$ownership_validator.mutation("),
        "got:\n{out}"
    );
}
