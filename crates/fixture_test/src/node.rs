use std::path::{Path, PathBuf};

const INSTALL_HINT: &str = "run `(cd tools/fixtures && pnpm install --frozen-lockfile)`";

/// The Node packages `tools/fixtures` installs. Type-check tasks need TypeScript 7's native
/// `tsc` and the framework packages' types from there.
#[derive(Debug)]
pub struct NodePackages {
    node_modules: PathBuf,
}

impl NodePackages {
    /// # Panics
    ///
    /// If `tools/fixtures/node_modules` is not installed.
    #[must_use]
    pub fn locate() -> Self {
        let node_modules =
            Path::new(env!("CARGO_MANIFEST_DIR")).join("../../tools/fixtures/node_modules");
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
}
