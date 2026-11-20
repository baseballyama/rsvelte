//! A directory's formatter configuration, and what each of its options means to rsvelte: one
//! table per formatter, taken from the formatter's own list of the options it knows.

use std::path::{Path, PathBuf};
use std::sync::Arc;

use ignore::gitignore::{Gitignore, GitignoreBuilder};
use serde_json::{Map, Value};

/// The formatter a configuration is written for. Its rules decide which options exist, which
/// `.editorconfig` files count, and the defaults.
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub(crate) enum Formatter {
    Oxfmt,
    Prettier,
}

/// What an option of a formatter's configuration means to rsvelte.
#[derive(Clone, Copy)]
enum Meaning {
    /// Given to the formatters, under this name of Prettier's.
    Printed(&'static str),
    /// Changes no Svelte or TypeScript output.
    NoEffect,
    /// Changes no output with a value that passes; any other value is refused.
    NoEffectWhen(fn(&Value) -> bool),
    /// rsvelte cannot print as it says, so the run is refused.
    Refused,
    /// oxfmt's files to leave, in `.gitignore` syntax, relative to the configuration.
    IgnorePatterns,
    /// oxfmt's `svelte`: `true`, or prettier-plugin-svelte's options under [`OXFMT_SVELTE`]'s
    /// names.
    Svelte,
}

use Meaning::{IgnorePatterns, NoEffect, NoEffectWhen, Printed, Refused, Svelte};

const fn printed(name: &'static str) -> (&'static str, Meaning) {
    (name, Printed(name))
}

fn is_empty_list(value: &Value) -> bool {
    value.as_array().is_some_and(Vec::is_empty)
}

fn is_true(value: &Value) -> bool {
    *value == Value::Bool(true)
}

fn only_the_svelte_plugin(value: &Value) -> bool {
    (value.as_array()).is_some_and(|plugins| plugins.iter().all(|p| p == "prettier-plugin-svelte"))
}

/// Prettier 3's options with prettier-plugin-svelte 4's (`getSupportInfo`), and the keys of its
/// configuration files. Any other name is one Prettier ignores with a warning.
const PRETTIER: &[(&str, Meaning)] = &[
    printed("arrowParens"),
    printed("bracketSameLine"),
    printed("objectWrap"),
    printed("bracketSpacing"),
    printed("semi"),
    printed("experimentalOperatorPosition"),
    printed("experimentalTernaries"),
    printed("singleQuote"),
    printed("jsxSingleQuote"),
    printed("quoteProps"),
    printed("trailingComma"),
    printed("singleAttributePerLine"),
    printed("htmlWhitespaceSensitivity"),
    printed("proseWrap"),
    printed("svelteSortOrder"),
    printed("svelteAllowShorthand"),
    printed("svelteIndentScriptAndStyle"),
    printed("checkIgnorePragma"),
    printed("endOfLine"),
    printed("insertPragma"),
    printed("printWidth"),
    printed("rangeEnd"),
    printed("rangeStart"),
    printed("requirePragma"),
    printed("tabWidth"),
    printed("useTabs"),
    printed("embeddedLanguageFormatting"),
    ("vueIndentScriptAndStyle", NoEffect),
    ("svelte5CompilerPath", NoEffect),
    ("cursorOffset", NoEffect),
    ("filepath", NoEffect),
    ("$schema", NoEffect),
    ("plugins", NoEffectWhen(only_the_svelte_plugin)),
    ("overrides", NoEffectWhen(is_empty_list)),
    ("parser", Refused),
];

/// oxfmt's options (its `configuration_schema.json`), with the names earlier releases knew.
const OXFMT: &[(&str, Meaning)] = &[
    printed("arrowParens"),
    printed("bracketSameLine"),
    printed("bracketSpacing"),
    printed("embeddedLanguageFormatting"),
    printed("endOfLine"),
    printed("experimentalOperatorPosition"),
    printed("htmlWhitespaceSensitivity"),
    printed("jsxSingleQuote"),
    printed("objectWrap"),
    printed("printWidth"),
    printed("proseWrap"),
    printed("quoteProps"),
    printed("semi"),
    printed("singleAttributePerLine"),
    printed("singleQuote"),
    printed("tabWidth"),
    printed("trailingComma"),
    printed("useTabs"),
    ("ignorePatterns", IgnorePatterns),
    ("svelte", Svelte),
    ("$schema", NoEffect),
    ("vueIndentScriptAndStyle", NoEffect),
    ("astro", NoEffect),
    ("sortPackageJson", NoEffect),
    ("experimentalSortPackageJson", NoEffect),
    ("insertFinalNewline", NoEffectWhen(is_true)),
    ("overrides", NoEffectWhen(is_empty_list)),
    ("associations", Refused),
    ("jsdoc", Refused),
    ("sortImports", Refused),
    ("experimentalSortImports", Refused),
    ("sortTailwindcss", Refused),
    ("experimentalTailwindcss", Refused),
];

/// oxfmt's `svelte` options, under prettier-plugin-svelte's names.
const OXFMT_SVELTE: &[(&str, &str)] = &[
    ("sortOrder", "svelteSortOrder"),
    ("allowShorthand", "svelteAllowShorthand"),
    ("indentScriptAndStyle", "svelteIndentScriptAndStyle"),
];

impl Formatter {
    const fn options(self) -> &'static [(&'static str, Meaning)] {
        match self {
            Self::Oxfmt => OXFMT,
            Self::Prettier => PRETTIER,
        }
    }

    /// The defaults that differ from Prettier's, which the formatters start from.
    pub(crate) const fn defaults(self) -> &'static [(&'static str, u64)] {
        match self {
            Self::Oxfmt => &[("printWidth", 100)],
            Self::Prettier => &[],
        }
    }
}

