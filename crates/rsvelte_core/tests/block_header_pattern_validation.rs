//! `{#each}` / `{#await}` header validation (#3245, #3283, #3286).
//!
//! Upstream reads ONE binding pattern (`1-parse/read/context.js`) for the each
//! item and the await value, and ONE identifier for the each index. rsvelte
//! scanned to the next delimiter instead, so a literal item was spliced into the
//! generated arrow's parameter list (`($$anchor, 1) =>`, which no JS parser
//! accepts) and a non-identifier index was silently dropped. The legal
//! neighbours are asserted alongside, because a check that rejects a member
//! expression must still accept every destructuring form.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn diagnose(src: &str) -> Result<String, (String, String, (u32, u32))> {
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
        Ok(result) => Ok(result.js.code),
        Err(e) => {
            let d = e.diagnostic();
            Err((
                d.code.unwrap_or_default(),
                d.message.split('\n').next().unwrap_or_default().to_string(),
                d.span.unwrap_or((u32::MAX, u32::MAX)),
            ))
        }
    }
}

/// `(source, code, start)`. Every span upstream raises from a block header is a
/// point, so `end` is asserted to equal `start`.
const REJECTED: &[(&str, &str, u32)] = &[
    // {#each} item pattern
    ("{#each arr as 1}<b>x</b>{/each}", "expected_pattern", 14),
    (
        "{#each arr as \"a\"}<b>x</b>{/each}",
        "expected_pattern",
        14,
    ),
    ("{#each arr as ...r}{r}{/each}", "expected_pattern", 14),
    ("{#each arr as , i}{i}{/each}", "expected_pattern", 14),
    ("{#each arr as }x{/each}", "expected_pattern", 14),
    ("{#each arr as /*c*/ v}{v}{/each}", "expected_pattern", 14),
    (
        "{#each arr as , i (i = 1)}{i}{/each}",
        "expected_pattern",
        14,
    ),
    ("{#each arr as o.k}<b>x</b>{/each}", "expected_token", 15),
    ("{#each arr as v = 1}{v}{/each}", "expected_token", 16),
    ("{#each arr as v /*c*/}{v}{/each}", "expected_token", 16),
    ("{#each arr as {a} b}{a}{/each}", "expected_token", 18),
    // {#each} index
    (
        "{#each arr as v, 1}<b>{v}</b>{/each}",
        "expected_identifier",
        17,
    ),
    (
        "{#each arr as v, \"i\"}<b>{v}</b>{/each}",
        "expected_identifier",
        17,
    ),
    ("{#each arr as v, [i]}{v}{/each}", "expected_identifier", 17),
    (
        "{#each arr as v, /*c*/ i}{i}{/each}",
        "expected_identifier",
        17,
    ),
    ("{#each arr as v,}{v}{/each}", "expected_identifier", 16),
    (
        "{#each arr as v, o.k}<b>{v}</b>{/each}",
        "expected_token",
        18,
    ),
    ("{#each arr as v, i = 0}{i}{/each}", "expected_token", 19),
    ("{#each arr as v, i, j}{i}{/each}", "expected_token", 18),
    ("{#each arr as v, i /*c*/}{i}{/each}", "expected_token", 19),
    ("{#each arr as v, i (k) x}{i}{/each}", "expected_token", 23),
    // {#each} header framing
    ("{#each arr as}x{/each}", "expected_whitespace", 13),
    ("{#each  as v}{v}{/each}", "expected_token", 11),
    // {#await} clause patterns
    ("{#await p then ...r}{r}{/await}", "expected_pattern", 15),
    ("{#await p catch ...r}{r}{/await}", "expected_pattern", 16),
    ("{#await p}w{:then ...r}{r}{/await}", "expected_pattern", 18),
    ("{#await p}w{:then 1}{r}{/await}", "expected_pattern", 18),
    (
        "{#await p}w{:catch ...r}{r}{/await}",
        "expected_pattern",
        19,
    ),
    // `{:then }` has no `\s*}` escape — only the opening tag does.
    ("{#await p}w{:then }d{/await}", "expected_pattern", 18),
    ("{#await p}w{:catch }d{/await}", "expected_pattern", 19),
    ("{#await p then v = 1}{v}{/await}", "expected_token", 17),
    ("{#await p then a.b}{a}{/await}", "expected_token", 16),
    ("{#await p}w{:then v = 1}{v}{/await}", "expected_token", 20),
    ("{#await p}w{:then a.b}{a}{/await}", "expected_token", 19),
    ("{#await p}w{:catch e = 1}{e}{/await}", "expected_token", 21),
    // {#await} clause bookkeeping
    (
        "{#await p}w{:then v}{v}{:then u}{u}{/await}",
        "block_duplicate_clause",
        24,
    ),
    (
        "{#await p}w{:catch e}{e}{:catch f}{f}{/await}",
        "block_duplicate_clause",
        25,
    ),
    (
        "{#await p then v}{v}{:then u}{u}{/await}",
        "block_duplicate_clause",
        21,
    ),
    (
        "{#await p catch e}{e}{:catch f}{f}{/await}",
        "block_duplicate_clause",
        22,
    ),
    ("{#await p}w{:else}z{/await}", "expected_token", 12),
];

