//! `build_event()` names a handler only when it is an arrow function
//! (`dev && handler.type === 'ArrowFunctionExpression'`, `shared/events.js`).
//! Naming a non-arrow handler burns a `scope.generate()` slot, which shifts
//! every later suffix that shares the prefix — including the element variables,
//! since `<input on:input>` draws `input` from the same counter.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client_dev(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Ev.svelte".to_string()),
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
fn a_non_arrow_on_directive_handler_consumes_no_name() {
    let out = compile_client_dev(
        r#"<script>
	export let handler;
	let count = 0;
</script>
<button on:click={handler}>a</button>
<button on:click={() => count++}>b</button>
"#,
    );
    assert!(
        out.contains("function click()"),
        "the arrow handler should take the unsuffixed name, got:\n{out}"
    );
    assert!(
        !out.contains("function click_1()"),
        "the non-arrow handler must not consume `click`, got:\n{out}"
    );
}

#[test]
fn a_non_arrow_on_directive_handler_leaves_the_element_variable_alone() {
    let out = compile_client_dev(
        r#"<script>
	export let handler;
</script>
{#if true}
	<input on:input={handler} />
{/if}
{#if true}
	<input on:input={handler} />
{/if}
"#,
    );
    assert!(
        out.contains("var input_1 = "),
        "the second element should be `input_1`, got:\n{out}"
    );
    assert!(
        !out.contains("var input_2 = "),
        "no name should have been burned on the non-arrow handlers, got:\n{out}"
    );
}
