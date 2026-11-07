//! Embeds the tree the binary was built from, so a measurement names its arm: `RSV_BUILD_REV` is
//! `git rev-parse HEAD` plus `-dirty` when the build's inputs ([`INPUTS`]) differ from it: a tracked
//! file changed, or an untracked one (such as a module left out of a commit) is present.

use std::process::Command;

/// What the binary is built from, from the repository root. `-dirty` and the files watched for a
/// rerun both use this one list, so editing a file outside it neither marks nor reruns the build.
const INPUTS: [&str; 4] = [
    ":(top)Cargo.toml",
    ":(top)Cargo.lock",
    ":(top)rust-toolchain.toml",
    ":(top)crates",
];

fn git(arguments: &[&str]) -> Option<String> {
    let out = Command::new("git").args(arguments).output().ok()?;
    out.status
        .success()
        .then(|| String::from_utf8_lossy(&out.stdout).trim().to_owned())
}

fn main() {
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
