//! Issue #1974: a memoized `{@render}` argument must use `$.derived_safe_equal`
//! in legacy (non-runes) mode and `$.derived` in runes mode, mirroring
//! upstream `RenderTag.js`'s `memoizer.deriveds(analysis.runes)`.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

const LEGACY: &str = r#"<script>
	export let data;
	function log(d) { return d; }
</script>
{#snippet row(x)}<p>{x}</p>{/snippet}
{@render row(log(data))}"#;

const RUNES: &str = r#"<script>
	let { data } = $props();
	function log(d) { return d; }
</script>
{#snippet row(x)}<p>{x}</p>{/snippet}
{@render row(log(data))}"#;

#[test]
fn legacy_render_tag_argument_uses_derived_safe_equal() {
    let out = client(LEGACY);
    assert!(
        out.contains("$.derived_safe_equal("),
        "legacy memoized render-tag argument must use $.derived_safe_equal, got:\n{out}"
    );
    assert!(
        !out.contains("$.derived("),
        "legacy memoized render-tag argument must not use $.derived, got:\n{out}"
    );
}

#[test]
fn runes_render_tag_argument_uses_derived() {
    let out = client(RUNES);
    assert!(
        out.contains("$.derived("),
        "runes memoized render-tag argument must use $.derived, got:\n{out}"
    );
    assert!(
        !out.contains("derived_safe_equal"),
        "runes memoized render-tag argument must not use $.derived_safe_equal, got:\n{out}"
    );
}

#[test]
fn pure_render_tag_calls_stay_inline() {
    const PURE_ARGUMENTS: [&str; 4] = [
        "'ab'.at(0)",
        "(1).toFixed(2)",
        "Math.max(1, 2)",
        "Math.max(1, 2).toFixed(0)",
    ];

    for argument in PURE_ARGUMENTS {
        let src =
            format!("{{#snippet row(value)}}{{value}}{{/snippet}}\n{{@render row({argument})}}");
        let out = client(&src);
        assert!(
            !out.contains("derived_safe_equal") && !out.contains("$.derived("),
            "pure render-tag argument {argument:?} was memoized:\n{out}"
        );
    }
}
