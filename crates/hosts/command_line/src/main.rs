//! `rsvelte fixtures <dir>... [--task <identifier>]...` runs tasks over every fixture unit below
//! the given directories, in one run, and writes `actual/<task>.<ext>` next to `expected/`.
//! `rsvelte run <file> --task <identifier>` prints one task's outputs for one file.
//! `rsvelte benchmark <dir> [--task <identifier>]... [rounds=N] [json=<file>]` measures the
//! pipeline (see `commands/benchmark.rs`).
//! `rsvelte performance <dir>... [--task <identifier>]... [rounds=N] [json=<file>]` prints the
//! deterministic counters CI ratchets (see `commands/performance.rs`).
//!
//! `svelte.check` also needs `--tsc <native tsc>` and `--svelte <svelte package dir>`, `vue.check`
//! `--tsc` and `--vue <vue package dir>`; `ts.check` checks components and standalone
//! TypeScript files with one `tsc`. The project configuration is `--tsconfig <file>`, by default
//! the first directory's `tsconfig.json`.

#![expect(
    clippy::print_stdout,
    clippy::print_stderr,
    reason = "a command-line tool reports on stdout and stderr"
)]

mod commands;
mod input;
mod output;
use std::path::Path;
use std::process::ExitCode;

use commands::fixtures::fixtures;
use commands::run::run_file;
use commands::{benchmark, performance};
use input::load;
use rsvelte_kernel::computation::pipeline::Registry;

#[cfg(feature = "metrics")]
#[global_allocator]
static ALLOC: rsvelte_kernel::performance::measurement::CountingAllocator =
    rsvelte_kernel::performance::measurement::CountingAllocator;

/// Every language plugin, each with its own configuration.
fn registry(
    svelte: &rsvelte_svelte_check::Configuration,
    vue: &rsvelte_vue_check::Configuration,
) -> Registry {
    let mut reg = Registry::new();
    rsvelte_typescript_compile::register(&mut reg);
    rsvelte_typescript_format::register(&mut reg);
    rsvelte_typescript_lint::register(&mut reg);
    rsvelte_typescript_check::register(&mut reg);
    rsvelte_svelte_compile::register(&mut reg);
    rsvelte_svelte_format::register(&mut reg);
    rsvelte_svelte_lint::register(&mut reg);
    rsvelte_svelte_check::register(&mut reg, svelte);
    rsvelte_vue_compile::register(&mut reg);
    rsvelte_vue_format::register(&mut reg);
    rsvelte_vue_lint::register(&mut reg);
    rsvelte_vue_check::register(&mut reg, vue);
    rsvelte_svue::register(&mut reg);
    rsvelte_vuelte::register(&mut reg);
    reg
}

fn main() -> ExitCode {
    let arguments: Vec<String> = std::env::args().skip(1).collect();
    let mut tasks = Vec::new();
    let mut positional = Vec::new();
    let (mut tsc, mut svelte, mut vue, mut tsconfig) = (None, None, None, None);
    let mut it = arguments.iter();
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
    if tsc.is_none() && (svelte.is_some() || vue.is_some()) {
        return usage("--svelte and --vue need --tsc");
    }
    let svelte = rsvelte_svelte_check::Configuration {
        check: tsc.clone().zip(svelte).map(|(tsc, svelte)| {
            rsvelte_svelte_check::TypeCheckConfiguration {
                tsc,
                tsconfig: tsconfig.clone(),
                svelte,
            }
        }),
    };
    let polyglot = tsc.clone().map(|binary| rsvelte_typescript_check::Tsc {
        binary,
        tsconfig: tsconfig.clone(),
    });
    let vue = rsvelte_vue_check::Configuration {
        check: tsc
            .zip(vue)
            .map(|(tsc, vue)| rsvelte_vue_check::TypeCheckConfiguration { tsc, tsconfig, vue }),
    };
    let mut reg = registry(&svelte, &vue);
    // Owned by no plugin: one tsc over every language that provides a TypeScript view.
    reg.finish_task(rsvelte_typescript_check::Check {
        identifier: "ts.check/default",
        matches: |document| {
            rsvelte_typescript::matches(document)
                || rsvelte_svelte::matches(document)
                || rsvelte_vue::matches(document)
        },
        tsc: polyglot,
    });
    if let Err(e) = reg.check_task_identifiers(&tasks) {
        return usage(&e.to_string());
    }
    match positional.as_slice() {
        ["fixtures", dirs @ ..] if !dirs.is_empty() => {
            let roots: Vec<&Path> = dirs.iter().map(Path::new).collect();
            fixtures(&reg, &roots, &tasks)
        }
        ["run", file] => run_file(&reg, Path::new(file), &tasks),
        ["benchmark", dir, rest @ ..] => match benchmark::Options::parse(rest) {
            Ok(options) => benchmark::benchmark(&reg, Path::new(dir), &tasks, &options),
            Err(e) => usage(&e),
        },
        ["performance", rest @ ..] => match performance::Options::parse(rest) {
            Ok((roots, options)) => performance::performance(&reg, &roots, &tasks, &options),
            Err(e) => usage(&e),
        },
        _ => usage(concat!(
            "expected `fixtures <dir>...`, `run <file>`, ",
            "`benchmark <dir>` or `performance <dir>...`"
        )),
    }
}