/// Each directory is searched in this order, and the first file found is its configuration: an
/// oxfmt configuration comes before a Prettier one.
const FILES: &[(&str, Formatter, Format)] = &[
    (".oxfmtrc.json", Formatter::Oxfmt, Format::Json),
    (".oxfmtrc.jsonc", Formatter::Oxfmt, Format::Jsonc),
    ("oxfmt.config.ts", Formatter::Oxfmt, Format::Unread),
    (".prettierrc", Formatter::Prettier, Format::Json),
    (".prettierrc.json", Formatter::Prettier, Format::Json),
    (".prettierrc.json5", Formatter::Prettier, Format::Unread),
    (".prettierrc.yaml", Formatter::Prettier, Format::Unread),
    (".prettierrc.yml", Formatter::Prettier, Format::Unread),
    (".prettierrc.toml", Formatter::Prettier, Format::Unread),
    (".prettierrc.js", Formatter::Prettier, Format::Unread),
    (".prettierrc.cjs", Formatter::Prettier, Format::Unread),
    (".prettierrc.mjs", Formatter::Prettier, Format::Unread),
    (".prettierrc.ts", Formatter::Prettier, Format::Unread),
    (".prettierrc.cts", Formatter::Prettier, Format::Unread),
    (".prettierrc.mts", Formatter::Prettier, Format::Unread),
    ("prettier.config.js", Formatter::Prettier, Format::Unread),
    ("prettier.config.cjs", Formatter::Prettier, Format::Unread),
    ("prettier.config.mjs", Formatter::Prettier, Format::Unread),
    ("prettier.config.ts", Formatter::Prettier, Format::Unread),
    ("prettier.config.cts", Formatter::Prettier, Format::Unread),
    ("prettier.config.mts", Formatter::Prettier, Format::Unread),
];

#[derive(Clone, Copy)]
enum Format {
    Json,
    Jsonc,
    /// YAML, TOML, JSON5 or JavaScript, which rsvelte does not read.
    Unread,
}

/// One configuration file, read once. What rsvelte cannot read or honor in it is kept as its
/// refusal, which counts only for the files that take its options.
#[derive(Debug)]
pub(crate) struct Configuration {
    pub(crate) source: Arc<Path>,
    pub(crate) formatter: Formatter,
    pub(crate) options: Options,
    ignore: Option<Gitignore>,
}

/// The options a configuration gives, under Prettier's names.
#[derive(Debug, Default)]
pub(crate) struct Options {
    /// Each option's name, the name it has in the configuration, and its value.
    pub(crate) printed: Vec<(String, String, Value)>,
    /// The names the formatter does not know, which it ignores.
    pub(crate) unknown: Vec<String>,
    /// Why rsvelte cannot format as the configuration says.
    pub(crate) refused: Option<String>,
}

impl Configuration {
    /// The configuration of `formatter` in `directory`, if it has one. A `package.json` that
    /// does not parse is not a configuration, as Prettier skips it.
    pub(crate) fn find(directory: &Path, formatter: Formatter) -> Option<Self> {
        for &(name, _, format) in FILES.iter().filter(|&&(_, f, _)| f == formatter) {
            let source = directory.join(name);
            if source.is_file() {
                let read = read(&source, format);
                return Some(Self::new(source, formatter, read));
            }
        }
        if formatter == Formatter::Oxfmt {
            return None;
        }
        let manifest = directory.join("package.json");
        let text = std::fs::read_to_string(&manifest).ok()?;
        let mut package: Map<String, Value> = serde_json::from_str(&text).ok()?;
        let options = match package.remove("prettier")? {
            Value::Object(options) => Ok(options),
            _ => Err("rsvelte does not read a shared Prettier configuration yet".to_owned()),
        };
        Some(Self::new(manifest, formatter, options))
    }

