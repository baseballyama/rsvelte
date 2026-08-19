//! `svelte/prefer-style-directive` — suggest `style:prop` directives instead of
//! `style="prop: value"` attribute declarations.
//!
//! Port of `eslint-plugin-svelte/src/rules/prefer-style-directive.ts` on the
//! shared `parseStyleAttributeValue` model. Applies to HTML elements and
//! `<svelte:element>` (upstream `isHTMLElementLike`); components are excluded.
//!
//! Two cases:
//! 1. **Declaration** — reported unless it is `!important`, or an interpolation
//!    lands in the property name / an unknown position.
//! 2. **Inline ternary** — a top-level `{cond ? 'prop: value' : ''}` mustache
//!    whose non-empty branch holds exactly one declaration.

use serde_json::Value;

use rsvelte_core::ast::template::{
    Attribute, RegularElement, SlotElement, SvelteDynamicElement, TitleElement,
};

use super::shared::style_decls::{
    StyleDecl, StyleInline, StyleNode, StyleRoot, inline_style_of_expr, parse_style_attr,
};
use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{node_end, node_start, node_type};

static META: RuleMeta = RuleMeta {
    name: "svelte/prefer-style-directive",
    category: RuleCategory::Style,
    fixable: Fixable::Code,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "require style directives instead of style attribute",
    options_schema: None,
};

const MESSAGE: &str = "Can use style directives instead.";

fn is_string_literal(node: &Value) -> bool {
    node_type(node) == Some("Literal") && node.get("value").is_some_and(Value::is_string)
}

/// Upstream `removeStyle`.
fn remove_style_edit(root: &StyleRoot<'_>, idx: usize) -> TextEdit {
    let node = &root.nodes[idx];
    if let Some(after) = root.nodes.get(idx + 1) {
        TextEdit {
            start: node.start(),
            end: after.start(),
            new_text: String::new(),
        }
    } else if idx > 0 {
        TextEdit {
            start: root.nodes[idx - 1].end(),
            end: node.end(),
            new_text: String::new(),
        }
    } else {
        TextEdit {
            start: node.start(),
            end: node.end(),
            new_text: String::new(),
        }
    }
}

fn build_fix(
    root: &StyleRoot<'_>,
    idx: usize,
    directive: String,
    attr_start: u32,
    attr_end: u32,
) -> Fix {
    let edits = if root.nodes.len() == 1 && idx == 0 {
        vec![TextEdit {
            start: attr_start,
            end: attr_end,
            new_text: directive,
        }]
    } else if idx == 0 {
        vec![
            remove_style_edit(root, idx),
            TextEdit {
                start: attr_start,
                end: attr_start,
                new_text: format!("{directive} "),
            },
        ]
    } else {
        vec![
            remove_style_edit(root, idx),
            TextEdit {
                start: attr_end,
                end: attr_end,
                new_text: format!(" {directive}"),
            },
        ]
    };
    Fix {
        message: "Replace with style directive".to_string(),
        edits,
    }
}

fn has_style_directive(attributes: &[Attribute], prop: &str) -> bool {
    attributes.iter().any(|a| {
        if let Attribute::StyleDirective(d) = a {
            d.name.as_str() == prop
        } else {
            false
        }
    })
}

#[allow(clippy::too_many_arguments)]
fn process_declaration(
    ctx: &mut LintContext,
    attributes: &[Attribute],
    root: &StyleRoot<'_>,
    idx: usize,
    decl: &StyleDecl,
    attr_start: u32,
    attr_end: u32,
    source: &str,
) {
    if decl.important
        || !decl.unknown_interpolations.is_empty()
        || !decl.prop_interpolations.is_empty()
    {
        return;
    }
    if has_style_directive(attributes, &decl.prop_name) {
        return;
    }
    let value = &source[decl.value_start as usize..decl.value_end as usize];
    let directive = format!("style:{}=\"{value}\"", decl.prop_name);
    let fix = build_fix(root, idx, directive, attr_start, attr_end);
    ctx.report_with_fix(decl.start, decl.end, MESSAGE, fix);
}

