//! The `rsvelte-fmt` binary — a thin wrapper over the crate's [`run`] entry
//! point (see the crate docs for the pipeline itself).

// The CLI streams files (read → format → drop, one source live at a time), so
// the system allocator churns pages back to the OS between files; mimalloc
// retains them, closing a large per-file read+format overhead the batched
// in-process benchmark never sees. mimalloc is rsvelte's production allocator
// (the compiler CLI and NAPI addon use it for the same allocation-bound reason).
#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;

use std::process::ExitCode;

use rsvelte_fmt::run;

fn main() -> ExitCode {
    match run() {
        Ok(code) => code,
        Err(err) => {
            eprintln!("rsvelte-fmt: error: {err:#}");
            ExitCode::from(2)
        }
    }
}
