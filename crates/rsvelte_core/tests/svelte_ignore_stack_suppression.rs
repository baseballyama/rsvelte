//! `svelte-ignore` comment-code warnings (`legacy_code` / `unknown_code`) go through the
//! same ignore stack as every other warning: upstream raises them with `w()`, and the
//! `{ start, end }` literal it passes is never in `ignore_map`, so the stack consulted is
//! the one in force when the annotated node is reached — i.e. the enclosing scope's,
//! before the comment run's own codes are pushed.
//!
//! Every expectation below was measured against the official compiler at the pinned
//! submodule (5.56.8).

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

const RUNES: &str = "<svelte:options runes={true} />\n";

fn codes(body: &str) -> Vec<String> {
    compile(
        &format!("{RUNES}{body}"),
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
    .map(|w| w.code.clone())
    .collect()
}

#[test]
fn enclosing_ignore_suppresses_unknown_code() {
    let empty: Vec<String> = vec![];
    assert_eq!(
        codes(
            r#"<!-- svelte-ignore unknown_code -->
<div>
	<!-- svelte-ignore zzz-yyy -->
	<span>x</span>
</div>
"#
        ),
        empty
    );
}

#[test]
fn enclosing_ignore_suppresses_legacy_code() {
    let empty: Vec<String> = vec![];
    assert_eq!(
        codes(
            r#"<!-- svelte-ignore legacy_code -->
<div>
	<!-- svelte-ignore empty-block -->
	<span>x</span>
</div>
"#
        ),
        empty
    );
}

#[test]
fn unknown_code_warns_without_an_enclosing_ignore() {
    assert_eq!(
        codes(
            r#"<div>
	<!-- svelte-ignore zzz-yyy -->
	<span>x</span>
</div>
"#
        ),
        vec!["unknown_code"]
    );
}

#[test]
fn legacy_code_warns_without_an_enclosing_ignore() {
    assert_eq!(
        codes(
            r#"<div>
	<!-- svelte-ignore empty-block -->
	<span>x</span>
</div>
"#
        ),
        vec!["legacy_code"]
    );
}

#[test]
fn a_comment_cannot_ignore_its_own_code() {
    // The comment run's codes are pushed only after the whole run has been scanned.
    assert_eq!(
        codes(
            r#"<!-- svelte-ignore unknown_code, zzz-yyy -->
<div>x</div>
"#
        ),
        vec!["unknown_code"]
    );
}

#[test]
fn a_sibling_comment_in_the_same_run_cannot_ignore_the_next_one() {
    assert_eq!(
        codes(
            r#"<!-- svelte-ignore unknown_code -->
<!-- svelte-ignore zzz-yyy -->
<span>x</span>
"#
        ),
        vec!["unknown_code"]
    );
}

#[test]
fn the_ignore_scope_ends_with_the_annotated_element() {
    assert_eq!(
        codes(
            r#"<div>
	<!-- svelte-ignore unknown_code -->
	<span>x</span>
</div>
<!-- svelte-ignore zzz-yyy -->
<span>y</span>
"#
        ),
        vec!["unknown_code"]
    );
}

#[test]
fn an_enclosing_unknown_code_ignore_suppresses_nothing_else() {
    assert_eq!(
        codes(
            r#"<!-- svelte-ignore unknown_code -->
<div>
	<!-- svelte-ignore zzz-yyy -->
	<img src="x.png" />
</div>
"#
        ),
        vec!["a11y_missing_attribute"]
    );
}

#[test]
fn unknown_code_and_legacy_code_do_not_suppress_each_other() {
    assert_eq!(
        codes(
            r#"<!-- svelte-ignore unknown_code -->
<div>
	<!-- svelte-ignore empty-block -->
	<span>x</span>
</div>
"#
        ),
        vec!["legacy_code"]
    );
    assert_eq!(
        codes(
            r#"<!-- svelte-ignore legacy_code -->
<div>
	<!-- svelte-ignore zzz-yyy -->
	<span>x</span>
</div>
"#
        ),
        vec!["unknown_code"]
    );
}
