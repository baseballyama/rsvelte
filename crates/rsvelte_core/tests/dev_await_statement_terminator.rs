//! `await f()` cannot continue the preceding line, so a source that leaves the
//! statement unterminated is fine — but the dev wrapper
//! `(await $.track_reactivity_loss(f()))()` can, and ASI then folds the next
//! statement into a call on it. The rewrite has to restore the boundary.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_client_dev(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Aw.svelte".to_string()),
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
fn consecutive_unterminated_awaits_stay_separate_statements_in_runes_mode() {
    let out = compile_client_dev(
        r#"<script>
	let n = $state(0)
	async function go() {
		await fetch('/a')
		await fetch('/b')
		n++
	}
</script>
<button onclick={go}>{n}</button>
"#,
    );
    assert!(
        out.contains("(await $.track_reactivity_loss(fetch('/a')))();"),
        "the first await should terminate its statement, got:\n{out}"
    );
    assert!(
        !out.contains("))()(await"),
        "the two awaits must not fold into one call, got:\n{out}"
    );
}

#[test]
fn consecutive_unterminated_awaits_stay_separate_statements_in_legacy_mode() {
    let out = compile_client_dev(
        r#"<script>
	export let n = 0
	async function go() {
		await fetch('/a')
		await fetch('/b')
		n++
	}
</script>
<button on:click={go}>{n}</button>
"#,
    );
    assert!(
        !out.contains("))()(await"),
        "the two awaits must not fold into one call, got:\n{out}"
    );
}
