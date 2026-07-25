use std::ffi::OsStr;
use std::io::{self, Write};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

use anyhow::{Context, Result};

use crate::paths::{
    OXFMT_EXCLUDE_NATIVE_CSS, OXFMT_EXCLUDE_NATIVE_JS, OXFMT_EXCLUDE_NATIVE_JSON,
    OXFMT_EXCLUDE_SVELTE,
};
use crate::status::{Mode, PipelineStatus};

/// The Node interpreter to run a JS `oxfmt` launcher through, if any — set via
/// `RSVELTE_FMT_NODE` by the npm JS launcher (`bin/rsvelte-fmt`) when it spawns
/// this binary.
pub(crate) fn oxfmt_node() -> Option<PathBuf> {
    std::env::var_os("RSVELTE_FMT_NODE")
        .filter(|v| !v.is_empty())
        .map(PathBuf::from)
}

/// Build a `Command` that runs `oxfmt`.
///
/// The npm `@rsvelte/fmt` launcher resolves the consumer's `oxfmt/bin/oxfmt`
/// Node launcher (an extensionless script with shebang `#!/usr/bin/env node`)
/// and passes it via `--oxfmt-bin`, setting `RSVELTE_FMT_NODE` to the exact
/// interpreter — see [`oxfmt_node`]. Such a script isn't directly executable on
/// Windows, so when a Node interpreter is known we run the oxfmt path through
/// it. As a convenience for `cargo run` users who point `--oxfmt-bin` at a
/// `.js` / `.cjs` / `.mjs` launcher without providing an interpreter, we also
/// fall back to `node` on `$PATH` in that case. A plain native binary (the
/// default `oxfmt` on `$PATH`, or any user-supplied path) is run directly.
pub(crate) fn oxfmt_command(oxfmt: &Path) -> Command {
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

/// Map a `<style lang="...">` value to the file extension oxfmt uses to
/// pick a parser. Shared with the stdin path's per-block formatter.
pub(crate) fn oxfmt_ext(lang: &str) -> &'static str {
    match lang {
        "scss" => "scss",
        "less" => "less",
        _ => "css",
    }
}

// ─── oxfmt delegation ───────────────────────────────────────────────────

/// The captured result of one `oxfmt` stdin invocation.
pub(crate) struct OxfmtStdinOutput {
    pub(crate) code: i32,
    pub(crate) stdout: Vec<u8>,
}

/// Format `source` for `path` by piping it to `oxfmt`. stdout is captured so
/// both the CLI (which forwards it verbatim) and in-process embedders (which
/// consume the formatted text) go through one implementation; stderr stays
/// inherited so oxfmt's own diagnostics reach the user.
pub(crate) fn oxfmt_stdin(
    oxfmt: &Path,
    config: Option<&Path>,
    path: &Path,
    source: &str,
    check: bool,
) -> Result<OxfmtStdinOutput> {
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
        .stdout(Stdio::piped())
        .stderr(Stdio::inherit());
    let mut child = cmd.spawn().with_context(|| {
        format!(
            "failed to spawn `{}` — is oxfmt installed?",
            oxfmt.display()
        )
    })?;
    // Feed stdin from its own thread: with stdout captured, a child that starts
    // writing output before it has consumed all of its input would otherwise
    // deadlock against us once either pipe's buffer fills.
    let writer = child.stdin.take().map(|mut stdin| {
        let source = source.to_owned();
        std::thread::spawn(move || stdin.write_all(source.as_bytes()))
    });
    let out = child.wait_with_output()?;
    if let Some(writer) = writer {
        // A child that exited without reading everything is not our error —
        // its exit code already says what happened.
        let _ = writer.join();
    }
    Ok(OxfmtStdinOutput {
        code: out.status.code().unwrap_or(1),
        stdout: out.stdout,
    })
}

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
pub(crate) fn run_oxfmt(
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
