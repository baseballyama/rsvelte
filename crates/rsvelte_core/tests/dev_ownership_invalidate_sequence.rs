//! A prop that carries legacy indirect bindings gets its mutation paired with
//! `$.invalidate_inner_signals(...)` in a sequence, and upstream builds that
//! sequence *before* `validate_mutation` wraps it — so the sequence is the
//! wrap's third argument, not its parent (`AssignmentExpression.js:139-166`).
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

#[test]
fn the_invalidate_sequence_sits_inside_the_ownership_wrap() {
    let out = compile(
        r#"<script>
	export let field;
	let selectId = 'a';

	function reset() {
		field.attributes = {};
	}
</script>

<button onclick={reset}>reset</button>

<select id={selectId} bind:value={field.attributes.position}>
	<option value="top">top</option>
</select>
"#,
        CompileOptions {
            filename: Some("Main.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;

    let head = "$$ownership_validator.mutation(";
    let start = out.find(head).expect("no ownership wrap") + head.len();
    let invalidate = out[start..]
        .find("$.invalidate_inner_signals")
        .expect("no invalidate wrap");
    let mut depth = 0i32;
    let arguments_end = out[start..]
        .char_indices()
        .find(|(_, ch)| {
            match ch {
                '(' | '[' | '{' => depth += 1,
                ')' | ']' | '}' => depth -= 1,
                _ => {}
            }
            depth < 0
        })
        .map(|(offset, _)| offset)
        .expect("unterminated wrap");
    assert!(invalidate < arguments_end, "got:\n{out}");
}
