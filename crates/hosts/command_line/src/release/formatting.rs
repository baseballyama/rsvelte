//! The formatting options of each file, resolved as the project's formatter resolves them.
//!
//! A file is first left or kept by the `ignorePatterns` of its nearest oxfmt configuration;
//! nothing else is read for a file that is left. A kept file's options are then the
//! formatter's defaults, the `.editorconfig` sections that match it, and its nearest oxfmt or
//! Prettier configuration, in that order. Every option keeps where it came from, and what rsvelte
//! cannot read or print is a [`Refusal`] carried in the result, so it counts only where the
//! options are used.

mod configuration;
mod editorconfig;

use std::collections::{BTreeMap, BTreeSet, HashMap};
use std::fmt;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex, PoisonError};

use configuration::{Configuration, Formatter};
use editorconfig::{EditorConfig, Given};
use serde_json::Value;

/// Where an option's value came from.
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub(crate) enum Origin {
    Default(Formatter),
    File(Arc<Path>),
}

impl fmt::Display for Origin {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Default(Formatter::Oxfmt) => f.write_str("oxfmt's defaults"),
            Self::Default(Formatter::Prettier) => f.write_str("Prettier's defaults"),
            Self::File(path) => write!(f, "{}", path.display()),
        }
    }
}

/// Why rsvelte cannot format as a source says, and the source.
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub(crate) struct Refusal {
    pub(crate) reason: String,
    pub(crate) origin: Origin,
}

impl fmt::Display for Refusal {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}: {}", self.origin, self.reason)
    }
}

/// The options one file is formatted with, under Prettier's names, and the first refusal of their
/// sources. Files with equal options are formatted together.
#[derive(Clone, Debug, Default, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub(crate) struct Resolved {
    options: BTreeMap<String, Set>,
    refused: Option<Refusal>,
}

/// One option's value, as JSON, with its origin and the name it has there.
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
struct Set {
    json: String,
    origin: Origin,
    written: String,
}

impl Resolved {
    fn set(&mut self, name: &str, value: &Value, origin: Origin) {
        self.set_as(name, name, value, origin);
    }

    fn set_as(&mut self, name: &str, written: &str, value: &Value, origin: Origin) {
        let set = Set {
            json: value.to_string(),
            origin,
            written: written.to_owned(),
        };
        self.options.insert(name.to_owned(), set);
    }

    fn refuse(&mut self, reason: String, origin: Origin) {
        self.refused.get_or_insert(Refusal { reason, origin });
    }

    /// The options of `svelte.format`, as JSON.
    pub(crate) fn svelte(&self) -> String {
        self.json(|_| true)
    }

    /// The options of `typescript.format`, as JSON: those that change TypeScript output.
    pub(crate) fn typescript(&self) -> String {
        self.json(|name| rsvelte_typescript_format::options::NAMES.contains(&name))
    }

    fn json(&self, keep: impl Fn(&str) -> bool) -> String {
        let pairs: Vec<String> = (self.options.iter())
            .filter(|(name, _)| keep(name))
            .map(|(name, set)| format!("{}:{}", Value::from(name.as_str()), set.json))
            .collect();
        format!("{{{}}}", pairs.join(","))
    }

    /// Every source an option came from.
    pub(crate) fn sources(&self) -> BTreeSet<&Origin> {
        self.options.values().map(|set| &set.origin).collect()
    }

    /// Why the formatters cannot take these options, whatever they print.
    pub(crate) const fn refused(&self) -> Option<&Refusal> {
        self.refused.as_ref()
    }

    /// Where the option `name` came from.
    #[cfg(test)]
    pub(crate) fn origin(&self, name: &str) -> Option<&Origin> {
        self.options.get(name).map(|set| &set.origin)
    }

    /// The refusal of option `name`, with `reason` given the name it has where it was set, and
    /// that place.
    pub(crate) fn refusal(&self, name: &str, reason: impl FnOnce(&str) -> String) -> Refusal {
        match self.options.get(name) {
            Some(set) => Refusal {
                reason: reason(&set.written),
                origin: set.origin.clone(),
            },
            None => Refusal {
                reason: reason(name),
                origin: Origin::Default(Formatter::Prettier),
            },
        }
    }

