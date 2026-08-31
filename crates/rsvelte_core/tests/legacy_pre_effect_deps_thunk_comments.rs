//! The legacy dependency thunk is not a comment flush point.
//!
//! Upstream builds it as `b.thunk(b.sequence(deps))`, which carries no `loc`,
//! so esrap's comment cursor never writes there. rsvelte generates the whole
//! `$.legacy_pre_effect(...)` as text and APPENDS it after the rest of the
//! instance body, so re-parsing hands the thunk coordinates that sit past a
//! script-tail comment run — and the run printed inside the thunk's empty
//! parameter list / concise body. The output still parses, so only output
//! equality can see it.
//!
//! Reproduced from sparrow-app's `collection-list/.../Folder.svelte`.
//! Expectations are the byte-exact output of the official compiler (v5.56.10).

use rsvelte_core::{CompileOptions, CssMode, GenerateMode, compile};

const SRC: &str = include_str!(
    "../../../compatibility/pattern-corpus/issues/legacy-pre-effect-deps-thunk-comments.svelte"
);

fn client(dev: bool) -> String {
    compile(
        SRC,
        CompileOptions {
            filename: Some("Legacy_pre_effect_deps_thunk_comments.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

#[test]
fn the_dependency_thunk_carries_no_comment() {
    let out = client(false);
    assert!(
        out.contains(
            "\t$.legacy_pre_effect(() => ($.deep_read_state(searchData())), () => {\n\t\t$.set(expand, !searchData());\n\t});\n"
        ),
        "{out}"
    );
}

#[test]
fn the_dependency_thunk_carries_no_comment_in_dev_mode() {
    let out = client(true);
    assert!(!out.contains("() => (\n"), "{out}");
    assert!(
        out.contains("$.legacy_pre_effect(() => ($.deep_read_state("),
        "{out}"
    );
}

/// The controls, in the same output: the run that precedes `function f()` is
/// still printed there, and the located function body still prints its own
/// comment. A fix that stopped emitting these comments altogether would pass
/// the assertion above and fail these.
#[test]
fn the_script_tail_run_and_the_located_body_comment_are_still_printed() {
    let out = client(false);
    assert!(
        out.contains(
            "\t// const unsub = store.subscribe((v) => {\n\t//   expand = v;\n\t// });\n\tfunction f() {\n"
        ),
        "{out}"
    );
    assert!(
        out.contains("\t\t// The control: a located body still prints its own comment.\n"),
        "{out}"
    );
}
