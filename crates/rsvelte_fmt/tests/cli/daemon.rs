use std::path::PathBuf;
use std::process::{Command, Stdio};

use crate::common::{bin, tempdir};

// ─── oxfmt daemon (#1179 follow-up) ───────────────────────────────────────

/// `node` on `$PATH`, or `None` to skip a daemon test on a host without it.
fn node_bin() -> Option<PathBuf> {
    let ok = Command::new("node")
        .arg("--version")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .map(|s| s.success())
        .unwrap_or(false);
    ok.then(|| PathBuf::from("node"))
}

/// Absolute path to the shipped daemon bundle, from this crate's manifest dir.
fn daemon_bundle() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../apps/npm/fmt/daemon/daemon.mjs")
}

/// Stand up a fake `oxfmt` npm package the daemon will `import()`: its `format()`
/// prefixes `/*DMON*/` so we can prove the daemon (not the spawn fallback)
/// formatted the block. `bin/oxfmt` is an inert stub — if the daemon path failed
/// and we fell back to spawning it, it would format nothing (no marker), so the
/// marker's presence pins the result to the daemon.
fn write_fake_oxfmt_pkg(dir: &std::path::Path) -> PathBuf {
    let pkg = dir.join("oxfmt");
    std::fs::create_dir_all(pkg.join("bin")).unwrap();
    std::fs::write(
        pkg.join("package.json"),
        r#"{ "name": "oxfmt", "type": "module", "exports": { ".": { "default": "./index.mjs" } }, "bin": { "oxfmt": "bin/oxfmt" } }"#,
    )
    .unwrap();
    std::fs::write(
        pkg.join("index.mjs"),
        "export async function format(fileName, content, options) {\n  return { code: '/*DMON*/' + content, errors: [] };\n}\n",
    )
    .unwrap();
    // Inert stub launcher (spawn fallback would run this and format nothing).
    std::fs::write(pkg.join("bin").join("oxfmt"), "process.exit(0)\n").unwrap();
    pkg.join("bin").join("oxfmt")
}

/// The daemon path formats inline `<style>` blocks: with `RSVELTE_FMT_NODE` +
/// the bundle set and a fake oxfmt package, the binary connects to (spawns) the
/// daemon and the fake `format()` marker lands in the file.
#[test]
fn daemon_formats_inline_style() {
    let Some(node) = node_bin() else {
        eprintln!("skipping: no node on PATH");
        return;
    };
    let dir = tempdir();
    let oxfmt_bin = write_fake_oxfmt_pkg(&dir);

    let file = dir.join("c.svelte");
    std::fs::write(&file, "<div></div>\n<style>.a{color:red}</style>\n").unwrap();

    let status = Command::new(bin())
        .args([
            file.to_str().unwrap(),
            "--write",
            "--no-style-cache",
            "--no-native-css",
            "--oxfmt-bin",
            oxfmt_bin.to_str().unwrap(),
        ])
        .env("RSVELTE_FMT_NODE", &node)
        .env("RSVELTE_FMT_DAEMON_BUNDLE", daemon_bundle())
        .env_remove("RSVELTE_FMT_NO_DAEMON")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let out = std::fs::read_to_string(&file).unwrap();
    assert!(
        out.contains("/*DMON*/"),
        "daemon-formatted marker missing — daemon path not taken:\n{out}"
    );
    assert!(out.contains(".a"), "selector lost:\n{out}");
}

/// `RSVELTE_FMT_NO_DAEMON` forces the spawn path: with the inert stub oxfmt the
/// block is left unformatted (no daemon marker), proving the escape hatch
/// bypasses the daemon entirely.
#[test]
fn no_daemon_env_forces_spawn_path() {
    let Some(node) = node_bin() else {
        eprintln!("skipping: no node on PATH");
        return;
    };
    let dir = tempdir();
    let oxfmt_bin = write_fake_oxfmt_pkg(&dir);

    let file = dir.join("c.svelte");
    std::fs::write(&file, "<div></div>\n<style>.a{color:red}</style>\n").unwrap();

    let status = Command::new(bin())
        .args([
            file.to_str().unwrap(),
            "--write",
            "--no-style-cache",
            "--no-native-css",
            "--oxfmt-bin",
            oxfmt_bin.to_str().unwrap(),
        ])
        .env("RSVELTE_FMT_NODE", &node)
        .env("RSVELTE_FMT_DAEMON_BUNDLE", daemon_bundle())
        .env("RSVELTE_FMT_NO_DAEMON", "1")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let out = std::fs::read_to_string(&file).unwrap();
    assert!(
        !out.contains("/*DMON*/"),
        "daemon marker present — NO_DAEMON should have bypassed the daemon:\n{out}"
    );
}
