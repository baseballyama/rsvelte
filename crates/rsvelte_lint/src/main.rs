//! `rsvelte-lint` — the CLI.
//!
//! Lints `.svelte` files (passed directly or discovered under directories),
//! merging compiler warnings/a11y (validator wrap) with native rules, and
//! prints diagnostics through the shared `svelte_check` writers (plus a local
//! SARIF writer) so the output matches `rsvelte check`.

use std::path::{Path, PathBuf};
use std::process::ExitCode;

use clap::Parser;
use rayon::prelude::*;
use rsvelte_core::svelte_check::diagnostic::{Diagnostic, DiagnosticSeverity};

use rsvelte_lint::rule::Severity;
use rsvelte_lint::{LintConfig, LintFormat, fix_source, lint_file, presets, render};

const VERSION: &str = env!("CARGO_PKG_VERSION");

#[derive(Parser, Debug)]
#[command(name = "rsvelte-lint", about = "Fast native Svelte linter", version = VERSION)]
struct Cli {
    /// Files or directories to lint. Directories are searched for `.svelte`.
    paths: Vec<PathBuf>,

    /// Output format: human | human-verbose | machine | machine-verbose | github-actions | sarif.
    #[arg(long, default_value = "human")]
    format: String,

    /// Path to a lint config (`rsvelte-lint.json`). Auto-discovered upward from
    /// the working directory when omitted.
    #[arg(long, value_name = "FILE")]
    config: Option<PathBuf>,

    /// Import `svelte/*` rule severities from an existing ESLint flat config.
    #[arg(long, value_name = "FILE")]
    config_from_eslint: Option<PathBuf>,

    /// Turn a rule off (repeatable), e.g. `--off svelte/require-each-key`.
    #[arg(long = "off", value_name = "RULE")]
    off: Vec<String>,

    /// Treat a rule as an error (repeatable).
    #[arg(long = "error", value_name = "RULE")]
    error: Vec<String>,

    /// Apply autofixes in place before reporting.
    #[arg(long)]
    fix: bool,

    /// Exit non-zero if warnings exceed this count.
    #[arg(long)]
    max_warnings: Option<usize>,

    /// Print the native rule set and exit.
    #[arg(long)]
    list_rules: bool,

