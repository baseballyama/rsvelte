use std::env;
use std::path::Path;
use std::process::Command;

fn git(root: &Path, args: &[&str]) -> Option<String> {
    let output = Command::new("git")
        .args(args)
        .current_dir(root)
        .output()
        .ok()?;
    if !output.status.success() {
        return None;
    }
    Some(String::from_utf8(output.stdout).ok()?.trim().to_owned())
}

fn main() {
    napi_build::setup();

    let root = Path::new(env!("CARGO_MANIFEST_DIR")).join("../..");
    let commit = git(&root, &["rev-parse", "HEAD"]).unwrap_or_else(|| "unknown".to_owned());
    let dirty = git(&root, &["status", "--porcelain", "--untracked-files=no"])
        .is_some_and(|status| !status.is_empty());
    println!("cargo:rustc-env=RSVELTE_NAPI_BUILD_COMMIT={commit}");
    println!("cargo:rustc-env=RSVELTE_NAPI_BUILD_DIRTY={dirty}");

    if let Some(head) = git(&root, &["rev-parse", "--git-path", "HEAD"]) {
        println!("cargo:rerun-if-changed={head}");
    }
    if let Some(reference) = git(&root, &["symbolic-ref", "-q", "HEAD"])
        && let Some(path) = git(&root, &["rev-parse", "--git-path", &reference])
    {
        println!("cargo:rerun-if-changed={path}");
    }
}
