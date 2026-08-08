//! Hash every compiled output over a corpus, so two builds can be compared for
//! byte identity without keeping the outputs themselves on disk.
//!
//! Usage: `corpus_hash <dir> --label <build-id> [--server] [--dev]`
//!
//! `--label` is **required** and names the build this run measures — normally the
//! commit it was built from. A differential result is meaningless without it: the
//! base moves on the timescale of a single verification run, and diffing a new arm
//! against a stale baseline reports the base's own drift as if it belonged to the
//! change under test.

use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let Some(dir) = args.iter().find(|a| !a.starts_with("--")) else {
        eprintln!("usage: corpus_hash <dir> --label <build-id> [--server] [--dev]");
        std::process::exit(1);
    };
    let Some(label) = args
        .iter()
        .position(|a| a == "--label")
        .and_then(|i| args.get(i + 1))
    else {
        eprintln!(
            "corpus_hash: --label <build-id> is required so the output records which build it measures"
        );
        std::process::exit(2);
    };
    let dev = args.iter().any(|a| a == "--dev");
    let generate = if args.iter().any(|a| a == "--server") {
        GenerateMode::Server
    } else {
        GenerateMode::Client
    };

    let mut files = Vec::new();
    collect(std::path::Path::new(dir), &mut files);
    files.sort();

    // Comparison tooling skips `#` lines, so this records the build without
    // showing up as a difference between two arms.
    println!(
        "# corpus_hash label={label} mode={} dev={dev} files={}",
        if matches!(generate, GenerateMode::Server) {
            "server"
        } else {
            "client"
        },
        files.len()
    );

    for path in files {
        let Ok(source) = std::fs::read_to_string(&path) else {
            continue;
        };
        let options = CompileOptions {
            filename: Some(path.to_string_lossy().into_owned()),
            generate,
            dev,
            ..Default::default()
        };
        let line = match compile(&source, options) {
            Ok(result) => {
                let mut hasher = DefaultHasher::new();
                result.js.code.hash(&mut hasher);
                result.css.as_ref().map(|c| &c.code).hash(&mut hasher);
                // Output equality alone cannot see a changed warning set, which is
                // how a whole class of divergences stayed invisible before.
                for w in &result.warnings {
                    w.code.hash(&mut hasher);
                    w.message.hash(&mut hasher);
                    w.start
                        .as_ref()
                        .map(|p| (p.line, p.column))
                        .hash(&mut hasher);
                }
                format!(
                    "{:016x} {} w{}",
                    hasher.finish(),
                    result.js.code.len(),
                    result.warnings.len()
                )
            }
            Err(err) => format!("ERR {err:?}"),
        };
        println!("{} {line}", path.display());
    }
    if std::env::var_os("RSVELTE_AST_DUAL_RUN").is_some() {
        eprintln!(
            "fallback_would_diverge = {}",
            rsvelte_core::ast_rewrite_fallback_would_diverge()
        );
    }
}

fn collect(dir: &std::path::Path, out: &mut Vec<std::path::PathBuf>) {
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
