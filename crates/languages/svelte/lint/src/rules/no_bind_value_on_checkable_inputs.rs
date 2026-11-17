use rsvelte_lint_runner::finding::{Fix, Suggestion};
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::{
    Attribute, AttributeKind, Component, Part, TemplateNode, decode_attribute,
};
use rsvelte_typescript_semantic::static_value::{StaticValues, Value};

use super::markup::{is_attribute, parts};
use crate::rule::{File, Files, RuleDefinition, SvelteRule, without_options};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-bind-value-on-checkable-inputs",
    files: Files::Components,
    configure: without_options::<NoBindValueOnCheckableInputs>,
};

#[derive(Debug, Default)]
struct NoBindValueOnCheckableInputs;

impl SvelteRule for NoBindValueOnCheckableInputs {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        // Scopes are resolved only for the first `type={expression}`.
        let mut values = None;
        for node in &component.nodes {
            let TemplateNode::Element {
                name, attributes, ..
            } = *node
            else {
                continue;
            };
            if name.text(source) != "input" {
                continue;
            }
            let attributes = component.attributes(attributes);
            let Some(bind_value) = attributes.iter().find(|attribute| {
                attribute.kind == AttributeKind::Bind
                    && attribute
                        .directive_name(&component.modifiers)
                        .is_some_and(|name| name.text(source) == "value")
            }) else {
                continue;
            };
            let Some(kind) = attributes
                .iter()
                .find(|attribute| {
                    is_attribute(component, source, "input", attribute)
                        && attribute.name.text(source).eq_ignore_ascii_case("type")
                })
                .and_then(|attribute| {
                    static_type(component, source, attribute, || {
                        values.get_or_insert_with(|| StaticValues::new(file.semantic()))
                    })
                })
            else {
                continue;
            };
            let (message, suggestions): (_, &[_]) = match kind.as_str() {
                "checkbox" => (
                    "`bind:value` does not work on checkbox inputs. Did you mean `bind:checked` \
                     or `bind:group`?",
                    &["checked", "group"],
                ),
                "radio" => (
                    "`bind:value` does not work on radio inputs. Did you mean `bind:group`?",
                    &["group"],
                ),
                _ => continue,
            };
            let mut report = Report::range(message, bind_value.span);
            for binding in suggestions {
                report = report.suggest(rebind(bind_value, binding));
            }
            reporter.report(report);
        }
    }
}

/// `bind:value` → `bind:{binding}`, keeping the bound expression.
fn rebind(bind_value: &Attribute, binding: &'static str) -> Suggestion {
    let fix = if bind_value.shorthand {
        Fix::replace(bind_value.span, format!("bind:{binding}={{value}}"))
    } else {
        Fix::replace(bind_value.name, format!("bind:{binding}"))
    };
    Suggestion {
        message: format!("Change `bind:value` to `bind:{binding}`."),
        fix,
    }
}

/// The lowercased `type` when it is one text, or one expression known to be a string.
fn static_type<'v>(
    component: &Component,
    source: &str,
    attribute: &Attribute,
    values: impl FnOnce() -> &'v StaticValues<'v>,
) -> Option<String> {
    let value = match *parts(component, attribute) {
        [Part::Text(text)] => decode_attribute(text.text(source)).into_owned(),
        [Part::Expression { expression, .. }] => {
            match values().value(component.javascript.get_expression(expression))? {
                Value::String(value) => value,
                _ => return None,
            }
        }
        _ => return None,
    };
    Some(value.to_lowercase())
}
