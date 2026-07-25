use std::process::ExitCode;

#[derive(Debug, Clone, Copy)]
pub(crate) enum Mode {
    Write,
    Check,
}

#[derive(Debug, Default)]
pub(crate) struct PipelineStatus {
    pub(crate) files_changed: usize,
    pub(crate) files_total: usize,
    pub(crate) had_errors: bool,
}

impl PipelineStatus {
    /// Fold another pipeline's counts into this one (e.g. the in-process Svelte
    /// and native-JS passes report as one "in-process" total in the summary).
    pub(crate) fn merge(mut self, other: PipelineStatus) -> PipelineStatus {
        self.files_changed += other.files_changed;
        self.files_total += other.files_total;
        self.had_errors |= other.had_errors;
        self
    }
}

pub(crate) fn combine(a: PipelineStatus, b: PipelineStatus, mode: Mode) -> ExitCode {
    if a.had_errors || b.had_errors {
        return ExitCode::from(2);
    }
    match mode {
        // Write mode applies the changes — exit 0 on success regardless
        // of how many files were touched.
        Mode::Write => ExitCode::SUCCESS,
        // Check mode reports "would change" — any change means failure.
        Mode::Check => {
            if a.files_changed + b.files_changed > 0 {
                ExitCode::from(1)
            } else {
                ExitCode::SUCCESS
            }
        }
    }
}

/// Outcome of formatting one native-JS file.
pub(crate) enum NativeOutcome {
    Changed,
    Unchanged,
    /// oxc couldn't parse the file — retry it through `oxfmt` so coverage never
    /// regresses on edge syntax the in-process parser rejects.
    Fallback,
    Error(String),
}
