//! Resolve the project's oxfmt config (`.oxfmtrc.json` / `.oxfmtrc.jsonc` /
//! `oxfmt.config.ts` / `oxfmt.config.mts`) and apply it to the inline
//! `<script>` / `<style>` formatting paths.
//!
//! Standalone files delegated to `oxfmt` already discover `.oxfmtrc` from the
//! working directory, but inline `<script>` blocks are formatted in-process by
//! `oxc_formatter` (which knows nothing about `.oxfmtrc`) and inline `<style>`
//! blocks are staged into a temp dir (where `oxfmt`'s own discovery can't find
//! the project config). Both end up formatted with defaults — e.g. ignoring
//! `singleQuote: true` and flipping every string to double quotes. See #693.
//!
//! We mirror oxfmt's behavior: search upward from the working directory for the
//! nearest config file (the same place oxfmt looks for `--stdin-filepath`),
//! parse the keys `oxc_formatter` can honor, and layer them onto the JS options
//! used for inline `<script>`. The resolved path is also handed to every child
//! `oxfmt` invocation via `-c` so inline `<style>` blocks use it too — except a
//! TS config, where [`OxfmtConfig::oxfmt_arg_path`] hands over a materialized
//! `.oxfmtrc.json` instead, since the pure-Rust `oxfmt` CLI can't evaluate
//! `.ts`/`.mts` itself (see [`crate::ts_config`]).

use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};

use oxc_formatter::{
    ArrowParentheses, JsFormatOptions, QuoteProperties, QuoteStyle, Semicolons, SortImportsOptions,
    SortOrder, TrailingCommas,
};
use oxc_formatter_core::{IndentStyle, IndentWidth, LineEnding, LineWidth};

use crate::ts_config;

/// Config file names oxfmt recognises, in the order it prefers them:
/// JSON, then JSONC, then the JS/TS names (mirrors oxc_config's
/// `ConfigDiscovery::config_file_names` — `apps/oxfmt/src/core/config/mod.rs`
/// upstream). A directory holding more than one of these is a conflict oxfmt
/// itself refuses to resolve; we mirror that by erroring instead of silently
/// picking one (see [`find_upward`]).
const CONFIG_NAMES: &[&str] = &[
    ".oxfmtrc.json",
    ".oxfmtrc.jsonc",
    "oxfmt.config.ts",
    "oxfmt.config.mts",
];

/// The subset of `.oxfmtrc` keys that affect JS/TS formatting and that
/// `oxc_formatter` can honor. Every field is `Option` so an absent key leaves
/// the corresponding `JsFormatOptions` value untouched.
#[derive(Debug, Default, Clone)]
pub struct OxfmtConfig {
    /// Path the config was read from — a `.oxfmtrc.json`/`.jsonc`,
    /// `oxfmt.config.ts`/`.mts`, or an explicit `--config` path. Used as the
    /// directory basis for resolving `ignorePatterns` / `overrides` globs and
    /// Tailwind's `sortTailwindcss` base dir ([`Self::config_dir`]), and for
    /// cheap "did the config change" checks. **Not** what gets forwarded to
    /// child `oxfmt` invocations — use [`Self::oxfmt_arg_path`] for that.
    pub path: Option<PathBuf>,
    /// The path to force via child `oxfmt` invocations' `-c` flag. Equal to
    /// [`Self::path`] for a JSON/JSONC config; for a TS/MTS config it is a
    /// temp file holding the statically-evaluated config serialized as JSON,
    /// because the pure-Rust `oxfmt` CLI errors on a `.ts`/`.mts` `-c` path
    /// (it has no embedded JS runtime to evaluate one — see
    /// [`crate::ts_config`]). Materializing it once here means rsvelte's own
    /// evaluation and oxfmt's own semantics can never disagree.
    pub oxfmt_arg_path: Option<PathBuf>,
    pub single_quote: Option<bool>,
    pub semi: Option<bool>,
    pub trailing_comma: Option<TrailingCommas>,
    pub quote_props: Option<QuoteProperties>,
    pub arrow_parens: Option<ArrowParentheses>,
    pub bracket_spacing: Option<bool>,
    pub bracket_same_line: Option<bool>,
    pub print_width: Option<u16>,
    pub tab_width: Option<u8>,
    pub use_tabs: Option<bool>,
    pub end_of_line: Option<LineEnding>,
    /// Glob patterns from `.oxfmtrc`'s `ignorePatterns`. Used to exclude
    /// matching `.svelte` files from the in-process walk so coverage matches
    /// `oxfmt` (which applies them to the non-`.svelte` files it walks itself).
    /// Resolved relative to the config file's directory, like oxfmt.
    pub ignore_patterns: Vec<String>,
    /// Per-file option overrides (`.oxfmtrc`'s `overrides`). Each entry's
    /// `files` globs select which files its `options` apply to; matching
    /// overrides are merged onto the base in source order (prettier semantics).
    /// Used by the native `.ts`/`.js` path to format each file at the same
    /// options `oxfmt` would.
    pub overrides: Vec<OverrideConfig>,

