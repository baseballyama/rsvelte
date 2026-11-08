//! Finding the documents a command runs on.

use std::path::{Path, PathBuf};

use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::source::document::Document;

/// A unit outside the corpus is a directory holding `input.<ext>`; its path relative to the root
/// is the filename the document gets.
///
/// The units come out in `Path::cmp` order of their inputs, the same on every file system.
pub(crate) fn units(root: &Path) -> Vec<Unit> {
    let mut out = Vec::new();
    let mut stack = vec![root.to_path_buf()];
    while let Some(dir) = stack.pop() {
        let Ok(read) = std::fs::read_dir(&dir) else {
            continue;
        };
        let mut found = Vec::new();
        for e in read.flatten() {
            let p = e.path();
            let name = e.file_name();
            let name = name.to_string_lossy();
            // The entry's own type, without a `stat`, unless it is a link to follow.
            let is_dir = match e.file_type() {
                Ok(t) if !t.is_symlink() => t.is_dir(),
                _ => p.is_dir(),
            };
            if is_dir && !matches!(name.as_ref(), "expected" | "actual") {
                stack.push(p);
            } else if !is_dir && name.starts_with("input.") {
                found.push(p);
            }
        }
        out.extend(found.into_iter().map(|input| Unit {
            path: relative(root, &dir),
            input,
            dir: dir.clone(),
        }));
    }
    // Read order depends on the file system, and an input sorts among its sibling directories.
    out.sort_unstable_by(|a, b| a.input.cmp(&b.input));
    out
}

pub(crate) struct Unit {
    pub(crate) input: PathBuf,
    pub(crate) dir: PathBuf,
    /// The document's filename, relative to the root.
    pub(crate) path: String,
}

fn relative(root: &Path, dir: &Path) -> String {
    let rel = dir.strip_prefix(root).expect("a unit is inside its root");
    let parts: Vec<String> = rel
        .iter()
        .map(|s| s.to_string_lossy().into_owned())
        .collect();
    parts.join("/")
}

/// Every readable, size-checked document below `roots`, the directory each one's outputs go to,
/// and the number that could not be loaded. A root inside the corpus is read from its packs.
///
/// # Errors
///
/// A root that is not a directory: its walk would find no units and look like an empty corpus.
pub(crate) fn load(
    reg: &Registry,
    roots: &[&Path],
) -> Result<(Vec<Document>, Vec<PathBuf>, usize), String> {
    if let Some(root) = roots.iter().find(|root| !root.is_dir()) {
        return Err(format!("{}: not a directory", root.display()));
    }
    let mut docs = Vec::new();
    let mut dirs = Vec::new();
    let mut skipped = 0usize;
    let mut unreadable = 0usize;
    let mut add = |path: &str, text: &str, dir: PathBuf| match reg.document(path, text) {
        Ok(d) => {
            docs.push(d);
            dirs.push(dir);
        }
        Err(_) => skipped += 1,
    };
    for root in roots {
        let sources = rsvelte_corpus::sources(root).unwrap_or_default();
        if sources.is_empty() {
            for Unit { input, dir, path } in units(root) {
                match std::fs::read_to_string(&input) {
                    Ok(text) => add(&path, &text, dir.join("actual")),
                    Err(_) => unreadable += 1,
                }
            }
            continue;
        }
        for source in sources {
            let pack = source.inputs()?;
            // `Path::cmp` order, as the walk gives outside the corpus: a pack is in byte order.
            let mut entries: Vec<_> = pack.entries().collect();
            entries.sort_by(|a, b| Path::new(a.path).cmp(Path::new(b.path)));
            for e in entries {
                add(e.path, e.body, source.dir.join("actual").join(e.path));
            }
        }
    }
    Ok((docs, dirs, skipped + unreadable))
}
