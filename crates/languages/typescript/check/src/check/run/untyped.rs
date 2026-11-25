//! TS7016 for an import of a JavaScript document of another language, checked or not. The checker
//! reads every mapped document and stand-in as typed, so it never reports this itself, and loads
//! such a document where TypeScript would not load a JavaScript file; a probe asks whether the
//! project's options would report it for a plain JavaScript file.

use std::collections::HashSet;
use std::path::{Path, PathBuf};

use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::paths;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_api::{DiagnosticKind, Project, Session};

use super::TypeScriptDiagnostic;
use super::mapped::normalized;
use crate::check::findings::byte_order_mark;
use crate::check::{CheckRequest, CheckedDocument, Import};

/// The extensions the checker reads a projection as JavaScript by.
const JAVASCRIPT: &[&str] = &[".js", ".jsx", ".mjs", ".cjs"];

/// The probe's name in the overlay, and the JavaScript file it imports, whose name differs, since
/// `./probe.js` would read `probe.ts`.
const PROBE: (&str, &str) = ("untyped-probe.ts", "untyped.js");
/// The probe of a JavaScript file a search of `node_modules` finds, and its package.
const PACKAGE_PROBE: (&str, &str) = ("untyped-package-probe.ts", "rsvelte-untyped-probe");
const PROBE_CONFIG: &str = ".rsvelte.untyped-probe.json";

/// `Could not find a declaration file for module '{0}'. '{1}' implicitly has an 'any' type.`
pub(super) const CODE: u32 = 7016;

/// An import as the run reads it.
#[derive(Debug)]
pub(crate) struct CheckedImport {
    /// `at` in the document's own coordinates: original for a content-mapped document, generated
    /// otherwise, as a finding's span is.
    pub import: Import,
    /// Where the checker reads the specifier, in UTF-16 code units of the projection.
    pub position: u32,
}

/// `document`'s imports as the run reads them; `source` is the document's text.
pub(crate) fn checked_imports(document: &CheckedDocument, source: &str) -> Vec<CheckedImport> {
    let projection = &document.projection;
    let bom = byte_order_mark(source);
    let mapped = document.env.mapped_extension.is_some();
    let mut located: Vec<(u32, Import)> = (document.imports.iter())
        .filter_map(|import| {
            // Inside the string literal, which the projection copies.
            let inside = projection.generated(import.at.start_offset + 1)?;
            let at = if mapped {
                Span::new(
                    import.at.start_offset.checked_sub(bom)?,
                    import.at.end_offset - bom,
                )
            } else {
                Span::new(inside - 1, inside - 1 + import.at.len())
            };
            Some((
                inside,
                Import {
                    at,
                    ..import.clone()
                },
            ))
        })
        .collect();
    located.sort_unstable_by_key(|&(inside, _)| inside);
    let mut units = 0;
    let mut from = 0;
    (located.into_iter())
        .map(|(inside, import)| {
            units += projection.out[from..inside as usize].encode_utf16().count() as u32;
            from = inside as usize;
            CheckedImport {
                import,
                position: units,
            }
        })
        .collect()
}

/// An import of a typed document that reads an untyped JavaScript document.
pub(super) struct UntypedImport<'a> {
    /// The importing document.
    pub file: usize,
    pub import: &'a Import,
    /// The document it reads, as the checker names it.
    pub module: PathBuf,
}

impl UntypedImport<'_> {
    /// The TS7016 TypeScript reports for the import.
    pub(super) fn finding(&self) -> TypeScriptDiagnostic {
        TypeScriptDiagnostic {
            file: self.file,
            code: CODE,
            message: format!(
                "Could not find a declaration file for module '{}'. '{}' implicitly has an 'any' \
                 type.",
                self.import.specifier,
                paths::typescript(&self.module)
            ),
            span: Some(self.import.at),
            syntactic: false,
        }
    }
}

/// The modules each import of document `file` reads, as the checker resolves them, in the order of
/// [`CheckRequest::imports`]; empty unless the document is `typed`, since only those imports can
/// be untyped.
pub(super) fn modules(
    req: &CheckRequest<'_>,
    session: &mut Session,
    project: &Project,
    paths: &[PathBuf],
    file: usize,
    typed: bool,
) -> Result<Vec<Option<PathBuf>>, String> {
    let imports = &req.imports[file];
    if imports.is_empty() || !typed {
        return Ok(Vec::new());
    }
    let positions: Vec<u32> = imports.iter().map(|i| i.position).collect();
    session.modules_at(project, &paths[file], &positions)
}

