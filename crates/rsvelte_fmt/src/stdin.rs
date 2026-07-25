use std::ffi::OsStr;
use std::io::{self, Read, Write};
use std::path::Path;
use std::process::{ExitCode, Stdio};

use anyhow::{Context, Result, anyhow};
use rsvelte_formatter::{FormatOptions, css_variant_from_lang, format, format_css_source};

use crate::cli::Cli;
use crate::config::OxfmtConfig;
use crate::options::build_css_options;
use crate::oxfmt::oxfmt_command;
use crate::paths::{is_native_css, is_svelte};
use crate::tailwind_sort::{PendingJsSort, collect_source_classes, resolve_js_class_sorter};

// ─── stdin path ─────────────────────────────────────────────────────────

pub(crate) fn run_stdin(
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
