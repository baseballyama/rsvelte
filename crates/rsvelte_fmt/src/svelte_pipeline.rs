use std::path::{Path, PathBuf};
use std::process::Stdio;
use std::sync::Arc;

use anyhow::{Context, Result};
use rayon::prelude::*;
use rsvelte_formatter::{Arenas, FormatOptions, format_with_arenas, reindent};

use crate::config::OxfmtConfig;
#[cfg(unix)]
use crate::daemon;
use crate::options::{css_config_for_width, css_options_for_width};
use crate::output::{apply_output, write_atomic};
use crate::oxfmt::{oxfmt_command, oxfmt_ext};
use crate::status::{Mode, NativeOutcome, PipelineStatus};
use crate::style_cache::StyleCache;

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
        .map_init(Arenas::new, |arenas, path| {
            let source = match std::fs::read_to_string(path) {
                Ok(s) => s,
                Err(e) => {
                    return (
                        path.clone(),
                        NativeOutcome::Error(format!("reading {}: {e}", path.display())),
                    );
                }
            };
            match format_with_arenas(&source, options, arenas) {
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
pub(crate) fn run_svelte_files(
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
        .map_init(Arenas::new, |arenas, path| {
            format_collecting(path, options, arenas)
        })
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
fn format_collecting(path: &Path, options: &FormatOptions, arenas: &mut Arenas) -> Pass1 {
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

    let outcome = match format_with_arenas(&source, &opts, arenas) {
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
