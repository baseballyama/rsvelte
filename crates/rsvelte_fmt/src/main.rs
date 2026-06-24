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
use ignore::WalkBuilder;
use oxc_formatter::JsFormatOptions;
use oxc_formatter_core::{IndentStyle, IndentWidth, LineWidth};
use rayon::prelude::*;
use rsvelte_formatter::{FormatOptions, format, reindent};

mod config;
mod oxfmt_ignore;
mod style_cache;
use config::OxfmtConfig;
use style_cache::StyleCache;

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

    /// Disable the on-disk cache of formatted inline `<style>` blocks. By
    /// default, formatted CSS is cached (keyed by oxfmt version + resolved
    /// config + body) so unchanged blocks skip the oxfmt round-trip on
    /// subsequent runs. Also disabled by `RSVELTE_FMT_NO_CACHE`. See #703.
    #[arg(long)]
    no_style_cache: bool,
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

    let ignore = oxfmt_ignore::SvelteIgnore::from_config(&cwd, &cfg)?;
    let (svelte, oxfmt_paths) = partition_files(&cli.paths, &ignore, &cwd)?;

    let mode = if cli.check { Mode::Check } else { Mode::Write };

    // Run both pipelines in parallel — oxfmt subprocess will overlap
    // with the in-process Svelte formatter.
    let use_style_cache = !cli.no_style_cache;
    let (svelte_result, oxfmt_result) = rayon::join(
        || {
            run_svelte_files(
                &svelte,
                &options,
                &cli.oxfmt_bin,
                &cfg,
                mode,
                use_style_cache,
            )
        },
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
/// Build a per-width oxfmt config: start from the base config's JSON (if any) and
/// force `printWidth = width`, so embedded `<style>` CSS wraps at the column it
/// renders at. Returns the temp config path, or the base config (no override) for
/// a non-JSON / unreadable base. Configs are cached by width under a per-process
/// temp dir.
fn css_config_for_width(base: Option<&Path>, width: usize) -> Option<PathBuf> {
    let mut json: serde_json::Value = base
        .and_then(|p| std::fs::read_to_string(p).ok())
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_else(|| serde_json::Value::Object(serde_json::Map::new()));
    let Some(obj) = json.as_object_mut() else {
        return base.map(Path::to_path_buf);
    };
    obj.insert("printWidth".into(), serde_json::Value::from(width));
    let dir = std::env::temp_dir().join(format!("rsvelte-fmt-css-cfg-{}", std::process::id()));
    if std::fs::create_dir_all(&dir).is_err() {
        return base.map(Path::to_path_buf);
    }
    let p = dir.join(format!("w{width}.json"));
    match std::fs::write(&p, json.to_string()) {
        Ok(()) => Some(p),
        Err(_) => base.map(Path::to_path_buf),
    }
}

fn make_oxfmt_style_formatter(
    oxfmt: PathBuf,
    config: Option<PathBuf>,
) -> rsvelte_formatter::StyleFormatter {
    Arc::new(
        move |body: &str, lang: &str, width: usize| -> Result<String, String> {
            let filename = format!("inline.{}", oxfmt_ext(lang));
            // oxfmt reads stdin implicitly when `--stdin-filepath` is given with no
            // path arguments. It has no `--stdin` flag and errors if one is passed
            // (#680), so feed the body on stdin and pass only `--stdin-filepath`.
            let mut cmd = oxfmt_command(&oxfmt);
            // Force the resolved project config (with printWidth narrowed to the
            // style's column) so inline `<style>` settings match standalone files.
            // See #693.
            let cfg = css_config_for_width(config.as_deref(), width);
            if let Some(c) = &cfg {
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
        },
    )
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
fn partition_files(
    roots: &[PathBuf],
    ignore: &oxfmt_ignore::SvelteIgnore,
    cwd: &Path,
) -> Result<(Vec<PathBuf>, Vec<PathBuf>)> {
    let mut svelte = Vec::new();
    let mut oxfmt_paths = Vec::new();
    for root in roots {
        let meta = std::fs::metadata(root)
            .with_context(|| format!("reading {} — no such file or directory", root.display()))?;
        if meta.is_dir() {
            // Enumerate `.svelte` files ourselves (oxfmt walks the rest),
            // honoring the same `.gitignore` / `.prettierignore` / `.oxfmtrc`
            // `ignorePatterns` oxfmt applies to the files it walks. Walk from an
            // absolute root so entry paths can be matched against the
            // (absolute-rooted) ignore matchers.
            let abs_root = if root.is_absolute() {
                root.clone()
            } else if root.as_os_str() == "." {
                // `.` and cwd differ as paths; normalize so entry paths don't
                // carry a `.` component that would break ignore matching.
                cwd.to_path_buf()
            } else {
                cwd.join(root)
            };
            let has_vcs_boundary =
                oxfmt_ignore::all_paths_have_vcs_boundary(std::slice::from_ref(&abs_root), cwd);
            let mut builder = WalkBuilder::new(&abs_root);
            builder.follow_links(false);
            oxfmt_ignore::configure_walk_builder(&mut builder, has_vcs_boundary);
            builder.filter_entry(|entry| {
                // `.gitignore` is applied by the walker; here we only skip VCS
                // internals and `node_modules`. File-level ignores are below.
                !(entry.file_type().is_some_and(|ft| ft.is_dir())
                    && oxfmt_ignore::is_ignored_dir(entry.file_name()))
            });
            for entry in builder.build() {
                let entry = entry.context("walking input tree")?;
                let path = entry.path();
                if entry.file_type().is_some_and(|ft| ft.is_file())
                    && is_svelte(path)
                    && !ignore.is_ignored(path, false)
                {
                    svelte.push(entry.into_path());
                }
            }
            oxfmt_paths.push(root.clone());
        } else if is_svelte(root) {
            // Single explicit `.svelte` file — apply the same ignore rules.
            let abs = if root.is_absolute() {
                root.clone()
            } else {
                cwd.join(root)
            };
            if !ignore.is_ignored(&abs, false) {
                svelte.push(root.clone());
            }
        } else {
            oxfmt_paths.push(root.clone());
        }
    }
    Ok((svelte, oxfmt_paths))
}

fn is_svelte(p: &Path) -> bool {
    p.extension().and_then(OsStr::to_str) == Some(SVELTE_EXT)
}

// ─── Svelte pipeline ────────────────────────────────────────────────────

/// A `<style>` body captured during pass 1, to be formatted in a batched
/// `oxfmt` call (one per distinct print width) instead of one spawn per block.
struct CollectedStyle {
    css: String,
    lang: String,
    /// Print width the block must format at — the global width narrowed by the
    /// block's indentation, exactly as the single-file/stdin path computes it.
    /// Blocks are batched per width so column-sensitive wrapping matches oxfmt.
    width: usize,
}

/// A `<style>` body to format, borrowing from the per-file [`CollectedStyle`]s.
/// Carries the print width so the batch pass can group blocks by width.
#[derive(Clone, Copy)]
struct Style<'a> {
    css: &'a str,
    lang: &'a str,
    width: usize,
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

/// Splice one batched-`oxfmt` `<style>` result back in place of its placeholder.
///
/// Pass 1 records each raw `<style>` body and emits a single-line placeholder; the
/// in-process formatter positions that placeholder at the body's indent (one level
/// past the `<style>` tag) but, being one line, never re-indents the multi-line CSS
/// that replaces it here. A plain `String::replace` therefore left every CSS line
/// after the first at column 0 and kept oxfmt's trailing newline (a stray blank
/// line before `</style>`). Re-indent with the *same* [`reindent`] the single-file
/// / stdin path applies, so both paths are byte-identical (#1166).
///
/// The placeholder sits alone on its line, preceded only by the body indent, so
/// that leading whitespace is the indent to apply. If it is ever not alone on its
/// line (it shouldn't be), fall back to a verbatim replace rather than corrupt the
/// output.
fn substitute_style(out: &mut String, placeholder: &str, css: &str) {
    let Some(pos) = out.find(placeholder) else {
        return;
    };
    let line_start = out[..pos].rfind('\n').map_or(0, |i| i + 1);
    let indent = &out[line_start..pos];
    if indent.bytes().all(|b| b == b' ' || b == b'\t') {
        let reindented = reindent(css, indent);
        out.replace_range(line_start..pos + placeholder.len(), &reindented);
    } else {
        out.replace_range(pos..pos + placeholder.len(), css);
    }
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
    use_style_cache: bool,
) -> Result<PipelineStatus> {
    // ── Pass 1: format in parallel, collecting <style> bodies ──
    let pass1: Vec<Pass1> = files
        .par_iter()
        .map(|path| format_collecting(path, options))
        .collect();

    // ── Flatten collected styles across all files, keyed by (file, local) ──
    let mut slot_css: Vec<Style> = Vec::new(); // (css, lang, width) in batch order
    let mut slot_owner: Vec<(usize, usize)> = Vec::new(); // (file_idx, local_idx)
    for (fi, p1) in pass1.iter().enumerate() {
        if let Ok((_, styles)) = &p1.outcome {
            for (li, st) in styles.iter().enumerate() {
                slot_css.push(Style {
                    css: &st.css,
                    lang: &st.lang,
                    width: st.width,
                });
                slot_owner.push((fi, li));
            }
        }
    }

    // ── Format every <style> body, served from cache when possible ──
    // The cache (keyed by oxfmt version + resolved config + body) lets
    // unchanged blocks skip the oxfmt staging round-trip entirely — the
    // dominant cost on a real tree (#703). Only cache misses are sent to the
    // single batched oxfmt call; freshly-formatted misses are then stored.
    let cache = if use_style_cache && !slot_css.is_empty() {
        StyleCache::new(oxfmt, cfg.path.as_deref())
    } else {
        None
    };

    let formatted_css = format_styles_cached(oxfmt, cfg.path.as_deref(), &slot_css, cache.as_ref())
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
            substitute_style(&mut out, &style_placeholder(li), &css);
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
    // Record each `<style>` body with the print width it must format at (the
    // global width narrowed by the block's indentation). The batch pass groups
    // blocks by width and runs one oxfmt call per distinct width, so
    // column-sensitive wrapping matches the single-file / stdin path (and oxfmt)
    // while still batching — nearly every block shares one width (#1166).
    opts.style_formatter = Some(Arc::new(move |body: &str, lang: &str, width: usize| {
        let mut v = sink.lock().expect("style sink poisoned");
        let idx = v.len();
        v.push(CollectedStyle {
            css: body.to_string(),
            lang: lang.to_string(),
            width,
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

/// Format every `<style>` body in input order, serving cache hits without
/// touching oxfmt and batching only the misses into one oxfmt invocation.
///
/// On a hit the stored bytes are byte-identical to oxfmt's output (the key
/// covers oxfmt version + config + body), so output parity is preserved. Misses
/// are stored only when oxfmt formatted them successfully — a body oxfmt
/// couldn't parse round-trips unchanged and is never cached, so it is retried
/// on the next run.
fn format_styles_cached(
    oxfmt: &Path,
    config: Option<&Path>,
    styles: &[Style],
    cache: Option<&StyleCache>,
) -> Result<Vec<String>> {
    if styles.is_empty() {
        return Ok(Vec::new());
    }

    let Some(cache) = cache else {
        // Caching disabled — format everything through the batch path.
        return Ok(batch_format_styles(oxfmt, config, styles)?.0);
    };

    // Partition into cache hits and misses, preserving input order. The cache
    // key includes the width, so the same body at two indentations is two
    // distinct entries (its wrapping differs).
    let mut results: Vec<Option<String>> = Vec::with_capacity(styles.len());
    let mut miss_styles: Vec<Style> = Vec::new();
    let mut miss_slots: Vec<usize> = Vec::new();
    for (i, s) in styles.iter().enumerate() {
        match cache.get(s.css, s.lang, s.width) {
            Some(hit) => results.push(Some(hit)),
            None => {
                results.push(None);
                miss_styles.push(*s);
                miss_slots.push(i);
            }
        }
    }

    if !miss_styles.is_empty() {
        let (formatted, ok) = batch_format_styles(oxfmt, config, &miss_styles)?;
        for (slot, css) in miss_slots.iter().zip(formatted) {
            // Only persist successfully-formatted bodies. On an oxfmt error the
            // body round-trips unchanged; caching that would pin the unformatted
            // form, so skip it and let the next run retry.
            if ok {
                let s = styles[*slot];
                cache.put(s.css, s.lang, s.width, &css);
            }
            results[*slot] = Some(css);
        }
    }

    Ok(results.into_iter().map(|r| r.unwrap_or_default()).collect())
}

/// Format a set of `<style>` bodies, grouping by print width so each block wraps
/// at the column it renders at (matching the single-file / stdin path and oxfmt).
///
/// Column-sensitive CSS — a long selector or value near the wrap point — must be
/// formatted at the global width *minus its indentation*, or it diverges from
/// oxfmt. Nearly every block shares one width, so grouping costs at most a couple
/// of extra oxfmt round-trips while restoring parity. Results are returned in the
/// input order. The combined `ok` is false if any width group's oxfmt failed.
fn batch_format_styles(
    oxfmt: &Path,
    config: Option<&Path>,
    styles: &[Style],
) -> Result<(Vec<String>, bool)> {
    if styles.is_empty() {
        return Ok((Vec::new(), true));
    }

    let mut by_width: std::collections::BTreeMap<usize, Vec<usize>> =
        std::collections::BTreeMap::new();
    for (i, s) in styles.iter().enumerate() {
        by_width.entry(s.width).or_default().push(i);
    }

    let mut results = vec![String::new(); styles.len()];
    let mut all_ok = true;
    for (width, idxs) in by_width {
        let group: Vec<(&str, &str)> = idxs
            .iter()
            .map(|&i| (styles[i].css, styles[i].lang))
            .collect();
        // Narrow the project config to this width so oxfmt wraps embedded CSS at
        // the same column the block renders at (falls back to the base config).
        let cfg = css_config_for_width(config, width);
        let (formatted, ok) = batch_format_styles_group(oxfmt, cfg.as_deref(), &group)?;
        all_ok &= ok;
        for (slot, css) in idxs.into_iter().zip(formatted) {
            results[slot] = css;
        }
    }
    Ok((results, all_ok))
}

/// Format one same-width group of `<style>` bodies in a single `oxfmt`
/// invocation by staging each into a temp directory and running `oxfmt <dir>`
/// (in-place), then reading them back. Returns the formatted CSS in input order
/// plus whether oxfmt exited successfully (so callers can decide whether to
/// cache). `config` is the (width-narrowed) config to force via `-c`.
///
/// The styles are handed to oxfmt as a single **directory** argument rather
/// than N explicit file paths: oxfmt parallelizes its directory walk, and on
/// large trees a multi-thousand-entry argv can also be slower (or hit
/// `ARG_MAX`). The staging dir holds only our `s{i}.{ext}` files, so the walk
/// formats exactly the set we read back. See #707.
fn batch_format_styles_group(
    oxfmt: &Path,
    config: Option<&Path>,
    styles: &[(&str, &str)],
) -> Result<(Vec<String>, bool)> {
    if styles.is_empty() {
        return Ok((Vec::new(), true));
    }

    let dir = std::env::temp_dir().join(format!("rsvelte-fmt-styles-{}", std::process::id()));
    // Start from a clean dir: oxfmt walks the whole directory, so a stale file
    // left by a crashed prior run with a recycled PID must not leak into the
    // batch (it would waste work and could surface spurious parse errors).
    let _ = std::fs::remove_dir_all(&dir);
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
        .arg(&dir)
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

    let ok = out.status.success();
    if !ok {
        eprintln!(
            "rsvelte-fmt: oxfmt reported errors while formatting <style> blocks:\n{}",
            String::from_utf8_lossy(&out.stderr).trim_end()
        );
    }
    Ok((results, ok))
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
