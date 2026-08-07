//! `svelte-ignore` comment-code warnings (`legacy_code` / `unknown_code`) must be
//! emitted while walking the node the comments precede, so they interleave with
//! that node's own warnings in source order — matching the `_` visitor in
//! `2-analyze/index.js`.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn warnings(src: &str) -> Vec<(String, String)> {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .warnings
    .iter()
    .map(|w| (w.code.clone(), w.message.clone()))
    .collect()
}

fn codes(src: &str) -> Vec<String> {
    warnings(src).into_iter().map(|(code, _)| code).collect()
}

/// `packages/svelte/tests/validator/samples/unknown-code/input.svelte`, verbatim.
const UNKNOWN_CODE_FIXTURE: &str = r#"<svelte:options runes={true} />

<!-- svelte-ignore a11y-missing-attribute -->
<div>
	<img src="this-is-fine.jpg">
</div>

<!-- svelte-ignore ally_missing_attribute -->
<div>
	<img src="this-is-fine.jpg">
</div>

<!-- svelte-ignore a11y-misplaced-scope -->
<div scope></div>
"#;

#[test]
fn comment_code_warnings_interleave_with_node_warnings() {
    // Upstream sequence, measured against the official compiler at the pinned
    // submodule: strictly source-ordered (lines 3, 5, 8, 10, 13, 14).
    assert_eq!(
        codes(UNKNOWN_CODE_FIXTURE),
        vec![
            "legacy_code",
            "a11y_missing_attribute",
            "unknown_code",
            "a11y_missing_attribute",
            "legacy_code",
            "a11y_misplaced_scope",
        ]
    );
}

#[test]
fn comment_code_warning_precedes_the_node_it_annotates() {
    let src = r#"<svelte:options runes={true} />
<!-- svelte-ignore a11y-missing-attribute -->
<img src="a.jpg">
<div role="invalid_role"></div>
"#;
    assert_eq!(
        codes(src),
        vec!["legacy_code", "a11y_missing_attribute", "a11y_unknown_role"]
    );
}

#[test]
fn consecutive_ignore_comments_emit_in_reverse_source_order() {
    // Upstream scans the preceding comment run backwards from the annotated
    // node, so the comment nearest the node reports first.
    let src = r#"<svelte:options runes={true} />
<!-- svelte-ignore foo-bar -->
<!-- svelte-ignore baz-qux -->
<div></div>
"#;
    let messages: Vec<String> = warnings(src)
        .into_iter()
        .map(|(_, message)| message)
        .collect();
    assert_eq!(messages.len(), 2, "got: {messages:?}");
    assert!(
        messages[0].contains("baz-qux"),
        "expected `baz-qux` first, got: {messages:?}"
    );
    assert!(
        messages[1].contains("foo-bar"),
        "expected `foo-bar` second, got: {messages:?}"
    );
}
