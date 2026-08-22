//! A `bigint` key in a `$props()` destructure. Upstream keys the prop by
//! `String(key.value)` and passes `b.literal(key.value)` on, so `0x10n`
//! declares the prop `16` — the source spelling never reaches the output.
//!
//! rsvelte rejected the whole pattern with `props_invalid_pattern`, a message
//! that names neither a nested property nor a computed key: `LiteralValue::BigInt`
//! fell into the `_ => None` arm of the alias match, and the `ok_or_else` turned
//! "a key spelling this port does not model" into "the user wrote an invalid
//! pattern". That is an over-rejection — nothing downstream (svelte2tsx, the
//! language server, `rsvelte-lint`) could process the file either.
//!
//! The `$.prop(...)` key is asserted quote-agnostically on purpose: whether a
//! numeric key is passed as a number or as a string is a separate divergence
//! (#3229), and pinning the quoting here would make this test fail on the fix
//! for that one.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_target(src: &str, generate: GenerateMode, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            generate,
            dev,
            filename: Some("A.svelte".to_string()),
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

const TARGETS: [(&str, GenerateMode, bool); 3] = [
    ("client", GenerateMode::Client, false),
    ("client-dev", GenerateMode::Client, true),
    ("server", GenerateMode::Server, false),
];

fn read_only(key: &str) -> String {
    format!("<script>\n\tlet {{ {key}: a }} = $props();\n</script>\n{{a}}\n")
}

fn mutated(key: &str) -> String {
    format!(
        "<script>\n\tlet {{ {key}: a }} = $props();\n\tfunction go() {{ a = 1; }}\n</script>\n<button onclick={{go}}>{{a}}</button>\n"
    )
}

fn with_rest(key: &str) -> String {
    format!("<script>\n\tlet {{ {key}: a, ...rest }} = $props();\n</script>\n{{a}}{{rest}}\n")
}

/// The reported defect: every bigint spelling, every use, every target used to
/// raise `props_invalid_pattern`.
#[test]
fn a_bigint_key_is_accepted() {
    for key in ["2n", "0x10n", "0o7n", "1_000n", "0n", "9007199254740993n"] {
        for make in [read_only, mutated, with_rest] {
            let src = make(key);
            for (target, generate, dev) in TARGETS {
                compile(
                    &src,
                    CompileOptions {
                        generate,
                        dev,
                        filename: Some("A.svelte".to_string()),
                        ..Default::default()
                    },
                )
                .unwrap_or_else(|e| panic!("{key} / {target} rejected: {e:?}\n{src}"));
            }
        }
    }
}

/// Upstream's key is the bigint's VALUE, so the spelling never survives into
/// the client output. Checked on the read path (`$$props['16']`) and on the
/// `$.prop` / `rest_excludes` paths, quote-agnostically for the latter two:
/// whether a numeric key is passed as a number or as a string is a separate
/// divergence (#3229), and pinning it here would fail on that fix.
#[test]
fn the_client_key_carries_the_value_not_the_spelling() {
    for (key, digits) in [
        ("2n", "2"),
        ("0x10n", "16"),
        ("0o7n", "7"),
        ("1_000n", "1000"),
        ("0n", "0"),
        // Beyond f64's exact integer range: the digits must survive verbatim.
        ("9007199254740993n", "9007199254740993"),
    ] {
        for (target, generate, dev) in TARGETS {
            if generate != GenerateMode::Client {
                continue;
            }
            let read = compile_target(&read_only(key), generate, dev);
            assert!(
                read.contains(&format!("$$props['{digits}']")),
                "{key} / {target}: read path does not use $$props['{digits}']:\n{read}"
            );

            let mutate = compile_target(&mutated(key), generate, dev);
            assert!(
                mutate.contains(&format!("$.prop($$props, {digits},"))
                    || mutate.contains(&format!("$.prop($$props, '{digits}',")),
                "{key} / {target}: $.prop key is not {digits}:\n{mutate}"
            );

            let rest = compile_target(&with_rest(key), generate, dev);
            assert!(
                rest.contains(&format!("'$$legacy', {digits}]"))
                    || rest.contains(&format!("'$$legacy', '{digits}']")),
                "{key} / {target}: rest exclusion is not {digits}:\n{rest}"
            );

            for out in [&read, &mutate, &rest] {
                assert!(
                    !out.contains(key),
                    "{key} / {target}: the source spelling reached the output:\n{out}"
                );
            }
        }
    }
}

/// The server keeps the destructuring pattern verbatim, which is what upstream
/// emits too — so the key spelling is expected there and its absence would be
/// the regression.
#[test]
fn the_server_keeps_the_pattern_verbatim() {
    for key in ["2n", "0x10n", "9007199254740993n"] {
        for make in [read_only, mutated, with_rest] {
            let out = compile_target(&make(key), GenerateMode::Server, false);
            assert!(
                out.contains(&format!("{key}: a")),
                "{key}: the server pattern lost the key:\n{out}"
            );
        }
    }
}

/// Controls. A **string** key that happens to spell a bigint keeps its own
/// text, and an identifier key ending in `n` is untouched — both would break if
/// the bigint detection matched on the trailing `n` alone.
#[test]
fn a_string_key_and_an_identifier_key_are_unaffected() {
    for (key, expected) in [
        ("'2n'", "2n"),
        ("fn", "fn"),
        ("'0x10n'", "0x10n"),
        ("n", "n"),
    ] {
        for (target, generate, dev) in TARGETS {
            if generate != GenerateMode::Client {
                continue;
            }
            let out = compile_target(&read_only(key), generate, dev);
            // An identifier key reads through dot access, a string key through
            // brackets; either way the key text must be the source's.
            assert!(
                out.contains(&format!("$$props['{expected}']"))
                    || out.contains(&format!("$$props.{expected}")),
                "{key} / {target}: expected the key {expected} to survive:\n{out}"
            );
        }
    }
}
