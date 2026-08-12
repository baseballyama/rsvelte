use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

pub fn bin() -> PathBuf {
    // Cargo sets CARGO_BIN_EXE_<bin-name> for integration tests so the test
    // doesn't have to guess where the binary lives — important under
    // cargo-llvm-cov, which uses target/llvm-cov-target/ instead of target/.
    PathBuf::from(env!("CARGO_BIN_EXE_rsvelte-fmt"))
}

/// A fake oxfmt that prepends `/*FMT*/` to every CSS file it formats. Handles
/// both explicit file arguments and the `<style>` staging directory the batch
/// hands it (basename `rsvelte-fmt-styles-*`, walked like real oxfmt walks a
/// directory). Any *other* directory argument — e.g. the project dir from the
/// non-`.svelte` delegation pass — is ignored, so it never touches the test's
/// own `.svelte`/`.cjs` files. Shared by the delegation and cache-output tests.
pub const MARKER_OXFMT: &str = r"const fs = require('node:fs');
const path = require('node:path');
function fmtFile(p) { fs.writeFileSync(p, '/*FMT*/' + fs.readFileSync(p, 'utf8')); }
for (const p of process.argv.slice(2)) {
  if (p.startsWith('-') || p.startsWith('!')) continue;
  let st;
  try { st = fs.statSync(p); } catch { continue; }
  if (st.isFile()) fmtFile(p);
  else if (st.isDirectory() && path.basename(p).startsWith('rsvelte-fmt-styles-')) {
    for (const e of fs.readdirSync(p)) {
      const fp = path.join(p, e);
      if (fs.statSync(fp).isFile()) fmtFile(fp);
    }
  }
}
";

pub fn run_stdin(stdin: &str, args: &[&str]) -> (String, String, i32) {
    let mut child = Command::new(bin())
        .args(args)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("spawn rsvelte-fmt");
    child
        .stdin
        .as_mut()
        .unwrap()
        .write_all(stdin.as_bytes())
        .unwrap();
    let out = child.wait_with_output().unwrap();
    (
        String::from_utf8(out.stdout).unwrap(),
        String::from_utf8(out.stderr).unwrap(),
        out.status.code().unwrap_or(-1),
    )
}

pub fn real_oxfmt_bin() -> PathBuf {
    if let Ok(p) = std::env::var("OXFMT_BIN") {
        return PathBuf::from(p);
    }
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../node_modules/.bin/oxfmt")
}

pub fn real_oxfmt_runnable(oxfmt: &Path) -> bool {
    Command::new(oxfmt)
        .arg("--version")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .is_ok_and(|s| s.success())
}

pub fn tempdir() -> PathBuf {
    // PID + timestamp alone can collide: libtest runs this file's tests on a
    // shared thread pool, so many threads call this within the same PID at
    // near-identical instants, and some hosts' clocks don't resolve down to a
    // true unique nanosecond under that load. `create_dir_all` masks a
    // collision (it happily "succeeds" on an existing dir), so two tests would
    // silently share one directory and stomp each other's files. The atomic
    // counter makes each call unique regardless of clock resolution.
    static COUNTER: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);
    let seq = COUNTER.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    let mut dir = std::env::temp_dir();
    dir.push(format!(
        "rsvelte_fmt_test_{}_{}_{}",
        std::process::id(),
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos(),
        seq,
    ));
    std::fs::create_dir(&dir).unwrap_or_else(|e| panic!("tempdir collision at {dir:?}: {e}"));
    dir
}

/// Run `rsvelte-fmt` on `stdin` in `cwd` with extra env, returning
/// `(stdout, stderr, code)`.
pub fn run_stdin_in(
    stdin: &str,
    cwd: &Path,
    env: &[(&str, &Path)],
    args: &[&str],
) -> (String, String, i32) {
    let mut cmd = Command::new(bin());
    cmd.current_dir(cwd)
        .args(args)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    for (k, v) in env {
        cmd.env(k, v);
    }
    let mut child = cmd.spawn().expect("spawn rsvelte-fmt");
    child
        .stdin
        .as_mut()
        .unwrap()
        .write_all(stdin.as_bytes())
        .unwrap();
    let out = child.wait_with_output().unwrap();
    (
        String::from_utf8(out.stdout).unwrap(),
        String::from_utf8(out.stderr).unwrap(),
        out.status.code().unwrap_or(-1),
    )
}
