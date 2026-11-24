use std::path::{Path, PathBuf};

use rsvelte_kernel::computation::registry::{Registry, ReplacedFile, ReplacedFiles};

use super::*;

/// A directory of its own below the temporary directory, by its real path, removed when dropped.
struct Directory(PathBuf);

impl Directory {
    fn new(name: &str) -> Self {
        let path =
            std::env::temp_dir().join(format!("rsvelte-combined-{}-{name}", std::process::id()));
        std::fs::create_dir_all(&path).expect("directory");
        Self(rsvelte_kernel::source::paths::canonicalize(path).expect("real path"))
    }

    fn file(&self, name: &str, text: &str) -> PathBuf {
        let path = self.0.join(name);
        std::fs::write(&path, text).expect("file");
        path
    }
}

impl Drop for Directory {
    fn drop(&mut self) {
        drop(std::fs::remove_dir_all(&self.0));
    }
}

fn names(read: &Read) -> Vec<(&str, Option<&Path>, &str)> {
    (read.documents.iter())
        .map(|document| {
            (
                document.path.as_str(),
                document.file.as_deref(),
                document.text.as_str(),
            )
        })
        .collect()
}

#[test]
fn a_file_both_commands_read_is_one_document_by_lints_name_and_its_real_file() {
    let directory = Directory::new("shared");
    let real = directory.file("a.ts", "disk");
    let only_checked = directory.file("b.ts", "b");
    let linted = directory.0.join(".").join("a.ts");
    let documents = read(
        &Registry::new(),
        vec![linted.clone()],
        &[only_checked.clone(), real.clone()],
    )
    .unwrap();
    let linted = linted.to_str().unwrap();
    assert_eq!(
        names(&documents),
        [
            (linted, Some(real.as_path()), "disk"),
            (
                only_checked.to_str().unwrap(),
                Some(only_checked.as_path()),
                "b"
            ),
        ]
    );
    assert_eq!(documents.checked, [1, 0]);
}

/// The checker reads the file replaced and lint reads it from the disk.
#[test]
fn a_file_a_task_reads_replaced_is_a_document_for_each_command() {
    let directory = Directory::new("replaced");
    let real = directory.file("a.ts", "disk");
    let mut reg = Registry::new();
    reg.contribute::<ReplacedFiles>(ReplacedFile {
        tasks: TYPECHECK,
        path: real.clone(),
        text: "replaced".to_owned(),
    });
    let documents = read(&reg, vec![real.clone()], std::slice::from_ref(&real)).unwrap();
    let name = real.to_str().unwrap();
    assert_eq!(
        names(&documents),
        [
            (name, Some(real.as_path()), "disk"),
            (name, Some(real.as_path()), "replaced")
        ]
    );
    assert_eq!(documents.checked, [1]);
}

/// Lint names the file through a link, so lint's rules read the link's name, as they do alone.
#[cfg(unix)]
#[test]
fn a_file_lint_reaches_through_a_link_is_a_document_for_each_command() {
    let directory = Directory::new("link");
    let real = directory.file("a.ts", "disk");
    let link = directory.0.join("link.ts");
    std::os::unix::fs::symlink(&real, &link).expect("link");
    let documents = read(
        &Registry::new(),
        vec![link.clone()],
        std::slice::from_ref(&real),
    )
    .unwrap();
    assert_eq!(
        names(&documents),
        [
            (link.to_str().unwrap(), Some(link.as_path()), "disk"),
            (real.to_str().unwrap(), Some(real.as_path()), "disk"),
        ]
    );
    assert_eq!(documents.checked, [1]);
}