    fn new(
        source: PathBuf,
        formatter: Formatter,
        read: Result<Map<String, Value>, String>,
    ) -> Self {
        let (mut options, patterns) = match read {
            Ok(options) => meaning(formatter, options),
            Err(error) => (
                Options {
                    refused: Some(error),
                    ..Options::default()
                },
                Vec::new(),
            ),
        };
        let ignore = match ignore(&source, &patterns) {
            Ok(ignore) => ignore,
            Err(error) => {
                (options.refused).get_or_insert_with(|| format!("ignorePatterns: {error}"));
                None
            }
        };
        Self {
            source: source.into(),
            formatter,
            options,
            ignore,
        }
    }

    /// Whether its `ignorePatterns` leave `path`, a directory when `directory`.
    pub(crate) fn ignores(&self, path: &Path, directory: bool) -> bool {
        self.ignore.as_ref().is_some_and(|ignore| {
            path.starts_with(ignore.path())
                && ignore
                    .matched_path_or_any_parents(path, directory)
                    .is_ignore()
        })
    }
}

/// The names of oxfmt's configuration files.
pub(crate) fn oxfmt_file_names() -> impl Iterator<Item = &'static str> {
    (FILES.iter())
        .filter(|&&(_, formatter, _)| formatter == Formatter::Oxfmt)
        .map(|&(name, ..)| name)
}

fn read(path: &Path, format: Format) -> Result<Map<String, Value>, String> {
    let mut text = match format {
        Format::Unread => {
            return Err("rsvelte reads only JSON formatter configurations so far".to_owned());
        }
        Format::Json | Format::Jsonc => std::fs::read_to_string(path).map_err(|e| e.to_string())?,
    };
    if matches!(format, Format::Jsonc) {
        json_strip_comments::strip(&mut text).map_err(|e| e.to_string())?;
    }
    serde_json::from_str(&text)
        .map_err(|e| format!("{e} (rsvelte reads only JSON formatter configurations so far)"))
}

/// The options and the `ignorePatterns` of a configuration, by the formatter's table.
fn meaning(formatter: Formatter, options: Map<String, Value>) -> (Options, Vec<String>) {
    let mut result = Options::default();
    let mut patterns = Vec::new();
    let mut refuse = |reason: String| {
        result.refused.get_or_insert(reason);
    };
    let mut printed = Vec::new();
    let mut unknown = Vec::new();
    // `null` leaves an option unset, as in oxfmt.
    for (name, value) in options.into_iter().filter(|(_, value)| !value.is_null()) {
        let found = formatter
            .options()
            .iter()
            .find(|&&(known, _)| known == name);
        match found.map(|&(_, meaning)| meaning) {
            None => unknown.push(name),
            Some(Printed(as_named)) => printed.push((as_named.to_owned(), name, value)),
            Some(NoEffect) => {}
            Some(NoEffectWhen(passes)) if passes(&value) => {}
            Some(NoEffectWhen(_) | Refused) => {
                refuse(format!("rsvelte does not format with this `{name}` yet"));
            }
            Some(IgnorePatterns) => match serde_json::from_value(value) {
                Ok(read) => patterns = read,
                Err(e) => refuse(format!("ignorePatterns: {e}")),
            },
            Some(Svelte) => match value {
                Value::Bool(true) => {}
                Value::Object(plugin) => {
                    for (name, value) in plugin.into_iter().filter(|(_, value)| !value.is_null()) {
                        match OXFMT_SVELTE.iter().find(|&&(oxfmt, _)| oxfmt == name) {
                            Some(&(_, as_named)) => {
                                printed.push((
                                    as_named.to_owned(),
                                    format!("svelte.{name}"),
                                    value,
                                ));
                            }
                            None => unknown.push(format!("svelte.{name}")),
                        }
                    }
                }
                _ => refuse(format!("rsvelte does not format with this `{name}` yet")),
            },
        }
    }
    result.printed = printed;
    result.unknown = unknown;
    (result, patterns)
}

fn ignore(source: &Path, patterns: &[String]) -> Result<Option<Gitignore>, String> {
    if patterns.is_empty() {
        return Ok(None);
    }
    let root = source.parent().unwrap_or_else(|| Path::new("."));
    let mut builder = GitignoreBuilder::new(root);
    for pattern in patterns {
        builder.add_line(None, pattern).map_err(|e| e.to_string())?;
    }
    builder.build().map(Some).map_err(|e| e.to_string())
}

#[cfg(test)]
pub(crate) fn printed_names() -> impl Iterator<Item = &'static str> {
    [PRETTIER, OXFMT]
        .into_iter()
        .flatten()
        .filter_map(|&(_, meaning)| match meaning {
            Printed(name) => Some(name),
            _ => None,
        })
        .chain(OXFMT_SVELTE.iter().map(|&(_, name)| name))
}
