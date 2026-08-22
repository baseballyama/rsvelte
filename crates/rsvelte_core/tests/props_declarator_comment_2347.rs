//! Regression tests for issue #2347 — a `//` comment sitting between the last
//! entry of a `$props()` destructuring pattern and its closing `}` stayed glued
//! to the declarator text, so the `= $.rest_props(...)` initializer the client
//! transform appends landed *inside* the comment. The output still parsed, so
//! nothing caught it: `props` was declared and never assigned, and every
//! forwarded attribute silently vanished at runtime.
//!
//! The declarator splitter was already comment-aware; its caller only stripped
//! *leading* comments from each part. Both ends are now scanned lexically via
//! `shared::js_scan::skip_opaque` and re-emitted where esrap's comment cursor
//! puts them.

use rsvelte_core::compiler::CompileOptions;
use rsvelte_core::{GenerateMode, compile};

fn client(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Input.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

const REST_TRAILING_LINE_COMMENT: &str = r#"<script>
	let {
		class: className,
		...props
	// c
	} = $props();
</script>

<div class={className} {...props}></div>
"#;

#[test]
fn rest_props_initializer_survives_a_trailing_line_comment() {
    for dev in [false, true] {
        let code = client(REST_TRAILING_LINE_COMMENT, dev);
        assert!(
            code.contains("let props = $.rest_props($$props,"),
            "dev={dev}: rest_props initializer was swallowed:\n{code}"
        );
        assert!(
            !code.contains("// c = $.rest_props"),
            "dev={dev}: initializer emitted inside the comment:\n{code}"
        );
    }
}

#[test]
fn named_prop_survives_a_trailing_line_comment() {
    let code = client(
        r#"<script>
	let {
		value
	// c
	} = $props();
</script>

<p>{value}</p>
"#,
        false,
    );
    assert!(
        !code.contains("// c"),
        "the comment leaked into the prop declaration:\n{code}"
    );
    assert!(
        code.contains("$$props.value"),
        "prop name was not recovered:\n{code}"
    );
}

#[test]
fn trailing_block_comment_is_trimmed_too() {
    let code = client(
        r#"<script>
	let {
		class: className,
		...props /* c */
	} = $props();
</script>

<div class={className} {...props}></div>
"#,
        false,
    );
    assert!(
        code.contains("let props = $.rest_props($$props,"),
        "block-comment form regressed:\n{code}"
    );
}

#[test]
fn leading_comment_flushes_before_the_kept_declarator() {
    let code = client(
        r#"<script>
	let {
		// eslint-disable-next-line
		class: className,
		...props
	} = $props();
</script>

<div class={className} {...props}></div>
"#,
        false,
    );
    assert!(
        code.contains("'class'"),
        "leading-comment declarator lost its prop name:\n{code}"
    );
    // Official keeps the comment and flushes it before the next kept
    // declarator, so the `let` and the binding land on separate lines.
    assert!(
        code.contains("let // eslint-disable-next-line\n\tprops = $.rest_props($$props,"),
        "leading-comment form regressed:\n{code}"
    );
}
