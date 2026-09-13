//! #4583: a diagnostic on the generated `$$render` epilogue was reported at a
//! line past the end of the author's `.svelte` file — a 6-line component got an
//! error at `7:1`. Fixed in #4584 by treating text past the last mapped
//! generated line as inserted.
//!
//! That fix is covered by a unit test over a hand-built [`EntryMap`]. This pins
//! the same guard at the level the user actually sees: materialize the real
//! overlay, locate the epilogue in the generated text, and assert the mapper
//! drops a diagnostic there while still mapping one on authored code. A
//! regression in the overlay's own layout — an epilogue that starts carrying
//! segments, or authored code that stops — moves the boundary without touching
//! `is_inserted_text`, and only an end-to-end test notices.

use rsvelte_check::mapper::map_tsgo_diagnostics;
use rsvelte_check::overlay::materialize_overlay;
use rsvelte_check::tsgo::RawTsDiagnostic;
use std::fs;
use std::path::{Path, PathBuf};

const SOURCE: &str =
    "<script lang=\"ts\">\n  const props = $props();\n  void props;\n</script>\n\n<p>hi</p>\n";

fn workspace(tag: &str) -> PathBuf {
    let ws = std::env::temp_dir().join(format!("svc_4583_{}_{}", tag, std::process::id()));
    let _ = fs::remove_dir_all(&ws);
    fs::create_dir_all(&ws).unwrap();
    ws
}

/// 1-indexed (line, column) of `needle` in `text`.
fn position_of(text: &str, needle: &str) -> (u32, u32) {
    let off = text.find(needle).unwrap_or_else(|| {
        panic!("generated shadow has no `{needle}`:\n{text}");
    });
    let line = text[..off].matches('\n').count() + 1;
    let line_start = text[..off].rfind('\n').map_or(0, |i| i + 1);
    let column = text[line_start..off].chars().count() + 1;
    (u32::try_from(line).unwrap(), u32::try_from(column).unwrap())
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
    let ws = workspace("epilogue");
    let source = ws.join("Repro.svelte");
    fs::write(&source, SOURCE).unwrap();

    let overlay = materialize_overlay(&ws, &[source], None).expect("overlay");
    let entry = overlay.entries.first().expect("one shadow");
    let tsx_text = fs::read_to_string(&entry.tsx_path).unwrap();

    let raw = vec![diagnostic_at(
        &entry.tsx_path,
        position_of(&tsx_text, "$$ComponentProps"),
    )];
    let mapped = map_tsgo_diagnostics(&raw, &overlay, &ws);

    assert!(
        mapped.diagnostics.is_empty(),
        "a wholly generated epilogue line must not surface a diagnostic, got: {:#?}",
        mapped.diagnostics
    );
}

#[test]
fn a_diagnostic_on_authored_code_still_maps_into_the_component() {
    let ws = workspace("authored");
    let source = ws.join("Repro.svelte");
    fs::write(&source, SOURCE).unwrap();

    let overlay = materialize_overlay(&ws, std::slice::from_ref(&source), None).expect("overlay");
    let entry = overlay.entries.first().expect("one shadow");
    let tsx_text = fs::read_to_string(&entry.tsx_path).unwrap();

    let raw = vec![diagnostic_at(
        &entry.tsx_path,
        position_of(&tsx_text, "void props"),
    )];
    let mapped = map_tsgo_diagnostics(&raw, &overlay, &ws);

    let [diagnostic] = mapped.diagnostics.as_slice() else {
        panic!(
            "expected exactly one diagnostic, got: {:#?}",
            mapped.diagnostics
        );
    };
    assert_eq!(diagnostic.file, source);
    let line = diagnostic.range.as_ref().expect("range").start.line;
    let lines = u32::try_from(SOURCE.lines().count()).unwrap();
    assert!(
        line <= lines,
        "diagnostic mapped to line {line}, past the component's {lines} lines"
    );
}
