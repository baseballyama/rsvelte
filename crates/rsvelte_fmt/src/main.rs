//! `rsvelte-fmt` — single entry point for formatting a mixed JS/TS/Svelte
//! tree. `.svelte` files go through [`rsvelte_formatter`]; every other file
//! is delegated to a child `oxfmt` process. Both pipelines run in parallel.

use std::ffi::OsStr;
use std::io::{self, Read, Write};
use std::path::{Path, PathBuf};
use std::process::{Command, ExitCode, Stdio};

use anyhow::{Context, Result, anyhow};
use clap::Parser;
use oxc_formatter::JsFormatOptions;
use oxc_formatter_core::{IndentStyle, IndentWidth, LineWidth};
use rayon::prelude::*;
use rsvelte_formatter::{FormatOptions, format};

/// rsvelte-fmt: fast Svelte + JS/TS/CSS formatter.
#[derive(Debug, Parser)]
#[command(version, about, long_about = None)]
struct Cli {
    /// Files or directories to format. Directories are walked recursively
    /// for `.svelte`, `.ts`, `.tsx`, `.js`, `.jsx`, `.cjs`, `.mjs`,
    /// `.css`, and `.json` files.
    paths: Vec<PathBuf>,

    /// Write formatted output back to source files. Default when paths
    /// are given. Implied for directory inputs.
    #[arg(long)]
    write: bool,

    /// Check whether files are formatted. Exits non-zero if any file
    /// would be changed. Mutually exclusive with `--write`.
    #[arg(long, conflicts_with = "write")]
    check: bool,

    /// Format stdin and write the result to stdout. Use `--stdin-filepath`
    /// to tell the dispatcher which engine to use based on the filename.
    #[arg(long)]
    stdin: bool,

    /// Filename associated with the source on stdin (e.g.
    /// `--stdin-filepath src/App.svelte`). Required with `--stdin`.
    #[arg(long, value_name = "PATH")]
    stdin_filepath: Option<PathBuf>,

    /// Maximum line width before the formatter tries to break.
    #[arg(long, value_name = "N", default_value_t = 80)]
    print_width: u16,

    /// Number of spaces per indent level. Ignored when `--use-tabs`.
    #[arg(long, value_name = "N", default_value_t = 2)]
    tab_width: u8,

    /// Indent with tabs instead of spaces.
    #[arg(long)]
    use_tabs: bool,

    /// Path to the `oxfmt` binary. Defaults to `oxfmt` on `$PATH`.
    #[arg(long, value_name = "PATH", default_value = "oxfmt")]
    oxfmt_bin: PathBuf,
}

const SVELTE_EXT: &str = "svelte";

/// File extensions that get delegated to `oxfmt`. Kept narrow on purpose
/// so we don't accidentally feed binary files into the formatter.
const OXFMT_EXTS: &[&str] = &["ts", "tsx", "js", "jsx", "cjs", "mjs", "json", "css"];

fn main() -> ExitCode {
    match run() {
        Ok(code) => code,
        Err(err) => {
            eprintln!("rsvelte-fmt: error: {err:#}");
            ExitCode::from(2)
        }
    }
}

fn run() -> Result<ExitCode> {
    let cli = Cli::parse();
    let options = build_format_options(&cli);

    if cli.stdin {
        return run_stdin(&cli, &options);
    }

    if cli.paths.is_empty() {
        return Err(anyhow!(
            "no paths given — pass files/directories or use --stdin --stdin-filepath PATH"
        ));
    }

    let (svelte, others) = partition_files(&cli.paths)?;

    let mode = if cli.check { Mode::Check } else { Mode::Write };

    // Run both pipelines in parallel — oxfmt subprocess will overlap
    // with the in-process Svelte formatter.
    let (svelte_result, oxfmt_result) = rayon::join(
        || run_svelte_files(&svelte, &options, mode),
        || run_oxfmt(&others, &cli.oxfmt_bin, mode),
    );

    let svelte_status = svelte_result?;
    let oxfmt_status = oxfmt_result?;
    print_summary(&svelte_status, &oxfmt_status, mode);
    Ok(combine(svelte_status, oxfmt_status, mode))
}

