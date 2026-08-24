//! A template literal's cooked value normalises `<CR><LF>` and a lone `<CR>` to
//! `<LF>` (ECMA-262 TV). The SSR constant fold harvests the literal from raw
//! source text, so it kept the `<CR>` and the rendered HTML lost the line break
//! the client render has (issue #3282).
//!
//! Every expectation here is the official compiler's byte-for-byte output for
//! the same input, recorded from `compile(src, { generate, dev })`.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn build(src: &str, generate: GenerateMode, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("A.svelte".into()),
            generate,
            dev,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

#[test]
fn lone_cr_folds_to_lf_on_the_server() {
    let out = build(
        "<script>\n\tconst s = `a\rb`;\n</script>\n<p>{s}</p>\n",
        GenerateMode::Server,
        false,
    );
    assert_eq!(
        out,
        "import * as $ from 'svelte/internal/server';\n\nexport default function A($$renderer) {\n\tconst s = `a\nb`;\n\n\t$$renderer.push(`<p>a\nb</p>`);\n}"
    );
}

#[test]
fn every_lone_cr_folds_to_lf() {
    let out = build(
        "<script>\n\tconst s = `a\rb\rc`;\n</script>\n<p>{s}</p>\n",
        GenerateMode::Server,
        false,
    );
    assert_eq!(
        out,
        "import * as $ from 'svelte/internal/server';\n\nexport default function A($$renderer) {\n\tconst s = `a\nb\nc`;\n\n\t$$renderer.push(`<p>a\nb\nc</p>`);\n}"
    );
}

/// The same normalisation applies to a `let` binding and to a `<script module>`
/// declaration, which reach the fold through their own harvesting passes.
#[test]
fn let_and_module_declarations_normalise_too() {
    assert_eq!(
        build(
            "<script>\n\tlet s = `a\rb`;\n</script>\n<p>{s}</p>\n",
            GenerateMode::Server,
            false,
        ),
        "import * as $ from 'svelte/internal/server';\n\nexport default function A($$renderer) {\n\tlet s = `a\nb`;\n\n\t$$renderer.push(`<p>a\nb</p>`);\n}"
    );
    assert_eq!(
        build(
            "<script module>\n\tconst s = `a\rb`;\n</script>\n<p>{s}</p>\n",
            GenerateMode::Server,
            false,
        ),
        "import * as $ from 'svelte/internal/server';\n\nconst s = `a\nb`;\n\nexport default function A($$renderer) {\n\t$$renderer.push(`<p>a\nb</p>`);\n}"
    );
}

/// A `<CR>` at either end of the body, and a body that is nothing but one.
#[test]
fn cr_at_the_edges_of_the_body() {
    for (body, rendered) in [("`\r`", "\n"), ("`ab\r`", "ab\n"), ("`\rab`", "\nab")] {
        let out = build(
            &format!("<script>\n\tconst s = {body};\n</script>\n<p>{{s}}</p>\n"),
            GenerateMode::Server,
            false,
        );
        assert!(
            out.contains(&format!("$$renderer.push(`<p>{rendered}</p>`)")),
            "{body} folded wrong:\n{out}"
        );
        assert!(!out.contains('\r'), "{body} kept a CR:\n{out}");
    }
}

/// The client is the other port of the same fold and was already correct; the
/// server fix must not move it.
#[test]
fn the_client_port_is_unchanged() {
    let src = "<script>\n\tconst s = `a\rb`;\n</script>\n<p>{s}</p>\n";
    assert_eq!(
        build(src, GenerateMode::Client, false),
        "import 'svelte/internal/disclose-version';\nimport 'svelte/internal/flags/legacy';\nimport * as $ from 'svelte/internal/client';\n\nvar root = $.from_html(`<p></p>`);\n\nexport default function A($$anchor) {\n\tconst s = `a\nb`;\n\n\tvar p = root();\n\n\tp.textContent = 'a\\nb';\n\t$.append($$anchor, p);\n}"
    );
}

/// A `\r` ESCAPE is a real carriage return in the value and must survive; only a
/// RAW line terminator is normalised.
#[test]
fn a_backslash_r_escape_is_not_a_line_terminator() {
    let out = build(
        "<script>\n\tconst s = `a\\rb`;\n</script>\n<p>{s}</p>\n",
        GenerateMode::Server,
        false,
    );
    assert!(out.contains("$$renderer.push(`<p>a\rb</p>`)"), "{out}");
}
