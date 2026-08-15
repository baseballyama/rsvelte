//! Sizes the client AST handoff: how often a consumer that wants rsvelte's OXC
//! `Program` instead of its printed text can take it directly, why it cannot
//! when it cannot, and what the fallback re-parse costs.
//!
//! A native bundler integration accepts the handoff only for a program it can
//! treat as the module's own AST — one whose spans do not index a *different*
//! text than the code it will slice. Two properties disqualify a program, and
//! they are counted separately here because they have different remedies:
//!
//!   * `comment_source` is `Some` — comment coordinates live in a synthetic
//!     buffer above `loc_base`, outside any real text;
//!   * some node still carries a **source-dependent** span — a retained AST
//!     island keeps the offsets it was parsed at, which index the `.svelte`
//!     input, not the generated JS.
//!
//! Usage:
//!   ast_handoff_sizing --shipped
//!   ast_handoff_sizing --dir=/path/to/checkout
//!   ast_handoff_sizing --dir=… --json

use std::fs;
use std::path::{Path, PathBuf};
use std::time::{Duration, Instant};

use oxc_ast::ast::Program;
use oxc_ast_visit::Visit;
use oxc_span::{GetSpan, SourceType, Span};
use rsvelte_core::compiler::compile_client_with_program_sink;
use rsvelte_core::compiler::phases::phase3_transform::js_ast::to_oxc::{
    program_to_oxc, take_fallback_reason,
};
use rsvelte_core::{CompileOptions, GenerateMode};

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
enum Verdict {
    /// Nothing indexes another text: the consumer can take the program as-is.
    Direct,
    /// Comment coordinates live above `loc_base`.
    CommentBearing,
    /// A retained island keeps spans that index the `.svelte` input.
    SourceDependentSpans,
    /// Both of the above, on the same program.
    Both,
    /// `program_to_oxc` bailed; there is no program to hand off at all.
    NoProgram,
}

impl Verdict {
    fn label(self) -> &'static str {
        match self {
            Verdict::Direct => "direct",
            Verdict::CommentBearing => "comment-only",
            Verdict::SourceDependentSpans => "source-span-only",
            Verdict::Both => "comment+source-span",
            Verdict::NoProgram => "no-program",
        }
    }
}

/// Finds the first span that indexes a text other than the one the consumer
/// would treat as the module source.
#[derive(Default)]
struct SpanProbe {
    kinds: rustc_hash::FxHashMap<String, u64>,
    nodes: u64,
    /// The converter puts synthesized nodes at `SPAN`; anything else was parsed
    /// from somewhere and kept its offsets.
    located: u64,
}

impl<'a> Visit<'a> for SpanProbe {
    fn enter_node(&mut self, kind: oxc_ast::AstKind<'a>) {
        self.nodes += 1;
        if kind.span() != Span::default() {
            self.located += 1;
            *self
                .kinds
                .entry(kind.debug_name().into_owned())
                .or_default() += 1;
        }
    }
}

fn probe_spans(program: &Program<'_>) -> SpanProbe {
    let mut probe = SpanProbe::default();
    for statement in &program.body {
        probe.visit_statement(statement);
    }
    probe
}

struct Row {
    project: String,
    verdict: Verdict,
    /// `take_fallback_reason`, only meaningful for `NoProgram`.
    reason: &'static str,
    bytes: usize,
    compile: Duration,
    convert: Duration,
    reparse: Duration,
    nodes: u64,
    located: u64,
    kinds: rustc_hash::FxHashMap<String, u64>,
    /// Whether the same conversion, put through
    /// `Converted::into_coordinate_free_program`, passes the consumer's gate.
    direct_after_strip: bool,
    strip: Duration,
}

