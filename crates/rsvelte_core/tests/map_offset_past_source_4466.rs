//! A generated node whose span `RestoreRawMappedSpans` could not translate back
//! keeps its **chunk** coordinate — an offset into the transformed script text,
//! not into the `.svelte` source. Read as a source position it resolves to a
//! line that cannot hold it, so the map points past the end of a source line
//! (#4466). The two emission sites reject such an offset instead of naming a
//! position that does not exist.
//!
//! `sourcemaps_gate.rs` does not see this: its population is the upstream
//! `sourcemaps` fixtures, whose out-of-range budget is empty both before and
//! after. The carriers are legacy `$:` and rune-argument components, which live
//! in `compatibility/pattern-corpus`.
//!
//! Columns here are compared in **bytes**, because that is what rsvelte emits
//! (`offset - line_start`). Official emits UTF-16 columns, so this predicate is
//! not the one to judge official's map with.

use rsvelte_core::{CompileOptions, GenerateMode, compile};
use std::path::{Path, PathBuf};

fn map_of(path: &Path) -> Option<(String, String)> {
    let source = std::fs::read_to_string(path).ok()?;
    let result = compile(
        &source,
        CompileOptions {
            filename: Some(path.to_string_lossy().into_owned()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .ok()?;
    Some((source, result.js.map?))
}

/// `(segments, out_of_range)` for one map, where out-of-range means the source
/// column is past the last byte of the source line the segment names.
fn count(source: &str, map_json: &str) -> (usize, usize) {
    let value: serde_json::Value = serde_json::from_str(map_json).expect("map is JSON");
    let mappings = value
        .get("mappings")
        .and_then(serde_json::Value::as_str)
        .expect("map has mappings");
    let lines: Vec<&str> = source.split('\n').collect();

    let (mut src_line, mut src_col) = (0i64, 0i64);
    let (mut total, mut out_of_range) = (0usize, 0usize);
    for group in mappings.split(';') {
        for segment in group.split(',').filter(|s| !s.is_empty()) {
            let fields = vlq(segment);
            if fields.len() < 4 {
                continue;
            }
            src_line += fields[2];
            src_col += fields[3];
            total += 1;
            let past = usize::try_from(src_line)
                .ok()
                .and_then(|line| lines.get(line))
                .is_none_or(|line| src_col > line.len() as i64);
            if past {
                out_of_range += 1;
            }
        }
    }
    (total, out_of_range)
}

fn vlq(segment: &str) -> Vec<i64> {
    const ALPHABET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = Vec::new();
    let (mut shift, mut value) = (0u32, 0i64);
    for byte in segment.bytes() {
        let digit = ALPHABET.iter().position(|&c| c == byte).expect("base64") as i64;
        value += (digit & 31) << shift;
        if digit & 32 != 0 {
            shift += 5;
            continue;
        }
        let negative = value & 1 == 1;
        value >>= 1;
        out.push(if negative { -value } else { value });
        value = 0;
        shift = 0;
    }
    out
}

fn corpus_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("../../compatibility/pattern-corpus")
}

fn walk(dir: &Path, out: &mut Vec<PathBuf>) {
    let Ok(entries) = std::fs::read_dir(dir) else {
        return;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            walk(&path, out);
        } else if path.extension().is_some_and(|e| e == "svelte") {
            out.push(path);
        }
    }
}

/// The three carriers #4466 named, as recorded values rather than a direction.
/// Before the guards they read 309/442, 63/98 and 276/438.
///
/// `3071`'s remaining one is a **different shape**: it is the exclusive end of
/// the last node, which lands exactly at the end of `</script>` — one past the
/// line's last byte, which is what an exclusive end is. Rejecting it would need
/// `offset >= len`, and that would drop every legitimate end-of-file end too.
#[test]
fn the_named_carriers_point_inside_their_source() {
    let root = corpus_root();
    for (relative, expected) in [
        ("issues/3103-reactive-array-rest.svelte", 0),
        ("issues/3071-rune-argument-class-in-component.svelte", 1),
        ("adversarial/legacy/legacy-reactive-ordering.svelte", 0),
    ] {
        let path = root.join(relative);
        let (source, map) =
            map_of(&path).unwrap_or_else(|| panic!("{relative} compiles with a map"));
        let (total, out_of_range) = count(&source, &map);
        assert!(total > 20, "{relative}: only {total} segments — instrument");
        assert_eq!(
            out_of_range, expected,
            "{relative}: {out_of_range} of {total}"
        );
    }
}

/// The corpus-wide ceiling. `main` before this change reads 5,891 of 111,276
/// (5.3%); the residue is 77 of 105,462 (0.1%), and the ones that are left are
/// a different shape — an exclusive end landing one past the last byte — not the
/// untranslated chunk offsets this rejects. A ceiling rather than an equality
/// because the denominator moves with every codegen change; the direction is
/// what the test exists to hold.
#[test]
fn the_corpus_map_does_not_point_past_a_source_line() {
    let mut files = Vec::new();
    walk(&corpus_root(), &mut files);
    files.sort();
    assert!(
        files.len() > 1000,
        "only {} files — instrument",
        files.len()
    );

    let (mut total, mut out_of_range) = (0usize, 0usize);
    for path in &files {
        if let Some((source, map)) = map_of(path) {
            let (t, o) = count(&source, &map);
            total += t;
            out_of_range += o;
        }
    }
    assert!(
        total > 50_000,
        "only {total} segments compared — instrument"
    );
    let share = (out_of_range as f64) / (total as f64);
    assert!(
        share < 0.002,
        "{out_of_range} of {total} segments ({:.2}%) point past the end of a source line",
        100.0 * share
    );
}
