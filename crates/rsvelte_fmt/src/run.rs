use std::path::PathBuf;
use std::process::ExitCode;

use anyhow::{Result, anyhow};
use clap::Parser;

use crate::cli::Cli;
use crate::config::OxfmtConfig;
use crate::native_css::{CssOptionsResolver, run_native_css};
use crate::native_js::{JsOptionsResolver, run_native_js};
use crate::native_json::{JsonOptionsResolver, run_native_json};
use crate::options::{OptionFlags, build_css_options, build_format_options, build_json_options};
use crate::oxfmt::{NativeExclusions, OxfmtRunOptions, run_oxfmt};
use crate::oxfmt_ignore;
use crate::status::{Mode, PipelineStatus, combine};
use crate::stdin::run_stdin;
use crate::svelte_pipeline::run_svelte_files;
use crate::tailwind_sort::{collect_svelte_classes, resolve_js_class_sorter};
use crate::walk::partition_files;

/// Default rayon workers get the platform's default thread stack (~2 MiB),
/// but the formatter's own recursive printer can overflow that in an
/// unoptimized build at a nesting depth the parser still accepts (just under
/// `MAX_NESTING_DEPTH`, see #1838). Every rayon call in the pipeline —
/// `collect_svelte_classes`, the per-file Svelte/JS/JSON/CSS passes, and the
/// `oxfmt`-overlap `join` — runs inside a dedicated pool sized like the
/// 8 MiB default main-thread stack the parser's own overflow tests use,
/// rather than the process-wide global pool: `build_global` can only
/// succeed once per process, which would make `run()` unsafe to call twice
/// in the same process (e.g. from tests).
const FMT_POOL_STACK_SIZE: usize = 8 * 1024 * 1024;

fn fmt_thread_pool() -> rayon::ThreadPool {
    rayon::ThreadPoolBuilder::new()
        .stack_size(FMT_POOL_STACK_SIZE)
        .build()
        .expect("build rsvelte-fmt's rayon pool")
}

/// Run the `rsvelte-fmt` command-line formatter.
///
/// # Errors
///
/// Returns an error when configuration resolution, file discovery, or formatting fails.
pub fn run() -> Result<ExitCode> {
    let mut cli = Cli::parse();

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
        .map_or_else(|| cwd.clone(), std::path::Path::to_path_buf);
    let cfg = OxfmtConfig::resolve(cli.config.as_deref(), &config_start).map_err(|e| anyhow!(e))?;

    let flags = OptionFlags::from_cli(&cli);
    let (mut options, pending_js) = build_format_options(&flags, &cfg);

    if cli.stdin {
        return run_stdin(&cli, &flags, &options, &cfg, pending_js.as_ref());
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

    // Every rayon call below — this collection scan, and the per-file join
    // tree further down — runs on this dedicated pool rather than the
    // process-wide global one (see `fmt_thread_pool`).
    let pool = fmt_thread_pool();

    // Custom Tailwind config (`SortViaJs`): collect every class string across the
    // `.svelte` files, sort them in one sidecar call, and install a map-backed
    // sorter for the real formatting pass below. Only `.svelte` files carry the
    // class sorter, so nothing else needs the collection pass.
    if let Some(pending) = &pending_js {
        let classes = pool.install(|| collect_svelte_classes(&svelte, &options));
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
    let json_options = build_json_options(&flags, &cfg);
    let base_print_width = cli.print_width.or(cfg.print_width).unwrap_or(80);
    let json_resolver = JsonOptionsResolver::new(json_options, base_print_width, &cfg, &cwd);

    // Per-file CSS options resolver (native CSS; overrides + over-width delegate
    // to oxfmt, mirroring native JSON).
    let css_options = build_css_options(&flags, &cfg);
    let css_resolver = CssOptionsResolver::new(css_options, base_print_width, &cfg, &cwd);

    // Run the pipelines in parallel: the oxfmt subprocess overlaps with the
    // in-process Svelte, native-JS, native-JSON, and native-CSS formatters.
    let use_style_cache = !cli.no_style_cache;
    let exclude_native = native_js && !native.is_empty();
    let exclude_native_json = native_js && !native_json.is_empty();
    let exclude_native_css = native_css && !native_css_files.is_empty();
    let (((svelte_result, native_result), (json_result, css_result)), oxfmt_result) =
        pool.install(|| {
            rayon::join(
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
                        OxfmtRunOptions {
                            native_exclusions: NativeExclusions {
                                js: exclude_native,
                                json: exclude_native_json,
                                css: exclude_native_css,
                            },
                            // A Svelte-only or CSS-only tree legitimately leaves oxfmt's
                            // own share empty, so suppress its unmatched-pattern error —
                            // but not when every in-process pass is *also* empty: oxfmt
                            // is then the only thing that can tell (via its own ignore
                            // rules and supported-extension set) whether anything really
                            // exists to format, so it must be allowed to error for real.
                            suppress_unmatched: !in_process_empty,
                        },
                    )
                },
            )
        });

    let svelte_status = svelte_result?;
    let native_status = native_result?;
    let json_status = json_result?;
    let css_status = css_result?;
    let oxfmt_status = oxfmt_result?;
    let mut combined = svelte_status;
    combined.merge(&native_status);
    combined.merge(&json_status);
    combined.merge(&css_status);

    // oxfmt ran unsuppressed above and genuinely found nothing — its own
    // "no target file" message already went to stderr (inherited), so don't
    // also print our summary line; just propagate the error exit code.
    if in_process_empty && oxfmt_status.had_errors {
        return Ok(combine(&combined, &oxfmt_status, mode));
    }

    print_summary(&combined, &oxfmt_status, mode);
    Ok(combine(&combined, &oxfmt_status, mode))
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
