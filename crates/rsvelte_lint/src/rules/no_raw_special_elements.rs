//! `svelte/no-raw-special-elements` — flag the raw special elements that were
//! deprecated in Svelte 5 (`<head>`, `<body>`, `<window>`, `<document>`,
//! `<element>`, `<options>`) and rewrite them to their `svelte:` namespaced
//! form. Port of the eslint-plugin-svelte rule (pure-syntactic, fixable).

use rsvelte_core::ast::template::RegularElement;

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-raw-special-elements",
    category: RuleCategory::Correctness,
    fixable: Fixable::Code,
    default_severity: Severity::Error,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Checks for invalid raw HTML elements",
    options_schema: None,
};

/// The raw element names deprecated in Svelte 5 in favour of `svelte:<name>`.
const INVALID_HTML_ELEMENTS: [&str; 6] =
    ["head", "body", "window", "document", "element", "options"];

fn is_invalid(name: &str) -> bool {
    INVALID_HTML_ELEMENTS.contains(&name)
}

#[derive(Default)]
pub struct NoRawSpecialElements;

impl Rule for NoRawSpecialElements {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        let name = el.name.as_str();
        if !is_invalid(name) {
            return;
        }

        let message =
            format!("Special {name} element is deprecated in v5, use svelte:{name} instead.");

        let mut edits = vec![
            // Opening tag: insert `svelte:` right after the `<`.
            TextEdit {
                start: el.start + 1,
                end: el.start + 1,
                new_text: "svelte:".to_string(),
            },
        ];

        // Closing tag (only present for non-self-closing elements). The source
        // for such an element ends with `</name>`; if we find that exact shape,
        // insert `svelte:` right after the `</`.
        let close_len = name.len() as u32 + 3; // "</" + name + ">"
        if el.end >= close_len {
            let close_start = el.end - close_len;
            if ctx.slice(close_start, el.end) == format!("</{name}>") {
                edits.push(TextEdit {
                    start: el.end - name.len() as u32 - 1,
                    end: el.end - name.len() as u32 - 1,
                    new_text: "svelte:".to_string(),
                });
            }
        }

        let fix = Fix {
            message: message.clone(),
            edits,
        };
        ctx.report_with_fix(el.start, el.end, message, fix);
    }
}

#[cfg(test)]
mod tests {
    use super::is_invalid;

    #[test]
    fn flags_deprecated_special_elements() {
        for name in ["head", "body", "window", "document", "element", "options"] {
            assert!(is_invalid(name));
        }
    }

    #[test]
    fn ignores_ordinary_elements() {
        for name in ["div", "span", "input", "header", "option", "html"] {
            assert!(!is_invalid(name));
        }
    }
}
