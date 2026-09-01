//! Upstream `AwaitPendingCatchBlock.ts` pushes `[value.start, end]` and
//! `[error.start, end]` as source RANGES, so `{:then VALUE}` / `{:catch ERROR}`
//! survive as unedited magic-string chunks and the map carries one segment per
//! character. Interpolating their text into the surrounding overwrite produces
//! the identical TSX with no segment on the binding, and a TypeScript
//! diagnostic on it then maps back zero-width to the start of the edited chunk
//! — `'result' is declared but its value is never read.` came out at 28:15-28:15
//! where official reports 28:21-28:27.
//!
//! No text gate can see this: the emitted TSX is byte-identical either way, the
//! svelte2tsx map gate asserts structural well-formedness rather than equality,
//! and only the LSP differential gate compares the resulting positions.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};
use std::collections::HashSet;

fn mapped_source_positions(source: &str) -> HashSet<(u32, u32)> {
    let result = svelte2tsx(
        source,
        Svelte2TsxOptions {
            filename: "A.svelte".to_string(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx");
    let map = sourcemap::SourceMap::from_slice(result.map.as_deref().expect("map").as_bytes())
        .expect("valid source map");
    map.tokens()
        .map(|token| (token.get_src_line(), token.get_src_col()))
        .collect()
}

/// `(line, first column)` of `needle` in `source`.
fn locate(source: &str, needle: &str) -> (u32, u32) {
    let line = source
        .lines()
        .position(|line| line.contains(needle))
        .expect("needle line");
    let column = source.lines().nth(line).unwrap().find(needle).unwrap();
    (line as u32, column as u32)
}

fn assert_mapped(source: &str, marker: &str, name: &str) {
    let mapped = mapped_source_positions(source);
    let (line, column) = locate(source, marker);
    let start = column + (marker.find(name).expect("name inside marker") as u32);
    for c in start..start + name.len() as u32 {
        assert!(
            mapped.contains(&(line, c)),
            "{marker}: source {line}:{c} carries no map segment",
        );
    }
}

#[test]
fn an_immediate_then_binding_carries_its_own_map_segments() {
    assert_mapped(
        "{#await promise then result}\n\t{result}\n{/await}\n",
        "{#await promise then result}",
        "result",
    );
}

#[test]
fn an_immediate_catch_binding_carries_its_own_map_segments() {
    assert_mapped(
        "{#await promise catch failure}\n\t{failure}\n{/await}\n",
        "{#await promise catch failure}",
        "failure",
    );
}

#[test]
fn a_catch_binding_after_a_then_clause_carries_its_own_map_segments() {
    assert_mapped(
        "{#await promise then value}\n\t{value}\n{:catch failure}\n\t{failure}\n{/await}\n",
        "{:catch failure}",
        "failure",
    );
}

#[test]
fn a_pending_block_does_not_lose_the_catch_binding_segments() {
    assert_mapped(
        "{#await promise}\n\tloading\n{:then value}\n\t{value}\n{:catch failure}\n\t{failure}\n{/await}\n",
        "{:catch failure}",
        "failure",
    );
}

#[test]
fn a_then_binding_after_a_pending_block_carries_its_own_map_segments() {
    assert_mapped(
        "{#await promise}\n\tloading\n{:then value}\n\t{value}\n{/await}\n",
        "{:then value}",
        "value",
    );
}
