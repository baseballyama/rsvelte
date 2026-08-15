use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};

use anyhow::{Context, Result, bail};
use serde::Deserialize;
use serde_json::Value;

#[derive(Debug, Deserialize)]
pub struct Manifest {
    pub schema_version: u32,
    pub upstream_root: PathBuf,
    pub snapshot_suites: Vec<SnapshotSuite>,
    pub testfiles: Testfiles,
    pub unit_coverage: UnitCoverage,
    pub unit_suites: Vec<UnitSuite>,
    pub behavior_cases: Vec<BehaviorCase>,
    pub exclusions: Vec<Exclusion>,
}

#[derive(Debug, Deserialize)]
pub struct SnapshotSuite {
    pub id: String,
    pub root: PathBuf,
    pub request: String,
    pub input: String,
    pub expected_priority: Vec<String>,
    pub fixture_count: usize,
}

#[derive(Debug, Deserialize)]
pub struct Testfiles {
    pub root: PathBuf,
    pub file_count: usize,
    pub svelte_count: usize,
    pub extensions: BTreeMap<String, usize>,
}

#[derive(Debug, Deserialize)]
pub struct UnitCoverage {
    pub upstream_it_call_sites: usize,
    pub ported_behavior_cases: usize,
    pub exact_behavior_cases: usize,
    pub known_difference_cases: usize,
    pub unported_it_call_sites: usize,
}

#[derive(Debug, Deserialize)]
pub struct UnitSuite {
    pub path: PathBuf,
    pub it_call_sites: usize,
    pub providers: Vec<String>,
    pub rsvelte_modules: Vec<PathBuf>,
    pub disposition: String,
    pub ported_behavior_cases: usize,
    pub unported_it_call_sites: usize,
}

#[derive(Debug, Deserialize)]
pub struct BehaviorCase {
    pub id: String,
    pub upstream_suite: PathBuf,
    pub upstream_test: String,
    pub method: String,
    #[serde(default)]
    pub fixture: Option<PathBuf>,
    pub source: String,
    #[serde(default)]
    pub params: Value,
    pub expected: Value,
    #[serde(default)]
    pub native_expected: Option<Value>,
    #[serde(default)]
    pub difference_reason: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct Exclusion {
    pub suite: String,
    pub fixture: PathBuf,
    pub reason: String,
    pub upstream_evidence: String,
}

#[derive(Debug)]
pub struct SnapshotFixture<'a> {
    pub suite: &'a SnapshotSuite,
    pub id: String,
    pub directory: PathBuf,
    pub input: PathBuf,
    pub expected: PathBuf,
}

impl Manifest {
    pub fn load() -> Result<Self> {
        let path = repo_root().join("scripts/compat-lsp/upstream-fixture-manifest.json");
        let text = fs::read_to_string(&path)
            .with_context(|| format!("could not read {}", path.display()))?;
        serde_json::from_str(&text).with_context(|| format!("invalid {}", path.display()))
    }

    pub fn upstream_root(&self) -> PathBuf {
        repo_root().join(&self.upstream_root)
    }

    pub fn snapshot_fixtures<'a>(
        &'a self,
        suite: &'a SnapshotSuite,
    ) -> Result<Vec<SnapshotFixture<'a>>> {
        let root = self.upstream_root().join(&suite.root);
        let mut inputs = files_below(&root)?
            .into_iter()
            .filter(|path| {
                path.file_name()
                    .is_some_and(|name| name == suite.input.as_str())
            })
            .collect::<Vec<_>>();
        inputs.sort();
        inputs
            .into_iter()
            .map(|input| {
                let directory = input
                    .parent()
                    .context("fixture input has no parent")?
                    .to_path_buf();
                let expected = suite
                    .expected_priority
                    .iter()
                    .map(|name| directory.join(name))
                    .find(|path| path.is_file())
                    .with_context(|| format!("{} has no expected snapshot", directory.display()))?;
                let id = directory
                    .strip_prefix(&root)
                    .context("fixture escaped its suite root")?
                    .to_string_lossy()
                    .replace('\\', "/");
                Ok(SnapshotFixture {
                    suite,
                    id,
                    directory,
                    input,
                    expected,
                })
            })
            .collect()
    }

    pub fn testfiles(&self) -> Result<Vec<PathBuf>> {
        files_below(&self.upstream_root().join(&self.testfiles.root))
    }

    pub fn is_excluded(&self, fixture: &SnapshotFixture<'_>) -> bool {
        self.exclusions.iter().any(|exclusion| {
            exclusion.suite == fixture.suite.id
                && exclusion.fixture.to_string_lossy().replace('\\', "/") == fixture.id
        })
    }
}

pub fn repo_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("../..")
}

pub fn files_below(root: &Path) -> Result<Vec<PathBuf>> {
    if !root.is_dir() {
        bail!("fixture root is missing: {}", root.display());
    }
    let mut pending = vec![root.to_path_buf()];
    let mut files = Vec::new();
    while let Some(directory) = pending.pop() {
        for entry in fs::read_dir(&directory)
            .with_context(|| format!("could not read {}", directory.display()))?
        {
            let path = entry?.path();
            if path.is_dir() {
                if !matches!(
                    path.file_name().and_then(|name| name.to_str()),
                    Some(".rsvelte-language-server" | "node_modules" | ".git")
                ) {
                    pending.push(path);
                }
            } else if path.is_file() {
                files.push(path);
            }
        }
    }
    files.sort();
    Ok(files)
}
