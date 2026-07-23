//! `sortTailwindcss` support. A **stock, zero-config** Tailwind v4 setup sorts
//! natively — the one case a pure-Rust sorter reproduces byte-for-byte.
//!
//! Tailwind's class order depends on the project's compiled CSS, so a JS
//! `tailwind.config.js`, a `@plugin`, a custom `@utility` / `@custom-variant`,
//! or `@theme` tokens all change it. For those custom setups we delegate to a
//! Node sidecar that runs the real `prettier-plugin-tailwindcss` (the same
//! plugin `oxfmt` uses), matching the oracle exactly. When Node / the plugin is
//! unavailable the custom case falls back to a warning that leaves classes
//! untouched — never a silently wrong reorder.
//!
//! The rsvelte-only `strategy` knob (`auto` default / `native` / `js`) picks
//! between the native and JS sorters; see [`decide`].

use std::path::{Path, PathBuf};
use std::sync::Arc;

use rsvelte_formatter::ClassSorter;

/// Outcome of resolving `sortTailwindcss` against the project.
pub enum Decision {
    /// Stock config detected — sort natively with this callback + attribute set.
    Sort {
        sorter: ClassSorter,
        attributes: Vec<String>,
    },
    /// Sort through the Node sidecar (real `prettier-plugin-tailwindcss`). Used
    /// for a custom config, or for any config under `strategy: "js"`.
    SortViaJs {
        /// A representative in-project path, so the plugin resolves the
        /// consumer's `tailwindcss` from the right `node_modules`.
        filepath: PathBuf,
        stylesheet_path: Option<PathBuf>,
        config_path: Option<PathBuf>,
        attributes: Vec<String>,
        preserve_whitespace: bool,
        preserve_duplicates: bool,
    },
    /// Configured but not sortable here — warn and leave classes unsorted, with
    /// the reason for the warning.
    Skip { reason: String },
    /// `sortTailwindcss` is not set.
    Off,
}

/// rsvelte-only `sortTailwindcss.strategy` (not an oxfmt key).
#[derive(Clone, Copy, PartialEq, Eq)]
enum Strategy {
    /// Default: stock config native, custom config via JS.
    Auto,
    /// Always pure-Rust; a custom config warns and skips.
    Native,
    /// Always via the JS oracle (opts a stock config into it too).
    Js,
}

/// How the resolved config classifies against a stock setup.
enum Class {
    Default {
        stylesheet: PathBuf,
    },
    Custom {
        stylesheet: Option<PathBuf>,
        config: Option<PathBuf>,
        reason: String,
    },
    Unresolvable {
        reason: String,
    },
}

/// Decide how to handle `sortTailwindcss` for a config. `config_path` is the
/// `.oxfmtrc` path, used to resolve relative stylesheet paths and to look for a
/// sibling v3 JS config. `js_available` probes whether a Node sidecar can run;
/// it is called *only* when a branch actually needs JS, so a stock config never
/// pays for the Node probe. When it reports `false`, cases that need JS fall
/// back to warn+skip (or native for a stock config under `strategy: "js"`).
pub fn decide(
    sort_tailwindcss: Option<&serde_json::Value>,
    config_path: Option<&Path>,
    js_available: impl FnOnce() -> bool,
) -> Decision {
    let Some(value) = sort_tailwindcss else {
        return Decision::Off;
    };
    if value == &serde_json::Value::Bool(false) {
        return Decision::Off;
    }

    let base_dir = config_path
        .and_then(Path::parent)
        .map(Path::to_path_buf)
        .unwrap_or_else(|| PathBuf::from("."));

    let strategy = parse_strategy(value);
    let attributes = attribute_names(value);
    let preserve_whitespace = bool_key(value, "preserveWhitespace");
    let preserve_duplicates = bool_key(value, "preserveDuplicates");
    // The plugin resolves `tailwindcss` from this path's directory; any file
    // inside the project resolves the same install `decide` already picked.
    let filepath = base_dir.join("__rsvelte-fmt-tailwind__.svelte");

    match (strategy, classify(value, &base_dir)) {
        (_, Class::Unresolvable { reason }) => Decision::Skip { reason },

        (Strategy::Native, Class::Default { .. }) | (Strategy::Auto, Class::Default { .. }) => {
            native_sort(attributes)
        }
        (Strategy::Native, Class::Custom { reason, .. }) => Decision::Skip {
            reason: format!(
                "{reason}; `strategy: \"native\"` cannot sort a custom Tailwind config"
            ),
        },

        (
            Strategy::Auto,
            Class::Custom {
                stylesheet,
                config,
                reason,
            },
        ) => sort_via_js_or_skip(
            js_available,
            filepath,
            stylesheet,
            config,
            attributes,
            preserve_whitespace,
            preserve_duplicates,
            reason,
        ),

        (Strategy::Js, Class::Default { stylesheet }) => {
            if js_available() {
                Decision::SortViaJs {
                    filepath,
                    stylesheet_path: Some(stylesheet),
                    config_path: None,
                    attributes,
                    preserve_whitespace,
                    preserve_duplicates,
                }
            } else {
                native_sort(attributes)
            }
        }
        (
            Strategy::Js,
            Class::Custom {
                stylesheet,
                config,
                reason,
            },
        ) => sort_via_js_or_skip(
            js_available,
            filepath,
            stylesheet,
            config,
            attributes,
            preserve_whitespace,
            preserve_duplicates,
            reason,
        ),
    }
}

