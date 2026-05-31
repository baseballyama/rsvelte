//! `svelte-check` CLI binary — Wave 2 of the ecosystem port. v0.1
//! covers Svelte-side diagnostics only (compile errors + compiler
//! warnings). tsgo integration is the next milestone.

// Use jemalloc as the global allocator for better multi-threaded
// performance. Defined per-bin rather than once in the lib because the lib
// is built as both rlib and cdylib, and a lib-level `#[global_allocator]`
// is duplicated across both outputs at link time — cargo issue
// rust-lang/cargo#6313.
#[cfg(all(
    feature = "jemalloc",
    not(feature = "napi"),
    not(target_arch = "wasm32"),
    not(target_os = "windows")
))]
#[global_allocator]
static GLOBAL: tikv_jemallocator::Jemalloc = tikv_jemallocator::Jemalloc;

use std::path::{Path, PathBuf};
use std::process::ExitCode;

use std::collections::{HashMap, HashSet};

use clap::Parser;
use rsvelte_core::svelte_check::{
    OutputFormat, RunOptions, run,
    runner::{DiagnosticSource, WarningOverride},
    watch::{WatchOptions, run_watch},
    writers::write_diagnostic,
    writers::write_summary,
};

#[derive(Parser, Debug)]
#[command(
    name = "svelte-check",
    about = "Type-check & diagnose Svelte projects (Rust port of @sveltejs/svelte-check)",
    long_about = None
)]
struct Cli {
    /// Workspace root (defaults to the current directory).
    #[arg(long = "workspace")]
    workspace: Option<PathBuf>,

    /// Output format: human, human-verbose, machine, machine-verbose,
    /// github-actions (alias: github).
    #[arg(long = "output", default_value = "human-verbose")]
    output: String,

    /// Comma-separated list of path components to skip during traversal.
    #[arg(long = "ignore")]
    ignore: Option<String>,

    /// Treat warnings as errors when computing the exit code.
    #[arg(long = "fail-on-warnings", default_value_t = false)]
    fail_on_warnings: bool,

    /// Materialise `.tsx` shadow files + an overlay tsconfig under
    /// `<workspace>/.svelte-check/`. The directory layout matches the
    /// JS reference's `--tsgo` cache, so a follow-up step can hand it
    /// straight to a TypeScript compiler.
    #[arg(long = "emit-overlay", default_value_t = false)]
    emit_overlay: bool,

    /// Path to a tsconfig.json the overlay should `extends`. Optional —
    /// the overlay is self-contained otherwise.
    #[arg(long = "tsconfig")]
    tsconfig: Option<PathBuf>,

    /// Run `tsgo` (or `tsc`) against the overlay tsconfig and report
    /// the resulting TypeScript diagnostics mapped back to the
    /// original `.svelte` source. Implies `--emit-overlay`.
    #[arg(long = "tsgo", default_value_t = false)]
    tsgo: bool,

    /// Comma-separated `code:error|ignore` overrides for compiler
    /// warnings. Example: `css-unused-selector:ignore,a11y-no-noninteractive-element-to-interactive-role:error`.
    #[arg(long = "compiler-warnings")]
    compiler_warnings: Option<String>,

    /// Comma-separated list of diagnostic sources to surface (any
    /// subset of `svelte`, `ts`/`js`, `css`). Default: all sources.
    #[arg(long = "diagnostic-sources")]
    diagnostic_sources: Option<String>,

    /// Reuse the `<workspace>/.svelte-check/manifest.json` cache to
    /// skip rewriting `.tsx` shadows whose source `.svelte` hasn't
    /// changed since the previous run. Mirrors the JS reference's
    /// `--incremental`. Safe to enable everywhere — a missing /
    /// stale-version manifest just means a cold rebuild.
    #[arg(long = "incremental", default_value_t = false)]
    incremental: bool,

    /// Stay alive after the first run, re-checking the workspace on
    /// every relevant file change. Composes with `--incremental` —
    /// every re-run reuses the manifest cache, so unchanged files
    /// skip the overlay step. Mirrors `--watch` in the JS reference.
    #[arg(long = "watch", default_value_t = false)]
    watch: bool,