    /// Prettier's `singleAttributePerLine` — force every attribute of a
    /// multi-attribute element onto its own line.
    pub single_attribute_per_line: Option<bool>,
    /// prettier-plugin-svelte's `svelteAllowShorthand` (the `svelte.allowShorthand`
    /// key under oxfmt's `svelte` object). Default `true`.
    pub svelte_allow_shorthand: Option<bool>,
    /// prettier-plugin-svelte's `svelteIndentScriptAndStyle`
    /// (`svelte.indentScriptAndStyle`). Default `true`.
    pub svelte_indent_script_and_style: Option<bool>,
    /// prettier-plugin-svelte's `svelteSortOrder` (`svelte.sortOrder`).
    pub svelte_sort_order: Option<String>,
    /// The raw `sortImports` value (`true` / `false` / an object). Built into
    /// [`SortImportsOptions`] by [`OxfmtConfig::sort_imports_options`].
    pub sort_imports: Option<serde_json::Value>,
    /// The raw `sortTailwindcss` value (`true` / an object with
    /// `stylesheet` / `config` / `attributes` / `functions`). rsvelte-fmt can
    /// reproduce the ordering natively only for a stock, zero-config Tailwind
    /// setup (see the CLI's default-config detection); for a custom
    /// stylesheet/config it warns and leaves classes unsorted.
    pub sort_tailwindcss: Option<serde_json::Value>,
}

/// One `.oxfmtrc` `overrides` entry: globs + the option subset they apply.
#[derive(Debug, Default, Clone)]
pub struct OverrideConfig {
    /// Globs (relative to the config dir) selecting the files this applies to.
    pub files: Vec<String>,
    /// The option keys to layer onto the base for matching files.
    pub options: OxfmtConfig,
}

impl OxfmtConfig {
    /// Resolve the config: an explicit `--config` path if given, else the
    /// nearest config file searching upward from `start` (the working
    /// directory). Returns an empty config (everything `None`) when no file is
    /// found, so callers can apply it unconditionally.
    ///
    /// Errors only for a TS/MTS config (unreadable, unparsable, or containing
    /// a dynamic expression the static evaluator can't run — see
    /// [`crate::ts_config`]) or a directory holding more than one recognised
    /// config file. A JSON/JSONC config keeps the historical "best effort"
    /// policy: a read failure warns and falls back to defaults rather than
    /// aborting the whole run.
    pub fn resolve(explicit: Option<&Path>, start: &Path) -> Result<Self, String> {
        let path = match explicit {
            Some(p) => Some(p.to_path_buf()),
            None => find_upward(start)?,
        };
        let Some(path) = path else {
            return Ok(Self::default());
        };

        if ts_config::is_ts_config_path(&path) {
            return Self::resolve_ts(path);
        }

        match std::fs::read_to_string(&path) {
            Ok(src) => {
                let mut cfg = parse(&src);
                cfg.oxfmt_arg_path = Some(path.clone());
                cfg.path = Some(path);
                Ok(cfg)
            }
            Err(e) => {
                eprintln!(
                    "rsvelte-fmt: warning: could not read config {}: {e}",
                    path.display()
                );
                Ok(Self::default())
            }
        }
    }

