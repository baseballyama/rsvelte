//! `svelte-check` CLI binary — Wave 2 of the ecosystem port. v0.1
//! covers Svelte-side diagnostics only (compile errors + compiler
//! warnings). tsgo integration is the next milestone.

use std::path::PathBuf;
use std::process::ExitCode;

use clap::Parser;
use svelte_compiler_rust::svelte_check::{
    OutputFormat, RunOptions, run, writers::write_diagnostic, writers::write_summary,
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

    /// Output format: human, human-verbose, machine, machine-verbose.
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

    let options = RunOptions {
        workspace: workspace.clone(),
        ignore,
        fail_on_warnings: cli.fail_on_warnings,
        emit_overlay: cli.emit_overlay,
        tsconfig: cli.tsconfig,
    };

    let result = run(&options);

    let mut out = String::new();
    for diag in &result.diagnostics {
        write_diagnostic(&mut out, diag, &workspace, format);
    }
    if matches!(format, OutputFormat::Human | OutputFormat::HumanVerbose) {
        write_summary(&mut out, &result.diagnostics, result.files_checked);
    }
    print!("{}", out);

    ExitCode::from(result.exit_code(cli.fail_on_warnings) as u8)
}
