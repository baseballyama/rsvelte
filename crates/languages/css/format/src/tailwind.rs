//! Tailwind CSS's class order.
//!
//! The order is a function of the project's Tailwind configuration, which only Tailwind's engine
//! knows, so the project's `prettier-plugin-tailwindcss` sorts, in a Node process; formatters only
//! find the class lists in their trees.

use std::collections::HashMap;
use std::io::{BufRead, BufReader, Write};
use std::path::{Path, PathBuf};
use std::process::{Child, ChildStdin, ChildStdout, Command, Stdio};
use std::sync::{Arc, Mutex, OnceLock, PoisonError};

use oxc_formatter::SortTailwindcssOptions;
use oxc_formatter_core::TailwindSorter;
use rsvelte_kernel::source::document::Document;
use serde::{Deserialize, Serialize};

#[cfg(test)]
mod tests;

const SORTER: &str = include_str!("tailwind/sorter.ts");

/// oxfmt's `sortTailwindcss`. A host builds it from Prettier's `tailwind*` options too.
#[derive(Clone, Debug, Default, PartialEq, Eq, Hash, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields, default)]
pub struct Options {
    /// Tailwind 4's style sheet, relative to the options' directory.
    pub stylesheet: Option<PathBuf>,
    /// Tailwind 3's configuration, relative to the options' directory.
    pub config: Option<PathBuf>,
    /// The attributes besides `class` that hold classes.
    pub attributes: Vec<String>,
    /// The functions whose strings hold classes.
    pub functions: Vec<String>,
    pub preserve_whitespace: bool,
    pub preserve_duplicates: bool,
}

impl Options {
    /// The first option whose value rsvelte does not take yet: a `/pattern/` name, which oxc's
    /// formatters do not match.
    #[must_use]
    pub fn unported(&self) -> Option<&'static str> {
        let pattern = |name: &String| name.starts_with('/') && name.rfind('/') > Some(0);
        if self.attributes.iter().any(pattern) {
            Some("sortTailwindcss.attributes")
        } else if self.functions.iter().any(pattern) {
            Some("sortTailwindcss.functions")
        } else {
            None
        }
    }

    /// What oxc's formatters read to find the classes in JavaScript.
    #[must_use]
    pub fn javascript(&self) -> Arc<SortTailwindcssOptions> {
        Arc::new(SortTailwindcssOptions {
            functions: self.functions.clone(),
            attributes: self.attributes.clone(),
            preserve_whitespace: self.preserve_whitespace,
        })
    }
}

/// A class list and how the plugin's `sortClasses` sorts it where it was found.
#[derive(Clone, Copy, Debug)]
pub struct ClassList<'a> {
    pub text: &'a str,
    pub collapse_whitespace: bool,
    pub remove_duplicates: bool,
}

/// The part of `text` that `sortClasses` reorders, as a byte range.
///
/// It keeps the first class (`ignoreFirst`) or the last (`ignoreLast`) where they touch an
/// expression, and all of `text` (`None`) when it holds `{{`. The callers ask to keep an end only
/// where `text` does not start or end with whitespace there.
#[must_use]
pub fn sorted_part(text: &str, ignore_first: bool, ignore_last: bool) -> Option<(usize, usize)> {
    if text.is_empty() || text.contains("{{") {
        return None;
    }
    let is_space = |c: char| matches!(c, '\t' | '\r' | '\x0C' | '\n' | ' ');
    let start = if ignore_first {
        let class = text.find(is_space).unwrap_or(text.len());
        let rest = &text[class..];
        class + (rest.len() - rest.trim_start_matches(is_space).len())
    } else {
        0
    };
    let end = if ignore_last {
        let class = text.rfind(is_space).map_or(0, |i| i + 1);
        text[..class].trim_end_matches(is_space).len()
    } else {
        text.len()
    };
    Some((start, end.max(start)))
}

/// The sorters started so far, by their options and directory.
type Started = HashMap<(Options, PathBuf), Arc<Sorter>>;

/// A running sorter, shared by every formatter of the run that has the same options.
#[derive(Debug)]
pub struct Sorter {
    options: Options,
    /// Where the options' paths start, and a file with a relative path is.
    base: PathBuf,
    session: Mutex<Session>,
}

#[derive(Debug)]
struct Session {
    child: Child,
    input: ChildStdin,
    output: BufReader<ChildStdout>,
    /// Why the process cannot sort any more; later calls fail with it.
    failed: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Start<'a> {
    base: &'a Path,
    stylesheet: Option<&'a Path>,
    config: Option<&'a Path>,
}

#[derive(Serialize)]
struct Request<'a> {
    file: &'a Path,
    lists: Vec<List<'a>>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct List<'a> {
    text: &'a str,
    collapse_whitespace: bool,
    remove_duplicates: bool,
}

#[derive(Deserialize)]
#[serde(untagged)]
enum Response {
    Ready { ready: bool },
    Sorted { sorted: Vec<String> },
    Failed { error: String },
}

impl Sorter {
    /// The sorter for `options`, whose paths start from `base`, which also finds the plugin. The
    /// first call for these options starts Node and loads the plugin.
    ///
    /// # Errors
    ///
    /// Node does not start, or the plugin is not found from `base`.
    pub fn start(options: &Options, base: &Path) -> Result<Arc<Self>, String> {
        static STARTED: OnceLock<Mutex<Started>> = OnceLock::new();
        let mut started =
            (STARTED.get_or_init(Mutex::default).lock()).unwrap_or_else(PoisonError::into_inner);
        let key = (options.clone(), base.to_owned());
        if let Some(sorter) = started.get(&key) {
            return Ok(Arc::clone(sorter));
        }
        let sorter = Arc::new(Self {
            options: options.clone(),
            base: base.to_owned(),
            session: Mutex::new(Session::start(options, base)?),
        });
        started.insert(key, Arc::clone(&sorter));
        drop(started);
        Ok(sorter)
    }

