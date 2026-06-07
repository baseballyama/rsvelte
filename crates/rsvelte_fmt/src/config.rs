//! Resolve the project's oxfmt config (`.oxfmtrc.json` / `.oxfmtrc.jsonc`) and
//! apply it to the inline `<script>` / `<style>` formatting paths.
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
//! `oxfmt` invocation via `-c` so inline `<style>` blocks use it too.

use std::path::{Path, PathBuf};

use oxc_formatter::{
    ArrowParentheses, JsFormatOptions, QuoteProperties, QuoteStyle, Semicolons, TrailingCommas,
};
use oxc_formatter_core::LineEnding;

/// Config file names oxfmt recognises, in the order it prefers them.
const CONFIG_NAMES: &[&str] = &[".oxfmtrc.json", ".oxfmtrc.jsonc"];

/// The subset of `.oxfmtrc` keys that affect JS/TS formatting and that
/// `oxc_formatter` can honor. Every field is `Option` so an absent key leaves
/// the corresponding `JsFormatOptions` value untouched.
#[derive(Debug, Default, Clone)]
pub struct OxfmtConfig {
    /// Path the config was read from. Passed to child `oxfmt` invocations via
    /// `-c` so inline `<style>` blocks (staged in a temp dir, out of reach of
    /// oxfmt's own cwd-based discovery) pick up the same settings.
    pub path: Option<PathBuf>,
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
}

impl OxfmtConfig {
    /// Resolve the config: an explicit `--config` path if given, else the
    /// nearest config file searching upward from `start` (the working
    /// directory). Returns an empty config (everything `None`) when no file is
    /// found, so callers can apply it unconditionally.
    pub fn resolve(explicit: Option<&Path>, start: &Path) -> Self {
        let path = match explicit {
            Some(p) => Some(p.to_path_buf()),
            None => find_upward(start),
        };
        let Some(path) = path else {
            return Self::default();
        };
        match std::fs::read_to_string(&path) {
            Ok(src) => {
                let mut cfg = parse(&src);
                cfg.path = Some(path);
                cfg
            }
            Err(e) => {
                eprintln!(
                    "rsvelte-fmt: warning: could not read config {}: {e}",
                    path.display()
                );
                Self::default()
            }
        }
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

    /// Directory the config file lives in — the base for resolving
    /// `ignorePatterns` globs. `None` when no config file was found.
    pub fn config_dir(&self) -> Option<&Path> {
        self.path.as_deref().and_then(Path::parent)
    }
}

/// Search `start` and each ancestor directory for the first recognised config
/// file. `start` may be a file or a directory; only directory components are
/// inspected.
fn find_upward(start: &Path) -> Option<PathBuf> {
    let mut dir: Option<&Path> = if start.is_dir() {
        Some(start)
    } else {
        start.parent()
    };
    while let Some(d) = dir {
        for name in CONFIG_NAMES {
            let candidate = d.join(name);
            if candidate.is_file() {
                return Some(candidate);
            }
        }
        dir = d.parent();
    }
    None
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

    cfg.ignore_patterns = map
        .get("ignorePatterns")
        .and_then(serde_json::Value::as_array)
        .map(|arr| {
            arr.iter()
                .filter_map(|v| v.as_str().map(str::to_owned))
                .collect()
        })
        .unwrap_or_default();

    cfg
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
}
