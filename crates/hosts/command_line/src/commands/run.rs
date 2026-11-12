use std::path::Path;
use std::process::ExitCode;

use rsvelte_corpus::task_files::diagnostics_json;
use rsvelte_kernel::computation::pipeline::{DocumentResult, RunOptions, Sharing};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::{Severity, apply_fixes};

use crate::usage;

/// `ESLint`'s bound on fixing passes, which stops fixes that keep producing fixes.
const MAX_FIX_PASSES: usize = 10;

/// Runs `tasks` on `file` and prints their output. With `fix`, applies the findings' fixes pass by
/// pass, writes the file, and prints the output for the fixed text. Exit code 1 means an error
/// diagnostic or finding is left.
pub(crate) fn run_file(reg: &Registry, file: &Path, tasks: &[&str], fix: bool) -> ExitCode {
    let mut text = match std::fs::read_to_string(file) {
        Ok(t) => t,
        Err(e) => return usage(&format!("{}: {e}", file.display())),
    };
    let mut passes = 0;
    let result = loop {
        let result = match run_once(reg, file, &text, tasks) {
            Ok(result) => result,
            Err(code) => return code,
        };
        if !fix || passes == MAX_FIX_PASSES {
            break result;
        }
        let replacements = result
            .outputs
            .iter()
            .flat_map(|(_, out)| &out.findings)
            .map(|finding| finding.fix.as_slice());
        let fixed = apply_fixes(&text, replacements);
        if fixed == text {
            break result;
        }
        text = fixed;
        passes += 1;
    };
    if passes > 0
        && let Err(e) = std::fs::write(file, &text)
    {
        return usage(&format!("{}: {e}", file.display()));
    }
    if let Some(p) = &result.panic {
        eprintln!("panic: {p}");
        return ExitCode::FAILURE;
    }
    let mut failed = false;
    for (task, out) in &result.outputs {
        for f in &out.files {
            println!("// {task} {}\n{}", f.name, f.text);
        }
        if !out.diagnostics.is_empty() {
            println!("// {task} diagnostics\n{}", diagnostics_json(&text, out));
        }
        failed |= out
            .diagnostics
            .iter()
            .chain(out.findings.iter().map(|finding| &finding.diagnostic))
            .any(|diagnostic| diagnostic.severity == Severity::Error);
    }
    if failed {
        ExitCode::FAILURE
    } else {
        ExitCode::SUCCESS
    }
}

fn run_once(
    reg: &Registry,
    file: &Path,
    text: &str,
    tasks: &[&str],
) -> Result<DocumentResult, ExitCode> {
    let document = reg
        .document(file.to_string_lossy().into_owned(), text.to_owned())
        .map_err(|e| usage(&format!("{}: {e:?}", file.display())))?;
    let options = RunOptions {
        tasks,
        sharing: Sharing::Shared,
        threads: None,
    };
    rsvelte_kernel::computation::pipeline::run(reg, std::slice::from_ref(&document), &options)
        .map(|mut results| results.remove(0))
        .map_err(|e| usage(&e.to_string()))
}
