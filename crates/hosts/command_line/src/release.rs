//! `rsvelte`, the command people install: `lint`, `format` and `typecheck` over the Svelte and
//! TypeScript files of a project.

use std::process::ExitCode;

use rsvelte_plugin_interface::{Extension, Selection};

use crate::commands::typecheck;
use crate::{Installation, configuration, configured_registry, usage};

mod combined;
mod format;
mod help;
mod host_lint;
mod node_configuration;
mod version;

/// The plugins `rsvelte` installs for `typecheck`, in installation order.
static EXTENSIONS: &[&Extension] = &[
    &rsvelte_typescript_check::EXTENSION,
    &rsvelte_svelte_typescript_projection::EXTENSION,
    &rsvelte_svelte_check::EXTENSION,
];

/// The tasks of `typecheck`.
const TYPECHECK: &[&str] = &["ts.check/default"];

/// The plugins `typecheck` runs with their defaults when nothing configures them, so that a
/// project needs no configuration.
const TYPECHECK_DEFAULTS: &[&str] = &["typescript.check", "svelte.check"];

/// Each command but `format` and `lint`, which take oxfmt's and oxlint's arguments: its name, its
/// tasks and its guide.
const COMMANDS: &[(&str, &[&str], &str)] = &[
    ("typecheck", TYPECHECK, help::TYPECHECK),
    ("version", &[], help::VERSION),
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
    // `format` or `lint` alone takes oxfmt's or oxlint's arguments; followed by a command,
    // rsvelte's.
    if let Some((command @ ("format" | "lint"), rest)) =
        arguments.split_first().map(|(c, r)| (c.as_str(), r))
        && !rest
            .first()
            .is_some_and(|next| combined::COMBINABLE.contains(&next.as_str()))
    {
        if command == "lint" {
            return host_lint::lint(rest);
        }
        return format::format(rest);
    }
    let mut config = configuration::Options::default();
    let mut positional = Vec::new();
    let (mut help, mut version, mut check) = (false, false, false);
    let mut mistake = None;
    let mut it = arguments.iter();
    while let Some(argument) = it.next() {
        match argument.as_str() {
            "-h" | "--help" => help = true,
            "-V" | "--version" => version = true,
            "--check" => check = true,
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
        return print_help(&positional, help);
    }
    if let Some(mistake) = mistake {
        return usage(&mistake);
    }
    if version {
        println!("rsvelte {}", env!("CARGO_PKG_VERSION"));
        return ExitCode::SUCCESS;
    }
    let commands = (positional.iter())
        .take_while(|word| combined::COMBINABLE.contains(word))
        .count();
    if check && !positional[..commands].contains(&"format") {
        return usage("--check applies to `format`");
    }
    if commands >= 2 {
        let (commands, paths) = positional.split_at(commands);
        return combined::run(&config, commands, paths, check);
    }
    let Some((&name, paths)) = positional.split_first() else {
        eprint!("{}", help::OVERVIEW);
        return ExitCode::from(2);
    };
    if name == "format" || name == "lint" {
        return usage(&format!(
            "put `{name}` first: its options are {}'s",
            if name == "format" { "oxfmt" } else { "oxlint" }
        ));
    }
    if let Err(code) = command(name) {
        return code;
    }
    if name == "typecheck" && !paths.is_empty() {
        return usage("typecheck takes no paths: it checks the files its tsconfig.json selects");
    }
    if name == "version" {
        if let Some(extra) = paths.first() {
            return usage(&format!("version takes no arguments, not `{extra}`"));
        }
        return version::version(&config);
    }
    typecheck_alone(&config)
}

/// `typecheck`.
fn typecheck_alone(config: &configuration::Options) -> ExitCode {
    match configured_registry(config, &[], installation(TYPECHECK)) {
        Ok((reg, _)) => typecheck::typecheck(&reg, TYPECHECK),
        Err(error) => usage(&error),
    }
}

/// What `typecheck` installs to run `tasks`: the typecheck plugins with their defaults.
fn installation(tasks: &[&str]) -> Installation {
    let defaults = (TYPECHECK_DEFAULTS.iter())
        .map(|&plugin| (plugin, "{}".to_owned()))
        .collect();
    Installation {
        extensions: EXTENSIONS,
        selection: Selection::Named(tasks.iter().map(|&task| task.to_owned()).collect()),
        defaults,
    }
}

/// `rsvelte help [<command>]`, or `--help` with the positional arguments: the guide to the command
/// they name, else the overview. `format`'s is oxfmt's help. `flag`: `-h` or `--help` was given.
fn print_help(positional: &[&str], flag: bool) -> ExitCode {
    let guide = match positional {
        ["help"] if flag => help::HELP,
        [] | ["help"] => help::OVERVIEW,
        ["help", "help"] => help::HELP,
        ["help", _, extra, ..] => {
            return usage(&format!("help takes one command, not also `{extra}`"));
        }
        ["help", "format"] | ["format", ..] => return format::format(&["--help".to_owned()]),
        ["help", "lint"] | ["lint", ..] => return host_lint::lint(&["--help".to_owned()]),
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
