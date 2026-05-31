//! Issue #446 H-099: a `{@render}` tag with both an awaited argument and a
//! memoised-call argument must not emit two `$0` placeholders. The async
//! placeholder (a callback param) and the memoised-call placeholder
//! (`let $N = $.derived(...)`) share one `$N` namespace, so they must draw from
//! a single counter — otherwise the `let $0` shadows the async param `$0`.

use rsvelte_core::{CompileOptions, ExperimentalOptions, GenerateMode, compile};

fn client_async(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: false,
            experimental: ExperimentalOptions { r#async: true },
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

#[test]
fn render_tag_async_and_call_args_use_distinct_placeholders() {
    let src = "<script>\nlet foo;\nfunction bar() { return 1; }\nasync function x() { return 2; }\n</script>\n{@render foo(await x(), bar())}";
    let out = client_async(src);
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    // async arg -> callback param `$0`; memoised-call arg -> `let $1 = $.derived`.
    assert!(out.contains("$0"), "missing async placeholder: {out}");
    assert!(
        out.contains("let $1 = $.derived"),
        "memoised-call placeholder did not advance past the async `$0`: {out}"
    );
    assert!(
        !out.contains("let $0 = $.derived"),
        "memoised-call placeholder collided with async `$0`: {out}"
    );
}
