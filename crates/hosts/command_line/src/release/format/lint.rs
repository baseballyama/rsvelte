//! `lint` of the Svelte files `format --check` formats, from the parse each file's format reads.

use std::collections::HashMap;
use std::path::PathBuf;
use std::process::ExitCode;
use std::sync::Mutex;

use rsvelte_kernel::computation::pipeline::{self, DocumentResult};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::source::document::Document;
use rsvelte_svelte_format::{Format, Options, TASK};
use serde_json::Value;

use super::super::LINT;
use crate::commands::{files, lint};
use crate::usage;

/// The lint of the files below the paths, filled in as format reaches them.
pub(in crate::release) struct Lint {
    reg: Registry,
    files: Vec<PathBuf>,
    /// Each file's index in `files`, by the absolute path oxfmt names it by.
    at: HashMap<PathBuf, usize>,
    linted: Mutex<Vec<Option<(Document, DocumentResult)>>>,
}

impl Lint {
    /// The lint of `files`, in the order lint reports them, with the tasks of `reg`.
    pub(in crate::release) fn new(reg: Registry, files: Vec<PathBuf>) -> Self {
        let at = (files.iter().enumerate())
            .filter_map(|(i, file)| Some((std::path::absolute(file).ok()?, i)))
            .collect();
        let linted = Mutex::new(files.iter().map(|_| None).collect());
        Self {
            reg,
            files,
            at,
            linted,
        }
    }

    /// What formatting `source_text`, the file `prettier` names, with `options` gives, with the
    /// file linted from the same parse. `None` leaves both to run as they do alone: the file is
    /// not linted, a task panicked, or Tailwind CSS sorting makes format parse the sorted text.
    pub(super) fn format(
        &self,
        source_text: &str,
        prettier: &Value,
        options: &Options,
    ) -> Option<Result<String, String>> {
        if options.tailwind.is_some() {
            return None;
        }
        let path = std::path::absolute(prettier.get("filepath")?.as_str()?).ok()?;
        let &i = self.at.get(&path)?;
        let file = &self.files[i];
        let document = files::named(
            file.to_string_lossy().into_owned(),
            file.clone(),
            source_text.to_owned(),
        )
        .ok()?;
        let task = Format::new(options.clone());
        let mut result = pipeline::run_one(&self.reg, &document, LINT, &task).ok()?;
        if result.panic.is_some() {
            return None;
        }
        let (_, out) = result.take(&[TASK]).outputs.pop()?;
        let formatted = match (out.files.into_iter().next(), out.diagnostics.first()) {
            (Some(file), _) => Ok(file.text),
            (None, Some(diagnostic)) => Err(super::located(source_text, diagnostic)),
            (None, None) => return None,
        };
        self.linted.lock().expect("no panic under the lock")[i] = Some((document, result));
        Some(formatted)
    }

    /// Lints the files format did not, and prints each file's report in lint's order.
    pub(in crate::release) fn print(&self) -> ExitCode {
        let mut linted = std::mem::take(&mut *self.linted.lock().expect("no panic under the lock"));
        let rest: Vec<usize> = (0..linted.len()).filter(|&i| linted[i].is_none()).collect();
        let paths = rest.iter().map(|&i| self.files[i].clone());
        let documents = match files::read_all(&self.reg, paths, LINT) {
            Ok(documents) => documents,
            Err(e) => return usage(&e),
        };
        let results = match files::run(&self.reg, &documents, LINT) {
            Ok(results) => results,
            Err(code) => return code,
        };
        for (i, read) in rest.into_iter().zip(documents.into_iter().zip(results)) {
            linted[i] = Some(read);
        }
        lint::print((linted.iter().flatten()).map(|(document, result)| (document, result)))
    }
}
