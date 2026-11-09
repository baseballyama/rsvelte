use std::path::{Path, PathBuf};

use super::{file_rows, write_actual};
use crate::oracle::Verdict;

fn scratch(name: &str) -> PathBuf {
    let dir = std::env::temp_dir().join(format!(
        "rsvelte-test-harness-{}-{name}",
        std::process::id()
    ));
    drop(std::fs::remove_dir_all(&dir));
    dir
}

fn files(dir: &Path) -> Vec<(String, String)> {
    let mut out: Vec<_> = std::fs::read_dir(dir)
        .unwrap()
        .map(|e| {
            let e = e.unwrap();
            let name = e.file_name().into_string().unwrap();
            (name, std::fs::read_to_string(e.path()).unwrap())
        })
        .collect();
    out.sort();
    out
}

fn produced(files: &[(&str, &str)]) -> Vec<(String, String)> {
    files
        .iter()
        .map(|(n, t)| ((*n).to_owned(), (*t).to_owned()))
        .collect()
}

#[test]
fn leaves_exactly_the_produced_files() {
    let dir = scratch("exact");
    std::fs::create_dir_all(dir.join("stale-dir")).unwrap();
    std::fs::write(dir.join("stale.js"), "old").unwrap();
    std::fs::write(dir.join("client.js"), "old").unwrap();
    write_actual(&dir, &produced(&[("client.js", "new"), ("server.js", "s")])).unwrap();
    assert_eq!(
        files(&dir),
        produced(&[("client.js", "new"), ("server.js", "s")])
    );
    std::fs::remove_dir_all(&dir).unwrap();
}

#[test]
fn does_not_rewrite_an_unchanged_file() {
    let dir = scratch("unchanged");
    let same = produced(&[("client.js", "same")]);
    write_actual(&dir, &same).unwrap();
    let path = dir.join("client.js");
    let past = std::time::SystemTime::UNIX_EPOCH + std::time::Duration::from_secs(1);
    std::fs::File::options()
        .write(true)
        .open(&path)
        .unwrap()
        .set_modified(past)
        .unwrap();
    write_actual(&dir, &same).unwrap();
    assert_eq!(std::fs::metadata(&path).unwrap().modified().unwrap(), past);
    std::fs::remove_dir_all(&dir).unwrap();
}

#[test]
fn removes_the_directory_when_nothing_is_produced() {
    let dir = scratch("empty");
    write_actual(&dir, &produced(&[("client.js", "x")])).unwrap();
    write_actual(&dir, &[]).unwrap();
    assert!(!dir.exists());
    write_actual(&dir, &[]).unwrap();
    assert!(!dir.exists());
}

#[test]
fn compares_one_file_of_another_tasks_output() {
    let dir = scratch("official-file");
    let compile = dir.join("svelte.compile");
    std::fs::create_dir_all(&compile).unwrap();
    std::fs::write(compile.join("client.warnings.json"), "[1]").unwrap();
    let official = "svelte.compile/client.";
    let existing = vec![format!("{official}js"), format!("{official}warnings.json")];
    let rows = |text: &str| {
        let ours = produced(&[
            ("svelte.compile/client.js", "other task"),
            ("svelte.warnings/default.warnings.json", text),
        ]);
        let ours_prefix = "svelte.warnings/default.";
        file_rows(
            &dir,
            official,
            ours_prefix,
            "warnings.json",
            &existing,
            &ours,
        )
        .unwrap()
        .unwrap()
    };
    let row = |verdict| vec![("warnings.json".to_owned(), verdict)];
    assert_eq!(rows("[1]"), row(Verdict::Match));
    assert_eq!(rows("[2]"), row(Verdict::Mismatch));
    let errored = vec![format!("{official}error.json")];
    let ours = "svelte.warnings/default.";
    assert!(file_rows(&dir, official, ours, "warnings.json", &errored, &[]).is_none());
    std::fs::remove_dir_all(&dir).unwrap();
}
