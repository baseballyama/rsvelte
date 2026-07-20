//! `sortTailwindcss` support, scoped to the one case a pure-Rust sorter can
//! reproduce byte-for-byte: a **stock, zero-config** Tailwind v4 setup.
//!
//! Tailwind's class order depends on the project's compiled CSS, so a JS
//! `tailwind.config.js`, a `@plugin`, a custom `@utility` / `@custom-variant`,
//! or `@theme` tokens all change it. We therefore sort natively only when the
//! resolved stylesheet is confidently a default `@import "tailwindcss";` with no
//! such order-affecting directive, and no v3 JS config is present. Anything less
//! certain falls back to a warning and leaves classes untouched — never a
//! silently wrong reorder.

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
    /// Configured but not a stock setup — warn and leave classes unsorted, with
    /// the reason for the warning.
    Skip { reason: String },
    /// `sortTailwindcss` is not set.
    Off,
}

/// Decide how to handle `sortTailwindcss` for a config. `config_path` is the
/// `.oxfmtrc` path, used to resolve relative stylesheet paths and to look for a
/// sibling v3 JS config.
pub fn decide(
    sort_tailwindcss: Option<&serde_json::Value>,
    config_path: Option<&Path>,
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

    // A v3 config file (or a `config` key) means JS-driven ordering we cannot
    // reproduce.
    if value
        .get("config")
        .and_then(serde_json::Value::as_str)
        .is_some()
    {
        return Decision::Skip {
            reason: "a Tailwind `config` (v3) is set".into(),
        };
    }
    if let Some(name) = find_v3_config(&base_dir) {
        return Decision::Skip {
            reason: format!("a Tailwind v3 config ({name}) was found"),
        };
    }

    // Resolve the v4 stylesheet: the explicit `stylesheet` key, else a
    // conventional entry file.
    let stylesheet = value
        .get("stylesheet")
        .and_then(serde_json::Value::as_str)
        .map(|s| base_dir.join(s))
        .or_else(|| find_default_stylesheet(&base_dir));

    let Some(stylesheet) = stylesheet else {
        return Decision::Skip {
            reason: "no Tailwind stylesheet could be located to verify a default setup".into(),
        };
    };

    match read_resolved(&stylesheet) {
        Some(css) if is_default_stylesheet(&css) => Decision::Sort {
            sorter: Arc::new(|classes: &str| tailwind_class_order::sort_class_string(classes)),
            attributes: attribute_names(value),
        },
        Some(_) => Decision::Skip {
            reason: format!(
                "{} is not a default setup (contains @plugin / @utility / @custom-variant / @theme / @config)",
                stylesheet.display()
            ),
        },
        None => Decision::Skip {
            reason: format!("could not read {}", stylesheet.display()),
        },
    }
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
