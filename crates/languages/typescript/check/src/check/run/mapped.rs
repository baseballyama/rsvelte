use std::collections::{BTreeSet, HashSet};
use std::path::{Component, Path, PathBuf};

use rsvelte_kernel::output::emitter::{Atom, Mapping};
use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::paths;

use super::CheckRequest;
use crate::check::StandIn;

#[derive(Debug)]
pub(crate) struct ContentMappedInput {
    pub source: String,
    pub extension: &'static str,
    /// The extension the checker reads the projection as.
    pub generated_extension: &'static str,
    pub mappings: Vec<Mapping>,
    pub atoms: Vec<Atom>,
}

/// Extensions the checker reads as JavaScript or TypeScript without a content mapper.
const SCRIPT_EXTENSIONS: &[&str] = &["ts", "tsx", "mts", "cts", "js", "jsx", "mjs", "cjs"];

impl CheckRequest<'_> {
    /// The absolute path the checker reads document `index` at: its own path for a script or a
    /// content-mapped document, and `<path>.ts` for generated TypeScript, which an import of the
    /// document reaches as TypeScript resolves `./App.vue` to `./App.vue.ts`.
    pub(super) fn checked_path(&self, root: &Path, index: usize) -> PathBuf {
        let path = normalized(&root.join(&self.documents[index]));
        let mapped = self.mapped(index).is_some();
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

    /// Document `index`'s content-mapped input, if it has one.
    pub(super) fn mapped(&self, index: usize) -> Option<&ContentMappedInput> {
        self.mapped_files.get(index).and_then(Option::as_ref)
    }

    /// The text the checker reads for document `index`: its source when content-mapped, else its
    /// projection.
    pub(super) fn text(&self, index: usize) -> &str {
        self.mapped(index)
            .map_or(self.files[index], |mapped| &mapped.source)
    }

    /// Where the checker reads each stand-in, and the stand-in.
    pub(super) fn stand_ins<'a>(
        &'a self,
        root: &'a Path,
    ) -> impl Iterator<Item = (PathBuf, &'a StandIn)> + 'a {
        self.stand_ins
            .iter()
            .map(move |(path, stand_in)| (normalized(&root.join(path)), stand_in))
    }

    /// The extensions of the content-mapped documents, each once.
    pub(super) fn mapped_extensions(&self) -> Vec<&'static str> {
        let extensions: BTreeSet<_> = (self.mapped_files.iter().flatten())
            .map(|file| file.extension)
            .collect();
        extensions.into_iter().collect()
    }

    pub(super) fn write_mapper_config(
        &self,
        output: &mut StructuredDataWriter,
        package: &str,
        store: &Path,
    ) {
        if self.env.content_mapper.is_none() {
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
        for extension in self.mapped_extensions() {
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

/// What an untyped JavaScript projection ends with: a `__rsvelte_javascript_export` of its own,
/// which the projection's export reads before the global one.
const UNTYPED: &str = "\n/** @template T @typedef {any} __rsvelte_javascript_export */\n";

/// The precomputed mapper's store: each content-mapped document's projection by checked path,
/// with those at the paths of `untyped` read as untyped JavaScript.
pub(super) fn store_json(
    req: &CheckRequest<'_>,
    root: &Path,
    paths: &[PathBuf],
    untyped: &HashSet<PathBuf>,
) -> String {
    let mut output = StructuredDataWriter::new(false);
    output.begin_object().key("files").begin_object();
    let mut entry = |path: &Path, [source, text, extension]: [&str; 3], mappings, atoms| {
        output
            .key(&paths::typescript(path))
            .begin_object()
            .key("source")
            .write_string(source)
            .key("text")
            .write_string(text)
            .key("extension")
            .write_string(extension);
        rsvelte_typescript_content_mapper::write_mappings(mappings, atoms, &mut output);
        output.end_object();
    };
    for ((file, text), path) in req.mapped_files.iter().zip(&req.files).zip(paths) {
        let Some(file) = file else { continue };
        let untyped_text;
        let text = if untyped.contains(path) {
            untyped_text = format!("{text}{UNTYPED}");
            untyped_text.as_str()
        } else {
            text
        };
        let strings = [file.source.as_str(), text, file.generated_extension];
        entry(path, strings, &file.mappings, &file.atoms);
    }
    // A stand-in reads as the script it is.
    for (path, StandIn { text, .. }) in req.stand_ins(root) {
        entry(&path, [text, text, ".ts"], &[], &[]);
    }
    output.end_object().end_object();
    output.finish()
}

/// The store to read where the documents at the paths of `untyped` read as untyped JavaScript:
/// `store` where no projection is among them, else one beside it whose projections of them make
/// `__rsvelte_javascript_export` `any`, as an import of a JavaScript file TypeScript does not load
/// is. The mapper reads a store once per options, so this one has a name of its own.
pub(super) fn untyped_store(
    req: &CheckRequest<'_>,
    root: &Path,
    paths: &[PathBuf],
    untyped: &HashSet<PathBuf>,
    store: PathBuf,
) -> Result<PathBuf, String> {
    if !paths.iter().any(|path| untyped.contains(path)) {
        return Ok(store);
    }
    let path = store.with_file_name("projections-untyped.json");
    std::fs::write(&path, store_json(req, root, paths, untyped))
        .map_err(|e| format!("{}: {e}", path.display()))?;
    Ok(path)
}

/// Writes the store of `req`'s projections and the mapper's package in `support`, and returns
/// the package's directory.
pub(super) fn write_mapper(
    req: &CheckRequest<'_>,
    binary: &Path,
    support: &Path,
    store: &Path,
    root: &Path,
    paths: &[PathBuf],
) -> Result<PathBuf, String> {
    std::fs::write(store, store_json(req, root, paths, &HashSet::new()))
        .map_err(|e| format!("{}: {e}", store.display()))?;
    let package = support.join(super::MAPPER_PACKAGE);
    std::fs::create_dir_all(&package).map_err(|e| e.to_string())?;
    std::fs::write(
        package.join("package.json"),
        package_json(super::MAPPER_PACKAGE, binary),
    )
    .map_err(|e| e.to_string())?;
    Ok(package)
}

pub(super) fn package_json(name: &str, binary: &Path) -> String {
    let mut output = StructuredDataWriter::new(false);
    output
        .begin_object()
        .key("name")
        .write_string(name)
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
pub(super) fn normalized(path: &Path) -> PathBuf {
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
