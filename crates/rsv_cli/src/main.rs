//! `rsv fixtures <dir>... [--task <id>]...` runs tasks over every fixture unit below the given
//! directories, in one run, and writes `actual/<task>.<ext>` next to `expected/`.
//! `rsv run <file> --task <id>` prints one task's outputs for one file.
//! `rsv bench <dir> [--task <id>]... [rounds=N] [json=<file>]` measures the pipeline (see
//! `bench.rs`).
//! `rsv perf <dir>... [--task <id>]... [rounds=N] [json=<file>]` prints the deterministic counters
//! CI ratchets (see `perf.rs`).
//!
//! `svelte.check` also needs `--tsc <native tsc>` and `--svelte <svelte package dir>`, `vue.check`
//! `--tsc` and `--vue <vue package dir>`; `ts.check` checks both languages' documents with one
//! `tsc`. The project configuration is `--tsconfig <file>`, by default the first directory's
//! `tsconfig.json`.

#![expect(
    clippy::print_stdout,
    clippy::print_stderr,
    reason = "a command-line tool reports on stdout and stderr"
)]

mod bench;
mod perf;

use std::path::{Path, PathBuf};
use std::process::ExitCode;

use rsv_kernel::json::JsonWriter;
use rsv_kernel::pipeline::{DocResult, Document, Registry, RunOptions, Sharing, TaskOutput};
use rsv_kernel::source::LineIndex;

#[cfg(feature = "metrics")]
#[global_allocator]
static ALLOC: rsv_kernel::metrics::CountingAlloc = rsv_kernel::metrics::CountingAlloc;

/// Every language plugin, each with its own configuration.
fn registry(svelte: &rsv_svelte::Config, vue: &rsv_vue::Config) -> Registry {
    let mut reg = Registry::new();
    rsv_svelte::register(&mut reg, svelte);
    rsv_vue::register(&mut reg, vue);
    rsv_svue::register(&mut reg);
    reg
}

fn main() -> ExitCode {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let mut tasks = Vec::new();
    let mut positional = Vec::new();
    let (mut tsc, mut svelte, mut vue, mut tsconfig) = (None, None, None, None);
    let mut it = args.iter();
    while let Some(a) = it.next() {
        let slot = match a.as_str() {
            "--task" => None,
            "--tsc" => Some(&mut tsc),
            "--svelte" => Some(&mut svelte),
            "--vue" => Some(&mut vue),
            "--tsconfig" => Some(&mut tsconfig),
            _ => {
                positional.push(a.as_str());
                continue;
            }
        };
        let Some(value) = it.next() else {
            return usage(&format!("{a} needs a value"));
        };
        match slot {
            Some(s) => match std::path::absolute(value) {
                Ok(p) => *s = Some(p),
                Err(e) => return usage(&format!("{a} {value}: {e}")),
            },
            None => tasks.push(value.as_str()),
        }
    }
    if let (None, ["fixtures", dir, ..]) = (&tsconfig, positional.as_slice()) {
        let default = Path::new(dir).join("tsconfig.json");
        tsconfig = default
            .is_file()
            .then(|| std::path::absolute(&default).expect("a non-empty path"));
    }
    if tsc.is_some() != (svelte.is_some() || vue.is_some()) {
        return usage("--tsc goes with --svelte, --vue or both");
    }
    let svelte = rsv_svelte::Config {
        check: tsc
            .clone()
            .zip(svelte)
            .map(|(tsc, svelte)| rsv_svelte::CheckConfig {
                tsc,
                tsconfig: tsconfig.clone(),
                svelte,
            }),
    };
    let polyglot = tsc.clone().map(|binary| rsv_js::check::Tsc {
        binary,
        tsconfig: tsconfig.clone(),
    });
    let vue = rsv_vue::Config {
        check: tsc
            .zip(vue)
            .map(|(tsc, vue)| rsv_vue::CheckConfig { tsc, tsconfig, vue }),
    };
    let mut reg = registry(&svelte, &vue);
    // Owned by no plugin: one tsc over every language that provides a TypeScript view.
    reg.project_task(rsv_js::check::Check {
        id: "ts.check/default",
        langs: &["svelte", "vue"],
        tsc: polyglot,
    });
    if let Err(e) = reg.check_task_ids(&tasks) {
        return usage(&e.to_string());
    }
    match positional.as_slice() {
        ["fixtures", dirs @ ..] if !dirs.is_empty() => {
            let roots: Vec<&Path> = dirs.iter().map(Path::new).collect();
            fixtures(&reg, &roots, &tasks)
        }
        ["run", file] => run_file(&reg, Path::new(file), &tasks),
        ["bench", dir, rest @ ..] => match bench::Options::parse(rest) {
            Ok(opts) => bench::bench(&reg, Path::new(dir), &tasks, &opts),
            Err(e) => usage(&e),
        },
        ["perf", rest @ ..] => match perf::Options::parse(rest) {
            Ok((roots, opts)) => perf::perf(&reg, &roots, &tasks, &opts),
            Err(e) => usage(&e),
        },
        _ => usage("expected `fixtures <dir>...`, `run <file>`, `bench <dir>` or `perf <dir>...`"),
    }
}

