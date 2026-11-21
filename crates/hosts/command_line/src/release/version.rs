//! `rsvelte version`: what a bug report needs to name the rsvelte that ran.

use std::fmt::Write as _;
use std::process::ExitCode;

use super::{TYPECHECK, installation};
use crate::{configuration, install, usage};

/// What of each command the corpus compares with official tools, and those tools' names and
/// versions.
const ORACLES: &[(&str, &[(&str, &str)])] = include!(concat!(env!("OUT_DIR"), "/oracles.rs"));

/// Prints the versions; the type checker is the one `typecheck` would run with `config`.
pub(super) fn version(config: &configuration::Options) -> ExitCode {
    let loaded = match config.load() {
        Ok(loaded) => loaded,
        Err(error) => return usage(&error.to_string()),
    };
    let checker = match install(loaded.as_ref(), &[], installation(TYPECHECK)) {
        Ok((_, tools)) => (tools.iter())
            .map(|tool| format!("{} {}", tool.command, tool.version))
            .collect::<Vec<_>>()
            .join("\n"),
        Err(error) => format!("none: {error}"),
    };
    print!("{}", report(&checker));
    ExitCode::SUCCESS
}

fn report(checker: &str) -> String {
    let mut out = format!(
        "rsvelte {} ({})\n\nMatches the output of:\n",
        env!("CARGO_PKG_VERSION"),
        env!("RSV_BUILD_REV")
    );
    for (covers, oracles) in ORACLES {
        writeln!(out, "  {covers}:").expect("writing to a String");
        for (name, version) in *oracles {
            writeln!(out, "    {name} {version}").expect("writing to a String");
        }
    }
    writeln!(
        out,
        "\nBuilt on:\n  oxfmt {}\n  oxc {}",
        env!("RSV_OXFMT"),
        env!("RSV_OXC")
    )
    .expect("writing to a String");
    out.push_str("\nType checker that typecheck runs here:\n");
    for line in checker.lines() {
        writeln!(out, "  {line}").expect("writing to a String");
    }
    out
}