    /// The names of the options.
    pub(crate) fn names(&self) -> impl Iterator<Item = &str> {
        self.options.keys().map(String::as_str)
    }

    /// These options with only `name`.
    pub(crate) fn only(&self, name: &str) -> Self {
        Self {
            options: (self.options.iter())
                .filter(|(n, _)| *n == name)
                .map(|(n, value)| (n.clone(), value.clone()))
                .collect(),
            refused: None,
        }
    }
}

/// What a file's resolution decides.
#[derive(Debug, PartialEq, Eq)]
pub(crate) enum Resolution {
    /// Its nearest oxfmt configuration's `ignorePatterns` leave it.
    Ignored,
    Formatted(Resolved),
}

/// Resolves files and prunes directories; what it reads is read once per directory. It is
/// shared with the walk, which asks it which directories to leave.
pub(crate) struct Resolver {
    cwd: PathBuf,
    /// Whether any plugin takes the resolved options: not when `rsvelte.config` names them all,
    /// and then only `ignorePatterns` are read.
    options: bool,
    read: Mutex<Read>,
}

/// Each directory's own files, as they are read.
#[derive(Default)]
struct Read {
    configurations: HashMap<(PathBuf, Formatter), Option<Arc<Configuration>>>,
    editorconfigs: HashMap<PathBuf, Option<Arc<EditorConfig>>>,
    oxfmt_below: HashMap<PathBuf, bool>,
    warnings: BTreeSet<String>,
}

impl Resolver {
    pub(crate) fn new(cwd: PathBuf, options: bool) -> Self {
        Self {
            cwd,
            options,
            read: Mutex::new(Read::default()),
        }
    }

    fn read(&self) -> std::sync::MutexGuard<'_, Read> {
        self.read.lock().unwrap_or_else(PoisonError::into_inner)
    }

    fn absolute(&self, path: &Path) -> PathBuf {
        // `components` drops the `./` a walk of `.` puts in front of every path.
        self.cwd.join(path).components().collect()
    }

    pub(crate) fn resolve(&self, file: &Path) -> Resolution {
        let file = self.absolute(file);
        let directory = file.parent().unwrap_or(&file);
        let mut read = self.read();
        if let Some(oxfmt) = read.nearest(directory, &[Formatter::Oxfmt])
            && oxfmt.ignores(&file, false)
        {
            return Resolution::Ignored;
        }
        let mut resolved = Resolved::default();
        if !self.options {
            return Resolution::Formatted(resolved);
        }
        let configuration = read.nearest(directory, &[Formatter::Oxfmt, Formatter::Prettier]);
        let formatter = configuration
            .as_ref()
            .map_or(Formatter::Prettier, |c| c.formatter);
        for &(name, value) in formatter.defaults() {
            resolved.set(name, &Value::from(value), Origin::Default(formatter));
        }
        let editorconfigs = match formatter {
            Formatter::Prettier => read.prettier_editorconfigs(directory),
            Formatter::Oxfmt => read.oxfmt_editorconfig(&self.cwd).into_iter().collect(),
        };
        let outermost_first = editorconfigs.iter().rev().map(AsRef::as_ref);
        for (name, given, at) in editorconfig::options(outermost_first, &file) {
            match (given, formatter) {
                (Given::Value(value), _) => resolved.set(name, &value, Origin::File(at)),
                // oxfmt drops what it cannot print as a number; Prettier prints no line limit.
                (Given::Unlimited, Formatter::Oxfmt) => {}
                (Given::Unlimited, Formatter::Prettier) => resolved.refuse(
                    "rsvelte does not format with this `max_line_length = off` yet".to_owned(),
                    Origin::File(at),
                ),
            }
        }
        if let Some(configuration) = configuration {
            let source = || Origin::File(Arc::clone(&configuration.source));
            let options = &configuration.options;
            for (name, written, value) in &options.printed {
                resolved.set_as(name, written, value, source());
            }
            if let Some(reason) = &options.refused {
                resolved.refuse(reason.clone(), source());
            }
            for name in &options.unknown {
                read.warnings.insert(format!(
                    "{}: ignored unknown option `{name}`",
                    configuration.source.display()
                ));
            }
        }
        drop(read);
        Resolution::Formatted(resolved)
    }

    /// What the formatter ignores of the configurations read so far.
    pub(crate) fn warnings(&self) -> Vec<String> {
        self.read().warnings.iter().cloned().collect()
    }
}

