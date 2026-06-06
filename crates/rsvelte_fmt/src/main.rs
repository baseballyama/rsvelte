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

mod config;
use config::OxfmtConfig;

/// rsvelte-fmt: fast Svelte + JS/TS/CSS formatter.
#[derive(Debug, Parser)]
#[command(version, about, long_about = None)]
struct Cli {
    /// Files or directories to format. `.svelte` files are formatted in
    /// process; every other path is delegated to `oxfmt`, so directories cover
    /// the full oxfmt-supported set (`.ts`/`.js`/`.css`/`.json` and also
    /// `.md`/`.yaml`/`.toml`/`.html`, etc.) — the same files `oxfmt .` would
    /// format. See #694.
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

    /// Maximum line width before the formatter tries to break. Overrides
    /// `printWidth` from `.oxfmtrc`; defaults to 80 when neither is set.
    #[arg(long, value_name = "N")]
    print_width: Option<u16>,

    /// Number of spaces per indent level. Ignored when `--use-tabs`. Overrides
    /// `tabWidth` from `.oxfmtrc`; defaults to 2 when neither is set.
    #[arg(long, value_name = "N")]
    tab_width: Option<u8>,

    /// Indent with tabs instead of spaces. When omitted, `useTabs` from
    /// `.oxfmtrc` applies (if any), else spaces.
    #[arg(long)]
    use_tabs: bool,

    /// Path to an `.oxfmtrc` config file. When omitted, the nearest
    /// `.oxfmtrc.json` / `.oxfmtrc.jsonc` is discovered upward from the working
    /// directory (matching oxfmt). The resolved config drives inline
    /// `<script>` / `<style>` formatting so embedded blocks match standalone
    /// files (quote style, print width, …).
    #[arg(short = 'c', long, value_name = "PATH")]
    config: Option<PathBuf>,

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

/// oxfmt exclude pattern that keeps `.svelte` files out of the delegated pass —
/// those are handled in-process by `rsvelte_formatter`. Applies to directory
/// walks and to any explicitly-passed `.svelte` path.
const OXFMT_EXCLUDE_SVELTE: &str = "!**/*.svelte";

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

    // Resolve the project's `.oxfmtrc` once. Standalone files delegated to
    // `oxfmt` discover it themselves; we resolve it here so inline `<script>`
    // (formatted in-process) and inline `<style>` (staged in a temp dir) honor
    // the same settings. Discovery starts from `--stdin-filepath`'s directory
    // in stdin mode, else the working directory — matching oxfmt.
    let cwd = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
    let config_start = cli
        .stdin_filepath
        .as_deref()
        .filter(|_| cli.stdin)
        .map(|p| p.to_path_buf())
        .unwrap_or_else(|| cwd.clone());
    let cfg = OxfmtConfig::resolve(cli.config.as_deref(), &config_start);

    let options = build_format_options(&cli, &cfg);

    if cli.stdin {
        return run_stdin(&cli, &options, &cfg);
    }

    if cli.paths.is_empty() {
        return Err(anyhow!(
            "no paths given — pass files/directories or use --stdin --stdin-filepath PATH"
        ));
    }

    let (svelte, oxfmt_paths) = partition_files(&cli.paths)?;

    let mode = if cli.check { Mode::Check } else { Mode::Write };