#[allow(clippy::too_many_arguments)]
fn process_inline(
    ctx: &mut LintContext,
    attributes: &[Attribute],
    root: &StyleRoot<'_>,
    idx: usize,
    inline: &StyleInline<'_>,
    attr_start: u32,
    attr_end: u32,
    source: &str,
) {
    let expr = inline.expr;
    if node_type(expr) != Some("ConditionalExpression") {
        return;
    }
    let (Some(test), Some(consequent), Some(alternate)) = (
        expr.get("test"),
        expr.get("consequent"),
        expr.get("alternate"),
    ) else {
        return;
    };
    if !is_string_literal(consequent) || !is_string_literal(alternate) {
        return;
    }
    let c_val = consequent
        .get("value")
        .and_then(Value::as_str)
        .unwrap_or_default();
    let a_val = alternate
        .get("value")
        .and_then(Value::as_str)
        .unwrap_or_default();
    if !c_val.is_empty() && !a_val.is_empty() {
        // e.g. t ? 'top: 20px' : 'left: 30px'
        return;
    }

    let positive = a_val.is_empty();
    let branch = if positive { consequent } else { alternate };
    let Some(inline_root) = inline_style_of_expr(branch, source) else {
        return;
    };
    if inline_root.nodes.len() != 1 {
        return;
    }
    let StyleNode::Decl(decl) = &inline_root.nodes[0] else {
        return;
    };
    if has_style_directive(attributes, &decl.prop_name) {
        return;
    }

    let (Some(e_start), Some(e_end)) = (node_start(expr), node_end(expr)) else {
        return;
    };
    let (Some(t_start), Some(c_start), Some(c_end), Some(a_start), Some(a_end)) = (
        node_start(test),
        node_start(consequent),
        node_end(consequent),
        node_start(alternate),
        node_end(alternate),
    ) else {
        return;
    };

    let s = |a: u32, b: u32| &source[a as usize..b as usize];
    let mut value_text = String::new();
    value_text += s(t_start, c_start);
    if positive {
        value_text += s(c_start, c_start + 1);
        value_text += &decl.value_text;
        value_text += s(c_end - 1, c_end);
    } else {
        value_text += "null";
    }
    value_text += s(c_end, a_start);
    if positive {
        value_text += "null";
    } else {
        value_text += s(a_start, a_start + 1);
        value_text += &decl.value_text;
        value_text += s(a_end - 1, a_end);
    }
    let directive = format!("style:{}={{{value_text}}}", decl.prop_name);
    let fix = build_fix(root, idx, directive, attr_start, attr_end);
    ctx.report_with_fix(e_start, e_end, MESSAGE, fix);
}

fn check_style_attr(ctx: &mut LintContext, attributes: &[Attribute]) {
    let style_attr = attributes.iter().find_map(|attr| {
        if let Attribute::Attribute(node) = attr
            && node.name.as_str() == "style"
        {
            return Some(node);
        }
        None
    });
    let Some(style_attr) = style_attr else {
        return;
    };

    let source = ctx.source();
    let Some(root) = parse_style_attr(&style_attr.value, source) else {
        return;
    };

    for (idx, child) in root.nodes.iter().enumerate() {
        match child {
            StyleNode::Decl(decl) => process_declaration(
                ctx,
                attributes,
                &root,
                idx,
                decl,
                style_attr.start,
                style_attr.end,
                source,
            ),
            StyleNode::Inline(inline) => process_inline(
                ctx,
                attributes,
                &root,
                idx,
                inline,
                style_attr.start,
                style_attr.end,
                source,
            ),
            StyleNode::Comment { .. } => {}
        }
    }
}

#[derive(Default)]
pub struct PreferStyleDirective;

impl Rule for PreferStyleDirective {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_element(&self, ctx: &mut LintContext, el: &RegularElement) {
        check_style_attr(ctx, &el.attributes);
    }

    fn check_svelte_dynamic_element(&self, ctx: &mut LintContext, el: &SvelteDynamicElement) {
        check_style_attr(ctx, &el.attributes);
    }

    // `<slot>` and `<title>` are `SvelteHTMLElement` (kind `html`) to svelte-eslint-parser.
    fn check_slot(&self, ctx: &mut LintContext, el: &SlotElement) {
        check_style_attr(ctx, &el.attributes);
    }

    fn check_title(&self, ctx: &mut LintContext, el: &TitleElement) {
        check_style_attr(ctx, &el.attributes);
    }
}
