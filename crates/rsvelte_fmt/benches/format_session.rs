//! Public formatter-session benchmarks.
//!
//! This measures the reusable in-process API used by embedders, including
//! config-derived option layering and extension dispatch. Config discovery is
//! intentionally outside the timed loop because callers hold one session per
//! directory.

use criterion::{BenchmarkId, Criterion, Throughput, criterion_group, criterion_main};
use rsvelte_fmt::FormatSession;
use std::hint::black_box;

#[path = "../../../benches/common/corpus.rs"]
mod corpus;

fn bench_format_session(c: &mut Criterion) {
    let files = corpus::load();
    let corpus_dir = corpus::corpus_dir();
    let session = FormatSession::resolve(&corpus_dir).expect("benchmark config must resolve");
    let mut group = c.benchmark_group("format_session");

    for sample in &files {
        let filepath = corpus_dir.join(format!("{}.svelte", sample.id));
        session
            .format(&sample.source, &filepath)
            .unwrap_or_else(|e| panic!("bench sample `{}` failed to format: {e}", sample.id));

        group.throughput(Throughput::Bytes(sample.bytes()));
        group.bench_with_input(
            BenchmarkId::new("svelte", &sample.id),
            &sample.source,
            |b, source| {
                b.iter(|| {
                    session
                        .format(black_box(source), black_box(&filepath))
                        .expect("preflighted benchmark input must format")
                });
            },
        );
    }

    const CSS: &str = r"
        :root { --accent: #ff3e00; }
        .card:hover > .title { color: var(--accent); transform: translateY(-1px); }
        @media (width >= 48rem) { .card { display: grid; grid-template-columns: 1fr 2fr; } }
    ";
    let css_path = corpus_dir.join("standalone.css");
    session
        .format(CSS, &css_path)
        .expect("standalone CSS benchmark must format");
    group.throughput(Throughput::Bytes(CSS.len() as u64));
    group.bench_function("standalone_css/native", |b| {
        b.iter(|| {
            session
                .format(black_box(CSS), black_box(&css_path))
                .expect("preflighted benchmark input must format")
        });
    });

    group.finish();
}

criterion_group!(benches, bench_format_session);
criterion_main!(benches);
