//! Embeds the tree the binary was built from, so a measurement names its arm: `RSV_BUILD_REV` is
//! `git rev-parse HEAD` plus `-dirty` when tracked files differ from it.

use std::process::Command;

fn git(arguments: &[&str]) -> Option<String> {
    let out = Command::new("git").args(arguments).output().ok()?;
    out.status
        .success()
        .then(|| String::from_utf8_lossy(&out.stdout).trim().to_owned())
}

fn main() {
    let rev = match (
        git(&["rev-parse", "HEAD"]),
        git(&["status", "--porcelain", "--untracked-files=no"]),
    ) {
        (Some(rev), Some(status)) if status.is_empty() => rev,
        (Some(rev), Some(_)) => format!("{rev}-dirty"),
        _ => "UNMEASURED".to_owned(),
    };
    println!("cargo:rustc-env=RSV_BUILD_REV={rev}");
    // The tracked files, as `-dirty` sees them: watching the directory would make cargo scan every
    // fixture's ignored output on each build.
    if let Some(files) = git(&["ls-files", "--full-name", "../../../crates"]) {
        let root = git(&["rev-parse", "--show-toplevel"]).unwrap_or_default();
        for f in files.lines() {
            println!("cargo:rerun-if-changed={root}/{f}");
        }
    }
    if let Some(head) = git(&["rev-parse", "--git-path", "HEAD"]) {
        println!("cargo:rerun-if-changed={head}");
    }
    if let Some(index) = git(&["rev-parse", "--git-path", "index"]) {
        println!("cargo:rerun-if-changed={index}");
    }
}
