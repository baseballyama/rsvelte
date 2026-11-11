use std::collections::BTreeSet;
use std::path::{Component, Path, PathBuf};

use rsvelte_kernel::output::emitter::Mapping;
use rsvelte_kernel::output::structured_data::StructuredDataWriter;

use super::CheckRequest;

#[derive(Debug)]
pub(crate) struct ContentMappedInput {
    pub source: String,
    pub extension: &'static str,
    pub mappings: Vec<Mapping>,
}

/// Extensions the checker reads as JavaScript or TypeScript without a content mapper.
const SCRIPT_EXTENSIONS: &[&str] = &["ts", "tsx", "mts", "cts", "js", "jsx", "mjs", "cjs"];

impl CheckRequest {
    /// The absolute path the checker reads document `index` at: its own path for a script or a
    /// content-mapped document, and `<path>.ts` for generated TypeScript, which an import of the
    /// document reaches as TypeScript resolves `./App.vue` to `./App.vue.ts`.
    pub(super) fn checked_path(&self, root: &Path, index: usize) -> PathBuf {
        let path = normalized(&root.join(&self.documents[index]));
        let mapped = self.mapped_files.get(index).is_some_and(Option::is_some);
        let script = path
            .extension()
            .and_then(|e| e.to_str())
            .is_some_and(|e| SCRIPT_EXTENSIONS.contains(&e));
        if mapped || script {
            path
        } else {
            let mut name = path.into_os_string();
            name.push(".ts");
            name.into()
        }
    }

    pub(super) fn write_mapper_config(
        &self,
        output: &mut StructuredDataWriter,
        package: &str,
        store: &Path,
    ) {
        if self.content_mapper.is_none() {
            return;
        }
        output
            .key("contentMappers")
            .begin_array()
            .begin_object()
            .key("package")
            .write_string(package)
            .key("extensions")
            .begin_array();
        let extensions: BTreeSet<_> = self
            .mapped_files
            .iter()
            .flatten()
            .map(|file| file.extension)
            .collect();
        for extension in extensions {
            output.write_string(extension);
        }
        output
            .end_array()
            .key("options")
            .begin_object()
            .key("projections")
            .write_string(&store.to_string_lossy())
            .end_object()
            .end_object()
            .end_array();
    }
}

/// The precomputed mapper's store: each content-mapped document's projection by checked path.
pub(super) fn store_json(req: &CheckRequest, paths: &[PathBuf]) -> String {
    let mut output = StructuredDataWriter::new(false);
    output.begin_object().key("files").begin_object();
    for ((file, text), path) in req.mapped_files.iter().zip(&req.files).zip(paths) {
        let Some(file) = file else { continue };
        output
            .key(&path.to_string_lossy())
            .begin_object()
            .key("source")
            .write_string(&file.source)
            .key("text")
            .write_string(text)
            .key("extension")
            .write_string(".ts");
        rsvelte_typescript_content_mapper::write_mappings(&file.mappings, &mut output);
        output.end_object();
    }
    output.end_object().end_object();
    output.finish()
}

pub(super) fn package_json(binary: &Path) -> String {
    let mut output = StructuredDataWriter::new(false);
    output
        .begin_object()
        .key("name")
        .write_string(super::MAPPER_PACKAGE)
        .key("version")
        .write_string(env!("CARGO_PKG_VERSION"))
        .key("typescript")
        .begin_object()
        .key("contentMapper")
        .begin_object()
        .key("exec")
        .begin_array()
        .write_string(&binary.to_string_lossy())
        .end_array()
        .end_object()
        .end_object()
        .end_object();
    output.finish()
}

/// `path` without `.` and with each `..` taken back, as the checker spells file names.
fn normalized(path: &Path) -> PathBuf {
    let mut out = PathBuf::new();
    for c in path.components() {
        match c {
            Component::CurDir => {}
            Component::ParentDir => {
                out.pop();
            }
            other => out.push(other),
        }
    }
    out
}
