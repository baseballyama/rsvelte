//! Regression test for default values in a destructured `$state(...)`
//! (baseballyama/rsvelte#2002).
//!
//! Client codegen unwrapped the `AssignmentPattern` and kept only the left-hand
//! identifier, so `let { a, b = 5 } = $state({})` silently produced `undefined`
//! for `b` instead of `5`. SSR was already correct.
//!
//! Expected outputs below were taken from the official Svelte compiler.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_with(src: &str, generate: GenerateMode) -> String {
    let result = compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile");
    result.js.code
}

fn compile_client(src: &str) -> String {
    compile_with(src, GenerateMode::Client)
}

#[test]
fn object_pattern_default_becomes_a_fallback() {
    let out = compile_client(
        r#"<script>
	let { a, b = 5 } = $state({});
</script>
<p>{a}{b}</p>"#,
    );
    assert!(
        out.contains("b = $.proxy($.fallback(tmp.b, 5))"),
        "expected the default to survive as `$.fallback`. Got:\n{out}"
    );
    assert!(
        !out.contains("b = $.proxy(tmp.b)"),
        "the default value was still dropped:\n{out}"
    );
}

#[test]
fn array_pattern_default_becomes_a_fallback() {
    let out = compile_client(
        r#"<script>
	let [a, b = 5] = $state([]);
</script>
<p>{a}{b}</p>"#,
    );
    assert!(
        out.contains("b = $.proxy($.fallback($.get($$array)[1], 5))"),
        "expected the array element default to survive. Got:\n{out}"
    );
}

#[test]
fn renamed_property_default_becomes_a_fallback() {
    let out = compile_client(
        r#"<script>
	let { a, b: bb = 5 } = $state({});
</script>
<p>{a}{bb}</p>"#,
    );
    assert!(
        out.contains("bb = $.proxy($.fallback(tmp.b, 5))"),
        "expected the renamed property's default to survive. Got:\n{out}"
    );
}

#[test]
fn state_raw_default_becomes_a_fallback() {
    let out = compile_client(
        r#"<script>
	let { a, b = 5 } = $state.raw({});
</script>
<p>{a}{b}</p>"#,
    );
    assert!(
        out.contains("b = $.fallback(tmp.b, 5)"),
        "expected `$state.raw` to keep the default without a proxy wrap. Got:\n{out}"
    );
}

#[test]
fn non_simple_default_is_thunked() {
    let out = compile_client(
        r#"<script>
	let o = {};
	let { a, b = o.x } = $state({});
</script>
<p>{a}{b}</p>"#,
    );
    assert!(
        out.contains("b = $.proxy($.fallback(tmp.b, () => o.x, true))"),
        "expected the non-simple default to be thunked. Got:\n{out}"
    );
}

#[test]
fn reassigned_binding_keeps_the_fallback_inside_state() {
    let out = compile_client(
        r#"<script>
	let { a, b = 5 } = $state({});
	function f() { b = 2; }
</script>
<p>{a}{b}</p><button onclick={f}>x</button>"#,
    );
    assert!(
        out.contains("b = $.state($.proxy($.fallback(tmp.b, 5)))"),
        "expected the fallback inside the `$.state($.proxy(...))` wrap. Got:\n{out}"
    );
}

#[test]
fn server_output_is_unchanged() {
    let out = compile_with(
        r#"<script>
	let { a, b = 5 } = $state({});
</script>
<p>{a}{b}</p>"#,
        GenerateMode::Server,
    );
    assert!(
        out.contains("b = $.fallback(tmp.b, 5)"),
        "SSR already matched the official compiler. Got:\n{out}"
    );
}

#[test]
fn a_default_is_visited_after_every_array_is_named() {
    // Upstream names the outer `$$array`s before it visits the default, so the
    // pattern nested in the default takes the next name.
    let out = compile_client(
        r#"<script>
	let [a = () => { let [x] = $state([1]); return x; }, [b]] = $state([]);
</script>
<p>{a()}{b}</p>"#,
    );
    let expected = "\tlet tmp = [],
		$$array = $.derived(() => $.to_array(tmp, 2)),
		$$array_1 = $.derived(() => $.to_array($.get($$array)[1], 1)),
		a = $.proxy($.fallback($.get($$array)[0], () => {
			let tmp_1 = [1],
				$$array_2 = $.derived(() => $.to_array(tmp_1, 1)),
				x = $.proxy($.get($$array_2)[0]);

			return x;
		})),
		b = $.proxy($.get($$array_1)[0]);";
    assert!(out.contains(expected), "Got:\n{out}");
}

#[test]
fn an_empty_object_pattern_keeps_only_the_tmp() {
    let out = compile_client(
        r#"<script>
	let {} = $state({});
</script>
<p>x</p>"#,
    );
    assert!(out.contains("\tlet tmp = {};\n"), "Got:\n{out}");
    assert!(
        !out.contains("$state("),
        "the rune was left in place:\n{out}"
    );
}
