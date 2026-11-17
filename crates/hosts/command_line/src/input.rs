//! Finding the documents a command runs on.

use std::path::{Path, PathBuf};

use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::source::document::Document;

#[cfg(test)]
mod tests;

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

pub(crate) fn relative(root: &Path, dir: &Path) -> String {
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
/// Only one unit in `every` is kept, picked by an FNV-1a hash of its output directory below its
/// root, so that adding a unit never changes which of the others are kept. The pick comes before
/// a unit is read, so loading counts only the units measured.
///
/// # Errors
///
/// A root that is not a directory: its walk would find no units and look like an empty corpus.
pub(crate) fn load(
    reg: &Registry,
    roots: &[&Path],
    every: u64,
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
                let below = if path.is_empty() {
                    fnv1a(FNV_OFFSET, b"actual")
                } else {
                    fnv1a(fnv1a(FNV_OFFSET, path.as_bytes()), b"/actual")
                };
                if !kept(below, every) {
                    continue;
                }
                match std::fs::read_to_string(&input) {
                    Ok(text) => add(&path, &text, dir.join("actual")),
                    Err(_) => unreadable += 1,
                }
            }
            continue;
        }
        // Sources are below the canonical root.
        let canonical = std::fs::canonicalize(root).ok();
        for source in sources {
            let base = (canonical.as_deref().into_iter())
                .chain([*root])
                .find(|base| source.dir.starts_with(base))
                .expect("a source is inside its root");
            let rel = relative(base, &source.dir);
            let prefix = fnv1a(FNV_OFFSET, rel.as_bytes());
            let prefix = fnv1a(
                prefix,
                if rel.is_empty() {
                    b"actual/"
                } else {
                    b"/actual/"
                },
            );
            let pack = source.inputs()?;
            // `Path::cmp` order, as the walk gives outside the corpus: a pack is in byte order.
            let mut entries: Vec<_> = pack.entries().collect();
            entries.sort_by(|a, b| Path::new(a.path).cmp(Path::new(b.path)));
            for e in entries {
                if !kept(fnv1a(prefix, e.path.as_bytes()), every) {
                    continue;
                }
                add(e.path, e.body, source.dir.join("actual").join(e.path));
            }
        }
    }
    Ok((docs, dirs, skipped + unreadable))
}

const fn kept(hash: u64, every: u64) -> bool {
    every <= 1 || hash.is_multiple_of(every)
}

const FNV_OFFSET: u64 = 0xCBF2_9CE4_8422_2325;

/// FNV-1a from `hash`, as `DefaultHasher` may change between Rust releases and the sample must
/// not.
fn fnv1a(hash: u64, bytes: &[u8]) -> u64 {
    bytes.iter().fold(hash, |hash, &byte| {
        (hash ^ u64::from(byte)).wrapping_mul(0x0000_0100_0000_01B3)
    })
}
