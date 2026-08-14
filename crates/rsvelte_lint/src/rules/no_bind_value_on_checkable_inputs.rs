use crate::context::LintContext;
use crate::diagnostic::{Fix, Suggestion, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use rsvelte_core::ast::template::{Attribute, AttributeValue, BindDirective, RegularElement};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-bind-value-on-checkable-inputs",
    category: RuleCategory::Correctness,
    fixable: Fixable::Suggestion,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "disallow useless bind:value on checkbox and radio inputs",
    options_schema: Some("[]"),
};
fn static_type(attr: &Attribute) -> Option<String> {
    let Attribute::Attribute(a) = attr else {
        return None;
    };
    if !a.name.eq_ignore_ascii_case("type") {
        return None;
    };
    match &a.value {
        AttributeValue::Sequence(parts) if parts.len() == 1 => match &parts[0] {
            rsvelte_core::ast::template::AttributeValuePart::Text(t) => {
                Some(t.data.to_ascii_lowercase())
            }
            _ => None,
        },
        AttributeValue::Expression(tag) => tag
            .expression
            .as_json()
            .get("value")
            .and_then(serde_json::Value::as_str)
            .map(str::to_ascii_lowercase),
        _ => None,
    }
}
fn suggestion(ctx: &LintContext, bind: &BindDirective, name: &str) -> Suggestion {
    let original = ctx.slice(bind.start, bind.end);
    let edit = if original.contains('=') {
        let offset = original.find("value").unwrap_or(5);
        TextEdit {
            start: bind.start + offset as u32,
            end: bind.start + offset as u32 + 5,
            new_text: name.to_string(),
        }
    } else {
        TextEdit {
            start: bind.start,
            end: bind.end,
            new_text: format!("bind:{name}={{value}}"),
        }
    };
    Suggestion {
        desc: format!("Change `bind:value` to `bind:{name}`."),
        fix: Fix {
            message: String::new(),
            edits: vec![edit],
        },
    }
}
#[derive(Default)]
pub struct NoBindValueOnCheckableInputs;
impl Rule for NoBindValueOnCheckableInputs {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }
    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        if !el.name.eq_ignore_ascii_case("input") {
            return;
        };
        let Some(kind) = el.attributes.iter().find_map(static_type) else {
            return;
        };
        if kind != "checkbox" && kind != "radio" {
            return;
        };
        let Some(bind) = el.attributes.iter().find_map(|a| match a {
            Attribute::BindDirective(b) if b.name == "value" => Some(b),
            _ => None,
        }) else {
            return;
        };
        let (message, names) = if kind == "checkbox" {
            (
                "`bind:value` does not work on checkbox inputs. Did you mean `bind:checked` or `bind:group`?",
                ["checked", "group"].as_slice(),
            )
        } else {
            (
                "`bind:value` does not work on radio inputs. Did you mean `bind:group`?",
                ["group"].as_slice(),
            )
        };
        let suggestions = names.iter().map(|n| suggestion(ctx, bind, n)).collect();
        ctx.report_with_suggestions(bind.start, bind.end, message, suggestions);
    }
}
