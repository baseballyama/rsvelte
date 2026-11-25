//! The untyped imports that read an ambient module instead. Where an import reaches no file that
//! TypeScript loads, it reads the module whose pattern, such as `declare module '*.svelte'`,
//! matches the specifier best, and reports TS7016 only without one. The checker loads every
//! content-mapped document, so a probe imports each specifier again in the project without its
//! content mappers, from a directory where no relative specifier reaches a file.

use std::path::{Component, Path, PathBuf};

use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_typescript_api::{Layer, Session};

use super::UntypedImport;

const DIRECTORY: &str = "ambient";
const PROBE: &str = "ambient-probe.ts";
const CONFIG: &str = "ambient-probe.json";

/// Drops each of `untyped` whose specifier an ambient module's pattern matches. The probe's
/// project has the overlay's `roots` but those of a content-mapped `extension`; `config` gives the
/// text of its tsconfig, without the content mappers, from its roots.
///
/// # Errors
/// The checker fails.
pub(in crate::check::run) fn drop_matched(
    session: &mut Session,
    layer: &mut Layer,
    overlay: &Path,
    (roots, extensions): (&[PathBuf], &[&str]),
    config: &dyn Fn(&[PathBuf]) -> String,
    untyped: &mut Vec<UntypedImport<'_>>,
) -> Result<(), String> {
    if untyped.is_empty() {
        return Ok(());
    }
    // Below as many directories as a specifier goes up, its `..` stays where no file is.
    let up = (untyped.iter())
        .map(|untyped| parents(&untyped.import.specifier))
        .fold(0, usize::max);
    let mut probe = overlay.join(DIRECTORY);
    for _ in 0..=up {
        probe.push("_");
    }
    probe.push(PROBE);
    let (text, positions) = probe_text(untyped);
    let unmapped = (roots.iter()).filter(|root| {
        let name = root.as_os_str().to_string_lossy();
        !extensions.iter().any(|extension| name.ends_with(extension))
    });
    let roots: Vec<PathBuf> = std::iter::once(probe.clone())
        .chain(unmapped.cloned())
        .collect();
    let config_path = overlay.join(CONFIG);
    layer.files.insert(config_path.clone(), config(&roots));
    layer.files.insert(probe.clone(), text);
    let project = (session.open(&[&config_path], layer)?.into_iter().next())
        .ok_or("the checker opened no ambient probe")?;
    let modules = session.modules_at(&project, &probe, &positions)?;
    session.release(project.snapshot)?;
    let mut modules = modules.into_iter();
    // A file's module is named by its absolute path, an ambient module by its name.
    untyped.retain(|_| {
        !modules
            .next()
            .flatten()
            .is_some_and(|module| module.is_relative())
    });
    Ok(())
}

/// How many directories `specifier` goes up.
fn parents(specifier: &str) -> usize {
    (Path::new(specifier).components())
        .filter(|c| *c == Component::ParentDir)
        .count()
}

/// The probe, one import of each specifier of `untyped`, and where the checker reads each
/// specifier, in UTF-16 code units.
fn probe_text(untyped: &[UntypedImport<'_>]) -> (String, Vec<u32>) {
    let mut text = String::new();
    let mut positions = Vec::with_capacity(untyped.len());
    let mut units = 0;
    for untyped in untyped {
        let mut literal = StructuredDataWriter::new(false);
        literal.write_string(&untyped.import.specifier);
        let line = format!("import {};\n", literal.finish());
        // Inside the string literal, after `import "`.
        positions.push(units + 8);
        units += line.encode_utf16().count() as u32;
        text.push_str(&line);
    }
    (text, positions)
}
