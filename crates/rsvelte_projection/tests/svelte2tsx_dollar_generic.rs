//! #3254: the legacy `$$Generic` type alias — its three upstream errors, and
//! the `export`ed declaration form the matcher did not see.
//!
//! Expectations were measured against the official `svelte2tsx` from
//! `submodules/language-tools` on the same sources.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn convert(src: &str) -> Result<String, String> {
    let opts = Svelte2TsxOptions {
        filename: "Probe.svelte".to_string(),
        ..Default::default()
    };
    svelte2tsx(src, opts)
        .map(|result| result.code)
        .map_err(|error| error.to_string())
}

fn instance(decl: &str) -> String {
    format!("<script lang=\"ts\">\n\t{decl}\n\tlet x: T = null as any; void x;\n</script>\n")
}

/// `throwIfIsGeneric`, called on every module-script node.
#[test]
fn a_dollar_generic_in_the_module_script_is_rejected() {
    for decl in [
        "type T = $$Generic;",
        "type T = $$Generic<string>;",
        "export type T = $$Generic;",
        "type $$Generic = 1; type T = $$Generic;",
    ] {
        let error = convert(&format!(
            "<script module lang=\"ts\">\n\t{decl}\n</script>\n"
        ))
        .expect_err("must be rejected");
        assert!(
            error.contains("$$Generic declarations are only allowed in the instance script"),
            "{decl:?} gave {error}"
        );
    }
}

/// The first `throw` in `addIfIsGeneric`, and it is checked BEFORE the type
/// argument count — so it wins even for a two-argument declaration.
#[test]
fn a_dollar_generic_next_to_the_generics_attribute_is_rejected() {
    for decl in [
        "type T = $$Generic;",
        "type T = $$Generic<string>;",
        "type T = $$Generic<string, number>;",
        "export type T = $$Generic;",
    ] {
        let src = format!(
            "<script lang=\"ts\" generics=\"U\">\n\t{decl}\n\tlet x: T = null as any; void x;\n</script>\n"
        );
        let error = convert(&src).expect_err("must be rejected");
        assert!(
            error.contains(
                "Invalid $$Generic declaration: $$Generic definitions are not allowed when the generics attribute is present on the script tag"
            ),
            "{decl:?} gave {error}"
        );
    }
}

/// The second `throw` in `addIfIsGeneric`.
#[test]
fn a_dollar_generic_with_two_type_arguments_is_rejected() {
    let error = convert(&instance("type T = $$Generic<string, number>;")).expect_err("rejected");
    assert!(
        error.contains("Invalid $$Generic declaration: Only one type argument allowed"),
        "{error}"
    );
}

/// Upstream models `export type T = …` as one `TypeAliasDeclaration` carrying
/// an `export` modifier, so `addIfIsGeneric` reaches it: the alias is removed
/// and `T` becomes a `$$render` type parameter. rsvelte matched the un-exported
/// form only, so the alias survived into the render body as invalid TSX.
#[test]
fn an_exported_dollar_generic_becomes_a_type_parameter() {
    let code = convert(&instance("export type T = $$Generic;")).expect("svelte2tsx ok");
    assert!(
        code.contains(
            ";function $$render/*\u{03A9}ignore_start\u{03A9}*/<T>/*\u{03A9}ignore_end\u{03A9}*/() {"
        ),
        "{code}"
    );
    assert!(
        !code.contains("$$Generic"),
        "the alias must be blanked, `export` keyword included:\n{code}"
    );

    let code = convert(&instance("export type T = $$Generic<string>;")).expect("svelte2tsx ok");
    assert!(
        code.contains(
            ";function $$render/*\u{03A9}ignore_start\u{03A9}*/<T extends string>/*\u{03A9}ignore_end\u{03A9}*/() {"
        ),
        "{code}"
    );
}

/// The detection is structural, so whitespace inside the type argument list no
/// longer decides whether the declaration is recognised.
#[test]
fn whitespace_around_the_type_argument_does_not_hide_the_declaration() {
    let code = convert(&instance("type T = $$Generic < string >;")).expect("svelte2tsx ok");
    assert!(
        code.contains(
            ";function $$render/*\u{03A9}ignore_start\u{03A9}*/<T extends string>/*\u{03A9}ignore_end\u{03A9}*/() {"
        ),
        "{code}"
    );
}

/// A shadowing `type $$Generic = 1` is still matched by name — upstream reads
/// the type reference and never resolves it.
#[test]
fn a_shadowed_alias_is_still_matched_by_name() {
    let code =
        convert(&instance("type $$Generic = 1; type T = $$Generic;")).expect("svelte2tsx ok");
    assert!(
        code.contains(
            ";function $$render/*\u{03A9}ignore_start\u{03A9}*/<T>/*\u{03A9}ignore_end\u{03A9}*/() {"
        ),
        "{code}"
    );
    assert!(code.contains("type $$Generic = 1;"), "{code}");
}
