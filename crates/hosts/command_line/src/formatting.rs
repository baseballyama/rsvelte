//! A project's formatter configuration, `.oxfmtrc.json(c)` or Prettier's, read as the options of
//! `svelte.format` and `typescript.format`, so that `rsvelte format` prints what the project's
//! formatter prints or refuses to run.

use std::path::{Path, PathBuf};

use serde_json::{Map, Value};

/// Each directory is searched in this order, and the first directory with one of these wins.
const OXFMT: &[&str] = &[".oxfmtrc.json", ".oxfmtrc.jsonc"];
const PRETTIER: &[&str] = &[".prettierrc", ".prettierrc.json"];
/// Configurations that would need YAML, TOML, JSON5 or JavaScript: refused, not skipped, since
/// the project's formatter reads them.
const UNREAD: &[&str] = &[
    "oxfmt.config.ts",
    ".prettierrc.json5",
    ".prettierrc.yaml",
    ".prettierrc.yml",
    ".prettierrc.toml",
    ".prettierrc.js",
    ".prettierrc.cjs",
    ".prettierrc.mjs",
    ".prettierrc.ts",
    ".prettierrc.cts",
    ".prettierrc.mts",
    "prettier.config.js",
    "prettier.config.cjs",
    "prettier.config.mjs",
    "prettier.config.ts",
    "prettier.config.cts",
    "prettier.config.mts",
];

/// Options that change no Svelte or TypeScript output.
const OTHER_LANGUAGES: &[&str] = &[
    "$schema",
    "sortPackageJson",
    "experimentalSortPackageJson",
    "vueIndentScriptAndStyle",
    "astro",
];

#[derive(Debug, PartialEq)]
pub(crate) struct Formatting {
    pub(crate) source: PathBuf,
    /// The options of `svelte.format` and of `typescript.format`, as JSON.
    pub(crate) svelte: String,
    pub(crate) typescript: String,
    /// `ignorePatterns`, in `.gitignore` syntax, relative to the directory of `source`.
    pub(crate) ignore_patterns: Vec<String>,
}

#[derive(Clone, Copy)]
enum Kind {
    Oxfmt,
    Prettier,
}

/// The configuration of the nearest directory from `start` upward that has one.
pub(crate) fn find(start: &Path) -> Result<Option<Formatting>, String> {
    for directory in start.ancestors() {
        let found = |name: &&&str| directory.join(name).is_file();
        if let Some(name) = OXFMT.iter().find(found) {
            return read(&directory.join(name), Kind::Oxfmt).map(Some);
        }
        if let Some(name) = PRETTIER.iter().find(found) {
            return read(&directory.join(name), Kind::Prettier).map(Some);
        }
        if let Some(name) = UNREAD.iter().find(found) {
            return Err(format!(
                "{}: rsvelte reads only JSON formatter configurations so far",
                directory.join(name).display()
            ));
        }
        let manifest = directory.join("package.json");
        if manifest.is_file() {
            let text = std::fs::read_to_string(&manifest)
                .map_err(|e| format!("{}: {e}", manifest.display()))?;
            let mut package: Map<String, Value> =
                serde_json::from_str(&text).map_err(|e| format!("{}: {e}", manifest.display()))?;
            match package.remove("prettier") {
                Some(Value::Object(options)) => {
                    return translate(&manifest, Kind::Prettier, options).map(Some);
                }
                Some(_) => {
                    return Err(format!(
                        "{}: rsvelte does not read a shared Prettier configuration yet",
                        manifest.display()
                    ));
                }
                None => {}
            }
        }
    }
    Ok(None)
}

fn read(path: &Path, kind: Kind) -> Result<Formatting, String> {
    let mut text = std::fs::read_to_string(path).map_err(|e| format!("{}: {e}", path.display()))?;
    if matches!(kind, Kind::Oxfmt) {
        json_strip_comments::strip(&mut text).map_err(|e| format!("{}: {e}", path.display()))?;
    }
    let options: Map<String, Value> = serde_json::from_str(&text).map_err(|e| {
        format!(
            "{}: {e} (rsvelte reads only JSON formatter configurations so far)",
            path.display()
        )
    })?;
    translate(path, kind, options)
}

fn translate(source: &Path, kind: Kind, options: Map<String, Value>) -> Result<Formatting, String> {
    let refuse = |name: &str| {
        Err(format!(
            "{}: rsvelte does not format with this `{name}` yet",
            source.display()
        ))
    };
    let mut svelte = Map::new();
    let mut ignore_patterns = Vec::new();
    if matches!(kind, Kind::Oxfmt) {
        // oxfmt's default; Prettier's is 80.
        svelte.insert("printWidth".to_owned(), Value::from(100));
    }
    for (name, value) in options {
        match (kind, name.as_str()) {
            (_, name) if OTHER_LANGUAGES.contains(&name) => {}
            (Kind::Oxfmt, "ignorePatterns") => {
                ignore_patterns = serde_json::from_value(value)
                    .map_err(|e| format!("{}: ignorePatterns: {e}", source.display()))?;
            }
            (Kind::Oxfmt, "svelte") => match value {
                Value::Bool(true) => {}
                Value::Object(plugin) => svelte.extend(plugin),
                _ => return refuse("svelte"),
            },
            (Kind::Oxfmt, "insertFinalNewline") if value == Value::Bool(true) => {}
            (Kind::Prettier, "plugins")
                if value.as_array().is_some_and(|plugins| {
                    plugins.iter().all(|p| p == "prettier-plugin-svelte")
                }) => {}
            (_, "overrides") if value.as_array().is_some_and(Vec::is_empty) => {}
            (
                _,
                "plugins"
                | "overrides"
                | "insertFinalNewline"
                | "sortImports"
                | "experimentalSortImports"
                | "sortTailwindcss"
                | "experimentalTailwindcss"
                | "jsdoc"
                | "associations"
                | "svelte",
            ) => return refuse(&name),
            _ => {
                svelte.insert(name, value);
            }
        }
    }
    let typescript: Map<String, Value> = (svelte.iter())
        .filter(|(name, _)| rsvelte_typescript_format::options::NAMES.contains(&name.as_str()))
        .map(|(name, value)| (name.clone(), value.clone()))
        .collect();
    Ok(Formatting {
        source: source.to_owned(),
        svelte: Value::Object(svelte).to_string(),
        typescript: Value::Object(typescript).to_string(),
        ignore_patterns,
    })
}

#[cfg(test)]
mod tests;
