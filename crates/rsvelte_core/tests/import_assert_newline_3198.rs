//! Issue #3198: `assert { … }` on the line after the module specifier.
//!
//! OXC only accepts the deprecated `assert` keyword when it is not on a new
//! line, so it applies ASI and errors on the following token; acorn reads the
//! clause in TypeScript (accepting the file) and, in JavaScript, rejects at the
//! `{` that cannot continue the `assert` expression statement.
//!
//! The JavaScript rows and the `with` spelling are pinned here. The TypeScript
//! row — where acorn-typescript keeps the clause and official compiles the file
//! — is still an over-rejection: OXC's guard lives in
//! `parse_import_attributes`, and a repaired re-parse cannot be threaded through
//! `RetainedProgram`, whose owner borrows the component source for `'source`.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn outcome(src: &str) -> Result<(), (String, String, usize, usize)> {
    match compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    ) {
        Ok(_) => Ok(()),
        Err(e) => {
            let d = e.diagnostic();
            let (start, end) = d.span.unwrap_or((u32::MAX, u32::MAX));
            Err((
                d.code.unwrap_or_default(),
                d.message.lines().next().unwrap_or_default().to_string(),
                start as usize,
                end as usize,
            ))
        }
    }
}

const BODY: &str = "import d from \"./d.json\"\n\tassert { type: \"json\" };\n\tlet z = d;";

fn wrap(attrs: &str) -> String {
    format!("<script{attrs}>\n\t{BODY}\n</script>\n")
}

#[test]
fn javascript_rejects_at_the_brace() {
    // Official: `js_parse_error` "Unexpected token" at the `{` after `assert`
    // (character 43 for the instance wrapper, 50 for `<script module>`).
    for (attrs, expected) in [("", 43usize), (" module", 50)] {
        let src = wrap(attrs);
        assert_eq!(
            src.as_bytes()[expected],
            b'{',
            "test fixture drifted: expected `{{` at {expected}"
        );
        match outcome(&src) {
            Ok(()) => panic!("expected <script{attrs}> to be rejected"),
            Err((code, message, start, end)) => {
                assert_eq!(code, "js_parse_error", "for <script{attrs}>");
                assert_eq!(message, "Unexpected token", "for <script{attrs}>");
                assert_eq!(start, expected, "start for <script{attrs}>");
                assert_eq!(end, expected, "end for <script{attrs}>");
            }
        }
    }
}

#[test]
fn same_line_assert_is_unchanged() {
    // The control: official rejects at the `assert` keyword in JS and accepts
    // in TS. This row already agreed and must keep agreeing.
    let body = "import d from \"./d.json\" assert { type: \"json\" };\n\tlet z = d;";
    let src = format!("<script>\n\t{body}\n</script>\n");
    match outcome(&src) {
        Ok(()) => panic!("expected same-line `assert` to be rejected in JS"),
        Err((code, message, start, _)) => {
            assert_eq!(code, "js_parse_error");
            assert_eq!(message, "Unexpected token");
            assert_eq!(start, 35);
        }
    }
    let ts = format!("<script lang=\"ts\">\n\t{body}\n</script>\n");
    assert!(outcome(&ts).is_ok(), "TS same-line `assert` must compile");
}

#[test]
fn with_clause_on_a_new_line_compiles_everywhere() {
    // `with` has no new-line restriction in either parser.
    let body = "import d from \"./d.json\"\n\twith { type: \"json\" };\n\tlet z = d;";
    for attrs in ["", " lang=\"ts\"", " module", " module lang=\"ts\""] {
        let src = format!("<script{attrs}>\n\t{body}\n</script>\n");
        if let Err((code, message, start, _)) = outcome(&src) {
            panic!(
                "expected <script{attrs}> with `with` to compile, got `{code}` {message:?} at {start}"
            );
        }
    }
}
