//! `rsvelte-fmt` — single entry point for formatting a mixed JS/TS/Svelte
//! tree. `.svelte` files go through [`rsvelte_formatter`]; every other file
//! is delegated to a child `oxfmt` process. Both pipelines run in parallel.

use std::ffi::OsStr;
use std::io::{self, Read, Write};
use std::path::{Path, PathBuf};
use std::process::{Command, ExitCode, Stdio};
use std::sync::Arc;

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

/// Build a `Command` that runs `oxfmt`.
///
/// The npm `@rsvelte/fmt` launcher resolves the consumer's `oxfmt/bin/oxfmt`
/// Node launcher (an extensionless script with shebang `#!/usr/bin/env node`)
/// and passes it via `--oxfmt-bin`, setting `RSVELTE_FMT_NODE` to the exact
/// interpreter. Such a script isn't directly executable on Windows, so when
/// `RSVELTE_FMT_NODE` is set we run the oxfmt path through that `node`. As a
/// convenience for `cargo run` users who point `--oxfmt-bin` at a `.js` /
/// `.cjs` / `.mjs` launcher without setting the env var, we also fall back to
/// `node` on `$PATH` in that case. A plain native binary (the default `oxfmt`
/// on `$PATH`, or any user-supplied path) is run directly.
fn oxfmt_command(oxfmt: &Path) -> Command {
    let node_env = std::env::var_os("RSVELTE_FMT_NODE").filter(|v| !v.is_empty());
    let is_js_ext = matches!(
        oxfmt.extension().and_then(OsStr::to_str),
        Some("js" | "cjs" | "mjs")
    );
    if node_env.is_some() || is_js_ext {
        let node = node_env
            .map(PathBuf::from)
            .unwrap_or_else(|| PathBuf::from("node"));
        let mut cmd = Command::new(node);
        cmd.arg(oxfmt);
        cmd
    } else {
        Command::new(oxfmt)
    }
}

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
        || run_svelte_files(&svelte, &options, &cli.oxfmt_bin, mode),
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
        style_formatter: Some(make_oxfmt_style_formatter(cli.oxfmt_bin.clone())),
        // `format` derives this per-document from `<script lang="ts">`.
        typescript: false,
    }
}

/// Build the callback that runs `oxfmt --stdin-filepath inline.<lang>`
/// for every `<style>` body inside a `.svelte` file.
/// This way CSS / SCSS / Less inside Svelte components are formatted
/// by the same engine that handles standalone `.css` files.
fn make_oxfmt_style_formatter(oxfmt: PathBuf) -> rsvelte_formatter::StyleFormatter {
    Arc::new(move |body: &str, lang: &str| -> Result<String, String> {
        let filename = format!("inline.{}", oxfmt_ext(lang));
        // oxfmt reads stdin implicitly when `--stdin-filepath` is given with no
        // path arguments. It has no `--stdin` flag and errors if one is passed
        // (#680), so feed the body on stdin and pass only `--stdin-filepath`.
        let mut child = oxfmt_command(&oxfmt)
            .arg("--stdin-filepath")
            .arg(&filename)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| format!("spawn `{}`: {e}", oxfmt.display()))?;
        if let Some(mut stdin) = child.stdin.take() {
            stdin
                .write_all(body.as_bytes())
                .map_err(|e| format!("write stdin: {e}"))?;
        }
        let out = child.wait_with_output().map_err(|e| format!("wait: {e}"))?;
        if !out.status.success() {
            return Err(format!(
                "oxfmt for {filename} exited with {:?}: {}",
                out.status.code(),
                String::from_utf8_lossy(&out.stderr)
            ));
        }
        String::from_utf8(out.stdout).map_err(|e| format!("oxfmt produced invalid utf-8: {e}"))
    })
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
    let mut cmd = oxfmt_command(oxfmt);
    // oxfmt reads stdin implicitly given `--stdin-filepath`; passing `--stdin`
    // is rejected (#680).
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

