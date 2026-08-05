//! Regression test for `bind:this={obj.foo}` where `obj` is a prop.
//!
//! Upstream builds the `bind:this` setter by visiting a synthesized
//! `obj.foo = $$value` assignment, so it passes through `validate_mutation()`.
//! rsvelte builds that setter directly, so it emitted neither the wrapper nor
//! the `$.create_ownership_validator($$props)` preamble.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client_dev(src: &str) -> String {
    let result = compile(
        src,
        CompileOptions {
            filename: Some("BindThisOwnership.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile");
    result.js.code
}

#[test]
fn bind_this_component_computed_prop_member_is_ownership_validated() {
    let src = r#"<script>
	import Foo from './Foo.svelte';
	export let foo = [];
</script>
<Foo bind:this={foo['computed']}/>
"#;
    let out = compile_client_dev(src);
    assert!(
        out.contains("$ownership_validator = $.create_ownership_validator($$props)"),
        "expected the ownership validator preamble, got:\n{out}"
    );
    // Upstream only assigns `prop_alias` from a `$props()` key, so legacy props report `null`.
    assert!(
        out.contains("$ownership_validator.mutation(null, ['foo', 'computed'],"),
        "expected the bind:this setter to be wrapped, got:\n{out}"
    );
}

#[test]
fn bind_this_element_prop_member_is_ownership_validated() {
    let src = r#"<script>
	export let refs = {};
</script>
<div bind:this={refs.node}></div>
"#;
    let out = compile_client_dev(src);
    assert!(
        out.contains("$ownership_validator.mutation(null, ['refs', 'node'],"),
        "expected the element bind:this setter to be wrapped, got:\n{out}"
    );
}

/// Upstream sets `needs_mutation_validation` before building the path, so a
/// target whose path cannot be built still emits the preamble.
#[test]
fn unbuildable_path_still_emits_the_preamble() {
    let src = r#"<script>
	import Parent from './Parent.svelte';
	export let configs = [];
	export let parents = {};
</script>
{#each configs as config}
	<Parent bind:this={parents[config.testcase]} />
{/each}
"#;
    let out = compile_client_dev(src);
    assert!(
        out.contains("$ownership_validator = $.create_ownership_validator($$props)"),
        "expected the ownership validator preamble, got:\n{out}"
    );
    assert!(
        !out.contains("$ownership_validator.mutation"),
        "expected no wrapper for an unbuildable path, got:\n{out}"
    );
}

#[test]
fn bind_this_on_a_local_is_not_ownership_validated() {
    let src = r#"<script>
	let refs = {};
</script>
<div bind:this={refs.node}></div>
"#;
    let out = compile_client_dev(src);
    assert!(
        !out.contains("$ownership_validator"),
        "expected no ownership validation for a local, got:\n{out}"
    );
}