/// Headers both compilers reject as JavaScript, where the message and position
/// are upstream's acorn wording rather than the `(…)` probe's own complaint.
const JS_PARSE_ERRORS: &[(&str, u32)] = &[
    ("{#await }w{/await}", 8),
    ("{#await  }w{/await}", 9),
    ("{#key }v{/key}", 6),
    ("{#key ...x}v{/key}", 6),
    ("{#each arr as v ()}{v}{/each}", 17),
    ("{#each arr as v, i ()}{i}{/each}", 20),
];

/// Neighbours of every rejected shape that stay legal — an over-rejection here
/// costs real components, which the invalid rows alone cannot see.
const ACCEPTED: &[&str] = &[
    "{#each arr as { a, b }}{a}{/each}",
    "{#each arr as [a, b]}{a}{/each}",
    "{#each arr as { a = 1 }}{a}{/each}",
    "{#each arr as { a: { b } }}{b}{/each}",
    "{#each arr as { a, ...rest }}{a}{/each}",
    "{#each arr as [, b]}{b}{/each}",
    "{#each arr as [a, ...r]}{a}{/each}",
    "{#each arr as v }{v}{/each}",
    "{#each arr as {a} }{a}{/each}",
    "{#each arr as v , i }{i}{/each}",
    "{#each arr as [a] , i }{i}{/each}",
    "{#each arr as v, i (i)}{i}{/each}",
    "{#each arr as v (k) }{v}{/each}",
    "{#each arr as item (item.id)}{item}{/each}",
    "{#each arr as { a /*c*/ }}{a}{/each}",
    "{#each arr /*c*/ as x}{x}{/each}",
    "{#each arr\n as \n x \n, \n i \n (x)\n}{x}{/each}",
    "{#each arr as const as item}{item}{/each}",
    "{#await p then v}{v}{/await}",
    "{#await p then [a]}{a}{/await}",
    "{#await p then }w{/await}",
    "{#await p catch }w{/await}",
    "{#await p}w{:then { a }}{a}{/await}",
    "{#await p}w{:catch { message }}{message}{/await}",
    "{#await p}w{:then}done{/await}",
    "{#await p}w{:catch}bad{/await}",
    "{#await p}w{:catch e}{e}{:then v}{v}{/await}",
    "{#await p then v}{v}{:catch e}{e}{/await}",
];

#[test]
fn illegal_block_headers_are_rejected_with_upstream_fields() {
    for &(src, code, start) in REJECTED {
        match diagnose(src) {
            Ok(_) => panic!("{src:?} compiled; expected `{code}`"),
            Err((actual_code, _, span)) => {
                assert_eq!(actual_code, code, "wrong code for {src:?}");
                assert_eq!(span, (start, start), "wrong span for {src:?}");
            }
        }
    }
}

#[test]
fn empty_and_spread_headers_report_acorns_wording() {
    for &(src, start) in JS_PARSE_ERRORS {
        match diagnose(src) {
            Ok(_) => panic!("{src:?} compiled; expected `js_parse_error`"),
            Err((code, message, span)) => {
                assert_eq!(code, "js_parse_error", "wrong code for {src:?}");
                assert_eq!(message, "Unexpected token", "wrong message for {src:?}");
                assert_eq!(span, (start, start), "wrong span for {src:?}");
            }
        }
    }
}

#[test]
fn legal_neighbours_still_compile() {
    for &src in ACCEPTED {
        if let Err((code, message, span)) = diagnose(src) {
            panic!("{src:?} was rejected: {code} / {message} at {span:?}");
        }
    }
}

#[test]
fn an_accepted_index_reaches_the_generated_arrow() {
    // #3245's second half: a non-identifier index used to vanish from the
    // output, so the positive control has to check the index is really there.
    let js = diagnose("{#each arr as v, i}<b>{v}{i}</b>{/each}").expect("should compile");
    assert!(
        js.contains("$$anchor, v, i") || js.contains("$$anchor, v, $$index"),
        "index missing from the each callback:\n{js}"
    );
}
