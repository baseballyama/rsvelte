//! A rule whose every `:is()` branch is unreachable warns on the whole selector.
//!
//! `branch_is_marked_unused` reads a set the unused walk itself fills, so a rule
//! asked before its own branch has been marked answers against an empty set and
//! is judged used — which moves the warning from the rule's prelude onto the
//! branch inside the parentheses. The printer runs the marking pass first; the
//! warning path did not.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

const SRC: &str = include_str!(
    "../../../compatibility/pattern-corpus/issues/is-branch-unused-warning-position.svelte"
);

fn positions(generate: GenerateMode, dev: bool) -> Vec<(String, usize, usize, usize, usize)> {
    compile(
        SRC,
        CompileOptions {
            generate,
            filename: Some("Probe.svelte".to_string()),
            css: CssMode::External,
            dev,
            ..Default::default()
        },
    )
    .expect("compiles")
    .warnings
    .iter()
    .map(|w| {
        let start = w.start.as_ref().expect("start");
        let end = w.end.as_ref().expect("end");
        (
            w.code.clone(),
            start.line,
            start.column,
            end.line,
            end.column,
        )
    })
    .collect()
}

/// The two anchors come from the official compiler on this exact file:
/// `7:22-7:35` for the live rule's dead branch and `15:1-15:27` for the whole prelude.
#[test]
fn an_all_unused_is_warns_on_the_whole_selector() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        for dev in [false, true] {
            let got = positions(generate, dev);
            assert_eq!(
                got,
                vec![
                    ("css_unused_selector".to_string(), 7, 22, 7, 35),
                    ("css_unused_selector".to_string(), 15, 1, 15, 27),
                ],
                "dev={dev}"
            );
        }
    }
}
