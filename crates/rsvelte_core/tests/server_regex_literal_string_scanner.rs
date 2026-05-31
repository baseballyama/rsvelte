//! Regression test for the server-side `reescape_control_chars_in_string_literals`
//! pass mistaking quote characters inside regex literals for string-literal
//! openers (baseballyama/rsvelte#154).
//!
//! The pre-fix scanner toggled `in_string` on `"` / `'` without knowing about
//! regex literals. A regex like `/"/` flipped the flag on and never flipped
//! it back, so every subsequent tab byte was rewritten to a `\t` escape — a
//! literal backslash-t in the emitted JS, which rolldown/oxc reject as
//! `Invalid Unicode escape sequence`.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_server(src: &str) -> String {
    let result = compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile");
    result.js.code
}

fn assert_no_literal_backslash_t(out: &str) {
    // The bug shape: a real `\` byte followed by `t` at the start of an
    // (otherwise tab-indented) line. Real tab characters never trigger this
    // assertion because they're 0x09 bytes, not the 2-char escape.
    assert!(
        !out.contains("\\t"),
        "output contains a literal `\\t` escape outside a string literal:\n{out}"
    );
}

#[test]
fn regex_with_double_quote_does_not_corrupt_following_indent() {
    let src = r#"<script>
  const a = () => /"/.test('');
  const b = () => {
    const x = 1;
  };
</script>
<p>{b}</p>"#;
    let out = compile_server(src);
    assert_no_literal_backslash_t(&out);
    // The arrow body must still be present.
    assert!(out.contains("const x = 1"), "missing body, got:\n{out}");
}

#[test]
fn regex_with_single_quote_does_not_corrupt_following_indent() {
    let src = r#"<script>
  const a = () => /'/.test("");
  const b = () => {
    const x = 1;
  };
</script>
<p></p>"#;
    let out = compile_server(src);
    assert_no_literal_backslash_t(&out);
}

#[test]
fn regex_with_quote_and_escape_classes_does_not_corrupt() {
    // The real-world pattern from issue #154's downstream report.
    let src = r#"<script lang="ts">
  const isValibotErrorMessage = (message: string) => {
    return /["']success["']\s*:\s*false/.test(message);
  };
  const initDatadog = () => {
    const ddSite = 'ap1.datadoghq.com';
    const ddVersion = '1.0.0';
    if (ddSite) {
      console.log({ site: ddSite, version: ddVersion });
    }
  };
</script>
<div></div>"#;
    let out = compile_server(src);
    assert_no_literal_backslash_t(&out);
    assert!(out.contains("const ddSite ="), "missing body, got:\n{out}");
}

#[test]
fn division_after_identifier_is_not_treated_as_regex() {
    // Regression guard: `b / 2` is division (preceded by identifier-end),
    // not a regex. The scanner must not skip into "regex mode" and lose
    // the operator.
    let src = r#"<script>
  const a = 10;
  const b = a / 2;
</script>
<p></p>"#;
    let out = compile_server(src);
    assert!(
        out.contains("a / 2"),
        "division should be preserved, got:\n{out}"
    );
}

#[test]
fn regex_with_character_class_does_not_corrupt() {
    // `/[^"']*/` — quotes inside a character class.
    let src = r#"<script>
  const a = () => /[^"']*/.test('');
  const b = () => {
    const x = 1;
  };
</script>
<p></p>"#;
    let out = compile_server(src);
    assert_no_literal_backslash_t(&out);
}
