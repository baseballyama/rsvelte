//! A corpus unit's path is its name, not a file, so what lint finds in it does not depend on the
//! directory the command runs in.

use std::path::Path;

use crate::Scratch;

/// Everything `rsvelte-dev corpus` writes for the units in `scratch`, run from `directory`.
fn lint_from(scratch: &Scratch, directory: &str) -> String {
    let actual = scratch.join("corpus/src/routes/+page.svelte/actual");
    drop(std::fs::remove_dir_all(&actual));
    let cwd = scratch.join(directory);
    std::fs::create_dir_all(&cwd).expect("working directory");
    let rules = concat!(
        r#"{"rules":{"svelte/valid-compile":"error","#,
        r#""svelte/valid-prop-names-in-kit-pages":"error"}}"#
    );
    let output = crate::rsvelte_dev(cwd)
        .arg("corpus")
        .arg(scratch.join("corpus"))
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
    assert!(!written.is_empty(), "rsvelte-dev corpus wrote nothing");
    written
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
    let clean = lint_from(&scratch, "clean");
    assert_eq!(lint_from(&scratch, "clean/a/b/c"), clean);
    assert_eq!(lint_from(&scratch, "project"), clean);
}
