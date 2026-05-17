//! Regression test for `{@render snippet(arg, arg, …,)}` multi-line
//! trailing-comma argument truncation (baseballyama/rsvelte#159).
//!
//! Bug: `try_parse_call_expression` in the simple-expression fast path
//! computed each argument's source offset as
//!
//!     offset + args_start + start + (...trim_start delta inside the slice)
//!
//! but `args_str` was already `content[args_start..args_end].trim()` — i.e.
//! the leading whitespace of the args region was stripped *before* the
//! per-argument offsets were computed. The fix re-adds the leading-whitespace
//! byte count so positions point at the real source bytes.
//!
//! When the offsets were short by N bytes, the SSR `{@render}` visitor
//! sliced `source[a_start..a_end]` and got "N bytes shifted left" — so each
//! argument lost N characters off the end, and the first argument lost
//! anywhere up to its full length (saturating at empty).

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

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

#[test]
fn multiline_trailing_comma_render_args_preserved() {
    let src = r#"<script>
  let items = $state([1, 2]);
  let currentChain = [];
  let binaryCondition = 1;
  let fieldDropdown = 2;
  let onSelectField = 3;
</script>

{#snippet drilldown(arg1, arg2, arg3, arg4, arg5)}
  {#each items as nested}
    {@render drilldown(
      nested,
      currentChain,
      binaryCondition,
      fieldDropdown,
      onSelectField,
    )}
  {/each}
{/snippet}

{@render drilldown(0, 1, 2, 3, 4)}"#;
    let out = compile_server(src);
    // Every argument name must reach the call site untruncated.
    for name in [
        "nested",
        "currentChain",
        "binaryCondition",
        "fieldDropdown",
        "onSelectField",
    ] {
        assert!(
            out.contains(name),
            "expected arg {} to be preserved:\n{out}",
            name
        );
    }
    // No empty argument slot in the call (the pre-fix bug emitted
    // `drilldown($$renderer, , curre, ...)`).
    assert!(
        !out.contains("$$renderer, ,"),
        "found empty argument slot — first arg truncated to empty:\n{out}"
    );
}

#[test]
fn single_line_render_call_still_works() {
    // Regression guard: the original (non-multi-line) case must keep working.
    let src = r#"<script>
  let a = 1;
  let b = 2;
</script>

{#snippet show(x, y)}
  <span>{x}-{y}</span>
{/snippet}

{@render show(a, b)}"#;
    let out = compile_server(src);
    assert!(out.contains("show($$renderer, a, b)"), "got:\n{out}");
}

#[test]
fn multiline_render_call_with_tab_indent_preserved() {
    // Different indentation widths (4 spaces) — the offset adjustment must
    // scale with the actual leading-whitespace length, not a hard-coded 7.
    let src = "<script>\n    let a = 1;\n    let b = 2;\n</script>\n\n{#snippet show(x, y)}\n    <span>{x}-{y}</span>\n{/snippet}\n\n{@render show(\n    a,\n    b,\n)}";
    let out = compile_server(src);
    assert!(out.contains("show($$renderer, a, b)"), "got:\n{out}");
}