/// A `<style>` body captured during pass 1, to be formatted in the
/// single batched `oxfmt` call instead of one spawn per block.
struct CollectedStyle {
    css: String,
    lang: String,
}

/// Result of pass 1 for a single `.svelte` file.
struct Pass1 {
    path: PathBuf,
    source: String,
    /// `Ok((formatted_with_placeholders, styles))` or the format error.
    outcome: std::result::Result<(String, Vec<CollectedStyle>), String>,
}

/// Placeholder spliced into the output in place of each `<style>` body
/// during pass 1; replaced with the batched-`oxfmt` output in pass 2.
/// Wrapped in NUL bytes, which never occur in `.svelte` source or CSS, so
/// the substitution can't collide with real content.
fn style_placeholder(local_idx: usize) -> String {
    format!("\u{0}RSVELTE_FMT_STYLE_{local_idx}\u{0}")
}

/// Format every `.svelte` file, batching all their `<style>` bodies into a
/// single `oxfmt` invocation.
///
/// The naive path spawns `oxfmt` once per `<style>` block — and since the
/// consumer's `oxfmt` is a Node launcher, every spawn pays a fresh Node
/// cold start (~26ms measured), which dominates wall-clock on real trees.
/// Instead: pass 1 formats each file in parallel with a *collecting* style
/// callback that records the CSS and returns a placeholder; one batched
/// `oxfmt` call formats them all; pass 2 substitutes the results back.
fn run_svelte_files(
    files: &[PathBuf],
    options: &FormatOptions,
    oxfmt: &Path,
    mode: Mode,
) -> Result<PipelineStatus> {
    // ── Pass 1: format in parallel, collecting <style> bodies ──
    let pass1: Vec<Pass1> = files
        .par_iter()
        .map(|path| format_collecting(path, options))
        .collect();

    // ── Flatten collected styles across all files, keyed by (file, local) ──
    let mut slot_css: Vec<(&str, &str)> = Vec::new(); // (css, lang) in batch order
    let mut slot_owner: Vec<(usize, usize)> = Vec::new(); // (file_idx, local_idx)
    for (fi, p1) in pass1.iter().enumerate() {
        if let Ok((_, styles)) = &p1.outcome {
            for (li, st) in styles.iter().enumerate() {
                slot_css.push((&st.css, &st.lang));
                slot_owner.push((fi, li));
            }
        }
    }

    // ── Batch: one oxfmt call for every <style> body ──
    let formatted_css =
        batch_format_styles(oxfmt, &slot_css).context("formatting <style> blocks via oxfmt")?;

    // file_idx → (local_idx → formatted css)
    let mut per_file: Vec<Vec<String>> = vec![Vec::new(); pass1.len()];
    for ((fi, li), css) in slot_owner.into_iter().zip(formatted_css) {
        let v = &mut per_file[fi];
        if v.len() <= li {
            v.resize(li + 1, String::new());
        }
        v[li] = css;
    }

    // ── Pass 2: substitute placeholders, then write / check ──
    let mut status = PipelineStatus {
        files_total: pass1.len(),
        ..PipelineStatus::default()
    };
    for (fi, p1) in pass1.into_iter().enumerate() {
        let (mut out, styles) = match p1.outcome {
            Ok(v) => v,
            Err(e) => {
                eprintln!("rsvelte-fmt: {}: {e}", p1.path.display());
                status.had_errors = true;
                continue;
            }
        };
        for li in 0..styles.len() {
            let css = per_file[fi].get(li).cloned().unwrap_or_default();
            out = out.replace(&style_placeholder(li), &css);
        }
        match apply_output(&p1.path, &p1.source, &out, mode) {
            Ok(true) => status.files_changed += 1,
            Ok(false) => {}
            Err(e) => {
                eprintln!("rsvelte-fmt: {}: {e:#}", p1.path.display());
                status.had_errors = true;
            }
        }
    }
    Ok(status)
}

