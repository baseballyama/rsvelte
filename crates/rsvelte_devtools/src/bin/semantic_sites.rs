//! Per-call-site `SemanticBuilder::build` census over a real `.svelte` corpus.
//!
//! Counts, not times, so the answer does not move with machine load. The unit
//! that matters is builds/file: the scope-tree + symbol-table build is a fixed
//! cost per call, and the per-statement transform chain pays it once per
//! statement.
//!
//! ```text
//! cargo run --release -p rsvelte_devtools --bin semantic_sites -- \
//!   --corpus submodules/flowbite-svelte
//! ```

use std::fs;
use std::path::{Path, PathBuf};

use rsvelte_core::compiler::phases::phase3_transform::profile;
use rsvelte_core::{CompileOptions, GenerateMode};

#[derive(Clone, Copy)]
struct Mode {
    label: &'static str,
    generate: GenerateMode,
    dev: bool,
}

const MODES: [Mode; 3] = [
    Mode {
        label: "client-prod",
        generate: GenerateMode::Client,
        dev: false,
    },
    Mode {
        label: "client-dev",
        generate: GenerateMode::Client,
        dev: true,
    },
    Mode {
        label: "server-prod",
        generate: GenerateMode::Server,
        dev: false,
    },
];

impl Mode {
    fn options(self) -> CompileOptions {
        CompileOptions {
            generate: self.generate,
            dev: self.dev,
            enable_sourcemap: true,
            ..Default::default()
        }
    }
}

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let base = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
    let roots: Vec<PathBuf> = args
        .iter()
        .enumerate()
        .filter(|(i, a)| a.as_str() == "--corpus" && *i + 1 < args.len())
        .map(|(i, _)| base.join(&args[i + 1]))
        .collect();
    let only_mode = args
        .iter()
        .position(|a| a == "--mode")
        .and_then(|i| args.get(i + 1))
        .cloned();

    let mut files: Vec<String> = Vec::new();
    for root in &roots {
        walk(root, &mut files);
    }
    if files.is_empty() {
        eprintln!("no .svelte files under {roots:?}");
        std::process::exit(2);
    }

    for mode in MODES
        .iter()
        .filter(|m| only_mode.as_deref().is_none_or(|w| w == m.label))
    {
        let opts = mode.options();
        // A file that fails to compile still runs part of the chain; count the
        // ones that produced output so builds/file has a stable denominator.
        let mut compiled = 0u64;
        let _ = profile::take_semantic_builds();
        for src in &files {
            if rsvelte_core::compile(src, opts.clone()).is_ok() {
                compiled += 1;
            }
        }
        let counts = profile::take_semantic_builds();
        let n = compiled as f64;
        let total: u64 = counts.iter().map(|(c, _)| c).sum();
        println!(
            "\n## {} — {} files scanned, {compiled} compiled",
            mode.label,
            files.len()
        );
        println!(
            "{:<34} {:>12} {:>12} {:>12}",
            "site", "builds", "per file", "bytes/build"
        );
        let mut rows: Vec<(usize, u64, u64)> = counts
            .iter()
            .enumerate()
            .map(|(s, &(c, b))| (s, c, b))
            .collect();
        rows.sort_by_key(|r| std::cmp::Reverse(r.1));
        for (site, c, b) in rows {
            if c == 0 {
                continue;
            }
            println!(
                "{:<34} {:>12} {:>12.2} {:>12.0}",
                profile::SEMANTIC_SITES[site],
                c,
                c as f64 / n,
                b as f64 / c as f64
            );
        }
        println!("{:<34} {:>12} {:>12.2}", "TOTAL", total, total as f64 / n);
    }
}

fn walk(dir: &Path, out: &mut Vec<String>) {
    let Ok(entries) = fs::read_dir(dir) else {
        return;
    };
    let mut paths: Vec<PathBuf> = entries.flatten().map(|e| e.path()).collect();
    paths.sort();
    for path in paths {
        if path.is_dir() {
            if path
                .file_name()
                .is_some_and(|n| n == "node_modules" || n == ".git")
            {
                continue;
            }
            walk(&path, out);
        } else if path.extension().is_some_and(|e| e == "svelte")
            && let Ok(content) = fs::read_to_string(&path)
        {
            out.push(content);
        }
    }
}
