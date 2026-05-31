//! JS-lexical-aware scanning in the parser (issue #445, H-001/H-018/H-019):
//! directive expressions, the `{#each}` ` as ` split, and the `{#each}` key
//! expression must ignore braces / parens / ` as ` that appear inside string
//! literals, template literals, and comments.

use svelte_compiler_rust::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> Result<String, String> {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .map_err(|e| format!("{e:?}"))
}

/// H-001: a `}` inside a string in a directive expression must not terminate
/// the directive early (`scan_to_closing_brace` is now JS-lexical-aware).
#[test]
fn on_directive_brace_in_string_literal() {
    let out = client(r#"<button on:click={() => go("}")}>x</button>"#);
    assert!(out.is_ok(), "{out:?}");
    assert!(
        out.unwrap().contains(r#"go("}")"#),
        "handler truncated at brace"
    );
}

/// H-001: same for the shorthand `onclick={...}` attribute path.
#[test]
fn onclick_attr_brace_in_string_literal() {
    let out = client(r#"<button onclick={() => go("}")}>x</button>"#);
    assert!(out.is_ok(), "{out:?}");
    assert!(
        out.unwrap().contains(r#"go("}")"#),
        "handler truncated at brace"
    );
}

/// H-018: a ` as ` inside a comment after the real alias separator must not be
/// mistaken for the separator (the header scan now skips strings/comments).
#[test]
fn each_as_split_ignores_comment() {
    let out = client(r#"{#each items as item /* x as y */}{item}{/each}"#);
    assert!(
        out.is_ok(),
        "each header mis-split on comment ` as `: {out:?}"
    );
    assert!(out.unwrap().contains("item"), "each alias lost");
}

/// H-019: a `)` inside a string in the `{#each}` key expression must not close
/// the key early (the key scan now uses the JS-aware bracket matcher).
#[test]
fn each_key_paren_in_string_literal() {
    let out = client(r#"{#each items as item (item.name + ")")}{item}{/each}"#);
    assert!(
        out.is_ok(),
        "each key truncated at `)` inside string: {out:?}"
    );
}
