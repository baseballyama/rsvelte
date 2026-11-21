//! `rsvelte`, the command people install: `lint`, `format` and `typecheck` over the Svelte and
//! TypeScript files of a project.

use std::process::ExitCode;

use rsvelte_plugin_interface::{Extension, Selection};

use crate::commands::{lint, typecheck};
use crate::{Installation, configuration, configured_registry, usage};

mod format;
mod help;

/// The plugins `rsvelte` installs for `lint` and `typecheck`, in installation order.
static EXTENSIONS: &[&Extension] = &[
    &rsvelte_typescript_lint::EXTENSION,
    &rsvelte_typescript_check::EXTENSION,
    &rsvelte_svelte_lint::EXTENSION,
    &rsvelte_svelte_typescript_projection::EXTENSION,
    &rsvelte_svelte_check::EXTENSION,
];

const LINT: &[&str] = &["svelte.lint/default", "ts.lint/default"];
const TYPECHECK: &[&str] = &["ts.check/default"];

/// The plugins `typecheck` runs with their defaults when nothing configures them, so that a
/// project needs no configuration.
const TYPECHECK_DEFAULTS: &[&str] = &["typescript.check", "svelte.check"];

/// Each command but `format`, which takes oxfmt's arguments: its name, its tasks and its guide.
const COMMANDS: &[(&str, &[&str], &str)] = &[
    ("lint", LINT, help::LINT),
    ("typecheck", TYPECHECK, help::TYPECHECK),
];

/// The tasks and the guide of the command `name`, or the error of a name that is none.
fn command(name: &str) -> Result<(&'static [&'static str], &'static str), ExitCode> {
    (COMMANDS.iter())
        .find(|&&(command, ..)| command == name)
        .map(|&(_, tasks, guide)| (tasks, guide))
        .ok_or_else(|| usage(&format!("unknown command `{name}`; see `rsvelte --help`")))
}

/// `rsvelte`.
#[must_use]
pub fn release() -> ExitCode {
    let arguments: Vec<String> = std::env::args().skip(1).collect();
    if let Some(("format", rest)) = arguments.split_first().map(|(c, r)| (c.as_str(), r)) {
        return format::format(rest);
    }
    let mut config = configuration::Options::default();
    let mut positional = Vec::new();
    let (mut help, mut version) = (false, false);
    let mut mistake = None;
    let mut it = arguments.iter();
    while let Some(argument) = it.next() {
        match argument.as_str() {
            "-h" | "--help" => help = true,
            "-V" | "--version" => version = true,
            name if configuration::Options::accepts(name) => match it.next() {
                Some(value) => config.argument(name, value),
                None => _ = mistake.get_or_insert_with(|| format!("{name} needs a value")),
            },
            name if name.starts_with('-') => {
                mistake
                    .get_or_insert_with(|| format!("unknown option {name}; see `rsvelte --help`"));
            }
            path => positional.push(path),
        }
    }
    // Asked for help, the user gets it even past a mistake in the other arguments.
    if help || positional.first() == Some(&"help") {
        return print_help(&positional);
    }
    if let Some(mistake) = mistake {
        return usage(&mistake);
    }
    if version {
        println!("rsvelte {}", env!("CARGO_PKG_VERSION"));
        return ExitCode::SUCCESS;
    }
    let Some((&name, paths)) = positional.split_first() else {
        eprint!("{}", help::OVERVIEW);
        return ExitCode::from(2);
    };
    if name == "format" {
        return usage("put `format` first: its options are oxfmt's");
    }
    let tasks = match command(name) {
        Ok((tasks, _)) => tasks,
        Err(code) => return code,
    };
    if name == "typecheck" && !paths.is_empty() {
        return usage("typecheck takes no paths: it checks the files its tsconfig.json selects");
    }
    let paths = if paths.is_empty() { &["."][..] } else { paths };
    let defaults = if name == "typecheck" {
        (TYPECHECK_DEFAULTS.iter())
            .map(|&plugin| (plugin, "{}".to_owned()))
            .collect()
    } else {
        Vec::new()
    };
    let installation = Installation {
        extensions: EXTENSIONS,
        selection: Selection::Named(tasks.iter().map(|&task| task.to_owned()).collect()),
        defaults,
    };
    let (reg, _) = match configured_registry(&config, &[], installation) {
        Ok(configured) => configured,
        Err(error) => return usage(&error),
    };
    if name == "lint" {
        lint::lint(&reg, paths, tasks)
    } else {
        typecheck::typecheck(&reg, tasks)
    }
}

/// `rsvelte help [<command>]`, or `--help` with the positional arguments: the guide to the command
/// they name, else the overview. `format`'s is oxfmt's help.
fn print_help(positional: &[&str]) -> ExitCode {
    let guide = match positional {
        [] | ["help"] => help::OVERVIEW,
        ["help", "help"] => help::HELP,
        ["help", _, extra, ..] => {
            return usage(&format!("help takes one command, not also `{extra}`"));
        }
        ["help", "format"] | ["format", ..] => return format::format(&["--help".to_owned()]),
        ["help", name] | [name, ..] => match command(name) {
            Ok((_, guide)) => guide,
            Err(code) => return code,
        },
    };
    print!("{guide}");
    ExitCode::SUCCESS
}

#[cfg(test)]
mod tests;
