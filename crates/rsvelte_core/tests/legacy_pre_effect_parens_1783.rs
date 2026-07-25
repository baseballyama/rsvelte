//! Regression for issue #1783: the `$.legacy_pre_effect` dependency thunk is
//! `b.thunk(b.sequence(deps))` upstream, and esrap prints a `SequenceExpression`
//! with parentheses even for a single element. The direct-AST client codegen
//! re-parses the generated chunk text, where `($.get(y))` is only a
//! `ParenthesizedExpression` — which the printer drops — so the parens were lost.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("main.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// The comment in the handler forces the chunk through the comment-bearing
/// direct-AST path (the one PR #1772 enabled), which is where the parens were
/// dropped.
#[test]
fn single_dependency_thunk_keeps_its_parens() {
    let out = client(
        r#"<script>
	let x = 1;
	let y = true;
	$: array = y ? [1, 2] : [1];
	$: count = array.length === 2 && x ? 1 : 0;
	$: sum = count + array.length;
</script>

<button
	on:click={() => {
		// order is important here
		x = 2;
		y = false;
	}}>{sum}</button
>
"#,
    );
    assert!(
        out.contains("$.legacy_pre_effect(() => ($.get(y)), () => {"),
        "single-dep thunk lost its parens:\n{out}"
    );
    assert!(
        out.contains("$.legacy_pre_effect(() => ($.get(array), $.get(x)), () => {"),
        "multi-dep thunk changed shape:\n{out}"
    );
}

/// Parens the *user* wrote must still be dropped, exactly as acorn + esrap do
/// upstream — the fix must not turn into a blanket "preserve every paren".
#[test]
fn user_written_parens_are_still_dropped() {
    let out = client(
        r#"<script>
	let a = 1, b = 2;
	$: x = (a + b);
	const f = () => (a);
	const g = (a) + (b);
</script>
{x}{f}{g}
"#,
    );
    assert!(out.contains("const f = () => a;"), "got:\n{out}");
    assert!(out.contains("const g = a + b;"), "got:\n{out}");
    assert!(out.contains("$.set(x, a + b)"), "got:\n{out}");
}
