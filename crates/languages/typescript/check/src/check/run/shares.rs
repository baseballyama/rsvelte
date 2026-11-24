//! The check of a project's files, shared out among processes that each open the project.

use std::path::{Path, PathBuf};

use rsvelte_typescript_api::{DiagnosticKind, Layer, Project, Session};

use super::{CheckRequest, untyped};

pub(super) type Helper = std::thread::JoinHandle<Result<Session, String>>;
pub(super) type Found = Vec<rsvelte_typescript_api::Diagnostic>;
/// The modules each import of a document reads, by document.
pub(super) type Modules = Vec<(usize, Vec<Option<PathBuf>>)>;

/// What the processes found in the project of `config`.
pub(super) struct Checked {
    /// The program, syntactic and semantic findings.
    pub(super) found: [Found; 3],
    /// The modules each document's imports read, by document, when asked to resolve them.
    pub(super) modules: Modules,
    /// What the project of the selection config, if any, holds beyond the files the tsconfig
    /// selects.
    pub(super) selected: untyped::Selected,
}

/// The config of a project whose root files are those the tsconfig selects, and the documents
/// to ask whether a search of `node_modules` found them.
pub(super) struct Selection<'s> {
    pub(super) config: PathBuf,
    pub(super) packages: Resolve<'s>,
}

/// The documents whose imports the processes resolve, at their paths.
pub(super) type Resolve<'r> = Option<(&'r CheckRequest<'r>, &'r [PathBuf])>;

/// The program, syntactic and semantic findings of `files` in the project of `config`, and the
/// modules their imports read when `resolve` asks. Every process opens the project at the same
/// time and takes shares of the files from `Shares` until none is left; `session` also asks for
/// the program and syntactic findings, and opens the project of `selection` in its snapshot.
pub(super) fn check_shares(
    session: &mut Session,
    helpers: Vec<Helper>,
    config: &Path,
    selection: Option<&Selection<'_>>,
    layer: &Layer,
    files: &[&Path],
    resolve: Resolve<'_>,
) -> Result<Checked, String> {
    let shares = Shares::new(files, helpers.len() + 1, resolve);
    let shares = &shares;
    std::thread::scope(|scope| {
        let running: Vec<_> = helpers
            .into_iter()
            .map(|helper| {
                scope.spawn(move || {
                    let mut helper = helper
                        .join()
                        .unwrap_or_else(|panic| std::panic::resume_unwind(panic))?;
                    let project = helper.open(&[config], layer)?.remove(0);
                    shares.check(&mut helper, &project)
                })
            })
            .collect();
        let mut configs = vec![config];
        configs.extend(selection.map(|selection| selection.config.as_path()));
        let mut projects = session.open(&configs, layer)?.into_iter();
        let project = projects.next().ok_or("the checker opened no project")?;
        let selected = match (projects.next(), selection) {
            (Some(project), Some(selection)) => {
                untyped::selected(session, &project, selection.packages)?
            }
            _ => untyped::Selected::default(),
        };
        let program = session.diagnostics(&project, DiagnosticKind::Program, None)?;
        let syntactic = session.diagnostics(&project, DiagnosticKind::Syntactic, Some(files))?;
        let (mut semantic, mut modules) = shares.check(session, &project)?;
        for helper in running {
            let (found, resolved) = helper
                .join()
                .unwrap_or_else(|panic| std::panic::resume_unwind(panic))?;
            semantic.extend(found);
            modules.extend(resolved);
        }
        Ok(Checked {
            found: [program, syntactic, semantic],
            modules,
            selected,
        })
    })
}

/// The files no process has taken yet. A process takes half of its part of what is left, as in
/// factoring scheduling: early shares are large, so few requests are made, and the last are
/// single files, so the processes finish together however long each file takes.
struct Shares<'a> {
    files: &'a [&'a Path],
    processes: usize,
    taken: std::sync::Mutex<usize>,
    resolve: Resolve<'a>,
}

impl<'a> Shares<'a> {
    const fn new(files: &'a [&'a Path], processes: usize, resolve: Resolve<'a>) -> Self {
        Self {
            files,
            processes,
            taken: std::sync::Mutex::new(0),
            resolve,
        }
    }

    fn take(&self) -> Option<std::ops::Range<usize>> {
        let mut taken = self
            .taken
            .lock()
            .unwrap_or_else(std::sync::PoisonError::into_inner);
        let start = *taken;
        let left = self.files.len() - start;
        *taken += left.div_ceil(2 * self.processes);
        let end = *taken;
        drop(taken);
        (left != 0).then_some(start..end)
    }

    /// The semantic findings of each share `session` takes, and the modules of its documents'
    /// imports when asked.
    fn check(&self, session: &mut Session, project: &Project) -> Result<(Found, Modules), String> {
        let mut found = Vec::new();
        let mut modules = Vec::new();
        while let Some(share) = self.take() {
            let files = &self.files[share.clone()];
            found.extend(session.diagnostics(project, DiagnosticKind::Semantic, Some(files))?);
            if let Some((req, paths)) = self.resolve {
                for file in share {
                    let resolved = untyped::modules(req, session, project, paths, file)?;
                    if !resolved.is_empty() {
                        modules.push((file, resolved));
                    }
                }
            }
        }
        Ok((found, modules))
    }
}

#[cfg(test)]
mod tests;
