//! Fixture discovery and document loading.

use std::path::{Path, PathBuf};

use rsvelte_kernel::computation::pipeline::{Document, Registry};

/// A unit is a directory holding `input.<ext>`; its path relative to its source directory
/// (`fixtures/<family>/<source>`), with the reserved-name `~` escape undone, is the filename the
/// original file had. The source directory is found from the unit, not from `root`, so the path
/// (and every output derived from it: component names, CSS hashes) does not depend on which
/// directory the run was started from.
///
/// The walk visits each directory's entries in name order, depth first, so the units come out in
/// `Path::cmp` order of their inputs with no sort, and the same on every file system.
pub(crate) fn units(root: &Path) -> Vec<Unit> {
    enum Item {
        Dir(PathBuf, Option<usize>, Option<String>),
        Unit(Unit),
    }
    let mut out = Vec::new();
    let depth = depth_in_fixtures(root);
    let rel = source_of(root, depth).map(|source| unescaped(root.strip_prefix(source)));
    let mut stack = vec![Item::Dir(root.to_path_buf(), depth, rel)];
    let mut entries = Vec::new();
    while let Some(item) = stack.pop() {
        let (dir, depth, rel) = match item {
            Item::Unit(u) => {
                out.push(u);
                continue;
            }
            Item::Dir(dir, depth, rel) => (dir, depth, rel),
        };
        let Ok(read) = std::fs::read_dir(&dir) else {
            continue;
        };
        entries.extend(read.flatten().map(|e| (e.file_name(), e)));
        entries.sort_unstable_by(|a, b| a.0.cmp(&b.0));
        // Pushed last to first, so the first name is popped first.
        while let Some((name, e)) = entries.pop() {
            let p = e.path();
            let name = name.to_string_lossy();
            // The entry's own type, without a `stat`, unless it is a link to follow.
            let is_dir = match e.file_type() {
                Ok(t) if !t.is_symlink() => t.is_dir(),
                _ => p.is_dir(),
            };
            if is_dir {
                if matches!(name.as_ref(), "expected" | "actual" | "cache") {
                    continue;
                }
                let depth = if p.join("_registry").is_dir() {
                    Some(0)
                } else {
                    depth.map(|d| d + 1)
                };
                let rel = match depth {
                    Some(2) => Some(String::new()),
                    Some(3..) => rel.as_deref().map(|r| {
                        let name = name.strip_prefix('~').unwrap_or(&name);
                        if r.is_empty() {
                            name.to_owned()
                        } else {
                            format!("{r}/{name}")
                        }
                    }),
                    _ => None,
                };
                stack.push(Item::Dir(p, depth, rel));
            } else if name.starts_with("input.") {
                // Outside a source directory, the unit's path is relative to `root`.
                let path = rel
                    .clone()
                    .unwrap_or_else(|| unescaped(dir.strip_prefix(root)));
                stack.push(Item::Unit(Unit {
                    input: p,
                    dir: dir.clone(),
                    path,
                }));
            }
        }
    }
    out
}

pub(crate) struct Unit {
    pub(crate) input: PathBuf,
    pub(crate) dir: PathBuf,
    /// The original file's path, relative to its source directory.
    pub(crate) path: String,
}

/// A relative path's components with the reserved-name `~` escape undone, joined by `/`.
fn unescaped(rel: Result<&Path, std::path::StripPrefixError>) -> String {
    let rel = rel.expect("a unit is inside its source directory");
    let mut path = String::new();
    for s in rel {
        if !path.is_empty() {
            path.push('/');
        }
        let s = s.to_string_lossy();
        path.push_str(s.strip_prefix('~').unwrap_or(&s));
    }
    path
}

/// `fixtures/<family>/<source>` at or above `dir`, which is `depth` below its fixture root.
pub(crate) fn source_of(dir: &Path, depth: Option<usize>) -> Option<&Path> {
    depth
        .filter(|&d| d >= 2)
        .and_then(|d| dir.ancestors().nth(d - 2))
}

/// How far `dir` is below the nearest directory holding `_registry/` (the fixture root, `dir`
/// itself included); its source directory, `fixtures/<family>/<source>`, is the ancestor two
/// levels below that. `None` outside a fixture tree. The walk in [`units`] carries this down
/// rather than asking again for every unit.
pub(crate) fn depth_in_fixtures(dir: &Path) -> Option<usize> {
    dir.ancestors().position(|a| a.join("_registry").is_dir())
}

/// Every readable, size-checked unit below `roots`, with its unit directory and the number
/// of units that could not be loaded.
#[must_use]
pub(crate) fn load(reg: &Registry, roots: &[&Path]) -> (Vec<Document>, Vec<PathBuf>, usize) {
    let mut docs = Vec::new();
    let mut dirs = Vec::new();
    let mut skipped = 0usize;
    for Unit { input, dir, path } in roots.iter().flat_map(|r| units(r)) {
        let Ok(text) = std::fs::read_to_string(&input) else {
            skipped += 1;
            continue;
        };
        match reg.document(path, text) {
            Ok(d) => {
                docs.push(d);
                dirs.push(dir);
            }
            Err(_) => skipped += 1,
        }
    }
    (docs, dirs, skipped)
}
