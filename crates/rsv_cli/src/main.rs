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
    rsv_vuelte::register(&mut reg);
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
///
/// The walk visits each directory's entries in name order, depth first, so the units come out in
/// `Path::cmp` order of their inputs with no sort, and the same on every file system.
fn units(root: &Path) -> Vec<Unit> {
    enum Item {
        Dir(PathBuf, Option<usize>, Option<String>),
        Unit(Unit),
    }
    let mut out = Vec::new();
    let depth = depth_in_fixtures(root);
    let rel = source_of(root, depth).map(|source| unescaped(root.strip_prefix(source)));
    let mut stack = vec![Item::Dir(root.to_path_buf(), depth, rel)];
    let mut entries = Vec::new();
    while let Some(item) = stack.pop() {
        let (dir, depth, rel) = match item {
            Item::Unit(u) => {
                out.push(u);
                continue;
            }
            Item::Dir(dir, depth, rel) => (dir, depth, rel),
        };
        let Ok(read) = std::fs::read_dir(&dir) else {
            continue;
        };
        entries.extend(read.flatten().map(|e| (e.file_name(), e)));
        entries.sort_unstable_by(|a, b| a.0.cmp(&b.0));
        // Pushed last to first, so the first name is popped first.
        while let Some((name, e)) = entries.pop() {
            let p = e.path();
            let name = name.to_string_lossy();
            // The entry's own type, without a `stat`, unless it is a link to follow.
            let is_dir = match e.file_type() {
                Ok(t) if !t.is_symlink() => t.is_dir(),
                _ => p.is_dir(),
            };
            if is_dir {
                if matches!(name.as_ref(), "expected" | "actual" | "cache") {
                    continue;
                }
                let depth = if p.join("_registry").is_dir() {
                    Some(0)
                } else {
                    depth.map(|d| d + 1)
                };
                let rel = match depth {
                    Some(2) => Some(String::new()),
                    Some(3..) => rel.as_deref().map(|r| {
                        let name = name.strip_prefix('~').unwrap_or(&name);
                        if r.is_empty() {
                            name.to_owned()
                        } else {
                            format!("{r}/{name}")
                        }
                    }),
                    _ => None,
                };
                stack.push(Item::Dir(p, depth, rel));
            } else if name.starts_with("input.") {
                // Outside a source directory, the unit's path is relative to `root`.
                let path = rel
                    .clone()
                    .unwrap_or_else(|| unescaped(dir.strip_prefix(root)));
                stack.push(Item::Unit(Unit {
                    input: p,
                    dir: dir.clone(),
                    path,
                }));
            }
        }
    }
    out
}

struct Unit {
    input: PathBuf,
    dir: PathBuf,
    /// The original file's path, relative to its source directory.
    path: String,
}

/// A relative path's components with the reserved-name `~` escape undone, joined by `/`.
fn unescaped(rel: Result<&Path, std::path::StripPrefixError>) -> String {
    let rel = rel.expect("a unit is inside its source directory");
    let mut path = String::new();
    for s in rel {
        if !path.is_empty() {
            path.push('/');
        }
        let s = s.to_string_lossy();
        path.push_str(s.strip_prefix('~').unwrap_or(&s));
    }
    path
}

/// `fixtures/<family>/<source>` at or above `dir`, which is `depth` below its fixture root.
fn source_of(dir: &Path, depth: Option<usize>) -> Option<&Path> {
    depth
        .filter(|&d| d >= 2)
        .and_then(|d| dir.ancestors().nth(d - 2))
}

/// How far `dir` is below the nearest directory holding `_registry/` (the fixture root, `dir`
/// itself included); its source directory, `fixtures/<family>/<source>`, is the ancestor two
/// levels below that. `None` outside a fixture tree. The walk in [`units`] carries this down
/// rather than asking again for every unit.
fn depth_in_fixtures(dir: &Path) -> Option<usize> {
    dir.ancestors().position(|a| a.join("_registry").is_dir())
}

/// Every unit below `roots` a registered language claims, with its unit directory, and the number
/// of units that were unreadable or unclaimed.
#[must_use]
pub fn load(reg: &Registry, roots: &[&Path]) -> (Vec<Document>, Vec<PathBuf>, usize) {
    let mut docs = Vec::new();
    let mut dirs = Vec::new();
    let mut skipped = 0usize;
    for Unit { input, dir, path } in roots.iter().flat_map(|r| units(r)) {
        let Ok(text) = std::fs::read_to_string(&input) else {
            skipped += 1;
            continue;
        };
        match reg.document(path, text) {
            Ok(d) => {
                docs.push(d);
                dirs.push(dir);
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

#[cfg(test)]
mod tests {
    use super::*;

    /// Names that sort around the separator (`-` and `.` below `/`, a letter and a non-ASCII byte
    /// above), nested three deep under a source directory, one unit in each: the walk yields them
    /// in `Path::cmp` order, with paths relative to the source and the `~` escape undone.
    #[test]
    fn units_come_in_path_order_relative_to_their_source() {
        let root = std::env::temp_dir().join(format!("rsv-units-{}", std::process::id()));
        let source = root.join("family").join("source");
        let names = ["a", "a-b", "a.b", "ab", "é", "~x"];
        let mut dirs = vec![source.clone()];
        for _ in 0..3 {
            let last = std::mem::take(&mut dirs);
            dirs = last
                .iter()
                .flat_map(|d| names.iter().map(|n| d.join(n)))
                .collect();
            for d in &dirs {
                std::fs::create_dir_all(d.join("actual")).unwrap();
                std::fs::write(d.join("input.svelte"), "").unwrap();
                std::fs::write(d.join("actual").join("input.svelte"), "").unwrap();
            }
        }
        std::fs::create_dir_all(root.join("_registry")).unwrap();
        let got = units(&root.join("family"));
        std::fs::remove_dir_all(&root).unwrap();
        assert_eq!(got.len(), 6 + 36 + 216);
        assert!(got.is_sorted_by(|a, b| a.input < b.input));
        for u in &got {
            let rel = u.dir.strip_prefix(&source).unwrap();
            let want = rel.to_str().unwrap().replace('~', "");
            assert_eq!(u.path, want, "{}", u.input.display());
            assert_eq!(u.input.parent(), Some(u.dir.as_path()));
        }
    }
}