fn native_sort(attributes: Vec<String>) -> Decision {
    Decision::Sort {
        sorter: Arc::new(|classes: &str| tailwind_class_order::sort_class_string(classes)),
        attributes,
    }
}

#[allow(clippy::too_many_arguments)]
fn sort_via_js_or_skip(
    js_available: impl FnOnce() -> bool,
    filepath: PathBuf,
    stylesheet_path: Option<PathBuf>,
    config_path: Option<PathBuf>,
    attributes: Vec<String>,
    preserve_whitespace: bool,
    preserve_duplicates: bool,
    detect_reason: String,
) -> Decision {
    if js_available() {
        Decision::SortViaJs {
            filepath,
            stylesheet_path,
            config_path,
            attributes,
            preserve_whitespace,
            preserve_duplicates,
        }
    } else {
        Decision::Skip {
            reason: format!(
                "{detect_reason}; a Node interpreter with prettier-plugin-tailwindcss is required \
                 to sort a custom Tailwind config"
            ),
        }
    }
}

/// Classify the resolved config against a stock `@import "tailwindcss";` setup.
fn classify(value: &serde_json::Value, base_dir: &Path) -> Class {
    // A v3 config (explicit `config` key or a sibling file) is JS-driven order.
    if let Some(cfg) = value.get("config").and_then(serde_json::Value::as_str) {
        return Class::Custom {
            stylesheet: None,
            config: Some(base_dir.join(cfg)),
            reason: "a Tailwind `config` (v3) is set".into(),
        };
    }
    if let Some(name) = find_v3_config(base_dir) {
        return Class::Custom {
            stylesheet: None,
            config: Some(base_dir.join(&name)),
            reason: format!("a Tailwind v3 config ({name}) was found"),
        };
    }

    // Resolve the v4 stylesheet: the explicit `stylesheet` key, else a
    // conventional entry file.
    let stylesheet = value
        .get("stylesheet")
        .and_then(serde_json::Value::as_str)
        .map(|s| base_dir.join(s))
        .or_else(|| find_default_stylesheet(base_dir));

    let Some(stylesheet) = stylesheet else {
        return Class::Unresolvable {
            reason: "no Tailwind stylesheet could be located to verify a default setup".into(),
        };
    };

    match read_resolved(&stylesheet) {
        Some(css) if is_default_stylesheet(&css) => Class::Default { stylesheet },
        Some(_) => Class::Custom {
            reason: format!(
                "{} is not a default setup (contains @plugin / @utility / @custom-variant / @theme / @config)",
                stylesheet.display()
            ),
            stylesheet: Some(stylesheet),
            config: None,
        },
        None => Class::Unresolvable {
            reason: format!("could not read {}", stylesheet.display()),
        },
    }
}

fn parse_strategy(value: &serde_json::Value) -> Strategy {
    match value.get("strategy").and_then(serde_json::Value::as_str) {
        Some("native") => Strategy::Native,
        Some("js") => Strategy::Js,
        _ => Strategy::Auto,
    }
}

fn bool_key(value: &serde_json::Value, key: &str) -> bool {
    value
        .get(key)
        .and_then(serde_json::Value::as_bool)
        .unwrap_or(false)
}

/// The attribute names to sort (`sortTailwindcss.attributes`, default `class`).
fn attribute_names(value: &serde_json::Value) -> Vec<String> {
    let mut names: Vec<String> = value
        .get("attributes")
        .and_then(serde_json::Value::as_array)
        .map(|a| {
            a.iter()
                .filter_map(|v| v.as_str().map(str::to_owned))
                .collect()
        })
        .unwrap_or_default();
    if !names.iter().any(|n| n == "class") {
        names.push("class".into());
    }
    names
}

/// `sortTailwindcss.functions` — wrapper call names (`cn`, `cva`, …) whose class
/// arguments are sorted in `<script>` bodies. Empty when unset (oxfmt's default).
pub fn function_names(sort_tailwindcss: Option<&serde_json::Value>) -> Vec<String> {
    sort_tailwindcss
        .and_then(|v| v.get("functions"))
        .and_then(serde_json::Value::as_array)
        .map(|a| {
            a.iter()
                .filter_map(|v| v.as_str().map(str::to_owned))
                .collect()
        })
        .unwrap_or_default()
}

fn find_v3_config(dir: &Path) -> Option<String> {
    for name in [
        "tailwind.config.js",
        "tailwind.config.ts",
        "tailwind.config.cjs",
        "tailwind.config.mjs",
    ] {
        if dir.join(name).is_file() {
            return Some(name.to_string());
        }
    }
    None
}

