//! Concurrency regression test for issue #907.
//!
//! Under Vite 8 + Rolldown, `compileModule` is invoked from a *reused* pool of
//! OS threads, with each thread compiling many *different* `.svelte.js` rune
//! modules in sequence. The reported symptom was non-deterministic spurious
//! `[PARSE_ERROR]`s on valid modules (the failing file set changed between
//! runs, and error messages varied — "Cannot assign to this expression",
//! "Expected `,` or `)` but found `;`", "Unexpected token").
//!
//! A single-file 200x sequential loop and 8 worker_threads (each on the same
//! file) did NOT reproduce it — the trigger is *thread reuse across different
//! files*: stale per-thread transform state leaking from file A into file B.
//!
//! The corpus is the real `runed` package (the library named in the issue),
//! vendored under `tests/fixtures_runed/`.

use std::sync::Arc;
use std::thread;

use rsvelte_core::{GenerateMode, compile_module, compiler::ModuleCompileOptions};

fn opts(filename: &str, dev: bool, ssr: bool) -> ModuleCompileOptions {
    ModuleCompileOptions {
        filename: Some(filename.to_string()),
        generate: if ssr {
            GenerateMode::Server
        } else {
            GenerateMode::Client
        },
        dev,
        ..Default::default()
    }
}

fn compile_one(src: &str, filename: &str, dev: bool, ssr: bool) -> Result<String, String> {
    compile_module(src, opts(filename, dev, ssr))
        .map(|r| r.js.code)
        .map_err(|e| format!("{e:?}"))
}

/// Load every vendored `runed` rune module.
fn corpus() -> Vec<(String, String)> {
    let dir = concat!(env!("CARGO_MANIFEST_DIR"), "/tests/fixtures_runed");
    let mut out = Vec::new();
    for entry in std::fs::read_dir(dir).expect("read fixtures_runed dir") {
        let path = entry.expect("dir entry").path();
        if path.extension().and_then(|e| e.to_str()) == Some("js") {
            let name = path.file_name().unwrap().to_string_lossy().to_string();
            let src = std::fs::read_to_string(&path).expect("read fixture");
            out.push((name, src));
        }
    }
    out.sort();
    assert!(!out.is_empty(), "no runed fixtures found");
    out
}

#[test]
fn compile_module_is_thread_safe_under_reuse() {
    let corpus = corpus();

    // Single-threaded baseline: the correct output for every (file, dev, ssr).
    // Modules that legitimately fail to compile (e.g. an unsupported pattern)
    // are recorded as their error string — the concurrency invariant is that
    // the *same* input always yields the *same* result, success or failure.
    // (corpus index, dev, ssr) -> canonical compile result (Ok output / Err msg).
    type BaselineEntry = ((usize, bool, bool), Result<String, String>);
    let mut baseline: Vec<BaselineEntry> = Vec::new();
    for (i, (filename, src)) in corpus.iter().enumerate() {
        for &dev in &[false, true] {
            for &ssr in &[false, true] {
                let out = compile_one(src, filename, dev, ssr);
                baseline.push(((i, dev, ssr), out));
            }
        }
    }
    let baseline = Arc::new(baseline);
    let corpus = Arc::new(corpus);

    let num_threads = 8;
    let iterations_per_thread = 100;

    let mut handles = Vec::new();
    for t in 0..num_threads {
        let baseline = Arc::clone(&baseline);
        let corpus = Arc::clone(&corpus);
        handles.push(thread::spawn(move || {
            let mut mismatches: Vec<String> = Vec::new();
            for iter in 0..iterations_per_thread {
                // Walk the corpus in a thread/iteration-dependent order so that
                // each pooled thread compiles *different* files back-to-back,
                // mirroring Rolldown's interleaving.
                for k in 0..baseline.len() {
                    let idx = (k * 7 + t * 3 + iter) % baseline.len();
                    let ((file_i, dev, ssr), ref expected) = baseline[idx];
                    let (filename, src) = &corpus[file_i];
                    let got = compile_one(src, filename, dev, ssr);
                    if &got != expected {
                        mismatches.push(format!(
                            "NON-DETERMINISTIC RESULT file={filename} dev={dev} ssr={ssr} \
                             thread={t} iter={iter}\n--- baseline ---\n{expected:?}\n\
                             --- got ---\n{got:?}"
                        ));
                    }
                    if mismatches.len() >= 3 {
                        return mismatches; // fail fast with a few samples
                    }
                }
            }
            mismatches
        }));
    }

    let mut all_failures: Vec<String> = Vec::new();
    for h in handles {
        all_failures.extend(h.join().expect("worker thread panicked"));
    }

    assert!(
        all_failures.is_empty(),
        "compile_module produced {} non-deterministic results under concurrent reuse:\n\n{}",
        all_failures.len(),
        all_failures.join("\n\n========================================\n\n")
    );
}