    /// Load and statically evaluate an `oxfmt.config.ts`/`.mts` file: read +
    /// parse + evaluate to JSON ([`crate::ts_config::evaluate`]), map the
    /// result onto the same option struct a `.oxfmtrc.json` would produce via
    /// [`parse_object`], and materialize the evaluated value into a temp
    /// `.oxfmtrc.json` for [`Self::oxfmt_arg_path`] — child `oxfmt`
    /// invocations can't evaluate `.ts`/`.mts` themselves. Unlike JSON's
    /// read-failure fallback to defaults, any failure here (I/O, parse, or an
    /// unsupported dynamic expression) is a hard error: choosing a TS config
    /// is deliberate, so silently dropping it would be worse than failing.
    fn resolve_ts(path: PathBuf) -> Result<Self, String> {
        let src = std::fs::read_to_string(&path)
            .map_err(|e| format!("could not read config {}: {e}", path.display()))?;
        let value = ts_config::evaluate(&src, &path)?;
        let serde_json::Value::Object(ref map) = value else {
            return Err(format!(
                "{}: the default export must be an object",
                path.display()
            ));
        };
        let mut cfg = parse_object(map);
        let json = serde_json::to_vec(&value).map_err(|e| {
            format!(
                "{}: failed to serialize the evaluated config: {e}",
                path.display()
            )
        })?;
        cfg.oxfmt_arg_path = Some(materialize_json_config(&json)?);
        cfg.path = Some(path);
        Ok(cfg)
    }

    /// Layer the config's JS-affecting keys onto `js`. Indent / line-width are
    /// resolved by the caller (they share precedence with CLI flags), so this
    /// only touches quote style, semicolons, trailing commas, etc.
    pub fn apply_js(&self, js: &mut JsFormatOptions) {
        if let Some(v) = self.single_quote {
            js.quote_style = if v {
                QuoteStyle::Single
            } else {
                QuoteStyle::Double
            };
        }
        if let Some(v) = self.semi {
            js.semicolons = if v {
                Semicolons::Always
            } else {
                Semicolons::AsNeeded
            };
        }
        if let Some(v) = self.trailing_comma {
            js.trailing_commas = v;
        }
        if let Some(v) = self.quote_props {
            js.quote_properties = v;
        }
        if let Some(v) = self.arrow_parens {
            js.arrow_parentheses = v;
        }
        if let Some(v) = self.bracket_spacing {
            js.bracket_spacing = v.into();
        }
        if let Some(v) = self.bracket_same_line {
            js.bracket_same_line = v.into();
        }
        if let Some(v) = self.end_of_line {
            js.line_ending = v;
        }
    }

    /// Apply this config's print-width / tab-width / use-tabs onto `js`. Used
    /// for `overrides` entries (the base width has flag precedence and is
    /// resolved by the caller, so this is skipped when a CLI width flag won).
    pub fn apply_width(&self, js: &mut JsFormatOptions) {
        if let Some(w) = self.print_width {
            js.line_width = LineWidth::try_from(w).unwrap_or(js.line_width);
        }
        if let Some(t) = self.tab_width {
            js.indent_width = IndentWidth::try_from(t).unwrap_or(js.indent_width);
        }
        match self.use_tabs {
            Some(true) => js.indent_style = IndentStyle::Tab,
            Some(false) => js.indent_style = IndentStyle::Space,
            None => {}
        }
    }

    /// Directory the config file lives in — the base for resolving
    /// `ignorePatterns` globs. `None` when no config file was found.
    pub fn config_dir(&self) -> Option<&Path> {
        self.path.as_deref().and_then(Path::parent)
    }

