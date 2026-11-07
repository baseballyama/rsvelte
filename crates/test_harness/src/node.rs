use std::path::{Path, PathBuf};

const INSTALL_HINT: &str = "run `pnpm install --frozen-lockfile` at the repository root";
/// A command, split at spaces, that the check tests run instead of TypeScript 7's `tsc`.
const TYPE_CHECKER_VARIABLE: &str = "FIXTURE_TYPE_CHECKER";

/// The Node packages `tools/oracle` installs. Type-check tasks need TypeScript 7's native
/// `tsc` and the framework packages' types from there.
#[derive(Debug)]
pub struct NodePackages {
    node_modules: PathBuf,
}

impl NodePackages {
    /// # Panics
    ///
    /// If `tools/oracle/node_modules` is not installed.
    #[must_use]
    pub fn locate() -> Self {
        let node_modules =
            Path::new(env!("CARGO_MANIFEST_DIR")).join("../../tools/oracle/node_modules");
        assert!(
            node_modules.is_dir(),
            "{} is missing: {INSTALL_HINT}",
            node_modules.display()
        );
        Self { node_modules }
    }

    /// The installed package's directory, with links resolved.
    ///
    /// # Panics
    ///
    /// If the package is not installed.
    #[must_use]
    pub fn package(&self, name: &str) -> PathBuf {
        let link = self.node_modules.join(name);
        std::fs::canonicalize(&link)
            .unwrap_or_else(|e| panic!("{}: {e}: {INSTALL_HINT}", link.display()))
    }

    /// TypeScript 7's native `tsc` for this platform.
    ///
    /// # Panics
    ///
    /// If the platform has no native build or it is not installed.
    #[must_use]
    pub fn tsc(&self) -> PathBuf {
        let os = match std::env::consts::OS {
            "macos" => "darwin",
            "windows" => "win32",
            other => other,
        };
        let arch = match std::env::consts::ARCH {
            "aarch64" => "arm64",
            "x86_64" => "x64",
            other => other,
        };
        let binary = if cfg!(windows) { "tsc.exe" } else { "tsc" };
        // pnpm installs the platform build next to the `typescript` package it belongs to.
        let typescript = self.package("typescript-7");
        let tsc = typescript
            .parent()
            .expect("a package has a parent directory")
            .join(format!("@typescript/typescript-{os}-{arch}/lib/{binary}"));
        assert!(
            tsc.is_file(),
            "{} is missing: {INSTALL_HINT}",
            tsc.display()
        );
        tsc
    }

    /// The type checker the check tests run, as its program and arguments: `FIXTURE_TYPE_CHECKER`,
    /// such as `tsrs --fast`, or else [`Self::tsc`] with `--singleThreaded`, since the tests run
    /// several projects at once. A bare program is looked for in
    /// `tools/oracle/node_modules/.bin`, then in `PATH`. Prints the checker and what its
    /// `--version` says, so a run names the checker it measured.
    ///
    /// # Panics
    ///
    /// If the variable is empty, or the checker cannot report its version.
    #[must_use]
    pub fn type_checker(&self) -> (PathBuf, Vec<String>) {
        let (program, arguments) = match std::env::var(TYPE_CHECKER_VARIABLE) {
            Err(std::env::VarError::NotPresent) => {
                (self.tsc(), vec!["--singleThreaded".to_owned()])
            }
            Ok(command) => {
                let mut words = command.split_whitespace().map(str::to_owned);
                let program = words
                    .next()
                    .unwrap_or_else(|| panic!("{TYPE_CHECKER_VARIABLE} is empty"));
                let installed = self.node_modules.join(".bin").join(&program);
                let bare = Path::new(&program).components().count() == 1;
                let program = if bare && installed.is_file() {
                    installed
                } else {
                    program.into()
                };
                (program, words.collect())
            }
            Err(e) => panic!("{TYPE_CHECKER_VARIABLE}: {e}"),
        };
        let command = std::iter::once(program.display().to_string())
            .chain(arguments.iter().cloned())
            .collect::<Vec<_>>()
            .join(" ");
        let output = std::process::Command::new(&program)
            .args(&arguments)
            .arg("--version")
            .output()
            .unwrap_or_else(|e| panic!("{TYPE_CHECKER_VARIABLE}: `{command}`: {e}"));
        let stdout = String::from_utf8_lossy(&output.stdout);
        let version = stdout.lines().map(str::trim).find(|l| !l.is_empty());
        let (true, Some(version)) = (output.status.success(), version) else {
            panic!(
                "{TYPE_CHECKER_VARIABLE}: `{command} --version` failed ({}): {}{stdout}",
                output.status,
                String::from_utf8_lossy(&output.stderr)
            );
        };
        eprintln!("type checker: {command} ({version})");
        (program, arguments)
    }
}
