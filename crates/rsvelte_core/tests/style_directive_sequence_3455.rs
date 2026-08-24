use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(markup: &str) -> String {
    compile(
        &format!(
            "<script>\n\tlet s = \"x\";\n\tlet o = {{ k: \"k\" }};\n\tlet rest = {{ id: 1 }};\n\tfunction f() {{ return \"z\"; }}\n\tvoid s;\n\tvoid o;\n\tvoid rest;\n</script>\n\n{markup}\n"
        ),
        CompileOptions {
            filename: Some("A.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile failed")
    .js
    .code
}

/// Upstream's phase-2 `StyleDirective` visitor merges the metadata of every
/// `ExpressionTag` chunk, so a directive whose FIRST chunk folds to a constant
/// is still reactive when a later chunk is not.
#[test]
fn a_later_chunk_of_a_style_directive_sequence_decides_reactivity() {
    let out = client(r#"<div style:color="{s}{o.k}"></div>"#);
    assert!(
        out.contains("let styles;"),
        "expected the memoized `styles` binding, got:\n{out}"
    );
    assert!(
        out.contains("$.template_effect(() => styles = $.set_style("),
        "expected the style write inside a template_effect, got:\n{out}"
    );
}

/// The same value with the chunks swapped already worked, because the scan
/// stopped at the first tag. It must keep working.
#[test]
fn a_leading_reactive_chunk_still_produces_the_effect() {
    let out = client(r#"<div style:color="{o.k}{s}"></div>"#);
    assert!(
        out.contains("let styles;"),
        "expected the memoized `styles` binding, got:\n{out}"
    );
}

/// Negative control: when NO chunk is reactive the directive must stay a
/// one-shot init call with an empty previous-styles object.
#[test]
fn a_sequence_of_only_known_chunks_stays_a_one_shot_call() {
    let out = client(r#"<div style:color="{s}{s}"></div>"#);
    assert!(
        !out.contains("let styles;"),
        "a fully-constant directive must not allocate `styles`, got:\n{out}"
    );
    assert!(
        out.contains("$.set_style(div, '', {}, "),
        "expected the one-shot form, got:\n{out}"
    );
}

/// The spread path builds the same object through `build_style_directives_object`,
/// a second caller of the same scan. Its accumulator only reaches the output
/// through the memoizer, so the witness has to be a call in a later chunk —
/// `{s}{o.k}` compiles identically there whether or not the scan is fixed.
#[test]
fn the_spread_attribute_path_also_reads_every_chunk() {
    let out = client(r#"<div {...rest} style:color="{s}{f()}"></div>"#);
    assert!(
        out.contains("[() => ({ color: `x${f() ?? ''}` })]"),
        "expected the later chunk's call to be memoized into the dependency array, got:\n{out}"
    );
}