    /// Build the [`SortImportsOptions`] for the embedded-`<script>` / native-JS
    /// paths from the raw `sortImports` config, mirroring oxfmt's mapping:
    /// `true` (or an object) starts from [`SortImportsOptions::default()`] and an
    /// object overlays the documented scalar fields; `false` / absent yields
    /// `None` (no sorting). Advanced `groups` / `customGroups` keep their
    /// defaults — the common `sortImports: true` and scalar-tuned configs are
    /// covered byte-for-byte.
    pub fn sort_imports_options(&self) -> Option<SortImportsOptions> {
        match self.sort_imports.as_ref()? {
            serde_json::Value::Bool(false) => None,
            serde_json::Value::Bool(true) => Some(SortImportsOptions::default()),
            serde_json::Value::Object(obj) => {
                let mut opts = SortImportsOptions::default();
                let as_bool = |k: &str| obj.get(k).and_then(serde_json::Value::as_bool);
                if let Some(v) = as_bool("partitionByNewline") {
                    opts.partition_by_newline = v;
                }
                if let Some(v) = as_bool("partitionByComment") {
                    opts.partition_by_comment = v;
                }
                if let Some(v) = as_bool("sortSideEffects") {
                    opts.sort_side_effects = v;
                }
                if let Some(v) = as_bool("ignoreCase") {
                    opts.ignore_case = v;
                }
                if let Some(v) = as_bool("newlinesBetween") {
                    opts.newlines_between = v;
                }
                if let Some(v) = obj.get("order").and_then(serde_json::Value::as_str) {
                    opts.order = match v {
                        "desc" => SortOrder::Desc,
                        _ => SortOrder::Asc,
                    };
                }
                if let Some(arr) = obj
                    .get("internalPattern")
                    .and_then(serde_json::Value::as_array)
                {
                    opts.internal_pattern = arr
                        .iter()
                        .filter_map(|v| v.as_str().map(str::to_owned))
                        .collect();
                }
                Some(opts)
            }
            _ => None,
        }
    }
}

/// Search `start` and each ancestor directory for the first recognised config
/// file. `start` may be a file or a directory; only directory components are
/// inspected.
///
/// Mirrors oxfmt's own `ConfigDiscovery`: a single directory holding more
/// than one recognised config file (e.g. both `.oxfmtrc.json` and
/// `oxfmt.config.ts`) is a conflict oxfmt refuses to resolve — see
/// `crates/oxc_config/src/discovery.rs`'s `ConfigConflict` upstream — so we
/// error the same way instead of silently picking one by `CONFIG_NAMES`
/// order. A directory with exactly one match still wins over its ancestors,
/// regardless of which name matched.
fn find_upward(start: &Path) -> Result<Option<PathBuf>, String> {
    let mut dir: Option<&Path> = if start.is_dir() {
        Some(start)
    } else {
        start.parent()
    };
    while let Some(d) = dir {
        let found: Vec<&str> = CONFIG_NAMES
            .iter()
            .copied()
            .filter(|name| d.join(name).is_file())
            .collect();
        match found.as_slice() {
            [] => {}
            [name] => return Ok(Some(d.join(name))),
            multiple => {
                return Err(format!(
                    "multiple oxfmt config files found in {}: {}. Only one is allowed per \
                     directory — delete one of them.",
                    d.display(),
                    multiple.join(", ")
                ));
            }
        }
        dir = d.parent();
    }
    Ok(None)
}

/// Write a statically-evaluated TS config's JSON bytes to a temp file, so it
/// can be forced onto child `oxfmt` invocations via `-c` at the same
/// semantics rsvelte-fmt itself resolved (see [`OxfmtConfig::resolve_ts`] and
/// [`OxfmtConfig::oxfmt_arg_path`]). The filename is unique per call (not just
/// per-process) so concurrent resolutions in one process — as in the test
/// suite, which runs tests in threads sharing a pid — never collide.
fn materialize_json_config(json: &[u8]) -> Result<PathBuf, String> {
    static COUNTER: AtomicU64 = AtomicU64::new(0);
    let id = COUNTER.fetch_add(1, Ordering::Relaxed);
    let dir = std::env::temp_dir().join(format!("rsvelte-fmt-config-{}-{id}", std::process::id()));
    std::fs::create_dir_all(&dir)
        .map_err(|e| format!("failed to create temp config dir {}: {e}", dir.display()))?;
    let path = dir.join(".oxfmtrc.json");
    std::fs::write(&path, json)
        .map_err(|e| format!("failed to write temp config {}: {e}", path.display()))?;
    Ok(path)
}

/// Parse an `.oxfmtrc` document (JSON or JSONC) into an [`OxfmtConfig`].
/// Unknown keys, unparsable values, and unsupported config dialects (`.ts` /
/// `.js`, etc.) are ignored — a best-effort mapping is strictly better than
/// silently formatting inline blocks with defaults.
fn parse(src: &str) -> OxfmtConfig {
    let stripped = strip_jsonc(src);
    let Ok(value) = serde_json::from_str::<serde_json::Value>(&stripped) else {
        return OxfmtConfig::default();
    };
    let serde_json::Value::Object(map) = value else {
        return OxfmtConfig::default();
    };
    parse_object(&map)
}

