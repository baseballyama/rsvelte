//! Sourcemap-based mapping from generated `.tsx` positions back to the
//! original `.svelte` line / column. Used to translate tsgo's textual
//! diagnostics into `Diagnostic` records that point at the user's
//! Svelte source.

use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};

use sourcemap::SourceMap;

use super::diagnostic::{Diagnostic, DiagnosticSeverity, Position, Range};
use super::kit_file::AddedCode;
use super::overlay::{KitOverlayEntry, OverlayEntry, OverlayLayout};
use super::tsgo::RawTsDiagnostic;

/// Precomputed lookup for one overlay entry: parsed source map plus
/// resolved svelte source path. svelte2tsx-emitted maps are keyed by
/// the original `.svelte` filename, so once parsed we hand off any
/// `.tsx` (line,col) lookup to `sourcemap::SourceMap::lookup_token`.
struct EntryMap {
    svelte_source: PathBuf,
    map: SourceMap,
}

/// Whether a TypeScript diagnostic code denotes a SYNTACTIC error.
///
/// TypeScript groups syntax (parse) errors under the `TS1xxx` range — e.g.
/// `TS1005` (`',' expected`), `TS1109` (`Expression expected`), `TS1128`
/// (`Declaration or statement expected`), `TS1136` (`Property assignment
/// expected`). Semantic / type errors live in `TS2xxx`+.
///
/// This distinction is load-bearing: TypeScript (and tsgo) suppress ALL
/// semantic diagnostics program-wide as soon as the program contains ANY
/// syntactic error. So a single generated `.tsx` overlay that fails to
/// parse silently drops every real type error in the whole project — the
/// dangerous false-negative this module guards against (#728).
pub fn is_syntactic_ts_code(code: &str) -> bool {
    code.strip_prefix("TS")
        .and_then(|n| n.parse::<u32>().ok())
        .map(|n| (1000..2000).contains(&n))
        .unwrap_or(false)
}

/// Result of mapping a tsgo diagnostic stream back to `.svelte` source.
pub struct MappedTsDiagnostics {
    /// Diagnostics with `file` / `range` pointing at the original source.
    pub diagnostics: Vec<Diagnostic>,
    /// `.svelte` source files whose GENERATED overlay `.tsx` produced at
    /// least one SYNTACTIC (`TS1xxx`) diagnostic. Because TypeScript
    /// suppresses every semantic diagnostic program-wide once any syntax
    /// error exists, a syntactically-invalid overlay hides all real type
    /// errors elsewhere. The runner cross-references these against the
    /// Svelte-side compile errors to decide whether the bad TSX is an
    /// rsvelte/svelte2tsx defect (overlay generated from a `.svelte` that
    /// rsvelte itself parsed cleanly) and surfaces it loudly.
    pub overlay_syntax_sources: Vec<PathBuf>,
}

