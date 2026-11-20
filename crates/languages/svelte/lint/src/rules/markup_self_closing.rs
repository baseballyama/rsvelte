use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::Fix;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::names::is_component_name;
use rsvelte_svelte_syntax::syntax_tree::{TemplateNode, TokenType, decode_text};
use serde::Deserialize;

use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/html-self-closing",
    files: Files::Components,
    configure,
};

#[derive(Clone, Copy, Debug, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
enum Value {
    Never,
    Always,
    Ignore,
}

/// By element type: void, normal, svg, math, component, svelte.
type Values = [Value; 6];

#[derive(Deserialize)]
#[serde(untagged)]
enum Options {
    Preset(Preset),
    Types(Types),
}

#[derive(Deserialize)]
#[serde(rename_all = "lowercase")]
enum Preset {
    All,
    #[serde(rename = "html")]
    Markup,
    None,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Types {
    void: Option<Value>,
    normal: Option<Value>,
    svg: Option<Value>,
    math: Option<Value>,
    component: Option<Value>,
    svelte: Option<Value>,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    use Value::{Always, Never};
    const DEFAULT: Values = [Always, Never, Always, Never, Always, Always];
    let values = match options.get::<Options>(0)? {
        _ if options.options.len() > 1 => return Err("takes one option".to_owned()),
        None => DEFAULT,
        Some(Options::Preset(Preset::All)) => [Always; 6],
        Some(Options::Preset(Preset::Markup)) => [Always, Never, Always, Never, Never, Always],
        Some(Options::Preset(Preset::None)) => [Never; 6],
        Some(Options::Types(types)) => {
            let given = [
                types.void,
                types.normal,
                types.svg,
                types.math,
                types.component,
                types.svelte,
            ];
            std::array::from_fn(|i| given[i].unwrap_or(DEFAULT[i]))
        }
    };
    Ok(Box::new(MarkupSelfClosing(values)))
}

const TYPES: [&str; 6] = [
    "HTML void elements",
    "HTML elements",
    "SVG elements",
    "MathML elements",
    "Svelte custom components",
    "Svelte special elements",
];

#[derive(Debug)]
struct MarkupSelfClosing(Values);

impl SvelteRule for MarkupSelfClosing {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        for node in &component.nodes {
            let TemplateNode::Element {
                name,
                children,
                start_tag,
                self_closing,
                span,
                ..
            } = *node
            else {
                continue;
            };
            let children = component.children(children);
            let empty = children.iter().all(|&child| match component.node(child) {
                // The decoded text, as `svelte-eslint-parser`'s `value` is.
                TemplateNode::Text { span } => decode_text(span.text(source))
                    .chars()
                    .all(is_ecmascript_whitespace),
                _ => false,
            });
            if !empty {
                continue;
            }
            let name_text = name.text(source);
            let kind = element_type(name_text);
            let should_close = match self.0[kind] {
                Value::Ignore => continue,
                Value::Always => true,
                Value::Never => false,
            };
            if should_close == self_closing {
                continue;
            }
            let end = start_tag.end_offset;
            let at = Span::new(end - if self_closing { 2 } else { 1 }, span.end_offset);
            let mut fix = Fix::new();
            if should_close {
                for &child in children {
                    fix.push(component.node(child).span(), "");
                }
                fix.push(Span::new(end - 1, end - 1), "/");
                let end_tag = component
                    .tokens
                    .within(Span::new(end, span.end_offset))
                    .iter()
                    .rfind(|token| token.kind == TokenType::EndTagOpen);
                if let Some(end_tag) = end_tag {
                    fix.push(Span::new(end_tag.span.start_offset, span.end_offset), "");
                }
            } else {
                fix.push(Span::new(end - 2, end - 1), "");
                if kind != VOID {
                    fix.push(
                        Span::new(span.end_offset, span.end_offset),
                        format!("</{name_text}>"),
                    );
                }
            }
            let verb = if should_close { "Require" } else { "Disallow" };
            reporter.report(
                Report::range(format!("{verb} self-closing on {}.", TYPES[kind]), at).fix(fix),
            );
        }
    }
}

const VOID: usize = 0;

/// An index into [`Values`]. eslint-plugin-svelte's void elements (`src/utils/element-types.ts`)
/// add the obsolete `keygen` and `menuitem` to HTML's; its SVG and math lists are Svelte's.
fn element_type(name: &str) -> usize {
    if is_component_name(name) {
        4
    } else if name.starts_with("svelte:") {
        5
    } else if rsvelte_markup_syntax::is_void(name) || matches!(name, "keygen" | "menuitem") {
        VOID
    } else if rsvelte_svelte_semantic::names::is_svg(name) {
        2
    } else if rsvelte_svelte_semantic::names::is_mathml(name) {
        3
    } else {
        1
    }
}
