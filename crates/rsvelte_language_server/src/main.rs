//! The `rsvelte-language-server` binary — serves the LSP over stdio.

use std::process::ExitCode;

fn main() -> ExitCode {
    match rsvelte_language_server::run_stdio() {
        Ok(code) => code,
        Err(err) => {
            rsvelte_language_server::log::warn(format_args!("{err:#}"));
            ExitCode::FAILURE
        }
    }
}
