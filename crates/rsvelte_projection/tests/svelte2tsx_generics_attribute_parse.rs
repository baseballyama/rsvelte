//! #3252 / #3253: the `generics="…"` attribute is a type parameter list, and
//! upstream reads it back off a TypeScript parse of `` `<${raw}>() => {}` ``.
//!
//! Expectations were measured against the official `svelte2tsx` from
//! `submodules/language-tools` on the same sources.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn convert(generics: &str) -> String {
    let src = format!(
        "<script lang=\"ts\" generics=\"{generics}\">\n\tlet x: T = null as any; void x;\n</script>\n"
    );
    let opts = Svelte2TsxOptions {
        filename: "Probe.svelte".to_string(),
        ..Default::default()
    };
    svelte2tsx(&src, opts).expect("svelte2tsx ok").code
}

/// A comma at the top level of any bracket kind other than `<…>` used to split
/// the parameter, and the fragments were emitted as *type arguments* — `<T,b:>`
/// is not a type argument list, so the whole file stopped parsing as TSX.
#[test]
fn a_comma_inside_another_bracket_kind_does_not_split_the_parameter() {
    for (generics, definition) in [
        (
            "T extends { a: string, b: number }",
            "T extends { a: string, b: number }",
        ),
        ("T extends [a, b]", "T extends [a, b]"),
        ("T extends [a: 1, b: 2]", "T extends [a: 1, b: 2]"),
        (
            "T extends (a: 1, b: 2) => void",
            "T extends (a: 1, b: 2) => void",
        ),
        ("T = { a: 1, b: 2 }", "T = { a: 1, b: 2 }"),
        ("T extends 'a,b'", "T extends 'a,b'"),
    ] {
        let code = convert(generics);
        assert!(
            code.contains(&format!("class __sveltets_Render<{definition}> {{")),
            "definition must survive verbatim for {generics:?}:\n{code}"
        );
        assert!(
            code.contains("return $$render<T>().props;"),
            "the reference list is the parameter NAMES for {generics:?}:\n{code}"
        );
    }
}

/// Several parameters still join with a bare `,` and each definition keeps the
/// source spelling from its own `getText()` — no leading whitespace.
#[test]
fn multiple_parameters_join_on_the_parameter_boundary() {
    let code = convert("T extends A, U extends B");
    assert!(
        code.contains("class __sveltets_Render<T extends A,U extends B> {"),
        "{code}"
    );
    assert!(code.contains("return $$render<T,U>().props;"), "{code}");
}

/// #3253: upstream answers "does this component have generics?" from
/// `Generics.has()` — the attribute must PARSE as a type parameter list. An
/// attribute that does not is written onto `$$render` verbatim while the
/// component export stays non-generic.
#[test]
fn an_unparseable_attribute_keeps_the_non_generic_component_export() {
    for generics in [
        "T extends string ? 1 : 2",
        ",T",
        "in T",
        "in out T",
        "extends string",
        "1",
        " ",
    ] {
        let code = convert(generics);
        assert!(
            code.contains(
                "__sveltets_2_isomorphic_component(__sveltets_2_partial(__sveltets_2_with_any_event($$render())))"
            ),
            "{generics:?} must not make the export generic:\n{code}"
        );
        assert!(
            !code.contains("class __sveltets_Render<"),
            "{generics:?} must not emit the generic render class:\n{code}"
        );
    }
}

/// The raw attribute still reaches `function $$render<…>` even when it does not
/// parse — upstream keys that on `genericsAttr`, not on `has()`.
#[test]
fn the_raw_attribute_still_reaches_the_render_header() {
    let code = convert("T extends string ? 1 : 2");
    assert!(
        code.contains(
            ";function $$render</*\u{03A9}ignore_start\u{03A9}*/T extends string ? 1 : 2>/*\u{03A9}ignore_end\u{03A9}*/() {"
        ),
        "{code}"
    );
}

/// A `const` modifier and a trailing comma are part of the parse, not of a
/// hand-written splitter.
#[test]
fn modifiers_and_a_trailing_comma_are_read_from_the_parse() {
    let code = convert("const T extends string");
    assert!(
        code.contains("class __sveltets_Render<const T extends string> {"),
        "{code}"
    );
    assert!(code.contains("return $$render<T>().props;"), "{code}");

    let code = convert("T,");
    assert!(code.contains("class __sveltets_Render<T> {"), "{code}");
}
