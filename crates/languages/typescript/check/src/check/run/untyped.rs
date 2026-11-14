//! TS7016 for an import of a content-mapped JavaScript document. The checker reads every mapped
//! document as typed, whatever its generated extension, so it never reports this itself; a probe
//! asks whether the project's options would report it for a plain JavaScript file.

use std::path::{Path, PathBuf};

use rsvelte_typescript_api::{DiagnosticKind, Project, Session};

use super::mapped::normalized;
use super::{ERROR, TypeScriptDiagnostic};
use crate::check::CheckRequest;

/// The probe's name in the overlay, and the JavaScript file it imports, whose name differs, since
/// `./probe.js` would read `probe.ts`.
const PROBE: (&str, &str) = ("untyped-probe.ts", "untyped.js");

/// `Could not find a declaration file for module '{0}'. '{1}' implicitly has an 'any' type.`
pub(super) const CODE: u32 = 7016;

const JAVASCRIPT: &[&str] = &[".js", ".jsx", ".mjs", ".cjs"];

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

/// The probe and the JavaScript file it imports, in the overlay.
pub(super) fn probe(overlay: &Path) -> [(PathBuf, String); 2] {
    [
        (
            overlay.join(PROBE.0),
            format!(
                "import untyped from './{}';\nexport default untyped;\n",
                PROBE.1
            ),
        ),
        (overlay.join(PROBE.1), "export default 1;\n".to_owned()),
    ]
}

/// The findings, when the project's options report TS7016 for the probe's import.
pub(super) fn reported(
    session: &mut Session,
    project: &Project,
    probe: Option<&[(PathBuf, String); 2]>,
    found: Vec<TypeScriptDiagnostic>,
) -> Result<Vec<TypeScriptDiagnostic>, String> {
    let Some([(probe, _), _]) = probe else {
        return Ok(found);
    };
    let reported = session
        .diagnostics(project, DiagnosticKind::Semantic, Some(&[probe.as_path()]))?
        .iter()
        .any(|d| d.code == CODE && d.category == ERROR);
    Ok(if reported { found } else { Vec::new() })
}
