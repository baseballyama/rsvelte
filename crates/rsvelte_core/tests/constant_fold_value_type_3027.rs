//! A folded constant is a JS value, not the text it renders to (issue #3027).
//! The client fold used to carry one as `Option<Option<String>>`, in which
//! `null` and `undefined` are the same value and `0` and `'0'` are the same
//! value — so a `$derived` ternary over two different nullish literals was
//! judged constant and its read hoisted out of `$.template_effect`, and a dozen
//! sibling folds printed the wrong text. Every expectation here is the official
//! compiler's output for the same source.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("must compile")
    .js
    .code
}

fn derived_attribute(expression: &str) -> String {
    client(&format!(
        "<script>\n\tconst {{ n }} = $props();\n\tconst c = $derived({expression});\n</script>\n\n<div title={{c}}></div>\n"
    ))
}

fn folded_text(declaration: &str, expression: &str) -> String {
    client(&format!(
        "<script>\n\t{declaration}\n</script>\n\n<p>{{{expression}}}</p>\n"
    ))
}

#[test]
fn a_ternary_over_two_different_nullish_literals_stays_reactive() {
    for expression in [
        "n > 3 ? undefined : null",
        "n > 3 ? null : undefined",
        "n > 3 ? 0 : '0'",
        "n > 3 ? true : 'true'",
    ] {
        assert!(
            derived_attribute(expression).contains("template_effect"),
            "`{expression}` has two distinct values, so the read must stay reactive"
        );
    }
}

#[test]
fn a_ternary_over_one_repeated_value_is_constant() {
    for expression in [
        "n > 3 ? undefined : undefined",
        "n > 3 ? null : null",
        "n > 3 ? 1 : 1",
    ] {
        assert!(
            !derived_attribute(expression).contains("template_effect"),
            "`{expression}` has one value, so the read must not be reactive"
        );
    }
}

#[test]
fn a_fold_keeps_the_operands_type() {
    for (declaration, expression, expected) in [
        ("const x = '0';", "typeof x", "'string'"),
        ("const x = 'true';", "typeof x", "'string'"),
        ("const x = null;", "typeof x", "'object'"),
        ("const a = '1'; const b = 1;", "a + b", "'11'"),
        ("const a = '1'; const b = 1;", "a === b", "'false'"),
        ("const a = '1'; const b = 1;", "a !== b", "'true'"),
        ("const a = '10'; const b = '9';", "a < b", "'true'"),
        ("const a = true; const b = 1;", "a + b", "'2'"),
        ("const a = null;", "a + ''", "'null'"),
        ("const a = undefined;", "a + ''", "'undefined'"),
        ("const a = 0x10;", "a", "'16'"),
        ("", "1 || 2", "'1'"),
        ("", "'' || 'x'", "'x'"),
        ("", "0 && 2", "'0'"),
    ] {
        let code = folded_text(declaration, expression);
        assert!(
            code.contains(&format!("textContent = {expected}")),
            "`{declaration} {expression}` should fold to {expected}, got:\n{code}"
        );
    }
}
