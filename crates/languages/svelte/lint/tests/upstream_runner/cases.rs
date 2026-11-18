//! Where the cases are and how each is configured, read as upstream's `loadTestCases` reads them.

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;

use rsvelte_svelte_lint::{SvelteConfig, Warning, WarningHandler};

use super::{Case, read};

/// `listupInput` over each rule's `valid/` and `invalid/`. A rule is a directory with either.
pub(super) fn cases(root: &Path) -> Vec<Case<'_>> {
    let mut out = Vec::new();
    let mut directories = vec![root.to_path_buf()];
    while let Some(directory) = directories.pop() {
        let valid = directory.join("valid");
        let invalid = directory.join("invalid");
        if valid.is_dir() || invalid.is_dir() {
            let rule = directory
                .strip_prefix(root)
                .expect("under the root")
                .to_str()
                .expect("UTF-8 path")
                .to_owned();
            for (path, is_invalid) in [(valid, false), (invalid, true)] {
                if path.is_dir() {
                    for input in inputs(&path) {
                        out.push(Case {
                            root,
                            rule: rule.clone(),
                            invalid: is_invalid,
                            input,
                        });
                    }
                }
            }
        } else {
            directories.extend(entries(&directory).into_iter().filter(|p| p.is_dir()));
        }
    }
    out.sort_by(|a, b| a.input.cmp(&b.input));
    out
}

pub(super) fn inputs(directory: &Path) -> Vec<PathBuf> {
    let mut out = Vec::new();
    for path in entries(directory) {
        let name = path
            .file_name()
            .and_then(|n| n.to_str())
            .expect("UTF-8 name");
        if name.starts_with('_') {
            continue;
        }
        let base = &name[..name.len() - suffix(name).len()];
        if base.ends_with("input") || base.starts_with('+') {
            out.push(path);
        } else if path.is_dir() {
            out.extend(inputs(&path));
        }
    }
    out
}

pub(super) fn entries(directory: &Path) -> Vec<PathBuf> {
    let mut out: Vec<PathBuf> = std::fs::read_dir(directory)
        .expect("readable directory")
        .map(|entry| entry.expect("readable entry").path())
        .collect();
    out.sort();
    out
}

/// `fileNameSuffix`: `.svelte.js` and `.svelte.ts` count as one extension.
pub(super) fn suffix(name: &str) -> &str {
    if name.ends_with(".svelte.js") || name.ends_with(".svelte.ts") {
        return &name[name.len() - 10..];
    }
    // `path.extname`: a leading dot alone is not an extension.
    match name.rfind('.') {
        Some(at) if at > 0 => &name[at..],
        _ => "",
    }
}

/// `inputFile.replace(/(input|\+.+)(?:\.[a-z]+)+$/u, replacement)`.
pub(super) fn sibling(input: &Path, replacement: &str) -> PathBuf {
    let text = input.to_str().expect("UTF-8 path");
    let extensions = |rest: &str| {
        rest.starts_with('.')
            && rest[1..]
                .split('.')
                .all(|part| !part.is_empty() && part.bytes().all(|b| b.is_ascii_lowercase()))
    };
    let last_dot = text.rfind('.');
    let at = (0..text.len())
        .find(|&i| {
            text.is_char_boundary(i)
                && ((text[i..].starts_with("input") && extensions(&text[i + 5..]))
                    || (text[i..].starts_with('+')
                        && last_dot.is_some_and(|dot| dot >= i + 2 && extensions(&text[dot..]))))
        })
        .expect("an input file name");
    PathBuf::from(format!("{}{replacement}", &text[..at]))
}

pub(super) fn requirements_hold(input: &Path, versions: &BTreeMap<String, String>) -> bool {
    let mut file = sibling(input, "requirements.json");
    if !file.exists() {
        file = input.with_file_name("_requirements.json");
    }
    if !file.exists() {
        return true;
    }
    let requirements: BTreeMap<String, String> =
        serde_json::from_str(&read(&file)).expect("requirements are a JSON object of strings");
    requirements
        .iter()
        .filter(|(package, _)| package.as_str() != "FIXME")
        .all(|(package, range)| {
            let version = semver::Version::parse(
                versions
                    .get(package)
                    .unwrap_or_else(|| panic!("UPSTREAM.json has no version of {package}")),
            )
            .expect("a version");
            // node-semver: `||` separates alternatives, spaces separate comparators.
            range.split("||").any(|alternative| {
                let comparators = alternative
                    .split_whitespace()
                    .collect::<Vec<_>>()
                    .join(", ");
                semver::VersionReq::parse(&comparators)
                    .unwrap_or_else(|e| panic!("{package} {range}: {e}"))
                    .matches(&version)
            })
        })
}

/// `getConfig`: the first of these that exists.
pub(super) fn config(input: &Path, directory: &Path) -> Option<PathBuf> {
    [
        sibling(input, "config.json"),
        directory.join("_config.json"),
        sibling(input, "config.js"),
        directory.join("_config.js"),
        sibling(input, "config.cjs"),
        directory.join("_config.cjs"),
    ]
    .into_iter()
    .find(|path| path.exists())
}

/// The `svelte.config.js` of a case's `_config.cjs` (`languageOptions.parserOptions.svelteConfig`),
/// as the Rust its JavaScript amounts to; the host builds the same from a project's
/// `svelte.config.js`. `None` for a configuration not written here.
pub(super) fn javascript_config(path: &Path, root: &Path) -> Option<SvelteConfig> {
    let relative = path.strip_prefix(root).ok()?.to_str()?;
    let drop_missing_attribute = || {
        Some(WarningHandler(Arc::new(|warning: Warning| {
            (warning.code != "a11y_missing_attribute" && warning.code != "a11y-missing-attribute")
                .then_some(warning)
        })))
    };
    let on_warning = match relative {
        // `onwarn(warning, handler) { if (warning.code === 'a11y_missing_attribute' ||
        // warning.code === 'a11y-missing-attribute') return; handler(warning); }`, and
        // `warningFilter: (warning) => warning.code !== 'a11y_missing_attribute' && warning.code
        // !== 'a11y-missing-attribute'`.
        "valid-compile/valid/svelte-config-onwarn/_config.cjs"
        | "valid-compile/invalid/svelte-config-onwarn/_config.cjs"
        | "valid-compile/valid/svelte-config-warning-filter/_config.cjs"
        | "valid-compile/invalid/svelte-config-warning-filter/_config.cjs" => {
            drop_missing_attribute()
        }
        // `onwarn(warning, handler) { handler({ ...warning, message: warning.message, code: 'foo'
        // }); }`
        "valid-compile/invalid/svelte-config-custom-warn/_config.cjs" => {
            Some(WarningHandler(Arc::new(|warning: Warning| {
                Some(Warning {
                    code: "foo".to_owned(),
                    ..warning
                })
            })))
        }
        // `compilerOptions: { experimental: { async: true } }`
        "valid-compile/valid/svelte-config-experimental-async/_config.cjs" => {
            return Some(SvelteConfig {
                experimental_async: true,
                ..SvelteConfig::default()
            });
        }
        _ => return None,
    };
    Some(SvelteConfig {
        on_warning,
        ..SvelteConfig::default()
    })
}

/// A `svelte.config.js` that `svelte-eslint-parser` would load for the input: in its directory or
/// one above it, up to the fixture root.
pub(super) fn svelte_config_file(input: &Path, root: &Path) -> Option<PathBuf> {
    input
        .ancestors()
        .skip(1)
        .take_while(|directory| directory.starts_with(root) && *directory != root)
        .map(|directory| directory.join("svelte.config.js"))
        .find(|path| path.exists())
}
