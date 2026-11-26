use std::ffi::OsString;
use std::num::NonZeroUsize;
use std::path::{Path, PathBuf};

use rsvelte_kernel::computation::registry::{ProjectFiles, Registry};
use rsvelte_plugin_interface::{
    CallError, Extension, Settings, TaskKind, installed_bin, installed_package, installed_version,
    program_path,
};
use serde::Deserialize;

use crate::type_checker::version_before_7_1;
use crate::{Check, Documents, MappedLanguages, Tsc, TypeChecker};

pub static EXTENSION: Extension = Extension {
    identifier: "typescript.check",
    install,
};

/// The task that checks every document some plugin gives a TypeScript view, in one project.
pub const TASK: &str = "ts.check/default";

/// What a check task needs when no type checker is configured.
pub const NEEDS_TYPE_CHECKER: &str =
    "a type checker: `command` in the options of `typescript.check`";

/// A checker looked for when the options name none.
struct Installed {
    package: &'static str,
    bin: &'static str,
    /// Its package's version is TypeScript's, which has the API from 7.1 on.
    versioned: bool,
    /// The platform package that holds the native executable the script starts.
    native: Native,
}

/// Where a checker's script finds its native executable: in the package
/// `<prefix><process.platform>-<process.arch>`, which the checker's package resolves.
struct Native {
    prefix: &'static str,
    /// The executable's directory in the package.
    directory: &'static str,
    /// On Linux, the name ends with the C library, as `-gnu`.
    libc: bool,
    /// The variable whose value the script starts in place of the package's executable.
    variable: Option<&'static str>,
}

/// The checkers looked for when the options name none, in order.
const INSTALLED: [Installed; 3] = [
    Installed {
        package: "tsrs",
        bin: "tsrs",
        versioned: false,
        native: Native {
            prefix: "@tsrs/",
            directory: "",
            libc: true,
            variable: Some("TSRS_BINARY"),
        },
    },
    Installed {
        package: "@typescript/native-preview",
        bin: "tsgo",
        versioned: true,
        native: Native {
            prefix: "@typescript/native-preview-",
            directory: "lib",
            libc: false,
            variable: None,
        },
    },
    Installed {
        package: "typescript",
        bin: "tsc",
        versioned: true,
        native: Native {
            prefix: "@typescript/typescript-",
            directory: "lib",
            libc: false,
            variable: None,
        },
    },
];

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
struct Options {
    /// The program, then the arguments that start it, such as `["node", "tsc.js"]`. rsvelte
    /// adds `--api`, so they are not compiler options. By default, the first of [`INSTALLED`]
    /// the project installs.
    command: Option<Vec<String>>,
    /// The project's tsconfig.json; by default `tsconfig.json` next to the options, if any.
    tsconfig: Option<PathBuf>,
    /// How many checker processes share the documents; see [`Tsc::processes`].
    processes: Option<NonZeroUsize>,
}

fn install(registry: &mut Registry, settings: &mut Settings) -> Result<(), CallError> {
    crate::register(registry);
    let runs = settings.runs(TASK, TaskKind::Finish);
    let tsc = type_checker(settings, runs)?;
    if runs && tsc.is_none() {
        return Err(settings.missing(TASK, NEEDS_TYPE_CHECKER));
    }
    if let Some(tsc) = tsc.clone() {
        registry.contribute::<ProjectFiles>((
            TASK,
            Box::new(move |registry: &Registry| {
                tsc.project_files(registry.contributions::<MappedLanguages>())
            }),
        ));
    }
    registry.finish_task(Check {
        identifier: TASK,
        documents: Documents::WithTypeScriptView,
        tsc,
        stand_in: None,
        imported: None,
    });
    Ok(())
}

/// The type checker the options of `typescript.check` name, for every check task. `runs`: a task
/// that runs it will run, so the run records it and refuses one that cannot run.
///
/// # Errors
///
/// The options do not decode, name no program, or (when `runs`) name a checker that cannot run.
pub fn type_checker(settings: &mut Settings, runs: bool) -> Result<Option<Tsc>, CallError> {
    let Some(options) = settings.options::<Options>(EXTENSION.identifier)? else {
        return Ok(None);
    };
    let error = |e: String| CallError(format!("options of `typescript.check`: {e}"));
    let base = &options.base;
    let (program, arguments) = match &options.value.command {
        Some(command) => {
            let Some((program, arguments)) = command.split_first() else {
                return Err(error("`command` needs a program".to_owned()));
            };
            let program =
                program_path(program, base).map_err(|e| error(format!("{program}: {e}")))?;
            (program, arguments.to_vec())
        }
        None => installed(base, &|name| std::env::var_os(name))?
            .map_err(|older| CallError(no_checker_installed(base, &older)))?,
    };
    let tsconfig = options.value.tsconfig.map_or_else(
        || Some(base.join("tsconfig.json")).filter(|default| default.is_file()),
        |path| Some(base.join(path)),
    );
    let tsconfig = tsconfig
        .map(std::path::absolute)
        .transpose()
        .map_err(|e| error(e.to_string()))?;
    let checker = TypeChecker { program, arguments };
    if runs {
        settings.tool(checker.to_string(), || {
            checker.identify().map_err(CallError)
        })?;
    }
    Ok(Some(Tsc::new(checker, tsconfig, options.value.processes)))
}