fn measure(source: &str, path: &str) -> Option<Row> {
    let options = CompileOptions {
        filename: Some(path.to_string()),
        generate: GenerateMode::Client,
        enable_sourcemap: false,
        ..Default::default()
    };

    let mut verdict = Verdict::NoProgram;
    let mut reason = "";
    let mut convert = Duration::ZERO;
    let mut spans = SpanProbe::default();
    let mut direct_after_strip = false;
    let mut strip = Duration::ZERO;

    let started = Instant::now();
    let output = compile_client_with_program_sink(source, options, &mut |program, arena| {
        let allocator = oxc_allocator::Allocator::default();
        let at = Instant::now();
        let converted = program_to_oxc(program, arena, &allocator);
        convert = at.elapsed();
        match converted {
            None => {
                verdict = Verdict::NoProgram;
                reason = take_fallback_reason();
            }
            Some(converted) => {
                let comments = converted.comment_source.is_some();
                spans = probe_spans(&converted.program);
                verdict = match (comments, spans.located > 0) {
                    (false, false) => Verdict::Direct,
                    (true, false) => Verdict::CommentBearing,
                    (false, true) => Verdict::SourceDependentSpans,
                    (true, true) => Verdict::Both,
                };

                // Same conversion again, then stripped: the question is not
                // "does the strip run" but "does its result pass the gate that
                // rejected the unstripped program".
                let again = program_to_oxc(program, arena, &allocator)
                    .expect("second conversion of a program that already converted");
                let at = Instant::now();
                let stripped = again.into_coordinate_free_program();
                strip = at.elapsed();
                direct_after_strip =
                    stripped.comments.is_empty() && probe_spans(&stripped).located == 0;
            }
        }
    })
    .ok()?;
    let compile = started.elapsed();

    // What the consumer pays instead of taking the handoff: one OXC parse of the
    // code it was handed, in the same process.
    let allocator = oxc_allocator::Allocator::default();
    let at = Instant::now();
    let parsed = oxc_parser::Parser::new(&allocator, &output.js.code, SourceType::mjs()).parse();
    let reparse = at.elapsed();
    // A re-parse that fails is not a fallback the consumer can take, and would
    // price the wrong thing.
    if !parsed.diagnostics.is_empty() {
        eprintln!("[handoff] {path}: printed output does not parse; excluded");
        return None;
    }

    Some(Row {
        project: project_of(path),
        verdict,
        reason,
        bytes: source.len(),
        compile,
        convert,
        reparse,
        nodes: spans.nodes,
        located: spans.located,
        kinds: spans.kinds,
        direct_after_strip,
        strip,
    })
}

fn main() {
    let files = collect_files();
    if files.is_empty() {
        eprintln!("no .svelte files found — pass --dir=<path> or --shipped");
        std::process::exit(1);
    }

    // One warm pass: the first compiles pay lazy-static and allocator warmup,
    // which would land in whichever bucket happens to run first.
    for (path, source) in files.iter().take(50) {
        let _ = measure(source, path);
    }

    let rows: Vec<Row> = files
        .iter()
        .filter_map(|(path, source)| measure(source, path))
        .collect();

    let json = std::env::args().any(|a| a == "--json");
    report(&rows, json);
}

