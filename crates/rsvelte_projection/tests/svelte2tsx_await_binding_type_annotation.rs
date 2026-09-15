//! `{:then value: T}` / `{:catch error: T}` keep their annotation in the TSX.
//!
//! `read_pattern` leaves a bare identifier's `end` in front of the `:`, so the
//! binding's own range stops before the annotation; upstream's
//! `AwaitPendingCatchBlock.ts` reads `value.typeAnnotation?.end ?? value.end`
//! for exactly that reason. Expected text is the official svelte2tsx oracle's,
//! not this port's.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn to_tsx(body: &str) -> String {
    let src = format!("<script lang=\"ts\">const p = Promise.resolve('x');</script>\n{body}");
    let opts = Svelte2TsxOptions {
        filename: "T.svelte".to_string(),
        is_ts_file: true,
        ..Default::default()
    };
    svelte2tsx(&src, opts).expect("svelte2tsx").code
}

#[test]
fn inline_then_binding_keeps_its_annotation() {
    let out = to_tsx("{#await p then value: string}{value}{/await}");
    assert!(
        out.contains("const value: string = $$_value;"),
        "annotation dropped:\n{out}"
    );
}

#[test]
fn then_clause_binding_keeps_its_annotation() {
    let out = to_tsx("{#await p}wait{:then value: string}{value}{/await}");
    assert!(
        out.contains("const value: string = $$_value;"),
        "annotation dropped:\n{out}"
    );
}

#[test]
fn catch_clause_binding_keeps_its_annotation() {
    let out = to_tsx("{#await p}wait{:then v}{v}{:catch error: unknown}{String(error)}{/await}");
    assert!(
        out.contains("const error: unknown = __sveltets_2_any();"),
        "annotation dropped:\n{out}"
    );
}

#[test]
fn an_unannotated_binding_is_unchanged() {
    // The annotated end is only asked for when the node carries one, so every
    // binding without a `:` has to come out exactly as before.
    let out = to_tsx("{#await p then value}{value}{/await}");
    assert!(
        out.contains("const value = $$_value;"),
        "unannotated binding changed:\n{out}"
    );
}
