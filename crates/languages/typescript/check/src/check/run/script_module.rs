//! An import of `./x.svelte` that reads the script `x.svelte.ts`. Under `node16` and `nodenext`,
//! TypeScript appends no extension to an ESM import, so it finds the script only through the
//! declaration `x.d.svelte.ts` it looks for beside an arbitrary extension; the checker's file
//! layer holds one for each such script. Elsewhere TypeScript reads that declaration before the
//! script, so the layer holds none.

use std::path::{Path, PathBuf};

use rsvelte_typescript_api::Layer;

use super::CheckRequest;

/// The specifier's extension for each script extension, as a declaration re-exports the script.
const SCRIPTS: &[(&str, &str)] = &[
    (".ts", ".js"),
    (".js", ".js"),
    (".mts", ".mjs"),
    (".mjs", ".mjs"),
    (".cts", ".cjs"),
    (".cjs", ".cjs"),
];

/// Adds to `layer` the declaration of each script among `roots` and the checked `paths` that
/// `req`'s languages import by a document's name, and says whether it added any.
pub(super) fn add(
    layer: &mut Layer,
    roots: &[PathBuf],
    paths: &[PathBuf],
    req: &CheckRequest<'_>,
) -> bool {
    let found = declarations(
        roots.iter().chain(paths),
        &req.env.script_modules,
        &|path| {
            path.exists()
                || paths.iter().any(|p| p == path)
                || layer.files.iter().any(|(p, _)| p == path)
        },
    );
    let any = !found.is_empty();
    layer.files.extend(found);
    any
}

/// The declaration an import of each of `scripts` named `x<suffix><extension>` reads as
/// `x<suffix>`, with its text, unless the project holds that declaration or the document
/// `x<suffix>` itself.
pub(super) fn declarations<'a>(
    scripts: impl IntoIterator<Item = &'a PathBuf>,
    suffixes: &[&str],
    taken: &dyn Fn(&Path) -> bool,
) -> Vec<(PathBuf, String)> {
    let mut found: Vec<(PathBuf, String)> = Vec::new();
    for script in scripts {
        let Some(name) = script.file_name().and_then(|n| n.to_str()) else {
            continue;
        };
        let Some((stem, suffix, specifier)) = suffixes.iter().find_map(|suffix| {
            SCRIPTS.iter().find_map(|(extension, specifier)| {
                let stem = name.strip_suffix(extension)?.strip_suffix(suffix)?;
                // `x.d.svelte.ts` is such a declaration, not a script.
                let declaration = Path::new(stem)
                    .extension()
                    .is_some_and(|e| e.eq_ignore_ascii_case("d"));
                (!declaration).then_some((stem, *suffix, *specifier))
            })
        }) else {
            continue;
        };
        let declaration = script.with_file_name(format!("{stem}.d{suffix}.ts"));
        if taken(&script.with_file_name(format!("{stem}{suffix}")))
            || taken(&declaration)
            || found.iter().any(|(path, _)| *path == declaration)
        {
            continue;
        }
        let module = format!("'./{stem}{suffix}{specifier}'");
        let text = format!("export * from {module};\nexport {{ default }} from {module};\n");
        found.push((declaration, text));
    }
    found
}

#[cfg(test)]
mod tests;
