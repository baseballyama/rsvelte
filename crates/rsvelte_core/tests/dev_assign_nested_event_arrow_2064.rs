//! Upstream exempts `onclick={() => (obj.x = v)}` from the dev `$.assign` wrap
//! only when the arrow **is** the event attribute's expression
//! (`path.at(-1) === 'ArrowFunctionExpression' && path.at(-2) === 'RegularElement'`,
//! `AssignmentExpression.js`). An arrow nested inside a call argument —
//! `onsubmit={preventDefault(() => (obj.x = v))}` — is not exempt.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client_dev(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn an_arrow_nested_in_a_call_argument_is_still_wrapped() {
    let out = compile_client_dev(
        r#"<script>
	function preventDefault(fn) {
		return function (event) {
			event.preventDefault();
			fn.call(this, event);
		};
	}

	let scroll = $state({ x: 0 });
	let x = $state(1);
</script>

<form onsubmit={preventDefault(() => (scroll.x = x))}></form>
"#,
    );
    assert!(
        out.contains("$.assign(scroll, 'x', '='"),
        "an arrow inside a call argument is not the attribute expression, so the \
         assignment must still be wrapped. got:\n{out}"
    );
}

/// Pin, not a repro: green before the fix too. It guards the exemption the fix
/// narrows — the shape that must keep it.
#[test]
fn the_attribute_expression_arrow_itself_stays_exempt() {
    let out = compile_client_dev(
        r#"<script>
	let scroll = $state({ x: 0 });
	let x = $state(1);
</script>

<button onclick={() => (scroll.x = x)}></button>
"#,
    );
    assert!(
        !out.contains("$.assign("),
        "the arrow IS the attribute expression, so it stays exempt. got:\n{out}"
    );
}

#[test]
fn a_nested_arrow_that_is_not_under_an_event_attribute_is_wrapped() {
    // Pin, not a repro: green before the fix too. Negative control for the
    // flag's reach — no event attribute is involved at all.
    let out = compile_client_dev(
        r#"<script>
	let scroll = $state({ x: 0 });
	let x = $state(1);
	const run = (fn) => fn();
	const go = () => run(() => (scroll.x = x));
</script>

<button onclick={go}></button>
"#,
    );
    assert!(out.contains("$.assign(scroll, 'x', '='"), "got:\n{out}");
}
