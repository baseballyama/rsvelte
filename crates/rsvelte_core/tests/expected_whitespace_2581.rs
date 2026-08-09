//! Upstream calls `Parser#require_whitespace` at 15 sites; rsvelte's port had
//! zero callers, so every one of those `expected_whitespace` errors went
//! unraised and the construct compiled. The `start` position is asserted too:
//! upstream passes a bare index to `e.expected_whitespace`, so `start` and
//! `end` coincide there, and rsvelte's own helper used `index + 1`.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn diagnostic(src: &str) -> Option<(Option<String>, Option<(u32, u32)>)> {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .err()
    .map(|e| {
        let d = e.diagnostic();
        (d.code, d.span)
    })
}

/// `(source, upstream start)` for the sites this port wires up. Every position
/// is the one the official compiler reports for the same input.
const REJECTED: &[(&str, u32)] = &[
    // `{@attach}` on an element
    ("<div {@attach(fn)}></div>", 13),
    ("<div {@attachfn}></div>", 13),
    // `{#if}`
    ("{#if(x)}a{/if}", 4),
    ("{#ifx}a{/if}", 4),
    ("{#if}a{/if}", 4),
    // `{#each}`
    ("{#each(xs) as x}a{/each}", 6),
    ("{#eachxs as x}a{/each}", 6),
    // `{#await}`
    ("{#await(p)}a{/await}", 7),
    ("{#awaitp}a{/await}", 7),
    // `{#key}`
    ("{#key(x)}a{/key}", 5),
    ("{#keyx}a{/key}", 5),
    // `{#snippet}`
    ("{#snippet(x)}a{/snippet}", 9),
    ("{#snippetfoo()}a{/snippet}", 9),
    // `{:else if}`
    ("{#if a}x{:else if(b)}y{/if}", 17),
    ("{#if a}x{:else ifb}y{/if}", 17),
    // `{:then}`
    ("{#await p}a{:then(v)}b{/await}", 17),
    ("{#await p}a{:thenv}b{/await}", 17),
    // `{:catch}`
    ("{#await p}a{:catch(e)}b{/await}", 18),
    ("{#await p}a{:catche}b{/await}", 18),
    // `{@html}`
    ("{@html(foo)}", 6),
    ("{@html'x'}", 6),
    // `{@const}`
    ("{#if 1}{@const(a) = b}{/if}", 14),
    ("{#if 1}{@const{a} = b}{/if}", 14),
    // `{@render}`
    ("{@render(foo())}", 8),
    ("{@renderfoo()}", 8),
];

#[test]
fn missing_separator_is_rejected_with_upstreams_code_and_position() {
    for (src, start) in REJECTED {
        let Some((code, span)) = diagnostic(src) else {
            panic!("{src:?} must not compile");
        };
        assert_eq!(
            code.as_deref(),
            Some("expected_whitespace"),
            "wrong code for {src:?}"
        );
        assert_eq!(
            span,
            Some((*start, *start)),
            "wrong position for {src:?} (upstream reports [{start}, {start}])"
        );
    }
}

/// The other direction. Each row is a shape the official compiler accepts at a
/// site this change now guards, so an over-rejection fails here rather than in
/// the corpus gate. `\u{a0}` and `\u{3000}` are whitespace to upstream's
/// `is_whitespace` but not to a naive ASCII check.
#[test]
fn legal_separators_still_compile() {
    for src in [
        "<div {@attach fn}></div>",
        "<div {@attach\nfn}></div>",
        "<div {@attach\tfn}></div>",
        "<Comp {@attach fn} />",
        "{#if x}a{/if}",
        "{#if\nx}a{/if}",
        "{#if\u{a0}x}a{/if}",
        "{#each xs as x}a{/each}",
        "{#each\nxs as x}a{/each}",
        "{#each xs as { x }}a{/each}",
        "{#await p}a{/await}",
        "{#await\np}a{/await}",
        "{#await p then v}a{/await}",
        "{#await p then}a{/await}",
        "{#await p catch e}a{/await}",
        "{#key x}a{/key}",
        "{#key\u{3000}x}a{/key}",
        "{#snippet foo()}a{/snippet}",
        "{#snippet\nfoo()}a{/snippet}",
        "{#if a}x{:else if b}y{/if}",
        "{#if a}x{:else if\nb}y{/if}",
        "{#if a}x{:else}y{/if}",
        "{#await p}a{:then v}b{/await}",
        "{#await p}a{:then}b{/await}",
        "{#await p}a{:then\nv}b{/await}",
        "{#await p}a{:catch e}b{/await}",
        "{#await p}a{:catch}b{/await}",
        "{@html foo}",
        "{@html\nfoo}",
        "{#if 1}{@const a = 1}{/if}",
        "{#if 1}{@const { a } = obj}{/if}",
        "{@render foo()}",
        "{@render\nfoo()}",
    ] {
        assert!(diagnostic(src).is_none(), "{src:?} should compile");
    }
}

/// `{@debug}` is the one special tag upstream never calls `require_whitespace`
/// for, and the ad-hoc check this change replaced rejected `{@debugfoo}` —
/// an over-rejection of a program the official compiler accepts.
#[test]
fn debug_tag_needs_no_separator() {
    for src in ["{@debug}", "{@debug }", "{@debugfoo}", "{@debug(foo)}"] {
        assert!(diagnostic(src).is_none(), "{src:?} should compile");
    }
}

/// The separator is required at EOF too: upstream reads a character code past
/// the end and gets `NaN`, which is not whitespace.
#[test]
fn truncated_headers_are_rejected() {
    for (src, start) in [("{#if", 4u32), ("{#snippet", 9), ("{@html", 6)] {
        let Some((code, span)) = diagnostic(src) else {
            panic!("{src:?} must not compile");
        };
        assert_eq!(code.as_deref(), Some("expected_whitespace"), "for {src:?}");
        assert_eq!(span, Some((start, start)), "for {src:?}");
    }
}
