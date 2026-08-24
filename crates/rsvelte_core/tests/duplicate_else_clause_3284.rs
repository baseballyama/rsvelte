//! A second `{:else}` in an `{#if}` or `{#each}` is accepted by the official
//! compiler: `next()` re-creates `block.alternate` / `block.fallback` on every
//! `{:else}` it reads, so the later branch replaces the earlier one and the
//! earlier one's content is dropped. rsvelte rejected it instead — and with
//! three different codes depending on the host, because the parse simply fell
//! over wherever the surrounding construct noticed first (issue #3284).

use rsvelte_core::compiler::CssMode;
use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compile_js(src: &str, generate: GenerateMode) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .unwrap_or_else(|e| panic!("{src:?} must compile: {e:?}"))
    .js
    .code
}

/// The five hosts the issue reports, each of which produced a different
/// diagnostic before the fix.
#[test]
fn a_second_else_is_accepted_in_every_host() {
    for src in [
        "{#each arr as v}{v}{:else}a{:else}b{/each}",
        "<div>{#each arr as v}{v}{:else}a{:else}b{/each}</div>",
        "{#if q}{#each arr as v}{v}{:else}a{:else}b{/each}{/if}",
        "{#each o as p}{#each arr as v}{v}{:else}a{:else}b{/each}{/each}",
        "{#snippet s()}{#each arr as v}{v}{:else}a{:else}b{/each}{/snippet}{@render s()}",
        "{#if x}a{:else}b{:else}c{/if}",
        "<div>{#if x}a{:else}b{:else}c{/if}</div>",
    ] {
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            compile_js(src, generate);
        }
    }
}

/// The replacement is what upstream does, not a merge: the first branch's
/// content never reaches the output.
#[test]
fn the_last_else_wins_and_the_earlier_branch_is_dropped() {
    for (src, kept, dropped) in [
        ("{#if x}a{:else}bbb{:else}ccc{/if}", "ccc", "bbb"),
        ("{#if x}a{:else}bbb{:else}ccc{:else}ddd{/if}", "ddd", "bbb"),
        (
            "{#each arr as v}{v}{:else}bbb{:else}ccc{/each}",
            "ccc",
            "bbb",
        ),
    ] {
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            let js = compile_js(src, generate);
            assert!(js.contains(kept), "expected {kept:?} in output of {src:?}");
            assert!(
                !js.contains(dropped),
                "expected {dropped:?} to be dropped from output of {src:?}"
            );
        }
    }
}

/// `{:else if}` after a plain `{:else}` replaces the alternate the same way,
/// and the chain that follows it still parses.
#[test]
fn an_else_if_after_an_else_replaces_the_alternate() {
    for (src, kept, dropped) in [
        ("{#if x}a{:else}bbb{:else if z}ddd{/if}", "ddd", "bbb"),
        (
            "{#if x}a{:else if y}bbb{:else}ccc{:else if z}ddd{/if}",
            "ddd",
            "ccc",
        ),
    ] {
        let js = compile_js(src, GenerateMode::Client);
        assert!(js.contains(kept), "expected {kept:?} in output of {src:?}");
        assert!(
            !js.contains(dropped),
            "expected {dropped:?} to be dropped from output of {src:?}"
        );
    }
}

/// The single-`{:else}` forms must be untouched by the loop that accepts the
/// duplicate.
#[test]
fn a_single_else_is_unchanged() {
    for (src, kept) in [
        ("{#if x}aaa{:else}bbb{/if}", "bbb"),
        ("{#if x}aaa{:else if y}bbb{/if}", "bbb"),
        ("{#each arr as v}{v}{:else}bbb{/each}", "bbb"),
    ] {
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            let js = compile_js(src, generate);
            assert!(js.contains(kept), "expected {kept:?} in output of {src:?}");
        }
    }
}