impl Read {
    /// The nearest configuration of `formatters` in `directory` and its ancestors; in one
    /// directory, the first of `formatters` that has one.
    fn nearest(
        &mut self,
        directory: &Path,
        formatters: &[Formatter],
    ) -> Option<Arc<Configuration>> {
        directory.ancestors().find_map(|directory| {
            (formatters.iter()).find_map(|&formatter| self.configuration(directory, formatter))
        })
    }

    fn configuration(
        &mut self,
        directory: &Path,
        formatter: Formatter,
    ) -> Option<Arc<Configuration>> {
        (self.configurations)
            .entry((directory.to_owned(), formatter))
            .or_insert_with(|| Configuration::find(directory, formatter).map(Arc::new))
            .clone()
    }

    fn editorconfig(&mut self, directory: &Path) -> Option<Arc<EditorConfig>> {
        (self.editorconfigs)
            .entry(directory.to_owned())
            .or_insert_with(|| EditorConfig::read(directory.join(".editorconfig")).map(Arc::new))
            .clone()
    }

    /// Prettier's `.editorconfig` files for a file in `directory`, nearest first: up to the
    /// project root, the nearest directory with `.git` or `.hg`, or to one that says `root`.
    fn prettier_editorconfigs(&mut self, directory: &Path) -> Vec<Arc<EditorConfig>> {
        let mut found = Vec::new();
        for directory in directory.ancestors() {
            let own = self.editorconfig(directory);
            let root = own.as_ref().is_some_and(|own| own.root);
            found.extend(own);
            if root || directory.join(".git").exists() || directory.join(".hg").is_dir() {
                break;
            }
        }
        found
    }

    /// oxfmt's `.editorconfig`: the nearest one of the current directory and its ancestors.
    fn oxfmt_editorconfig(&mut self, cwd: &Path) -> Option<Arc<EditorConfig>> {
        cwd.ancestors()
            .find_map(|directory| self.editorconfig(directory))
    }

    /// Whether an oxfmt configuration is in a directory below `directory`.
    fn oxfmt_below(&mut self, directory: &Path) -> bool {
        if let Some(&below) = self.oxfmt_below.get(directory) {
            return below;
        }
        let names: Vec<&str> = configuration::oxfmt_file_names().collect();
        let mut walk = ignore::WalkBuilder::new(directory);
        walk.standard_filters(false).filter_entry(|entry| {
            !matches!(entry.file_name().to_str(), Some("node_modules" | ".git"))
        });
        // A directory that cannot be read is not left: the walk reports it.
        let below = walk.build().any(|entry| {
            entry.map_or(true, |entry| {
                entry.depth() > 1
                    && (entry.file_name().to_str()).is_some_and(|n| names.contains(&n))
            })
        });
        self.oxfmt_below.insert(directory.to_owned(), below);
        below
    }
}

impl crate::commands::files::Prune for Resolver {
    /// Whether a walk can leave `directory` without reading it: its nearest oxfmt
    /// configuration's `ignorePatterns` leave it, and no oxfmt configuration below it takes
    /// its files back.
    fn prunes(&self, directory: &Path) -> bool {
        let directory = self.absolute(directory);
        let mut read = self.read();
        read.nearest(&directory, &[Formatter::Oxfmt])
            .is_some_and(|oxfmt| oxfmt.ignores(&directory, true))
            && !read.oxfmt_below(&directory)
    }
}

#[cfg(test)]
mod tests;