fn usage(msg: &str) -> ExitCode {
    eprintln!("rsvelte: {msg}");
    ExitCode::from(2)
}

#[cfg(test)]
mod tests {
    use rsvelte_kernel::computation::pipeline::{RunOptions, Sharing};

    use super::*;

    #[test]
    fn plugin_tasks_and_type_views_select_their_own_documents() {
        let reg = registry(
            &rsvelte_svelte_check::Configuration::default(),
            &rsvelte_vue_check::Configuration::default(),
        );
        for (path, task_identifiers, has_typescript_view) in [
            (
                "a.svelte",
                vec![
                    "svelte.compile/client",
                    "svelte.compile/server",
                    "svelte.format/default",
                    "svelte.lint/default",
                    "vuelte.compile/client",
                    "vuelte.compile/server",
                ],
                true,
            ),
            (
                "a.vue",
                vec![
                    "vue.compile/default",
                    "vue.format/default",
                    "vue.lint/default",
                    "svue.compile/client",
                    "svue.compile/server",
                ],
                true,
            ),
            (
                "a.ts",
                vec!["ts.compile/default", "ts.format/default", "ts.lint/default"],
                true,
            ),
            (
                "a.mts",
                vec!["ts.compile/default", "ts.format/default", "ts.lint/default"],
                true,
            ),
            (
                "a.cts",
                vec!["ts.compile/default", "ts.format/default", "ts.lint/default"],
                true,
            ),
            ("README", vec![], false),
        ] {
            let document = reg.document(path, "").expect("valid text");
            assert_eq!(
                reg.artifacts()
                    .provides::<rsvelte_typescript_check::TypeScriptView>(&document),
                has_typescript_view,
                "{path}"
            );
            let result = rsvelte_kernel::computation::pipeline::run(
                &reg,
                &[document],
                &RunOptions {
                    tasks: &reg.document_task_identifiers(),
                    sharing: Sharing::Shared,
                    threads: Some(1),
                },
            )
            .expect("known tasks");
            assert!(result[0].panic.is_none(), "{path}: {:?}", result[0].panic);
            let identifiers: Vec<_> = result[0]
                .outputs
                .iter()
                .map(|(identifier, _)| *identifier)
                .collect();
            assert_eq!(identifiers, task_identifiers, "{path}");
        }
    }

    /// Names that sort around the separator (`-` and `.` below `/`, a letter and a non-ASCII byte
    /// above), nested three deep under a source directory, one unit in each: the walk yields them
    /// in `Path::cmp` order, with paths relative to the source and the `~` escape undone.
    #[test]
    fn units_come_in_path_order_relative_to_their_source() {
        let root = std::env::temp_dir().join(format!("rsvelte-units-{}", std::process::id()));
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
        let got = input::units(&root.join("family"));
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
