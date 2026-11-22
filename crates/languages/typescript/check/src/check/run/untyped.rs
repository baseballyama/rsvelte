//! TS7016 for an import of a content-mapped JavaScript document. The checker reads every mapped
//! document as typed, whatever its generated extension, so it never reports this itself, and
//! loads such a document where TypeScript would not load a JavaScript file; a probe asks whether
//! the project's options would report it for a plain JavaScript file.

use std::collections::HashMap;
use std::path::{Path, PathBuf};

use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_api::{DiagnosticKind, Project, Session};

use super::mapped::normalized;
use super::{MAPPER_PACKAGE, TypeScriptDiagnostic};
use crate::check::findings::byte_order_mark;
use crate::check::{CheckRequest, CheckedDocument, Import};

/// The extensions the checker reads a projection as JavaScript by.
const JAVASCRIPT: &[&str] = &[".js", ".jsx", ".mjs", ".cjs"];

/// The probe's name in the overlay, and the JavaScript file it imports, whose name differs, since
/// `./probe.js` would read `probe.ts`.
const PROBE: (&str, &str) = ("untyped-probe.ts", "untyped.js");
const PROBE_CONFIG: &str = "untyped-probe.json";
const SELECTION_CONFIG: &str = "untyped-selection.json";

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

/// What untyped imports change in a run.
#[derive(Default)]
pub(super) struct Untyped<'a> {
    /// TS7016 at each import of a typed document that reads a content-mapped JavaScript document.
    pub found: Vec<TypeScriptDiagnostic>,
    /// The names those imports bind, by document.
    pub names: Vec<(usize, &'a str)>,
}

/// The modules each import of document `file` reads, as the checker resolves them, in the order of
/// [`CheckRequest::imports`]; empty for a document whose imports cannot be untyped.
pub(super) fn modules(
    req: &CheckRequest<'_>,
    session: &mut Session,
    project: &Project,
    paths: &[PathBuf],
    file: usize,
) -> Result<Vec<Option<PathBuf>>, String> {
    let imports = &req.imports[file];
    if imports.is_empty() || javascript(req, file) {
        return Ok(Vec::new());
    }
    let positions: Vec<u32> = imports.iter().map(|i| i.position).collect();
    session.modules_at(project, &paths[file], &positions)
}

/// Each import of a typed document that `modules` resolves to a content-mapped JavaScript
/// document, as the finding TypeScript reports for it.
pub(super) fn imports<'a>(
    req: &'a CheckRequest<'_>,
    modules: &[(usize, Vec<Option<PathBuf>>)],
    root: &Path,
    index: &HashMap<&Path, usize>,
) -> Untyped<'a> {
    let mut untyped = Untyped::default();
    for (file, modules) in modules {
        let file = *file;
        for (CheckedImport { import, .. }, module) in req.imports[file].iter().zip(modules) {
            let Some(module) = module.as_deref().map(normalized) else {
                continue;
            };
            if !(index.get(module.as_path())).is_some_and(|&read| javascript(req, read)) {
                continue;
            }
            // svelte-check prints TypeScript's absolute name; its recorded output, which the
            // corpus and the fixtures compare, reads it from the root.
            let shown = module.strip_prefix(root).unwrap_or(&module);
            (untyped.names).extend(import.names.iter().map(|name| (file, name.as_str())));
            untyped.found.push(TypeScriptDiagnostic {
                file,
                code: CODE,
                message: format!(
                    "Could not find a declaration file for module '{}'. '{}' implicitly has an \
                     'any' type.",
                    import.specifier,
                    shown.display()
                ),
                span: Some(import.at),
                syntactic: false,
            });
        }
    }
    untyped
}

/// Whether document `file` projects to JavaScript.
pub(super) fn javascript(req: &CheckRequest<'_>, file: usize) -> bool {
    req.mapped(file)
        .is_some_and(|mapped| JAVASCRIPT.contains(&mapped.generated_extension))
}

/// `Value refers to a value, but is being used as a type here.`
const VALUE_AS_TYPE: u32 = 2749;

/// Whether `found` reads a name an untyped import binds as a type. TypeScript gives such a name
/// every meaning, as `any`; the projection's export of a JavaScript component is a value only.
pub(super) fn hides(found: &TypeScriptDiagnostic, names: &[(usize, &str)], source: &str) -> bool {
    found.code == VALUE_AS_TYPE
        && found.span.is_some_and(|span| {
            let read = span.text(source);
            names
                .iter()
                .any(|&(file, name)| file == found.file && name == read)
        })
}

/// Whether any document projects to JavaScript.
pub(super) fn any_javascript(req: &CheckRequest<'_>) -> bool {
    (0..req.mapped_files.len()).any(|file| javascript(req, file))
}

/// The probe, the JavaScript file it imports and the tsconfig of its own project, which extends
/// the project's `base`.
pub(super) fn probe(overlay: &Path, base: &Path) -> [(PathBuf, String); 3] {
    let probe = overlay.join(PROBE.0);
    let mut config = StructuredDataWriter::new(true);
    config
        .begin_object()
        .key("extends")
        .write_string(&base.to_string_lossy())
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
        .write_string(&probe.to_string_lossy())
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
        (overlay.join(PROBE_CONFIG), config.finish()),
    ]
}

/// The tsconfig of a project that extends the project's `base` with the content mappers of `req`,
/// so that its root files are those the tsconfig selects, components included.
pub(super) fn selection(
    req: &CheckRequest<'_>,
    overlay: &Path,
    base: &Path,
    store: &Path,
) -> (PathBuf, String) {
    let mut config = StructuredDataWriter::new(true);
    config
        .begin_object()
        .key("extends")
        .write_string(&base.to_string_lossy())
        .key("compilerOptions")
        .begin_object()
        .key("noEmit")
        .write_boolean(true)
        .end_object();
    req.write_mapper_config(&mut config, MAPPER_PACKAGE, store);
    config.end_object();
    (overlay.join(SELECTION_CONFIG), config.finish())
}

/// Whether the probe's project reports TS7016 for its import.
pub(super) fn reported(
    session: &mut Session,
    project: &Project,
    overlay: &Path,
) -> Result<bool, String> {
    let probe = overlay.join(PROBE.0);
    Ok(session
        .diagnostics(project, DiagnosticKind::Semantic, Some(&[probe.as_path()]))?
        .iter()
        .any(|d| d.code == CODE && d.is_error()))
}

/// Tells a projection that an import of a JavaScript document is untyped, as TypeScript reads a
/// JavaScript file it does not include: `__rsvelte_check_options` gains `untypedJavaScript`.
pub(super) fn options_declaration(overlay: &Path) -> (PathBuf, String) {
    (
        overlay.join("check-options.d.ts"),
        "interface __rsvelte_check_options {\n\tuntypedJavaScript: true;\n}\n".to_owned(),
    )
}