fn usage(msg: &str) -> ExitCode {
    eprintln!("rsv: {msg}");
    ExitCode::from(2)
}

fn run_file(reg: &Registry, file: &Path, tasks: &[&str]) -> ExitCode {
    let text = match std::fs::read_to_string(file) {
        Ok(t) => t,
        Err(e) => return usage(&format!("{}: {e}", file.display())),
    };
    let doc = match reg.document(file.to_string_lossy().into_owned(), text) {
        Ok(d) => d,
        Err(e) => return usage(&format!("{}: {e:?}", file.display())),
    };
    let opts = RunOptions {
        tasks,
        sharing: Sharing::Shared,
        threads: None,
    };
    let result = match rsv_kernel::pipeline::run(reg, std::slice::from_ref(&doc), &opts) {
        Ok(mut r) => r.remove(0),
        Err(e) => return usage(&e.to_string()),
    };
    if let Some(p) = &result.panic {
        eprintln!("panic: {p}");
        return ExitCode::FAILURE;
    }
    for (task, out) in &result.outputs {
        for f in &out.files {
            println!("// {task} {}\n{}", f.name, f.text);
        }
        if !out.diagnostics.is_empty() {
            println!("// {task} diagnostics\n{}", diagnostics_json(&doc, out));
        }
    }
    ExitCode::SUCCESS
}

/// A unit is a directory holding `input.<ext>`; its path relative to its source directory
/// (`fixtures/<family>/<source>`), with the reserved-name `~` escape undone, is the filename the
/// original file had. The source directory is found from the unit, not from `root`, so the path
/// (and every output derived from it: component names, CSS hashes) does not depend on which
/// directory the run was started from.
fn units(root: &Path) -> Vec<(PathBuf, String)> {
    let mut out = Vec::new();
    let mut stack = vec![root.to_path_buf()];
    while let Some(dir) = stack.pop() {
        let Ok(entries) = std::fs::read_dir(&dir) else {
            continue;
        };
        for e in entries.flatten() {
            let p = e.path();
            let name = e.file_name();
            let name = name.to_string_lossy();
            if p.is_dir() {
                if !matches!(name.as_ref(), "expected" | "actual" | "cache") {
                    stack.push(p);
                }
            } else if name.starts_with("input.") {
                let unit = dir
                    .strip_prefix(source_dir(&dir).unwrap_or(root))
                    .expect("a unit is inside its source directory");
                let path = unit
                    .iter()
                    .map(|s| {
                        let s = s.to_string_lossy();
                        s.strip_prefix('~').unwrap_or(&s).to_owned()
                    })
                    .collect::<Vec<_>>()
                    .join("/");
                out.push((p, path));
            }
        }
    }
    out.sort();
    out
}

/// `fixtures/<family>/<source>` above `unit`: the fixture root is the ancestor holding
/// `_registry/`. `None` outside a fixture tree.
fn source_dir(unit: &Path) -> Option<&Path> {
    let mut below = Vec::new();
    for dir in unit.ancestors() {
        if dir.join("_registry").is_dir() {
            let n = below.len();
            return (n >= 2).then(|| below[n - 2]);
        }
        below.push(dir);
    }
    None
}

