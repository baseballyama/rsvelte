//! TypeScript compiler subprocess driver. Spawns the workspace's own `tsc`
//! (the default) or the TypeScript 7 native compiler (with `--tsgo` /
//! `prefer_tsgo`) against the overlay tsconfig produced by
//! `super::overlay::materialize_overlay`, captures the textual diagnostic
//! stream, and parses it into the `RawTsDiagnostic` shape consumed by
//! `super::mapper`. The compilers are wire-compatible (`--pretty false`
//! output + flags), so the same driver handles all of them; `find_compiler`
//! decides which one to run.
//!
//! `--tsgo` means "use the TypeScript 7 native compiler", mirroring official
//! svelte-check (`svelte-check/src/tsgo.ts::tryParseTsGoVersion`, sveltejs/
//! language-tools#3073): TS 7 is looked up as `@typescript/native` — the npm
//! alias TS 7 stable is installed under alongside a TS 6 `typescript` — and
//! then as the legacy `@typescript/native-preview`, accepting only major >= 7.
//! Resolution goes through the package directory rather than
//! `node_modules/.bin`, because an aliased TS 7 declares the same `tsc` bin
//! name as the real `typescript` and whichever install wins the shim is an
//! install-order coin flip.
//!
//! The JS reference (`incremental.ts::runTypeScriptDiagnostics`) spawns
//! `node <tsgo_js> -p <tsconfig> --pretty true --noErrorTruncation`. Our
//! version mirrors that, plus a graceful fallback chain when the preferred
//! compiler isn't installed.

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
    /// `--tsgo` was requested but no TypeScript 7 install was found.
    Ts7NotFound {
        /// The flag the user passed, for the error message.
        flag: &'static str,
    },
    /// Spawning the subprocess failed at the OS level.
    Spawn(std::io::Error),
}

