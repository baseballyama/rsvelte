use std::path::{Path, PathBuf};

pub(super) fn inputs(root: &Path) -> std::io::Result<Vec<PathBuf>> {
    let mut stack = vec![root.to_owned()];
    let mut files = Vec::new();
    while let Some(directory) = stack.pop() {
        let input = directory.join("input.svelte");
        if input.is_file() {
            files.push(input);
            continue;
        }
        for entry in std::fs::read_dir(directory)? {
            let entry = entry?;
            if entry.file_type()?.is_dir() {
                stack.push(entry.path());
            }
        }
    }
    files.sort();
    Ok(files)
}
