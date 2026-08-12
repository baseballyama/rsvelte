//! Upstream parity pins for `$:` statements whose only assignment target is a
//! member expression. A member assignment mutates the *base object*, so
//! upstream records no assignment target at all for it and leaves the statement
//! in source order — regardless of the operator.
//!
//! SSR reactive ordering runs through the AST port of
//! `order_reactive_statements` in `server/ast/script.rs`. These tests pin that
//! live path for the member-target cases.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_component(src: &str, mode: GenerateMode) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("App.svelte".to_string()),
            generate: mode,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn assert_order(out: &str, first: &str, second: &str) {
    let a = out
        .find(first)
        .unwrap_or_else(|| panic!("missing `{first}` in:\n{out}"));
    let b = out
        .find(second)
        .unwrap_or_else(|| panic!("missing `{second}` in:\n{out}"));
    assert!(a < b, "`{first}` must precede `{second}`, got:\n{out}");
}

const COMPOUND_MEMBER: &str = r#"<script>
	let x = 1;
	let obj = { x: 0 };
	let a = 0;
	$: a = x * 2;
	$: obj.x += 1;
</script>

<p>{a} {obj.x}</p>
"#;

const PLAIN_MEMBER: &str = r#"<script>
	let x = 1;
	let obj = { x: 0 };
	let a = 0;
	$: a = x * 2;
	$: obj.x = 1;
</script>

<p>{a} {obj.x}</p>
"#;

const MEMBER_UPDATE: &str = r#"<script>
	let x = 1;
	let obj = { x: 0 };
	let a = 0;
	$: a = x * 2;
	$: obj.x++;
</script>

<p>{a} {obj.x}</p>
"#;

const COMPOUND_IDENT: &str = r#"<script>
	let x = 1;
	let a = 0;
	$: a = x * 2;
	$: x += 1;
</script>

<p>{a} {x}</p>
"#;

#[test]
fn member_assignment_keeps_source_order_server() {
    for (src, member) in [
        (COMPOUND_MEMBER, "obj.x += 1"),
        (PLAIN_MEMBER, "obj.x = 1"),
        (MEMBER_UPDATE, "obj.x++"),
    ] {
        let out = compile_component(src, GenerateMode::Server);
        assert_order(&out, "a = x * 2", member);
    }
}

#[test]
fn identifier_assignment_still_hoists_server() {
    let out = compile_component(COMPOUND_IDENT, GenerateMode::Server);
    assert_order(&out, "x += 1", "a = x * 2");
}