/// The error when no installed checker has the API: what it found, and the command that installs
/// one with the package manager the project uses, so it can be pasted.
fn no_checker_installed(base: &Path, older: &[String]) -> String {
    let found = if older.is_empty() {
        String::new()
    } else {
        format!(" (found {}, which are older)", older.join(", "))
    };
    format!(
        "no type checker with the API of TypeScript 7.1 or later is installed{found}. \
         Install tsrs in the project:\n\n    {}\n\nor name a type checker with `command` in \
         the options of `typescript.check`",
        install_command(base)
    )
}

/// `<manager> add -D tsrs` for the package manager whose lockfile is nearest to `base`.
fn install_command(base: &Path) -> &'static str {
    const LOCKFILES: [(&str, &str); 5] = [
        ("pnpm-lock.yaml", "pnpm add -D tsrs"),
        ("yarn.lock", "yarn add -D tsrs"),
        ("bun.lock", "bun add -d tsrs"),
        ("bun.lockb", "bun add -d tsrs"),
        ("package-lock.json", "npm install -D tsrs"),
    ];
    let base = std::path::absolute(base).unwrap_or_else(|_| base.to_owned());
    base.ancestors()
        .find_map(|directory| {
            LOCKFILES
                .iter()
                .find(|(lockfile, _)| directory.join(lockfile).is_file())
        })
        .map_or("npm install -D tsrs", |(_, command)| command)
}

/// A program and the arguments that start it.
type Command = (PathBuf, Vec<String>);

/// The first of [`INSTALLED`] that `base` resolves and that has the API: its native executable,
/// else `node` and its script; otherwise the TypeScript packages it resolves that are older than
/// 7.1, as `<name> <version>`. `variable` reads the environment.
fn installed(
    base: &Path,
    variable: &dyn Fn(&str) -> Option<OsString>,
) -> Result<Result<Command, Vec<String>>, CallError> {
    let mut older = Vec::new();
    for checker in &INSTALLED {
        let package = checker.package;
        let failed =
            |e: std::io::Error| CallError(format!("options of `typescript.check`: {package}: {e}"));
        let Some(script) = installed_bin(package, checker.bin, base).map_err(failed)? else {
            continue;
        };
        if checker.versioned
            && let Some(version) = installed_version(package, base).map_err(failed)?
            && version_before_7_1(&version)
        {
            older.push(format!("{package} {version}"));
            continue;
        }
        if let Some(executable) = native_executable(checker, base, variable).map_err(failed)? {
            return Ok(Ok((executable, Vec::new())));
        }
        return Ok(Ok((
            "node".into(),
            vec![script.to_string_lossy().into_owned()],
        )));
    }
    Ok(Err(older))
}

/// The native executable that `checker`'s script starts, found as the script finds it. Running
/// it directly saves a Node start each time the checker runs.
fn native_executable(
    checker: &Installed,
    base: &Path,
    variable: &dyn Fn(&str) -> Option<OsString>,
) -> std::io::Result<Option<PathBuf>> {
    let native = &checker.native;
    // The script ignores an empty value, and reports a missing program itself.
    if let Some(chosen) = native.variable.and_then(variable).filter(|v| !v.is_empty()) {
        // The checker starts in another directory, where a relative path names another file.
        let chosen = std::path::absolute(PathBuf::from(chosen))?;
        return Ok(chosen.is_file().then_some(chosen));
    }
    let Some(name) = native_package(native) else {
        return Ok(None);
    };
    let Some(package) = installed_package(checker.package, base)? else {
        return Ok(None);
    };
    let Some(platform_package) = installed_package(&name, &package)? else {
        return Ok(None);
    };
    let executable = (platform_package.join(native.directory).join(checker.bin))
        .with_extension(std::env::consts::EXE_EXTENSION);
    Ok(executable.is_file().then_some(executable))
}

/// The name of `native`'s package for this platform. On Linux, the C library is the one rsvelte
/// runs with.
fn native_package(native: &Native) -> Option<String> {
    let platform = match std::env::consts::OS {
        "macos" => "darwin",
        "linux" => "linux",
        "windows" => "win32",
        _ => return None,
    };
    let arch = match std::env::consts::ARCH {
        "aarch64" => "arm64",
        "x86_64" => "x64",
        "arm" => "arm",
        _ => return None,
    };
    let libc = match platform {
        "linux" if native.libc && cfg!(target_env = "musl") => "-musl",
        "linux" if native.libc => "-gnu",
        _ => "",
    };
    Some(format!("{}{platform}-{arch}{libc}", native.prefix))
}

#[cfg(test)]
mod tests;
