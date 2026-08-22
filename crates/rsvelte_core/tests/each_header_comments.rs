//! #3057: upstream allows only WHITESPACE between an `{#each}` item pattern
//! (or index) and the next delimiter — a comment there is a parse error, and
//! rsvelte used to accept every form official rejects.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn code_of(src: &str) -> Option<String> {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .err()
    .and_then(|e| e.diagnostic().code)
}

#[test]
fn comment_after_pattern_is_rejected() {
    assert_eq!(
        code_of("{#each [1] as x /* c */}<i>{x}</i>{/each}").as_deref(),
        Some("expected_token")
    );
    assert_eq!(
        code_of("{#each [1] as x // c\n}<i>{x}</i>{/each}").as_deref(),
        Some("expected_token")
    );
}

#[test]
fn comment_before_pattern_is_rejected() {
    assert_eq!(
        code_of("{#each [1] as /* c */ x}<i>{x}</i>{/each}").as_deref(),
        Some("expected_pattern")
    );
}

#[test]
fn comment_around_index_is_rejected() {
    assert_eq!(
        code_of("{#each [1] as x, i /* c */}<i>{x}{i}</i>{/each}").as_deref(),
        Some("expected_token")
    );
    assert_eq!(
        code_of("{#each [1] as x, /* c */ i}<i>{x}{i}</i>{/each}").as_deref(),
        Some("expected_identifier")
    );
}

#[test]
fn comment_after_key_is_rejected() {
    assert_eq!(
        code_of("{#each [1] as x (x) /* c */}<i>{x}</i>{/each}").as_deref(),
        Some("expected_token")
    );
}

#[test]
fn legal_forms_still_parse() {
    // Comments INSIDE the pattern and in the iterable expression are legal,
    // as are newline-split headers and defaults holding nested templates.
    assert_eq!(
        code_of("{#each [{a:1}] as { a /* c */ }}<i>{a}</i>{/each}"),
        None
    );
    assert_eq!(code_of("{#each [1] /* c */ as x}<i>{x}</i>{/each}"), None);
    assert_eq!(
        code_of("{#each [1]\n as \n x \n, \n i \n (x)\n}<i>{x}</i>{/each}"),
        None
    );
    assert_eq!(code_of("{#each x as { y = `${`\"`}` }}{/each}"), None);
}
