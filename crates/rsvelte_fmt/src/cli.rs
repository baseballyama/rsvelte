use std::path::PathBuf;

use clap::Parser;

/// rsvelte-fmt: fast Svelte + JS/TS/CSS formatter.
#[derive(Debug, Parser)]
#[command(version, about, long_about = None)]
pub struct Cli {
    /// Files or directories to format. `.svelte` files are formatted in
    /// process; every other path is delegated to `oxfmt`, so directories cover
    /// the full oxfmt-supported set (`.ts`/`.js`/`.css`/`.json` and also
    /// `.md`/`.yaml`/`.toml`/`.html`, etc.) — the same files `oxfmt .` would
    /// format. When omitted, the current directory is formatted (matching
    /// `oxfmt`). See #694.
    pub(crate) paths: Vec<PathBuf>,

    /// Write formatted output back to source files. Default when paths
    /// are given. Implied for directory inputs.
    #[arg(long)]
    pub(crate) write: bool,

    /// Check whether files are formatted. Exits non-zero if any file
    /// would be changed. Mutually exclusive with `--write`.
    #[arg(long, conflicts_with = "write")]
    pub(crate) check: bool,

    /// Format stdin and write the result to stdout. Use `--stdin-filepath`
    /// to tell the dispatcher which engine to use based on the filename.
    #[arg(long)]
    pub(crate) stdin: bool,

    /// Filename associated with the source on stdin (e.g.
    /// `--stdin-filepath src/App.svelte`). Required with `--stdin`.
    #[arg(long, value_name = "PATH")]
    pub(crate) stdin_filepath: Option<PathBuf>,

    /// Maximum line width before the formatter tries to break. Overrides
    /// `printWidth` from `.oxfmtrc`; defaults to 80 when neither is set.
    #[arg(long, value_name = "N")]
    pub(crate) print_width: Option<u16>,

    /// Number of spaces per indent level. Ignored when `--use-tabs`. Overrides
    /// `tabWidth` from `.oxfmtrc`; defaults to 2 when neither is set.
    #[arg(long, value_name = "N")]
    pub(crate) tab_width: Option<u8>,

    /// Indent with tabs instead of spaces. When omitted, `useTabs` from
    /// `.oxfmtrc` applies (if any), else spaces.
    #[arg(long)]
    pub(crate) use_tabs: bool,

    /// Path to an `.oxfmtrc` config file. When omitted, the nearest
    /// `.oxfmtrc.json` / `.oxfmtrc.jsonc` is discovered upward from the working
    /// directory (matching oxfmt). The resolved config drives inline
    /// `<script>` / `<style>` formatting so embedded blocks match standalone
    /// files (quote style, print width, …).
    #[arg(short = 'c', long, value_name = "PATH")]
    pub(crate) config: Option<PathBuf>,

    /// Path to the `oxfmt` binary. Defaults to `oxfmt` on `$PATH`.
    #[arg(long, value_name = "PATH", default_value = "oxfmt")]
    pub(crate) oxfmt_bin: PathBuf,

    /// Disable the on-disk cache of formatted inline `<style>` blocks. By
    /// default, formatted CSS is cached (keyed by oxfmt version + resolved
    /// config + body) so unchanged blocks skip the oxfmt round-trip on
    /// subsequent runs. Also disabled by `RSVELTE_FMT_NO_CACHE`. See #703.
    #[arg(long)]
    pub(crate) no_style_cache: bool,

    /// Format `.ts`/`.js` files by delegating to `oxfmt` instead of formatting
    /// them in-process via `oxc_formatter`. The in-process path is byte-identical
    /// (same engine) but avoids the per-invocation `oxfmt` startup; this flag is
    /// an escape hatch if a divergence is ever found.
    #[arg(long)]
    pub(crate) no_native_js: bool,

    /// Format CSS in-process via `oxc_formatter_css` — this covers both embedded
    /// `<style>` blocks in `.svelte` files and standalone `.css`/`.scss`/`.less`
    /// files — by delegating to `oxfmt` instead. The in-process path is
    /// byte-identical (same engine) but avoids the per-block/`per-file` `oxfmt`
    /// subprocess (and the staging/daemon/cache machinery it needs); this flag is
    /// an escape hatch if a divergence is ever found.
    #[arg(long)]
    pub(crate) no_native_css: bool,
}
