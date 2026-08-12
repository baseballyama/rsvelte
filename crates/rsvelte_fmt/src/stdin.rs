use std::ffi::OsStr;
use std::io::{self, Read, Write};
use std::path::Path;
use std::process::ExitCode;

use anyhow::{Context, Result, anyhow};
use rsvelte_formatter::{FormatOptions, css_variant_from_lang, format, format_css_source};

use crate::cli::Cli;
use crate::config::OxfmtConfig;
use crate::options::{OptionFlags, build_css_options};
use crate::oxfmt::oxfmt_stdin;
use crate::paths::{is_native_css, is_svelte};
use crate::tailwind_sort::{PendingJsSort, collect_source_classes, resolve_js_class_sorter};

// ─── stdin path ─────────────────────────────────────────────────────────

pub fn run_stdin(
    cli: &Cli,
    flags: &OptionFlags,
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

    if let Some(formatted) = format_in_process(&source, filepath, flags, options, cfg, pending_js)?
    {
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
        let out = oxfmt_stdin(
            &flags.oxfmt_bin,
            cfg.oxfmt_arg_path.as_deref(),
            filepath,
            &source,
            cli.check,
        )?;
        io::stdout()
            .write_all(&out.stdout)
            .context("failed to write stdout")?;
        let code = u8::try_from(out.code).context("oxfmt returned an invalid exit status")?;
        Ok(ExitCode::from(code))
    }
}

/// The in-process half of the stdin dispatch: `.svelte` via
/// [`rsvelte_formatter::format`], standalone `.css`/`.scss`/`.less` via
/// `oxc_formatter_css`. `Ok(None)` means the source has no in-process
/// formatter — or its CSS parse failed, where deferring keeps coverage
/// identical to delegation — and must be handed to `oxfmt`.
pub fn format_in_process(
    source: &str,
    filepath: &Path,
    flags: &OptionFlags,
    options: &FormatOptions,
    cfg: &OxfmtConfig,
    pending_js: Option<&PendingJsSort>,
) -> Result<Option<String>> {
    if is_svelte(filepath) {
        // Custom Tailwind config: collect this source's class strings, sort them
        // in one sidecar call, then format with the resolved map-backed sorter.
        let owned_options = pending_js.map(|pending| {
            let classes = collect_source_classes(source, options);
            let mut opts = options.clone();
            opts.class_sorter = resolve_js_class_sorter(pending, classes);
            opts
        });
        let options = owned_options.as_ref().unwrap_or(options);
        let formatted =
            format(source, options).map_err(|e| anyhow!("rsvelte_formatter error: {e}"))?;
        Ok(Some(formatted))
    } else if !flags.no_native_css && is_native_css(filepath) {
        let ext = filepath
            .extension()
            .and_then(OsStr::to_str)
            .unwrap_or("css");
        let variant = css_variant_from_lang(ext);
        Ok(format_css_source(source, variant, &build_css_options(flags, cfg)).ok())
    } else {
        Ok(None)
    }
}
