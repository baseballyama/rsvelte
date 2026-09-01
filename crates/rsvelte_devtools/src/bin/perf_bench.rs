//! Single-thread throughput baseline over a deterministic slice of the collected
//! corpus, through the public `compile()` entry point the gates and the NAPI
//! addon both use. Reports a median over N runs so a change is judged against
//! run-to-run spread rather than one sample.

#[cfg(all(
    feature = "mimalloc-alloc",
    not(target_arch = "wasm32"),
    not(target_os = "windows")
))]
#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;

use std::fs;
use std::path::PathBuf;
use std::time::Instant;

use rsvelte_core::compiler::compile_without_ast;
use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn main() {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
    let manifest: serde_json::Value =
        serde_json::from_str(&fs::read_to_string(root.join("compatibility/manifest.json")).unwrap())
            .unwrap();

    let mut args = std::env::args().skip(1);
    let mut limit = 3000usize;
    let mut runs = 5usize;
    let mut target = "client".to_string();
    let mut no_ast = false;
    while let Some(a) = args.next() {
        match a.as_str() {
            "--limit" => limit = args.next().unwrap().parse().unwrap(),
            "--runs" => runs = args.next().unwrap().parse().unwrap(),
            "--target" => target = args.next().unwrap(),
            "--no-ast" => no_ast = true,
            other => panic!("unknown arg {other}"),
        }
    }

    let ids: Vec<String> = manifest
        .as_array()
        .unwrap()
        .iter()
        .filter(|e| e["kind"] == "component")
        .map(|e| e["id"].as_str().unwrap().to_string())
        .collect();

    // Deterministic even stride over the whole corpus, so the slice spans every
    // source repository rather than the first one alphabetically.
    let stride = (ids.len() / limit).max(1);
    let mut sources = Vec::new();
    let mut bytes = 0usize;
    for id in ids.iter().step_by(stride).take(limit) {
        if let Ok(s) = fs::read_to_string(root.join("compatibility/sources").join(id)) {
            bytes += s.len();
            sources.push(s);
        }
    }

    let (generate, dev) = match target.as_str() {
        "client" => (GenerateMode::Client, false),
        "server" => (GenerateMode::Server, false),
        "client-dev" => (GenerateMode::Client, true),
        "server-dev" => (GenerateMode::Server, true),
        other => panic!("unknown target {other}"),
    };
    let options = CompileOptions {
        generate,
        dev,
        ..Default::default()
    };

    let mut ok = 0usize;
    let mut sink = 0usize;
    let mut timings = Vec::new();
    for run in 0..runs + 1 {
        let start = Instant::now();
        ok = 0;
        for s in &sources {
            let compiled = if no_ast {
                compile_without_ast(s, options.clone())
            } else {
                compile(s, options.clone())
            };
            if let Ok(r) = compiled {
                ok += 1;
                sink = sink.wrapping_add(r.js.code.len());
            }
        }
        let ms = start.elapsed().as_secs_f64() * 1000.0;
        // First run is a warmup (page cache, allocator arenas).
        if run > 0 {
            timings.push(ms);
        }
    }
    timings.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let median = timings[timings.len() / 2];
    println!(
        "target={target}{} files={} ok={ok} bytes={bytes} median={median:.1}ms \
         min={:.1}ms max={:.1}ms MB/s={:.2} sink={sink}",
        if no_ast { " no-ast" } else { "" },
        sources.len(),
        timings[0],
        timings[timings.len() - 1],
        (bytes as f64 / 1_048_576.0) / (median / 1000.0),
    );
}
