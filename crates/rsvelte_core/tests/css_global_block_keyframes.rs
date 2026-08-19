//! A `@keyframes` inside a `:global { … }` block must not scope the component.
//! Upstream's prune walker visits only such a rule's prelude, so nothing in its
//! body can mark an element used — rsvelte read the `0%` step and gave every
//! element the scope class. Its `-global-` prefix must still be stripped, which
//! the verbatim copy of the block's children skipped.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

const SOURCE: &str = "<section>x</section>\n\
     <style>\n\
     \t:global {\n\
     \t\t@keyframes -global-fade {\n\
     \t\t\t0% {\n\
     \t\t\t\topacity: 0;\n\
     \t\t\t}\n\
     \t\t}\n\
     \t}\n\
     </style>\n";

fn compile_client() -> (String, String) {
    let result = compile(
        SOURCE,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile");
    (
        result.js.code,
        result.css.map(|c| c.code).unwrap_or_default(),
    )
}

#[test]
fn keyframes_in_a_global_block_does_not_scope_elements() {
    let (js, _) = compile_client();
    assert!(!js.contains("svelte-"), "element was scoped:\n{js}");
}

#[test]
fn keyframes_in_a_global_block_still_loses_its_global_prefix() {
    let (_, css) = compile_client();
    assert!(
        css.contains("@keyframes fade"),
        "`-global-` prefix not stripped:\n{css}"
    );
}
