//! Command execution.

pub(crate) mod benchmark;
pub(crate) mod corpus;
pub(crate) mod files;
pub(crate) mod format;
pub(crate) mod lint;
pub(crate) mod performance;
pub(crate) mod run;
pub(crate) mod typecheck;
mod units;

use std::io::Write as _;
use std::path::Path;
use std::process::ExitCode;

use rsvelte_kernel::output::structured_data::StructuredDataWriter;

/// `tools`: the external programs the run's plugins run, each `{ command, version }`.
fn write_tools(tools: &[rsvelte_plugin_interface::Tool], w: &mut StructuredDataWriter) {
    w.key("tools").begin_array();
    for tool in tools {
        w.begin_object()
            .key("command")
            .write_string(&tool.command)
            .key("version")
            .write_string(&tool.version)
            .end_object();
    }
    w.end_array();
}

/// `panicked`: each document a task panicked on, `{ path, panic }`.
fn write_panicked<'a>(
    panicked: impl IntoIterator<Item = (&'a str, &'a str)>,
    w: &mut StructuredDataWriter,
) {
    w.key("panicked").begin_array();
    for (path, panic) in panicked {
        w.begin_object()
            .key("path")
            .write_string(path)
            .key("panic")
            .write_string(panic)
            .end_object();
    }
    w.end_array();
}

/// Writes `report` to `json`, or prints it when there is none. False when the file cannot be
/// written, which it reports as `command`'s error.
fn write_report(command: &str, json: Option<&Path>, report: &str) -> bool {
    let Some(path) = json else {
        print!("{report}");
        return true;
    };
    if let Err(e) = std::fs::write(path, report) {
        eprintln!("rsvelte-dev {command}: {}: {e}", path.display());
        return false;
    }
    true
}

/// Prints a report and how many errors it counts; exit code 1 when there is one.
pub(crate) fn print_report((text, errors): (String, usize)) -> ExitCode {
    // A closed pipe, as `| head` closes it, only cuts the report short.
    drop(std::io::stdout().lock().write_all(text.as_bytes()));
    if errors > 0 {
        ExitCode::FAILURE
    } else {
        ExitCode::SUCCESS
    }
}