/// Parse a JSON object into an [`OxfmtConfig`]. Shared by the top-level config
/// and each `overrides` entry's nested `options` object.
fn parse_object(map: &serde_json::Map<String, serde_json::Value>) -> OxfmtConfig {
    let mut cfg = OxfmtConfig::default();
    let as_bool = |k: &str| map.get(k).and_then(serde_json::Value::as_bool);
    let as_str = |k: &str| map.get(k).and_then(serde_json::Value::as_str);
    let as_u64 = |k: &str| map.get(k).and_then(serde_json::Value::as_u64);

    cfg.single_quote = as_bool("singleQuote");
    cfg.semi = as_bool("semi");
    cfg.bracket_spacing = as_bool("bracketSpacing");
    cfg.bracket_same_line = as_bool("bracketSameLine");
    cfg.use_tabs = as_bool("useTabs");

    cfg.trailing_comma = as_str("trailingComma").and_then(|s| match s {
        "all" => Some(TrailingCommas::All),
        "es5" => Some(TrailingCommas::Es5),
        "none" => Some(TrailingCommas::None),
        _ => None,
    });
    cfg.quote_props = as_str("quoteProps").and_then(|s| match s {
        "as-needed" => Some(QuoteProperties::AsNeeded),
        "consistent" => Some(QuoteProperties::Consistent),
        "preserve" => Some(QuoteProperties::Preserve),
        _ => None,
    });
    cfg.arrow_parens = as_str("arrowParens").and_then(|s| match s {
        "always" => Some(ArrowParentheses::Always),
        "avoid" => Some(ArrowParentheses::AsNeeded),
        _ => None,
    });
    cfg.end_of_line = as_str("endOfLine").and_then(|s| match s {
        "lf" => Some(LineEnding::Lf),
        "crlf" => Some(LineEnding::Crlf),
        "cr" => Some(LineEnding::Cr),
        // "auto" depends on the source; leave it to the formatter default.
        _ => None,
    });

    cfg.print_width = as_u64("printWidth").and_then(|n| u16::try_from(n).ok());
    cfg.tab_width = as_u64("tabWidth").and_then(|n| u8::try_from(n).ok());

    cfg.single_attribute_per_line = as_bool("singleAttributePerLine");

    // The `svelte` key is either `true` / `false` or an object carrying the
    // prettier-plugin-svelte knobs (`allowShorthand`, `indentScriptAndStyle`,
    // `sortOrder`). A bare `true` leaves every sub-option at its default.
    if let Some(serde_json::Value::Object(s)) = map.get("svelte") {
        cfg.svelte_allow_shorthand = s.get("allowShorthand").and_then(serde_json::Value::as_bool);
        cfg.svelte_indent_script_and_style = s
            .get("indentScriptAndStyle")
            .and_then(serde_json::Value::as_bool);
        cfg.svelte_sort_order = s
            .get("sortOrder")
            .and_then(serde_json::Value::as_str)
            .map(str::to_owned);
    }

    // `sortImports` is `true` / `false` / an object. Keep the raw value; it is
    // turned into `SortImportsOptions` lazily so the embedded `<script>` path
    // gets the same import ordering oxfmt applies.
    cfg.sort_imports = match map.get("sortImports") {
        Some(v @ serde_json::Value::Bool(_)) | Some(v @ serde_json::Value::Object(_)) => {
            Some(v.clone())
        }
        _ => None,
    };

    cfg.sort_tailwindcss = map.get("sortTailwindcss").cloned();

    cfg.ignore_patterns = map
        .get("ignorePatterns")
        .and_then(serde_json::Value::as_array)
        .map(|arr| {
            arr.iter()
                .filter_map(|v| v.as_str().map(str::to_owned))
                .collect()
        })
        .unwrap_or_default();

    cfg.overrides = map
        .get("overrides")
        .and_then(serde_json::Value::as_array)
        .map(|arr| arr.iter().filter_map(parse_override).collect())
        .unwrap_or_default();

    cfg
}

