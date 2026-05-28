//! Issue #453 H-053: event attributes on special elements must use the same
//! capture-event detection as regular elements — `gotpointercapture` /
//! `lostpointercapture` end in "capture" but are real event names, not capture
//! variants, so they must not be split into `gotpointer` + capture.

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

#[test]
fn pointer_capture_events_are_not_split() {
    let src = "<script>let h = () => {};</script>\n<svelte:window ongotpointercapture={h} onlostpointercapture={h} onclickcapture={h} />";
    let out = client(src);
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    // Pointer-capture events keep their full name and are NOT marked capture.
    assert!(
        out.contains("$.event('gotpointercapture', $.window, h)"),
        "gotpointercapture mis-split: {out}"
    );
    assert!(
        out.contains("$.event('lostpointercapture', $.window, h)"),
        "lostpointercapture mis-split: {out}"
    );
    // A genuine capture event is still detected (name stripped, capture=true).
    assert!(
        out.contains("$.event('click', $.window, h, true)"),
        "clickcapture not treated as capture: {out}"
    );
}
