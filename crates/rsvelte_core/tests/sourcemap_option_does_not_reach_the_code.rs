//! `enable_sourcemap` must not reach `js.code`. It is a cost switch: when it is
//! off, `script_raw_statement` skips `copied_spans_for_normalized_code` and
//! `take_chunk_region` maps each chunk as one range instead of one per copied
//! run. So `loc_map`'s *resolution* is a function of the flag — and any printer
//! decision that reads `loc_map` silently inherits that, which is how generated
//! code starts depending on whether a source map was asked for.
//!
//! Measured rather than assumed: a candidate for #4516 that bounded a call's
//! last-argument comment flush by "is this offset the end of a source-backed
//! run" was byte-identical to `main` on ~96 grid cells and passed every suite it
//! was run against, and split `js.code` on this flag for two of six probe
//! components. Nothing in the tree could see it. This test is that instrument.
//!
//! The population is the repository's own repro corpus, so it grows with the
//! defects we land rather than with what this file remembers to list.

use std::path::{Path, PathBuf};

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn corpus() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../compatibility/pattern-corpus")
}

fn svelte_files(dir: &Path, out: &mut Vec<PathBuf>) {
    let Ok(entries) = std::fs::read_dir(dir) else {
        return;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            svelte_files(&path, out);
        } else if path.extension().is_some_and(|ext| ext == "svelte") {
            out.push(path);
        }
    }
}

/// `js.code` for one file under one target, or `None` when the file is an error
/// repro (which is a fine thing for this corpus to hold, and carries no code).
/// `.svelte.(js|ts)` modules are outside the population: `ModuleCompileOptions`
/// has no `enable_sourcemap`, so there is no flag to flip for them.
fn code(
    source: &str,
    path: &Path,
    generate: GenerateMode,
    enable_sourcemap: bool,
) -> Option<String> {
    let name = path.file_name()?.to_string_lossy().into_owned();
    compile(
        source,
        CompileOptions {
            generate,
            filename: Some(name),
            enable_sourcemap,
            ..Default::default()
        },
    )
    .ok()
    .map(|result| result.js.code)
}

/// The units that depend on the flag today, as a two-sided pin: #4570. Two of
/// the three are **semantic** — `p(p(p().c++, true), true)` writes the setter's
/// return value back through the setter — so this is a shrink-only list and not
/// a tolerance.
const KNOWN: [&str; 3] = [
    "issues/3048-bindable-member-update.svelte (Client)",
    "issues/4046-dev-event-handler-comment.svelte (Client)",
    "issues/prop-shadowed-by-local-in-template-handler.svelte (Client)",
];

#[test]
fn the_generated_code_is_identical_with_and_without_source_maps() {
    let mut files = Vec::new();
    svelte_files(&corpus(), &mut files);
    files.sort();

    let mut compared = 0usize;
    let mut divergent: Vec<String> = Vec::new();

    for path in &files {
        let Ok(source) = std::fs::read_to_string(path) else {
            continue;
        };
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            let (Some(on), Some(off)) = (
                code(&source, path, generate, true),
                code(&source, path, generate, false),
            ) else {
                continue;
            };
            compared += 1;
            if on != off {
                let relative = path
                    .strip_prefix(corpus())
                    .map_or_else(|_| path.to_path_buf(), Path::to_path_buf);
                divergent.push(format!("{} ({generate:?})", relative.display()));
            }
        }
    }

    // A walk that found nothing, or a corpus that stopped compiling, would make
    // "no divergence" true and meaningless.
    assert!(
        compared > 1000,
        "too few units compared ({compared}); the walk or the corpus is broken"
    );

    divergent.sort();
    assert_eq!(
        divergent, KNOWN,
        "the `enable_sourcemap` divergence set moved ({compared} units compared). \
         A new entry is a fresh dependence; a missing one is #4570 shrinking and \
         belongs in the same PR as the fix."
    );
}
