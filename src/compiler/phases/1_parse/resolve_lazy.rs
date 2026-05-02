//! Resolve lazy expressions in the AST.
//!
//! When `defer_script_parse` is enabled, template expressions are stored as
//! `Expression::Lazy { start, end, ts }` during parse(). This module walks
//! the AST and resolves them into `Expression::Typed` by invoking OXC.

use crate::ast::arena::ParseArena;
use crate::ast::js::Expression;
use crate::ast::template::{
    Attribute, AttributeValue, AttributeValuePart, Fragment, Root, TemplateNode,
};

/// Resolve all lazy expressions and deferred CSS in the AST.
/// Must be called before analysis.
/// Returns the first JS parse error encountered, if any.
pub fn resolve_lazy_expressions(ast: &mut Root, source: &str) -> Option<crate::error::ParseError> {
    let line_offsets = super::compute_line_offsets(source, false);
    let mut first_error = None;
    resolve_fragment(
        &ast.arena,
        &mut ast.fragment,
        &line_offsets,
        source,
        &mut first_error,
    );

    // Resolve in instance/module scripts (unlikely to have Lazy, but be safe)
    if let Some(ref mut instance) = ast.instance {
        resolve_expression(
            &ast.arena,
            &mut instance.content,
            &line_offsets,
            source,
            &mut first_error,
        );
    }
    if let Some(ref mut module) = ast.module {
        resolve_expression(
            &ast.arena,
            &mut module.content,
            &line_offsets,
            source,
            &mut first_error,
        );
    }

    // Resolve deferred CSS parsing. Use the strict variant so that errors
    // raised by the official-style CSS parser (e.g. `css_expected_identifier`)
    // surface to callers instead of being swallowed.
    if let Some(ref mut stylesheet) = ast.css
        && stylesheet.children.is_empty()
        && !stylesheet.content.styles.is_empty()
    {
        match super::read::style::parse_css_strict(
            &stylesheet.content.styles,
            stylesheet.content.start as usize,
        ) {
            Ok(children) => stylesheet.children = children,
            Err(err) => {
                if first_error.is_none() {
                    first_error = Some(err);
                }
            }
        }
    }

    first_error
}

fn resolve_fragment(
    arena: &ParseArena,
    fragment: &mut Fragment,
    line_offsets: &[usize],
    source: &str,
    first_error: &mut Option<crate::error::ParseError>,
) {
    for node in &mut fragment.nodes {
        resolve_template_node(arena, node, line_offsets, source, first_error);
    }
}

