//! In-process formatting for embedders.
//!
//! A [`FormatSession`] is the `rsvelte-fmt --stdin --stdin-filepath` pipeline
//! without the process boundary: it resolves the project's oxfmt config, builds
//! the same [`FormatOptions`], and dispatches by extension through the same
//! code the CLI runs. Consumers (the language server) hold one per directory
//! and reuse it, since config discovery is the expensive part.

use std::path::Path;

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
    pub fn resolve(path: &Path) -> Result<Self> {
        let cfg = OxfmtConfig::resolve(None, path).map_err(|e| anyhow!(e))?;
        let flags = OptionFlags::default();
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
