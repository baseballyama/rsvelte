use std::ffi::OsString;
use std::path::{Path, PathBuf};
use std::sync::Arc;

use rsvelte_plugin_interface::{NoFunctions, Selection, Settings};

use super::*;

/// The type checker `options` name, with relative paths relative to `base`.
fn checker(base: &Path, options: &str) -> Result<Option<Tsc>, CallError> {
    let mut settings = Settings::new(Selection::DocumentTasks, Arc::new(NoFunctions));
    let options = serde_json::from_str(options).map_err(|e| CallError(e.to_string()))?;
    settings.set("typescript.check".to_owned(), options, base.to_owned());
    type_checker(&mut settings, false)
}

struct Scratch(PathBuf);

impl Scratch {
    fn new(name: &str) -> Self {
        let path =
            std::env::temp_dir().join(format!("rsvelte-check-{name}-{}", std::process::id()));
        drop(std::fs::remove_dir_all(&path));
        std::fs::create_dir_all(&path).expect("test directory");
        Self(std::path::absolute(path).expect("absolute"))
    }
}

impl Drop for Scratch {
    fn drop(&mut self) {
        std::fs::remove_dir_all(&self.0).expect("remove test directory");
    }
}

#[test]
fn a_relative_program_and_tsconfig_are_relative_to_the_options() {
    let scratch = Scratch::new("relative");
    let got = checker(
        &scratch.0,
        concat!(
            r#"{ "command": ["node_modules/.bin/tsrs", "launcher.js"], "#,
            r#""tsconfig": "app/tsconfig.json" }"#,
        ),
    )
    .unwrap()
    .unwrap();
    assert_eq!(
        got.checker.program,
        scratch.0.join("node_modules/.bin/tsrs")
    );
    assert_eq!(got.checker.arguments, ["launcher.js"]);
    assert_eq!(got.tsconfig, Some(scratch.0.join("app/tsconfig.json")));
}

