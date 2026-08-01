//! Precondition of the AST-equivalence gate: every output the compiler emits
//! must be readable by the comparator.
//!
//! The gate answers "do these two programs mean the same thing" by parsing
//! both. An output that does not parse has no answer — and a comparator that
//! quietly falls back to text matching at that point stops being a gate. So
//! the parse rate has to be exactly 100%, and this test is what keeps it
//! there.

mod common;

use rayon::prelude::*;
use rsvelte_core::{CompileOptions, GenerateMode};
use std::fs;
use std::path::{Path, PathBuf};

/// Suites whose samples are valid Svelte — error/validator samples are
/// excluded because "does not compile" is their expected outcome.
const SUITES: &[&str] = &[
    "runtime-runes",
    "runtime-legacy",
    "server-side-rendering",
    "hydration",
    "snapshot",
    "css",
];

fn collect_svelte_files(dir: &Path, out: &mut Vec<PathBuf>) {
    let Ok(entries) = fs::read_dir(dir) else {
        return;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            collect_svelte_files(&path, out);
        } else if path.extension().is_some_and(|ext| ext == "svelte") {
            out.push(path);
        }
    }
}

#[test]
fn every_compiled_output_is_parseable() {
    let root = common::svelte_path().join("packages/svelte/tests");
    if !root.exists() {
        panic!(
            "Svelte submodule missing at {} — run `git submodule update --init`",
            root.display()
        );
    }

    let mut files = Vec::new();
    for suite in SUITES {
        collect_svelte_files(&root.join(suite).join("samples"), &mut files);
    }
    files.sort();
    assert!(
        files.len() > 1000,
        "expected the Svelte sample corpus, found only {} files under {}",
        files.len(),
        root.display()
    );

    let targets = [
        ("client", GenerateMode::Client, false),
        ("client-dev", GenerateMode::Client, true),
        ("server", GenerateMode::Server, false),
    ];

    let failures: Vec<String> = files
        .par_iter()
        .flat_map_iter(|path| {
            let source = fs::read_to_string(path).unwrap_or_default();
            let name = path
                .strip_prefix(&root)
                .unwrap_or(path)
                .display()
                .to_string();
            let mut failures = Vec::new();
            for (label, generate, dev) in &targets {
                let options = CompileOptions {
                    generate: *generate,
                    dev: *dev,
                    filename: Some(name.clone()),
                    ..Default::default()
                };
                // A compile error is out of scope here: these samples include
                // deliberately invalid input, and validation is gated
                // elsewhere.
                let Ok(result) = rsvelte_core::compile(&source, options) else {
                    continue;
                };
                if let Err(failure) = rsvelte_ast_equiv::canonicalize(&result.js.code) {
                    failures.push(format!("{name} [{label}]: {failure}"));
                }
            }
            failures
        })
        .collect();

    assert!(
        failures.is_empty(),
        "{} compiled output(s) do not parse, so the AST-equivalence gate cannot \
         compare them:\n{}",
        failures.len(),
        failures.join("\n")
    );
}
