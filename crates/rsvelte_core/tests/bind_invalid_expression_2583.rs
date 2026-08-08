//! `bind:` to something that names no binding must be rejected with
//! `bind_invalid_expression`, on a **component** as well as on an element
//! (issue #2583). Upstream runs `object(node.expression)` once, before it
//! branches on the element/component shape; rsvelte had the check on the
//! element path only, so `<Comp bind:value={o.x = obj} />` compiled and was
//! lowered into a getter/setter around an assignment expression.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_err(src: &str) -> Option<String> {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .err()
    .map(|e| format!("{e:?}"))
}

const SCRIPT: &str = "<script>\n\timport Comp from './Comp.svelte';\n\tlet o = $state({});\n\tlet obj = {};\n</script>\n";

fn with_script(markup: &str) -> String {
    format!("{SCRIPT}{markup}")
}

#[test]
fn component_bind_value_to_an_assignment_is_rejected() {
    let err = compile_err(&with_script("<Comp bind:value={o.x = obj} />"))
        .expect("component bind:value to an assignment must not compile");
    assert!(
        err.contains("bind_invalid_expression"),
        "expected bind_invalid_expression, got: {err}"
    );
}

#[test]
fn component_bind_this_to_an_assignment_is_rejected() {
    let err = compile_err(&with_script("<Comp bind:this={o.x = obj} />"))
        .expect("component bind:this to an assignment must not compile");
    assert!(
        err.contains("bind_invalid_expression"),
        "expected bind_invalid_expression, got: {err}"
    );
}

#[test]
fn element_bind_value_to_an_assignment_is_rejected_with_upstreams_message() {
    let err = compile_err(&with_script("<input bind:value={o.x = obj} />"))
        .expect("element bind:value to an assignment must not compile");
    assert!(
        err.contains("bind_invalid_expression"),
        "expected bind_invalid_expression, got: {err}"
    );
    assert!(
        err.contains("Can only bind to an Identifier or MemberExpression or a `{get, set}` pair"),
        "message must be upstream's, got: {err}"
    );
}

#[test]
fn bind_to_a_call_is_rejected_on_both_paths() {
    for markup in [
        "<input bind:value={o.f()} />",
        "<Comp bind:value={o.f()} />",
    ] {
        let err = compile_err(&with_script(markup))
            .unwrap_or_else(|| panic!("{markup} must not compile"));
        assert!(
            err.contains("bind_invalid_expression"),
            "expected bind_invalid_expression for {markup}, got: {err}"
        );
    }
}

/// The control: the shapes upstream *accepts* must keep compiling, or the fix
/// rejects too much. The component path never ran this check before, so every
/// component row here is newly exposed to it — a computed member, a deep chain
/// and `bind:this` included.
#[test]
fn valid_bind_targets_still_compile() {
    for markup in [
        "<Comp bind:value={obj} />",
        "<Comp bind:value={o.x} />",
        "<Comp bind:value={o.x.y.z} />",
        "<Comp bind:value={o[obj]} />",
        "<Comp bind:value={o['k']} />",
        "<Comp bind:this={o.x} />",
        "<Comp bind:value={() => o.x, (v) => (o.x = v)} />",
        "<input bind:value={o.x} />",
        "<input bind:value={o[obj]} />",
        "<input bind:group={o.x} />",
    ] {
        assert!(
            compile_err(&with_script(markup)).is_none(),
            "{markup} should compile"
        );
    }
}

/// Upstream analyses the AST with the TypeScript nodes removed, so a target
/// wrapped in an assertion reaches its `object()` as the bare expression.
#[test]
fn typescript_assertion_bind_targets_still_compile() {
    const TS: &str = "<script lang=\"ts\">\n\timport Comp from './Comp.svelte';\n\tlet o = $state({ x: 1 });\n\tlet obj = $state({});\n</script>\n";
    for markup in [
        "<Comp bind:value={o.x as number} />",
        "<Comp bind:value={obj as object} />",
        "<Comp bind:this={o.x as number} />",
        "<input bind:value={o.x as number} />",
        "<input bind:value={o.x!} />",
        "<input bind:value={(o.x satisfies number)} />",
        "<input bind:value={(o.x as number)!} />",
    ] {
        let src = format!("{TS}{markup}");
        assert!(compile_err(&src).is_none(), "{markup} should compile");
    }
}
