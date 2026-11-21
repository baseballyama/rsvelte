//! Embeds the tree the binary was built from, so a measurement names its arm: `RSV_BUILD_REV` is
//! `git rev-parse HEAD` plus `-dirty` when the build's inputs ([`INPUTS`]) differ from it: a
//! tracked file changed, or an untracked one (such as a module left out of a commit) is present.
//!
//! Also writes, for `rsvelte version`, `$OUT_DIR/oracles.rs`: the official tools whose output
//! the corpus holds for each task of `rsvelte`, from `corpus/_registry/oracles.json`. And it
//! embeds `RSV_OXFMT` and `RSV_OXC`, the versions of the oxfmt and oxc that rsvelte is built on,
//! from `Cargo.lock`.

use std::collections::BTreeMap;
use std::fmt::Write as _;
use std::path::{Path, PathBuf};
use std::process::Command;

use serde::Deserialize;

/// What the binary is built from, from the repository root. `-dirty` and the files watched for a
/// rerun both use this one list, so editing a file outside it neither marks nor reruns the build.
const INPUTS: [&str; 5] = [
    ":(top)Cargo.toml",
    ":(top)Cargo.lock",
    ":(top)rust-toolchain.toml",
    ":(top)crates",
    ":(top)corpus/_registry/oracles.json",
];

/// The corpus task each command of `rsvelte` is compared with, and what of the command it covers.
const TASKS: [(&str, &str); 3] = [
    ("svelte.lint", "lint of Svelte files"),
    ("svelte.format", "format of Svelte files"),
    ("svelte.check", "typecheck of Svelte files"),
];

#[derive(Deserialize)]
struct Task {
    oracles: BTreeMap<String, String>,
}

#[derive(Deserialize)]
struct Lock {
    package: Vec<Locked>,
}

#[derive(Deserialize)]
struct Locked {
    name: String,
    version: String,
    source: Option<String>,
}

fn git(arguments: &[&str]) -> Option<String> {
    let out = Command::new("git").args(arguments).output().ok()?;
    out.status
        .success()
        .then(|| String::from_utf8_lossy(&out.stdout).trim().to_owned())
}

fn read(path: &Path) -> String {
    // The git block below watches it too, but only where git runs.
    println!("cargo:rerun-if-changed={}", path.display());
    std::fs::read_to_string(path).unwrap_or_else(|e| panic!("{}: {e}", path.display()))
}

/// Writes `oracles.rs`: for each of [`TASKS`], what it covers and its oracles, by name and version.
fn oracles(root: &Path, out: &Path) {
    let path = root.join("corpus/_registry/oracles.json");
    let tasks: BTreeMap<String, Task> =
        serde_json::from_str(&read(&path)).unwrap_or_else(|e| panic!("{}: {e}", path.display()));
    let mut table = String::from("&[\n");
    for (task, covers) in TASKS {
        let oracles = &(tasks.get(task))
            .unwrap_or_else(|| panic!("{} records no {task}", path.display()))
            .oracles;
        let oracles: Vec<String> = (oracles.iter())
            .map(|(name, version)| format!("({name:?}, {version:?})"))
            .collect();
        writeln!(table, "    ({covers:?}, &[{}]),", oracles.join(", "))
            .expect("writing to a String");
    }
    table.push_str("]\n");
    let file = out.join("oracles.rs");
    std::fs::write(&file, table).unwrap_or_else(|e| panic!("{}: {e}", file.display()));
}

/// Embeds the versions of oxfmt and oxc, each with the repository and commit of a git source.
fn built_on(root: &Path) {
    let path = root.join("Cargo.lock");
    let lock: Lock =
        toml::from_str(&read(&path)).unwrap_or_else(|e| panic!("{}: {e}", path.display()));
    let locked = |name: &str| {
        (lock.package.iter())
            .find(|package| package.name == name)
            .unwrap_or_else(|| panic!("{} locks no {name}", path.display()))
    };
    for (key, name) in [("RSV_OXFMT", "oxfmt"), ("RSV_OXC", "oxc_parser")] {
        let package = locked(name);
        // A git source ends with `#<commit>`: a fork's patches make it differ from the release.
        let commit = (package.source.as_deref())
            .and_then(|source| source.strip_prefix("git+"))
            .and_then(|source| source.split_once('#'))
            .map_or_else(String::new, |(repository, commit)| {
                let repository = repository.split_once('?').map_or(repository, |(r, _)| r);
                format!(" ({repository} at {})", &commit[..commit.len().min(10)])
            });
        println!("cargo:rustc-env={key}={}{commit}", package.version);
    }
}

fn main() {
    let manifest = PathBuf::from(std::env::var_os("CARGO_MANIFEST_DIR").expect("set by cargo"));
    let root = manifest.join("../../..");
    let out = PathBuf::from(std::env::var_os("OUT_DIR").expect("set by cargo"));
    oracles(&root, &out);
    built_on(&root);
    let status = [
        &["status", "--porcelain", "--untracked-files=normal", "--"][..],
        &INPUTS,
    ]
    .concat();
    let rev = match (git(&["rev-parse", "HEAD"]), git(&status)) {
        (Some(rev), Some(status)) if status.is_empty() => rev,
        (Some(rev), Some(_)) => format!("{rev}-dirty"),
        _ => "UNMEASURED".to_owned(),
    };
    println!("cargo:rustc-env=RSV_BUILD_REV={rev}");
    // The tracked files, not the directories: watching a directory would make cargo scan every
    // fixture's ignored output on each build.
    let files = [&["ls-files", "--full-name", "--"][..], &INPUTS].concat();
    if let (Some(files), Some(root)) = (git(&files), git(&["rev-parse", "--show-toplevel"])) {
        for f in files.lines() {
            println!("cargo:rerun-if-changed={root}/{f}");
        }
    }
    // A commit, a checkout or `git add` of a new file changes one of these.
    for path in ["HEAD", "index"] {
        if let Some(path) = git(&["rev-parse", "--git-path", path]) {
            println!("cargo:rerun-if-changed={path}");
        }
    }
}