/// Map every tsgo diagnostic to a `Diagnostic` whose `file` / `range`
/// point at the original `.svelte` source. Diagnostics on `.tsx` files
/// without a sourcemap are passed through unchanged (file points at the
/// `.tsx` so the user can still see them).
pub fn map_tsgo_diagnostics(
    raw: &[RawTsDiagnostic],
    overlay: &OverlayLayout,
    workspace: &Path,
) -> MappedTsDiagnostics {
    // Build a lookup from absolute / canonicalised tsx path → entry.
    // tsc emits paths relative to its cwd (= workspace), so we key on
    // (a) the absolute tsx_path, (b) its canonicalised form, and
    // (c) the path relative to workspace — that last one is what shows
    // up in raw diagnostics like `.svelte-check/svelte/Foo.svelte.tsx`.
    let mut by_tsx: HashMap<PathBuf, &OverlayEntry> = HashMap::new();
    for entry in &overlay.entries {
        let canon = entry
            .tsx_path
            .canonicalize()
            .unwrap_or_else(|_| entry.tsx_path.clone());
        by_tsx.insert(canon, entry);
        by_tsx.insert(entry.tsx_path.clone(), entry);
        if let Ok(rel) = entry.tsx_path.strip_prefix(workspace) {
            by_tsx.insert(rel.to_path_buf(), entry);
        }
    }
    let mut by_kit: HashMap<PathBuf, &KitOverlayEntry> = HashMap::new();
    for entry in &overlay.kit_entries {
        let canon = entry
            .out_path
            .canonicalize()
            .unwrap_or_else(|_| entry.out_path.clone());
        by_kit.insert(canon, entry);
        by_kit.insert(entry.out_path.clone(), entry);
        if let Ok(rel) = entry.out_path.strip_prefix(workspace) {
            by_kit.insert(rel.to_path_buf(), entry);
        }
    }
    let mut maps: HashMap<PathBuf, EntryMap> = HashMap::new();
    let mut out: Vec<Diagnostic> = Vec::with_capacity(raw.len());
    // `.svelte` sources whose generated overlay produced a TS1xxx syntax
    // diagnostic, in first-seen order (deduped). Recorded regardless of
    // whether the position mapped back cleanly — any syntax error on a
    // generated `.tsx` is overlay-attributable.
    let mut overlay_syntax_sources: Vec<PathBuf> = Vec::new();
    let mut overlay_syntax_seen: HashSet<PathBuf> = HashSet::new();
    for diag in raw {
        // tsc emits relative paths (cwd = workspace). Resolve them
        // against `workspace` so canonicalize / map lookup work even
        // when our process CWD isn't the workspace.
        let absolute = if diag.file.is_absolute() {
            diag.file.clone()
        } else {
            workspace.join(&diag.file)
        };
        let canon = absolute.canonicalize().unwrap_or_else(|_| absolute.clone());
        let kit_match = by_kit
            .get(&canon)
            .copied()
            .or_else(|| by_kit.get(&absolute).copied())
            .or_else(|| by_kit.get(&diag.file).copied());
        if let Some(entry) = kit_match {
            out.push(map_kit_diagnostic(diag, entry));
            continue;
        }
        let entry_match = by_tsx
            .get(&canon)
            .copied()
            .or_else(|| by_tsx.get(&absolute).copied())
            .or_else(|| by_tsx.get(&diag.file).copied());
        if let Some(entry) = entry_match {
            // A syntax error in this generated `.tsx` overlay taints the
            // whole program's semantic checking — record its `.svelte`
            // source so the runner can surface it loudly.
            if is_syntactic_ts_code(&diag.code)
                && overlay_syntax_seen.insert(entry.source_path.clone())
            {
                overlay_syntax_sources.push(entry.source_path.clone());
            }
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
            //
            // MagicString emits per-character segments inside unedited
            // chunks, so `lookup_token` returns the exact source
            // position for any generated column inside such a chunk.
            // For edited chunks it returns the chunk's start anchor
            // (anchored to the original source range start) — which is
            // the right answer: we can't pinpoint a sub-position inside
            // synthesised template wrappers, so the diagnostic falls
            // back to the start of the rewritten source range.
            let q_line = diag.line.saturating_sub(1);
            let q_col = diag.column.saturating_sub(1);
            let token = entry_map.map.lookup_token(q_line, q_col);
            if let Some(t) = token {
                let src_line = t.get_src_line();
                let src_col = t.get_src_col();
                out.push(Diagnostic {
                    file: entry_map.svelte_source.clone(),
                    severity: severity_from_str(&diag.severity),
                    code: Some(diag.code.clone()),
                    message: diag.message.clone(),
                    range: Some(Range {
                        start: Position {
                            line: src_line + 1,
                            column: src_col,
                        },
                        end: Position {
                            line: src_line + 1,
                            column: src_col,
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
    MappedTsDiagnostics {
        diagnostics: out,
        overlay_syntax_sources,
    }
}

/// Map a tsc/tsgo diagnostic on the augmented kit-file overlay back to
/// the original `.ts` / `.js` source. The augmentation is a pure list
/// of text insertions, so reversing the mapping is a two-step walk:
///   1. Convert generated (line, col) to a generated byte offset using
///      the augmented file's line table (reconstructed from the source
///      and the `AddedCode` list).
///   2. Subtract the cumulative `inserted.len()` for every insertion
///      whose `original_pos` is `<= original_offset` to land at the
///      original offset, then convert that back to (line, col).
///
/// For augmentations that fit on a single line and contain no newlines
/// this collapses to "shift the column by the inserted lengths on the
/// same source line". For multi-line insertions (none of which the
/// current addedCode emits, but the JS reference's `kitType` JSDoc
/// blocks could) the line table walk keeps things correct.
fn map_kit_diagnostic(diag: &RawTsDiagnostic, entry: &KitOverlayEntry) -> Diagnostic {
    let original = std::fs::read_to_string(&entry.source_path).unwrap_or_default();
    let (orig_line, orig_col) = remap_kit_position(
        diag.line.saturating_sub(1),
        diag.column.saturating_sub(1),
        &original,
        &entry.added_code,
    )
    .unwrap_or((diag.line.saturating_sub(1), diag.column.saturating_sub(1)));
    Diagnostic {
        file: entry.source_path.clone(),
        severity: severity_from_str(&diag.severity),
        code: Some(diag.code.clone()),
        message: diag.message.clone(),
        range: Some(Range {
            start: Position {
                line: orig_line + 1,
                column: orig_col,
            },
            end: Position {
                line: orig_line + 1,
                column: orig_col,
            },
        }),
        source: "ts",
    }
}

/// Reverse-map a 0-indexed (line, col) on the augmented kit file to the
/// 0-indexed (line, col) on the original source. Returns `None` when
/// the position lands inside an inserted region (the JS reference keeps
/// it pinned to the start of the insertion's original anchor; we do the
/// same when this returns `Some`).
fn remap_kit_position(
    gen_line: u32,
    gen_col: u32,
    original: &str,
    adds: &[AddedCode],
) -> Option<(u32, u32)> {
    // Walk the original source while interleaving inserted strings, and
    // count generated lines/columns until we reach (gen_line, gen_col).
    // When we land on a position that came from `original`, return its
    // line/column. When we land inside an inserted span, snap to the
    // original-line/col of that insertion's anchor.
    let mut adds_iter = adds.iter().peekable();
    let mut g_line: u32 = 0;
    let mut g_col: u32 = 0;
    let mut o_line: u32 = 0;
    let mut o_col: u32 = 0;
    let bytes = original.as_bytes();
    let mut i: usize = 0;
    loop {
        // Apply any insertions anchored at the current original offset
        // before consuming more source.
        while let Some(add) = adds_iter.peek() {
            if (add.original_pos as usize) != i {
                break;
            }
            let inserted = add.inserted.as_str();
            for ch in inserted.chars() {
                if g_line == gen_line && g_col == gen_col {
                    return Some((o_line, o_col));
                }
                if ch == '\n' {
                    g_line += 1;
                    g_col = 0;
                } else {
                    g_col += 1;
                }
            }
            adds_iter.next();
        }
        if g_line == gen_line && g_col == gen_col {
            return Some((o_line, o_col));
        }
        if i >= bytes.len() {
            return None;
        }
        let b = bytes[i];
        if b == b'\n' {
            g_line += 1;
            g_col = 0;
            o_line += 1;
            o_col = 0;
        } else {
            g_col += 1;
            o_col += 1;
        }
        i += 1;
    }
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn classifies_ts1xxx_as_syntactic() {
        // Representative TS1xxx syntax codes.
        for code in ["TS1005", "TS1109", "TS1128", "TS1136", "TS1003"] {
            assert!(is_syntactic_ts_code(code), "{code} should be syntactic");
        }
    }

    #[test]
    fn classifies_ts2xxx_plus_as_semantic() {
        // TS2xxx (type), TS6xxx (lint-ish), TS7xxx (implicit-any) are NOT
        // syntactic and must not trip the loud-error path.
        for code in ["TS2322", "TS2304", "TS6133", "TS7006", "TS18047"] {
            assert!(!is_syntactic_ts_code(code), "{code} should be semantic");
        }
    }

    #[test]
    fn classifies_malformed_codes_as_non_syntactic() {
        assert!(!is_syntactic_ts_code(""));
        assert!(!is_syntactic_ts_code("TS"));
        assert!(!is_syntactic_ts_code("nonsense"));
        assert!(!is_syntactic_ts_code("TS999")); // below the 1000 floor
    }
}