    /// In `--watch` mode, do NOT clear the terminal between runs.
    /// Mirrors `--preserveWatchOutput` in the JS reference / tsc.
    #[arg(long = "preserve-watch-output", default_value_t = false)]
    preserve_watch_output: bool,
}

fn main() -> ExitCode {
    let cli = Cli::parse();

    let format = match OutputFormat::parse(&cli.output) {
        Some(f) => f,
        None => {
            eprintln!(
                "Unknown output format `{}` — expected human, human-verbose, machine, or machine-verbose",
                cli.output
            );
            return ExitCode::from(2);
        }
    };

    let workspace = cli
        .workspace
        .unwrap_or_else(|| std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")));
    let ignore = cli
        .ignore
        .as_deref()
        .map(|s| {
            s.split(',')
                .map(|p| p.trim().to_string())
                .filter(|p| !p.is_empty())
                .collect()
        })
        .unwrap_or_default();

    let compiler_warnings = parse_compiler_warnings(cli.compiler_warnings.as_deref());
    let diagnostic_sources = parse_diagnostic_sources(cli.diagnostic_sources.as_deref());

    let options = RunOptions {
        workspace: workspace.clone(),
        ignore,
        fail_on_warnings: cli.fail_on_warnings,
        emit_overlay: cli.emit_overlay || cli.tsgo,
        tsconfig: cli.tsconfig,
        use_tsgo: cli.tsgo,
        compiler_warnings,
        diagnostic_sources,
        incremental: cli.incremental,
    };

    if cli.watch {
        let watch_opts = WatchOptions {
            clear_between_runs: !cli.preserve_watch_output,
            ..WatchOptions::default()
        };
        let workspace_for_print = workspace.clone();
        // `run_watch` blocks until the watcher channel disconnects (in
        // practice: SIGINT). Failure here only happens when the OS
        // notify backend can't be initialised.
        if let Err(err) = run_watch(options, watch_opts, |run_result| {
            print_run(run_result, &workspace_for_print, format);
        }) {
            eprintln!("svelte-check: watch mode failed to start: {err}");
            return ExitCode::from(2);
        }
        ExitCode::SUCCESS
    } else {
        let result = run(&options);
        print_run(&result, &workspace, format);
        ExitCode::from(result.exit_code(cli.fail_on_warnings) as u8)
    }
}

fn print_run(
    result: &rsvelte_core::svelte_check::runner::RunResult,
    workspace: &Path,
    format: OutputFormat,
) {
    let mut out = String::new();
    for diag in &result.diagnostics {
        write_diagnostic(&mut out, diag, workspace, format);
    }
    if matches!(format, OutputFormat::Human | OutputFormat::HumanVerbose) {
        write_summary(&mut out, &result.diagnostics, result.files_checked);
    }
    print!("{}", out);
}

fn parse_compiler_warnings(raw: Option<&str>) -> HashMap<String, WarningOverride> {
    let mut map = HashMap::new();
    let Some(raw) = raw else {
        return map;
    };
    for entry in raw.split(',') {
        let entry = entry.trim();
        if entry.is_empty() {
            continue;
        }
        let (code, level) = match entry.split_once(':') {
            Some(pair) => pair,
            None => continue,
        };
        let level = match level.trim() {
            "error" => WarningOverride::Error,
            "ignore" => WarningOverride::Ignore,
            _ => continue,
        };
        // Accept both hyphenated (`css-unused-selector`) and
        // underscored (`css_unused_selector`) codes — the JS reference
        // documents hyphens, the rsvelte compiler emits underscores.
        let normalised = code.trim().replace('-', "_");
        map.insert(normalised, level);
    }
    map
}

fn parse_diagnostic_sources(raw: Option<&str>) -> Option<HashSet<DiagnosticSource>> {
    let raw = raw?;
    let mut set = HashSet::new();
    for entry in raw.split(',') {
        let entry = entry.trim();
        if let Some(s) = DiagnosticSource::parse(entry) {
            set.insert(s);
        }
    }
    if set.is_empty() { None } else { Some(set) }
}
