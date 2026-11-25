//! The check of a project's files, shared out among processes that each open the project. The
//! checker's API checks with one thread, so only more processes check in parallel, and each one
//! builds the whole program again.

use std::collections::HashSet;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::time::{Duration, Instant};

use rsvelte_typescript_api::{DiagnosticKind, Layer, Project, Session};

use super::{CheckRequest, untyped};
use crate::type_checker::TypeChecker;

pub(super) type Found = Vec<rsvelte_typescript_api::Diagnostic>;
/// The modules each import of a document reads, by document.
pub(super) type Modules = Vec<(usize, Vec<Option<PathBuf>>)>;

/// What the processes found in the project of `config`.
pub(super) struct Checked {
    /// The program, syntactic and semantic findings.
    pub(super) found: [Found; 3],
    /// The modules each document's imports read, by document, when asked to resolve them.
    pub(super) modules: Modules,
}

/// The documents whose imports the processes resolve, at their paths, and which of those paths
/// are JavaScript, whose imports cannot be untyped.
pub(super) type Resolve<'r> = Option<(&'r CheckRequest<'r>, &'r [PathBuf], &'r HashSet<PathBuf>)>;

/// The checker processes a check may add to its own session, and when to start them.
pub(super) struct Helpers {
    pub(super) checker: TypeChecker,
    /// Where each process runs.
    pub(super) root: PathBuf,
    /// How many processes may check at once, the session's own included.
    pub(super) most: usize,
    /// Whether every helper opens the project at once, before the check's cost is known.
    pub(super) at_once: bool,
    /// Processes of an earlier pass, with the snapshot each still holds.
    pub(super) idle: Vec<Idle>,
}

/// A helper that has checked, and the snapshot it still holds.
pub(super) type Idle = (Session, u64);

impl Helpers {
    fn session(&self, idle: &Mutex<Vec<Idle>>) -> Result<Session, String> {
        let reused = idle
            .lock()
            .unwrap_or_else(std::sync::PoisonError::into_inner)
            .pop();
        match reused {
            Some((mut session, snapshot)) => {
                session.release(snapshot)?;
                Ok(session)
            }
            None => self.checker.session(&self.root),
        }
    }
}

/// The program, syntactic and semantic findings of `files` in the project of `config`, and the
/// modules their imports read when `resolve` asks; with the helpers that checked, for a later pass.
/// Every process takes shares of the files from `Shares` until none is left; `session` also asks
/// for the program and syntactic findings.
///
/// Helpers open the project at once when `helpers.at_once`. Otherwise `session` opens it first and
/// checks a sample, and a helper starts only where the time it saves exceeds the time it takes to
/// open the project, which a small or quickly checked project never repays.
pub(super) fn check_shares(
    session: &mut Session,
    mut helpers: Helpers,
    config: &Path,
    layer: &Layer,
    files: &[&Path],
    resolve: Resolve<'_>,
) -> Result<(Checked, Vec<Idle>), String> {
    let shares = Shares::new(files, helpers.most, resolve);
    let idle = &Mutex::new(std::mem::take(&mut helpers.idle));
    let (shares, helpers) = (&shares, &helpers);
    std::thread::scope(|scope| {
        let start = |count: usize| -> Vec<_> {
            shares.processes.store(count + 1, Ordering::Relaxed);
            (0..count)
                .map(|_| {
                    scope.spawn(move || {
                        let mut helper = helpers.session(idle)?;
                        let project = helper.open(&[config], layer)?.remove(0);
                        let found = shares.check(&mut helper, &project)?;
                        Ok::<_, String>((found, (helper, project.snapshot)))
                    })
                })
                .collect()
        };
        let mut running = if helpers.at_once {
            start(helpers.most - 1)
        } else {
            Vec::new()
        };
        let opening = Instant::now();
        let project = (session.open(&[config], layer)?.into_iter().next())
            .ok_or("the checker opened no project")?;
        let open = opening.elapsed();
        let program = session.diagnostics(&project, DiagnosticKind::Program, None)?;
        let syntactic = session.diagnostics(&project, DiagnosticKind::Syntactic, Some(files))?;
        let (mut semantic, mut modules) = (Vec::new(), Vec::new());
        if !helpers.at_once {
            let sampling = Instant::now();
            let sampled = shares.check_sample(session, &project, &mut semantic, &mut modules)?;
            let count = worth_starting(open, sampling.elapsed(), sampled, shares.left());
            running = start(count.min(helpers.most - 1));
        }
        let (found, resolved) = shares.check(session, &project)?;
        semantic.extend(found);
        modules.extend(resolved);
        let mut done = Vec::new();
        for helper in running {
            let ((found, resolved), helper) = helper
                .join()
                .unwrap_or_else(|panic| std::panic::resume_unwind(panic))?;
            semantic.extend(found);
            modules.extend(resolved);
            done.push(helper);
        }
        let checked = Checked {
            found: [program, syntactic, semantic],
            modules,
        };
        Ok((checked, done))
    })
}

