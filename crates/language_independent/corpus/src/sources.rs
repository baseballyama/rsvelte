//! Where the corpus keeps things: `corpus/<family>/<source>/` holds `inputs.pack`,
//! `expected/<task>/<variant>.pack` from the official tools and, when written,
//! `actual/<task>/<variant>.pack` from rsvelte. Shared files live in `corpus/_registry/`.

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

use serde::Deserialize;

use crate::pack::Pack;

/// The corpus in this repository.
pub(crate) const ROOT: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/../../../corpus");

/// One registered source of one family.
#[derive(Debug)]
pub struct Source {
    pub family: String,
    pub name: String,
    pub dir: PathBuf,
}

impl Source {
    /// # Errors
    ///
    /// The pack cannot be read.
    pub fn inputs(&self) -> Result<Pack, String> {
        Pack::read(&self.dir.join("inputs.pack"))
    }

    pub(crate) fn expected(&self, task: &str) -> Result<Pack, String> {
        Pack::read(&self.pack("expected", task))
    }

    /// `<dir>/<kind>/<task>/<variant>.pack`.
    #[must_use]
    pub(crate) fn pack(&self, kind: &str, task: &str) -> PathBuf {
        let (task, variant) = rsvelte_kernel::task_files::location(task);
        self.dir
            .join(kind)
            .join(task)
            .join(format!("{variant}.pack"))
    }

    /// The key of the unit at `path` in the ledger and `units.toml`.
    pub(crate) fn key(&self, path: &str) -> String {
        format!("{}/{}/{path}", self.family, self.name)
    }
}

/// Every source below `root`: a corpus root, a family directory or a source directory, found by
/// its `inputs.pack`, in path order.
///
/// # Errors
///
/// `root` is not a directory, or not in a corpus.
///
/// # Panics
///
/// Never: a source directory is two levels below the corpus.
pub fn sources(root: &Path) -> Result<Vec<Source>, String> {
    let root = std::fs::canonicalize(root).map_err(|e| format!("{}: {e}", root.display()))?;
    let corpus = root
        .ancestors()
        .find(|a| a.join("_registry").is_dir())
        .ok_or_else(|| {
            format!(
                "{}: not in a corpus (no _registry/ above it)",
                root.display()
            )
        })?;
    let depth = root.components().count() - corpus.components().count();
    let source_dirs = match depth {
        0 => {
            let mut all = Vec::new();
            for family in subdirectories(&root)? {
                all.extend(subdirectories(&family)?);
            }
            all
        }
        1 => subdirectories(&root)?,
        _ => vec![
            root.ancestors()
                .nth(depth - 2)
                .expect("depth counted")
                .to_owned(),
        ],
    };
    Ok(source_dirs
        .into_iter()
        .filter(|d| d.join("inputs.pack").is_file())
        .map(|dir| {
            let name = |p: &Path| {
                p.file_name()
                    .map(|n| n.to_string_lossy().into_owned())
                    .unwrap_or_default()
            };
            Source {
                family: name(dir.parent().expect("a source is in a family")),
                name: name(&dir),
                dir,
            }
        })
        .collect())
}

/// The directories in `dir`, in name order, without the `_`-prefixed ones (`_registry`).
fn subdirectories(dir: &Path) -> Result<Vec<PathBuf>, String> {
    let mut found: Vec<PathBuf> = std::fs::read_dir(dir)
        .map_err(|e| format!("{}: {e}", dir.display()))?
        .flatten()
        .map(|e| e.path())
        .filter(|p| {
            p.is_dir()
                && !p
                    .file_name()
                    .is_some_and(|n| n.to_string_lossy().starts_with('_'))
        })
        .collect();
    found.sort_unstable();
    Ok(found)
}

/// What a unit's table in `units.toml` says.
#[derive(Deserialize, Default, Debug)]
pub(crate) struct UnitTable {
    /// `<task>` or `<task>/<variant>` to the reason it is not compared.
    #[serde(default)]
    skip: BTreeMap<String, String>,
}

impl UnitTable {
    pub(crate) fn skips(&self, task: &str) -> bool {
        let (name, _) = rsvelte_kernel::task_files::location(task);
        self.skip.contains_key(task) || self.skip.contains_key(name)
    }
}

#[derive(Deserialize)]
struct Lock {
    #[serde(default)]
    rules: Vec<String>,
}

/// The shared files of the corpus.
pub(crate) struct Registry {
    pub(crate) dir: PathBuf,
    pub(crate) units: BTreeMap<String, UnitTable>,
    locks: BTreeMap<String, Lock>,
}

impl Registry {
    pub(crate) fn read(corpus: &Path) -> Result<Self, String> {
        let dir = corpus.join("_registry");
        let read = |name: &str| {
            let file = dir.join(name);
            std::fs::read_to_string(&file).map_err(|e| format!("{}: {e}", file.display()))
        };
        let units = toml::from_str(&read("units.toml")?).map_err(|e| format!("units.toml: {e}"))?;
        let locks = serde_json::from_str(&read("oracles.json")?)
            .map_err(|e| format!("oracles.json: {e}"))?;
        Ok(Self { dir, units, locks })
    }

    /// The rules the official linter of `task` ran.
    pub(crate) fn lint_rules(&self, task: &str) -> &[String] {
        let (name, _) = rsvelte_kernel::task_files::location(task);
        self.locks.get(name).map_or(&[], |l| &l.rules)
    }
}
