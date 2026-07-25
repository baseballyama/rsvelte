use std::process::{Command, Stdio};

use crate::common::{MARKER_OXFMT, bin, tempdir};

// ─── native-direct install (runtime sidecar) ─────────────────────────────

/// When the binary is installed native-direct (the npm JS launcher replaced by
/// the platform binary), it has no `--oxfmt-bin` / `RSVELTE_FMT_NODE` from a
/// launcher. Instead it reads `rsvelte-fmt.runtime.json` next to itself for the
/// consumer's oxfmt launcher + Node. Copy the binary beside such a sidecar
/// (pointing oxfmt at a fake `.cjs`) and confirm `<style>` delegation still
/// reaches oxfmt — proving the sidecar drives resolution with no flags.
#[test]
fn runtime_sidecar_drives_oxfmt_resolution() {
    let dir = tempdir();

    // Copy the binary so `current_exe()` resolves next to our sidecar.
    let exe = dir.join("rsvelte-fmt");
    std::fs::copy(bin(), &exe).unwrap();
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        std::fs::set_permissions(&exe, std::fs::Permissions::from_mode(0o755)).unwrap();
    }

    // Fake oxfmt (marks every CSS file) + a sidecar pointing at it. `node` is
    // the bare command so the binary runs the `.cjs` through `$PATH` node, the
    // same way the existing fake-oxfmt tests do.
    let fake = dir.join("fake-oxfmt.cjs");
    std::fs::write(&fake, MARKER_OXFMT).unwrap();
    let sidecar = dir.join("rsvelte-fmt.runtime.json");
    std::fs::write(
        &sidecar,
        format!(
            r#"{{ "node": "node", "oxfmtBin": {:?} }}"#,
            fake.to_str().unwrap()
        ),
    )
    .unwrap();

    let file = dir.join("c.svelte");
    std::fs::write(&file, "<div></div>\n<style>.a{color:red}</style>\n").unwrap();

    // No `--oxfmt-bin`, no `RSVELTE_FMT_NODE` — resolution must come from the
    // sidecar. Clear the env var in case the harness set it.
    let status = Command::new(&exe)
        .args([
            file.to_str().unwrap(),
            "--write",
            "--no-style-cache",
            "--no-native-css",
        ])
        .env_remove("RSVELTE_FMT_NODE")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let out = std::fs::read_to_string(&file).unwrap();
    assert!(
        out.contains("/*FMT*/"),
        "sidecar oxfmt was not used (no marker):\n{out}"
    );
    assert!(out.contains(".a"), "selector lost:\n{out}");
}

/// A user-supplied `--oxfmt-bin` must win over the sidecar (explicit override).
#[test]
fn explicit_oxfmt_bin_overrides_sidecar() {
    let dir = tempdir();
    let exe = dir.join("rsvelte-fmt");
    std::fs::copy(bin(), &exe).unwrap();
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        std::fs::set_permissions(&exe, std::fs::Permissions::from_mode(0o755)).unwrap();
    }

    // Sidecar points at an oxfmt that would CRASH if used (nonexistent path).
    let sidecar = dir.join("rsvelte-fmt.runtime.json");
    std::fs::write(
        &sidecar,
        r#"{ "node": "node", "oxfmtBin": "/nonexistent/should-not-run.cjs" }"#,
    )
    .unwrap();

    // Explicit --oxfmt-bin points at a working fake; it must take precedence.
    let fake = dir.join("real-oxfmt.cjs");
    std::fs::write(&fake, MARKER_OXFMT).unwrap();

    let file = dir.join("c.svelte");
    std::fs::write(&file, "<div></div>\n<style>.a{color:red}</style>\n").unwrap();

    let status = Command::new(&exe)
        .args([
            file.to_str().unwrap(),
            "--write",
            "--no-style-cache",
            "--no-native-css",
            "--oxfmt-bin",
            fake.to_str().unwrap(),
        ])
        .env_remove("RSVELTE_FMT_NODE")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let out = std::fs::read_to_string(&file).unwrap();
    assert!(
        out.contains("/*FMT*/"),
        "explicit --oxfmt-bin should have formatted via the working fake:\n{out}"
    );
}
