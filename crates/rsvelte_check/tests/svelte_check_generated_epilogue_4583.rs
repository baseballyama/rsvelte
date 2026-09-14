//! #4583: a diagnostic on the generated `$$render` epilogue was reported at a
//! line past the end of the author's `.svelte` file — a 6-line component got an
//! error at `7:1`. Fixed in #4584 by treating text past the last mapped
//! generated line as inserted.
//!
//! #4584's own test covers the guard at the `EntryMap` level and pins the axis
//! it reads. What no test covered is the *wiring* that turns that guard into
//! the position a user sees: `materialize_overlay`'s emitted shadow (which is
//! not bytewise the same thing as a bare `svelte2tsx` call) fed through
//! `map_tsgo_diagnostics`, with its ignore-region filter, its 1-indexed →
//! 0-indexed conversion and the `+1` it puts back on the way out. Remove the
//! guard and this file reproduces the reported `7:1` on a 6-line component;
//! the unit test cannot produce a position at all.
//!
//! `diagnostics.is_empty()` is satisfied by every drop path on that route —
//! the ignore-region filter and both branches of `is_inserted_text` — so the
//! epilogue test also pins which one it is reading.

use rsvelte_check::mapper::map_tsgo_diagnostics;
use rsvelte_check::overlay::{OverlayEntry, OverlayLayout, materialize_overlay};
use rsvelte_check::tsgo::RawTsDiagnostic;
use std::fs;
use std::path::{Path, PathBuf};

const SOURCE: &str =
    "<script lang=\"ts\">\n  const props = $props();\n  void props;\n</script>\n\n<p>hi</p>\n";

/// 1-indexed (line, column) of the authored `void props;`.
const AUTHORED: (u32, u32) = (3, 3);

fn workspace(tag: &str) -> PathBuf {
    let ws = std::env::temp_dir().join(format!("svc_4583_{}_{}", tag, std::process::id()));
    let _ = fs::remove_dir_all(&ws);
    fs::create_dir_all(&ws).unwrap();
    ws
}

/// The workspace, its overlay and the emitted shadow's text.
fn shadow(tag: &str) -> (PathBuf, PathBuf, OverlayLayout, String) {
    let ws = workspace(tag);
    let source = ws.join("Repro.svelte");
    fs::write(&source, SOURCE).unwrap();
    let overlay = materialize_overlay(&ws, std::slice::from_ref(&source), None).expect("overlay");
    let text = fs::read_to_string(&overlay.entries.first().expect("one shadow").tsx_path).unwrap();
    (ws, source, overlay, text)
}

fn entry(overlay: &OverlayLayout) -> &OverlayEntry {
    overlay.entries.first().expect("one shadow")
}

/// 1-indexed (line, column) of `needle` in `text`, and its byte offset.
fn position_of(text: &str, needle: &str) -> (u32, u32, usize) {
    let off = text.find(needle).unwrap_or_else(|| {
        panic!("generated shadow has no `{needle}`:\n{text}");
    });
    let line = text[..off].matches('\n').count() + 1;
    let line_start = text[..off].rfind('\n').map_or(0, |i| i + 1);
    let column = text[line_start..off].chars().count() + 1;
    (
        u32::try_from(line).unwrap(),
        u32::try_from(column).unwrap(),
        off,
    )
}

/// Last generated line the entry's source map covers, 1-indexed — the boundary
/// `EntryMap::is_inserted_text` compares a trailing insertion against.
fn last_mapped_line(entry: &OverlayEntry) -> u32 {
    let raw = entry.source_map.as_ref().expect("the shadow carries a map");
    let map = sourcemap::SourceMap::from_slice(raw.as_bytes()).expect("parse map");
    map.tokens()
        .map(|t| t.get_dst_line())
        .max()
        .expect("the overlay maps something")
        + 1
}

/// Is `off` inside a svelte2tsx `/*Ωignore_startΩ*/ … /*Ωignore_endΩ*/` region?
/// A diagnostic there is dropped before the map is ever consulted.
fn in_ignore_region(text: &str, off: usize) -> bool {
    text.match_indices("/*Ωignore_startΩ*/")
        .filter(|(start, _)| *start <= off)
        .any(|(start, _)| {
            text[start..]
                .find("/*Ωignore_endΩ*/")
                .is_none_or(|end| off < start + end)
        })
}

fn diagnostic_at(tsx: &Path, (line, column): (u32, u32)) -> RawTsDiagnostic {
    RawTsDiagnostic {
        file: tsx.to_path_buf(),
        line,
        column,
        severity: "error".into(),
        code: "TS2304".into(),
        message: "Cannot find name '$$ComponentProps'.".into(),
    }
}

#[test]
fn a_diagnostic_on_the_generated_epilogue_is_dropped() {
    let (ws, _source, overlay, tsx_text) = shadow("epilogue");
    let entry = entry(&overlay);
    let (line, column, off) = position_of(&tsx_text, "$$ComponentProps");

    // Without these two, an overlay that moved the epilogue onto a mapped line
    // or wrapped it in an ignore region would keep this test green through a
    // different mechanism while #4583 came back.
    let last_mapped = last_mapped_line(entry);
    assert!(
        line > last_mapped,
        "the epilogue is on generated line {line}, which the map still covers \
         (last mapped line {last_mapped}) — this test no longer reads the axis:\n{tsx_text}"
    );
    assert!(
        !in_ignore_region(&tsx_text, off),
        "the epilogue is inside an Ωignore region, so the ignore filter drops it \
         before the map is consulted — this test no longer reads the axis:\n{tsx_text}"
    );

    let raw = vec![diagnostic_at(&entry.tsx_path, (line, column))];
    let mapped = map_tsgo_diagnostics(&raw, &overlay, &ws);

    assert!(
        mapped.diagnostics.is_empty(),
        "a wholly generated epilogue line must not surface a diagnostic, got: {:#?}",
        mapped.diagnostics
    );
}

#[test]
fn a_diagnostic_on_authored_code_still_maps_into_the_component() {
    let (ws, source, overlay, tsx_text) = shadow("authored");
    let entry = entry(&overlay);
    let (line, column, _) = position_of(&tsx_text, "void props");

    let raw = vec![diagnostic_at(&entry.tsx_path, (line, column))];
    let mapped = map_tsgo_diagnostics(&raw, &overlay, &ws);

    let [diagnostic] = mapped.diagnostics.as_slice() else {
        panic!(
            "expected exactly one diagnostic, got: {:#?}",
            mapped.diagnostics
        );
    };
    assert_eq!(diagnostic.file, source);
    // #4583 was an off-position defect, so pin the position rather than a
    // range: a guard that swallowed the whole overlay, and a mapping that
    // merely landed somewhere inside the file, both fail here.
    let range = diagnostic.range.as_ref().expect("range");
    assert_eq!(
        (range.start.line, range.start.column + 1),
        AUTHORED,
        "the authored `void props;` must map back to where the author wrote it"
    );
}
