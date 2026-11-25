//! The `rsvelte` command inside Node.js, which then exits with the status this returns.

use std::io::Write;
use std::path::PathBuf;
use std::process::ExitCode;

/// Runs `rsvelte` with `arguments`; the content mapper is in `programs`.
#[must_use]
pub fn run(arguments: &[String], programs: PathBuf) -> u32 {
    let code = rsvelte_command_line::release_with(arguments, programs);
    // Node.js exits without flushing what Rust buffered; like the executable, it ignores a closed
    // pipe here.
    drop(std::io::stdout().flush());
    status(code)
}

/// `ExitCode` keeps its number private, and every one the command returns comes from a `u8`.
fn status(code: ExitCode) -> u32 {
    (0..=u8::MAX)
        .find(|&status| ExitCode::from(status) == code)
        .map_or(1, u32::from)
}