fn print_summary(svelte: &PipelineStatus, oxfmt: &PipelineStatus, mode: Mode) {
    let total = svelte.files_total + oxfmt.files_total;
    let changed = svelte.files_changed + oxfmt.files_changed;
    let verb = match mode {
        Mode::Write => "formatted",
        Mode::Check => "would reformat",
    };
    eprintln!("rsvelte-fmt: {verb} {changed} / {total} files");
}

#[derive(Debug, Clone, Copy)]
enum Mode {
    Write,
    Check,
}

#[derive(Debug, Default)]
struct PipelineStatus {
    files_changed: usize,
    files_total: usize,
    had_errors: bool,
}

fn combine(a: PipelineStatus, b: PipelineStatus, mode: Mode) -> ExitCode {
    if a.had_errors || b.had_errors {
        return ExitCode::from(2);
    }
    match mode {
        // Write mode applies the changes — exit 0 on success regardless
        // of how many files were touched.
        Mode::Write => ExitCode::SUCCESS,
        // Check mode reports "would change" — any change means failure.
        Mode::Check => {
            if a.files_changed + b.files_changed > 0 {
                ExitCode::from(1)
            } else {
                ExitCode::SUCCESS
            }
        }
    }
}

fn build_format_options(cli: &Cli) -> FormatOptions {
    let indent_style = if cli.use_tabs {
        IndentStyle::Tab
    } else {
        IndentStyle::Space
    };
    let indent_width = IndentWidth::try_from(cli.tab_width).unwrap_or(IndentWidth::default());
    let line_width = LineWidth::try_from(cli.print_width).unwrap_or(LineWidth::default());

    FormatOptions {
        js: JsFormatOptions {
            indent_style,
            indent_width,
            line_width,
            ..JsFormatOptions::new()
        },
    }
}

// ─── stdin path ─────────────────────────────────────────────────────────

fn run_stdin(cli: &Cli, options: &FormatOptions) -> Result<ExitCode> {
    let filepath = cli
        .stdin_filepath
        .as_ref()
        .ok_or_else(|| anyhow!("--stdin requires --stdin-filepath PATH"))?;

    let mut source = String::new();
    io::stdin()
        .read_to_string(&mut source)
        .context("failed to read stdin")?;

    if is_svelte(filepath) {
        let formatted =
            format(&source, options).map_err(|e| anyhow!("rsvelte_formatter error: {e}"))?;
        if cli.check {
            return Ok(if formatted == source {
                ExitCode::SUCCESS
            } else {
                ExitCode::from(1)
            });
        }
        io::stdout()
            .write_all(formatted.as_bytes())
            .context("failed to write stdout")?;
        Ok(ExitCode::SUCCESS)
    } else {
        // Pass through to oxfmt via stdin.
        oxfmt_stdin(&cli.oxfmt_bin, filepath, &source, cli.check)
    }
}

fn oxfmt_stdin(oxfmt: &Path, path: &Path, source: &str, check: bool) -> Result<ExitCode> {
    let mut cmd = Command::new(oxfmt);
    cmd.arg("--stdin");
    cmd.arg("--stdin-filepath").arg(path);
    if check {
        cmd.arg("--check");
    }
    cmd.stdin(Stdio::piped())
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit());
    let mut child = cmd.spawn().with_context(|| {
        format!(
            "failed to spawn `{}` — is oxfmt installed?",
            oxfmt.display()
        )
    })?;
    if let Some(mut stdin) = child.stdin.take() {
        stdin.write_all(source.as_bytes())?;
    }
    let status = child.wait()?;
    Ok(ExitCode::from(status.code().unwrap_or(1) as u8))
}

