//! Regression tests for issue #1982 — a top-level `{#snippet}` was hoisted to
//! module scope even when it closed over component scope through an attribute
//! form the hoistability walk never inspected (`{@attach …}`, `use:` /
//! `transition:` / `animate:` / `class:` / `style:`), producing a
//! `ReferenceError` at render time.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_js(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// True when `const warning = …` is emitted inside the component function
/// (i.e. the snippet was NOT hoisted to module scope).
fn snippet_is_inside_component(out: &str) -> bool {
    let component = out
        .find("export default function")
        .unwrap_or_else(|| panic!("no component function in:\n{out}"));
    let snippet = out
        .find("warning = ")
        .unwrap_or_else(|| panic!("no `warning` snippet in:\n{out}"));
    snippet > component
}

#[test]
fn attach_referencing_component_scope_blocks_hoist() {
    let src = r#"<script>
	let count = $state(0);
	function onRendered() {
		count++;
		return () => { count--; };
	}
</script>

{#snippet warning()}
	<li {@attach () => onRendered()}>x</li>
{/snippet}

{@render warning()}"#;
    let out = compile_js(src);
    assert!(
        snippet_is_inside_component(&out),
        "snippet closing over `onRendered` via {{@attach}} must stay in the component, got:\n{out}"
    );
}

#[test]
fn use_directive_referencing_component_scope_blocks_hoist() {
    let src = r#"<script>
	let count = $state(0);
	function action(node) {
		count++;
	}
</script>

{#snippet warning()}
	<li use:action>x</li>
{/snippet}

{@render warning()}"#;
    let out = compile_js(src);
    assert!(
        snippet_is_inside_component(&out),
        "snippet closing over `action` via use: must stay in the component, got:\n{out}"
    );
}

#[test]
fn class_directive_shorthand_referencing_component_scope_blocks_hoist() {
    let src = r#"<script>
	let active = $state(false);
</script>

{#snippet warning()}
	<li class:active>x</li>
{/snippet}

{@render warning()}"#;
    let out = compile_js(src);
    assert!(
        snippet_is_inside_component(&out),
        "snippet closing over `active` via class: must stay in the component, got:\n{out}"
    );
}

#[test]
fn declaration_tag_declared_name_still_hoists() {
    // `{let x = 1}` declares a binding inside the snippet, so the later `{x}` is a
    // local reference — upstream skips it via
    // `binding.scope.function_depth >= scope.function_depth`.
    let src = r#"<script>
	let count = $state(0);
</script>

{#snippet warning()}
	{let x = 1}
	<li>{x}</li>
{/snippet}

<p>{count}</p>
{@render warning()}"#;
    let out = compile_js(src);
    assert!(
        !snippet_is_inside_component(&out),
        "snippet referencing only its own {{let}} declaration should hoist, got:\n{out}"
    );
}

#[test]
fn attach_referencing_module_scope_still_hoists() {
    // The fix must not defeat the hoisting optimisation: an attachment that only
    // touches imports has nothing to close over.
    let src = r#"<script>
	import { onRendered } from './attachments.js';
	let count = $state(0);
</script>

{#snippet warning()}
	<li {@attach onRendered}>x</li>
{/snippet}

<p>{count}</p>
{@render warning()}"#;
    let out = compile_js(src);
    assert!(
        !snippet_is_inside_component(&out),
        "snippet whose attachment only uses an import should still hoist, got:\n{out}"
    );
}
