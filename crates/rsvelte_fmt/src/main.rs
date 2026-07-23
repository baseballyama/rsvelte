//! `rsvelte-fmt` — single entry point for formatting a mixed JS/TS/Svelte
//! tree. `.svelte` files go through [`rsvelte_formatter`]; every other file
//! is delegated to a child `oxfmt` process. Both pipelines run in parallel.

use std::collections::{HashMap, HashSet};
use std::ffi::OsStr;
use std::io::{self, Read, Write};
use std::path::{Path, PathBuf};
use std::process::{Command, ExitCode, Stdio};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex, OnceLock};

use anyhow::{Context, Result, anyhow};
use clap::Parser;
use ignore::WalkBuilder;
use ignore::gitignore::{Gitignore, GitignoreBuilder};
use oxc_formatter::JsFormatOptions;
use oxc_formatter_core::{IndentStyle, IndentWidth, LineWidth};
use rayon::prelude::*;
use rsvelte_formatter::{
    ClassSorter, CssFormatOptions, CssSingleQuote, CssTrailingCommas, FormatOptions,
    JsonFormatOptions, JsonVariant, SortOrderSpec, css_variant_from_lang, format,
    format_css_source, format_js_source, format_json_source, reindent,
};

mod config;
mod daemon;
mod oxfmt_ignore;
mod style_cache;
mod tailwind;
mod tailwind_sidecar;
mod ts_config;
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
    /// format. When omitted, the current directory is formatted (matching
    /// `oxfmt`). See #694.
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

    /// Format `.ts`/`.js` files by delegating to `oxfmt` instead of formatting
    /// them in-process via `oxc_formatter`. The in-process path is byte-identical
    /// (same engine) but avoids the per-invocation `oxfmt` startup; this flag is
    /// an escape hatch if a divergence is ever found.
    #[arg(long)]
    no_native_js: bool,

    /// Format CSS in-process via `oxc_formatter_css` — this covers both embedded
    /// `<style>` blocks in `.svelte` files and standalone `.css`/`.scss`/`.less`
    /// files — by delegating to `oxfmt` instead. The in-process path is
    /// byte-identical (same engine) but avoids the per-block/`per-file` `oxfmt`
    /// subprocess (and the staging/daemon/cache machinery it needs); this flag is
    /// an escape hatch if a divergence is ever found.
    #[arg(long)]
    no_native_css: bool,
}

const SVELTE_EXT: &str = "svelte";

/// Extensions formatted in-process via `oxc_formatter` (the same engine `oxfmt`
/// uses for these files), so they need no `oxfmt` subprocess. JSON is handled by
/// the separate native-JSON path ([`NATIVE_JSON_EXTS`]); everything else `oxfmt`
/// supports (`.css`/`.md`/`.yaml`/`.toml`/`.html`) stays delegated.
const NATIVE_JS_EXTS: &[&str] = &["ts", "tsx", "js", "jsx", "mjs", "cjs", "mts", "cts"];

fn is_native_js(p: &Path) -> bool {
    p.extension()
        .and_then(OsStr::to_str)
        .is_some_and(|e| NATIVE_JS_EXTS.contains(&e))
}

/// Extensions formatted in-process via `oxc_formatter_json` (the same engine
/// `oxfmt` uses for JSON, so byte-identical) — except `package.json`, which
/// `oxfmt` additionally runs through `sortPackageJson` (a key-ordering pass that
/// isn't in oxc), so those are delegated to `oxfmt` like a parse-error fallback.
const NATIVE_JSON_EXTS: &[&str] = &["json", "jsonc", "json5"];

fn is_native_json(p: &Path) -> bool {
    p.extension()
        .and_then(OsStr::to_str)
        .is_some_and(|e| NATIVE_JSON_EXTS.contains(&e))
}

/// Extensions formatted in-process via `oxc_formatter_css` (the same engine
/// `oxfmt` uses for these files, so byte-identical) — brace-based CSS dialects
/// only. `.sass`/`.styl` (indented syntax) aren't handled by `oxc_formatter_css`
/// and stay delegated to `oxfmt`.
const NATIVE_CSS_EXTS: &[&str] = &["css", "scss", "less"];

fn is_native_css(p: &Path) -> bool {
    p.extension()
        .and_then(OsStr::to_str)
        .is_some_and(|e| NATIVE_CSS_EXTS.contains(&e))
}

/// `package.json` needs oxfmt's `sortPackageJson`; never format it natively.
fn is_package_json(p: &Path) -> bool {
    p.file_name().and_then(OsStr::to_str) == Some("package.json")
}

/// The `oxc_formatter_json` variant for a file extension, mirroring how `oxfmt`
/// picks a JSON parser/printer per extension.
fn json_variant(ext: &str) -> JsonVariant {
    match ext {
        "jsonc" => JsonVariant::Jsonc,
        "json5" => JsonVariant::Json5,
        _ => JsonVariant::Json,
    }
}

/// `oxc_formatter_core::LineWidth`'s maximum (1..=320). A file whose resolved
/// `printWidth` exceeds this can't be represented natively, so it's delegated to
/// oxfmt (which honors larger widths) to keep output byte-identical.
const LINE_WIDTH_MAX: u16 = 320;

/// The Node interpreter used to run a JS `oxfmt` launcher, resolved once.
///
/// Two entry points populate it, in priority order:
///   1. The native-direct install path ([`run`] reads it from the
///      `rsvelte-fmt.runtime.json` sidecar the npm `postinstall` writes next to
///      the binary) calls [`set_oxfmt_node`].
///   2. Otherwise [`oxfmt_node`] falls back to `RSVELTE_FMT_NODE` (set by the
///      npm JS launcher when it spawns this binary).
static OXFMT_NODE: OnceLock<Option<PathBuf>> = OnceLock::new();

/// Record the Node interpreter for JS `oxfmt` launchers (from the install
/// sidecar). Best-effort: a later call is ignored, which is fine — the value is
/// set once at startup before any `oxfmt` invocation.
fn set_oxfmt_node(node: Option<PathBuf>) {
    let _ = OXFMT_NODE.set(node);
}

/// The Node interpreter to run a JS `oxfmt` launcher through, if any. Prefers
/// the value recorded from the install sidecar, else `RSVELTE_FMT_NODE`.
fn oxfmt_node() -> Option<PathBuf> {
    if let Some(v) = OXFMT_NODE.get() {
        return v.clone();
    }
    std::env::var_os("RSVELTE_FMT_NODE")
        .filter(|v| !v.is_empty())
        .map(PathBuf::from)
}

/// Build a `Command` that runs `oxfmt`.
///
/// The npm `@rsvelte/fmt` launcher resolves the consumer's `oxfmt/bin/oxfmt`
/// Node launcher (an extensionless script with shebang `#!/usr/bin/env node`)
/// and passes it via `--oxfmt-bin`, setting `RSVELTE_FMT_NODE` to the exact
/// interpreter. When installed native-direct (the JS launcher replaced by this
/// binary at `postinstall`), the same two values come from the
/// `rsvelte-fmt.runtime.json` sidecar instead — see [`oxfmt_node`]. Such a
/// script isn't directly executable on Windows, so when a Node interpreter is
/// known we run the oxfmt path through it. As a convenience for `cargo run`
/// users who point `--oxfmt-bin` at a `.js` / `.cjs` / `.mjs` launcher without
/// providing an interpreter, we also fall back to `node` on `$PATH` in that
/// case. A plain native binary (the default `oxfmt` on `$PATH`, or any
/// user-supplied path) is run directly.
fn oxfmt_command(oxfmt: &Path) -> Command {
    let node_env = oxfmt_node();
    let is_js_ext = matches!(
        oxfmt.extension().and_then(OsStr::to_str),
        Some("js" | "cjs" | "mjs")
    );
    if node_env.is_some() || is_js_ext {
        let node = node_env.unwrap_or_else(|| PathBuf::from("node"));
        let mut cmd = Command::new(node);
        cmd.arg(oxfmt);
        cmd
    } else {
        Command::new(oxfmt)
    }
}

