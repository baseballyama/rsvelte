//! Regression test: an empty transition/in/out directive name is a parse error
//! (issue #473, H-146 / M-040), matching `use:` / `animate:` which already
//! rejected empty names. Previously it lowered to an empty JS identifier.

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn try_compile(src: &str) -> Result<(), String> {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|_| ())
    .map_err(|e| format!("{e:?}"))
}

#[test]
fn empty_transition_name_errors() {
    assert!(try_compile("<div transition:>x</div>").is_err());
    assert!(try_compile("<div in:>x</div>").is_err());
    assert!(try_compile("<div out:>x</div>").is_err());
    // Empty name before a modifier is still empty.
    assert!(try_compile("<div transition:|global>x</div>").is_err());
}

#[test]
fn valid_transition_still_compiles() {
    let src = r#"<script>import { fade } from 'x';</script><div transition:fade|global>x</div>"#;
    assert!(try_compile(src).is_ok(), "valid transition should compile");
}
