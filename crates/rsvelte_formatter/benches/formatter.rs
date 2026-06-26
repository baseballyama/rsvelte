//! Formatter benchmarks.
//!
//! Measures the full `rsvelte_formatter::format` pipeline (parse → format each
//! `<script>` / `<style>` body + the markup → reassemble) on the **pinned,
//! in-repo corpus** at `benches/corpus/` plus a couple of deterministic
//! synthetic stress files. Inputs are committed to the repo (never read from
//! the `svelte` submodule) so the workload and benchmark IDs stay stable
//! across submodule bumps — the precondition for a meaningful CodSpeed diff.

use criterion::{BenchmarkId, Criterion, Throughput, criterion_group, criterion_main};
use std::fmt::Write as _;
use std::hint::black_box;

use rsvelte_formatter::{FormatOptions, format};

#[path = "common/corpus.rs"]
mod corpus;
use corpus::Sample;

/// Script-heavy synthetic — baselines the embedded-JS formatting hot path.
fn create_script_heavy_file() -> Sample {
    let mut src = String::from("<script>\n    let count = $state(0);\n");
    for i in 0..60 {
        let _ = writeln!(
            src,
            "    function handler_{i}(event){{const a={i};const b=a*2;let total=a+b;if(total>{i}){{count=total;}}else{{count=a;}}return count;}}"
        );
    }
    src.push_str("</script>\n\n");
    for i in 0..30 {
        let _ = writeln!(
            src,
            "<button onclick={{handler_{i}}}>Item {i}: {{count}}</button>"
        );
    }
    Sample::synthetic("synthetic-script-heavy", src)
}

/// Markup-heavy synthetic — baselines the indent / open-tag / template-expr
/// passes.
fn create_markup_heavy_file() -> Sample {
    let mut src = String::from("<script>\n  let count = $state(0);\n</script>\n\n");
    for i in 0..80 {
        let _ = writeln!(
            src,
            "<div class=\"item-{i}\" data-index={{ {i} }} aria-label=\"row {i}\"><span>Item {i}: {{count + {i}}}</span>{{#if count > {i}}}<strong>on</strong>{{:else}}<em>off</em>{{/if}}</div>"
        );
    }
    Sample::synthetic("synthetic-markup-heavy", src)
}

fn workload() -> Vec<Sample> {
    let mut files = corpus::load();
    files.push(create_script_heavy_file());
    files.push(create_markup_heavy_file());
    files
}

fn bench_format(c: &mut Criterion) {
    let files = workload();
    let mut group = c.benchmark_group("format");

    for sample in &files {
        group.throughput(Throughput::Bytes(sample.bytes()));
        group.bench_with_input(
            BenchmarkId::new("svelte", &sample.id),
            &sample.source,
            |b, source| {
                let options = FormatOptions::default();
                b.iter(|| format(black_box(source), &options));
            },
        );
    }

    group.finish();
}

criterion_group!(benches, bench_format);
criterion_main!(benches);
