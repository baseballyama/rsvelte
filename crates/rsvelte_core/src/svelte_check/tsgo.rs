//! tsgo subprocess driver. Spawns Microsoft's `tsgo` (or falls back to
//! `tsc`) against the overlay tsconfig produced by
//! `super::overlay::materialize_overlay`, captures the textual diagnostic
//! stream, and parses it into the `RawTsDiagnostic` shape consumed by
//! `super::mapper`.
//!
//! The JS reference (`incremental.ts::runTypeScriptDiagnostics`) spawns
//! `node <tsgo_js> -p <tsconfig> --pretty true --noErrorTruncation`. Our
//! version mirrors that, plus a graceful fallback chain when tsgo isn't
//! installed.

use std::path::{Path, PathBuf};
use std::process::Command;

#[derive(Debug, Clone)]
pub struct RawTsDiagnostic {
    /// Path to the `.tsx` (or `.ts`) file the diagnostic was reported on.
    pub file: PathBuf,
    /// 1-indexed line.
    pub line: u32,
    /// 1-indexed column.
    pub column: u32,
    /// `error` / `warning` / `info`.
    pub severity: String,
    /// `TS2304`, etc. — empty when tsgo doesn't emit a code (rare).
    pub code: String,
    pub message: String,
}

#[derive(Debug)]
pub enum TsgoError {
    /// No tsgo / tsc binary could be located (and no override was set).
    NotFound,
    /// Spawning the subprocess failed at the OS level.
    Spawn(std::io::Error),
}

impl std::fmt::Display for TsgoError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            TsgoError::NotFound => write!(
                f,
                "tsgo / tsc not found (set TSGO_BIN, install @typescript/native-preview, or run via `pnpm dlx tsgo`)"
            ),
            TsgoError::Spawn(e) => write!(f, "failed to spawn TypeScript compiler: {e}"),
        }
    }
}

impl std::error::Error for TsgoError {}

#[derive(Debug, Clone)]
pub struct TsgoBinary {
    pub program: String,
    pub args_prefix: Vec<String>,
}

/// Locate a TypeScript compiler binary. Resolution order matches the JS
/// reference's preference plus a couple of common rsvelte dev paths:
/// 1. `$TSGO_BIN`
/// 2. `<workspace>/node_modules/.bin/tsgo`
/// 3. `<workspace>/node_modules/.bin/tsc`
/// 4. Globally on `$PATH`: `tsgo`, then `tsc`.
pub fn find_compiler(workspace: &Path) -> Result<TsgoBinary, TsgoError> {
    if let Ok(explicit) = std::env::var("TSGO_BIN")
        && !explicit.is_empty()
    {
        return Ok(TsgoBinary {
            program: explicit,
            args_prefix: Vec::new(),
        });
    }
    let candidates = [
        workspace.join("node_modules/.bin/tsgo"),
        workspace.join("node_modules/.bin/tsc"),
    ];
    for path in &candidates {
        if path.exists() {
            return Ok(TsgoBinary {
                program: path.display().to_string(),
                args_prefix: Vec::new(),
            });
        }
    }
    if which("tsgo") {
        return Ok(TsgoBinary {
            program: "tsgo".into(),
            args_prefix: Vec::new(),
        });
    }
    if which("tsc") {
        return Ok(TsgoBinary {
            program: "tsc".into(),
            args_prefix: Vec::new(),
        });
    }
    Err(TsgoError::NotFound)
}

fn which(program: &str) -> bool {
    let path_var = match std::env::var_os("PATH") {
        Some(v) => v,
        None => return false,
    };
    for dir in std::env::split_paths(&path_var) {
        let candidate = dir.join(program);
        if candidate.is_file() {
            return true;
        }
    }
    false
}

/// Run the located compiler against `tsconfig_path` (the overlay
/// tsconfig) and return a parsed list of diagnostics. tsgo / tsc emit
/// non-zero exit codes when diagnostics are reported — that's NOT
/// treated as an error here; the caller decides via the returned vec.
pub fn run_tsgo(
    binary: &TsgoBinary,
    tsconfig_path: &Path,
    cwd: &Path,
) -> Result<Vec<RawTsDiagnostic>, TsgoError> {
    let mut cmd = Command::new(&binary.program);
    cmd.args(&binary.args_prefix);
    cmd.args([
        "-p",
        tsconfig_path
            .to_str()
            .expect("overlay tsconfig path must be UTF-8"),
        "--pretty",
        "false",
        "--noErrorTruncation",
    ]);
    cmd.current_dir(cwd);
    let output = cmd.output().map_err(TsgoError::Spawn)?;
    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    let combined = format!("{}\n{}", stdout, stderr);
    Ok(parse_diagnostics(&combined))
}

/// Parse the textual diagnostic stream emitted by `tsc --pretty=false`
/// (and tsgo, which is wire-compatible). Lines look like:
///   `path/to/file.ts(line,col): error TSxxxx: message`
fn parse_diagnostics(output: &str) -> Vec<RawTsDiagnostic> {
    let re = regex::Regex::new(
        r"^(?P<file>.+?)\((?P<line>\d+),(?P<col>\d+)\):\s+(?P<sev>error|warning|info)\s+(?P<code>TS\d+):\s+(?P<msg>.*)$",
    )
    .expect("static regex compiles");
    let mut diags = Vec::new();
    for line in output.lines() {
        if let Some(caps) = re.captures(line) {
            let line_no: u32 = caps["line"].parse().unwrap_or(1);
            let col: u32 = caps["col"].parse().unwrap_or(1);
            diags.push(RawTsDiagnostic {
                file: PathBuf::from(&caps["file"]),
                line: line_no,
                column: col,
                severity: caps["sev"].to_string(),
                code: caps["code"].to_string(),
                message: caps["msg"].trim().to_string(),
            });
        }
    }
    diags
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_basic_diagnostic() {
        let sample = "src/app.ts(12,3): error TS2304: Cannot find name 'foo'.\n\
                      src/app.ts(15,1): warning TS6133: 'unused' is declared but never used.";
        let diags = parse_diagnostics(sample);
        assert_eq!(diags.len(), 2);
        assert_eq!(diags[0].code, "TS2304");
        assert_eq!(diags[0].line, 12);
        assert_eq!(diags[0].severity, "error");
        assert_eq!(diags[1].severity, "warning");
        assert!(diags[1].message.contains("declared but never used"));
    }

    #[test]
    fn parse_ignores_non_diagnostic_lines() {
        let sample = "Found 0 errors.\n\
                      src/x.ts(1,1): error TS9999: oops.\n\
                      Watching for file changes.";
        let diags = parse_diagnostics(sample);
        assert_eq!(diags.len(), 1);
        assert_eq!(diags[0].code, "TS9999");
    }
}
