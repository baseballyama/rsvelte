use std::ffi::OsStr;
use std::path::{Path, PathBuf};

use anyhow::Result;
use ignore::gitignore::{Gitignore, GitignoreBuilder};
use rayon::prelude::*;
use rsvelte_formatter::{JsonFormatOptions, format_json_source};

use crate::config::OxfmtConfig;
use crate::options::json_variant;
use crate::output::write_atomic;
use crate::oxfmt::{OxfmtRunOptions, run_oxfmt};
use crate::paths::{LINE_WIDTH_MAX, is_package_json};
use crate::status::{Mode, NativeOutcome, PipelineStatus};

// ─── native JSON pipeline ─────────────────────────────────────────────────

/// Resolves the per-file [`JsonFormatOptions`] for the native-JSON path. JSON
/// has no `overrides`-merging here: a file matched by any `.oxfmtrc` override —
/// or any file when the base `printWidth` exceeds `oxc_formatter_core`'s max
/// (320) — is delegated to `oxfmt` rather than risk a mismatch. flyle-style
/// configs only override `.ts`/`.js` globs, so JSON formats natively there.
pub struct JsonOptionsResolver {
    base: JsonFormatOptions,
    /// Base `printWidth` exceeds the native max (320) — can't represent natively.
    over_width: bool,
    /// Override glob matchers (rooted at the config dir). Any match → delegate.
    overrides: Vec<Gitignore>,
}

impl JsonOptionsResolver {
    pub(crate) fn new(
        base: JsonFormatOptions,
        base_print_width: u16,
        cfg: &OxfmtConfig,
        cwd: &Path,
    ) -> Self {
        let dir = cfg
            .config_dir()
            .map_or_else(|| cwd.to_path_buf(), Path::to_path_buf);
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
pub fn run_native_json(
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
        let fb = run_oxfmt(
            &fallback,
            oxfmt,
            mode,
            OxfmtRunOptions {
                suppress_unmatched: true,
                ..OxfmtRunOptions::default()
            },
        )?;
        status.files_changed += fb.files_changed;
        status.had_errors |= fb.had_errors;
    }

    Ok(status)
}
