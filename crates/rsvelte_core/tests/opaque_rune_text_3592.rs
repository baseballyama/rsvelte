//! Regression tests for #3592 — a rune NAME that is text, not code.
//!
//! Two independent causes, and the rows below separate them:
//!
//! * `skip_opaque` scanned a backtick in the same arm as `'` and `"`, i.e. by
//!   looking for the next unescaped copy of the same byte. A template literal
//!   is not delimited that way — `${ … }` re-enters code, and a nested template
//!   opens another — so the scan left the literal at the *second* backtick.
//!   That produces a parity signature no "we forgot nesting" story does: even
//!   nesting depth wrong, odd depth right.
//! * `$inspect` / `$inspect.trace` were removed by a raw `memmem::find`, with no
//!   opacity check at all, so they were rewritten inside a single string, a
//!   line comment and an object key too.
//!
//! Both outputs parse and run, so the parse oracle is blind to either; only
//! output equality reports them.
//!
//! Every expectation below is the byte-exact declaration the official compiler
//! emits (Svelte v5.56.9). Comment rows expect the comment GONE, because
//! `compileModule` drops comments on both sides — they still discriminate,
//! since the defect rewrote the statement that follows.

use rsvelte_core::compiler::ModuleCompileOptions;
use rsvelte_core::{GenerateMode, compile_module};

fn module(src: &str, generate: GenerateMode) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("X.svelte.js".to_string()),
            generate,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// Asserts both targets emit `expected` verbatim for `body`.
fn emits(body: &str, expected: &str) {
    let src = format!("{body}\nexport const x = 1;\n");
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let out = module(&src, generate);
        assert!(
            out.contains(expected),
            "{generate:?}\nfor:      {body}\nexpected: {expected}\nin:\n{out}"
        );
    }
}

/// The even/odd signature of the backtick toggle: depths 2 and 4 were rewritten
/// (`$.state(0)` on the client, `0` on the server) while 1, 3 and 5 were right.
/// The odd rows are here so a fix that stops scanning templates altogether would
/// still have to pass.
#[test]
fn a_rune_name_in_a_nested_template_literal_stays_text() {
    let mut inner = String::from("`$state(0)`");
    for _ in 1..=5 {
        emits(
            &format!("const t = {inner};"),
            &format!("const t = {inner};"),
        );
        let derived = inner.replace("$state", "$derived");
        emits(
            &format!("const t = {derived};"),
            &format!("const t = {derived};"),
        );
        inner = format!("`a ${{{inner}}} b`");
    }
}

/// A substitution really is code again: these decide whether the scan re-entered
/// it rather than skipping to the literal's end.
#[test]
fn a_substitution_is_scanned_as_code() {
    emits(
        "const t = `a ${\"`$state(0)`\"} b`;",
        "const t = `a ${\"`$state(0)`\"} b`;",
    );
    emits(
        "const t = `a ${{ k: `$state(0)` }.k} b`;",
        "const t = `a ${({ k: `$state(0)` }).k} b`;",
    );
    emits(
        "const t = `a \\` ${`$state(0)`} b`;",
        "const t = `a \\` ${`$state(0)`} b`;",
    );
    // Both compilers drop the comment; what must survive is the `1`.
    emits(
        "const t = `a ${/* `$state(0)` */ 1} b`;",
        "const t = `a ${1} b`;",
    );
}

/// A real rune after a nested template must still be lowered — the control that
/// keeps the scan from swallowing the rest of the file. `n` is written, so both
/// compilers make it a source rather than folding it away.
#[test]
fn a_real_rune_after_a_nested_template_is_still_lowered() {
    let out = module(
        "const t = `a ${`b ${\"c\"} d`} e`;\nlet n = $state(1);\nexport function bump() { n += 1; return [t, n]; }\n",
        GenerateMode::Client,
    );
    assert!(out.contains("$.state(1)"), "in:\n{out}");
    assert!(
        out.contains("const t = `a ${`b ${\"c\"} d`} e`;"),
        "in:\n{out}"
    );
}

/// The second cause: `$inspect` was removed from every opaque region, not only
/// from a nested template. The single-quote and single-backtick rows are the
/// discriminating ones — the `skip_opaque` fix alone leaves them broken.
#[test]
fn inspect_is_only_removed_where_it_is_code() {
    for text in ["$inspect(1)", "$inspect.trace(1)"] {
        emits(
            &format!("const t = \"{text}\";"),
            &format!("const t = \"{text}\";"),
        );
        emits(
            &format!("const t = '{text}';"),
            &format!("const t = '{text}';"),
        );
        emits(
            &format!("const t = `{text}`;"),
            &format!("const t = `{text}`;"),
        );
        emits(
            &format!("const t = {{ \"{text}\": 1 }};"),
            &format!("const t = {{ \"{text}\": 1 }};"),
        );
        emits(&format!("// {text}\nconst t = 1;"), "const t = 1;");
        emits(&format!("/* {text} */\nconst t = 1;"), "const t = 1;");
    }
}

/// The control for the row above: a real non-dev `$inspect` statement is still
/// removed.
#[test]
fn a_real_inspect_statement_is_still_removed() {
    let out = module(
        "let n = $state(1);\n$inspect(n);\nexport function bump() { n += 1; return n; }\n",
        GenerateMode::Client,
    );
    assert!(!out.contains("$inspect("), "in:\n{out}");
    assert!(out.contains("$.state(1)"), "in:\n{out}");
}