fn resolve_template_node(
    arena: &ParseArena,
    node: &mut TemplateNode,
    line_offsets: &[usize],
    source: &str,
    first_error: &mut Option<crate::error::ParseError>,
) {
    match node {
        TemplateNode::ExpressionTag(tag) => {
            resolve_expression(
                arena,
                &mut tag.expression,
                line_offsets,
                source,
                first_error,
            );
        }
        TemplateNode::HtmlTag(tag) => {
            resolve_expression(
                arena,
                &mut tag.expression,
                line_offsets,
                source,
                first_error,
            );
        }
        TemplateNode::ConstTag(tag) => {
            resolve_expression(
                arena,
                &mut tag.declaration,
                line_offsets,
                source,
                first_error,
            );
        }
        TemplateNode::DebugTag(tag) => {
            for expr in &mut tag.identifiers {
                resolve_expression(arena, expr, line_offsets, source, first_error);
            }
        }
        TemplateNode::RenderTag(tag) => {
            resolve_expression(
                arena,
                &mut tag.expression,
                line_offsets,
                source,
                first_error,
            );
        }
        TemplateNode::AttachTag(tag) => {
            resolve_expression(
                arena,
                &mut tag.expression,
                line_offsets,
                source,
                first_error,
            );
        }
        TemplateNode::IfBlock(block) => {
            resolve_expression(arena, &mut block.test, line_offsets, source, first_error);
            resolve_fragment(
                arena,
                &mut block.consequent,
                line_offsets,
                source,
                first_error,
            );
            if let Some(ref mut alt) = block.alternate {
                resolve_fragment(arena, alt, line_offsets, source, first_error);
            }
        }
        TemplateNode::EachBlock(block) => {
            resolve_expression(
                arena,
                &mut block.expression,
                line_offsets,
                source,
                first_error,
            );
            if let Some(ref mut ctx) = block.context {
                resolve_expression(arena, ctx, line_offsets, source, first_error);
            }
            if let Some(ref mut key) = block.key {
                resolve_expression(arena, key, line_offsets, source, first_error);
            }
            resolve_fragment(arena, &mut block.body, line_offsets, source, first_error);
            if let Some(ref mut fallback) = block.fallback {
                resolve_fragment(arena, fallback, line_offsets, source, first_error);
            }
        }
        TemplateNode::AwaitBlock(block) => {
            resolve_expression(
                arena,
                &mut block.expression,
                line_offsets,
                source,
                first_error,
            );
            if let Some(ref mut val) = block.value {
                resolve_expression(arena, val, line_offsets, source, first_error);
            }
            if let Some(ref mut err) = block.error {
                resolve_expression(arena, err, line_offsets, source, first_error);
            }
            if let Some(ref mut pending) = block.pending {
                resolve_fragment(arena, pending, line_offsets, source, first_error);
            }
            if let Some(ref mut then) = block.then {
                resolve_fragment(arena, then, line_offsets, source, first_error);
            }
            if let Some(ref mut catch) = block.catch {
                resolve_fragment(arena, catch, line_offsets, source, first_error);
            }
        }
        TemplateNode::KeyBlock(block) => {
            resolve_expression(
                arena,
                &mut block.expression,
                line_offsets,
                source,
                first_error,
            );
            resolve_fragment(
                arena,
                &mut block.fragment,
                line_offsets,
                source,
                first_error,
            );
        }
        TemplateNode::SnippetBlock(block) => {
            resolve_expression(
                arena,
                &mut block.expression,
                line_offsets,
                source,
                first_error,
            );
            for param in &mut block.parameters {
                resolve_expression(arena, param, line_offsets, source, first_error);
            }
            resolve_fragment(arena, &mut block.body, line_offsets, source, first_error);
        }
        // Elements with children and attributes
        TemplateNode::RegularElement(el) => {
            resolve_attributes(arena, &mut el.attributes, line_offsets, source, first_error);
            resolve_fragment(arena, &mut el.fragment, line_offsets, source, first_error);
        }
        TemplateNode::Component(el) => {
            resolve_attributes(arena, &mut el.attributes, line_offsets, source, first_error);
            resolve_fragment(arena, &mut el.fragment, line_offsets, source, first_error);
        }
        TemplateNode::SvelteComponent(el) => {
            resolve_expression(arena, &mut el.expression, line_offsets, source, first_error);
            resolve_attributes(arena, &mut el.attributes, line_offsets, source, first_error);
            resolve_fragment(arena, &mut el.fragment, line_offsets, source, first_error);
        }
        TemplateNode::SvelteElement(el) => {
            resolve_expression(arena, &mut el.tag, line_offsets, source, first_error);
            resolve_attributes(arena, &mut el.attributes, line_offsets, source, first_error);
            resolve_fragment(arena, &mut el.fragment, line_offsets, source, first_error);
        }
        TemplateNode::TitleElement(el) => {
            resolve_attributes(arena, &mut el.attributes, line_offsets, source, first_error);
            resolve_fragment(arena, &mut el.fragment, line_offsets, source, first_error);
        }
        TemplateNode::SlotElement(el) => {
            resolve_attributes(arena, &mut el.attributes, line_offsets, source, first_error);
            resolve_fragment(arena, &mut el.fragment, line_offsets, source, first_error);
        }
        TemplateNode::SvelteHead(el) => {
            resolve_attributes(arena, &mut el.attributes, line_offsets, source, first_error);
            resolve_fragment(arena, &mut el.fragment, line_offsets, source, first_error);
        }
        TemplateNode::SvelteBody(el) => {
            resolve_attributes(arena, &mut el.attributes, line_offsets, source, first_error);
            resolve_fragment(arena, &mut el.fragment, line_offsets, source, first_error);
        }
        TemplateNode::SvelteWindow(el) => {
            resolve_attributes(arena, &mut el.attributes, line_offsets, source, first_error);
            resolve_fragment(arena, &mut el.fragment, line_offsets, source, first_error);
        }
        TemplateNode::SvelteDocument(el) => {
            resolve_attributes(arena, &mut el.attributes, line_offsets, source, first_error);
            resolve_fragment(arena, &mut el.fragment, line_offsets, source, first_error);
        }
        TemplateNode::SvelteSelf(el) => {
            resolve_attributes(arena, &mut el.attributes, line_offsets, source, first_error);
            resolve_fragment(arena, &mut el.fragment, line_offsets, source, first_error);
        }
        TemplateNode::SvelteFragment(el) => {
            resolve_attributes(arena, &mut el.attributes, line_offsets, source, first_error);
            resolve_fragment(arena, &mut el.fragment, line_offsets, source, first_error);
        }
        TemplateNode::SvelteOptions(el) | TemplateNode::SvelteBoundary(el) => {
            resolve_attributes(arena, &mut el.attributes, line_offsets, source, first_error);
            resolve_fragment(arena, &mut el.fragment, line_offsets, source, first_error);
        }
        // Terminal nodes with no expressions
        TemplateNode::Text(_) | TemplateNode::Comment(_) => {}
    }
}

