//! The SSR constant-fold resolved `const r = w;` against `w`'s literal initializer
//! and only afterwards dropped `w` for being written, so the value `w` leaked into
//! `r` survived the removal and the server rendered the pre-write literal. Upstream's
//! `scope.evaluate` recurses into the initializer and stops at `!binding.updated`, so
//! the alias has no known value either.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_server(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Server,
            dev: false,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

fn component(body: &str) -> String {
    format!("<script>\n{body}\n</script>\n\n<b>{{r}}</b>\n")
}

#[test]
fn an_alias_of_a_compound_assigned_let_is_not_folded() {
    let out = compile_server(&component("\tlet w = 1;\n\tw += 2;\n\tconst r = w;"));
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("$.escape(r)"), "{out}");
    assert!(!out.contains("<b>1</b>"), "{out}");
}

/// The write forms the textual reassignment scan in `extract_constant_vars` does not
/// recognise (`=`, `+=`, `-=`, `*=`, `/=`, `++`, `--` are its whole vocabulary). A fix
/// that only reordered that scan passes the test above and fails every row here.
#[test]
fn every_write_form_reaches_the_same_decision() {
    for write in [
        "w = 2", "w += 2", "w -= 2", "w *= 2", "w /= 2", "w %= 2", "w <<= 2", "w >>= 2",
        "w >>>= 2", "w **= 3", "w ??= 2", "w ||= 2", "w &&= 2", "w &= 2", "w |= 2", "w ^= 3",
        "w++", "w--", "++w", "--w",
    ] {
        let out = compile_server(&component(&format!(
            "\tlet w = 8;\n\t{write};\n\tconst r = w;"
        )));
        assert!(!out.contains("COMPILE_ERROR"), "{write}: {out}");
        assert!(out.contains("$.escape(r)"), "{write}: {out}");
        assert!(!out.contains("<b>8</b>"), "{write}: {out}");
    }
}

/// A write that only happens inside a function body still marks the binding updated,
/// and no textual scan of the declaration's own line could see it.
#[test]
fn a_write_from_inside_a_function_reaches_it_too() {
    let out = compile_server(&component(
        "\tlet w = 1;\n\tfunction bump() {\n\t\tw = 9;\n\t}\n\tbump();\n\tconst r = w;",
    ));
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("$.escape(r)"), "{out}");
    assert!(!out.contains("<b>1</b>"), "{out}");
}

/// The alias is transitive: `m` reads a written binding, so `r` reading `m` is unknown
/// as well. Upstream reaches the same answer by recursing one more level.
#[test]
fn the_exclusion_is_transitive_through_a_second_alias() {
    let out = compile_server(&component(
        "\tlet w = 1;\n\tw += 2;\n\tconst m = w;\n\tconst r = m;",
    ));
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("$.escape(r)"), "{out}");
    assert!(!out.contains("<b>1</b>"), "{out}");
}

/// An arithmetic expression over the written binding goes through the same second
/// pass and must not be folded either.
#[test]
fn an_expression_over_a_written_binding_is_not_folded() {
    let out = compile_server(&component("\tlet w = 1;\n\tw += 2;\n\tconst r = w + 10;"));
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("$.escape(r)"), "{out}");
    assert!(!out.contains("<b>11</b>"), "{out}");
}

/// Positive control: with no write anywhere, the alias must still fold — the fix is
/// not "stop folding aliases".
#[test]
fn an_alias_of_an_unwritten_let_is_still_folded() {
    let out = compile_server(&component("\tlet w = 1;\n\tconst r = w;"));
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("<b>1</b>"), "{out}");
    assert!(!out.contains("$.escape(r)"), "{out}");
}

/// The same control one level deeper, so a fix that merely stopped the second pass
/// from resolving identifiers would fail here.
#[test]
fn a_chain_of_unwritten_aliases_is_still_folded() {
    let out = compile_server(&component(
        "\tlet w = 1;\n\tconst m = w;\n\tconst r = m + 10;",
    ));
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("<b>11</b>"), "{out}");
    assert!(!out.contains("$.escape(r)"), "{out}");
}

/// Only the outer `w` is read by the alias and only a same-named inner binding is
/// written. Phase 2 separates them, so the fold stays.
#[test]
fn a_write_to_a_shadowing_binding_does_not_exclude_the_outer_one() {
    let out = compile_server(&component(
        "\tlet w = 1;\n\tfunction f(w) {\n\t\tw = 2;\n\t}\n\tconst r = w;",
    ));
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(out.contains("<b>1</b>"), "{out}");
    assert!(!out.contains("$.escape(r)"), "{out}");
}
