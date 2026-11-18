#[cfg(test)]
mod tests;

/// Which tasks a run will run, as the host's user chose them.
#[derive(Clone, Debug)]
pub enum Selection {
    /// The tasks the user named.
    Named(Vec<String>),
    /// None was named, so every task runs.
    Every,
    /// None was named, so every per-document task runs, and no project pass.
    DocumentTasks,
}

/// When a task runs.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TaskKind {
    /// On each document.
    Document,
    /// Once, in the project pass after every document.
    Finish,
}

impl Selection {
    /// Whether the run will run task `identifier`.
    #[must_use]
    pub(crate) fn runs(&self, identifier: &str, kind: TaskKind) -> bool {
        match self {
            Self::Named(names) => names.iter().any(|name| name == identifier),
            Self::Every => true,
            Self::DocumentTasks => kind == TaskKind::Document,
        }
    }

    /// Why a task runs, when the user did not name it, so the user knows how to leave it out.
    pub(crate) const fn unnamed_reason(&self) -> &'static str {
        match self {
            Self::Named(_) => "",
            Self::Every | Self::DocumentTasks => {
                "; it runs because no task was named, and naming the tasks to run leaves it out"
            }
        }
    }
}
