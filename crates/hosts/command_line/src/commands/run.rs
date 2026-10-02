use std::path::Path;
use std::process::ExitCode;

use rsvelte_kernel::computation::pipeline::{Registry, RunOptions, Sharing};

use crate::output::diagnostics_json;
use crate::usage;

pub(crate) fn run_file(reg: &Registry, file: &Path, tasks: &[&str]) -> ExitCode {
    let text = match std::fs::read_to_string(file) {
        Ok(t) => t,
        Err(e) => return usage(&format!("{}: {e}", file.display())),
    };
    let document = match reg.document(file.to_string_lossy().into_owned(), text) {
        Ok(d) => d,
        Err(e) => return usage(&format!("{}: {e:?}", file.display())),
    };
    let options = RunOptions {
        tasks,
        sharing: Sharing::Shared,
        threads: None,
    };
    let result = match rsvelte_kernel::computation::pipeline::run(
        reg,
        std::slice::from_ref(&document),
        &options,
    ) {
        Ok(mut r) => r.remove(0),
        Err(e) => return usage(&e.to_string()),
    };
    if let Some(p) = &result.panic {
        eprintln!("panic: {p}");
        return ExitCode::FAILURE;
    }
    for (task, out) in &result.outputs {
        for f in &out.files {
            println!("// {task} {}\n{}", f.name, f.text);
        }
        if !out.diagnostics.is_empty() {
            println!(
                "// {task} diagnostics\n{}",
                diagnostics_json(&document, out)
            );
        }
    }
    ExitCode::SUCCESS
}
