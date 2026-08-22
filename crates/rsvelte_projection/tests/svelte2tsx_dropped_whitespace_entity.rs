//! `legacy.js::remove_surrounding_whitespace_nodes` drops a whitespace-only
//! first/last `Text` child, and svelte2tsx then never visits it — so its source
//! range survives verbatim in the TSX. That is only safe when the *source* is
//! whitespace too.
//!
//! `&nbsp;` decodes to U+00A0, which `char::is_whitespace` accepts, so the node
//! is classified whitespace-only from its `data` while its six raw characters
//! stay in the output. The result is TSX that does not parse, which makes the
//! corpus comparison fall back to raw text and every later line diverge —
//! `Text.ts` already documents this exact hazard for the blanking path.

use rsvelte_projection::svelte2tsx::{
    Svelte2TsxMode, Svelte2TsxNamespace, Svelte2TsxOptions, SvelteVersion, svelte2tsx,
};

fn opts() -> Svelte2TsxOptions {
    Svelte2TsxOptions {
        filename: "T.svelte".to_string(),
        is_ts_file: false,
        mode: Svelte2TsxMode::Ts,
        accessors: false,
        namespace: Svelte2TsxNamespace::Html,
        version: SvelteVersion::V5,
        runes: None,
        emit_jsdoc: false,
        rewrite_external_imports: None,
        ..Svelte2TsxOptions::default()
    }
}

fn tsx(input: &str) -> String {
    svelte2tsx(input, opts()).expect("svelte2tsx").code
}

#[test]
fn an_entity_only_if_body_does_not_leak_into_the_tsx() {
    let out = tsx("<script>let x;</script>\n\n{#if x}\n\t&nbsp;\n{/if}\n");
    assert!(
        !out.contains("&nbsp;"),
        "raw entity left in the TSX, which does not parse:\n{out}"
    );
}

#[test]
fn an_entity_only_boundary_body_does_not_leak_into_the_tsx() {
    let out = tsx("<svelte:boundary>\n\t&nbsp;\n</svelte:boundary>\n");
    assert!(
        !out.contains("&nbsp;"),
        "raw entity left in the TSX, which does not parse:\n{out}"
    );
}

/// The entity without its semicolon is the form the corpus actually hit.
#[test]
fn a_semicolonless_entity_does_not_leak_either() {
    let out = tsx("<script>let x;</script>\n\n{#if x}\n\t&nbsp\n{/if}\n");
    assert!(
        !out.contains("&nbsp"),
        "raw entity left in the TSX, which does not parse:\n{out}"
    );
}

/// Control: a genuinely whitespace-only body is still dropped, so the fix reads
/// as "the source has to be whitespace too" and not "stop dropping".
#[test]
fn a_plain_whitespace_body_is_still_left_alone() {
    let out = tsx("<script>let x;</script>\n\n{#if x}\n\t\n{/if}\n");
    assert!(out.contains("if(x){"), "if block not emitted:\n{out}");
    assert!(!out.contains("&"), "unexpected entity in output:\n{out}");
}