impl std::fmt::Display for TsgoError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            TsgoError::NotFound => write!(
                f,
                "tsc / tsgo not found (set TSGO_BIN, or install typescript in the workspace)"
            ),
            // Same wording as official svelte-check's `formatTsGoNotFoundError`.
            TsgoError::Ts7NotFound { flag } => write!(
                f,
                "rsvelte-check {flag} requires TypeScript 7 to be installed in the workspace.\
                 You can setup TypeScript 7 with an npm alias via the following command.\n\
                 npm install --save-dev typescript@~6 @typescript/native@npm:typescript@7\n"
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

/// Locate a TypeScript compiler binary.
///
/// `$TSGO_BIN` is always honoured first as an explicit override.
///
/// With `prefer_tsgo` (`rsvelte-check --tsgo`) the TypeScript 7 native
/// compiler is required: `resolve_ts7_native` walks up from `workspace`
/// for `@typescript/native` then `@typescript/native-preview`, and a missing
/// install is an error rather than a silent downgrade — mirroring official
/// svelte-check, whose `--tsgo` means the same thing.
///
/// Without it the workspace's own `tsc` is used, whatever major it is:
///   1. `node_modules/.bin/tsc` in `workspace` or any ancestor, then `…/tsgo`
///   2. Globally on `$PATH`: `tsc`, then `tsgo`.
///
/// Each name is searched across the full ancestor chain before the next, so a
/// workspace-hoisted binary (pnpm puts it at the monorepo root, not in a
/// deeply-nested package) still wins over a locally-resolvable fallback.
pub fn find_compiler(workspace: &Path, prefer_tsgo: bool) -> Result<TsgoBinary, TsgoError> {
    if let Ok(explicit) = std::env::var("TSGO_BIN")
        && !explicit.is_empty()
    {
        return Ok(TsgoBinary {
            program: explicit,
            args_prefix: Vec::new(),
        });
    }
    if prefer_tsgo {
        return match resolve_ts7_native(workspace) {
            Some(bin) => Ok(bin),
            None => Err(TsgoError::Ts7NotFound { flag: "--tsgo" }),
        };
    }
    // Binary names in preference order.
    let names: [&str; 2] = ["tsc", "tsgo"];
    // 1. `node_modules/.bin` in `workspace` AND every ancestor directory,
    //    in preference order. pnpm (and npm/yarn workspaces) hoist workspace
    //    binaries to the repo-root `node_modules/.bin`, so a package nested
    //    several levels deep (e.g. `apps/foo/frontend/app`) usually has NO
    //    local `.bin/tsgo` — only the monorepo root does. Walking each name
    //    across all ancestors before moving to the fallback means a hoisted
    //    `tsgo` is still preferred over a locally-resolvable `tsc`; without
    //    this, `--tsgo` silently ran `tsc` (≈3-4x slower) in monorepos.
    for name in names {
        let mut dir: Option<&Path> = Some(workspace);
        while let Some(d) = dir {
            let path = d.join("node_modules/.bin").join(name);
            if path.exists() {
                return Ok(TsgoBinary {
                    program: path.display().to_string(),
                    args_prefix: Vec::new(),
                });
            }
            dir = d.parent();
        }
    }
    // 2. Global `$PATH`, in preference order.
    for name in names {
        if which(name) {
            return Ok(TsgoBinary {
                program: name.to_string(),
                args_prefix: Vec::new(),
            });
        }
    }
    Err(TsgoError::NotFound)
}

/// The TypeScript 7 native compiler installed at or above `from`, as a ready
/// to spawn `node <bin>` command.
///
/// Mirrors official svelte-check's `tryParseTsGoVersion`: `@typescript/native`
/// (the alias TS 7 stable is installed under when a TS 6 `typescript` has to
/// stay alongside it) is preferred over the legacy `@typescript/native-preview`,
/// and only a manifest naming itself `typescript` or `@typescript/native-preview`
/// at major >= 7 is accepted.
///
/// The launcher comes from the package's own `bin` entry, not
/// `node_modules/.bin`: an aliased TS 7 declares the very same `tsc` bin name
/// as the real `typescript`, so the shim points at whichever package the
/// installer happened to link last.
fn resolve_ts7_native(from: &Path) -> Option<TsgoBinary> {
    let mut dir: Option<&Path> = Some(from);
    while let Some(d) = dir {
        for pkg in ["@typescript/native", "@typescript/native-preview"] {
            let pkg_dir = d.join("node_modules").join(pkg);
            if let Some(bin) = ts7_native_bin(&pkg_dir) {
                return Some(TsgoBinary {
                    program: "node".to_string(),
                    args_prefix: vec![bin.display().to_string()],
                });
            }
        }
        dir = d.parent();
    }
    None
}

/// The `bin` launcher of `pkg_dir` when it holds a TypeScript 7 native
/// compiler. `None` when the manifest is missing, names an unrelated package,
/// is older than 7, or declares no usable `bin`.
fn ts7_native_bin(pkg_dir: &Path) -> Option<PathBuf> {
    let raw = std::fs::read_to_string(pkg_dir.join("package.json")).ok()?;
    let parsed: serde_json::Value = serde_json::from_str(&raw).ok()?;
    let name = parsed.get("name").and_then(|v| v.as_str())?;
    if !matches!(name, "typescript" | "@typescript/native-preview") {
        return None;
    }
    let major: u32 = parsed
        .get("version")
        .and_then(|v| v.as_str())
        .and_then(|v| v.split('.').next())
        .and_then(|m| m.parse().ok())?;
    if major < 7 {
        return None;
    }
    let bin = parsed.get("bin")?;
    // `{ "tsc": "./bin/tsc" }` (TS 7) or `{ "tsgo": "bin/tsgo" }` (preview).
    let rel = bin
        .get("tsc")
        .or_else(|| bin.get("tsgo"))
        .or_else(|| bin.as_object().and_then(|o| o.values().next()))
        .or(Some(bin))
        .and_then(|v| v.as_str())?;
    let path = pkg_dir.join(rel);
    path.is_file().then_some(path)
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
    // Pass the tsconfig path as an `OsStr` so a non-UTF-8 path survives
    // verbatim instead of panicking in `to_str().expect(..)`.
    cmd.arg("-p");
    cmd.arg(tsconfig_path);
    cmd.args(["--pretty", "false", "--noErrorTruncation"]);
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
    static RE: std::sync::LazyLock<regex::Regex> = std::sync::LazyLock::new(|| {
        regex::Regex::new(
            r"^(?P<file>.+?)\((?P<line>\d+),(?P<col>\d+)\):\s+(?P<sev>error|warning|info)\s+(?P<code>TS\d+):\s+(?P<msg>.*)$",
        )
        .expect("static regex compiles")
    });
    let mut diags = Vec::new();
    for line in output.lines() {
        if let Some(caps) = RE.captures(line) {
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

    /// A TS 7 install under the `@typescript/native` alias, plus a stale
    /// `.bin/tsc` that the alias and the real `typescript` both claim.
    fn write_ts7_alias(dir: &Path, name: &str, version: &str, bin_key: &str) {
        let pkg = dir.join("node_modules").join(name);
        std::fs::create_dir_all(pkg.join("bin")).unwrap();
        std::fs::write(pkg.join("bin/entry.js"), "").unwrap();
        std::fs::write(
            pkg.join("package.json"),
            format!(
                r#"{{"name":"{}","version":"{version}","bin":{{"{bin_key}":"./bin/entry.js"}}}}"#,
                if name == "@typescript/native" {
                    "typescript"
                } else {
                    name
                }
            ),
        )
        .unwrap();
    }

    fn scratch(tag: &str) -> Option<PathBuf> {
        if std::env::var_os("TSGO_BIN").is_some() {
            eprintln!("skip: TSGO_BIN is set in the environment");
            return None;
        }
        let dir = std::env::temp_dir().join(format!(
            "rsvelte_find_compiler_{tag}_{}",
            std::process::id()
        ));
        let _ = std::fs::remove_dir_all(&dir);
        Some(dir)
    }

    #[test]
    fn without_the_flag_the_workspaces_own_tsc_wins() {
        let Some(dir) = scratch("plain") else { return };
        let bin = dir.join("node_modules/.bin");
        std::fs::create_dir_all(&bin).unwrap();
        std::fs::write(bin.join("tsc"), "").unwrap();
        std::fs::write(bin.join("tsgo"), "").unwrap();

        let found = find_compiler(&dir, false).expect("tsc found");
        assert!(
            found.program.ends_with("tsc"),
            "the default must run the workspace's own tsc, got {}",
            found.program
        );

        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn tsgo_flag_resolves_typescript_7_through_the_native_alias() {
        let Some(dir) = scratch("alias") else { return };
        // A TS 6 `tsc` shim is present and points at the real typescript —
        // `--tsgo` must ignore it and run the aliased TS 7 package's own bin.
        let bin = dir.join("node_modules/.bin");
        std::fs::create_dir_all(&bin).unwrap();
        std::fs::write(bin.join("tsc"), "").unwrap();
        write_ts7_alias(&dir, "typescript", "6.0.3", "tsc");
        write_ts7_alias(&dir, "@typescript/native", "7.0.2", "tsc");

        let found = find_compiler(&dir, true).expect("TS 7 found");
        assert_eq!(found.program, "node", "the package bin is a node script");
        assert!(
            found.args_prefix[0].contains("@typescript/native"),
            "--tsgo must run the aliased TS 7, got {:?}",
            found.args_prefix
        );

        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn tsgo_flag_falls_back_to_the_legacy_preview_package() {
        let Some(dir) = scratch("preview") else {
            return;
        };
        write_ts7_alias(
            &dir,
            "@typescript/native-preview",
            "7.0.0-dev.20260707.2",
            "tsgo",
        );

        let found = find_compiler(&dir, true).expect("native-preview found");
        assert!(
            found.args_prefix[0].contains("native-preview"),
            "got {:?}",
            found.args_prefix
        );

        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn tsgo_flag_without_typescript_7_is_an_error_not_a_silent_downgrade() {
        let Some(dir) = scratch("no_ts7") else { return };
        // Only a TS 6 install: official svelte-check errors here rather than
        // quietly type-checking with a different compiler, and so do we.
        let bin = dir.join("node_modules/.bin");
        std::fs::create_dir_all(&bin).unwrap();
        std::fs::write(bin.join("tsc"), "").unwrap();
        write_ts7_alias(&dir, "typescript", "6.0.3", "tsc");

        let err = find_compiler(&dir, true).expect_err("must not fall back");
        assert!(matches!(err, TsgoError::Ts7NotFound { .. }), "got {err:?}");
        assert!(
            err.to_string()
                .contains("@typescript/native@npm:typescript@7"),
            "the error should tell the user how to install it: {err}"
        );

        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn tsgo_flag_finds_typescript_7_hoisted_to_the_monorepo_root() {
        let Some(root) = scratch("mono") else { return };
        let pkg = root.join("apps/foo/frontend/app");
        std::fs::create_dir_all(pkg.join("node_modules/.bin")).unwrap();
        std::fs::write(pkg.join("node_modules/.bin/tsc"), "").unwrap();
        write_ts7_alias(&root, "@typescript/native", "7.0.2", "tsc");

        let found = find_compiler(&pkg, true).expect("hoisted TS 7 found");
        assert!(
            found.args_prefix[0].starts_with(&root.join("node_modules").display().to_string()),
            "TS 7 must resolve from the monorepo root, got {:?}",
            found.args_prefix
        );

        let _ = std::fs::remove_dir_all(&root);
    }
}
