//! Regression tests for issue #2254 — an each-block item read from inside a
//! `switch` statement in a template expression was never routed through
//! `$.get(...)`.
//!
//! Upstream has no per-statement enumeration: the client identifier transform is
//! a generic `walk` whose `Identifier` visitor consults `state.scope`, so every
//! read position is unwrapped by construction (`SwitchStatement` is merely
//! registered as a block scope in `phases/scope.js`). rsvelte instead hand-rolls
//! the walk in `apply_transforms_to_statement_with_shadowed`
//! (`3_transform/client/visitors/shared/utils.rs`), and that match had no
//! `JsStatement::Switch` arm — the whole switch fell through to `stmt.clone()`,
//! leaving the discriminant, every `case` test and every consequent statement
//! untransformed. The discriminant then compared the raw signal object, so no
//! case ever matched, silently, in both dev and prod.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_client(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Comp.svelte".to_string()),
            generate: GenerateMode::Client,
            css: CssMode::External,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

const SRC: &str = r#"<script>
	const items = $state([{ value: 'a' }]);
	const { onPick } = $props();
</script>

{#each items as item (item.value)}
	<button
		onclick={() => {
			if (item.value === 'a') onPick('if');
			while (item.value === 'never') break;
			switch (item.value) {
				case 'a':
					onPick('switch');
			}
		}}>x</button
	>
{/each}
"#;

/// The repro from the issue: the `switch` discriminant must read the signal,
/// exactly like the `if` / `while` tests in the very same handler.
#[test]
fn switch_discriminant_unwraps_each_item() {
    for dev in [false, true] {
        let code = compile_client(SRC, dev);
        assert!(
            code.contains("switch ($.get(item).value)"),
            "dev={dev}: switch discriminant not unwrapped:\n{code}"
        );
        assert!(
            !code.contains("switch (item.value)"),
            "dev={dev}: raw signal left as discriminant:\n{code}"
        );
    }
}

/// Sibling positions inside the same switch: a `case` test and the statements of
/// a consequent are read positions too, and shared the same gap.
#[test]
fn switch_case_test_and_consequent_unwrap_each_item() {
    let src = r#"<script>
	const items = $state([{ value: 'a' }]);
	let hit = $state('');
</script>

{#each items as item (item.value)}
	<button
		onclick={() => {
			switch ('a') {
				case item.value:
					hit = item.value;
					break;
			}
		}}>x</button
	>
{/each}
"#;
    let code = compile_client(src, false);
    assert!(
        code.contains("case $.get(item).value:"),
        "case test not unwrapped:\n{code}"
    );
    assert!(
        !code.contains("case item.value:"),
        "raw signal left as case test:\n{code}"
    );
    assert!(
        code.contains("$.set(hit, $.get(item).value"),
        "consequent statement not transformed:\n{code}"
    );
}

/// A `let` declared in a case clause block-scopes over the whole switch, so it
/// must shadow the outer transform in every position — upstream registers the
/// `SwitchStatement` itself as the block scope.
#[test]
fn case_local_declaration_shadows_outer_transform() {
    let src = r#"<script>
	const items = $state([{ value: 'a' }]);
	let out = $state('');
</script>

{#each items as item (item.value)}
	<button
		onclick={() => {
			switch (items.length) {
				case 1: {
					let item = 'local';
					out = item;
					break;
				}
			}
		}}>x</button
	>
{/each}
"#;
    let code = compile_client(src, false);
    assert!(
        code.contains("$.set(out, item)"),
        "case-local declaration was rewritten as a signal read:\n{code}"
    );
}