/// Recover the consumer's `oxfmt` launcher + Node interpreter from the
/// `rsvelte-fmt.runtime.json` sidecar the npm `postinstall` writes next to this
/// binary when it installs native-direct (the JS launcher replaced by the
/// platform binary). Returns `(oxfmt_bin, node)`; `None` when there is no
/// sidecar or it doesn't name an `oxfmtBin` (then `oxfmt` is resolved on `$PATH`
/// as usual). `node` may be `None` (oxfmt installed as a native binary).
fn load_oxfmt_runtime_sidecar() -> Option<(PathBuf, Option<PathBuf>)> {
    let exe = std::env::current_exe().ok()?;
    let sidecar = exe.parent()?.join("rsvelte-fmt.runtime.json");
    let bytes = std::fs::read(sidecar).ok()?;
    let value: serde_json::Value = serde_json::from_slice(&bytes).ok()?;
    let oxfmt = value
        .get("oxfmtBin")
        .and_then(serde_json::Value::as_str)
        .map(PathBuf::from)?;
    let node = value
        .get("node")
        .and_then(serde_json::Value::as_str)
        .map(PathBuf::from);
    Some((oxfmt, node))
}

/// oxfmt exclude pattern that keeps `.svelte` files out of the delegated pass —
/// those are handled in-process by `rsvelte_formatter`. Applies to directory
/// walks and to any explicitly-passed `.svelte` path.
const OXFMT_EXCLUDE_SVELTE: &str = "!**/*.svelte";

/// oxfmt exclude globs that keep the native-`.ts`/`.js` set out of the delegated
/// directory pass — those are handled in-process. One per extension in
/// [`NATIVE_JS_EXTS`]; only added when the native path is enabled.
const OXFMT_EXCLUDE_NATIVE_JS: &[&str] = &[
    "!**/*.ts",
    "!**/*.tsx",
    "!**/*.js",
    "!**/*.jsx",
    "!**/*.mjs",
    "!**/*.cjs",
    "!**/*.mts",
    "!**/*.cts",
];

/// oxfmt exclude globs that keep the native-JSON set out of the delegated
/// directory pass — non-`package.json` JSON is formatted in-process. `oxfmt`
/// still formats `package.json` (re-included as explicit paths for the
/// `sortPackageJson` pass) and any native parse-error fallbacks.
const OXFMT_EXCLUDE_NATIVE_JSON: &[&str] = &["!**/*.json", "!**/*.jsonc", "!**/*.json5"];

/// oxfmt exclude globs that keep the native-CSS set out of the delegated
/// directory pass — those are formatted in-process. One per extension in
/// [`NATIVE_CSS_EXTS`]; only added when the native-CSS path is enabled.
const OXFMT_EXCLUDE_NATIVE_CSS: &[&str] = &["!**/*.css", "!**/*.scss", "!**/*.less"];

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
    let mut cli = Cli::parse();

    // Native-direct install: when not launched via the npm JS launcher (which
    // passes `--oxfmt-bin` + `RSVELTE_FMT_NODE`) and the user didn't override
    // `--oxfmt-bin`, recover the consumer's `oxfmt` launcher + Node interpreter
    // from the `postinstall` sidecar written next to this binary. This is what
    // lets the JS launcher be dropped from the hot path (#1177 follow-up): the
    // platform binary runs directly, then finds oxfmt the same way the launcher
    // would have.
    let launched_via_js_launcher = std::env::var_os("RSVELTE_FMT_NODE")
        .filter(|v| !v.is_empty())
        .is_some();
    let user_set_oxfmt_bin = cli.oxfmt_bin != Path::new("oxfmt");
    if !launched_via_js_launcher
        && !user_set_oxfmt_bin
        && let Some((oxfmt_bin, node)) = load_oxfmt_runtime_sidecar()
    {
        cli.oxfmt_bin = oxfmt_bin;
        set_oxfmt_node(node);
    }

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
    let cfg = OxfmtConfig::resolve(cli.config.as_deref(), &config_start).map_err(|e| anyhow!(e))?;

    let (mut options, pending_js) = build_format_options(&cli, &cfg);

    if cli.stdin {
        return run_stdin(&cli, &options, &cfg, pending_js.as_ref());
    }

    // No paths given (and not stdin mode): default to the current directory,
    // matching `oxfmt`, which formats the cwd when no PATH is provided.
    if cli.paths.is_empty() {
        cli.paths.push(PathBuf::from("."));
    }

    let native_js = !cli.no_native_js;
    let native_css = !cli.no_native_css;
    let ignore = oxfmt_ignore::SvelteIgnore::from_config(&cwd, &cfg)?;
    let (svelte, native, native_json, native_css_files, oxfmt_paths) =
        partition_files(&cli.paths, &ignore, &cwd, native_js, native_css)?;

    // Custom Tailwind config (`SortViaJs`): collect every class string across the
    // `.svelte` files, sort them in one sidecar call, and install a map-backed
    // sorter for the real formatting pass below. Only `.svelte` files carry the
    // class sorter, so nothing else needs the collection pass.
    if let Some(pending) = &pending_js {
        let classes = collect_svelte_classes(&svelte, &options);
        options.class_sorter = resolve_js_class_sorter(pending, classes);
    }

    // Whether every in-process pass (Svelte, native JS/JSON/CSS) found
    // nothing at all. When true, `oxfmt`'s own delegated share is the only
    // remaining source of truth for whether anything exists to format, so it
    // must be allowed to error for real instead of being unconditionally
    // suppressed (see `run_oxfmt`'s `suppress_unmatched`) — replicating
    // oxfmt's own ignore + extension matching here would be a fragile
    // duplication of logic that already lives in the `oxfmt` binary itself.
    let in_process_empty = svelte.is_empty()
        && native.is_empty()
        && native_json.is_empty()
        && native_css_files.is_empty();

    // Nothing was even handed to `oxfmt` (every path was an explicit file
    // that turned out to be ignored), so no subprocess will run to report the
    // error itself — report it the same way oxfmt would.
    if in_process_empty && oxfmt_paths.is_empty() {
        eprintln!(
            "Expected at least one target file. All matched files may have been excluded by ignore rules."
        );
        return Ok(ExitCode::from(2));
    }

    let mode = if cli.check { Mode::Check } else { Mode::Write };

    // Per-file JS options resolver (base + `.oxfmtrc` `overrides`). A CLI width
    // flag takes precedence over an override's printWidth/tabWidth.
    let cli_width_flag = cli.print_width.is_some() || cli.tab_width.is_some() || cli.use_tabs;
    let resolver = JsOptionsResolver::new(&options, &cfg, &cwd, cli_width_flag);

    // Per-file JSON options resolver (native JSON; `package.json` + overrides +
    // parse errors delegate to oxfmt).
    let json_options = build_json_options(&cli, &cfg);
    let base_print_width = cli.print_width.or(cfg.print_width).unwrap_or(80);
    let json_resolver = JsonOptionsResolver::new(json_options, base_print_width, &cfg, &cwd);

    // Per-file CSS options resolver (native CSS; overrides + over-width delegate
    // to oxfmt, mirroring native JSON).
    let css_options = build_css_options(&cli, &cfg);
    let css_resolver = CssOptionsResolver::new(css_options, base_print_width, &cfg, &cwd);

    // Run the pipelines in parallel: the oxfmt subprocess overlaps with the
    // in-process Svelte, native-JS, native-JSON, and native-CSS formatters.
    let use_style_cache = !cli.no_style_cache;
    let exclude_native = native_js && !native.is_empty();
    let exclude_native_json = native_js && !native_json.is_empty();
    let exclude_native_css = native_css && !native_css_files.is_empty();
    let (((svelte_result, native_result), (json_result, css_result)), oxfmt_result) = rayon::join(
        || {
            rayon::join(
                || {
                    rayon::join(
                        || {
                            run_svelte_files(
                                &svelte,
                                &options,
                                &cli.oxfmt_bin,
                                &cfg,
                                mode,
                                use_style_cache,
                                native_css,
                            )
                        },
                        || run_native_js(&native, &resolver, &cwd, &cli.oxfmt_bin, mode),
                    )
                },
                || {
                    rayon::join(
                        || {
                            run_native_json(
                                &native_json,
                                &json_resolver,
                                &cwd,
                                &cli.oxfmt_bin,
                                mode,
                            )
                        },
                        || {
                            run_native_css(
                                &native_css_files,
                                &css_resolver,
                                &cwd,
                                &cli.oxfmt_bin,
                                mode,
                            )
                        },
                    )
                },
            )
        },
        || {
            run_oxfmt(
                &oxfmt_paths,
                &cli.oxfmt_bin,
                mode,
                exclude_native,
                exclude_native_json,
                exclude_native_css,
                // A Svelte-only or CSS-only tree legitimately leaves oxfmt's
                // own share empty, so suppress its unmatched-pattern error —
                // but not when every in-process pass is *also* empty: oxfmt
                // is then the only thing that can tell (via its own ignore
                // rules and supported-extension set) whether anything really
                // exists to format, so it must be allowed to error for real.
                !in_process_empty,
            )
        },
    );

    let svelte_status = svelte_result?;
    let native_status = native_result?;
    let json_status = json_result?;
    let css_status = css_result?;
    let oxfmt_status = oxfmt_result?;
    let combined = svelte_status
        .merge(native_status)
        .merge(json_status)
        .merge(css_status);

    // oxfmt ran unsuppressed above and genuinely found nothing — its own
    // "no target file" message already went to stderr (inherited), so don't
    // also print our summary line; just propagate the error exit code.
    if in_process_empty && oxfmt_status.had_errors {
        return Ok(combine(combined, oxfmt_status, mode));
    }

    print_summary(&combined, &oxfmt_status, mode);
    Ok(combine(combined, oxfmt_status, mode))
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

