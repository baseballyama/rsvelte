//! Regression test for baseballyama/rsvelte#1981.
//!
//! A `bind:` on a component reached through a member expression
//! (`<Popover.Root bind:open />`) is a *dynamic* component: the callee is
//! introduced as the second parameter of the `$.component(...)` callback
//! (`($$anchor, Popover_Root) => { … }`). The dev-mode
//! `$$ownership_validator.binding(...)` call references that parameter, so it
//! must be emitted at the head of that callback body. It used to be pushed as
//! a sibling statement *before* `$.component(...)`, where the identifier does
//! not exist — `ReferenceError: Popover_Root is not defined` at render time.
//! The extra sibling statement also forced a spurious `{ … }` block around the
//! whole component, which the official compiler does not emit.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, CssMode, GenerateMode, compile};

fn compile_client_dev(src: &str) -> String {
    let result = compile(
        src,
        CompileOptions {
            filename: Some("BindableDotComponent.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile");
    result.js.code
}

fn index_of(out: &str, needle: &str) -> usize {
    match out.find(needle) {
        Some(idx) => idx,
        None => panic!("expected `{needle}` in the output, got:\n{out}"),
    }
}

/// Assert that the statement at `idx` opens an arrow-function body — the text
/// before it ends with `=>` followed by `{` — rather than a bare `{` block
/// wrapper hoisted outside the `$.component` callback.
fn assert_opens_arrow_body(out: &str, idx: usize) {
    let before = out[..idx].trim_end();
    assert!(
        before.ends_with('{'),
        "validator call should be the first statement of a block, got:\n{out}"
    );
    let head = before[..before.len() - 1].trim_end();
    assert!(
        head.ends_with("=>"),
        "validator call should open the `$.component` arrow callback body, \
         not a bare block wrapper, got:\n{out}"
    );
}

#[test]
fn member_expression_component_binding_validator_is_inside_component_callback() {
    let src = r#"<script>
	import * as Popover from './popover.js';
	let { open = $bindable(false) } = $props();
</script>

<Popover.Root bind:open />"#;
    let out = compile_client_dev(src);

    let component = index_of(&out, "$.component(");
    let validator = index_of(&out, "$$ownership_validator.binding('open',");
    let call = index_of(&out, "Popover_Root($$anchor");

    // (a) inside the `$.component` callback, before the component invocation
    assert!(
        component < validator,
        "validator call must come after `$.component(`, not be hoisted out of \
         the callback that declares `Popover_Root`, got:\n{out}"
    );
    assert!(
        validator < call,
        "validator call must precede the `Popover_Root($$anchor, …)` call, got:\n{out}"
    );

    // (b) no extra `{ … }` block wrapper around the component
    assert_opens_arrow_body(&out, validator);
}

#[test]
fn multiple_bindings_keep_attribute_order_inside_component_callback() {
    let src = r#"<script>
	import * as Popover from './popover.js';
	let { open = $bindable(false), value = $bindable('') } = $props();
</script>

<Popover.Root bind:open bind:value />"#;
    let out = compile_client_dev(src);

    let component = index_of(&out, "$.component(");
    let open = index_of(&out, "$$ownership_validator.binding('open',");
    let value = index_of(&out, "$$ownership_validator.binding('value',");
    let call = index_of(&out, "Popover_Root($$anchor");

    assert!(
        component < open && open < value && value < call,
        "both validator calls must sit at the head of the `$.component` callback \
         in attribute order, got:\n{out}"
    );
    assert_opens_arrow_body(&out, open);
}

/// Regression test for baseballyama/rsvelte#2073.
///
/// When `css: 'injected'` and dev-mode mutation validation are both active,
/// upstream unshifts `$$ownership_validator` (transform-client.js:379-383)
/// *before* it unshifts `$.append_styles` (transform-client.js:412-421), so
/// the later unshift call lands closer to the front: the final preamble
/// reads `$.push(...)`, `$.append_styles(...)`, `$$ownership_validator = …`.
/// rsvelte used to build `$.append_styles` at an unrelated point in the
/// component body (after the binding-group declarations), so it ended up
/// *after* `$$ownership_validator` instead of before it. No corpus entry
/// exercised this combination, so nothing caught the divergence.
///
/// Reuses the `<Popover.Root bind:open />` shape from the tests above (a
/// verified `needs_mutation_validation` trigger) plus a `<style>` block to
/// also set `analysis.inject_styles`.
#[test]
fn append_styles_precedes_ownership_validator_when_both_present() {
    let src = r#"<script>
	import * as Popover from './popover.js';
	let { open = $bindable(false) } = $props();
</script>

<Popover.Root bind:open />

<style>
	button { color: red; }
</style>"#;
    let result = compile(
        src,
        CompileOptions {
            filename: Some("Comp.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            css: CssMode::Injected,
            ..Default::default()
        },
    )
    .expect("compile");
    let out = result.js.code;

    let push = index_of(&out, "$.push(");
    let append_styles = index_of(&out, "$.append_styles(");
    let ownership_validator = index_of(
        &out,
        "$$ownership_validator = $.create_ownership_validator(",
    );

    assert!(
        push < append_styles && append_styles < ownership_validator,
        "expected `$.push`, then `$.append_styles`, then `$$ownership_validator` \
         (matching upstream's unshift call order), got:\n{out}"
    );
}