fn report(rows: &[Row], json: bool) {
    let total = rows.len();
    let verdicts = [
        Verdict::Direct,
        Verdict::CommentBearing,
        Verdict::SourceDependentSpans,
        Verdict::Both,
        Verdict::NoProgram,
    ];

    let sum = |f: fn(&Row) -> Duration| -> Duration { rows.iter().map(f).sum() };
    let compile = sum(|r| r.compile);
    let reparse = sum(|r| r.reparse);
    let convert = sum(|r| r.convert);
    let bytes: usize = rows.iter().map(|r| r.bytes).sum();

    if json {
        let counts: Vec<_> = verdicts
            .iter()
            .map(|v| {
                serde_json::json!({
                    "verdict": v.label(),
                    "count": rows.iter().filter(|r| r.verdict == *v).count(),
                })
            })
            .collect();
        println!(
            "{}",
            serde_json::json!({
                "files": total,
                "bytes": bytes,
                "verdicts": counts,
                "compile_ms": compile.as_secs_f64() * 1000.0,
                "convert_ms": convert.as_secs_f64() * 1000.0,
                "reparse_ms": reparse.as_secs_f64() * 1000.0,
            })
        );
        return;
    }

    println!("files: {total}  bytes: {bytes}");
    println!("\nhandoff verdict            files    share");
    for verdict in verdicts {
        let n = rows.iter().filter(|r| r.verdict == verdict).count();
        println!(
            "  {:<24} {:>5}  {:>6.2}%",
            verdict.label(),
            n,
            100.0 * n as f64 / total as f64
        );
    }

    let bailed: Vec<_> = rows
        .iter()
        .filter(|r| r.verdict == Verdict::NoProgram)
        .collect();
    if !bailed.is_empty() {
        println!("\nno-program, by converter reason");
        let mut reasons: Vec<&'static str> = bailed.iter().map(|r| r.reason).collect();
        reasons.sort_unstable();
        reasons.dedup();
        for reason in reasons {
            let n = bailed.iter().filter(|r| r.reason == reason).count();
            println!("  {reason:<24} {n:>5}");
        }
    }

    println!("\nverdict by project");
    let mut projects: Vec<&str> = rows.iter().map(|r| r.project.as_str()).collect();
    projects.sort_unstable();
    projects.dedup();
    print!("  {:<22}", "project");
    for verdict in verdicts {
        print!(" {:>19}", verdict.label());
    }
    println!();
    for project in projects {
        let n = rows.iter().filter(|r| r.project == project).count();
        print!("  {project:<22}");
        for verdict in verdicts {
            let k = rows
                .iter()
                .filter(|r| r.project == project && r.verdict == verdict)
                .count();
            print!(" {:>11} {:>6.1}%", k, 100.0 * k as f64 / n as f64);
        }
        println!();
    }

    let nodes: u64 = rows.iter().map(|r| r.nodes).sum();
    let located: u64 = rows.iter().map(|r| r.located).sum();
    println!(
        "\nnodes carrying an input-indexed span: {located} / {nodes}  ({:.2}%)",
        100.0 * located as f64 / nodes as f64
    );

    let after = rows.iter().filter(|r| r.direct_after_strip).count();
    println!(
        "\ndirect after into_coordinate_free_program: {after} / {total}  ({:.2}%),  strip cost {:.1} ms ({:.2}% of compile)",
        100.0 * after as f64 / total as f64,
        ms(rows.iter().map(|r| r.strip).sum()),
        100.0 * rows.iter().map(|r| r.strip).sum::<Duration>().as_secs_f64()
            / compile.saturating_sub(convert).as_secs_f64()
    );

    let mut kinds: rustc_hash::FxHashMap<String, u64> = rustc_hash::FxHashMap::default();
    for row in rows {
        for (kind, n) in &row.kinds {
            *kinds.entry(kind.clone()).or_default() += n;
        }
    }
    let mut ranked: Vec<_> = kinds.into_iter().collect();
    ranked.sort_by_key(|(_, n)| std::cmp::Reverse(*n));
    println!("\ntop node kinds carrying an input-indexed span");
    for (kind, n) in ranked.iter().take(15) {
        println!(
            "  {kind:<32} {n:>9}  {:>6.2}% of located",
            100.0 * *n as f64 / located as f64
        );
    }

    // The sink runs a SECOND `program_to_oxc`; the pipeline already ran one for
    // codegen. Subtracting it keeps the denominator a compile, not a compile
    // plus this instrument.
    let net = compile.saturating_sub(convert);
    println!("\ntime, whole population");
    println!(
        "  compile (net of this probe's convert)  {:>9.1} ms",
        ms(net)
    );
    println!(
        "  IR -> OXC convert, this probe          {:>9.1} ms  ({:>5.2}% of compile)",
        ms(convert),
        100.0 * convert.as_secs_f64() / net.as_secs_f64()
    );
    println!(
        "  re-parse output, whole population      {:>9.1} ms  ({:>5.2}% of compile)",
        ms(reparse),
        100.0 * reparse.as_secs_f64() / net.as_secs_f64()
    );

    // The share that matters to a consumer is the re-parse it would actually
    // pay: only the files whose verdict forbids the handoff.
    let fallback: Duration = rows
        .iter()
        .filter(|r| r.verdict != Verdict::Direct)
        .map(|r| r.reparse)
        .sum();
    println!(
        "  re-parse actually paid (non-direct)    {:>9.1} ms  ({:>5.2}% of compile)",
        ms(fallback),
        100.0 * fallback.as_secs_f64() / net.as_secs_f64()
    );
}

/// The corpus repository a file came from, so a share that turns out to sit in
/// one project can be attributed to it instead of guessed at.
fn project_of(path: &str) -> String {
    path.split("submodules/")
        .nth(1)
        .and_then(|rest| rest.split('/').next())
        .unwrap_or("(other)")
        .to_string()
}

fn ms(d: Duration) -> f64 {
    d.as_secs_f64() * 1000.0
}

const SHIPPED_PROJECTS: [&str; 6] = [
    "submodules/flowbite-svelte",
    "submodules/bits-ui",
    "submodules/shadcn-svelte",
    "submodules/layerchart",
    "submodules/skeleton",
    "submodules/svelte-ux",
];

fn collect_files() -> Vec<(String, String)> {
    let base = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
    if let Some(dir) = std::env::args().find_map(|a| a.strip_prefix("--dir=").map(str::to_owned)) {
        let mut files = Vec::new();
        collect_svelte_files(&PathBuf::from(dir), &mut files);
        files.sort();
        return files;
    }
    let mut files = Vec::new();
    for project in &SHIPPED_PROJECTS {
        collect_svelte_files(&base.join(project), &mut files);
    }
    files.sort();
    files
}

fn collect_svelte_files(dir: &Path, files: &mut Vec<(String, String)>) {
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                if path.file_name().is_some_and(|n| n == "node_modules") {
                    continue;
                }
                collect_svelte_files(&path, files);
            } else if path.extension().is_some_and(|e| e == "svelte")
                && let Ok(content) = fs::read_to_string(&path)
            {
                files.push((path.display().to_string(), content));
            }
        }
    }
}
