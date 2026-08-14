//! Dev-mode `$$ownership_validator.mutation` wrap around a **multi-line**
//! prop-member mutation.
//!
//! `wrap_prop_mutation_validation` matches the already-lowered
//! `prop(prop().member = value, true)` call as text. When the assigned value is
//! long enough for the assigned arrow function to span multiple lines, that text becomes
//!
//! ```text
//! filter(filter().onRemove = () => { … }, true);
//! ```
//!
//! and the single-line-only matcher fell through to the runes-mode branch, which
//! wrapped the inner assignment and terminated its expression scan at the first
//! newline — emitting `mutation(…, filter().onRemove = …,, line, col)` inside
//! `filter(`, with `true` orphaned. That output is not JavaScript.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

const SRC: &str = r#"<script>
  export let filter;
  filter.onRemove = () => {
    remove(filter.index);
  };
</script>

<p>{filter.index}</p>
"#;

fn client(src: &str, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn flat(code: &str) -> String {
    code.split_whitespace().collect::<Vec<_>>().join(" ")
}

#[test]
fn dev_wraps_the_whole_prop_setter_call() {
    let out = client(SRC, true);
    let flat = flat(&out);

    // The nesting upstream produces: the `filter(…, true)` setter call is the
    // third *argument* of the validator call, not its parent.
    assert!(
        flat.contains(
            "$$ownership_validator.mutation(null, ['filter', 'onRemove'], filter(filter().onRemove = () => { remove(filter().index); }, true), 3, 2);"
        ),
        "got:\n{out}"
    );

    // The two fingerprints of the mis-splice: an empty argument slot, and a
    // `true` left outside the call it belonged to.
    assert!(!out.contains(",,"), "empty argument slot in:\n{out}");
    assert!(!out.contains("2)\n\t\ttrue"), "orphaned `true` in:\n{out}");
}

/// Production output keeps the complete setter call without the dev wrapper.
#[test]
fn prod_output_is_unchanged() {
    let out = client(SRC, false);
    let flat = flat(&out);
    assert!(!out.contains("$$ownership_validator"), "got:\n{out}");
    assert!(
        flat.contains("filter(filter().onRemove = () => { remove(filter().index); }, true);"),
        "got:\n{out}"
    );
}

/// The single-line shape (short assigned value, no printer line break) already
/// worked and must keep working — it is the arm the fix must not disturb.
#[test]
fn dev_single_line_mutation_still_wraps() {
    let out = client(
        "<script>\n  export let filter;\n  filter.index = 1;\n</script>\n\n<p>{filter.index}</p>\n",
        true,
    );
    assert!(
        out.contains("$$ownership_validator.mutation(null, ['filter', 'index'], filter(filter().index = 1, true), 3, 2)"),
        "got:\n{out}"
    );
}
