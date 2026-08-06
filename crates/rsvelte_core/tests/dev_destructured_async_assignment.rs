//! An async destructuring assignment is lowered to
//! `await (async ($$value) => { … })(…)`. Upstream destructures after a single
//! instrumented `await`, so only the source `await` carries
//! `$.track_reactivity_loss` — the generated call has no counterpart.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

#[test]
fn only_the_source_await_is_instrumented() {
    let out = compile(
        r#"<script>
	let a = $state(0);
	let b = $state(0);

	const update = async () => {
		[a, b] = [1, await Promise.resolve(2)];
	};
</script>

<button onclick={update}>{a}{b}</button>
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

    assert!(out.contains("await (async ($$value) =>"), "got:\n{out}");
    assert_eq!(
        out.matches("$.track_reactivity_loss").count(),
        1,
        "got:\n{out}"
    );
}
