//! The formatter has its own `(…)` expression wrapper, and it produces the same
//! diagnostic acorn never raises (#4083, second port).
//!
//! `format_expr_core` parses a template expression as `(<expr>\n);`. A head OXC
//! reads as a TypeScript parameter modifier — `accessor`, `declare`, `readonly`
//! — makes that `(` open an arrow parameter list, so the parse aborts with
//! `TS(1090)` and an empty program and the whole file is returned unformatted.
//! The const wrapper is the same expression position with no `(` at the head;
//! measured in OXC, `const _rsvelte_x_ = (<expr>);` fails exactly as `(<expr>);`
//! does, so the parens are the carrier rather than the statement position.
//!
//! Ablating the retry takes this grid from 71 EQ / 0 ERR to 53 EQ / 18 ERR, and
//! moves no cell the other way. Every expectation is the text the oxfmt oracle
//! (`svelte: true`, the corpus config) emits for that component, which leaves
//! all 71 bodies byte-identical to their input.
//!
//! Two shapes are pinned as still failing rather than fixed, because the retry
//! is deliberately narrow. `{accessor satisfies string, declare}` would need a
//! wrapper that keeps sequence semantics without a `(`, and the const wrapper
//! turns it into two declarators — rejected by `is_single_declarator` and by
//! OXC's own diagnostics. The collected corpus holds 0 carriers of a
//! modifier-named head in a template expression (5 greps hit, all of them
//! `import { readonly as readOnly }` specifiers).

use rsvelte_formatter::{FormatOptions, format};

/// The prelude every cell shares, already in the oracle's 2-space indentation:
/// only the body below it varies, so a divergence is about the expression.
const PRELUDE: &str = "<script lang=\"ts\">\n  let accessor: any;\n  let declare: any;\n  let readonly: any;\n  let type: any;\n  let value: any;\n</script>\n\n";

/// The source's own prelude, which the oracle re-indents from tabs.
const SRC_PRELUDE: &str = "<script lang=\"ts\">\n\tlet accessor: any;\n\tlet declare: any;\n\tlet readonly: any;\n\tlet type: any;\n\tlet value: any;\n</script>\n\n";

