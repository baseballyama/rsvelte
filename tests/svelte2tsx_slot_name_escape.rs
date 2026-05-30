//! Regression test: svelte2tsx must JS-escape slot names interpolated into the
//! generated `slots: { '<name>': … }` literal (issue #455, H-092).
//!
//! Bug: `format!("'{}': ''", name)` at svelte2tsx.rs:609 (the `$$slots` declaration)
//! and `format!("'{}': {{}}", name)` at :1383 / :1385 (the slots-info dump)
//! interpolated the raw slot name without escaping. A slot whose `name`
//! attribute carries `'` produced invalid JS such as `slots: {'foo'bar': {}}`.

use svelte_compiler_rust::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn run(src: &str) -> String {
    svelte2tsx(
        src,
        Svelte2TsxOptions {
            filename: "T.svelte".to_string(),
            ..Default::default()
        },
    )
    .expect("compile")
    .code
}

#[test]
fn slot_name_with_apostrophe_is_escaped() {
    let out = run(r##"<slot name="foo'bar"/>"##);
    // The output must contain a properly escaped slot key, and must not contain
    // the bare unescaped `'foo'bar'` shape that breaks JS parsing.
    assert!(out.contains(r#"'foo\'bar'"#), "got:\n{out}");
    assert!(
        !out.contains("'foo'bar'"),
        "must not be unescaped, got:\n{out}"
    );
}

#[test]
fn plain_slot_name_is_unchanged() {
    let out = run(r##"<slot name="foo"/>"##);
    assert!(out.contains("'foo'"), "got:\n{out}");
}

#[test]
fn default_slot_is_unchanged() {
    let out = run(r##"<slot/>"##);
    assert!(out.contains("'default'"), "got:\n{out}");
}
