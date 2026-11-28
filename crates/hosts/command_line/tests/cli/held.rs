//! Each input `corpus/_own/held/panic/` keeps still panics, so a fix sends it back to its source
//! instead of leaving it unread. A debug build reads the `stack-overflow/` inputs for minutes
//! without overflowing, so this test leaves them out.

use std::path::{Path, PathBuf};

use super::rsvelte_dev;

/// The tasks a held input may crash, the ones the performance ratchet runs.
const TASKS: &[&str] = &[
    "svelte.compile/client",
    "svelte.compile/server",
    "svelte.compileModule/client",
    "svelte.compileModule/server",
    "svelte.compile.warnings",
    "svelte.format/default",
    "svelte.lint/default",
    "svelte.typescript_projection/default",
    "vuelte.compile/client",
    "vuelte.compile/server",
];

/// Every file below `directory`.
fn files(directory: &Path) -> Vec<PathBuf> {
    let mut found = Vec::new();
    let mut pending = vec![directory.to_path_buf()];
    while let Some(next) = pending.pop() {
        for entry in std::fs::read_dir(&next).expect("a held directory") {
            let path = entry.expect("an entry").path();
            if path.is_dir() {
                pending.push(path);
            } else {
                found.push(path);
            }
        }
    }
    found.sort();
    found
}

/// Whether some task panics on `file`.
fn panics(file: &Path) -> bool {
    TASKS.iter().any(|task| {
        let output = rsvelte_dev(file.parent().expect("a directory"))
            .arg("run")
            .arg(file)
            .args(["--task", task])
            .output()
            .expect("run rsvelte-dev");
        String::from_utf8_lossy(&output.stderr).contains("panicked")
    })
}

#[test]
fn every_input_held_for_a_panic_still_panics() {
    let held = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../corpus/_own/held/panic");
    let inputs = files(&held);
    assert!(!inputs.is_empty(), "no held input under {}", held.display());
    let fixed: Vec<_> = inputs
        .iter()
        .filter(|file| !panics(file))
        .map(|file| file.display().to_string())
        .collect();
    assert!(
        fixed.is_empty(),
        "these no longer panic; move each back to its source (corpus/_own/README.md):\n{}",
        fixed.join("\n")
    );
}