/// Each import of a typed document that `modules` resolves to one of `untyped_documents`.
pub(super) fn imports<'a>(
    req: &'a CheckRequest<'_>,
    modules: &[(usize, Vec<Option<PathBuf>>)],
    untyped_documents: &UntypedDocuments,
) -> Vec<UntypedImport<'a>> {
    let mut untyped = Vec::new();
    for (file, modules) in modules {
        for (CheckedImport { import, .. }, module) in req.imports[*file].iter().zip(modules) {
            let Some(module) = module.as_deref().map(normalized) else {
                continue;
            };
            if untyped_documents.is(&module) {
                untyped.push(UntypedImport {
                    file: *file,
                    import,
                    module,
                });
            }
        }
    }
    untyped
}

/// Drops from `external` each document an import of a typed document reaches other than by a
/// search of `node_modules`: TypeScript loads a JavaScript file such an import reaches, whatever
/// else reaches it, and svelte-check reads only that import's resolution, not its link.
pub(super) fn drop_loaded(
    req: &CheckRequest<'_>,
    modules: &[(usize, Vec<Option<PathBuf>>)],
    external: &mut HashSet<PathBuf>,
) {
    for (file, modules) in modules {
        for (CheckedImport { import, .. }, module) in req.imports[*file].iter().zip(modules) {
            if let Some(module) = module.as_deref().map(normalized)
                && !searched(&import.specifier, &module)
            {
                external.remove(&module);
            }
        }
    }
}

/// Whether TypeScript reads an import of `specifier` that reaches `module` as a search of
/// `node_modules` (`isExternalLibraryImport`): a relative or rooted one is not, unless its path
/// passes through `node_modules`.
fn searched(specifier: &str, module: &Path) -> bool {
    let rest = (specifier.strip_prefix("..")).or_else(|| specifier.strip_prefix('.'));
    let relative = rest.is_some_and(|rest| rest.is_empty() || rest.starts_with(['/', '\\']))
        || Path::new(specifier).has_root();
    !relative || module.components().any(|c| c.as_os_str() == "node_modules")
}

/// `Value refers to a value, but is being used as a type here.`
const VALUE_AS_TYPE: u32 = 2749;

