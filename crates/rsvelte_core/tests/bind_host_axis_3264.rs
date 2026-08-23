//! The host-independent half of upstream's `BindDirective` visitor must run for
//! every host (issue #3264).
//!
//! Upstream runs the `binding_properties` block only for element-ish parents,
//! but everything below it — the `{get, set}` pair checks, `object()` →
//! `bind_invalid_expression`, and the `bind_invalid_value` identifier check —
//! runs for *every* host. rsvelte had a copy per visitor, and three of them were
//! missing: `<svelte:element>` reached none of it (so `bind:clientWidth={o?.k}`
//! compiled into `($$value) => o?.k = $$value`, which no JS parser accepts), and
//! a component / `<svelte:component>` never reached the pair checks.
//!
//! Over-acceptance and over-rejection are the two directions of one check, so
//! the legal shapes are asserted on the same host axis.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

const SCRIPT: &str = "<script>\n\timport C from './C.svelte';\n\tlet v = $state('a');\n\tlet o = $state({ k: 1 });\n\tlet tag = $state('div');\n\tlet el = $state(null);\n\tlet n = $state(0);\n</script>\n";

fn compile_err(markup: &str, generate: GenerateMode) -> Option<String> {
    let src = format!("{SCRIPT}{markup}");
    compile(
        &src,
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

fn expect_code(markup: &str, code: &str) {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let err = compile_err(markup, generate)
            .unwrap_or_else(|| panic!("{markup} must not compile ({generate:?})"));
        assert!(
            err.contains(code),
            "expected {code} for {markup} ({generate:?}), got: {err}"
        );
    }
}

/// `object()` returns null for an optional chain / a call / an assignment, so
/// the target is not an assignable reference. `<svelte:element>` skipped it, and
/// the emitted `o?.k = $$value` is not JavaScript.
#[test]
fn bind_invalid_expression_reaches_every_host() {
    for markup in [
        "<div bind:clientWidth={o?.k}>x</div>",
        "<input bind:value={o?.k} />",
        "<C bind:value={o?.k} />",
        "<svelte:element this={tag} bind:clientWidth={o?.k}>x</svelte:element>",
        "<svelte:element this={tag} bind:offsetWidth={o?.k}>x</svelte:element>",
        "<svelte:element this={tag} bind:this={o?.k}>x</svelte:element>",
        "<svelte:component this={C} bind:value={o?.k} />",
        "<svelte:component this={C} bind:value={o.f()} />",
        "<svelte:component this={C} bind:value={o.k = v} />",
        "{#if n}<svelte:self bind:value={o?.k} />{/if}",
    ] {
        expect_code(markup, "bind_invalid_expression");
    }
}

/// A shorthand `bind:clientWidth` with no such variable in scope is
/// `bind_invalid_value`; `<svelte:element>` used to emit a write to an
/// undeclared name.
#[test]
fn bind_invalid_value_reaches_every_host() {
    for markup in [
        "<div bind:clientWidth>x</div>",
        "<svelte:element this={tag} bind:clientWidth>x</svelte:element>",
        "<svelte:element this={tag} bind:offsetHeight>x</svelte:element>",
        "<svelte:component this={C} bind:value />",
        "<svelte:component this={C} bind:clientWidth />",
    ] {
        expect_code(markup, "bind_invalid_value");
    }
}

/// `bind:group` takes no `{get, set}` pair. The check sat on the element path
/// only, so a component lowered it into a getter/setter prop pair.
#[test]
fn bind_group_invalid_expression_reaches_every_host() {
    for markup in [
        "<input bind:group={() => v, (nv) => (v = nv)} />",
        "<C bind:group={() => v, (nv) => (v = nv)} />",
        "<svelte:component this={C} bind:group={() => v, (nv) => (v = nv)} />",
    ] {
        expect_code(markup, "bind_group_invalid_expression");
    }
}

/// The other two pair checks — parenthesised pair, and a pair that is not two
/// expressions — likewise run for every host.
#[test]
fn get_set_pair_shape_checks_reach_every_host() {
    for markup in [
        "<input bind:value={(() => v, (nv) => (v = nv))} />",
        "<C bind:value={(() => v, (nv) => (v = nv))} />",
        "<svelte:component this={C} bind:value={(() => v, (nv) => (v = nv))} />",
    ] {
        expect_code(markup, "bind_invalid_parens");
    }
    for markup in [
        "<input bind:value={() => v, (nv) => (v = nv), 1} />",
        "<C bind:value={() => v, (nv) => (v = nv), 1} />",
        "<svelte:component this={C} bind:value={() => v, (nv) => (v = nv), 1} />",
    ] {
        expect_code(markup, "bind_invalid_expression");
    }
}

/// The opposite direction: every legal shape on the same hosts must still
/// compile, on both targets. A population of only-invalid inputs is blind to an
/// over-rejection.
#[test]
fn legal_bindings_still_compile_on_every_host() {
    for markup in [
        "<div bind:clientWidth={n}>x</div>",
        "<div bind:this={el}>x</div>",
        "<input bind:value={v} />",
        "<input bind:value={o.k} />",
        "<input bind:group={v} />",
        "<input bind:value={() => v, (nv) => (v = nv)} />",
        "<C bind:value={v} />",
        "<C bind:value={o.k} />",
        "<C bind:this={el} />",
        "<C bind:value={() => v, (nv) => (v = nv)} />",
        "<svelte:element this={tag} bind:clientWidth={n}>x</svelte:element>",
        "<svelte:element this={tag} bind:offsetWidth={o.k}>x</svelte:element>",
        "<svelte:element this={tag} bind:this={el}>x</svelte:element>",
        "<svelte:element this={tag} bind:this>x</svelte:element>",
        "<svelte:component this={C} bind:value={v} />",
        "<svelte:component this={C} bind:value={o.k} />",
        "<svelte:component this={C} bind:this={el} />",
        "<svelte:component this={C} bind:value={() => v, (nv) => (v = nv)} />",
        "{#if n}<svelte:self bind:value={v} />{/if}",
        "{#if n}<svelte:self bind:group={v} />{/if}",
        "<svelte:window bind:innerWidth={n} />",
        "<svelte:document bind:activeElement={el} />",
        "<svelte:body bind:clientWidth={n} />",
    ] {
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            assert!(
                compile_err(markup, generate).is_none(),
                "{markup} should compile ({generate:?}), got: {:?}",
                compile_err(markup, generate)
            );
        }
    }
}

/// `<svelte:self bind:group>` needs its group array declared — the collector
/// visited every other host's attributes and recursed past this one's.
#[test]
fn svelte_self_bind_group_declares_its_binding_group() {
    let src = format!("{SCRIPT}{{#if n}}<svelte:self bind:group={{v}} />{{/if}}\n");
    let out = compile(
        &src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    assert!(
        out.contains("const binding_group = [];"),
        "expected the binding group declaration, got: {out}"
    );
}
