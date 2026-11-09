use rsvelte_lint_runner::finding::{Fix, Suggestion};
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte::syntax::syntax_tree::{
    Attribute, AttributeKind, Component, Part, TemplateNode, decode_attribute,
};

use super::constant_string::{root, string_if_constant};
use super::expressions::Expressions;
use super::markup::{is_attribute, parts};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-bind-value-on-checkable-inputs",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoBindValueOnCheckableInputs))
}

#[derive(Debug)]
struct NoBindValueOnCheckableInputs;

impl SvelteRule for NoBindValueOnCheckableInputs {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
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
                .and_then(|attribute| static_type(file, component, attribute))
            else {
                continue;
            };
            let (message, message_id, suggestions): (_, _, &[_]) = match kind.as_str() {
                "checkbox" => (
                    "`bind:value` does not work on checkbox inputs. Did you mean `bind:checked` \
                     or `bind:group`?",
                    "checkboxValueBinding",
                    &["checked", "group"],
                ),
                "radio" => (
                    "`bind:value` does not work on radio inputs. Did you mean `bind:group`?",
                    "radioValueBinding",
                    &["group"],
                ),
                _ => continue,
            };
            let mut report = Report::range(message, bind_value.span).message_id(message_id);
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
        message_id: Some(format!("{binding}Suggestion").into()),
        message: format!("Change `bind:value` to `bind:{binding}`."),
        fix,
    }
}

/// The lowercased `type` when it is one text, or one expression known to be a string.
fn static_type(file: &File<'_>, component: &Component, attribute: &Attribute) -> Option<String> {
    let source = file.source();
    let value = match *parts(component, attribute) {
        [Part::Text(text)] => decode_attribute(text.text(source)).into_owned(),
        [Part::Expression { expression, .. }] => {
            let expressions = Expressions::new(&component.javascript, source);
            let expression = root(&expressions, || file.semantic(), expression);
            string_if_constant(&expressions, expression)?
        }
        _ => return None,
    };
    Some(value.to_lowercase())
}
