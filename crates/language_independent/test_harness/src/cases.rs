use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

use rsvelte_kernel::source::document::Document;

const INPUT_STEM: &str = "input.";
/// Marks a directory of `tests/fixtures/` as a copy of a project's own files and their official
/// output.
const SOURCE_FILE: &str = "source.json";
/// Next to `source.json`: the copied cases known to differ from the official output.
const DIFFERS_FILE: &str = "differs.txt";

/// Where a case's `expected/` comes from.
#[derive(Clone, Copy, PartialEq, Eq)]
pub(crate) enum Kind {
    /// A crate's hand-written case: `expected/<name>.<file>` is rsvelte's own output, accepted
    /// with `UPDATE_EXPECT=1`.
    HandWritten,
    /// A case in a copied source (a directory with `source.json`): `expected/<name>.<file>` is
    /// the official tool's output, and the harness never writes it.
    Copied,
}

pub(crate) struct Case {
    /// The directory relative to `tests/fixtures`, with `/` separators.
    pub(crate) name: String,
    pub(crate) dir: PathBuf,
    pub(crate) kind: Kind,
    /// A copied case listed in `differs.txt`, which must not match the official output.
    pub(crate) differs: bool,
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

    /// The cases that are type checked together: those with the same first directory.
    pub(crate) fn project(&self) -> &str {
        self.name
            .split_once('/')
            .map_or(&self.name, |(first, _)| first)
    }

    /// The cases that still run together when each runs alone: a case one directory deeper than
    /// the project's (`rsvelte/imports/main`) runs with its siblings, which it may import.
    pub(crate) fn group(&self) -> &str {
        match self.name.rsplit_once('/') {
            Some((parent, _)) if parent.contains('/') => parent,
            _ => &self.name,
        }
    }
}

/// Every case under a crate's `root`, sorted by name: hand-written, or copied when a directory
/// above it holds `source.json`.
pub(crate) fn in_crate(root: &Path) -> Result<Vec<Case>, String> {
    let mut cases = Vec::new();
    // Each copied source's `differs.txt` names, and whether a case was found for each.
    let mut listed: BTreeMap<PathBuf, BTreeMap<String, bool>> = BTreeMap::new();
    walk(root, &mut |dir, input, extension| {
        let name = relative_name(root, dir)?;
        let source = dir
            .ancestors()
            .skip(1)
            .take_while(|a| *a != root)
            .find(|a| a.join(SOURCE_FILE).is_file());
        let (kind, path, differs) = match source {
            Some(s) => {
                // The file's path in its source repository, the name the official tool was given.
                let path = relative_name(s, dir)?;
                let names = match listed.entry(s.to_path_buf()) {
                    std::collections::btree_map::Entry::Occupied(o) => o.into_mut(),
                    std::collections::btree_map::Entry::Vacant(v) => {
                        v.insert(differing(&s.join(DIFFERS_FILE))?)
                    }
                };
                let differs = names.get_mut(&path).map(|found| *found = true).is_some();
                (Kind::Copied, path, differs)
            }
            None => (Kind::HandWritten, format!("{name}.{extension}"), false),
        };
        cases.push(Case {
            path,
            name,
            dir: dir.to_path_buf(),
            kind,
            differs,
            input,
        });
        Ok(())
    })?;
    for (source, names) in &listed {
        if let Some((name, _)) = names.iter().find(|(_, found)| !**found) {
            return Err(format!(
                "{}: {name} is no case",
                source.join(DIFFERS_FILE).display()
            ));
        }
    }
    cases.sort_unstable_by(|a, b| a.name.cmp(&b.name));
    Ok(cases)
}

/// The case names in a `differs.txt`, each not yet found; none when the file is absent.
fn differing(file: &Path) -> Result<BTreeMap<String, bool>, String> {
    let text = match std::fs::read_to_string(file) {
        Ok(t) => t,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(BTreeMap::new()),
        Err(e) => return Err(format!("{}: {e}", file.display())),
    };
    let names: Vec<&str> = text
        .lines()
        .filter(|l| !l.is_empty() && !l.starts_with('#'))
        .collect();
    if !names.is_sorted_by(|a, b| a < b) {
        return Err(format!("{}: list each case once, sorted", file.display()));
    }
    Ok(names.into_iter().map(|n| (n.to_owned(), false)).collect())
}

/// Called with a case's directory, its input and the input's extension.
type Found<'a> = dyn FnMut(&Path, PathBuf, &str) -> Result<(), String> + 'a;

/// Calls `found` for each case below `root`: a directory that holds one `input.<ext>`. A case
/// directory is not searched for more cases.
fn walk(root: &Path, found: &mut Found<'_>) -> Result<(), String> {
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
