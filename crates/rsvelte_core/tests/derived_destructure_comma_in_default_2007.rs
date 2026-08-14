//! Regression test for a comma inside a destructured `$derived` default value
//! (baseballyama/rsvelte#2007).
//!
//! The pattern splitters cut on every `,` at bracket depth 0 without tracking
//! string or template literals, so `let { a, b = 'x,y' } = $derived(props)` was
//! split into three properties and the output contained an unterminated string
//! literal (`$.fallback($$props.b, () => 'x, true)` plus a bogus `y' = …`).
//!
//! Expected outputs below were taken from the official Svelte compiler.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client(src: &str) -> String {
    let result = compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile");
    result.js.code
}

#[test]
fn comma_inside_a_string_default() {
    let out = compile_client(
        r#"<script>
	let props = $props();
	let { a, b = 'x,y' } = $derived(props);
</script>
<p>{a}{b}</p>"#,
    );
    assert!(
        out.contains("b = $.derived(() => $.fallback($$props.b, 'x,y'))"),
        "expected the whole string default to stay one property. Got:\n{out}"
    );
    assert!(
        !out.contains("y' = $.derived"),
        "the string was still split into an extra declaration:\n{out}"
    );
}

#[test]
fn comma_inside_a_template_literal_default() {
    let out = compile_client(
        r#"<script>
	let props = $props();
	let n = 1;
	let { a, b = `x,${n}` } = $derived(props);
</script>
<p>{a}{b}</p>"#,
    );
    assert!(
        out.contains("b = $.derived(() => $.fallback($$props.b, () => `x,${n}`, true))"),
        "expected the template literal to stay one property. Got:\n{out}"
    );
}

#[test]
fn comma_inside_a_renamed_property_default() {
    let out = compile_client(
        r#"<script>
	let props = $props();
	let { a, b: bb = 'x,y' } = $derived(props);
</script>
<p>{a}{bb}</p>"#,
    );
    assert!(
        out.contains("bb = $.derived(() => $.fallback($$props.b, 'x,y'))"),
        "expected the renamed property's default to stay intact. Got:\n{out}"
    );
}

#[test]
fn comma_inside_a_string_default_does_not_leak_into_the_rest() {
    let out = compile_client(
        r#"<script>
	let props = $props();
	let { a, b = 'x,y', ...r } = $derived(props);
</script>
<p>{a}{b}{r}</p>"#,
    );
    assert!(
        out.contains(r#"$.exclude_from_object(props, ['a', 'b'])"#),
        "expected exactly the two real keys in the exclusion list. Got:\n{out}"
    );
}

#[test]
fn comma_inside_an_array_element_default() {
    let out = compile_client(
        r#"<script>
	let props = $props();
	let [a, b = 'x,y'] = $derived(props);
</script>
<p>{a}{b}</p>"#,
    );
    // The bogus extra element also inflated the `$.to_array` arity.
    assert!(
        out.contains("$$array = $.derived(() => $.to_array(props, 2))"),
        "expected an arity of 2. Got:\n{out}"
    );
    assert!(
        out.contains("b = $.derived(() => $.fallback($.get($$array)[1], 'x,y'))"),
        "expected the array element default to stay intact. Got:\n{out}"
    );
}

#[test]
fn comma_inside_a_call_default_still_works() {
    let out = compile_client(
        r#"<script>
	let props = $props();
	function f(x, y) { return x; }
	let { a, b = f(1, 2) } = $derived(props);
</script>
<p>{a}{b}</p>"#,
    );
    assert!(
        out.contains("b = $.derived(() => $.fallback($$props.b, () => f(1, 2), true))"),
        "bracket depth already covered call arguments. Got:\n{out}"
    );
}

#[test]
fn comma_inside_a_nested_object_default_still_works() {
    let out = compile_client(
        r#"<script>
	let props = $props();
	let { a, b = { x: 1, y: 2 } } = $derived(props);
</script>
<p>{a}{b}</p>"#,
    );
    assert!(
        out.contains("b = $.derived(() => $.fallback($$props.b, () => ({")
            && out.contains("x: 1,")
            && out.contains("y: 2")
            && out.contains("}), true))"),
        "bracket depth already covered nested objects. Got:\n{out}"
    );
}
