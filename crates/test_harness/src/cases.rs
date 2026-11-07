use std::path::{Path, PathBuf};

use rsvelte_kernel::computation::pipeline::Document;

const INPUT_STEM: &str = "input.";
/// The corpus stores a path segment that collides with a reserved name with this prefix.
const ESCAPE: char = '~';
/// Shared corpus data next to the families, not a family.
const REGISTRY: &str = "_registry";
/// Marks a directory of `tests/fixtures/` as a copy of a project's own files and their official
/// output.
const SOURCE_FILE: &str = "source.json";

/// Where a case lives, which decides the names of its files and where `expected/` comes from.
#[derive(Clone, Copy, PartialEq, Eq)]
pub(crate) enum Kind {
    /// A crate's hand-written case: `expected/<name>.<file>` is rsvelte's own output, accepted
    /// with `UPDATE_EXPECT=1`.
    HandWritten,
    /// A case in a copied source under `tests/fixtures/` (a directory with `source.json`):
    /// `expected/<name>.<file>` is the official tool's output, and the harness never writes it.
    Copied,
    /// A corpus unit: `expected/<task>/<variant>.<file>` is the official tool's output, and the
    /// harness never writes it. `actual/` is shared with `rsvelte corpus`.
    Corpus,
}

pub(crate) struct Case {
    /// Hand-written: the directory relative to `tests/fixtures`. Corpus:
    /// `<family>/<source>/<path>`, the key `oracle check` uses. `/` separators.
    pub(crate) name: String,
    pub(crate) dir: PathBuf,
    pub(crate) kind: Kind,
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

    /// The cases that are type checked together: one corpus source, or all hand-written cases with
    /// the same first directory.
    pub(crate) fn project(&self) -> &str {
        let segments = if self.kind == Kind::Corpus { 2 } else { 1 };
        let end = self
            .name
            .match_indices('/')
            .nth(segments - 1)
            .map_or(self.name.len(), |(i, _)| i);
        &self.name[..end]
    }
}

/// Every case under a crate's `root`, sorted by name: hand-written, or copied when a directory
/// above it holds `source.json`.
pub(crate) fn in_crate(root: &Path) -> Result<Vec<Case>, String> {
    let mut cases = Vec::new();
    walk(root, &mut |dir, input, extension| {
        let name = relative_name(root, dir)?;
        let source = dir
            .ancestors()
            .skip(1)
            .take_while(|a| *a != root)
            .find(|a| a.join(SOURCE_FILE).is_file());
        let (kind, path) = match source {
            Some(s) => (Kind::Copied, original_path(&relative_name(s, dir)?)),
            None => (Kind::HandWritten, format!("{name}.{extension}")),
        };
        cases.push(Case {
            path,
            name,
            dir: dir.to_path_buf(),
            kind,
            input,
        });
        Ok(())
    })?;
    cases.sort_unstable_by(|a, b| a.name.cmp(&b.name));
    Ok(cases)
}

/// Every unit of `corpus/<family>/`, sorted by name. A source is a directory of the family, and
/// a unit's path in it is the file's path in the source repository, the file name the official
/// tool was given.
pub(crate) fn corpus(corpus: &Path, family: &str) -> Result<Vec<Case>, String> {
    if family == REGISTRY {
        return Err(format!("{REGISTRY} is not a family"));
    }
    let root = corpus.join(family);
    let mut cases = Vec::new();
    for source in children(&root)? {
        let source_name = relative_name(&root, &source)?;
        walk(&source, &mut |dir, input, _| {
            let path = original_path(&relative_name(&source, dir)?);
            cases.push(Case {
                name: format!("{family}/{source_name}/{path}"),
                dir: dir.to_path_buf(),
                kind: Kind::Corpus,
                input,
                path,
            });
            Ok(())
        })?;
    }
    cases.sort_unstable_by(|a, b| a.name.cmp(&b.name));
    Ok(cases)
}

/// Calls `found(dir, input, extension)` for each case below `root`: a directory that holds one
/// `input.<ext>`. A case directory is not searched for more cases.
fn walk(
    root: &Path,
    found: &mut dyn FnMut(&Path, PathBuf, &str) -> Result<(), String>,
) -> Result<(), String> {
    let mut stack = vec![root.to_path_buf()];
    while let Some(dir) = stack.pop() {
        let read = std::fs::read_dir(&dir).map_err(|e| format!("{}: {e}", dir.display()))?;
        let mut inputs = Vec::new();
        let mut directories = Vec::new();
        for entry in read {
            let entry = entry.map_err(|e| format!("{}: {e}", dir.display()))?;
            let path = entry.path();
            if entry
                .file_type()
                .map_err(|e| format!("{}: {e}", path.display()))?
                .is_dir()
            {
                directories.push(path);
            } else if let Some(extension) = entry
                .file_name()
                .to_str()
                .and_then(|n| n.strip_prefix(INPUT_STEM))
            {
                inputs.push((path, extension.to_owned()));
            }
        }
        match inputs.as_slice() {
            [] => stack.extend(directories),
            [(input, extension)] => found(&dir, input.clone(), extension)?,
            _ => return Err(format!("{}: more than one `input.*`", dir.display())),
        }
    }
    Ok(())
}

fn children(dir: &Path) -> Result<Vec<PathBuf>, String> {
    let mut out = Vec::new();
    for entry in std::fs::read_dir(dir).map_err(|e| format!("{}: {e}", dir.display()))? {
        let entry = entry.map_err(|e| format!("{}: {e}", dir.display()))?;
        if entry
            .file_type()
            .map_err(|e| format!("{}: {e}", dir.display()))?
            .is_dir()
        {
            out.push(entry.path());
        }
    }
    Ok(out)
}

/// The file's path in its source repository.
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
