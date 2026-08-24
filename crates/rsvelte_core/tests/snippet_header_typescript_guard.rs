//! #3453: a `{#snippet}` header's type parameter list is TypeScript syntax, so
//! the scan that reads it is gated on the component being in TypeScript mode —
//! and the `(` that opens the parameter list is required outside loose mode.
//!
//! Expectations were measured against `svelte.compile` from `submodules/svelte`
//! on the same sources.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_err(src: &str) -> Option<(Option<String>, String)> {
    compile(
        src,
        CompileOptions {
            filename: Some("Probe.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .err()
    .map(|e| {
        let d = e.diagnostic();
        (d.code, d.message)
    })
}

/// The two hosts that are NOT in TypeScript mode: no script at all, and a plain
/// `<script>`. Upstream's guard is `parser.ts && parser.match('<')`.
fn non_ts_hosts(header: &str) -> [String; 2] {
    [
        format!("{{#snippet {header}}}x{{/snippet}}\n"),
        format!("<script>let q = 1; void q;</script>\n{{#snippet {header}}}x{{/snippet}}\n"),
    ]
}

const TYPE_PARAM_HEADERS: [&str; 5] = [
    "s<T>(a)",
    "s<T>()",
    "s<T,U>(a)",
    "s<T extends string>(a)",
    "s<T,>(a)",
];

/// Without `lang="ts"` the `<` is not a type parameter opener, so the header has
/// no `(` where one is required. rsvelte used to consume the list and compile.
#[test]
fn a_type_parameter_list_without_lang_ts_is_rejected() {
    for header in TYPE_PARAM_HEADERS {
        for src in non_ts_hosts(header) {
            let (code, message) = compile_err(&src)
                .unwrap_or_else(|| panic!("{header:?} must not compile without lang=\"ts\""));
            assert_eq!(code.as_deref(), Some("expected_token"), "{header:?}");
            assert!(
                message.starts_with("Expected token ("),
                "{header:?} gave {message}"
            );
        }
    }
}

/// The control: the identical header in a TypeScript component compiles, so the
/// guard tracks the mode and not the syntax.
#[test]
fn the_same_header_compiles_with_lang_ts() {
    for header in TYPE_PARAM_HEADERS {
        let src = format!("<script lang=\"ts\"></script>\n{{#snippet {header}}}x{{/snippet}}\n");
        assert_eq!(compile_err(&src), None, "{header:?}");
    }
}

/// Reachable only once the type-parameter scan stops eating `<…>`: upstream's
/// `eat('(', true, false)` requires the opener outside loose mode, and rsvelte
/// treated it as optional — so a header with no parameter list compiled.
#[test]
fn a_header_with_no_parameter_list_is_rejected() {
    for header in ["s", "s ", "s!"] {
        for src in non_ts_hosts(header) {
            let (code, message) =
                compile_err(&src).unwrap_or_else(|| panic!("{header:?} must not compile"));
            assert_eq!(code.as_deref(), Some("expected_token"), "{header:?}");
            assert!(
                message.starts_with("Expected token ("),
                "{header:?} gave {message}"
            );
        }
        // `lang="ts"` does not make a missing parameter list legal either.
        let src = format!("<script lang=\"ts\"></script>\n{{#snippet {header}}}x{{/snippet}}\n");
        assert_eq!(
            compile_err(&src).and_then(|(code, _)| code).as_deref(),
            Some("expected_token"),
            "{header:?} with lang=\"ts\""
        );
    }
}

/// An unterminated type parameter list runs to the end of the input; upstream
/// reads it with `match_bracket`, which reports `unexpected_eof` there.
#[test]
fn an_unterminated_type_parameter_list_is_unexpected_eof() {
    let src = "<script lang=\"ts\"></script>\n{#snippet s<}x{/snippet}\n";
    let (code, message) = compile_err(src).expect("must not compile");
    assert_eq!(code.as_deref(), Some("unexpected_eof"), "{message}");
    assert!(message.starts_with("Unexpected end of input"), "{message}");
}

/// Negative controls: headers with no TypeScript in them compile in every host,
/// including the two non-TypeScript ones.
#[test]
fn plain_headers_are_unaffected() {
    for header in ["s(a)", "s (a)", "s(a = 1)", "s({ a })", "s()"] {
        for src in non_ts_hosts(header) {
            assert_eq!(compile_err(&src), None, "{header:?}");
        }
    }
}