fn resolve_attributes(
    arena: &ParseArena,
    attrs: &mut [Attribute],
    line_offsets: &[usize],
    source: &str,
    first_error: &mut Option<crate::error::ParseError>,
) {
    for attr in attrs.iter_mut() {
        match attr {
            Attribute::Attribute(a) => {
                resolve_attribute_value(arena, &mut a.value, line_offsets, source, first_error);
            }
            Attribute::SpreadAttribute(s) => {
                resolve_expression(arena, &mut s.expression, line_offsets, source, first_error);
            }
            Attribute::BindDirective(b) => {
                resolve_expression(arena, &mut b.expression, line_offsets, source, first_error);
            }
            Attribute::OnDirective(o) => {
                if let Some(ref mut expr) = o.expression {
                    resolve_expression(arena, expr, line_offsets, source, first_error);
                }
            }
            Attribute::ClassDirective(c) => {
                resolve_expression(arena, &mut c.expression, line_offsets, source, first_error);
            }
            Attribute::StyleDirective(s) => {
                resolve_attribute_value(arena, &mut s.value, line_offsets, source, first_error);
            }
            Attribute::TransitionDirective(t) => {
                if let Some(ref mut expr) = t.expression {
                    resolve_expression(arena, expr, line_offsets, source, first_error);
                }
            }
            Attribute::AnimateDirective(a) => {
                if let Some(ref mut expr) = a.expression {
                    resolve_expression(arena, expr, line_offsets, source, first_error);
                }
            }
            Attribute::UseDirective(u) => {
                if let Some(ref mut expr) = u.expression {
                    resolve_expression(arena, expr, line_offsets, source, first_error);
                }
            }
            Attribute::LetDirective(l) => {
                if let Some(ref mut expr) = l.expression {
                    resolve_expression(arena, expr, line_offsets, source, first_error);
                }
            }
            Attribute::AttachTag(a) => {
                resolve_expression(arena, &mut a.expression, line_offsets, source, first_error);
            }
        }
    }
}

fn resolve_attribute_value(
    arena: &ParseArena,
    value: &mut AttributeValue,
    line_offsets: &[usize],
    source: &str,
    first_error: &mut Option<crate::error::ParseError>,
) {
    match value {
        AttributeValue::Expression(expr_tag) => {
            resolve_expression(
                arena,
                &mut expr_tag.expression,
                line_offsets,
                source,
                first_error,
            );
        }
        AttributeValue::Sequence(parts) => {
            for part in parts.iter_mut() {
                if let AttributeValuePart::ExpressionTag(expr_tag) = part {
                    resolve_expression(
                        arena,
                        &mut expr_tag.expression,
                        line_offsets,
                        source,
                        first_error,
                    );
                }
            }
        }
        AttributeValue::True(_) => {}
    }
}

/// Resolve a single lazy expression by parsing it with OXC.
/// If parsing fails and first_error is None, stores the error.
fn resolve_expression(
    arena: &ParseArena,
    expr: &mut Expression,
    line_offsets: &[usize],
    source: &str,
    first_error: &mut Option<crate::error::ParseError>,
) {
    if let Expression::Lazy { start, end, ts } = expr {
        let content = &source[*start as usize..*end as usize];
        let result = super::read::expression::parse_expression(
            arena,
            content,
            *start as usize,
            line_offsets,
            "",    // source not needed for loose/disallow_loose=false
            false, // loose
            false, // disallow_loose
            '{',
            *ts,
        );
        match result {
            Ok(parsed) => {
                *expr = parsed;
            }
            Err((msg, pos)) => {
                // Store the first parse error encountered
                if first_error.is_none() {
                    *first_error = Some(crate::error::ParseError::svelte(
                        "js_parse_error",
                        msg,
                        (pos, pos + content.len()),
                    ));
                }
                // Still set the expression to something valid to allow continued processing
                *expr =
                    super::read::expression::create_empty_identifier("", pos, pos + content.len());
            }
        }
    }
}
