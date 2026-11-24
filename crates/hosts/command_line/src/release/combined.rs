//! `rsvelte <command> <command>... [<path>...] [--check]`: several commands in one run. `format`
//! runs first, so the others read what it wrote.

use std::process::ExitCode;

use super::{format, host_lint, typecheck_alone};
use crate::{configuration, usage};

/// The commands a run can combine.
pub(super) const COMBINABLE: &[&str] = &["lint", "format", "typecheck"];

/// Runs `commands` over `paths`; `check` is `format`'s `--check`. The exit code is the worst of
/// the commands'.
pub(super) fn run(
    config: &configuration::Options,
    commands: &[&str],
    paths: &[&str],
    check: bool,
) -> ExitCode {
    if let Some(twice) = (commands.iter().enumerate())
        .find_map(|(i, command)| commands[..i].contains(command).then_some(command))
    {
        return usage(&format!("`{twice}` is named twice"));
    }
    let runs = |command: &str| commands.contains(&command);
    let mut codes = Vec::new();
    if runs("format") {
        let arguments: Vec<String> = (paths.iter().map(|&path| path.to_owned()))
            .chain(check.then(|| "--check".to_owned()))
            .collect();
        codes.push(format::format(&arguments));
    }
    if runs("lint") {
        let arguments: Vec<String> = paths.iter().map(|&path| path.to_owned()).collect();
        codes.push(host_lint::lint(&arguments));
    }
    if runs("typecheck") {
        codes.push(typecheck_alone(config));
    }
    worst(&codes)
}

/// The exit code of a run whose commands exited with `codes`: 2 when one could not run, else 1
/// when one found a problem.
fn worst(codes: &[ExitCode]) -> ExitCode {
    let failed = ExitCode::from(2);
    if codes.contains(&failed) {
        failed
    } else if codes.contains(&ExitCode::FAILURE) {
        ExitCode::FAILURE
    } else {
        ExitCode::SUCCESS
    }
}