/// Whether `found` reads a name one of `untyped` binds as a type. TypeScript gives such a name
/// every meaning, as `any`; the projection's export of a JavaScript component is a value only.
pub(super) fn hides(
    found: &TypeScriptDiagnostic,
    untyped: &[UntypedImport<'_>],
    source: &str,
) -> bool {
    found.code == VALUE_AS_TYPE
        && found.span.is_some_and(|span| {
            let read = span.text(source);
            (untyped.iter()).any(|untyped| {
                untyped.file == found.file && untyped.import.names.iter().any(|name| name == read)
            })
        })
}

/// The paths of the JavaScript documents, checked at `paths` or not: the one answer the run
/// reads whether a document is JavaScript by.
pub(super) fn javascript_documents(
    req: &CheckRequest<'_>,
    root: &Path,
    paths: &[PathBuf],
) -> HashSet<PathBuf> {
    let checked = (paths.iter().enumerate())
        .filter(|&(file, _)| {
            req.mapped(file)
                .is_some_and(|mapped| JAVASCRIPT.contains(&mapped.generated_extension))
        })
        .map(|(_, path)| path.clone());
    let unchecked = (req.stand_ins(root))
        .filter(|(_, stand_in)| stand_in.javascript)
        .map(|(path, _)| path);
    checked.chain(unchecked).collect()
}

/// The probes, the JavaScript files they import and the tsconfig of their own project, which
/// extends the project's `base`, in its directory `root`: one imports a file by its path, the
/// other a package's.
pub(super) fn probe(root: &Path, overlay: &Path, base: &Path) -> [(PathBuf, String); 6] {
    let probe = overlay.join(PROBE.0);
    let package_probe = overlay.join(PACKAGE_PROBE.0);
    let package = overlay.join("node_modules").join(PACKAGE_PROBE.1);
    let mut config = StructuredDataWriter::new(true);
    config
        .begin_object()
        .key("extends")
        .write_string(&paths::typescript(base))
        .key("compilerOptions")
        .begin_object()
        .key("noEmit")
        .write_boolean(true)
        .end_object()
        .key("include")
        .begin_array()
        .end_array()
        .key("files")
        .begin_array()
        .write_string(&paths::typescript(&probe))
        .write_string(&paths::typescript(&package_probe))
        .end_array()
        .end_object();
    [
        (
            probe,
            format!(
                "import untyped from './{}';\nexport default untyped;\n",
                PROBE.1
            ),
        ),
        (overlay.join(PROBE.1), "export default 1;\n".to_owned()),
        (
            package_probe,
            format!(
                "import untyped from '{}';\nexport default untyped;\n",
                PACKAGE_PROBE.1
            ),
        ),
        (
            package.join("package.json"),
            format!(r#"{{"name":"{}","main":"index.js"}}"#, PACKAGE_PROBE.1),
        ),
        (package.join("index.js"), "export default 1;\n".to_owned()),
        (root.join(PROBE_CONFIG), config.finish()),
    ]
}

/// Which imports of JavaScript TypeScript reads as untyped.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub(super) enum UntypedJavaScript {
    /// None: `allowJs` loads JavaScript, to `maxNodeModuleJsDepth` in packages.
    #[default]
    None,
    /// Those of JavaScript a search of `node_modules` finds, beyond `maxNodeModuleJsDepth`.
    Packages,
    /// All: TypeScript loads no JavaScript the tsconfig does not select.
    All,
}

/// The JavaScript documents whose imports are untyped, by path: all of them, or those a search of
/// `node_modules` finds.
pub(super) struct UntypedDocuments {
    pub(super) all: bool,
    pub(super) javascript: HashSet<PathBuf>,
    pub(super) external: HashSet<PathBuf>,
}

impl UntypedDocuments {
    /// Whether an import of `path` is untyped.
    fn is(&self, path: &Path) -> bool {
        self.external.contains(path) || self.all && self.javascript.contains(path)
    }

    /// Whether TypeScript would not load `path`: it loads no untyped JavaScript file the tsconfig
    /// does not select, whatever imports it, as the project `reached` only through an import, nor
    /// a component a search of `node_modules` finds beyond `maxNodeModuleJsDepth`.
    pub(super) fn unloaded(&self, path: &Path, reached: &HashSet<PathBuf>) -> bool {
        self.is(path) && (reached.contains(path) || self.external.contains(path))
    }
}

/// Which imports the probes' project reports TS7016 for: that of a file by its path, and that
/// of a package's, which TypeScript loads only to `maxNodeModuleJsDepth`.
pub(super) fn reported(
    session: &mut Session,
    project: &Project,
    overlay: &Path,
) -> Result<UntypedJavaScript, String> {
    let probes = [overlay.join(PROBE.0), overlay.join(PACKAGE_PROBE.0)];
    let files: Vec<&Path> = probes.iter().map(PathBuf::as_path).collect();
    let found = session.diagnostics(project, DiagnosticKind::Semantic, Some(&files))?;
    let reported = probes.map(|probe| {
        (found.iter()).any(|d| {
            d.code == CODE && d.is_error() && d.file_name.as_deref() == Some(probe.as_path())
        })
    });
    Ok(match reported {
        [true, _] => UntypedJavaScript::All,
        [false, true] => UntypedJavaScript::Packages,
        [false, false] => UntypedJavaScript::None,
    })
}

/// Tells a projection that an import of a JavaScript document is untyped, as TypeScript reads a
/// JavaScript file it does not include: `__rsvelte_check_options` gains `untypedJavaScript`.
pub(super) fn options_declaration(overlay: &Path) -> (PathBuf, String) {
    (
        overlay.join("check-options.d.ts"),
        "interface __rsvelte_check_options {\n\tuntypedJavaScript: true;\n}\n".to_owned(),
    )
}

pub(super) mod ambient;

#[cfg(test)]
mod tests;
