//! Template binding-name validation (#3728).
//!
//! Every template binding host is parsed in module/strict mode upstream. A
//! bare reserved word is rejected by `read_identifier`; inside destructuring,
//! acorn reports the binding identifier as an assignment-pattern violation.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn diagnose(src: &str) -> Result<(), (String, String, (u32, u32))> {
    match compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    ) {
        Ok(_) => Ok(()),
        Err(error) => {
            let diagnostic = error.diagnostic();
            Err((
                diagnostic.code.unwrap_or_default(),
                diagnostic
                    .message
                    .split('\n')
                    .next()
                    .unwrap_or_default()
                    .to_string(),
                diagnostic.span.unwrap_or((u32::MAX, u32::MAX)),
            ))
        }
    }
}

#[test]
fn bare_reserved_names_are_rejected_in_every_template_binding_host() {
    for name in ["arguments", "eval"] {
        let sources = [
            format!("{{@const {name} = 1}}"),
            format!("{{#each [1] as {name}}}x{{/each}}"),
            format!("{{#each [1] as value, {name}}}x{{/each}}"),
            format!("{{#await promise then {name}}}x{{/await}}"),
            format!("{{#await promise catch {name}}}x{{/await}}"),
        ];

        for src in sources {
            let expected_at = src.find(name).unwrap() as u32;
            let expected_message =
                format!("'{name}' is a reserved word in JavaScript and cannot be used here");
            assert_eq!(
                diagnose(&src),
                Err((
                    "unexpected_reserved_word".to_string(),
                    expected_message,
                    (expected_at, expected_at),
                )),
                "wrong diagnostic for {src:?}"
            );
        }
    }
}

#[test]
fn destructured_strict_names_are_rejected_in_every_pattern_host() {
    for name in ["arguments", "eval"] {
        for pattern in [
            format!("{{ {name} }}"),
            format!("[{name}]"),
            format!("{{ key: {name} }}"),
        ] {
            let sources = [
                format!("{{@const {pattern} = value}}"),
                format!("{{#each values as {pattern}}}x{{/each}}"),
                format!("{{#await promise then {pattern}}}x{{/await}}"),
                format!("{{#await promise catch {pattern}}}x{{/await}}"),
            ];

            for src in sources {
                let expected_at = src.find(name).unwrap() as u32;
                assert_eq!(
                    diagnose(&src),
                    Err((
                        "js_parse_error".to_string(),
                        format!("Assigning to {name} in strict mode"),
                        (expected_at, expected_at),
                    )),
                    "wrong diagnostic for {src:?}"
                );
            }
        }
    }
}

#[test]
fn property_keys_and_ordinary_bindings_remain_legal() {
    for src in [
        "{#if true}{@const { arguments: value } = { arguments: 1 }}{value}{/if}",
        "{#each [{ eval: 1 }] as { eval: value }}{value}{/each}",
        "{#await promise then { arguments: value }}{value}{/await}",
        "{#each [1] as value, index}{value}{index}{/each}",
    ] {
        if let Err(error) = diagnose(src) {
            panic!("{src:?} was rejected: {error:?}");
        }
    }
}
