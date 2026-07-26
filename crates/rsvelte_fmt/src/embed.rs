//! In-process formatting for embedders.
//!
//! A [`FormatSession`] is the `rsvelte-fmt --stdin --stdin-filepath` pipeline
//! without the process boundary: it resolves the project's oxfmt config, builds
//! the same [`FormatOptions`], and dispatches by extension through the same
//! code the CLI runs. Consumers (the language server) hold one per directory
//! and reuse it, since config discovery is the expensive part.

use std::path::{Path, PathBuf};

use anyhow::{Result, anyhow};
use rsvelte_formatter::FormatOptions;

use crate::config::OxfmtConfig;
use crate::options::{OptionFlags, build_format_options};
use crate::oxfmt::oxfmt_stdin;
use crate::stdin::format_in_process;
use crate::tailwind_sort::PendingJsSort;

pub struct FormatSession {
    flags: OptionFlags,
    cfg: OxfmtConfig,
    options: FormatOptions,
    pending_js: Option<PendingJsSort>,
}

impl FormatSession {
    /// Resolve the config for `path` the way the CLI does in stdin mode:
    /// search upward from the file itself for the nearest oxfmt config.
    /// Equivalent to `resolve_with_oxfmt_bin(path, None)` — see
    /// [`Self::resolve_with_oxfmt_bin`] for how the `oxfmt` binary itself is
    /// resolved.
    pub fn resolve(path: &Path) -> Result<Self> {
        Self::resolve_with_oxfmt_bin(path, None)
    }

    /// Resolve the config for `path` the way [`Self::resolve`] does, but let
    /// the caller pin the `oxfmt` binary explicitly — the embedder-facing
    /// equivalent of the CLI's `--oxfmt-bin` flag. An embedder that already
    /// knows where the consumer's `oxfmt` lives (e.g. a future
    /// language-server launcher that resolves it the way
    /// `apps/npm/fmt/bin/rsvelte-fmt` resolves its own, then execs the server
    /// with that information) should pass it here rather than rely on an
    /// editor-spawned process inheriting `$PATH`.
    ///
    /// `oxfmt_bin` precedence: the explicit `Some` here, else
    /// `RSVELTE_FMT_OXFMT_BIN` (for an embedder with no argv of its own to
    /// forward a resolved path through — mirrors the `RSVELTE_FMT_NODE`
    /// convention the CLI's own npm launcher already uses), else a bare
    /// `oxfmt` on `$PATH` (the CLI's own `--oxfmt-bin` default). Before this
    /// (#1792), `FormatSession::resolve` built `OptionFlags::default()`
    /// unconditionally, so a bare `oxfmt` on `$PATH` was the *only* option —
    /// never guaranteed for a process an editor spawns, unlike the CLI, which
    /// always has an explicit `--oxfmt-bin` from its own npm launcher.
    /// `RSVELTE_FMT_NODE`, if set, is honored automatically by every `oxfmt`
    /// invocation regardless of this value — see `crate::oxfmt::oxfmt_node`.
    pub fn resolve_with_oxfmt_bin(path: &Path, oxfmt_bin: Option<PathBuf>) -> Result<Self> {
        let cfg = OxfmtConfig::resolve(None, path).map_err(|e| anyhow!(e))?;
        let mut flags = OptionFlags::default();
        if let Some(bin) = oxfmt_bin.or_else(oxfmt_bin_from_env) {
            flags.oxfmt_bin = bin;
        }
        let (options, pending_js) = build_format_options(&flags, &cfg);
        Ok(Self {
            flags,
            cfg,
            options,
            pending_js,
        })
    }

    /// Format `source` as if it were piped to
    /// `rsvelte-fmt --stdin --stdin-filepath <filepath>`.
    pub fn format(&self, source: &str, filepath: &Path) -> Result<String> {
        if let Some(formatted) = format_in_process(
            source,
            filepath,
            &self.flags,
            &self.options,
            &self.cfg,
            self.pending_js.as_ref(),
        )? {
            return Ok(formatted);
        }

        let out = oxfmt_stdin(
            &self.flags.oxfmt_bin,
            self.cfg.oxfmt_arg_path.as_deref(),
            filepath,
            source,
            false,
        )?;
        if out.code != 0 {
            return Err(anyhow!("oxfmt exited with {}", out.code));
        }
        // A formatter that produced nothing is a failure, not "format to empty".
        if out.stdout.is_empty() {
            return Err(anyhow!("oxfmt produced no output"));
        }
        String::from_utf8(out.stdout).map_err(|e| anyhow!("oxfmt produced invalid utf-8: {e}"))
    }
}

/// `RSVELTE_FMT_OXFMT_BIN`, if set: the embedder-facing equivalent of the
/// CLI's `--oxfmt-bin` flag, for an embedder with no argv of its own to pass
/// it through directly (e.g. a language server launched by an editor) —
/// mirrors the `RSVELTE_FMT_NODE` convention the CLI's npm launcher already
/// uses to forward its resolution of the consumer's `oxfmt` + Node.
fn oxfmt_bin_from_env() -> Option<PathBuf> {
    std::env::var_os("RSVELTE_FMT_OXFMT_BIN")
        .filter(|v| !v.is_empty())
        .map(PathBuf::from)
}
