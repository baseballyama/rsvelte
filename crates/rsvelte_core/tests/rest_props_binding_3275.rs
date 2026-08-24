use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(source: &str) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile failed")
    .js
    .code
}

/// Upstream declares BOTH `$$props` and `$$restProps` as synthetic `rest_prop`
/// bindings in legacy mode. Without the binding the reference contributes no
/// dependency, so `CallExpression`'s `!is_pure || has_dependencies` test never
/// fires for a pure callee and the read is not memoized.
#[test]
fn a_pure_call_over_rest_props_is_memoized_into_the_dependency_array() {
    let out = client(r#"<div title={JSON.stringify($$restProps)}></div>"#);
    assert!(
        out.contains("$.template_effect(($0) => $.set_attribute(div, 'title', $0), ["),
        "expected the dependency-array form, got:\n{out}"
    );
}

/// A second attribute slot reaching the same decision.
#[test]
fn the_class_attribute_slot_memoizes_the_same_read() {
    let out = client(r#"<div class={JSON.stringify($$restProps)}></div>"#);
    assert!(
        out.contains("($0) =>"),
        "expected the dependency-array form, got:\n{out}"
    );
}

/// `$$props` was already declared, so it was already right. It is the control
/// that names the missing binding rather than the memoizer as the cause.
#[test]
fn the_same_shape_over_props_was_already_correct() {
    let out = client(r#"<div title={JSON.stringify($$props)}></div>"#);
    assert!(
        out.contains("$.template_effect(($0) => $.set_attribute(div, 'title', $0), ["),
        "expected the dependency-array form, got:\n{out}"
    );
}

/// A NON-pure callee sets `has_call` from the first term of the same test, so
/// this shape was correct without the binding. It pins which of the two terms
/// the fix restores.
#[test]
fn a_local_callee_did_not_need_the_binding() {
    let out = client(
        "<script>\n\tfunction f(x) { return x; }\n</script>\n<div title={f($$restProps)}></div>\n",
    );
    assert!(
        out.contains("($0) =>"),
        "expected the dependency-array form, got:\n{out}"
    );
}

/// The each half of the same issue: the collection expression is the same read,
/// and without the binding the item was not lowered to a signal.
#[test]
fn an_each_over_rest_props_reads_its_item_through_get() {
    let out = client(r#"{#each Object.keys($$restProps) as k}<b>{k}</b>{/each}"#);
    assert!(
        out.contains("$.set_text(text, $.get(k))"),
        "expected the each item to be read through $.get, got:\n{out}"
    );
    assert!(
        out.contains("$.deep_read_state($$restProps), $.untrack(() => Object.keys($$restProps))"),
        "expected the collection to carry its legacy dependency, got:\n{out}"
    );
}

/// The declaration must not re-route a plain member read through the
/// `$$sanitized_props` rewrite — the concern the old comment recorded as the
/// reason for leaving the binding out.
#[test]
fn a_plain_member_read_still_reads_rest_props_directly() {
    let out = client(r#"<div title={$$restProps.a}></div>"#);
    assert!(
        out.contains("$.untrack(() => $$restProps.a)"),
        "the member read must stay on $$restProps, got:\n{out}"
    );
    assert!(
        !out.contains("$$sanitized_props.a"),
        "the member read must not be rewritten to $$sanitized_props, got:\n{out}"
    );
}
