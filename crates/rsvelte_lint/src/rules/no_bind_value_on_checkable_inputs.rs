use crate::context::LintContext;
use crate::diagnostic::{Fix, Suggestion, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::js_static::{JsValue, ScriptVars, get_static_value};
use rsvelte_core::ast::template::{
    Attribute, AttributeValue, AttributeValuePart, BindDirective, Fragment, RegularElement, Root,
    TemplateNode,
};

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

/// The element's `type` value, resolved the way upstream does: the first
/// attribute whose (lowercased) name is `type`, with a single value part that is
/// either a literal or a mustache `getStaticValue` evaluates to a string.
fn static_type(el: &RegularElement, vars: &ScriptVars) -> Option<String> {
    let attr = el.attributes.iter().find_map(|attr| match attr {
        Attribute::Attribute(node) if node.name.eq_ignore_ascii_case("type") => Some(node),
        _ => None,
    })?;
    let from_expression = |tag: &rsvelte_core::ast::template::ExpressionTag| {
        get_static_value(tag.expression.as_json(), vars)
            .as_ref()
            .and_then(JsValue::as_str)
            .map(str::to_lowercase)
    };
    match &attr.value {
        AttributeValue::Sequence(parts) if parts.len() == 1 => match &parts[0] {
            AttributeValuePart::Text(t) => Some(t.data.to_lowercase()),
            AttributeValuePart::ExpressionTag(tag) => from_expression(tag),
        },
        AttributeValue::Expression(tag) => from_expression(tag),
        _ => None,
    }
}

/// Whether the element carries a `type` that needs the script scope to resolve,
/// so the (whole-component) variable collection is only paid for when used.
fn type_needs_scope(el: &RegularElement) -> bool {
    el.attributes.iter().any(|attr| match attr {
        Attribute::Attribute(node) if node.name.eq_ignore_ascii_case("type") => match &node.value {
            AttributeValue::Expression(_) => true,
            AttributeValue::Sequence(parts) => {
                matches!(parts.as_slice(), [AttributeValuePart::ExpressionTag(_)])
            }
            AttributeValue::True(_) => false,
        },
        _ => false,
    })
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

/// Collect every `<input>` in the template. Upstream's selector is
/// `SvelteElement[name.name='input']`, so the element name matches exactly.
fn collect_inputs<'b, 'a>(fragment: &'b Fragment<'a>, out: &mut Vec<&'b RegularElement<'a>>) {
    for node in &fragment.nodes {
        collect_inputs_in_node(node, out);
    }
}

fn collect_inputs_in_node<'b, 'a>(
    node: &'b TemplateNode<'a>,
    out: &mut Vec<&'b RegularElement<'a>>,
) {
    match node {
        TemplateNode::RegularElement(el) => {
            if el.name == "input" {
                out.push(el);
            }
            collect_inputs(&el.fragment, out);
        }
        TemplateNode::Component(c) => collect_inputs(&c.fragment, out),
        TemplateNode::SvelteComponent(c) => collect_inputs(&c.fragment, out),
        TemplateNode::SvelteElement(e) => collect_inputs(&e.fragment, out),
        TemplateNode::SlotElement(e) => collect_inputs(&e.fragment, out),
        TemplateNode::TitleElement(e) => collect_inputs(&e.fragment, out),
        TemplateNode::SvelteHead(e)
        | TemplateNode::SvelteBody(e)
        | TemplateNode::SvelteDocument(e)
        | TemplateNode::SvelteFragment(e)
        | TemplateNode::SvelteBoundary(e)
        | TemplateNode::SvelteOptions(e)
        | TemplateNode::SvelteSelf(e)
        | TemplateNode::SvelteWindow(e) => collect_inputs(&e.fragment, out),
        TemplateNode::IfBlock(b) => {
            collect_inputs(&b.consequent, out);
            if let Some(alternate) = &b.alternate {
                collect_inputs(alternate, out);
            }
        }
        TemplateNode::EachBlock(b) => {
            collect_inputs(&b.body, out);
            if let Some(fallback) = &b.fallback {
                collect_inputs(fallback, out);
            }
        }
        TemplateNode::AwaitBlock(b) => {
            for fragment in [b.pending.as_ref(), b.then.as_ref(), b.catch.as_ref()]
                .into_iter()
                .flatten()
            {
                collect_inputs(fragment, out);
            }
        }
        TemplateNode::KeyBlock(b) => collect_inputs(&b.fragment, out),
        TemplateNode::SnippetBlock(b) => collect_inputs(&b.body, out),
        _ => {}
    }
}

#[derive(Default)]
pub struct NoBindValueOnCheckableInputs;

impl Rule for NoBindValueOnCheckableInputs {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        let mut inputs = Vec::new();
        collect_inputs(&root.fragment, &mut inputs);
        if inputs.is_empty() {
            return;
        }
        let vars = if inputs.iter().any(|el| type_needs_scope(el)) {
            ScriptVars::from_root_json(&ctx.root_json(root))
        } else {
            ScriptVars::default()
        };

        for el in inputs {
            let Some(kind) = static_type(el, &vars) else {
                continue;
            };
            if kind != "checkbox" && kind != "radio" {
                continue;
            }
            let Some(bind) = el.attributes.iter().find_map(|a| match a {
                Attribute::BindDirective(b) if b.name == "value" => Some(b),
                _ => None,
            }) else {
                continue;
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
}