// ─── file walking ───────────────────────────────────────────────────────

fn partition_files(roots: &[PathBuf]) -> Result<(Vec<PathBuf>, Vec<PathBuf>)> {
    let mut svelte = Vec::new();
    let mut others = Vec::new();
    for root in roots {
        for entry in walkdir::WalkDir::new(root)
            .follow_links(false)
            .into_iter()
            .filter_entry(|e| !is_hidden(e.path()) && !is_ignored_dir(e.path()))
        {
            let entry = entry.context("walking input tree")?;
            if !entry.file_type().is_file() {
                continue;
            }
            let path = entry.into_path();
            match path.extension().and_then(OsStr::to_str) {
                Some(SVELTE_EXT) => svelte.push(path),
                Some(ext) if OXFMT_EXTS.contains(&ext) => others.push(path),
                _ => {}
            }
        }
    }
    Ok((svelte, others))
}

fn is_hidden(p: &Path) -> bool {
    p.file_name()
        .and_then(OsStr::to_str)
        .is_some_and(|n| n.starts_with('.') && n != "." && n != "..")
}

fn is_ignored_dir(p: &Path) -> bool {
    matches!(
        p.file_name().and_then(OsStr::to_str),
        Some("node_modules" | "target" | "dist" | "build")
    )
}

fn is_svelte(p: &Path) -> bool {
    p.extension().and_then(OsStr::to_str) == Some(SVELTE_EXT)
}

// ─── Svelte pipeline ────────────────────────────────────────────────────

fn run_svelte_files(
    files: &[PathBuf],
    options: &FormatOptions,
    mode: Mode,
) -> Result<PipelineStatus> {
    let results: Vec<_> = files
        .par_iter()
        .map(|path| format_one_svelte(path, options, mode))
        .collect();

    let mut status = PipelineStatus {
        files_total: results.len(),
        ..PipelineStatus::default()
    };

    for (path, outcome) in files.iter().zip(results) {
        match outcome {
            Ok(changed) => {
                if changed {
                    status.files_changed += 1;
                }
            }
            Err(e) => {
                eprintln!("rsvelte-fmt: {}: {e:#}", path.display());
                status.had_errors = true;
            }
        }
    }
    Ok(status)
}

fn format_one_svelte(path: &Path, options: &FormatOptions, mode: Mode) -> Result<bool> {
    let source =
        std::fs::read_to_string(path).with_context(|| format!("reading {}", path.display()))?;
    let formatted = format(&source, options)
        .map_err(|e| anyhow!("{}: rsvelte_formatter error: {e}", path.display()))?;
    if formatted == source {
        return Ok(false);
    }
    match mode {
        Mode::Write => {
            std::fs::write(path, &formatted)
                .with_context(|| format!("writing {}", path.display()))?;
            Ok(true)
        }
        Mode::Check => {
            println!("would format {}", path.display());
            Ok(true)
        }
    }
}

// ─── oxfmt delegation ───────────────────────────────────────────────────

fn run_oxfmt(files: &[PathBuf], oxfmt: &Path, mode: Mode) -> Result<PipelineStatus> {
    if files.is_empty() {
        return Ok(PipelineStatus::default());
    }

    let mut cmd = Command::new(oxfmt);
    match mode {
        Mode::Write => {} // oxfmt's default for paths is in-place write
        Mode::Check => {
            cmd.arg("--check");
        }
    }
    cmd.args(files);
    cmd.stdout(Stdio::inherit()).stderr(Stdio::inherit());

    let status = cmd
        .status()
        .with_context(|| format!("failed to run `{}` — is oxfmt installed?", oxfmt.display()))?;

    Ok(PipelineStatus {
        files_total: files.len(),
        files_changed: if status.success() { 0 } else { files.len() },
        had_errors: status.code().is_none_or(|c| c > 1),
    })
}
