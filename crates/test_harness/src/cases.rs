use std::path::{Path, PathBuf};

use rsvelte_kernel::computation::pipeline::Document;

const INPUT_STEM: &str = "input.";
/// Marks `tests/fixtures/<source>/` as copied from the corpus (`tools/fixtures`, command `crate`).
const SOURCE_FILE: &str = "source.json";
/// The corpus stores a path segment that collides with a reserved name with this prefix.
const ESCAPE: char = '~';

/// Where a case's `expected/` comes from.
#[derive(Clone, Copy, PartialEq, Eq)]
pub(crate) enum Expected {
    /// rsvelte's own output, accepted with `UPDATE_EXPECT=1`.
    Snapshot,
    /// The official tool's output, copied from the corpus. The harness never writes it.
    Oracle,
}

pub(crate) struct Case {
    /// The directory relative to `tests/fixtures`, with `/` separators.
    pub(crate) name: String,
    pub(crate) dir: PathBuf,
    pub(crate) expected: Expected,
    input: PathBuf,
    /// The document's path, which outputs such as component names and style hashes depend on.
    path: String,
}

impl Case {
    pub(crate) fn document(&self) -> Result<Document, String> {
        let text = std::fs::read_to_string(&self.input)
            .map_err(|e| format!("{}: {e}", self.input.display()))?;
        Document::new(self.path.clone(), text)
            .map_err(|e| format!("{}: {e:?}", self.input.display()))
    }
}

/// Every case under `root`, sorted by name. A case directory is not searched for more cases.
pub(crate) fn discover(root: &Path) -> Result<Vec<Case>, String> {
    let mut cases = Vec::new();
    // (directory, the oracle source directory it is in)
    let mut stack: Vec<(PathBuf, Option<PathBuf>)> = vec![(root.to_path_buf(), None)];
    while let Some((dir, source)) = stack.pop() {
        let read = std::fs::read_dir(&dir).map_err(|e| format!("{}: {e}", dir.display()))?;
        let mut inputs = Vec::new();
        let mut children = Vec::new();
        for entry in read {
            let entry = entry.map_err(|e| format!("{}: {e}", dir.display()))?;
            let path = entry.path();
            if path.is_dir() {
                children.push(path);
            } else if let Some(extension) = entry
                .file_name()
                .to_str()
                .and_then(|n| n.strip_prefix(INPUT_STEM))
            {
                inputs.push((path, extension.to_owned()));
            }
        }
        match inputs.len() {
            0 => {
                let source = source.or_else(|| {
                    (dir != root && dir.join(SOURCE_FILE).is_file()).then(|| dir.clone())
                });
                stack.extend(children.into_iter().map(|c| (c, source.clone())));
            }
            1 => {
                let (input, extension) = inputs.pop().expect("one input");
                let name = relative_name(root, &dir)?;
                let (expected, path) = match &source {
                    Some(s) => (Expected::Oracle, original_path(&relative_name(s, &dir)?)),
                    None => (Expected::Snapshot, format!("{name}.{extension}")),
                };
                cases.push(Case {
                    name,
                    dir,
                    expected,
                    input,
                    path,
                });
            }
            _ => return Err(format!("{}: more than one `input.*`", dir.display())),
        }
    }
    cases.sort_unstable_by(|a, b| a.name.cmp(&b.name));
    Ok(cases)
}

/// The file's path in its source repository, which the oracle was given as the file name.
fn original_path(stored: &str) -> String {
    stored
        .split('/')
        .map(|s| s.strip_prefix(ESCAPE).unwrap_or(s))
        .collect::<Vec<_>>()
        .join("/")
}

fn relative_name(root: &Path, dir: &Path) -> Result<String, String> {
    let relative = dir
        .strip_prefix(root)
        .map_err(|e| format!("{}: {e}", dir.display()))?;
    let parts: Option<Vec<&str>> = relative
        .components()
        .map(|c| c.as_os_str().to_str())
        .collect();
    match parts {
        Some(p) if !p.is_empty() => Ok(p.join("/")),
        Some(_) => Err(format!(
            "{}: put each case in its own directory",
            dir.display()
        )),
        None => Err(format!("{}: the case name is not UTF-8", dir.display())),
    }
}