/// Every unit below `roots` a registered language claims, with its unit directory, and the number
/// of units that were unreadable or unclaimed.
///
/// # Panics
///
/// Never: every unit's input file sits inside its unit directory.
#[must_use]
pub fn load(reg: &Registry, roots: &[&Path]) -> (Vec<Document>, Vec<PathBuf>, usize) {
    let mut docs = Vec::new();
    let mut dirs = Vec::new();
    let mut skipped = 0usize;
    for (input, path) in roots.iter().flat_map(|r| units(r)) {
        let Ok(text) = std::fs::read_to_string(&input) else {
            skipped += 1;
            continue;
        };
        match reg.document(path, text) {
            Ok(d) => {
                docs.push(d);
                dirs.push(
                    input
                        .parent()
                        .expect("input is in a unit dir")
                        .to_path_buf(),
                );
            }
            Err(_) => skipped += 1,
        }
    }
    (docs, dirs, skipped)
}

fn fixtures(reg: &Registry, roots: &[&Path], tasks: &[&str]) -> ExitCode {
    use std::sync::atomic::AtomicUsize;
    use std::sync::atomic::Ordering::Relaxed;
    let (docs, dirs, skipped) = load(reg, roots);
    let opts = RunOptions {
        tasks,
        sharing: Sharing::Shared,
        threads: None,
    };
    let (panics, files, failed) = (
        AtomicUsize::new(0),
        AtomicUsize::new(0),
        AtomicUsize::new(0),
    );
    let started = std::time::Instant::now();
    // Each unit's outputs are written as soon as they are final, so memory stays at the working
    // set.
    let ran = rsv_kernel::pipeline::run_each(reg, &docs, &opts, &|i, result| {
        let actual = dirs[i].join("actual");
        // Absent on a unit's first run.
        drop(std::fs::remove_dir_all(&actual));
        if let Some(p) = &result.panic {
            panics.fetch_add(1, Relaxed);
            eprintln!("panic: {}: {p}", docs[i].path);
            return;
        }
        let mut f = 0;
        files.fetch_add(write_outputs(&docs[i], &actual, &result, &mut f), Relaxed);
        failed.fetch_add(f, Relaxed);
    });
    if let Err(e) = ran {
        return usage(&e.to_string());
    }
    let elapsed = started.elapsed();
    let panics = panics.into_inner();
    eprintln!(
        "{} units ({skipped} unreadable or unclaimed), {} files written, {} task(s) with \
         diagnostics, {panics} panic(s), {:.1} ms including writing",
        docs.len(),
        files.into_inner(),
        failed.into_inner(),
        elapsed.as_secs_f64() * 1e3
    );
    report_metrics();
    if panics > 0 {
        ExitCode::FAILURE
    } else {
        ExitCode::SUCCESS
    }
}

fn write_outputs(doc: &Document, actual: &Path, result: &DocResult, failed: &mut usize) -> usize {
    let mut written = 0;
    for (task, out) in &result.outputs {
        let (dir, variant) = task.split_once('/').unwrap_or((task, "default"));
        let dir = actual.join(dir);
        std::fs::create_dir_all(&dir).expect("create actual/");
        for f in &out.files {
            std::fs::write(dir.join(format!("{variant}.{}", f.name)), &f.text).expect("write");
            written += 1;
        }
        if !out.diagnostics.is_empty() {
            *failed += 1;
            std::fs::write(
                dir.join(format!("{variant}.diagnostics.json")),
                diagnostics_json(doc, out),
            )
            .expect("write");
        }
    }
    written
}

fn diagnostics_json(doc: &Document, out: &TaskOutput) -> String {
    let index = LineIndex::new(&doc.text);
    let mut w = JsonWriter::new(true);
    w.begin_array();
    for d in &out.diagnostics {
        let start = index.line_col(d.span.lo);
        let end = index.line_col(d.span.hi);
        w.begin_object()
            .key("code")
            .str(&d.code)
            .key("message")
            .str(&d.message)
            .key("start")
            .begin_object()
            .key("line")
            .num(start.line)
            .key("column")
            .num(start.column)
            .end_object()
            .key("end")
            .begin_object()
            .key("line")
            .num(end.line)
            .key("column")
            .num(end.column)
            .end_object()
            .end_object();
    }
    w.end_array();
    w.finish()
}

#[cfg(feature = "metrics")]
fn report_metrics() {
    for p in rsv_kernel::metrics::snapshot() {
        eprintln!("{p:?}");
    }
}

#[cfg(not(feature = "metrics"))]
const fn report_metrics() {}
