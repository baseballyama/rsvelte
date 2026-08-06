//! `build_assignment` builds `await $.assign_async(...)` and hands it to
//! `context.visit`, so the `await` it adds gets the same
//! `$.track_reactivity_loss` instrumentation any source `await` does — while
//! `arrow` (`utils/builders.js`) collapses the lazy getter it wraps back to a
//! synchronous `() => x()`.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

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
fn the_generated_await_is_instrumented_and_the_getter_is_synchronous() {
    let out = compile_client_dev(
        r#"<script>
	let cache = $state({});

	async function go() {
		const value = cache.value ??= await get_value();
	}

	function get_value() {
		return 42;
	}
</script>

<button onclick={go}>go</button>
"#,
    );

    assert!(
        out.contains("await $.track_reactivity_loss($.assign_async("),
        "got:\n{out}"
    );
    assert!(out.contains("() => get_value()"), "got:\n{out}");
    assert!(!out.contains("async () =>"), "got:\n{out}");
}

#[test]
fn a_getter_with_a_nested_await_stays_asynchronous() {
    let out = compile_client_dev(
        r#"<script>
	let cache = $state({});

	async function go() {
		const value = cache.value ??= await outer(await inner());
	}
</script>

<button onclick={go}>go</button>
"#,
    );

    assert!(out.contains("$.assign_async("), "got:\n{out}");
    assert!(out.contains("async () =>"), "got:\n{out}");
}

#[test]
fn an_untransformed_site_does_not_lend_its_position_to_a_later_twin() {
    let out = compile_client_dev(
        r#"<script>
	let { opacity = 0.5 } = $props();

	const fixed = (node) => node.style.opacity = 0.5;

	const unknown = (node) => node.style.opacity = opacity;
</script>
"#,
    );

    assert!(out.contains("Main.svelte:6:27"), "got:\n{out}");
}
