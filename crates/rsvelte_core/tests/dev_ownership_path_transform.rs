//! `validate_mutation()` builds a computed path element through the binding's
//! own read transform (`transform?.read ? transform.read(left.property) :
//! left.property`, `shared/utils.js`), so an each-block index reaches the
//! ownership validator as `$.get(index)` and not as a bare reference to a
//! signal.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client_dev(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Own.svelte".to_string()),
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
fn a_computed_path_element_goes_through_its_read_transform() {
    let out = compile_client_dev(
        r#"<script>
	import Nested from './Nested.svelte';

	export let letters = ['a', 'b', 'c'];
</script>

<Nested items={letters} let:index>
	<input bind:value={letters[index]}>
</Nested>
"#,
    );
    assert!(
        out.contains(r#"['letters', $.get(index)]"#),
        "the slot-let index should be read through its transform, got:\n{out}"
    );
}

#[test]
fn a_static_path_element_stays_a_literal() {
    let out = compile_client_dev(
        r#"<script>
	export let form;
</script>

<input bind:value={form.name}>
"#,
    );
    assert!(
        out.contains(r#"['form', 'name']"#),
        "a non-computed member should stay a string literal, got:\n{out}"
    );
}