/// Parse one `overrides` entry (`{ "files": [...], "options": { … } }`).
/// Returns `None` when it has no usable `files` globs.
fn parse_override(value: &serde_json::Value) -> Option<OverrideConfig> {
    let obj = value.as_object()?;
    // `files` may be a single string or an array of strings.
    let files: Vec<String> = match obj.get("files") {
        Some(serde_json::Value::String(s)) => vec![s.clone()],
        Some(serde_json::Value::Array(a)) => a
            .iter()
            .filter_map(|v| v.as_str().map(str::to_owned))
            .collect(),
        _ => return None,
    };
    if files.is_empty() {
        return None;
    }
    let options = obj
        .get("options")
        .and_then(serde_json::Value::as_object)
        .map(parse_object)
        .unwrap_or_default();
    Some(OverrideConfig { files, options })
}

/// Strip `//` and `/* */` comments and trailing commas from a JSONC document,
/// leaving byte positions otherwise intact so `serde_json` can parse it. String
/// contents (including `//` or `/*` *inside* a string) are preserved verbatim.
///
/// Works on bytes: every byte the comment markers / commas key off is ASCII, and
/// UTF-8 multi-byte sequences never contain an ASCII byte, so non-ASCII string
/// contents (e.g. `ignorePatterns`) survive intact and the output stays valid
/// UTF-8.
fn strip_jsonc(src: &str) -> String {
    let bytes = src.as_bytes();
    let mut out: Vec<u8> = Vec::with_capacity(src.len());
    let mut i = 0;
    let mut in_string = false;
    while i < bytes.len() {
        let b = bytes[i];
        if in_string {
            out.push(b);
            if b == b'\\' && i + 1 < bytes.len() {
                // Preserve the escaped character as-is.
                out.push(bytes[i + 1]);
                i += 2;
                continue;
            }
            if b == b'"' {
                in_string = false;
            }
            i += 1;
            continue;
        }
        match b {
            b'"' => {
                in_string = true;
                out.push(b'"');
                i += 1;
            }
            b'/' if i + 1 < bytes.len() && bytes[i + 1] == b'/' => {
                // Line comment — skip to end of line (keep the newline).
                i += 2;
                while i < bytes.len() && bytes[i] != b'\n' {
                    i += 1;
                }
            }
            b'/' if i + 1 < bytes.len() && bytes[i + 1] == b'*' => {
                // Block comment — skip to the closing `*/`.
                i += 2;
                while i + 1 < bytes.len() && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                i += 2;
            }
            _ => {
                out.push(b);
                i += 1;
            }
        }
    }
    // `out` is `src` with whole ASCII comment regions removed, so it remains
    // valid UTF-8.
    let stripped = String::from_utf8(out).unwrap_or_default();
    strip_trailing_commas(&stripped)
}