    #[must_use]
    pub const fn options(&self) -> &Options {
        &self.options
    }

    /// Each of `lists` sorted as the plugin sorts it for `file` ([`Self::file_of`]).
    ///
    /// # Errors
    ///
    /// The plugin failed, or Node did.
    pub fn sort(&self, file: &Path, lists: &[ClassList<'_>]) -> Result<Vec<String>, String> {
        if lists.is_empty() {
            return Ok(Vec::new());
        }
        let request = Request {
            file,
            lists: (lists.iter())
                .map(|list| List {
                    text: list.text,
                    collapse_whitespace: list.collapse_whitespace
                        && !self.options.preserve_whitespace,
                    remove_duplicates: list.remove_duplicates && !self.options.preserve_duplicates,
                })
                .collect(),
        };
        let mut session = self.session.lock().unwrap_or_else(PoisonError::into_inner);
        match session.exchange(&request)? {
            Response::Sorted { sorted } if sorted.len() == lists.len() => Ok(sorted),
            Response::Failed { error } => Err(error),
            _ => Err(session.fail("an answer that is not one class list per request")),
        }
    }

    /// Where the plugin finds Tailwind for `document`: its file, or for a document with a name
    /// only, that name in the options' directory. The plugin finds Tailwind from an absolute
    /// path only, and otherwise falls back to its own copy.
    #[must_use]
    pub fn file_of(&self, document: &Document) -> PathBuf {
        // A host's relative path starts from the current directory; without one, from ours.
        document.file.as_ref().map_or_else(
            || self.base.join(&document.path),
            |file| std::path::absolute(file).unwrap_or_else(|_| self.base.join(file)),
        )
    }

    /// The sorter oxc's formatters call with the classes they found in `file`, as
    /// `sortClassAttributes` sorts them.
    #[must_use]
    pub fn for_oxc(self: &Arc<Self>, file: PathBuf) -> OxcSorter {
        let shared = Arc::clone(self);
        let failure = Arc::new(OnceLock::new());
        let kept = Arc::clone(&failure);
        let sorter: TailwindSorter = Arc::new(move |classes: Vec<String>| {
            let lists: Vec<ClassList<'_>> = (classes.iter())
                .map(|text| ClassList {
                    text,
                    collapse_whitespace: true,
                    remove_duplicates: true,
                })
                .collect();
            match shared.sort(&file, &lists) {
                Ok(sorted) => sorted,
                Err(error) => {
                    drop(kept.set(error));
                    classes
                }
            }
        });
        OxcSorter { sorter, failure }
    }
}

/// The sorter for one file that oxc's formatters call as they print.
///
/// oxc's sorter cannot fail, so a failure leaves the classes as they are and is kept for the
/// caller to report after printing.
pub struct OxcSorter {
    pub sorter: TailwindSorter,
    failure: Arc<OnceLock<String>>,
}

impl std::fmt::Debug for OxcSorter {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("OxcSorter")
            .field("failure", &self.failure)
            .finish_non_exhaustive()
    }
}

impl OxcSorter {
    /// Why the sorter left classes as they were, if it did.
    #[must_use]
    pub fn failure(&self) -> Option<&str> {
        self.failure.get().map(String::as_str)
    }
}

impl Session {
    fn start(options: &Options, base: &Path) -> Result<Self, String> {
        let mut child = Command::new("node")
            .args(["--input-type=module-typescript", "--eval", SORTER])
            .current_dir(base)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .spawn()
            .map_err(|error| format!("cannot start Node to sort Tailwind CSS classes: {error}"))?;
        let (Some(input), Some(output)) = (child.stdin.take(), child.stdout.take()) else {
            unreachable!("both are piped");
        };
        let mut session = Self {
            child,
            input,
            output: BufReader::new(output),
            failed: None,
        };
        let stylesheet = options.stylesheet.as_ref().map(|p| base.join(p));
        let config = options.config.as_ref().map(|p| base.join(p));
        let start = Start {
            base,
            stylesheet: stylesheet.as_deref(),
            config: config.as_deref(),
        };
        match session.exchange(&start)? {
            Response::Ready { ready: true } => Ok(session),
            Response::Failed { error } => Err(error),
            _ => Err(session.fail("an answer that is not ready")),
        }
    }

    fn exchange(&mut self, request: &impl Serialize) -> Result<Response, String> {
        if let Some(failed) = &self.failed {
            return Err(failed.clone());
        }
        let mut line = serde_json::to_vec(request).map_err(|error| error.to_string())?;
        line.push(b'\n');
        if let Err(error) = self
            .input
            .write_all(&line)
            .and_then(|()| self.input.flush())
        {
            return Err(self.fail(&error.to_string()));
        }
        let mut answer = String::new();
        match self.output.read_line(&mut answer) {
            Ok(0) => Err(self.fail("Node exited")),
            Ok(_) => serde_json::from_str(&answer).map_err(|error| self.fail(&error.to_string())),
            Err(error) => Err(self.fail(&error.to_string())),
        }
    }

    fn fail(&mut self, why: &str) -> String {
        let failed = format!("the Tailwind CSS sorter failed: {why}");
        self.failed = Some(failed.clone());
        drop(self.child.kill());
        failed
    }
}

impl Drop for Session {
    fn drop(&mut self) {
        drop(self.child.kill());
        drop(self.child.wait());
    }
}