    /// Print a flat-config snippet that disables the native-owned rules in
    /// ESLint (for coexistence), and exit.
    #[arg(long)]
    print_eslint_config: bool,
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

/// Walk up from `start` looking for a lint config file.
fn discover_config(start: &Path) -> Option<PathBuf> {
    const NAMES: &[&str] = &["rsvelte-lint.json", ".rsvelte-lintrc.json"];
    let mut dir = Some(start);
    while let Some(d) = dir {
        for name in NAMES {
            let candidate = d.join(name);
            if candidate.is_file() {
                return Some(candidate);
            }
        }
        dir = d.parent();
    }
    None
}

/// Resolve the effective config from file (explicit or discovered), the ESLint
/// importer, and the `--off`/`--error` CLI overrides.
fn build_config(cli: &Cli, workspace: &Path) -> anyhow::Result<LintConfig> {
    let config_path = cli.config.clone().or_else(|| discover_config(workspace));
    let mut cfg = match &config_path {
        Some(path) => {
            let text = std::fs::read_to_string(path)
                .map_err(|e| anyhow::anyhow!("failed to read {}: {e}", path.display()))?;
            LintConfig::from_json_str(&text)
                .map_err(|e| anyhow::anyhow!("invalid config {}: {e}", path.display()))?
        }
        None => LintConfig::recommended(),
    };

    if let Some(eslint_path) = &cli.config_from_eslint {
        let text = std::fs::read_to_string(eslint_path)
            .map_err(|e| anyhow::anyhow!("failed to read {}: {e}", eslint_path.display()))?;
        for (rule, severity) in rsvelte_lint::eslint_import::import_svelte_rules(&text) {
            cfg = cfg.with_override(rule, severity);
        }
    }

    for rule in &cli.off {
        cfg = cfg.with_override(rule.clone(), Severity::Off);
    }
    for rule in &cli.error {
        cfg = cfg.with_override(rule.clone(), Severity::Error);
    }
    Ok(cfg)
}

fn main() -> ExitCode {
    let cli = Cli::parse();

    if cli.list_rules {
        print!("{}", presets::list_rules());
        return ExitCode::SUCCESS;
    }
    if cli.print_eslint_config {
        println!("{}", presets::eslint_disable_config());
        return ExitCode::SUCCESS;
    }

    let format = match LintFormat::parse(&cli.format) {
        Some(f) => f,
        None => {
            eprintln!("error: unknown --format '{}'", cli.format);
            return ExitCode::from(2);
        }
    };

    let workspace = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));

    let config = match build_config(&cli, &workspace) {
        Ok(c) => c,
        Err(e) => {
            eprintln!("error: {e}");
            return ExitCode::from(2);
        }
    };

    if cli.paths.is_empty() {
        eprintln!("error: no input paths (try --help, --list-rules, or --print-eslint-config)");
        return ExitCode::from(2);
    }

    let mut files = collect_files(&cli.paths);
    if config.has_file_filters() {
        files.retain(|f| {
            let rel = f.strip_prefix(&workspace).unwrap_or(f);
            config.should_lint(&rel.to_string_lossy())
        });
    }

    if cli.fix {
        let fixed: usize = files.par_iter().map(|f| fix_one(f, &config)).sum();
        if fixed > 0 {
            eprintln!("rsvelte-lint: applied {fixed} fix(es)");
        }
    }

    // Lint files in parallel; each file is independent. A panic in the compiler
    // on one pathological file is isolated per file by `lint_file_safe` — but
    // `catch_unwind` only recovers when the binary UNWINDS. The shared
    // release/dist profiles set `panic = "abort"`, so distribution builds must
    // use `--profile dist-lint` (release + `panic = "unwind"`) for this
    // isolation to hold; under an aborting build a panic still ends the run.
    let per_file: Vec<Vec<Diagnostic>> = files
        .par_iter()
        .map(|f| lint_file_safe(f, &config))
        .collect();
    let all: Vec<Diagnostic> = per_file.into_iter().flatten().collect();

    print!("{}", render(&all, &workspace, files.len(), format, VERSION));

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

/// Lint a file, isolating any panic so a single pathological file can't abort
/// the whole run; the panic surfaces as a diagnostic instead. Effective only in
/// an unwinding build (see `--profile dist-lint`); a `panic = "abort"` build
/// cannot recover here.
fn lint_file_safe(file: &Path, config: &LintConfig) -> Vec<Diagnostic> {
    use std::panic::{AssertUnwindSafe, catch_unwind};
    match catch_unwind(AssertUnwindSafe(|| lint_file(file, config))) {
        Ok(Ok(diags)) => diags,
        Ok(Err(e)) => vec![read_error(file, &e)],
        Err(_) => vec![internal_error(file)],
    }
}

/// Fix a single file in place, returning the number of fixes applied. A panic
/// while fixing is swallowed (the file is left untouched) rather than aborting.
fn fix_one(file: &Path, config: &LintConfig) -> usize {
    use std::panic::{AssertUnwindSafe, catch_unwind};
    let Ok(source) = std::fs::read_to_string(file) else {
        return 0;
    };
    let Ok(res) = catch_unwind(AssertUnwindSafe(|| fix_source(&source, config))) else {
        return 0;
    };
    if res.applied > 0 && res.output != source {
        let _ = std::fs::write(file, &res.output);
    }
    res.applied
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

fn internal_error(file: &Path) -> Diagnostic {
    Diagnostic {
        file: file.to_path_buf(),
        severity: DiagnosticSeverity::Error,
        code: Some("lint-internal-error".into()),
        message: "internal error while linting this file (skipped)".into(),
        range: None,
        source: "svelte",
    }
}
