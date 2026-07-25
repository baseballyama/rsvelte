use std::ffi::OsStr;
use std::path::{Path, PathBuf};

use anyhow::Result;
use ignore::gitignore::{Gitignore, GitignoreBuilder};
use oxc_formatter::JsFormatOptions;
use rayon::prelude::*;
use rsvelte_formatter::{FormatOptions, format_js_source};

use crate::config::OxfmtConfig;
use crate::output::write_atomic;
use crate::oxfmt::run_oxfmt;
use crate::paths::LINE_WIDTH_MAX;
use crate::status::{Mode, NativeOutcome, PipelineStatus};

// ─── native JS/TS pipeline ────────────────────────────────────────────────

/// Resolves the per-file [`JsFormatOptions`] for the native `.ts`/`.js` path:
/// the base options layered with any matching `.oxfmtrc` `overrides`. Glob
/// matchers are built once; `for_path` is cheap per file.
pub(crate) struct JsOptionsResolver {
    base: JsFormatOptions,
    /// `(glob matcher rooted at the config dir, the override's option subset)`.
    overrides: Vec<(Gitignore, OxfmtConfig)>,
    /// Whether an override's `printWidth`/`tabWidth` may apply — false when a
    /// CLI width flag took precedence over the config.
    apply_override_width: bool,
}

impl JsOptionsResolver {
    pub(crate) fn new(
        options: &FormatOptions,
        cfg: &OxfmtConfig,
        cwd: &Path,
        cli_width_flag: bool,
    ) -> Self {
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

/// Format `.ts`/`.js` files in-process via `oxc_formatter` (the same engine
/// `oxfmt` uses), in parallel. Files oxc can't parse fall back to a single
/// `oxfmt` invocation so coverage matches delegation exactly.
pub(crate) fn run_native_js(
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
