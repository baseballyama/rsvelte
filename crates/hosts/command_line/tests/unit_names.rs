//! A corpus unit's path is its name, not a file, so what lint finds in it does not depend on the
//! directory the command runs in.

use std::path::{Path, PathBuf};
use std::process::Command;

/// A directory of its own below the temporary directory, removed when dropped.
struct Scratch(PathBuf);

impl Scratch {
    fn new(files: &[(&str, &str)]) -> Self {
        let root = std::env::temp_dir().join(format!("rsvelte-cli-units-{}", std::process::id()));
        drop(std::fs::remove_dir_all(&root));
        for (name, text) in files {
            let path = root.join(name);
            std::fs::create_dir_all(path.parent().expect("a file has a directory"))
                .expect("test directory");
            std::fs::write(path, text).expect("test file");
        }
        Self(root)
    }

    /// Everything `rsvelte corpus` writes for the units, run from `directory`.
    fn lint_from(&self, directory: &str) -> String {
        let actual = self.0.join("corpus/src/routes/+page.svelte/actual");
        drop(std::fs::remove_dir_all(&actual));
        let cwd = self.0.join(directory);
        std::fs::create_dir_all(&cwd).expect("working directory");
        let rules = concat!(
            r#"{"rules":{"svelte/valid-compile":"error","#,
            r#""svelte/valid-prop-names-in-kit-pages":"error"}}"#
        );
        let output = Command::new(env!("CARGO_BIN_EXE_rsvelte"))
            .current_dir(cwd)
            .arg("corpus")
            .arg(self.0.join("corpus"))
            .args([
                "--task",
                "svelte.lint/default",
                "--options",
                "svelte.lint",
                rules,
            ])
            .output()
            .expect("run CLI");
        assert!(
            matches!(output.status.code(), Some(0 | 1)),
            "{}",
            String::from_utf8_lossy(&output.stderr)
        );
        let mut written = String::new();
        read_all(&actual, &mut written);
        assert!(!written.is_empty(), "rsvelte corpus wrote nothing");
        written
    }
}

fn read_all(directory: &Path, out: &mut String) {
    let mut entries: Vec<_> = std::fs::read_dir(directory)
        .expect("the outputs")
        .flatten()
        .map(|entry| entry.path())
        .collect();
    entries.sort();
    for path in entries {
        if path.is_dir() {
            read_all(&path, out);
        } else {
            out.push_str(&std::fs::read_to_string(&path).expect("an output"));
        }
    }
}

impl Drop for Scratch {
    fn drop(&mut self) {
        std::fs::remove_dir_all(&self.0).expect("remove test directory");
    }
}

#[test]
fn a_unit_is_linted_alike_from_any_directory() {
    let scratch = Scratch::new(&[
        (
            "corpus/src/routes/+page.svelte/input.svelte",
            "<script>export let foo;</script>",
        ),
        (
            "project/package.json",
            r#"{"devDependencies":{"@sveltejs/kit":"^2.0.0"}}"#,
        ),
        ("project/svelte.config.js", "export default {"),
        // The unit's name is also a file of this project, which is still not the unit.
        (
            "project/src/routes/+page.svelte",
            "<script>export let foo;</script>",
        ),
    ]);
    let clean = scratch.lint_from("clean");
    assert_eq!(scratch.lint_from("clean/a/b/c"), clean);
    assert_eq!(scratch.lint_from("project"), clean);
}
