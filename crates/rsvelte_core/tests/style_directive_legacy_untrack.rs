//! A `style:` directive's value must reach `build_expression` with the metadata
//! phase 2 filled in for the ExpressionTag, not for the directive.
//!
//! Upstream's `StyleDirective` visitor calls `context.next()`, and `ExpressionTag`
//! replaces `state.expression` with the TAG's own metadata before walking; the
//! directive then `merge`s each chunk up. rsvelte wrote straight into the
//! directive's metadata, so the chunk stayed empty — and phase 3's
//! `build_attribute_value` reads the chunk. `has_call` was therefore always
//! false there and `build_expression` returned early, dropping the whole legacy
//! `(deps…, $.untrack(() => value))` sequence.
//!
//! `has_member_expression` and `has_assignment` are re-derived from the
//! expression in phase 3, which is why `style:x={obj.y}` was correct all along
//! and only a call diverged. Both are rows below.
//!
//! Every expected fragment was taken from the official Svelte compiler
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

const LEGACY_CALL: &str = r#"<script>
	import { DEV } from 'esm-env';
	export let theme = undefined;
	const show = false;
	function rnd() { return '#fff'; }
	$: total = 1;
</script>
<div style:background={DEV && show ? rnd() : null}></div>
"#;

const LEGACY_MEMBER: &str = r#"<script>
	export let theme = undefined;
	$: total = 1;
</script>
<div style:background={theme.x}></div>
"#;

const LEGACY_SEQUENCE: &str = r#"<script>
	export let theme = undefined;
	function rnd() { return '1'; }
	$: total = 1;
</script>
<div style:width="{rnd()}px"></div>
"#;

const RUNES_CALL: &str = r#"<script>
	let { theme } = $props();
	function rnd() { return '#fff'; }
</script>
<div style:background={rnd()}></div>
"#;

const LEGACY_CLASS_CALL: &str = r#"<script>
	export let theme = undefined;
	function rnd() { return true; }
	$: total = 1;
</script>
<div class:a={rnd()}></div>
"#;

#[test]
fn a_call_in_a_style_directive_keeps_the_legacy_untrack_sequence() {
    let out = compile_client(LEGACY_CALL);
    assert!(
        out.contains("$.deep_read_state(DEV)"),
        "an imported binding read by the directive must be deep-read:\n{out}"
    );
    assert!(
        out.contains("$.untrack(() => DEV && show ? rnd() : null)"),
        "the value must be untracked:\n{out}"
    );
}

#[test]
fn a_member_in_a_style_directive_is_unchanged() {
    let out = compile_client(LEGACY_MEMBER);
    assert!(
        out.contains("background: ($.deep_read_state(theme()), $.untrack(() => theme().x))"),
        "the member arm was already correct and must stay so:\n{out}"
    );
}

#[test]
fn a_call_in_a_quoted_style_directive_keeps_the_sequence() {
    let out = compile_client(LEGACY_SEQUENCE);
    assert!(
        out.contains("$.untrack(rnd)"),
        "a chunk inside a quoted value must be untracked too:\n{out}"
    );
}

#[test]
fn runes_mode_does_not_wrap() {
    let out = compile_client(RUNES_CALL);
    assert!(
        !out.contains("$.untrack"),
        "`build_expression` returns early in runes mode:\n{out}"
    );
    assert!(
        out.contains("background: rnd()"),
        "the value is emitted bare:\n{out}"
    );
}

#[test]
fn a_class_directive_does_not_wrap() {
    let out = compile_client(LEGACY_CLASS_CALL);
    assert!(
        !out.contains("$.untrack"),
        "upstream builds a class directive's value without `build_expression`:\n{out}"
    );
    assert!(
        out.contains("a: rnd()"),
        "the value is emitted bare:\n{out}"
    );
}
