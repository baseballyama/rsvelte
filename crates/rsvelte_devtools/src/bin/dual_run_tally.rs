//! Runs every official `.svelte` fixture through the client compiler with the
//! `RSVELTE_AST_DUAL_RUN` equivalence harness on, and prints the per-pass
//! `(runs, raw diffs, mismatches, unverified)` tally. Exits 2 if any ported
//! Phase-3 pass disagreed with the text-splicing path it replaces, and also if
//! any run could not be compared at all — a pass that is never scored proves
//! nothing.
//!
//! Raw diffs are reported but do not by themselves fail the run: normalisation
//! cancels differences that are genuinely inert as well as ones that are not,
//! so the count is a triage obligation rather than a verdict. Every raw diff
//! still has to be classified before this migration flips, which is what
//! `RSVELTE_AST_DUAL_RUN_DUMP` is for.

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

    // A caller scoping the tally to one fixture subtree needs to say which.
    let arg = std::env::args().nth(1);
    let root = arg.as_deref().map_or_else(
        || Path::new("submodules/svelte/packages/svelte/tests"),
        Path::new,
    );
    let mut files = Vec::new();
    // A single file is the unit a divergence gets attributed to, so the same
    // driver has to accept one directly.
    if root.is_file() {
        files.push(root.to_path_buf());
    } else {
        collect(root, &mut files);
    }
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
        "{:<40} {:>8} {:>10} {:>10} {:>11}",
        "pass", "runs", "raw diffs", "mismatches", "unverified"
    );
    let mut total_raw_diffs = 0;
    let mut total_mismatches = 0;
    let mut total_unverified = 0;
    for (pass, runs, raw_diffs, mismatches, unverified) in &tally {
        println!("{pass:<40} {runs:>8} {raw_diffs:>10} {mismatches:>10} {unverified:>11}");
        total_raw_diffs += raw_diffs;
        total_mismatches += mismatches;
        total_unverified += unverified;
    }
    println!("\ntotal raw diffs:  {total_raw_diffs}");
    println!("total mismatches: {total_mismatches}");
    println!("total unverified: {total_unverified}");

    let (pops, unchecked) = rsvelte_core::ast_rewrite_termination_counts();
    println!("\nterminators dropped:                {pops}");
    println!("of those, the gate could not check: {unchecked}");
    if total_unverified > 0 {
        println!("\nunverified by pass:");
        for (pass, _, _, _, unverified) in tally.iter().filter(|e| e.4 > 0) {
            println!("  {pass:<38} {unverified:>11}");
        }
    }

    println!("\nper-pass work (text path | in-place path)\n");
    println!(
        "{:<32} {:>6} {:>11} {:>7} {:>6} {:>12} | {:>6} {:>11} {:>6} {:>12}",
        "pass",
        "parses",
        "parsed B",
        "splices",
        "edits",
        "moved B",
        "parses",
        "parsed B",
        "prints",
        "printed B"
    );
    for (pass, text, ast) in rsvelte_core::ast_rewrite_dual_run_work() {
        println!(
            "{:<32} {:>6} {:>11} {:>7} {:>6} {:>12} | {:>6} {:>11} {:>6} {:>12}",
            pass,
            text.parses,
            text.parsed_bytes,
            text.splices,
            text.edits,
            text.moved_bytes,
            ast.parses,
            ast.parsed_bytes,
            ast.prints,
            ast.printed_bytes
        );
    }

    if total_mismatches > 0 || total_unverified > 0 {
        std::process::exit(2);
    }
}