fn find_default_stylesheet(dir: &Path) -> Option<PathBuf> {
    for rel in [
        "src/app.css",
        "src/app.pcss",
        "src/app.postcss",
        "src/styles/app.css",
        "src/styles/tailwind.css",
        "src/routes/+layout.css",
        "app.css",
        "styles/app.css",
    ] {
        let p = dir.join(rel);
        if p.is_file() {
            return Some(p);
        }
    }
    None
}

/// Read a stylesheet and inline the content of relative `@import "./…"` targets
/// one level deep, so a split-out `@theme` / `@plugin` is still seen. Bare
/// package imports (`@import "tailwindcss"`) are left as-is.
fn read_resolved(path: &Path) -> Option<String> {
    let src = std::fs::read_to_string(path).ok()?;
    let dir = path.parent().unwrap_or(Path::new("."));
    let mut out = String::with_capacity(src.len());
    for line in src.lines() {
        if let Some(rel) = relative_import_target(line)
            && let Ok(inner) = std::fs::read_to_string(dir.join(rel))
        {
            out.push_str(&inner);
            out.push('\n');
        }
        out.push_str(line);
        out.push('\n');
    }
    Some(out)
}

/// The path of a relative `@import "./foo.css"` (or `'./foo.css'`), or `None`.
fn relative_import_target(line: &str) -> Option<&str> {
    let rest = line.trim().strip_prefix("@import")?.trim_start();
    let inner = rest
        .strip_prefix('"')
        .and_then(|r| r.split('"').next())
        .or_else(|| rest.strip_prefix('\'').and_then(|r| r.split('\'').next()))?;
    (inner.starts_with("./") || inner.starts_with("../")).then_some(inner)
}

/// A stock Tailwind v4 stylesheet: it pulls in `tailwindcss` and carries no
/// directive that changes utility/variant ordering.
fn is_default_stylesheet(css: &str) -> bool {
    let stripped = strip_css_comments(css);
    let imports_tailwind = stripped.lines().any(|l| {
        let l = l.trim();
        l.starts_with("@import") && l.contains("tailwindcss")
    });
    // Any of these can add/reorder utilities or variants.
    const ORDER_AFFECTING: &[&str] = &[
        "@plugin",
        "@utility",
        "@custom-variant",
        "@config",
        "@theme",
        "@tailwind",
    ];
    let has_order_affecting = ORDER_AFFECTING
        .iter()
        .any(|d| contains_at_rule(&stripped, d));
    imports_tailwind && !has_order_affecting
}

/// Whether an at-rule appears as a token (followed by whitespace, `{`, `(`, or
/// end) so `@theme` matches but `@themed-thing` does not.
fn contains_at_rule(css: &str, at_rule: &str) -> bool {
    let mut rest = css;
    while let Some(pos) = rest.find(at_rule) {
        let after = &rest[pos + at_rule.len()..];
        if after
            .chars()
            .next()
            .is_none_or(|c| c.is_whitespace() || c == '{' || c == '(' || c == ';')
        {
            return true;
        }
        rest = after;
    }
    false
}

fn strip_css_comments(css: &str) -> String {
    let mut out = String::with_capacity(css.len());
    let bytes = css.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        if i + 1 < bytes.len() && bytes[i] == b'/' && bytes[i + 1] == b'*' {
            match css[i + 2..].find("*/") {
                Some(end) => i += 2 + end + 2,
                None => break,
            }
        } else {
            out.push(bytes[i] as char);
            i += 1;
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_stylesheet_is_accepted() {
        assert!(is_default_stylesheet("@import \"tailwindcss\";\n"));
        assert!(is_default_stylesheet(
            "@import 'tailwindcss';\n@source \"./src\";\n"
        ));
        // Comment-wrapped directives are ignored.
        assert!(is_default_stylesheet(
            "@import \"tailwindcss\";\n/* @plugin \"x\"; */\n"
        ));
    }

    #[test]
    fn custom_stylesheet_is_rejected() {
        assert!(!is_default_stylesheet(
            "@import \"tailwindcss\";\n@plugin \"@tailwindcss/typography\";\n"
        ));
        assert!(!is_default_stylesheet(
            "@import \"tailwindcss\";\n@theme { --color-brand: #123; }\n"
        ));
        assert!(!is_default_stylesheet(
            "@import \"tailwindcss\";\n@utility tab-4 { tab-size: 4; }\n"
        ));
        assert!(!is_default_stylesheet(
            "@import \"tailwindcss\";\n@custom-variant hocus (&:hover, &:focus);\n"
        ));
        // No tailwind import at all.
        assert!(!is_default_stylesheet("@import \"./reset.css\";\n"));
    }

    #[test]
    fn at_rule_token_boundary() {
        assert!(contains_at_rule("@theme {", "@theme"));
        assert!(!contains_at_rule("@themed-nonsense", "@theme"));
    }
}