/// Pass 1 for one file: read it and format with a style callback that
/// records each `<style>` body and returns a placeholder.
fn format_collecting(path: &Path, options: &FormatOptions) -> Pass1 {
    let source = match std::fs::read_to_string(path) {
        Ok(s) => s,
        Err(e) => {
            return Pass1 {
                path: path.to_path_buf(),
                source: String::new(),
                outcome: Err(format!("reading {}: {e}", path.display())),
            };
        }
    };

    let styles: Arc<std::sync::Mutex<Vec<CollectedStyle>>> = Arc::default();
    let sink = styles.clone();
    let mut opts = options.clone();
    opts.style_formatter = Some(Arc::new(move |body: &str, lang: &str| {
        let mut v = sink.lock().expect("style sink poisoned");
        let idx = v.len();
        v.push(CollectedStyle {
            css: body.to_string(),
            lang: lang.to_string(),
        });
        Ok(style_placeholder(idx))
    }));

    let outcome = match format(&source, &opts) {
        Ok(formatted) => {
            drop(opts); // release the sink Arc so we can unwrap it
            let styles = Arc::try_unwrap(styles)
                .map(|m| m.into_inner().expect("style sink poisoned"))
                .unwrap_or_else(|arc| arc.lock().expect("style sink poisoned").drain(..).collect());
            Ok((formatted, styles))
        }
        Err(e) => Err(format!("rsvelte_formatter error: {e}")),
    };

    Pass1 {
        path: path.to_path_buf(),
        source,
        outcome,
    }
}

/// Format every collected `<style>` body in a single `oxfmt` invocation by
/// staging each into a temp file and running `oxfmt <files...>` (in-place),
/// then reading them back. Returns the formatted CSS in input order.
fn batch_format_styles(oxfmt: &Path, styles: &[(&str, &str)]) -> Result<Vec<String>> {
    if styles.is_empty() {
        return Ok(Vec::new());
    }

    let dir = std::env::temp_dir().join(format!("rsvelte-fmt-styles-{}", std::process::id()));
    std::fs::create_dir_all(&dir)
        .with_context(|| format!("creating temp dir {}", dir.display()))?;

    let paths: Vec<PathBuf> = styles
        .iter()
        .enumerate()
        .map(|(i, (css, lang))| {
            let p = dir.join(format!("s{i}.{}", oxfmt_ext(lang)));
            std::fs::write(&p, css.as_bytes())
                .with_context(|| format!("writing {}", p.display()))?;
            Ok(p)
        })
        .collect::<Result<_>>()?;

    let out = oxfmt_command(oxfmt)
        .args(&paths)
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .output()
        .with_context(|| format!("running `{}` — is oxfmt installed?", oxfmt.display()))?;

    // Read back regardless of exit status: a CSS body oxfmt couldn't parse
    // is left unchanged on disk, so it round-trips as the original body.
    let results: Vec<String> = paths
        .iter()
        .map(|p| std::fs::read_to_string(p).with_context(|| format!("reading {}", p.display())))
        .collect::<Result<_>>()?;

    let _ = std::fs::remove_dir_all(&dir);

    if !out.status.success() {
        eprintln!(
            "rsvelte-fmt: oxfmt reported errors while formatting <style> blocks:\n{}",
            String::from_utf8_lossy(&out.stderr).trim_end()
        );
    }
    Ok(results)
}

/// Map a `<style lang="...">` value to the file extension oxfmt uses to
/// pick a parser. Shared with the stdin path's per-block formatter.
fn oxfmt_ext(lang: &str) -> &'static str {
    match lang {
        "scss" => "scss",
        "less" => "less",
        _ => "css",
    }
}

/// Write `formatted` back to `path` (write mode) or report it (check mode).
/// Returns whether the file would change.
fn apply_output(path: &Path, source: &str, formatted: &str, mode: Mode) -> Result<bool> {
    if formatted == source {
        return Ok(false);
    }
    match mode {
        Mode::Write => {
            std::fs::write(path, formatted)
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

    let mut cmd = oxfmt_command(oxfmt);
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
