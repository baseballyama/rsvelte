//! `svelte-check` CLI binary — Wave 2 of the ecosystem port. Reports
//! Svelte-side diagnostics (compile errors + compiler warnings) plus
//! TypeScript type errors. Type-checking runs by default via `tsc`
//! (or `tsgo` with `--tsgo`); pass `--no-type-check` for Svelte-only.

// Use jemalloc as the global allocator for better multi-threaded
// performance. Defined per-bin rather than once in the lib because the lib
// is built as both rlib and cdylib, and a lib-level `#[global_allocator]`
// is duplicated across both outputs at link time — cargo issue
// rust-lang/cargo#6313.
#[cfg(all(
    feature = "mimalloc-alloc",
    not(feature = "napi"),
    not(target_arch = "wasm32"),
    not(target_os = "windows")
))]
#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;

#[cfg(all(
    feature = "jemalloc",
    not(feature = "mimalloc-alloc"),
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
    OutputFormat, RunOptions, Threshold, run,
    runner::{DiagnosticSource, WarningOverride},
    watch::{WatchOptions, run_watch},
    writers::write_diagnostic,
    writers::write_summary,
};

#[derive(Parser, Debug)]
#[command(
    name = "rsvelte-check",
    bin_name = "rsvelte-check",
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

    /// Keep the materialised `.tsx` shadow files + overlay tsconfig under
    /// `<workspace>/.svelte-check/` on disk (they are written internally
    /// for type-checking regardless). Useful for inspecting the overlay,
    /// or combined with `--no-type-check` to emit without compiling.
    #[arg(long = "emit-overlay", default_value_t = false)]
    emit_overlay: bool,

    /// Path to a tsconfig.json the overlay should `extends`. Optional —
    /// the overlay is self-contained otherwise.
    #[arg(long = "tsconfig")]
    tsconfig: Option<PathBuf>,

    /// Only check the Svelte files under the workspace and ignore any
    /// project tsconfig/jsconfig (no `--tsconfig` extends, no discovery).
    /// Mirrors the JS reference's `--no-tsconfig`.
    #[arg(long = "no-tsconfig", default_value_t = false)]
    no_tsconfig: bool,

    /// Path to a non-standard `svelte.config.*` / `vite.config.*` whose
    /// diagnostic-relevant `compilerOptions` (and `kit.files`) should be
    /// used instead of discovering a config under the workspace. Mirrors
    /// the JS reference's `--config`.
    #[arg(long = "config")]
    config: Option<PathBuf>,

    /// Prefer Microsoft's native `tsgo` over the stock `tsc` when
    /// type-checking the overlay. Without this flag type-checking still
    /// runs, using `tsc`. (`tsgo` falls back to `tsc` and vice-versa if
    /// the preferred binary isn't installed.) `--tsgo-experimental-api`
    /// is accepted as an alias — rsvelte has a single native tsgo
    /// backend, so the experimental in-process API has no separate mode.
    #[arg(
        long = "tsgo",
        alias = "tsgo-experimental-api",
        default_value_t = false
    )]
    tsgo: bool,

    /// Skip the TypeScript type-checking pass entirely and report only
    /// Svelte-side diagnostics (compile errors + compiler warnings).
    /// Type-checking is on by default.
    #[arg(long = "no-type-check", default_value_t = false)]
    no_type_check: bool,

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
    /// Mirrors `--preserveWatchOutput` in the JS reference / tsc. The
    /// hyphenated `--preserve-watch-output` is kept as an alias.
    #[arg(
        long = "preserveWatchOutput",
        alias = "preserve-watch-output",
        default_value_t = false
    )]
    preserve_watch_output: bool,

    /// Filter the diagnostics that are printed: `error` shows only
    /// errors, `warning` (the default) shows warnings and errors. Does
    /// not affect the error/warning counts or the exit code. Mirrors the
    /// JS reference's `--threshold`.
    #[arg(long = "threshold", default_value = "warning")]
    threshold: String,

    /// Force-enable color output. Accepted for JS-CLI compatibility;
    /// rsvelte-check does not currently colorize its output, so this is a
    /// no-op.
    #[arg(long = "color", default_value_t = false)]
    color: bool,

    /// Force-disable color output. Accepted for JS-CLI compatibility;
    /// no-op (rsvelte-check output is already un-colorized).
    #[arg(long = "no-color", default_value_t = false)]
    no_color: bool,
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

    // `--color` / `--no-color` are accepted for JS-CLI compatibility but
    // have no effect (output is already un-colorized).
    let _ = (cli.color, cli.no_color);

    let threshold = match Threshold::parse(&cli.threshold) {
        Some(t) => t,
        None => {
            eprintln!(
                "Invalid threshold \"{}\", using \"warning\" instead",
                cli.threshold
            );
            Threshold::default()
        }
    };

    // `--config` names an explicit config file; the JS reference errors
    // when the path doesn't exist rather than silently discovering one.
    if let Some(config) = cli.config.as_deref() {
        let abs = if config.is_absolute() {
            config.to_path_buf()
        } else {
            workspace.join(config)
        };
        if !abs.exists() {
            eprintln!("Could not find config file at {}", config.display());
            return ExitCode::from(2);
        }
    }

    // `--no-tsconfig` means "use no project tsconfig": ignore `--tsconfig`
    // and never extend/discover one. Mirrors the JS reference, where the
    // two are mutually exclusive.
    let tsconfig = if cli.no_tsconfig { None } else { cli.tsconfig };

    let compiler_warnings = parse_compiler_warnings(cli.compiler_warnings.as_deref());
    let diagnostic_sources = parse_diagnostic_sources(cli.diagnostic_sources.as_deref());

    // Type-checking is on by default; `--no-type-check` opts out. `--tsgo`
    // only selects which compiler backend is preferred (tsgo vs tsc).
    let type_check = !cli.no_type_check;
    let options = RunOptions {
        workspace: workspace.clone(),
        ignore,
        fail_on_warnings: cli.fail_on_warnings,
        emit_overlay: cli.emit_overlay,
        tsconfig,
        type_check,
        prefer_tsgo: cli.tsgo,
        compiler_warnings,
        diagnostic_sources,
        incremental: cli.incremental,
        config: cli.config.clone(),
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
            print_run(run_result, &workspace_for_print, format, threshold);
        }) {
            eprintln!("rsvelte-check: watch mode failed to start: {err}");
            return ExitCode::from(2);
        }
        ExitCode::SUCCESS
    } else {
        let result = run(&options);
        // Finding nothing is almost always a misconfigured workspace path, not
        // a clean project. Surface it on stderr (never stdout, so machine
        // formats stay parseable) so "checked nothing" can't masquerade as
        // "passed" (issue #718).
        if result.files_checked == 0 {
            eprintln!(
                "rsvelte-check: warning: no .svelte files found under {} — nothing was checked. \
                 Is the --workspace path correct?",
                workspace.display()
            );
        }
        print_run(&result, &workspace, format, threshold);
        ExitCode::from(result.exit_code(cli.fail_on_warnings) as u8)
    }
}

fn print_run(
    result: &rsvelte_core::svelte_check::runner::RunResult,
    workspace: &Path,
    format: OutputFormat,
    threshold: Threshold,
) {
    let mut out = String::new();
    for diag in &result.diagnostics {
        // The threshold filters only what is *printed*; the summary and
        // exit code are always computed from the full diagnostic set,
        // matching the JS reference.
        if !threshold.includes(diag.severity) {
            continue;
        }
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
