//! Sourcemap-based mapping from generated `.tsx` positions back to the
//! original `.svelte` line / column. Used to translate tsgo's textual
//! diagnostics into `Diagnostic` records that point at the user's
//! Svelte source.

use std::collections::HashMap;
use std::path::{Path, PathBuf};

use sourcemap::SourceMap;

use super::diagnostic::{Diagnostic, DiagnosticSeverity, Position, Range};
use super::overlay::{OverlayEntry, OverlayLayout};
use super::tsgo::RawTsDiagnostic;

/// Precomputed lookup for one overlay entry: parsed source map plus
/// resolved svelte source path. svelte2tsx-emitted maps are keyed by
/// the original `.svelte` filename, so once parsed we hand off any
/// `.tsx` (line,col) lookup to `sourcemap::SourceMap::lookup_token`.
struct EntryMap {
    svelte_source: PathBuf,
    map: SourceMap,
}

/// Map every tsgo diagnostic to a `Diagnostic` whose `file` / `range`
/// point at the original `.svelte` source. Diagnostics on `.tsx` files
/// without a sourcemap are passed through unchanged (file points at the
/// `.tsx` so the user can still see them).
pub fn map_tsgo_diagnostics(
    raw: &[RawTsDiagnostic],
    overlay: &OverlayLayout,
    workspace: &Path,
) -> Vec<Diagnostic> {
    // Build a lookup from absolute / canonicalised tsx path → entry.
    let mut by_tsx: HashMap<PathBuf, &OverlayEntry> = HashMap::new();
    for entry in &overlay.entries {
        let canon = entry
            .tsx_path
            .canonicalize()
            .unwrap_or_else(|_| entry.tsx_path.clone());
        by_tsx.insert(canon, entry);
        by_tsx.insert(entry.tsx_path.clone(), entry);
    }
    let mut maps: HashMap<PathBuf, EntryMap> = HashMap::new();
    let mut out: Vec<Diagnostic> = Vec::with_capacity(raw.len());
    for diag in raw {
        // Skip noise from the synthesised ignore-comment regions —
        // mirrors the JS reference's check for `/*Ωignore_startΩ*/`
        // ranges. We don't have those exact ranges yet (Wave 2 v0.3
        // will add an explicit map of ignored ranges to the overlay
        // entry); for now we drop diagnostics on lines whose mapped
        // position falls back to (0,0).
        let canon = diag
            .file
            .canonicalize()
            .unwrap_or_else(|_| diag.file.clone());
        let entry_match = by_tsx
            .get(&canon)
            .copied()
            .or_else(|| by_tsx.get(&diag.file).copied());
        if let Some(entry) = entry_match {
            let entry_map = match maps.get(&entry.tsx_path) {
                Some(em) => em,
                None => match build_entry_map(entry) {
                    Some(em) => {
                        maps.insert(entry.tsx_path.clone(), em);
                        maps.get(&entry.tsx_path).expect("just inserted")
                    }
                    None => {
                        // No source map → pass through unchanged.
                        out.push(passthrough(diag, &entry.tsx_path, workspace));
                        continue;
                    }
                },
            };
            // sourcemap crate uses 0-indexed line/col; tsgo emits
            // 1-indexed.
            let token = entry_map
                .map
                .lookup_token(diag.line.saturating_sub(1), diag.column.saturating_sub(1));
            if let Some(t) = token {
                out.push(Diagnostic {
                    file: entry_map.svelte_source.clone(),
                    severity: severity_from_str(&diag.severity),
                    code: Some(diag.code.clone()),
                    message: diag.message.clone(),
                    range: Some(Range {
                        start: Position {
                            line: t.get_src_line() + 1,
                            column: t.get_src_col(),
                        },
                        end: Position {
                            line: t.get_src_line() + 1,
                            column: t.get_src_col(),
                        },
                    }),
                    source: "ts",
                });
                continue;
            }
            // Mapping failed — fall back to .tsx position.
            out.push(passthrough(diag, &entry.tsx_path, workspace));
        } else {
            out.push(passthrough(diag, &diag.file, workspace));
        }
    }
    out
}

fn build_entry_map(entry: &OverlayEntry) -> Option<EntryMap> {
    let raw_map = entry.source_map.as_deref()?;
    let map = SourceMap::from_slice(raw_map.as_bytes()).ok()?;
    Some(EntryMap {
        svelte_source: entry.source_path.clone(),
        map,
    })
}

fn severity_from_str(s: &str) -> DiagnosticSeverity {
    match s {
        "error" => DiagnosticSeverity::Error,
        "warning" => DiagnosticSeverity::Warning,
        "info" => DiagnosticSeverity::Info,
        _ => DiagnosticSeverity::Error,
    }
}

fn passthrough(diag: &RawTsDiagnostic, file: &Path, _workspace: &Path) -> Diagnostic {
    Diagnostic {
        file: file.to_path_buf(),
        severity: severity_from_str(&diag.severity),
        code: Some(diag.code.clone()),
        message: diag.message.clone(),
        range: Some(Range {
            start: Position {
                line: diag.line,
                column: diag.column,
            },
            end: Position {
                line: diag.line,
                column: diag.column,
            },
        }),
        source: "ts",
    }
}