#[test]
fn a_bare_program_is_the_projects_own_copy_first() {
    let scratch = Scratch::new("bare");
    let got = checker(&scratch.0, r#"{ "command": ["tsrs"] }"#)
        .unwrap()
        .unwrap();
    assert_eq!(
        got.checker.program,
        Path::new("tsrs"),
        "not installed: looked up in PATH"
    );
    let bin = scratch.0.join("node_modules/.bin");
    std::fs::create_dir_all(&bin).unwrap();
    std::fs::write(bin.join("tsrs"), "").unwrap();
    let got = checker(&scratch.0, r#"{ "command": ["tsrs"] }"#)
        .unwrap()
        .unwrap();
    assert_eq!(got.checker.program, bin.join("tsrs"));
}

#[test]
fn the_tsconfig_next_to_the_options_is_the_default() {
    let scratch = Scratch::new("tsconfig");
    let got = checker(&scratch.0, r#"{ "command": ["tsc"] }"#)
        .unwrap()
        .unwrap();
    assert_eq!(got.tsconfig, None, "none there");
    std::fs::write(scratch.0.join("tsconfig.json"), "{}").unwrap();
    let got = checker(&scratch.0, r#"{ "command": ["tsc"] }"#)
        .unwrap()
        .unwrap();
    assert_eq!(got.tsconfig, Some(scratch.0.join("tsconfig.json")));
}

#[test]
fn a_command_needs_a_program_and_options_are_checked() {
    let scratch = Scratch::new("invalid");
    let empty = checker(&scratch.0, r#"{ "command": [] }"#).unwrap_err();
    assert!(empty.0.contains("needs a program"), "{}", empty.0);
    let unknown = checker(&scratch.0, r#"{ "command": ["tsc"], "tsconfg": "x" }"#).unwrap_err();
    assert!(unknown.0.contains("tsconfg"), "{}", unknown.0);
    let mut settings = Settings::new(Selection::DocumentTasks, Arc::new(NoFunctions));
    assert!(
        type_checker(&mut settings, false).unwrap().is_none(),
        "no options"
    );
}

/// No environment variable is set.
fn unset(_: &str) -> Option<OsString> {
    None
}

/// The checker found below `base` without a `command`, in an environment without variables.
fn found(base: &Path) -> Command {
    installed(base, &unset).unwrap().unwrap()
}

fn write(path: &Path, text: &str) {
    std::fs::create_dir_all(path.parent().unwrap()).unwrap();
    std::fs::write(path, text).unwrap();
}

#[test]
fn without_a_command_the_first_installed_checker_runs_through_node_without_its_native_package() {
    let scratch = Scratch::new("installed");
    let none = checker(&scratch.0, "{}").unwrap_err();
    assert!(none.0.contains("is installed. Install tsrs"), "{}", none.0);
    let install = |package: &str, manifest: &str| {
        let directory = scratch.0.join("node_modules").join(package);
        write(&directory.join("package.json"), manifest);
        std::fs::canonicalize(directory).unwrap()
    };
    let typescript = install(
        "typescript",
        r#"{"name":"typescript","bin":{"tsc":"bin/tsc"}}"#,
    );
    let (program, arguments) = found(&scratch.0);
    assert_eq!(program, Path::new("node"));
    assert_eq!(arguments, [typescript.join("bin/tsc").to_string_lossy()]);
    let tsrs = install("tsrs", r#"{"name":"tsrs","bin":{"tsrs":"./bin/tsrs"}}"#);
    assert_eq!(
        found(&scratch.0).1,
        [tsrs.join("./bin/tsrs").to_string_lossy()],
        "tsrs before TypeScript"
    );
}

/// pnpm's layout: the platform package is beside the package in the store, not in the project.
#[cfg(unix)]
#[test]
fn without_a_command_an_installed_typescript_starts_its_native_executable() {
    let scratch = Scratch::new("native");
    let store = scratch
        .0
        .join("node_modules/.pnpm/typescript@7.1.0/node_modules");
    write(
        &store.join("typescript/package.json"),
        r#"{"name":"typescript","version":"7.1.0","bin":{"tsc":"./bin/tsc"}}"#,
    );
    std::os::unix::fs::symlink(
        store.join("typescript"),
        scratch.0.join("node_modules/typescript"),
    )
    .unwrap();
    assert_eq!(
        found(&scratch.0).0,
        Path::new("node"),
        "no platform package"
    );
    let native = store.join(native_package(&INSTALLED[2].native).unwrap());
    write(&native.join("package.json"), "{}");
    assert_eq!(found(&scratch.0).0, Path::new("node"), "no executable");
    let executable = native.join("lib/tsc");
    write(&executable, "");
    assert_eq!(
        found(&scratch.0),
        (std::fs::canonicalize(executable).unwrap(), Vec::new())
    );
}

/// npm's layout: the platform package is hoisted next to the package in the project.
#[test]
fn without_a_command_an_installed_native_preview_starts_its_native_executable() {
    let scratch = Scratch::new("native-preview");
    let modules = scratch.0.join("node_modules");
    write(
        &modules.join("@typescript/native-preview/package.json"),
        concat!(
            r#"{"name":"@typescript/native-preview","version":"7.1.0-dev.20261102.1","#,
            r#""bin":{"tsgo":"./bin/tsgo"}}"#,
        ),
    );
    let native = modules.join(native_package(&INSTALLED[1].native).unwrap());
    write(&native.join("package.json"), "{}");
    let executable = native
        .join("lib/tsgo")
        .with_extension(std::env::consts::EXE_EXTENSION);
    write(&executable, "");
    assert_eq!(
        found(&scratch.0).0,
        std::fs::canonicalize(executable).unwrap()
    );
}

#[cfg(unix)]
#[test]
fn without_a_command_an_installed_tsrs_starts_its_native_executable_or_the_one_tsrs_binary_names() {
    let scratch = Scratch::new("native-tsrs");
    let store = scratch.0.join("node_modules/.pnpm/tsrs@7.1.0/node_modules");
    write(
        &store.join("tsrs/package.json"),
        r#"{"name":"tsrs","version":"7.1.0","bin":{"tsrs":"./bin/tsrs"}}"#,
    );
    std::os::unix::fs::symlink(store.join("tsrs"), scratch.0.join("node_modules/tsrs")).unwrap();
    let native = store.join(native_package(&INSTALLED[0].native).unwrap());
    write(&native.join("package.json"), "{}");
    let executable = native.join("tsrs");
    write(&executable, "");
    let executable = std::fs::canonicalize(executable).unwrap();
    assert_eq!(found(&scratch.0).0, executable);
    let chosen = scratch.0.join("built/tsrs");
    let with = |value: &Path| {
        let value = value.as_os_str().to_owned();
        let environment = move |name: &str| (name == "TSRS_BINARY").then(|| value.clone());
        installed(&scratch.0, &environment).unwrap().unwrap().0
    };
    assert_eq!(
        with(&chosen),
        Path::new("node"),
        "the script reports it missing"
    );
    write(&chosen, "");
    assert_eq!(with(&chosen), chosen);
    assert_eq!(with(Path::new("")), executable, "an empty value is unset");
    // Tests run in the crate's directory.
    let relative = Path::new("Cargo.toml");
    assert_eq!(
        with(relative),
        std::path::absolute(relative).unwrap(),
        "the checker starts in another directory"
    );
}

/// The names the packages publish.
#[test]
fn each_checker_names_the_platform_package_it_publishes() {
    let platform = match (std::env::consts::OS, std::env::consts::ARCH) {
        ("macos", "aarch64") => "darwin-arm64",
        ("macos", "x86_64") => "darwin-x64",
        ("linux", "aarch64") => "linux-arm64",
        ("linux", "x86_64") => "linux-x64",
        ("linux", "arm") => "linux-arm",
        ("windows", "aarch64") => "win32-arm64",
        ("windows", "x86_64") => "win32-x64",
        ("windows", "arm") => "win32-arm",
        other => panic!("no native packages for {other:?}"),
    };
    let libc = match std::env::consts::OS {
        "linux" if cfg!(target_env = "musl") => "-musl",
        "linux" => "-gnu",
        _ => "",
    };
    let names: Vec<_> = (INSTALLED.iter())
        .map(|checker| native_package(&checker.native).unwrap())
        .collect();
    assert_eq!(
        names,
        [
            format!("@tsrs/{platform}{libc}"),
            format!("@typescript/native-preview-{platform}"),
            format!("@typescript/typescript-{platform}"),
        ]
    );
}

#[test]
fn a_typescript_older_than_7_1_is_passed_over_and_named_with_the_install_command() {
    let scratch = Scratch::new("older");
    let install = |package: &str, manifest: &str| {
        let directory = scratch.0.join("node_modules").join(package);
        std::fs::create_dir_all(&directory).unwrap();
        std::fs::write(directory.join("package.json"), manifest).unwrap();
        std::fs::canonicalize(directory).unwrap()
    };
    install(
        "@typescript/native-preview",
        concat!(
            r#"{"name":"@typescript/native-preview","version":"7.0.0-dev.20260707.2","#,
            r#""bin":{"tsgo":"bin/tsgo"}}"#,
        ),
    );
    let typescript = install(
        "typescript",
        r#"{"name":"typescript","version":"7.1.0","bin":{"tsc":"bin/tsc"}}"#,
    );
    let got = checker(&scratch.0, "{}").unwrap().unwrap();
    assert_eq!(
        got.checker.arguments,
        [typescript.join("bin/tsc").to_string_lossy()],
        "the 7.0 preview is passed over"
    );

    install(
        "typescript",
        r#"{"name":"typescript","version":"5.9.3","bin":{"tsc":"bin/tsc"}}"#,
    );
    std::fs::write(scratch.0.join("pnpm-lock.yaml"), "").unwrap();
    let none = checker(&scratch.0, "{}").unwrap_err();
    assert_eq!(
        none.0,
        "no type checker with the API of TypeScript 7.1 or later is installed (found \
         @typescript/native-preview 7.0.0-dev.20260707.2, typescript 5.9.3, which are older). \
         Install tsrs in the project:\n\n    pnpm add -D tsrs\n\nor name a type checker with \
         `command` in the options of `typescript.check`"
    );
}

#[test]
fn the_install_command_follows_the_nearest_lockfile() {
    let scratch = Scratch::new("lockfile");
    let app = scratch.0.join("apps/web");
    std::fs::create_dir_all(&app).unwrap();
    assert_eq!(install_command(&app), "npm install -D tsrs", "no lockfile");
    std::fs::write(scratch.0.join("pnpm-lock.yaml"), "").unwrap();
    assert_eq!(
        install_command(&app),
        "pnpm add -D tsrs",
        "a workspace's root"
    );
    std::fs::write(app.join("yarn.lock"), "").unwrap();
    assert_eq!(install_command(&app), "yarn add -D tsrs", "the nearest");
}
