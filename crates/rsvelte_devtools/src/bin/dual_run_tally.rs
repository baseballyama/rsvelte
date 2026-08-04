//! Runs every official `.svelte` fixture through the client compiler with the
//! `RSVELTE_AST_DUAL_RUN` equivalence harness on, and prints the per-pass
//! `(runs, mismatches)` tally. Exits 2 if any ported Phase-3 pass disagreed
//! with the text-splicing path it replaces.

use std::path::{Path, PathBuf};

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn collect(dir: &Path, out: &mut Vec<PathBuf>) {
    let Ok(entries) = std::fs::read_dir(dir) else {
        return;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            collect(&path, out);
        } else if path.extension().is_some_and(|e| e == "svelte") {
            out.push(path);
        }
    }
}

fn main() {
    if std::env::var_os("RSVELTE_AST_DUAL_RUN").is_none() {
        eprintln!("set RSVELTE_AST_DUAL_RUN=1 — the harness is a no-op without it");
        std::process::exit(1);
    }

    let root = Path::new("submodules/svelte/packages/svelte/tests");
    let mut files = Vec::new();
    collect(root, &mut files);
    files.sort();
    if files.is_empty() {
        eprintln!("no .svelte fixtures under {}", root.display());
        std::process::exit(1);
    }

    for path in &files {
        let Ok(source) = std::fs::read_to_string(path) else {
            continue;
        };
        for dev in [false, true] {
            let _ = compile(
                &source,
                CompileOptions {
                    generate: GenerateMode::Client,
                    dev,
                    filename: Some(path.display().to_string()),
                    ..Default::default()
                },
            );
        }
    }

    let tally = rsvelte_core::ast_rewrite_dual_run_tally();
    println!("{} fixtures\n", files.len());
    println!("{:<40} {:>8} {:>10}", "pass", "runs", "mismatches");
    let mut total = 0;
    for (pass, runs, mismatches) in &tally {
        println!("{pass:<40} {runs:>8} {mismatches:>10}");
        total += mismatches;
    }
    println!("\ntotal mismatches: {total}");
    if total > 0 {
        std::process::exit(2);
    }
}
