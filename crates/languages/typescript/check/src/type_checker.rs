//! The type checker process: which program runs, and whether it has the API rsvelte needs.

use std::path::{Path, PathBuf};
use std::process::Command;

use rsvelte_typescript_api::Session;

/// What a type checker must accept: rsvelte opens a generated `tsconfig.json` (with
/// `contentMappers`) through the checker's API.
pub(crate) const CONTRACT: &str = "a type checker with the API of TypeScript 7.1 or later: \
     `--api --cwd <dir> --runExternalCode` and `contentMappers` in tsconfig.json";

/// A type checker: `tsc` of TypeScript 7.1, or any product with the same API (`CONTRACT`).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct TypeChecker {
    /// An absolute path, or a name looked up in `PATH`.
    pub program: PathBuf,
    /// Passed before the arguments rsvelte adds, such as a script for `node`. The API mode takes
    /// no compiler options.
    pub arguments: Vec<String>,
}

impl TypeChecker {
    /// What `--version` prints, such as `Version 7.1.0`, so a result can name the checker that
    /// made it. Fails, saying what to change, when the checker cannot run or is a `tsc` older than
    /// 7.1.
    ///
    /// # Errors
    /// The checker is missing, cannot run, fails, or is too old.
    pub(crate) fn identify(&self) -> Result<String, String> {
        match self.version()? {
            Version::Known(version) => Ok(version),
            Version::Failed(why) => Err(why),
        }
    }

    /// Starts the checker's API in `directory`. A checker that is missing, cannot run or is too
    /// old fails as [`Self::identify`] says, which only a failure asks, as it starts the checker
    /// once more.
    ///
    /// # Errors
    /// The checker does not start or does not answer.
    pub(crate) fn session(&self, directory: &Path) -> Result<Session, String> {
        Session::start(&self.program, &self.arguments, directory)
            .map_err(|e| self.version().err().unwrap_or(e))
    }

    /// The version `--version` prints; `Err` where the checker cannot start or is too old.
    fn version(&self) -> Result<Version, String> {
        let output = match Command::new(&self.program)
            .args(&self.arguments)
            .arg("--version")
            .output()
        {
            Ok(output) => output,
            Err(e) => return Err(self.cannot_start(&e)),
        };
        let stdout = String::from_utf8_lossy(&output.stdout);
        let version = stdout.lines().map(str::trim).find(|l| !l.is_empty());
        let (true, Some(version)) = (output.status.success(), version) else {
            return Ok(Version::Failed(format!(
                "type checker `{self} --version` failed ({}): {}{stdout}",
                output.status,
                String::from_utf8_lossy(&output.stderr)
            )));
        };
        if let Some(old) = typescript_before_7_1(version) {
            return Err(format!(
                "type checker `{self}` is TypeScript {old}; rsvelte needs {CONTRACT}, such as \
                 TypeScript 7.1 or tsrs"
            ));
        }
        Ok(Version::Known(version.to_owned()))
    }

    fn cannot_start(&self, e: &std::io::Error) -> String {
        let bare = self.program.components().count() == 1;
        match e.kind() {
            std::io::ErrorKind::NotFound if bare => format!(
                "type checker `{}` is not in node_modules/.bin or on PATH: install it in the \
                 project, or give its path in `command` of the `typescript.check` options",
                self.program.display()
            ),
            std::io::ErrorKind::NotFound => {
                format!("type checker `{}` does not exist", self.program.display())
            }
            std::io::ErrorKind::PermissionDenied => {
                format!(
                    "type checker `{}` is not executable",
                    self.program.display()
                )
            }
            _ => format!("type checker `{self}`: {e}"),
        }
    }
}

/// What `--version` says of a checker that starts.
enum Version {
    Known(String),
    /// It fails or prints nothing, which a checker that has the API may still do.
    Failed(String),
}

/// `major.minor` of a `tsc` that prints `Version <major>.<minor>...` and is older than 7.1.
fn typescript_before_7_1(version: &str) -> Option<&str> {
    let number = version.strip_prefix("Version ")?;
    version_before_7_1(number).then_some(number)
}

/// A TypeScript version number, such as `7.0.0-dev.20260707.2`, older than 7.1.
pub(crate) fn version_before_7_1(number: &str) -> bool {
    let mut parts = number.split(['.', '-']).map(str::parse::<u32>);
    match (parts.next(), parts.next()) {
        (Some(Ok(major)), Some(Ok(minor))) => (major, minor) < (7, 1),
        _ => false,
    }
}

impl std::fmt::Display for TypeChecker {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.program.display())?;
        for a in &self.arguments {
            write!(f, " {a}")?;
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests;
