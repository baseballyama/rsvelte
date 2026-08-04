//! Runs every official `.svelte` fixture through the client compiler with the
//! `RSVELTE_AST_DUAL_RUN` equivalence harness on, and prints the per-pass
//! `(runs, mismatches, unverified)` tally. Exits 2 if any ported Phase-3 pass
//! disagreed with the text-splicing path it replaces, and also if any run could
//! not be compared at all — a pass that is never scored proves nothing.

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
    println!(
        "{:<40} {:>8} {:>10} {:>11}",
        "pass", "runs", "mismatches", "unverified"
    );
    let mut total_mismatches = 0;
    let mut total_unverified = 0;
    for (pass, runs, mismatches, unverified) in &tally {
        println!("{pass:<40} {runs:>8} {mismatches:>10} {unverified:>11}");
        total_mismatches += mismatches;
        total_unverified += unverified;
    }
    println!("\ntotal mismatches: {total_mismatches}");
    println!("total unverified: {total_unverified}");
    if total_unverified > 0 {
        println!("\nunverified by pass:");
        for (pass, _, _, unverified) in tally.iter().filter(|e| e.3 > 0) {
            println!("  {pass:<38} {unverified:>11}");
        }
    }
    if total_mismatches > 0 || total_unverified > 0 {
        std::process::exit(2);
    }
}