/// Remove trailing commas (a comma whose next non-whitespace character is `}`
/// or `]`), which JSONC allows but `serde_json` rejects. Skips string contents.
fn strip_trailing_commas(src: &str) -> String {
    let bytes = src.as_bytes();
    let mut out: Vec<u8> = Vec::with_capacity(src.len());
    let mut in_string = false;
    let mut i = 0;
    while i < bytes.len() {
        let b = bytes[i];
        if in_string {
            out.push(b);
            if b == b'\\' && i + 1 < bytes.len() {
                out.push(bytes[i + 1]);
                i += 2;
                continue;
            }
            if b == b'"' {
                in_string = false;
            }
            i += 1;
            continue;
        }
        if b == b'"' {
            in_string = true;
            out.push(b'"');
            i += 1;
            continue;
        }
        if b == b',' {
            // Look ahead past whitespace for a closing bracket.
            let mut j = i + 1;
            while j < bytes.len() && bytes[j].is_ascii_whitespace() {
                j += 1;
            }
            if j < bytes.len() && (bytes[j] == b'}' || bytes[j] == b']') {
                // Drop the comma; whitespace is re-emitted by the outer loop.
                i += 1;
                continue;
            }
        }
        out.push(b);
        i += 1;
    }
    String::from_utf8(out).unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_plain_json() {
        let cfg = parse(r#"{ "singleQuote": true, "printWidth": 100 }"#);
        assert_eq!(cfg.single_quote, Some(true));
        assert_eq!(cfg.print_width, Some(100));
    }

    #[test]
    fn parses_jsonc_with_comments_and_trailing_commas() {
        let cfg = parse(
            r#"{
            // quotes
            "singleQuote": true,
            "semi": false, /* no semicolons */
            "trailingComma": "es5",
        }"#,
        );
        assert_eq!(cfg.single_quote, Some(true));
        assert_eq!(cfg.semi, Some(false));
        assert!(matches!(cfg.trailing_comma, Some(TrailingCommas::Es5)));
    }

    #[test]
    fn keeps_comment_markers_inside_strings() {
        // A `//` or `/*` inside a string value must survive untouched.
        let cfg = parse(r#"{ "ignorePatterns": ["a//b", "c/*d"], "singleQuote": true }"#);
        assert_eq!(cfg.single_quote, Some(true));
    }

    #[test]
    fn unknown_and_unparsable_keys_are_ignored() {
        let cfg = parse(r#"{ "totallyUnknown": 1, "singleQuote": "notabool" }"#);
        assert_eq!(cfg.single_quote, None);
    }

    #[test]
    fn empty_on_garbage() {
        let cfg = parse("not json at all");
        assert_eq!(cfg.single_quote, None);
        assert_eq!(cfg.print_width, None);
    }

    #[test]
    fn parses_overrides_with_globs_and_options() {
        let cfg = parse(
            r#"{
            "printWidth": 100,
            "overrides": [
                { "files": ["a/*.ts"], "options": { "printWidth": 1000 } },
                { "files": "b.ts", "options": { "singleQuote": false } }
            ]
        }"#,
        );
        assert_eq!(cfg.overrides.len(), 2);
        assert_eq!(cfg.overrides[0].files, vec!["a/*.ts"]);
        assert_eq!(cfg.overrides[0].options.print_width, Some(1000));
        assert_eq!(cfg.overrides[1].files, vec!["b.ts"]);
        assert_eq!(cfg.overrides[1].options.single_quote, Some(false));
    }

    #[test]
    fn ignores_override_without_files() {
        let cfg = parse(r#"{ "overrides": [{ "options": { "printWidth": 50 } }] }"#);
        assert!(cfg.overrides.is_empty());
    }

    #[test]
    fn parses_single_attribute_per_line() {
        let cfg = parse(r#"{ "singleAttributePerLine": true }"#);
        assert_eq!(cfg.single_attribute_per_line, Some(true));
    }

    #[test]
    fn parses_svelte_object_options() {
        let cfg = parse(
            r#"{ "svelte": { "allowShorthand": false, "indentScriptAndStyle": false, "sortOrder": "styles-scripts-markup-options" } }"#,
        );
        assert_eq!(cfg.svelte_allow_shorthand, Some(false));
        assert_eq!(cfg.svelte_indent_script_and_style, Some(false));
        assert_eq!(
            cfg.svelte_sort_order.as_deref(),
            Some("styles-scripts-markup-options")
        );
    }

    #[test]
    fn svelte_true_leaves_sub_options_default() {
        let cfg = parse(r#"{ "svelte": true }"#);
        assert_eq!(cfg.svelte_allow_shorthand, None);
        assert_eq!(cfg.svelte_indent_script_and_style, None);
        assert_eq!(cfg.svelte_sort_order, None);
    }

    #[test]
    fn sort_imports_true_yields_default_options() {
        let cfg = parse(r#"{ "sortImports": true }"#);
        assert!(cfg.sort_imports_options().is_some());
    }

    #[test]
    fn sort_imports_false_yields_none() {
        let cfg = parse(r#"{ "sortImports": false }"#);
        assert!(cfg.sort_imports_options().is_none());
    }

    #[test]
    fn sort_imports_object_overlays_scalars() {
        let cfg = parse(r#"{ "sortImports": { "order": "desc", "ignoreCase": false } }"#);
        let opts = cfg.sort_imports_options().expect("some");
        assert!(opts.order.is_desc());
        assert!(!opts.ignore_case);
    }

    #[test]
    fn sort_tailwindcss_presence_is_tracked() {
        let cfg = parse(r#"{ "sortTailwindcss": { "functions": ["cn"] } }"#);
        assert!(cfg.sort_tailwindcss.is_some());
        let cfg2 = parse(r#"{ "singleQuote": true }"#);
        assert!(cfg2.sort_tailwindcss.is_none());
    }

    fn workspace(tag: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!(
            "rsvelte_fmt_config_{tag}_{}_{}",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos(),
        ));
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::create_dir_all(&dir).unwrap();
        dir
    }

    #[test]
    fn resolve_discovers_oxfmt_config_ts() {
        let dir = workspace("ts_discover");
        std::fs::write(
            dir.join("oxfmt.config.ts"),
            "export default { singleQuote: true, printWidth: 100 };",
        )
        .unwrap();

        let cfg = OxfmtConfig::resolve(None, &dir).expect("resolves");
        assert_eq!(cfg.single_quote, Some(true));
        assert_eq!(cfg.print_width, Some(100));
        assert_eq!(
            cfg.path.as_deref(),
            Some(dir.join("oxfmt.config.ts").as_path())
        );
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn resolve_discovers_oxfmt_config_mts() {
        let dir = workspace("mts_discover");
        std::fs::write(
            dir.join("oxfmt.config.mts"),
            "export default { semi: false };",
        )
        .unwrap();

        let cfg = OxfmtConfig::resolve(None, &dir).expect("resolves");
        assert_eq!(cfg.semi, Some(false));
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn resolve_ts_config_materializes_a_json_arg_path_distinct_from_the_source() {
        let dir = workspace("ts_materialize");
        std::fs::write(
            dir.join("oxfmt.config.ts"),
            "export default { singleQuote: true, sortTailwindcss: { functions: [\"cn\"] } };",
        )
        .unwrap();

        let cfg = OxfmtConfig::resolve(None, &dir).expect("resolves");
        let arg_path = cfg.oxfmt_arg_path.as_deref().expect("arg path set");
        // The path forced onto child `oxfmt` invocations must not be the
        // `.ts` source itself (the pure-Rust CLI can't evaluate TS) — it must
        // be a materialized JSON file carrying the same evaluated config.
        assert_ne!(arg_path, cfg.path.as_deref().unwrap());
        assert_eq!(arg_path.extension().and_then(|e| e.to_str()), Some("json"));
        let materialized: serde_json::Value =
            serde_json::from_str(&std::fs::read_to_string(arg_path).unwrap()).unwrap();
        assert_eq!(materialized["singleQuote"], serde_json::json!(true));
        assert_eq!(
            materialized["sortTailwindcss"]["functions"],
            serde_json::json!(["cn"])
        );
        // `config_dir()` (ignorePatterns / overrides / tailwind base dir) must
        // stay at the original `oxfmt.config.ts` directory, not the temp dir
        // the materialized JSON lives in.
        assert_eq!(cfg.config_dir(), Some(dir.as_path()));
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn resolve_json_config_keeps_arg_path_equal_to_source_path() {
        let dir = workspace("json_arg_path");
        let path = dir.join(".oxfmtrc.json");
        std::fs::write(&path, r#"{ "singleQuote": true }"#).unwrap();

        let cfg = OxfmtConfig::resolve(None, &dir).expect("resolves");
        assert_eq!(cfg.oxfmt_arg_path.as_deref(), Some(path.as_path()));
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn resolve_errors_on_conflicting_config_files_in_the_same_directory() {
        let dir = workspace("conflict");
        std::fs::write(dir.join(".oxfmtrc.json"), r#"{ "singleQuote": true }"#).unwrap();
        std::fs::write(
            dir.join("oxfmt.config.ts"),
            "export default { semi: true };",
        )
        .unwrap();

        let err = OxfmtConfig::resolve(None, &dir).unwrap_err();
        assert!(
            err.contains("Multiple") || err.contains("multiple"),
            "{err}"
        );
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn resolve_propagates_a_dynamic_ts_config_as_a_hard_error() {
        let dir = workspace("ts_dynamic_error");
        std::fs::write(
            dir.join("oxfmt.config.ts"),
            "export default { printWidth: computeWidth() };",
        )
        .unwrap();

        let err = OxfmtConfig::resolve(None, &dir).unwrap_err();
        assert!(err.contains("statically"), "{err}");
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn resolve_explicit_config_flag_accepts_a_ts_path() {
        let dir = workspace("ts_explicit");
        let path = dir.join("custom.oxfmt.config.ts");
        std::fs::write(&path, "export default { printWidth: 60 };").unwrap();

        let cfg = OxfmtConfig::resolve(Some(&path), &dir).expect("resolves");
        assert_eq!(cfg.print_width, Some(60));
        let _ = std::fs::remove_dir_all(&dir);
    }
}
