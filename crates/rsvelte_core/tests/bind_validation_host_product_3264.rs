//! Upstream's `BindDirective` visitor is one function: the `parent_type` block
//! at the top validates the binding NAME against the host, and everything below
//! it — the getter/setter arm, `bind_invalid_expression`, `bind_invalid_value`,
//! `bind_group_invalid_snippet_parameter` — is host-agnostic and runs for every
//! parent alike. rsvelte had one arm per element visitor, and four of them were
//! given only part of the tail (issues #3264, #3266, #3268):
//!
//! - `<svelte:element>` ran the name check and nothing else,
//! - `<C>` / `<svelte:self>` / `<svelte:component>` skipped the getter/setter arm,
//! - the duplicate-attribute check had a second copy in phase 2 without the
//!   `this` exemption the parser's copy (and upstream) has,
//! - `<svelte:window|document|body>` validated a `bind:` before it had rejected
//!   the attributes the element cannot carry at all.
//!
//! The over-acceptances were not merely byte divergences: `bind:clientWidth={o?.k}`
//! on `<svelte:element>` emitted `($$value) => o?.k = $$value`, which no JS
//! parser accepts.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_err(src: &str, generate: GenerateMode) -> Option<String> {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .err()
    .map(|e| format!("{e:?}"))
}

const SCRIPT: &str = "<script>\n\timport C from './C.svelte';\n\tlet el = $state(null);\n\tlet v = $state('v');\n\tlet tag = $state('div');\n\tlet tag2 = $state('span');\n\tlet o = $state({ k: 1 });\n\tlet rest = $state({});\n</script>\n";

fn errors_with(markup: &str, code: &str) {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let src = format!("{SCRIPT}{markup}");
        let err = compile_err(&src, generate)
            .unwrap_or_else(|| panic!("{markup} must not compile ({generate:?})"));
        assert!(
            err.contains(code),
            "expected {code} for {markup} ({generate:?}), got: {err}"
        );
    }
}

fn compiles(markup: &str) {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let src = format!("{SCRIPT}{markup}");
        assert!(
            compile_err(&src, generate).is_none(),
            "{markup} should compile ({generate:?})"
        );
    }
}

/// #3264 family 1. The five size bindings and `bind:this` reach the assignment
/// target check on `<div>`; on `<svelte:element>` and `<svelte:component>` they
/// did not, and the client emitted an optional chain in assignment position.
#[test]
fn bind_invalid_expression_reaches_every_host() {
    for name in [
        "clientWidth",
        "clientHeight",
        "offsetWidth",
        "offsetHeight",
        "contentRect",
        "borderBoxSize",
        "contentBoxSize",
        "devicePixelContentBoxSize",
        "this",
    ] {
        errors_with(
            &format!("<svelte:element this={{tag}} bind:{name}={{o?.k}}>x</svelte:element>"),
            "bind_invalid_expression",
        );
    }
    for name in ["this", "value", "x", "innerWidth", "scrollX"] {
        errors_with(
            &format!("<svelte:component this={{C}} bind:{name}={{o?.k}} />"),
            "bind_invalid_expression",
        );
    }
    // The controls the family is measured against.
    errors_with(
        "<div bind:clientWidth={o?.k}>x</div>",
        "bind_invalid_expression",
    );
    errors_with("<C bind:x={o?.k} />", "bind_invalid_expression");
}

/// #3264 family 2. A shorthand `bind:clientWidth` names an undeclared variable;
/// without the check the client wrote to it.
#[test]
fn bind_invalid_value_reaches_every_host() {
    for name in [
        "clientWidth",
        "clientHeight",
        "offsetWidth",
        "offsetHeight",
        "contentRect",
    ] {
        errors_with(
            &format!("<svelte:element this={{tag}} bind:{name}>x</svelte:element>"),
            "bind_invalid_value",
        );
        errors_with(
            &format!("<svelte:component this={{C}} bind:{name} />"),
            "bind_invalid_value",
        );
    }
    errors_with(
        "<svelte:component this={C} bind:value />",
        "bind_invalid_value",
    );
    errors_with("<div bind:clientWidth>x</div>", "bind_invalid_value");
}

/// #3264 family 3. `bind:group` takes no get/set pair — a rule that lived on the
/// element path only, so a component compiled it into a getter/setter prop pair.
#[test]
fn bind_group_rejects_a_getter_setter_pair_on_every_host() {
    for markup in [
        "<C bind:group={() => v, (nv) => (v = nv)} />",
        "<svelte:component this={C} bind:group={() => v, (nv) => (v = nv)} />",
        "<input bind:group={() => v, (nv) => (v = nv)} />",
    ] {
        errors_with(markup, "bind_group_invalid_expression");
    }
    // The control: a non-`group` binding accepts the pair on the same hosts.
    compiles("<C bind:value={() => v, (nv) => (v = nv)} />");
    compiles("<svelte:component this={C} bind:value={() => v, (nv) => (v = nv)} />");
}

/// #3266, the opposite direction. Upstream never records a `this` attribute in
/// its uniqueness set, so any number of them is accepted — on a component too.
#[test]
fn duplicate_this_is_accepted_on_every_host() {
    for markup in [
        "<C bind:this={el} bind:this={el} />",
        "<C this={tag} this={tag2} />",
        "<C bind:this={el} this={tag2} />",
        "<div bind:this={el} bind:this={el}>x</div>",
        "<svelte:element this={tag} bind:this={el} bind:this={el}>x</svelte:element>",
        "<svelte:component this={C} bind:this={el} bind:this={el} />",
        "{#if v}<svelte:self bind:this={el} bind:this={el} />{/if}",
    ] {
        compiles(markup);
    }
    // …while every other name still has to be unique, on a component included.
    errors_with("<C title=\"a\" title=\"b\" />", "attribute_duplicate");
    errors_with("<C bind:value={v} bind:value={v} />", "attribute_duplicate");
    errors_with(
        "<div class=\"a\" class=\"b\">x</div>",
        "attribute_duplicate",
    );
}

/// #3268. "This element carries no arbitrary attributes" is decided over the
/// whole attribute list before any individual directive is validated, so a
/// spread wins over an unsupported `bind:` regardless of their order.
#[test]
fn an_illegal_attribute_outranks_an_invalid_bind() {
    for host in ["svelte:window", "svelte:document"] {
        for markup in [
            format!("<{host} {{...rest}} bind:value={{v}} />"),
            format!("<{host} bind:value={{v}} {{...rest}} />"),
            format!("<{host} {{...rest}} bind:nope={{v}} />"),
        ] {
            errors_with(&markup, "illegal_element_attribute");
        }
    }
    for markup in [
        "<svelte:body {...rest} bind:value={v} />",
        "<svelte:body bind:value={v} {...rest} />",
        "<svelte:body {...rest} bind:nope={v} />",
    ] {
        errors_with(markup, "svelte_body_illegal_attribute");
    }
    // Without the spread the `bind:` is still what gets reported.
    errors_with("<svelte:window bind:value={v} />", "bind_invalid_target");
    errors_with("<svelte:body bind:value={v} />", "bind_invalid_target");
}
