//! The crate's integration tests, in one binary. `fixtures` and `corpus` keep their own, because
//! each has its own harness.

use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::atomic::{AtomicUsize, Ordering};

mod arguments;
mod combined;
mod configuration;
mod documents;
mod eslint_plugin;
mod format;
mod format_options;
mod format_tailwind;
mod language_server;
mod lint;
mod lint_globals;
mod project_check;
mod release;
mod svelte_kit;
mod tool_plugins;
mod typecheck;
mod typecheck_ambient_modules;
mod typecheck_checker;
mod typecheck_config_dir;
mod typecheck_events;
mod typecheck_instantiation;
mod typecheck_javascript;
mod typecheck_linked_packages;
mod typecheck_slot_attribute;
mod typecheck_slot_props;
mod typecheck_slots;
mod typecheck_untyped;
mod typecheck_untyped_packages;
mod unit_names;

/// What oxlint reads to pick the format and the colour of its report. Apart from `CI` and
/// `FORCE_COLOR`, each can tell it that a coding agent runs it.
const REPORT_VARIABLES: [&str; 16] = [
    "CI",
    "FORCE_COLOR",
    "AI_AGENT",
    "CLAUDECODE",
    "CLAUDE_CODE",
    "REPL_ID",
    "GEMINI_CLI",
    "CODEX_SANDBOX",
    "CODEX_THREAD_ID",
    "COPILOT_CLI",
    "OPENCODE",
    "JUNIE_DATA",
    "JUNIE_SHIM_PATH",
    "EDITOR",
    "CURSOR_AGENT",
    "TERM_PROGRAM",
];

/// `rsvelte`, to be run in `directory`, whose lint report does not depend on where the tests run.
fn rsvelte(directory: impl AsRef<Path>) -> Command {
    let mut command = Command::new(env!("CARGO_BIN_EXE_rsvelte"));
    command.current_dir(directory);
    for variable in REPORT_VARIABLES {
        command.env_remove(variable);
    }
    command
}

/// `rsvelte-dev`, to be run in `directory`.
fn rsvelte_dev(directory: impl AsRef<Path>) -> Command {
    let mut command = Command::new(env!("CARGO_BIN_EXE_rsvelte-dev"));
    command.current_dir(directory);
    command
}

/// A directory of its own below the temporary directory, holding `files`, removed when dropped.
struct Scratch(PathBuf);

impl Scratch {
    fn new(files: &[(&str, &str)]) -> Self {
        static NEXT: AtomicUsize = AtomicUsize::new(0);
        let root = std::env::temp_dir().join(format!(
            "rsvelte-cli-{}-{}",
            std::process::id(),
            NEXT.fetch_add(1, Ordering::Relaxed)
        ));
        drop(std::fs::remove_dir_all(&root));
        std::fs::create_dir_all(&root).expect("test directory");
        for (file, text) in files {
            let path = root.join(file);
            std::fs::create_dir_all(path.parent().expect("a file has a directory"))
                .expect("test directory");
            std::fs::write(path, text).expect("test file");
        }
        // The temporary directory can be a symbolic link, and the commands print resolved paths.
        Self(rsvelte_kernel::source::paths::canonicalize(&root).expect("test directory"))
    }
}

impl std::ops::Deref for Scratch {
    type Target = Path;

    fn deref(&self) -> &Path {
        &self.0
    }
}

impl AsRef<Path> for Scratch {
    fn as_ref(&self) -> &Path {
        &self.0
    }
}

impl Drop for Scratch {
    fn drop(&mut self) {
        // A panic here, while a failed test unwinds, would abort every test of the binary.
        drop(std::fs::remove_dir_all(&self.0));
    }
}
