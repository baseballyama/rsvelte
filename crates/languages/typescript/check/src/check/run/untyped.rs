//! TS7016 for an import of a content-mapped JavaScript document. The checker reads every mapped
//! document as typed, whatever its generated extension, so it never reports this itself; a probe
//! asks whether the project's options would report it for a plain JavaScript file.

use std::path::{Path, PathBuf};

use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_typescript_api::{DiagnosticKind, Project, Session};

use super::mapped::normalized;
use super::{ERROR, TypeScriptDiagnostic};
use crate::check::CheckRequest;

/// The extensions the checker reads a projection as JavaScript by.
const JAVASCRIPT: &[&str] = &[".js", ".jsx", ".mjs", ".cjs"];

/// The probe's name in the overlay, and the JavaScript file it imports, whose name differs, since
/// `./probe.js` would read `probe.ts`.
const PROBE: (&str, &str) = ("untyped-probe.ts", "untyped.js");
const PROBE_CONFIG: &str = "untyped-probe.json";

/// `Could not find a declaration file for module '{0}'. '{1}' implicitly has an 'any' type.`
pub(super) const CODE: u32 = 7016;

/// Each import of a typed document that reads a content-mapped JavaScript document, as the finding
/// TypeScript reports for it when the probe says the project's options report one.
pub(super) fn imports(
    req: &CheckRequest,
    root: &Path,
    paths: &[PathBuf],
) -> Vec<TypeScriptDiagnostic> {
    let javascript = |file: usize| {
        req.mapped_files
            .get(file)
            .and_then(Option::as_ref)
            .is_some_and(|mapped| JAVASCRIPT.contains(&mapped.generated_extension))
    };
    let mut found = Vec::new();
    for (file, mapped) in req.mapped_files.iter().enumerate() {
        let Some(mapped) = mapped.as_ref().filter(|_| !javascript(file)) else {
            continue;
        };
        let directory = paths[file].parent().unwrap_or(root);
        for (span, specifier) in &mapped.imports {
            let target = normalized(&directory.join(specifier));
            let Some(read) = paths.iter().position(|path| *path == target) else {
                continue;
            };
            if !javascript(read) {
                continue;
            }
            let shown = target.strip_prefix(root).unwrap_or(&target);
            found.push(TypeScriptDiagnostic {
                file,
                code: CODE,
                message: format!(
                    "Could not find a declaration file for module '{specifier}'. '{}' implicitly \
                     has an 'any' type.",
                    shown.display()
                ),
                span: Some(*span),
                syntactic: false,
            });
        }
    }
    found
}

/// Whether any document projects to JavaScript.
pub(super) fn any_javascript(req: &CheckRequest) -> bool {
    req.mapped_files
        .iter()
        .flatten()
        .any(|mapped| JAVASCRIPT.contains(&mapped.generated_extension))
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
        .any(|d| d.code == CODE && d.category == ERROR))
}

/// Tells a projection that an import of a JavaScript document is untyped, as TypeScript reads a
/// JavaScript file it does not include: `__rsvelte_check_options` gains `untypedJavaScript`.
pub(super) fn options_declaration(overlay: &Path) -> (PathBuf, String) {
    (
        overlay.join("check-options.d.ts"),
        "interface __rsvelte_check_options {\n\tuntypedJavaScript: true;\n}\n".to_owned(),
    )
}
