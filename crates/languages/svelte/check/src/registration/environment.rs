//! The project svelte-check type-checks every component in: its shims and the svelte package's
//! types.

use rsvelte_typescript_check::TypeScriptEnv;

/// What svelte-check adds to the project: its shims, the svelte package's types, and the element
/// types from the package's `svelte-html.d.ts`, or from svelte2tsx's JSX shim without one.
pub(super) fn typescript_env(
    svelte: &std::path::Path,
    content_mapper: &std::path::Path,
) -> Result<TypeScriptEnv, String> {
    let types = svelte.join("types/index.d.ts");
    // Its real path, as a document of it and the checker name it.
    let types = rsvelte_kernel::source::paths::canonicalize(&types)
        .map_err(|e| format!("{}: {e}", types.display()))?;
    let text = std::fs::read_to_string(&types).map_err(|e| format!("{}: {e}", types.display()))?;
    let element_types = svelte.join("svelte-html.d.ts");
    let (declarations, include) = if element_types.is_file() {
        (
            rsvelte_svelte_typescript_projection::SHIMS,
            vec![types.clone(), element_types],
        )
    } else {
        (
            rsvelte_svelte_typescript_projection::DECLARATIONS,
            vec![types.clone()],
        )
    };
    Ok(TypeScriptEnv {
        mapped_extension: Some(".svelte"),
        content_mapper: Some(content_mapper.to_owned()),
        declarations: vec![declarations],
        include,
        paths: package_modules(&text, &types)
            .chain([("svelte/elements".to_owned(), svelte.join("elements.d.ts"))])
            .collect(),
        replaced: vec![(types, without_any_component_module(text))],
        script_modules: vec![".svelte"],
        notes: vec![(
            1184,
            "If this is a declare statement, move it into <script context=\"module\">..</script>",
        )],
    })
}

/// Each module the package's types declare, such as `svelte/store`, read from the blanked types: a
/// module the checker found through `node_modules` would read the package's own file, whose
/// `declare module '*.svelte'` stays.
fn package_modules<'t>(
    text: &'t str,
    types: &'t std::path::Path,
) -> impl Iterator<Item = (String, std::path::PathBuf)> + 't {
    text.split("declare module '")
        .skip(1)
        .filter_map(|rest| rest.split_once('\'').map(|(name, _)| name))
        .filter(|name| *name == "svelte" || name.starts_with("svelte/"))
        .map(|name| (name.to_owned(), types.to_owned()))
}

/// svelte-check blanks the svelte package's `declare module '*.svelte'`, so an import of a
/// component that does not exist is an error instead of a component of any props.
fn without_any_component_module(mut types: String) -> String {
    let Some(start) = types.find("declare module '*.svelte' {") else {
        return types;
    };
    let end = types[start + 1..]
        .find("\n}")
        .map_or(types.len(), |at| start + 1 + at + 2);
    types.replace_range(start..end, &" ".repeat(end - start));
    types
}

#[cfg(test)]
mod tests;