impl PipelineStatus {
    /// Fold another pipeline's counts into this one (e.g. the in-process Svelte
    /// and native-JS passes report as one "in-process" total in the summary).
    fn merge(mut self, other: PipelineStatus) -> PipelineStatus {
        self.files_changed += other.files_changed;
        self.files_total += other.files_total;
        self.had_errors |= other.had_errors;
        self
    }
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
fn build_format_options(cli: &Cli, cfg: &OxfmtConfig) -> (FormatOptions, Option<PendingJsSort>) {
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
    // `sortImports` reorders imports inside embedded `<script>` (and native
    // `.ts`/`.js`) just as oxfmt does for standalone files.
    js.sort_imports = cfg.sort_imports_options();

    // Resolve `svelteSortOrder`; an unrecognised value falls back to the default
    // and warns, mirroring oxfmt rejecting it (we warn rather than hard-fail).
    let sort_order = match &cfg.svelte_sort_order {
        Some(s) => SortOrderSpec::parse(s).unwrap_or_else(|| {
            eprintln!(
                "rsvelte-fmt: warning: unrecognised svelteSortOrder \"{s}\"; using the default \
                 \"options-scripts-markup-styles\""
            );
            SortOrderSpec::default()
        }),
        None => SortOrderSpec::default(),
    };

    // `sortTailwindcss` orders class names by the project's tailwind stylesheet.
    // A stock, zero-config setup sorts natively (byte-for-byte). A custom
    // stylesheet / config is delegated to a Node sidecar running the real
    // `prettier-plugin-tailwindcss` (see `PendingJsSort`); the sort itself is
    // resolved later, once every class string across the run is collected. With
    // no Node available we warn and leave classes unchanged. The Node probe runs
    // lazily — only if `decide` reaches a JS branch — so a stock config never
    // spawns `node --version`; the probed env is captured for the `SortViaJs` arm.
    let mut js_env: Option<tailwind_sidecar::SidecarEnv> = None;
    let decision = tailwind::decide(cfg.sort_tailwindcss.as_ref(), cfg.path.as_deref(), || {
        js_env = js_sort_env();
        js_env.is_some()
    });
    let (class_sorter, class_attributes, pending_js) = match decision {
        tailwind::Decision::Sort { sorter, attributes } => (Some(sorter), attributes, None),
        tailwind::Decision::SortViaJs {
            filepath,
            stylesheet_path,
            config_path,
            attributes,
            preserve_whitespace,
            preserve_duplicates,
        } => (
            None,
            attributes,
            Some(PendingJsSort {
                env: js_env.expect("the js probe set an env when it returned SortViaJs"),
                filepath,
                stylesheet_path,
                config_path,
                preserve_whitespace,
                preserve_duplicates,
            }),
        ),
        tailwind::Decision::Skip { reason } => {
            eprintln!("rsvelte-fmt: warning: `sortTailwindcss` left unapplied — {reason}.");
            (None, Vec::new(), None)
        }
        tailwind::Decision::Off => (None, Vec::new(), None),
    };

    // `functions` (script `cn(...)` / `cva(...)` sorting) applies only when a sort
    // is actually active — native (`class_sorter`) or the JS sidecar (`pending_js`).
    let tailwind_functions = if class_sorter.is_some() || pending_js.is_some() {
        tailwind::function_names(cfg.sort_tailwindcss.as_ref())
    } else {
        Vec::new()
    };

    // Embedded `<style>` blocks are formatted in-process via `oxc_formatter_css`
    // by default (same engine as `oxfmt`, no subprocess). `--no-native-css`
    // reverts to spawning `oxfmt`, which the batched Svelte pipeline drives.
    let style_formatter = if cli.no_native_css {
        make_oxfmt_style_formatter(cli.oxfmt_bin.clone(), cfg.oxfmt_arg_path.clone())
    } else {
        rsvelte_formatter::native_style_formatter(build_css_options(cli, cfg))
    };

    let options = FormatOptions {
        js,
        style_formatter: Some(style_formatter),
        // `format` derives this per-document from `<script lang="ts">`.
        typescript: false,
        single_attribute_per_line: cfg.single_attribute_per_line.unwrap_or(false),
        allow_shorthand: cfg.svelte_allow_shorthand.unwrap_or(true),
        indent_script_and_style: cfg.svelte_indent_script_and_style.unwrap_or(true),
        sort_order,
        bracket_same_line: cfg.bracket_same_line.unwrap_or(false),
        class_sorter,
        class_attributes,
        tailwind_functions,
    };
    (options, pending_js)
}

/// A resolved custom-Tailwind `sortTailwindcss` awaiting its one sidecar call.
/// Held until every class string across the run is collected, so the Node
/// sidecar runs exactly once for the whole batch.
struct PendingJsSort {
    env: tailwind_sidecar::SidecarEnv,
    filepath: PathBuf,
    stylesheet_path: Option<PathBuf>,
    config_path: Option<PathBuf>,
    preserve_whitespace: bool,
    preserve_duplicates: bool,
}

impl PendingJsSort {
    /// Sort `classes` (deduped) via the sidecar into an `orig -> sorted` map.
    /// `None` on any sidecar failure, so the caller leaves classes untouched.
    fn resolve(&self, classes: Vec<String>) -> Option<HashMap<String, String>> {
        let req = tailwind_sidecar::SortRequest {
            filepath: &self.filepath,
            stylesheet_path: self.stylesheet_path.as_deref(),
            config_path: self.config_path.as_deref(),
            preserve_whitespace: self.preserve_whitespace,
            preserve_duplicates: self.preserve_duplicates,
            classes: classes.clone(),
        };
        let sorted = tailwind_sidecar::sort(&self.env, &req)?;
        Some(classes.into_iter().zip(sorted).collect())
    }
}

/// A class sorter that records every value it sees (returning it unchanged), for
/// the collection pass that gathers all class strings before the sidecar call.
fn collecting_sorter(sink: Arc<Mutex<HashSet<String>>>) -> ClassSorter {
    Arc::new(move |s: &str| {
        sink.lock()
            .expect("class sink poisoned")
            .insert(s.to_string());
        s.to_string()
    })
}

/// A class sorter backed by a resolved `orig -> sorted` map; an unseen value
/// (e.g. a sidecar miss) is returned unchanged.
fn map_sorter(map: Arc<HashMap<String, String>>) -> ClassSorter {
    Arc::new(move |s: &str| map.get(s).cloned().unwrap_or_else(|| s.to_string()))
}

/// Format `source` with a collecting class sorter, returning the set of static
/// class-attribute values it contains. Style formatting is skipped — only the
/// class strings matter here.
fn collect_source_classes(source: &str, options: &FormatOptions) -> HashSet<String> {
    let sink: Arc<Mutex<HashSet<String>>> = Arc::default();
    let mut opts = options.clone();
    opts.class_sorter = Some(collecting_sorter(sink.clone()));
    opts.style_formatter = None;
    let _ = format(source, &opts);
    std::mem::take(&mut *sink.lock().expect("class sink poisoned"))
}

/// Collect every static class-attribute value across `files` in parallel, for
/// the single batched sidecar sort.
fn collect_svelte_classes(files: &[PathBuf], options: &FormatOptions) -> HashSet<String> {
    let sink: Arc<Mutex<HashSet<String>>> = Arc::default();
    let mut opts = options.clone();
    opts.class_sorter = Some(collecting_sorter(sink.clone()));
    opts.style_formatter = None;
    files.par_iter().for_each(|path| {
        if let Ok(source) = std::fs::read_to_string(path) {
            let _ = format(&source, &opts);
        }
    });
    std::mem::take(&mut *sink.lock().expect("class sink poisoned"))
}

/// Resolve the JS class sorter for a batch: collect all class strings, run the
/// sidecar once, and return a map-backed sorter. On sidecar failure, warns once
/// and returns `None` so classes are left unsorted (never wrongly reordered).
fn resolve_js_class_sorter(
    pending: &PendingJsSort,
    classes: HashSet<String>,
) -> Option<ClassSorter> {
    if classes.is_empty() {
        return None;
    }
    match pending.resolve(classes.into_iter().collect()) {
        Some(map) => Some(map_sorter(Arc::new(map))),
        None => {
            eprintln!(
                "rsvelte-fmt: warning: `sortTailwindcss` left unapplied — the Node sidecar could \
                 not sort classes (is prettier-plugin-tailwindcss installed?)."
            );
            None
        }
    }
}

/// Locate the Tailwind sidecar Node environment, requiring both the script and a
/// runnable Node. `None` disables the JS sort path (a custom Tailwind config then
/// warns and skips). Only called when `sortTailwindcss` is configured, so the
/// Node probe never touches the default path.
fn js_sort_env() -> Option<tailwind_sidecar::SidecarEnv> {
    let script = tailwind_sidecar_script()?;
    let node = oxfmt_node().unwrap_or_else(|| PathBuf::from("node"));
    node_runnable(&node).then_some(tailwind_sidecar::SidecarEnv {
        node,
        script,
        timeout: tailwind_sidecar::DEFAULT_TIMEOUT,
    })
}

/// Whether `node --version` runs — so a missing Node yields a Node-specific
/// warning rather than blaming the plugin.
fn node_runnable(node: &Path) -> bool {
    Command::new(node)
        .arg("--version")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .map(|s| s.success())
        .unwrap_or(false)
}

/// The `tailwind-sort.mjs` sidecar: `RSVELTE_FMT_TAILWIND_SIDECAR` when set
/// (tests / overrides), else `lib/tailwind-sort.mjs` beside the installed
/// `bin/rsvelte-fmt`.
fn tailwind_sidecar_script() -> Option<PathBuf> {
    if let Some(p) = std::env::var_os("RSVELTE_FMT_TAILWIND_SIDECAR") {
        let p = PathBuf::from(p);
        return p.is_file().then_some(p);
    }
    let exe = std::env::current_exe().ok()?;
    let script = exe.parent()?.parent()?.join("lib/tailwind-sort.mjs");
    script.is_file().then_some(script)
}

/// The base [`JsonFormatOptions`] for the native-JSON path: width/indent/EOL
/// resolved exactly as the JS path, plus `bracketSpacing`. `objectWrap` is left
/// at oxc's default (`Expand::Auto` = Prettier `preserve`), matching `oxfmt`.
/// `variant` is set per file by [`json_variant`].
fn build_json_options(cli: &Cli, cfg: &OxfmtConfig) -> JsonFormatOptions {
    let use_tabs = cli.use_tabs || cfg.use_tabs.unwrap_or(false);
    let indent_style = if use_tabs {
        IndentStyle::Tab
    } else {
        IndentStyle::Space
    };
    let tab_width = cli.tab_width.or(cfg.tab_width).unwrap_or(2);
    let print_width = cli.print_width.or(cfg.print_width).unwrap_or(80);
    let indent_width = IndentWidth::try_from(tab_width).unwrap_or_default();
    let line_width = LineWidth::try_from(print_width).unwrap_or_default();

    let mut opts = JsonFormatOptions {
        indent_style,
        indent_width,
        line_width,
        ..JsonFormatOptions::default()
    };
    if let Some(eol) = cfg.end_of_line {
        opts.line_ending = eol;
    }
    if let Some(spacing) = cfg.bracket_spacing {
        opts.bracket_spacing = spacing.into();
    }
    opts
}

/// The base [`CssFormatOptions`] for the native-CSS path: width/indent/EOL
/// resolved exactly as the JS/JSON paths, plus `singleQuote` / `trailingComma`
/// (the only Prettier keys the CSS languages consume). `variant` is set per
/// file/block by the caller; `line_width` is narrowed per embedded `<style>`
/// block to its column.
fn build_css_options(cli: &Cli, cfg: &OxfmtConfig) -> CssFormatOptions {
    let use_tabs = cli.use_tabs || cfg.use_tabs.unwrap_or(false);
    let indent_style = if use_tabs {
        IndentStyle::Tab
    } else {
        IndentStyle::Space
    };
    let tab_width = cli.tab_width.or(cfg.tab_width).unwrap_or(2);
    let print_width = cli.print_width.or(cfg.print_width).unwrap_or(80);
    let indent_width = IndentWidth::try_from(tab_width).unwrap_or_default();
    let line_width = LineWidth::try_from(print_width).unwrap_or_default();

    let mut opts = CssFormatOptions {
        indent_style,
        indent_width,
        line_width,
        ..CssFormatOptions::default()
    };
    if let Some(eol) = cfg.end_of_line {
        opts.line_ending = eol;
    }
    if let Some(single) = cfg.single_quote {
        opts.single_quote = CssSingleQuote::from(single);
    }
    // Prettier's `trailingComma` reaches only multi-line SCSS maps for CSS:
    // `none` → no trailing comma, everything else (`all`/`es5`, or the unset
    // default) → trailing comma. Matches `oxc_formatter_css`'s own default.
    opts.trailing_commas = match cfg.trailing_comma {
        Some(oxc_formatter::TrailingCommas::None) => CssTrailingCommas::Never,
        _ => CssTrailingCommas::Always,
    };
    opts
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
    let json = css_options_for_width(base, width);
    if !json.is_object() {
        return base.map(Path::to_path_buf);
    }
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

/// The resolved oxfmt options for an inline `<style>` block at `width`: the base
/// `.oxfmtrc` (if any) with `printWidth` forced to the block's column. Returned
/// as a JSON value so the daemon path can send it inline as `format()`'s options
/// and the spawn path can serialize it to a temp config — both at byte parity.
fn css_options_for_width(base: Option<&Path>, width: usize) -> serde_json::Value {
    let mut json: serde_json::Value = base
        .and_then(|p| std::fs::read_to_string(p).ok())
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_else(|| serde_json::Value::Object(serde_json::Map::new()));
    if let Some(obj) = json.as_object_mut() {
        obj.insert("printWidth".into(), serde_json::Value::from(width));
    }
    json
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

fn run_stdin(
    cli: &Cli,
    options: &FormatOptions,
    cfg: &OxfmtConfig,
    pending_js: Option<&PendingJsSort>,
) -> Result<ExitCode> {
    let filepath = cli
        .stdin_filepath
        .as_ref()
        .ok_or_else(|| anyhow!("--stdin requires --stdin-filepath PATH"))?;

    let mut source = String::new();
    io::stdin()
        .read_to_string(&mut source)
        .context("failed to read stdin")?;

    if is_svelte(filepath) {
        // Custom Tailwind config: collect this source's class strings, sort them
        // in one sidecar call, then format with the resolved map-backed sorter.
        let owned_options;
        let options = match pending_js {
            Some(pending) => {
                let classes = collect_source_classes(&source, options);
                let mut opts = options.clone();
                opts.class_sorter = resolve_js_class_sorter(pending, classes);
                owned_options = opts;
                &owned_options
            }
            None => options,
        };
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
    } else if !cli.no_native_css && is_native_css(filepath) {
        // Standalone `.css`/`.scss`/`.less` on stdin: format in-process via
        // `oxc_formatter_css` (same engine as oxfmt). A parse error defers to
        // oxfmt so coverage matches delegation exactly.
        let ext = filepath
            .extension()
            .and_then(OsStr::to_str)
            .unwrap_or("css");
        let variant = css_variant_from_lang(ext);
        match format_css_source(&source, variant, &build_css_options(cli, cfg)) {
            Ok(formatted) => {
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
            }
            Err(_) => oxfmt_stdin(
                &cli.oxfmt_bin,
                cfg.oxfmt_arg_path.as_deref(),
                filepath,
                &source,
                cli.check,
            ),
        }
    } else {
        // Pass through to oxfmt via stdin.
        oxfmt_stdin(
            &cli.oxfmt_bin,
            cfg.oxfmt_arg_path.as_deref(),
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
#[allow(clippy::type_complexity)]
fn partition_files(
    roots: &[PathBuf],
    ignore: &oxfmt_ignore::SvelteIgnore,
    cwd: &Path,
    native_js: bool,
    native_css: bool,
) -> Result<(
    Vec<PathBuf>,
    Vec<PathBuf>,
    Vec<PathBuf>,
    Vec<PathBuf>,
    Vec<PathBuf>,
)> {
    let mut svelte = Vec::new();
    let mut native = Vec::new();
    let mut native_json = Vec::new();
    let mut native_css_files = Vec::new();
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
                if !entry.file_type().is_some_and(|ft| ft.is_file()) {
                    continue;
                }
                if is_svelte(path) && !ignore.is_ignored(path, false) {
                    svelte.push(entry.into_path());
                } else if native_js && is_native_js(path) && !ignore.is_ignored(path, false) {
                    native.push(entry.into_path());
                } else if native_js && is_native_json(path) && !ignore.is_ignored(path, false) {
                    // JSON (incl. `package.json`) goes to the native-JSON pass;
                    // `package.json` is re-delegated to oxfmt there.
                    native_json.push(entry.into_path());
                } else if native_css && is_native_css(path) && !ignore.is_ignored(path, false) {
                    // `.css`/`.scss`/`.less` go to the native-CSS pass; parse
                    // errors are re-delegated to oxfmt there.
                    native_css_files.push(entry.into_path());
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
        } else if native_js && is_native_js(root) {
            // Single explicit `.ts`/`.js` file — native pass (same ignore rules).
            let abs = if root.is_absolute() {
                root.clone()
            } else {
                cwd.join(root)
            };
            if !ignore.is_ignored(&abs, false) {
                native.push(root.clone());
            }
        } else if native_js && is_native_json(root) {
            // Single explicit `.json`/`.jsonc` file — native-JSON pass.
            let abs = if root.is_absolute() {
                root.clone()
            } else {
                cwd.join(root)
            };
            if !ignore.is_ignored(&abs, false) {
                native_json.push(root.clone());
            }
        } else if native_css && is_native_css(root) {
            // Single explicit `.css`/`.scss`/`.less` file — native-CSS pass.
            let abs = if root.is_absolute() {
                root.clone()
            } else {
                cwd.join(root)
            };
            if !ignore.is_ignored(&abs, false) {
                native_css_files.push(root.clone());
            }
        } else {
            oxfmt_paths.push(root.clone());
        }
    }
    Ok((svelte, native, native_json, native_css_files, oxfmt_paths))
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

/// Format every `.svelte` file in parallel with the in-process native `<style>`
/// formatter already wired into `options`. No `oxfmt` subprocess is involved, so
/// there's nothing to batch — each file formats end-to-end (markup + `<script>`
/// + `<style>`) in one pass. Used whenever native CSS is enabled (the default).
fn run_svelte_files_native(
    files: &[PathBuf],
    options: &FormatOptions,
    mode: Mode,
) -> Result<PipelineStatus> {
    let outcomes: Vec<(PathBuf, NativeOutcome)> = files
        .par_iter()
        .map(|path| {
            let source = match std::fs::read_to_string(path) {
                Ok(s) => s,
                Err(e) => {
                    return (
                        path.clone(),
                        NativeOutcome::Error(format!("reading {}: {e}", path.display())),
                    );
                }
            };
            match format(&source, options) {
                Ok(out) if out == source => (path.clone(), NativeOutcome::Unchanged),
                Ok(out) => match mode {
                    Mode::Write => match write_atomic(path, &out) {
                        Ok(()) => (path.clone(), NativeOutcome::Changed),
                        Err(e) => (
                            path.clone(),
                            NativeOutcome::Error(format!("writing {}: {e}", path.display())),
                        ),
                    },
                    Mode::Check => (path.clone(), NativeOutcome::Changed),
                },
                Err(e) => (
                    path.clone(),
                    NativeOutcome::Error(format!("rsvelte_formatter error: {e}")),
                ),
            }
        })
        .collect();

    let mut status = PipelineStatus {
        files_total: files.len(),
        ..PipelineStatus::default()
    };
    for (path, outcome) in outcomes {
        match outcome {
            NativeOutcome::Changed => {
                if matches!(mode, Mode::Check) {
                    println!("would format {}", path.display());
                }
                status.files_changed += 1;
            }
            NativeOutcome::Unchanged => {}
            // The Svelte pass has no oxfmt fallback: a `.svelte` file that fails
            // to parse is a hard error (there's no other engine that formats it).
            // `run_svelte_files_native` never yields `Fallback`; it's covered for
            // exhaustiveness only.
            NativeOutcome::Error(e) => {
                eprintln!("rsvelte-fmt: {}: {e}", path.display());
                status.had_errors = true;
            }
            NativeOutcome::Fallback => status.had_errors = true,
        }
    }
    Ok(status)
}

/// Format every `.svelte` file, batching all their `<style>` bodies into a
/// single `oxfmt` invocation. Used only under `--no-native-css`.
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
    native_css: bool,
) -> Result<PipelineStatus> {
    // Native CSS path: `<style>` bodies format in-process via `options`'
    // native style callback, so there's no `oxfmt` subprocess to amortize —
    // format each file directly in parallel, skipping the collect/batch/cache/
    // daemon machinery entirely (that exists only to batch `oxfmt` spawns).
    if native_css {
        return run_svelte_files_native(files, options, mode);
    }

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
        StyleCache::new(oxfmt, cfg.oxfmt_arg_path.as_deref())
    } else {
        None
    };

    let formatted_css = format_styles_cached(
        oxfmt,
        cfg.oxfmt_arg_path.as_deref(),
        &slot_css,
        cache.as_ref(),
    )
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

    // Prefer the warm daemon (POSIX): one socket round-trip per block instead of
    // a fresh `oxfmt` Node start. The daemon is dumb — it formats with the
    // options we resolve here — so its output is byte-identical to the spawn
    // path. Any failure disables it for the rest of this run and we fall back to
    // spawning oxfmt, so correctness never depends on it.
    #[cfg(unix)]
    let mut daemon = daemon::DaemonClient::try_start(oxfmt);

    let mut results = vec![String::new(); styles.len()];
    let mut all_ok = true;
    for (width, idxs) in by_width {
        let group: Vec<(&str, &str)> = idxs
            .iter()
            .map(|&i| (styles[i].css, styles[i].lang))
            .collect();

        // `mut`/`placed` are only mutated on unix (the daemon branch); on other
        // targets the spawn path below always runs.
        #[allow(unused_mut)]
        let mut placed = false;
        #[cfg(unix)]
        if let Some(d) = daemon.as_mut() {
            let options = css_options_for_width(config, width);
            match d.format_group(&group, &options) {
                Some((formatted, ok)) => {
                    all_ok &= ok;
                    for (&slot, css) in idxs.iter().zip(formatted) {
                        results[slot] = css;
                    }
                    placed = true;
                }
                // Drop the daemon and fall back to spawning for this group and
                // every group after it.
                None => daemon = None,
            }
        }

        if !placed {
            // Narrow the project config to this width so oxfmt wraps embedded CSS
            // at the same column the block renders at (falls back to base config).
            let cfg = css_config_for_width(config, width);
            let (formatted, ok) = batch_format_styles_group(oxfmt, cfg.as_deref(), &group)?;
            all_ok &= ok;
            for (slot, css) in idxs.into_iter().zip(formatted) {
                results[slot] = css;
            }
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

/// Write `data` to `path` atomically: stage it in a uniquely-named temp file in
/// the same directory, then `rename` it into place. A plain `fs::write`
/// truncates the target up front, so a crash or a concurrent reader can observe
/// a half-written (or empty) file; the rename swap is atomic and same-directory
/// (guaranteed same filesystem). Same approach as the `<style>` cache.
fn write_atomic(path: &Path, data: impl AsRef<[u8]>) -> io::Result<()> {
    let dir = path.parent().filter(|p| !p.as_os_str().is_empty());
    let dir = dir.unwrap_or_else(|| Path::new("."));
    let name = path
        .file_name()
        .map(|n| n.to_string_lossy())
        .unwrap_or_default();
    let tmp = dir.join(format!(".{name}.rsvelte-fmt-tmp{}", next_tmp_id()));
    if let Err(e) = std::fs::write(&tmp, data) {
        let _ = std::fs::remove_file(&tmp);
        return Err(e);
    }
    if let Err(e) = std::fs::rename(&tmp, path) {
        let _ = std::fs::remove_file(&tmp);
        return Err(e);
    }
    Ok(())
}

/// Process-unique temp-file suffix (PID high bits + a monotonic counter) so
/// concurrent atomic writes never collide on a staging path.
fn next_tmp_id() -> u64 {
    static COUNTER: AtomicU64 = AtomicU64::new(0);
    let n = COUNTER.fetch_add(1, Ordering::Relaxed);
    ((std::process::id() as u64) << 32) | n
}

/// Write `formatted` back to `path` (write mode) or report it (check mode).
/// Returns whether the file would change.
fn apply_output(path: &Path, source: &str, formatted: &str, mode: Mode) -> Result<bool> {
    if formatted == source {
        return Ok(false);
    }
    match mode {
        Mode::Write => {
            write_atomic(path, formatted).with_context(|| format!("writing {}", path.display()))?;
            Ok(true)
        }
        Mode::Check => {
            println!("would format {}", path.display());
            Ok(true)
        }
    }
}

// ─── native JS/TS pipeline ────────────────────────────────────────────────

/// Resolves the per-file [`JsFormatOptions`] for the native `.ts`/`.js` path:
/// the base options layered with any matching `.oxfmtrc` `overrides`. Glob
/// matchers are built once; `for_path` is cheap per file.
struct JsOptionsResolver {
    base: JsFormatOptions,
    /// `(glob matcher rooted at the config dir, the override's option subset)`.
    overrides: Vec<(Gitignore, OxfmtConfig)>,
    /// Whether an override's `printWidth`/`tabWidth` may apply — false when a
    /// CLI width flag took precedence over the config.
    apply_override_width: bool,
}

impl JsOptionsResolver {
    fn new(options: &FormatOptions, cfg: &OxfmtConfig, cwd: &Path, cli_width_flag: bool) -> Self {
        let dir = cfg
            .config_dir()
            .map(Path::to_path_buf)
            .unwrap_or_else(|| cwd.to_path_buf());
        let overrides = cfg
            .overrides
            .iter()
            .filter_map(|ov| {
                let mut builder = GitignoreBuilder::new(&dir);
                for glob in &ov.files {
                    let _ = builder.add_line(None, glob);
                }
                builder.build().ok().map(|gi| (gi, ov.options.clone()))
            })
            .collect();
        Self {
            base: options.js.clone(),
            overrides,
            apply_override_width: !cli_width_flag,
        }
    }

    /// The options for `abs_path` — base with every matching override merged on
    /// top in source order (prettier semantics). `abs_path` must be absolute so
    /// it can be matched against the config-dir-rooted globs.
    /// The options for `abs_path`, or `None` when the file can't be formatted
    /// natively at parity and must be delegated to oxfmt — specifically when a
    /// matching override sets `printWidth` above `oxc_formatter`'s representable
    /// maximum (320). oxfmt honors larger widths (e.g. flyle's `printWidth:
    /// 1000` "never wrap" overrides), so those files go to oxfmt to stay
    /// byte-identical rather than wrapping at 320.
    fn for_path(&self, abs_path: &Path) -> Option<JsFormatOptions> {
        let matching: Vec<&OxfmtConfig> = self
            .overrides
            .iter()
            .filter(|(matcher, _)| matcher.matched(abs_path, false).is_ignore())
            .map(|(_, opts)| opts)
            .collect();
        if self.apply_override_width
            && matching
                .iter()
                .any(|o| o.print_width.is_some_and(|w| w > LINE_WIDTH_MAX))
        {
            return None;
        }
        let mut js = self.base.clone();
        for opts in matching {
            opts.apply_js(&mut js);
            if self.apply_override_width {
                opts.apply_width(&mut js);
            }
        }
        Some(js)
    }
}

/// Outcome of formatting one native-JS file.
enum NativeOutcome {
    Changed,
    Unchanged,
    /// oxc couldn't parse the file — retry it through `oxfmt` so coverage never
    /// regresses on edge syntax the in-process parser rejects.
    Fallback,
    Error(String),
}

/// Format `.ts`/`.js` files in-process via `oxc_formatter` (the same engine
/// `oxfmt` uses), in parallel. Files oxc can't parse fall back to a single
/// `oxfmt` invocation so coverage matches delegation exactly.
fn run_native_js(
    files: &[PathBuf],
    resolver: &JsOptionsResolver,
    cwd: &Path,
    oxfmt: &Path,
    mode: Mode,
) -> Result<PipelineStatus> {
    if files.is_empty() {
        return Ok(PipelineStatus::default());
    }

    let outcomes: Vec<(PathBuf, NativeOutcome)> = files
        .par_iter()
        .map(|path| {
            let abs = if path.is_absolute() {
                path.clone()
            } else {
                cwd.join(path)
            };
            let source = match std::fs::read_to_string(path) {
                Ok(s) => s,
                Err(e) => {
                    return (
                        path.clone(),
                        NativeOutcome::Error(format!("reading {}: {e}", path.display())),
                    );
                }
            };
            let ext = path.extension().and_then(OsStr::to_str).unwrap_or("ts");
            // An override that can't be represented natively (printWidth > 320)
            // delegates this file to oxfmt for byte-identical output.
            let Some(js) = resolver.for_path(&abs) else {
                return (path.clone(), NativeOutcome::Fallback);
            };
            let opts = FormatOptions {
                js,
                style_formatter: None,
                typescript: false,
                ..FormatOptions::new()
            };
            match format_js_source(&source, ext, &opts) {
                Ok(out) if out == source => (path.clone(), NativeOutcome::Unchanged),
                Ok(out) => match mode {
                    Mode::Write => match write_atomic(path, &out) {
                        Ok(()) => (path.clone(), NativeOutcome::Changed),
                        Err(e) => (
                            path.clone(),
                            NativeOutcome::Error(format!("writing {}: {e}", path.display())),
                        ),
                    },
                    Mode::Check => (path.clone(), NativeOutcome::Changed),
                },
                // Parse error — defer to the oxfmt fallback.
                Err(_) => (path.clone(), NativeOutcome::Fallback),
            }
        })
        .collect();

    let mut status = PipelineStatus {
        files_total: files.len(),
        ..PipelineStatus::default()
    };
    let mut fallback: Vec<PathBuf> = Vec::new();
    for (path, outcome) in outcomes {
        match outcome {
            NativeOutcome::Changed => {
                if matches!(mode, Mode::Check) {
                    println!("would format {}", path.display());
                }
                status.files_changed += 1;
            }
            NativeOutcome::Unchanged => {}
            NativeOutcome::Fallback => fallback.push(path),
            NativeOutcome::Error(e) => {
                eprintln!("rsvelte-fmt: {e}");
                status.had_errors = true;
            }
        }
    }

    // oxfmt fallback for the (rare) files oxc couldn't parse. They're already
    // counted in `files_total`; a parse-error file the fallback also can't
    // handle surfaces oxfmt's own diagnostics.
    if !fallback.is_empty() {
        let fb = run_oxfmt(&fallback, oxfmt, mode, false, false, false, true)?;
        status.files_changed += fb.files_changed;
        status.had_errors |= fb.had_errors;
    }

    Ok(status)
}

// ─── native JSON pipeline ─────────────────────────────────────────────────

/// Resolves the per-file [`JsonFormatOptions`] for the native-JSON path. JSON
/// has no `overrides`-merging here: a file matched by any `.oxfmtrc` override —
/// or any file when the base `printWidth` exceeds `oxc_formatter_core`'s max
/// (320) — is delegated to `oxfmt` rather than risk a mismatch. flyle-style
/// configs only override `.ts`/`.js` globs, so JSON formats natively there.
struct JsonOptionsResolver {
    base: JsonFormatOptions,
    /// Base `printWidth` exceeds the native max (320) — can't represent natively.
    over_width: bool,
    /// Override glob matchers (rooted at the config dir). Any match → delegate.
    overrides: Vec<Gitignore>,
}

impl JsonOptionsResolver {
    fn new(base: JsonFormatOptions, base_print_width: u16, cfg: &OxfmtConfig, cwd: &Path) -> Self {
        let dir = cfg
            .config_dir()
            .map(Path::to_path_buf)
            .unwrap_or_else(|| cwd.to_path_buf());
        let overrides = cfg
            .overrides
            .iter()
            .filter_map(|ov| {
                let mut builder = GitignoreBuilder::new(&dir);
                for glob in &ov.files {
                    let _ = builder.add_line(None, glob);
                }
                builder.build().ok()
            })
            .collect();
        Self {
            base,
            over_width: base_print_width > LINE_WIDTH_MAX,
            overrides,
        }
    }

    /// The native options for `abs_path`, or `None` to delegate it to `oxfmt`.
    fn for_path(&self, abs_path: &Path) -> Option<JsonFormatOptions> {
        if self.over_width {
            return None;
        }
        if self
            .overrides
            .iter()
            .any(|m| m.matched(abs_path, false).is_ignore())
        {
            return None;
        }
        Some(self.base)
    }
}

/// Format `.json`/`.jsonc`/`.json5` in-process via `oxc_formatter_json` (the same
/// engine `oxfmt` uses, so byte-identical), in parallel. `package.json` (needs
/// oxfmt's `sortPackageJson`), files an override touches, and parse errors all
/// fall back to a single `oxfmt` invocation so coverage matches delegation.
fn run_native_json(
    files: &[PathBuf],
    resolver: &JsonOptionsResolver,
    cwd: &Path,
    oxfmt: &Path,
    mode: Mode,
) -> Result<PipelineStatus> {
    if files.is_empty() {
        return Ok(PipelineStatus::default());
    }

    let outcomes: Vec<(PathBuf, NativeOutcome)> = files
        .par_iter()
        .map(|path| {
            // `package.json` always goes to oxfmt for the `sortPackageJson` pass.
            if is_package_json(path) {
                return (path.clone(), NativeOutcome::Fallback);
            }
            let abs = if path.is_absolute() {
                path.clone()
            } else {
                cwd.join(path)
            };
            let source = match std::fs::read_to_string(path) {
                Ok(s) => s,
                Err(e) => {
                    return (
                        path.clone(),
                        NativeOutcome::Error(format!("reading {}: {e}", path.display())),
                    );
                }
            };
            let Some(options) = resolver.for_path(&abs) else {
                return (path.clone(), NativeOutcome::Fallback);
            };
            let ext = path.extension().and_then(OsStr::to_str).unwrap_or("json");
            match format_json_source(&source, json_variant(ext), &options) {
                Ok(out) if out == source => (path.clone(), NativeOutcome::Unchanged),
                Ok(out) => match mode {
                    Mode::Write => match write_atomic(path, &out) {
                        Ok(()) => (path.clone(), NativeOutcome::Changed),
                        Err(e) => (
                            path.clone(),
                            NativeOutcome::Error(format!("writing {}: {e}", path.display())),
                        ),
                    },
                    Mode::Check => (path.clone(), NativeOutcome::Changed),
                },
                // Parse error — defer to the oxfmt fallback.
                Err(_) => (path.clone(), NativeOutcome::Fallback),
            }
        })
        .collect();

    let mut status = PipelineStatus {
        files_total: files.len(),
        ..PipelineStatus::default()
    };
    let mut fallback: Vec<PathBuf> = Vec::new();
    for (path, outcome) in outcomes {
        match outcome {
            NativeOutcome::Changed => {
                if matches!(mode, Mode::Check) {
                    println!("would format {}", path.display());
                }
                status.files_changed += 1;
            }
            NativeOutcome::Unchanged => {}
            NativeOutcome::Fallback => fallback.push(path),
            NativeOutcome::Error(e) => {
                eprintln!("rsvelte-fmt: {e}");
                status.had_errors = true;
            }
        }
    }

    // oxfmt fallback for `package.json` + override-matched + parse-error files.
    // Explicit paths with no native excludes, so oxfmt formats exactly these
    // (and applies `sortPackageJson` to any `package.json`).
    if !fallback.is_empty() {
        let fb = run_oxfmt(&fallback, oxfmt, mode, false, false, false, true)?;
        status.files_changed += fb.files_changed;
        status.had_errors |= fb.had_errors;
    }

    Ok(status)
}

// ─── native CSS pipeline ──────────────────────────────────────────────────

/// Resolves the per-file [`CssFormatOptions`] for the native-CSS path. Like the
/// native-JSON resolver, a file matched by any `.oxfmtrc` override — or any file
/// when the base `printWidth` exceeds `oxc_formatter_core`'s max (320) — is
/// delegated to `oxfmt` rather than risk a mismatch.
struct CssOptionsResolver {
    base: CssFormatOptions,
    /// Base `printWidth` exceeds the native max (320) — can't represent natively.
    over_width: bool,
    /// Override glob matchers (rooted at the config dir). Any match → delegate.
    overrides: Vec<Gitignore>,
}

impl CssOptionsResolver {
    fn new(base: CssFormatOptions, base_print_width: u16, cfg: &OxfmtConfig, cwd: &Path) -> Self {
        let dir = cfg
            .config_dir()
            .map(Path::to_path_buf)
            .unwrap_or_else(|| cwd.to_path_buf());
        let overrides = cfg
            .overrides
            .iter()
            .filter_map(|ov| {
                let mut builder = GitignoreBuilder::new(&dir);
                for glob in &ov.files {
                    let _ = builder.add_line(None, glob);
                }
                builder.build().ok()
            })
            .collect();
        Self {
            base,
            over_width: base_print_width > LINE_WIDTH_MAX,
            overrides,
        }
    }

    /// The native options for `abs_path`, or `None` to delegate it to `oxfmt`.
    fn for_path(&self, abs_path: &Path) -> Option<CssFormatOptions> {
        if self.over_width {
            return None;
        }
        if self
            .overrides
            .iter()
            .any(|m| m.matched(abs_path, false).is_ignore())
        {
            return None;
        }
        Some(self.base)
    }
}

/// Format `.css`/`.scss`/`.less` in-process via `oxc_formatter_css` (the same
/// engine `oxfmt` uses, so byte-identical), in parallel. Files an override
/// touches and parse errors fall back to a single `oxfmt` invocation so coverage
/// matches delegation.
fn run_native_css(
    files: &[PathBuf],
    resolver: &CssOptionsResolver,
    cwd: &Path,
    oxfmt: &Path,
    mode: Mode,
) -> Result<PipelineStatus> {
    if files.is_empty() {
        return Ok(PipelineStatus::default());
    }

    let outcomes: Vec<(PathBuf, NativeOutcome)> = files
        .par_iter()
        .map(|path| {
            let abs = if path.is_absolute() {
                path.clone()
            } else {
                cwd.join(path)
            };
            let source = match std::fs::read_to_string(path) {
                Ok(s) => s,
                Err(e) => {
                    return (
                        path.clone(),
                        NativeOutcome::Error(format!("reading {}: {e}", path.display())),
                    );
                }
            };
            let Some(options) = resolver.for_path(&abs) else {
                return (path.clone(), NativeOutcome::Fallback);
            };
            let ext = path.extension().and_then(OsStr::to_str).unwrap_or("css");
            match format_css_source(&source, css_variant_from_lang(ext), &options) {
                Ok(out) if out == source => (path.clone(), NativeOutcome::Unchanged),
                Ok(out) => match mode {
                    Mode::Write => match write_atomic(path, &out) {
                        Ok(()) => (path.clone(), NativeOutcome::Changed),
                        Err(e) => (
                            path.clone(),
                            NativeOutcome::Error(format!("writing {}: {e}", path.display())),
                        ),
                    },
                    Mode::Check => (path.clone(), NativeOutcome::Changed),
                },
                // Parse error — defer to the oxfmt fallback.
                Err(_) => (path.clone(), NativeOutcome::Fallback),
            }
        })
        .collect();

    let mut status = PipelineStatus {
        files_total: files.len(),
        ..PipelineStatus::default()
    };
    let mut fallback: Vec<PathBuf> = Vec::new();
    for (path, outcome) in outcomes {
        match outcome {
            NativeOutcome::Changed => {
                if matches!(mode, Mode::Check) {
                    println!("would format {}", path.display());
                }
                status.files_changed += 1;
            }
            NativeOutcome::Unchanged => {}
            NativeOutcome::Fallback => fallback.push(path),
            NativeOutcome::Error(e) => {
                eprintln!("rsvelte-fmt: {e}");
                status.had_errors = true;
            }
        }
    }

    // oxfmt fallback for override-matched + parse-error files. Explicit paths
    // with no native excludes, so oxfmt formats exactly these.
    if !fallback.is_empty() {
        let fb = run_oxfmt(&fallback, oxfmt, mode, false, false, false, true)?;
        status.files_changed += fb.files_changed;
        status.had_errors |= fb.had_errors;
    }

    Ok(status)
}

// ─── oxfmt delegation ───────────────────────────────────────────────────

/// Delegate every non-`.svelte` path to a single `oxfmt` invocation.
///
/// `paths` are the user's directory / file inputs verbatim; a `!**/*.svelte`
/// exclude keeps Svelte files for the in-process pass. `suppress_unmatched`
/// adds `--no-error-on-unmatched-pattern`, which makes a tree with only
/// `.svelte` files (or whichever set an in-process pass already handled) a
/// clean no-op rather than an error; callers pass `false` when oxfmt's own
/// share is the last remaining source of truth for whether anything exists to
/// format at all, so it must be allowed to error for real (see the
/// `in_process_empty` check in `run`). oxfmt's informational summary
/// ("Finished … on N files", "Format issues found in above N files") goes to
/// stdout; we capture it to recover file counts for our own summary, then
/// forward it. Warnings/errors on stderr stay inherited.
fn run_oxfmt(
    paths: &[PathBuf],
    oxfmt: &Path,
    mode: Mode,
    exclude_native: bool,
    exclude_native_json: bool,
    exclude_native_css: bool,
    suppress_unmatched: bool,
) -> Result<PipelineStatus> {
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
    if suppress_unmatched {
        cmd.arg("--no-error-on-unmatched-pattern");
    }
    cmd.arg(OXFMT_EXCLUDE_SVELTE);
    // When the native `.ts`/`.js` path handled those files in-process, keep
    // oxfmt from re-formatting them in directory walks.
    if exclude_native {
        cmd.args(OXFMT_EXCLUDE_NATIVE_JS);
    }
    // Likewise for native JSON. `package.json` is re-delegated as an explicit
    // path by the native-JSON fallback (a separate call with this flag false),
    // so excluding it from the directory walk here doesn't drop it.
    if exclude_native_json {
        cmd.args(OXFMT_EXCLUDE_NATIVE_JSON);
    }
    // Likewise for native CSS (`.css`/`.scss`/`.less`).
    if exclude_native_css {
        cmd.args(OXFMT_EXCLUDE_NATIVE_CSS);
    }
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
