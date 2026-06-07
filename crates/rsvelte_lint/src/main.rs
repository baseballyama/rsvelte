//! `rsvelte-lint` — the Wave 1 CLI.
//!
//! Lints `.svelte` files (passed directly or discovered under directories),
//! merging compiler warnings/a11y (validator wrap) with native rules, and
//! prints diagnostics through the shared `svelte_check` writers so the output
//! matches `rsvelte check`.

use std::path::{Path, PathBuf};
use std::process::ExitCode;

use clap::Parser;
use rayon::prelude::*;
use rsvelte_core::svelte_check::diagnostic::{Diagnostic, DiagnosticSeverity};
use rsvelte_core::svelte_check::writers::{OutputFormat, write_diagnostic, write_summary};

use rsvelte_lint::rule::Severity;
use rsvelte_lint::{LintConfig, lint_file};

#[derive(Parser, Debug)]
#[command(name = "rsvelte-lint", about = "Fast native Svelte linter (Wave 1)")]
struct Cli {
    /// Files or directories to lint. Directories are searched for `.svelte`.
    #[arg(required = true)]
    paths: Vec<PathBuf>,

    /// Output format: human | human-verbose | machine | machine-verbose | github-actions.
    #[arg(long, default_value = "human")]
    format: String,

    /// Turn a rule off (repeatable), e.g. `--off svelte/require-each-key`.
    #[arg(long = "off", value_name = "RULE")]
    off: Vec<String>,

    /// Treat a rule as an error (repeatable).
    #[arg(long = "error", value_name = "RULE")]
    error: Vec<String>,

    /// Exit non-zero if warnings exceed this count.
    #[arg(long)]
    max_warnings: Option<usize>,
}

fn collect_files(paths: &[PathBuf]) -> Vec<PathBuf> {
    let mut files = Vec::new();
    for p in paths {
        if p.is_dir() {
            for entry in walkdir::WalkDir::new(p).into_iter().flatten() {
                let path = entry.path();
                if path.extension().is_some_and(|e| e == "svelte") {
                    files.push(path.to_path_buf());
                }
            }
        } else if p.extension().is_some_and(|e| e == "svelte") {
            files.push(p.clone());
        }
    }
    files.sort();
    files.dedup();
    files
}

fn build_config(cli: &Cli) -> LintConfig {
    let mut cfg = LintConfig::recommended();
    for rule in &cli.off {
        cfg = cfg.with_override(rule.clone(), Severity::Off);
    }
    for rule in &cli.error {
        cfg = cfg.with_override(rule.clone(), Severity::Error);
    }
    cfg
}

fn main() -> ExitCode {
    let cli = Cli::parse();

    let format = match OutputFormat::parse(&cli.format) {
        Some(f) => f,
        None => {
            eprintln!("error: unknown --format '{}'", cli.format);
            return ExitCode::from(2);
        }
    };

    let config = build_config(&cli);
    let workspace = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
    let files = collect_files(&cli.paths);

    // Lint files in parallel; each file is independent.
    let per_file: Vec<Vec<Diagnostic>> = files
        .par_iter()
        .map(|f| lint_file(f, &config).unwrap_or_else(|e| vec![read_error(f, &e)]))
        .collect();

    let all: Vec<Diagnostic> = per_file.into_iter().flatten().collect();

    let mut out = String::new();
    for d in &all {
        write_diagnostic(&mut out, d, &workspace, format);
    }
    write_summary(&mut out, &all, files.len());
    print!("{out}");

    let errors = all
        .iter()
        .filter(|d| d.severity == DiagnosticSeverity::Error)
        .count();
    let warnings = all
        .iter()
        .filter(|d| d.severity == DiagnosticSeverity::Warning)
        .count();

    let over_warn_budget = cli.max_warnings.is_some_and(|max| warnings > max);
    if errors > 0 || over_warn_budget {
        ExitCode::FAILURE
    } else {
        ExitCode::SUCCESS
    }
}

fn read_error(file: &Path, e: &std::io::Error) -> Diagnostic {
    Diagnostic {
        file: file.to_path_buf(),
        severity: DiagnosticSeverity::Error,
        code: Some("read-error".into()),
        message: format!("could not read file: {e}"),
        range: None,
        source: "svelte",
    }
}
