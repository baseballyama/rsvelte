//! Embeds the tree the binary was built from, so a measurement names its arm: `RSV_BUILD_REV` is
//! `git rev-parse HEAD` plus `-dirty` when tracked files differ from it.

use std::process::Command;

fn git(args: &[&str]) -> Option<String> {
    let out = Command::new("git").args(args).output().ok()?;
    out.status
        .success()
        .then(|| String::from_utf8_lossy(&out.stdout).trim().to_string())
}

fn main() {
    let rev = match (
        git(&["rev-parse", "HEAD"]),
        git(&["status", "--porcelain", "--untracked-files=no"]),
    ) {
        (Some(rev), Some(status)) if status.is_empty() => rev,
        (Some(rev), Some(_)) => format!("{rev}-dirty"),
        _ => "UNMEASURED".to_string(),
    };
    println!("cargo:rustc-env=RSV_BUILD_REV={rev}");
    println!("cargo:rerun-if-changed=../../crates");
    if let Some(head) = git(&["rev-parse", "--git-path", "HEAD"]) {
        println!("cargo:rerun-if-changed={head}");
    }
    if let Some(index) = git(&["rev-parse", "--git-path", "index"]) {
        println!("cargo:rerun-if-changed={index}");
    }
}