/// `(host, expression, body)`. The body is both the input and — measured
/// against the oracle — the expected output, so one column carries both.
const CELLS: &[(&str, &str, &str)] = &[
    (
        "mustache",
        "accessor_satisfies",
        r#"<p>{accessor satisfies string}</p>"#,
    ),
    (
        "mustache",
        "declare_satisfies",
        r#"<p>{declare satisfies string}</p>"#,
    ),
    (
        "mustache",
        "readonly_satisfies",
        r#"<p>{readonly satisfies string}</p>"#,
    ),
    ("mustache", "accessor_as", r#"<p>{accessor as string}</p>"#),
    (
        "mustache",
        "type_satisfies",
        r#"<p>{type satisfies string}</p>"#,
    ),
    (
        "mustache",
        "plain_satisfies",
        r#"<p>{value satisfies string}</p>"#,
    ),
    ("mustache", "sequence", r#"<p>{(accessor, declare)}</p>"#),
    ("mustache", "object_head", r#"<p>{{ a: 1 }.a}</p>"#),
    (
        "attribute",
        "accessor_satisfies",
        r#"<p title={accessor satisfies string}>x</p>"#,
    ),
    (
        "attribute",
        "declare_satisfies",
        r#"<p title={declare satisfies string}>x</p>"#,
    ),
    (
        "attribute",
        "readonly_satisfies",
        r#"<p title={readonly satisfies string}>x</p>"#,
    ),
    (
        "attribute",
        "accessor_as",
        r#"<p title={accessor as string}>x</p>"#,
    ),
    (
        "attribute",
        "type_satisfies",
        r#"<p title={type satisfies string}>x</p>"#,
    ),
    (
        "attribute",
        "plain_satisfies",
        r#"<p title={value satisfies string}>x</p>"#,
    ),
    (
        "attribute",
        "sequence",
        r#"<p title={(accessor, declare)}>x</p>"#,
    ),
    ("attribute", "object_head", r#"<p title={{ a: 1 }.a}>x</p>"#),
    (
        "event_arrow",
        "accessor_satisfies",
        r#"<p onclick={() => accessor satisfies string}>e</p>"#,
    ),
    (
        "event_arrow",
        "declare_satisfies",
        r#"<p onclick={() => declare satisfies string}>e</p>"#,
    ),
    (
        "event_arrow",
        "readonly_satisfies",
        r#"<p onclick={() => readonly satisfies string}>e</p>"#,
    ),
    (
        "event_arrow",
        "accessor_as",
        r#"<p onclick={() => accessor as string}>e</p>"#,
    ),
    (
        "event_arrow",
        "type_satisfies",
        r#"<p onclick={() => type satisfies string}>e</p>"#,
    ),
    (
        "event_arrow",
        "plain_satisfies",
        r#"<p onclick={() => value satisfies string}>e</p>"#,
    ),
    (
        "event_arrow",
        "sequence",
        r#"<p onclick={() => (accessor, declare)}>e</p>"#,
    ),
    (
        "if_header",
        "accessor_satisfies",
        r#"{#if accessor satisfies string}y{/if}"#,
    ),
    (
        "if_header",
        "declare_satisfies",
        r#"{#if declare satisfies string}y{/if}"#,
    ),
    (
        "if_header",
        "readonly_satisfies",
        r#"{#if readonly satisfies string}y{/if}"#,
    ),
    (
        "if_header",
        "accessor_as",
        r#"{#if accessor as string}y{/if}"#,
    ),
    (
        "if_header",
        "type_satisfies",
        r#"{#if type satisfies string}y{/if}"#,
    ),
    (
        "if_header",
        "plain_satisfies",
        r#"{#if value satisfies string}y{/if}"#,
    ),
    (
        "if_header",
        "sequence",
        r#"{#if (accessor, declare)}y{/if}"#,
    ),
    ("if_header", "object_head", r#"{#if { a: 1 }.a}y{/if}"#),
    (
        "const_tag",
        "accessor_satisfies",
        r#"{#if 1}{@const c = accessor satisfies string}{c}{/if}"#,
    ),
    (
        "const_tag",
        "declare_satisfies",
        r#"{#if 1}{@const c = declare satisfies string}{c}{/if}"#,
    ),
    (
        "const_tag",
        "readonly_satisfies",
        r#"{#if 1}{@const c = readonly satisfies string}{c}{/if}"#,
    ),
    (
        "const_tag",
        "accessor_as",
        r#"{#if 1}{@const c = accessor as string}{c}{/if}"#,
    ),
    (
        "const_tag",
        "type_satisfies",
        r#"{#if 1}{@const c = type satisfies string}{c}{/if}"#,
    ),
    (
        "const_tag",
        "plain_satisfies",
        r#"{#if 1}{@const c = value satisfies string}{c}{/if}"#,
    ),
    (
        "const_tag",
        "sequence",
        r#"{#if 1}{@const c = (accessor, declare)}{c}{/if}"#,
    ),
    (
        "const_tag",
        "object_head",
        r#"{#if 1}{@const c = { a: 1 }.a}{c}{/if}"#,
    ),
    (
        "each_header",
        "accessor_satisfies",
        r#"{#each accessor satisfies string as z}{z}{/each}"#,
    ),
    (
        "each_header",
        "declare_satisfies",
        r#"{#each declare satisfies string as z}{z}{/each}"#,
    ),
    (
        "each_header",
        "readonly_satisfies",
        r#"{#each readonly satisfies string as z}{z}{/each}"#,
    ),
    (
        "each_header",
        "accessor_as",
        r#"{#each accessor as string as z}{z}{/each}"#,
    ),
    (
        "each_header",
        "type_satisfies",
        r#"{#each type satisfies string as z}{z}{/each}"#,
    ),
    (
        "each_header",
        "plain_satisfies",
        r#"{#each value satisfies string as z}{z}{/each}"#,
    ),
    (
        "each_header",
        "sequence",
        r#"{#each (accessor, declare) as z}{z}{/each}"#,
    ),
    (
        "each_header",
        "object_head",
        r#"{#each { a: 1 }.a as z}{z}{/each}"#,
    ),
    (
        "key_header",
        "accessor_satisfies",
        r#"{#key accessor satisfies string}k{/key}"#,
    ),
    (
        "key_header",
        "declare_satisfies",
        r#"{#key declare satisfies string}k{/key}"#,
    ),
    (
        "key_header",
        "readonly_satisfies",
        r#"{#key readonly satisfies string}k{/key}"#,
    ),
    (
        "key_header",
        "accessor_as",
        r#"{#key accessor as string}k{/key}"#,
    ),
    (
        "key_header",
        "type_satisfies",
        r#"{#key type satisfies string}k{/key}"#,
    ),
    (
        "key_header",
        "plain_satisfies",
        r#"{#key value satisfies string}k{/key}"#,
    ),
    (
        "key_header",
        "sequence",
        r#"{#key (accessor, declare)}k{/key}"#,
    ),
    ("key_header", "object_head", r#"{#key { a: 1 }.a}k{/key}"#),
    (
        "html_tag",
        "accessor_satisfies",
        r#"{@html accessor satisfies string}"#,
    ),
    (
        "html_tag",
        "declare_satisfies",
        r#"{@html declare satisfies string}"#,
    ),
    (
        "html_tag",
        "readonly_satisfies",
        r#"{@html readonly satisfies string}"#,
    ),
    ("html_tag", "accessor_as", r#"{@html accessor as string}"#),
    (
        "html_tag",
        "type_satisfies",
        r#"{@html type satisfies string}"#,
    ),
    (
        "html_tag",
        "plain_satisfies",
        r#"{@html value satisfies string}"#,
    ),
    ("html_tag", "sequence", r#"{@html (accessor, declare)}"#),
    ("html_tag", "object_head", r#"{@html { a: 1 }.a}"#),
    (
        "render_arg",
        "accessor_satisfies",
        r#"{#snippet t(q)}{q}{/snippet}{@render t(accessor satisfies string)}"#,
    ),
    (
        "render_arg",
        "declare_satisfies",
        r#"{#snippet t(q)}{q}{/snippet}{@render t(declare satisfies string)}"#,
    ),
    (
        "render_arg",
        "readonly_satisfies",
        r#"{#snippet t(q)}{q}{/snippet}{@render t(readonly satisfies string)}"#,
    ),
    (
        "render_arg",
        "accessor_as",
        r#"{#snippet t(q)}{q}{/snippet}{@render t(accessor as string)}"#,
    ),
    (
        "render_arg",
        "type_satisfies",
        r#"{#snippet t(q)}{q}{/snippet}{@render t(type satisfies string)}"#,
    ),
    (
        "render_arg",
        "plain_satisfies",
        r#"{#snippet t(q)}{q}{/snippet}{@render t(value satisfies string)}"#,
    ),
    (
        "render_arg",
        "sequence",
        r#"{#snippet t(q)}{q}{/snippet}{@render t((accessor, declare))}"#,
    ),
    (
        "render_arg",
        "object_head",
        r#"{#snippet t(q)}{q}{/snippet}{@render t({ a: 1 }.a)}"#,
    ),
];

fn fmt(body: &str) -> Result<String, String> {
    format(&format!("{SRC_PRELUDE}{body}\n"), &FormatOptions::default()).map_err(|e| e.to_string())
}

#[test]
fn every_host_keeps_a_modifier_named_head_verbatim() {
    let mut checked = 0;
    for (host, expr, body) in CELLS {
        if !expr.starts_with("accessor_satisfies")
            && !expr.starts_with("declare_satisfies")
            && !expr.starts_with("readonly_satisfies")
        {
            continue;
        }
        assert_eq!(
            fmt(body).as_deref(),
            Ok(format!("{PRELUDE}{body}\n").as_str()),
            "{host} / {expr}"
        );
        checked += 1;
    }
    assert_eq!(checked, 27, "9 hosts x 3 modifier names");
}

#[test]
fn the_shapes_the_paren_wrapper_already_parsed_are_unmoved() {
    let mut checked = 0;
    for (host, expr, body) in CELLS {
        if expr.ends_with("_satisfies") && *expr != "type_satisfies" && *expr != "plain_satisfies" {
            continue;
        }
        assert_eq!(
            fmt(body).as_deref(),
            Ok(format!("{PRELUDE}{body}\n").as_str()),
            "{host} / {expr}"
        );
        checked += 1;
    }
    assert_eq!(checked, CELLS.len() - 27);
}

/// The retry must not re-read a comma as a second declarator. Measured in OXC,
/// `const _rsvelte_x_ = accessor satisfies string, declare;` reports one
/// diagnostic AND parses to two declarators, so both of the retry's conditions
/// reject it; which one fires first is not asserted here.
#[test]
fn a_sequence_under_a_modifier_head_is_still_rejected() {
    assert!(fmt("<p>{accessor satisfies string, declare}</p>").is_err());
    // The same sequence with a head the paren wrapper parses is formatted, and
    // the oracle keeps exactly one pair — so the residue is the modifier name,
    // not the comma.
    assert_eq!(
        fmt("<p>{accessor, declare}</p>").as_deref(),
        Ok(format!("{PRELUDE}<p>{{(accessor, declare)}}</p>\n").as_str())
    );
}

/// A file whose every host carries the shape, formatted end to end, is what the
/// fmt-parity corpus compares — the per-cell tests above would pass with the
/// file-level path still returning the input verbatim.
#[test]
fn the_pattern_corpus_repro_matches_the_oracle() {
    let src = std::fs::read_to_string(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../compatibility/pattern-corpus/issues/wrapper-only-parse-error-in-every-host.svelte"
    ))
    .expect("repro present");
    let out = format(&src, &FormatOptions::default()).expect("formats");
    assert!(out.contains("  let accessor: any;\n"), "script re-indented");
    assert!(out.contains("<p>{accessor satisfies string}</p>\n"));
    assert_eq!(
        format(&out, &FormatOptions::default()).expect("re-formats"),
        out,
        "idempotent"
    );
}