/// How many helpers to start, given that the session took `open` to open the project and
/// `sample` to check `sampled` files, with `left` files left: as many as each check for at least
/// as long as it takes them to open the project. They are ready when they have opened it, while
/// the session checks on, so with `h` of them each process checks `(left - open) / (h + 1)`.
fn worth_starting(open: Duration, sample: Duration, sampled: usize, left: usize) -> usize {
    if sampled == 0 || open.is_zero() {
        return 0;
    }
    let left = sample.as_nanos() * left as u128 / sampled as u128;
    // `(left - open) / (h + 1) >= open` where `h + 2 <= left / open`.
    usize::try_from((left / open.as_nanos()).saturating_sub(2)).unwrap_or(usize::MAX)
}

/// The share of files the session checks alone before deciding how many helpers to start.
const SAMPLE: usize = 32;

/// The files no process has taken yet. A process takes half of its part of what is left, as in
/// factoring scheduling: early shares are large, so few requests are made, and the last are
/// single files, so the processes finish together however long each file takes.
struct Shares<'a> {
    files: &'a [&'a Path],
    /// The processes that take shares.
    processes: AtomicUsize,
    taken: Mutex<usize>,
    resolve: Resolve<'a>,
}

impl<'a> Shares<'a> {
    const fn new(files: &'a [&'a Path], processes: usize, resolve: Resolve<'a>) -> Self {
        Self {
            files,
            processes: AtomicUsize::new(processes),
            taken: Mutex::new(0),
            resolve,
        }
    }

    fn take(&self) -> Option<std::ops::Range<usize>> {
        let processes = self.processes.load(Ordering::Relaxed).max(1);
        self.take_with(|left| left.div_ceil(2 * processes))
    }

    fn take_with(&self, size: impl FnOnce(usize) -> usize) -> Option<std::ops::Range<usize>> {
        let mut taken = self
            .taken
            .lock()
            .unwrap_or_else(std::sync::PoisonError::into_inner);
        let start = *taken;
        let left = self.files.len() - start;
        *taken += size(left).min(left);
        let end = *taken;
        drop(taken);
        (left != 0).then_some(start..end)
    }

    fn left(&self) -> usize {
        let taken = *self
            .taken
            .lock()
            .unwrap_or_else(std::sync::PoisonError::into_inner);
        self.files.len() - taken
    }

    /// Checks one share of a `SAMPLE`th of the files, into `found` and `modules`, and returns how
    /// many files it held.
    fn check_sample(
        &self,
        session: &mut Session,
        project: &Project,
        found: &mut Found,
        modules: &mut Modules,
    ) -> Result<usize, String> {
        let total = self.files.len();
        let Some(share) = self.take_with(|_| total.div_ceil(SAMPLE)) else {
            return Ok(0);
        };
        let sampled = share.len();
        self.check_share(session, project, share, found, modules)?;
        Ok(sampled)
    }

    /// The semantic findings of each share `session` takes, and the modules of its documents'
    /// imports when asked.
    fn check(&self, session: &mut Session, project: &Project) -> Result<(Found, Modules), String> {
        let mut found = Vec::new();
        let mut modules = Vec::new();
        while let Some(share) = self.take() {
            self.check_share(session, project, share, &mut found, &mut modules)?;
        }
        Ok((found, modules))
    }

    fn check_share(
        &self,
        session: &mut Session,
        project: &Project,
        share: std::ops::Range<usize>,
        found: &mut Found,
        modules: &mut Modules,
    ) -> Result<(), String> {
        let files = &self.files[share.clone()];
        found.extend(session.diagnostics(project, DiagnosticKind::Semantic, Some(files))?);
        if let Some((req, paths, javascript)) = self.resolve {
            for file in share {
                let typed = !javascript.contains(&paths[file]);
                let resolved = untyped::modules(req, session, project, paths, file, typed)?;
                if !resolved.is_empty() {
                    modules.push((file, resolved));
                }
            }
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests;
