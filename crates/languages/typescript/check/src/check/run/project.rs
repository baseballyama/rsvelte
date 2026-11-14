//! The files of a project, as the checker selects them from its tsconfig: `--showConfig` expands
//! `files`, `include` and `exclude`, and counts a mapped language's extension once its content
//! mapper's package resolves, so rsvelte never matches the patterns itself.

use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::atomic::Ordering;

use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use serde::Deserialize;

use super::RUN;
use super::mapped::{normalized, package_json};
use crate::check::{MappedLanguage, Tsc};

#[derive(Deserialize)]
struct ShownConfig {
    #[serde(default)]
    files: Vec<String>,
}

impl Tsc {
    /// Every file of the tsconfig's project outside `node_modules`, with the files of each of
    /// `languages`.
    ///
    /// # Errors
    ///
    /// The check names no tsconfig, the checker cannot run, or it rejects the tsconfig.
    pub(crate) fn project_files(
        &self,
        languages: &[MappedLanguage],
    ) -> Result<Vec<PathBuf>, String> {
        let config = self
            .tsconfig
            .as_ref()
            .ok_or("a project check needs the `tsconfig` option of `typescript.check`")?;
        let config =
            std::fs::canonicalize(config).map_err(|e| format!("{}: {e}", config.display()))?;
        let dir = std::env::temp_dir().join(format!(
            "rsvelte-project-{}-{}",
            std::process::id(),
            RUN.fetch_add(1, Ordering::Relaxed)
        ));
        let result = shown_files(self, &config, languages, &dir);
        // Best effort: a leftover temporary directory does not affect the result.
        drop(std::fs::remove_dir_all(&dir));
        result
    }
}

fn shown_files(
    tsc: &Tsc,
    config: &Path,
    languages: &[MappedLanguage],
    dir: &Path,
) -> Result<Vec<PathBuf>, String> {
    let io = |path: &Path, e: std::io::Error| format!("{}: {e}", path.display());
    std::fs::create_dir_all(dir).map_err(|e| io(dir, e))?;
    // The checker names files from the real path, such as `/private/var` for `/var`.
    let dir = &std::fs::canonicalize(dir).map_err(|e| io(dir, e))?;
    let mut overlay = StructuredDataWriter::new(false);
    overlay
        .begin_object()
        .key("extends")
        .write_string(&config.to_string_lossy())
        .key("contentMappers")
        .begin_array();
    for (i, language) in languages.iter().enumerate() {
        let name = format!("rsvelte-project-mapper-{i}");
        let package = dir.join("node_modules").join(&name);
        std::fs::create_dir_all(&package).map_err(|e| io(&package, e))?;
        let manifest = package.join("package.json");
        std::fs::write(&manifest, package_json(&name, &language.content_mapper))
            .map_err(|e| io(&manifest, e))?;
        overlay
            .begin_object()
            .key("package")
            .write_string(&name)
            .key("extensions")
            .begin_array()
            .write_string(language.extension)
            .end_array()
            .end_object();
    }
    overlay.end_array().end_object();
    let overlay_path = dir.join("tsconfig.json");
    std::fs::write(&overlay_path, overlay.finish()).map_err(|e| io(&overlay_path, e))?;
    let output = Command::new(&tsc.checker.program)
        .args(&tsc.checker.arguments)
        .arg("-p")
        .arg(&overlay_path)
        .args(["--showConfig", "--runExternalCode"])
        .current_dir(dir)
        .output()
        .map_err(|e| format!("{}: {e}", tsc.checker))?;
    if !output.status.success() {
        return Err(format!(
            "`{} --showConfig` failed ({}): {}{}",
            tsc.checker,
            output.status,
            String::from_utf8_lossy(&output.stderr),
            String::from_utf8_lossy(&output.stdout)
        ));
    }
    let shown: ShownConfig = serde_json::from_slice(&output.stdout)
        .map_err(|e| format!("`{} --showConfig` printed {e}", tsc.checker))?;
    // The checker prints each file relative to the overlay.
    Ok(shown
        .files
        .iter()
        .map(|file| normalized(&dir.join(file)))
        .filter(|file| !file.components().any(|c| c.as_os_str() == "node_modules"))
        .collect())
}