    // Run both pipelines in parallel — oxfmt subprocess will overlap
    // with the in-process Svelte formatter.
    let (svelte_result, oxfmt_result) = rayon::join(
        || run_svelte_files(&svelte, &options, &cli.oxfmt_bin, &cfg, mode),
        || run_oxfmt(&oxfmt_paths, &cli.oxfmt_bin, mode),
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

/// Build the [`FormatOptions`] for the in-process Svelte formatter, layering
/// the resolved `.oxfmtrc` under any explicit CLI flags. Precedence for the
/// keys that exist in both places (`--print-width`/`--tab-width`/`--use-tabs`):
/// CLI flag > `.oxfmtrc` > built-in default. Keys with no CLI equivalent
/// (`singleQuote`, `semi`, `trailingComma`, …) come straight from `.oxfmtrc`.
fn build_format_options(cli: &Cli, cfg: &OxfmtConfig) -> FormatOptions {
    let use_tabs = cli.use_tabs || cfg.use_tabs.unwrap_or(false);
    let indent_style = if use_tabs {
        IndentStyle::Tab
    } else {
        IndentStyle::Space
    };
    let tab_width = cli.tab_width.or(cfg.tab_width).unwrap_or(2);
    let print_width = cli.print_width.or(cfg.print_width).unwrap_or(80);
    let indent_width = IndentWidth::try_from(tab_width).unwrap_or(IndentWidth::default());
    let line_width = LineWidth::try_from(print_width).unwrap_or(LineWidth::default());

    let mut js = JsFormatOptions {
        indent_style,
        indent_width,
        line_width,
        ..JsFormatOptions::new()
    };
    // Layer the remaining `.oxfmtrc` JS keys (quotes, semicolons, …) so inline
    // `<script>` blocks match standalone files. See #693.
    cfg.apply_js(&mut js);

    FormatOptions {
        js,
        style_formatter: Some(make_oxfmt_style_formatter(
            cli.oxfmt_bin.clone(),
            cfg.path.clone(),
        )),
        // `format` derives this per-document from `<script lang="ts">`.
        typescript: false,
    }
}

/// Build the callback that runs `oxfmt --stdin-filepath inline.<lang>`
/// for every `<style>` body inside a `.svelte` file.
/// This way CSS / SCSS / Less inside Svelte components are formatted
/// by the same engine that handles standalone `.css` files.
fn make_oxfmt_style_formatter(
    oxfmt: PathBuf,
    config: Option<PathBuf>,
) -> rsvelte_formatter::StyleFormatter {
    Arc::new(move |body: &str, lang: &str| -> Result<String, String> {
        let filename = format!("inline.{}", oxfmt_ext(lang));
        // oxfmt reads stdin implicitly when `--stdin-filepath` is given with no
        // path arguments. It has no `--stdin` flag and errors if one is passed
        // (#680), so feed the body on stdin and pass only `--stdin-filepath`.
        let mut cmd = oxfmt_command(&oxfmt);
        // Force the resolved project config so inline `<style>` settings match
        // standalone files even though oxfmt's own cwd discovery would apply
        // here too — explicit is harmless and keeps the path consistent with
        // the temp-dir batch path. See #693.
        if let Some(c) = &config {
            cmd.arg("-c").arg(c);
        }
        let mut child = cmd
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

fn run_stdin(cli: &Cli, options: &FormatOptions, cfg: &OxfmtConfig) -> Result<ExitCode> {
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
        oxfmt_stdin(
            &cli.oxfmt_bin,
            cfg.path.as_deref(),
            filepath,
            &source,
            cli.check,
        )
    }
}

fn oxfmt_stdin(
    oxfmt: &Path,
    config: Option<&Path>,
    path: &Path,
    source: &str,
    check: bool,
) -> Result<ExitCode> {
    let mut cmd = oxfmt_command(oxfmt);
    // oxfmt reads stdin implicitly given `--stdin-filepath`; passing `--stdin`
    // is rejected (#680). Forward an explicit `--config` when the user set one
    // so stdin formatting matches the rest of the project; otherwise oxfmt
    // discovers `.oxfmtrc` from cwd on its own.
    if let Some(c) = config {
        cmd.arg("-c").arg(c);
    }
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

/// Split the user's inputs into the in-process Svelte pass and the delegated
/// `oxfmt` pass.
///
/// `.svelte` files are enumerated for the in-process formatter by walking every
/// directory input (plus any explicit `.svelte` file arguments). Everything else
/// is handed to `oxfmt`: directory inputs go through verbatim so `oxfmt` walks
/// them with its full supported extension set (`.md`/`.yaml`/`.toml`/`.html`,
/// …) — the same coverage as `oxfmt .` — while a `!**/*.svelte` exclude (added
/// in [`run_oxfmt`]) keeps the Svelte files for us. Non-`.svelte` file
/// arguments are passed straight through. See #694.
fn partition_files(roots: &[PathBuf]) -> Result<(Vec<PathBuf>, Vec<PathBuf>)> {
    let mut svelte = Vec::new();
    let mut oxfmt_paths = Vec::new();
    for root in roots {
        let meta = std::fs::metadata(root)
            .with_context(|| format!("reading {} — no such file or directory", root.display()))?;
        if meta.is_dir() {
            // Enumerate `.svelte` files ourselves; oxfmt walks the rest.
            for entry in walkdir::WalkDir::new(root)
                .follow_links(false)
                .into_iter()
                .filter_entry(|e| !is_hidden(e.path()) && !is_ignored_dir(e.path()))
            {
                let entry = entry.context("walking input tree")?;
                if entry.file_type().is_file() && is_svelte(entry.path()) {
                    svelte.push(entry.into_path());
                }
            }
            oxfmt_paths.push(root.clone());
        } else if is_svelte(root) {
            svelte.push(root.clone());
        } else {
            oxfmt_paths.push(root.clone());
        }
    }
    Ok((svelte, oxfmt_paths))
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
    cfg: &OxfmtConfig,
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
    let formatted_css = batch_format_styles(oxfmt, cfg.path.as_deref(), &slot_css)
        .context("formatting <style> blocks via oxfmt")?;

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
fn batch_format_styles(
    oxfmt: &Path,
    config: Option<&Path>,
    styles: &[(&str, &str)],
) -> Result<Vec<String>> {
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

    let mut cmd = oxfmt_command(oxfmt);
    // The temp files live in the system temp dir, where oxfmt's own upward
    // config discovery can't reach the project's `.oxfmtrc`. Force it so inline
    // `<style>` blocks are formatted with the same settings as standalone CSS.
    // See #693.
    if let Some(c) = config {
        cmd.arg("-c").arg(c);
    }
    let out = cmd
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

/// Delegate every non-`.svelte` path to a single `oxfmt` invocation.
///
/// `paths` are the user's directory / file inputs verbatim; a `!**/*.svelte`
/// exclude keeps Svelte files for the in-process pass, and
/// `--no-error-on-unmatched-pattern` makes a tree with only `.svelte` files a
/// clean no-op rather than an error. oxfmt's informational summary
/// ("Finished … on N files", "Format issues found in above N files") goes to
/// stdout; we capture it to recover file counts for our own summary, then
/// forward it. Warnings/errors on stderr stay inherited.
fn run_oxfmt(paths: &[PathBuf], oxfmt: &Path, mode: Mode) -> Result<PipelineStatus> {
    if paths.is_empty() {
        return Ok(PipelineStatus::default());
    }

    let mut cmd = oxfmt_command(oxfmt);
    match mode {
        Mode::Write => {} // oxfmt's default for paths is in-place write
        Mode::Check => {
            cmd.arg("--check");
        }
    }
    cmd.arg("--no-error-on-unmatched-pattern");
    cmd.arg(OXFMT_EXCLUDE_SVELTE);
    cmd.args(paths);
    cmd.stdout(Stdio::piped()).stderr(Stdio::inherit());

    let out = cmd
        .output()
        .with_context(|| format!("failed to run `{}` — is oxfmt installed?", oxfmt.display()))?;

    // Forward oxfmt's captured stdout (its own summary / check listing).
    let stdout = String::from_utf8_lossy(&out.stdout);
    print!("{stdout}");
    let _ = io::stdout().flush();

    let (files_total, issues) = parse_oxfmt_counts(&stdout);
    let code = out.status.code();
    let (files_changed, had_errors) = match mode {
        // Check: exit 1 = "would reformat" (not an error); exit >1 = real error.
        Mode::Check => (issues, code.is_none_or(|c| c > 1)),
        // Write: oxfmt formats in place; any non-zero exit is a real error.
        Mode::Write => (0, !out.status.success()),
    };

    Ok(PipelineStatus {
        files_total,
        files_changed,
        had_errors,
    })
}

/// Recover `(files_total, issue_count)` from oxfmt's stdout summary. Best-effort
/// — counts default to 0 when the expected lines are absent so reporting can
/// never fail the run.
fn parse_oxfmt_counts(stdout: &str) -> (usize, usize) {
    // "Finished in 70ms on 3 files using 10 threads."
    let total = stdout
        .lines()
        .find_map(|l| count_before_word(l, "Finished", "files"))
        .unwrap_or(0);
    // "Format issues found in above 2 files. Run without `--check` to fix."
    let issues = stdout
        .lines()
        .find_map(|l| count_before_word(l, "Format issues found", "files"))
        .unwrap_or(0);
    (total, issues)
}

/// In a line that starts with (contains) `marker`, return the integer that
/// immediately precedes the token `word` (e.g. the `N` in "… N files …").
fn count_before_word(line: &str, marker: &str, word: &str) -> Option<usize> {
    if !line.contains(marker) {
        return None;
    }
    let mut prev: Option<&str> = None;
    for tok in line.split_whitespace() {
        // Trailing punctuation: oxfmt prints "… 2 files." (with a period) in the
        // check summary but "… 3 files using …" elsewhere.
        if tok.trim_end_matches(|c: char| !c.is_alphanumeric()) == word {
            return prev.and_then(|p| p.parse::<usize>().ok());
        }
        prev = Some(tok);
    }
    None
}
