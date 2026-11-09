use std::path::{Path, PathBuf};

use super::write_actual;

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
