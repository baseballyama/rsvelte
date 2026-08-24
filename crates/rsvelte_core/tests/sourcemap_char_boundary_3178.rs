//! A source-map producer can report a byte offset inside a multi-byte character.
//! Column conversion must tolerate that offset instead of panicking while
//! slicing the source.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

const EM_DASH_SRC: &str = include_str!("fixtures_3178/em_dash_style_directive.svelte");

fn go(src: &str, mode: GenerateMode) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: mode,
            dev: false,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

#[test]
fn em_dash_in_a_comment_does_not_panic_the_source_map() {
    for mode in [GenerateMode::Client, GenerateMode::Server] {
        let out = go(EM_DASH_SRC, mode);
        assert!(!out.contains("COMPILE_ERROR"), "{mode:?}: {out}");
    }
}
