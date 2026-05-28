//! Issue #456: inline JS statement conversion must preserve `for...in` (vs
//! `for...of`, H-110) and destructuring `catch` parameters (H-112).

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

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
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

/// H-110: a `for...in` loop in inline JS must be emitted as `for...in`, not
/// `for...of`.
#[test]
fn for_in_is_not_emitted_as_for_of() {
    let out = client(
        "<script>let obj = {};</script>\n<button onclick={() => { for (const k in obj) { console.log(k); } }}>x</button>",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("for (const k in obj)"),
        "for-in emitted as for-of: {out}"
    );
    assert!(!out.contains("for (const k of obj)"), "{out}");
}

/// H-112: a destructuring `catch` parameter must be preserved.
#[test]
fn destructuring_catch_param_is_preserved() {
    let out = client(
        "<script>let f = () => {};</script>\n<button onclick={() => { try { f(); } catch ({ message }) { console.log(message); } }}>x</button>",
    );
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("catch ({ message })"),
        "destructuring catch param dropped: {out}"
    );
}
