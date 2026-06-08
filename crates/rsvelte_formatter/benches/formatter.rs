//! Formatter benchmarks.
//!
//! Measures the throughput of the Svelte formatter (`rsvelte_formatter::format`)
//! on real Svelte test inputs plus a couple of synthetic stress files. The
//! formatter parses each `.svelte` source, formats every `<script>` /
//! `<style>` body and the markup, and reassembles the output — so these
//! numbers cover the full format pipeline, not just the JS pass.

use std::fmt::Write as _;
use criterion::{BenchmarkId, Criterion, Throughput, criterion_group, criterion_main};
use std::fs;
use std::hint::black_box;
use std::path::PathBuf;

use rsvelte_formatter::{FormatOptions, format};

/// Collect representative Svelte sources for benchmarking.
///
/// Pulls inputs from the `runtime-runes` and `runtime-legacy` sample
/// directories (the most script-heavy corpora, which exercise the JS
/// formatting path the hardest), sorts by size, and keeps a small / medium
/// / large spread so the report shows how the formatter scales with input
/// size rather than drowning in hundreds of tiny fixtures.
fn get_sample_files() -> Vec<(String, String)> {
    let tests_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../..")
        .join("submodules/svelte/packages/svelte/tests");

    let sample_dirs = ["runtime-runes/samples", "runtime-legacy/samples"];

    let mut files = Vec::new();
    for sub in sample_dirs {
        let dir = tests_dir.join(sub);
        if !dir.exists() {
            continue;
        }
        let Ok(entries) = fs::read_dir(&dir) else {
            continue;
        };
        for entry in entries.flatten() {
            // Runtime samples name their root component `main.svelte` (unlike
            // the parser/snapshot corpora, which use `input.svelte`).
            let input_path = entry.path().join("main.svelte");
            if !input_path.exists() {
                continue;
            }
            if let Ok(content) = fs::read_to_string(&input_path) {
                // Skip trivial files — they only measure fixed overhead.
                if content.len() <= 80 {
                    continue;
                }
                let name = entry.file_name().to_string_lossy().into_owned();
                files.push((name, content));
            }
        }
    }

    files.sort_by_key(|(_, content)| content.len());

    // Small / medium / large spread.
    let mut selected = Vec::new();
    if files.len() >= 3 {
        selected.push(files[0].clone());
        selected.push(files[files.len() / 2].clone());
        selected.push(files[files.len() - 1].clone());
    } else {
        selected = files;
    }
    selected
}

/// A script-heavy synthetic component, to baseline the JS-formatting hot path.
fn create_script_heavy_file() -> (String, String) {
    let mut src = String::from("<script>\n    let count = $state(0);\n");
    for i in 0..60 {
        let _ = writeln!(src, "    function handler_{i}(event){{const a={i};const b=a*2;let total=a+b;if(total>{i}){{count=total;}}else{{count=a;}}return count;}}");
    }
    src.push_str("</script>\n\n");
    for i in 0..30 {
        let _ = writeln!(src, "<button onclick={{handler_{i}}}>Item {i}: {{count}}</button>");
    }
    ("synthetic-script-heavy".to_string(), src)
}

/// A markup-heavy synthetic component, to baseline the indent / open-tag /
/// template-expression passes.
fn create_markup_heavy_file() -> (String, String) {
    let mut src = String::from("<script>\n  let count = $state(0);\n</script>\n\n");
    for i in 0..80 {
        let _ = writeln!(src, "<div class=\"item-{i}\" data-index={{ {i} }} aria-label=\"row {i}\"><span>Item {i}: {{count + {i}}}</span>{{#if count > {i}}}<strong>on</strong>{{:else}}<em>off</em>{{/if}}</div>");
    }
    ("synthetic-markup-heavy".to_string(), src)
}

fn all_inputs() -> Vec<(String, String)> {
    let mut files = get_sample_files();
    files.push(create_script_heavy_file());
    files.push(create_markup_heavy_file());
    files
}

fn bench_format(c: &mut Criterion) {
    let files = all_inputs();
    if files.is_empty() {
        eprintln!("No sample files found for formatter benchmarking");
        return;
    }

    let mut group = c.benchmark_group("format");

    for (name, content) in &files {
        group.throughput(Throughput::Bytes(content.len() as u64));
        group.bench_with_input(BenchmarkId::new("svelte", name), content, |b, source| {
            let options = FormatOptions::default();
            b.iter(|| format(black_box(source), &options));
        });
    }

    group.finish();
}

criterion_group!(benches, bench_format);
criterion_main!(benches);
