use oxc_allocator::Allocator;
use oxc_formatter::Formatter;
use oxc_parser::{ParseOptions as OxcParseOptions, Parser};
use oxc_span::SourceType;
use svelte_compiler_rust::ast::js::Expression;
use svelte_compiler_rust::ast::template::{
    Attribute, AttributeValue, AttributeValuePart, ExpressionTag, Fragment, TemplateNode,
};

use crate::error::FormatError;
use crate::options::FormatOptions;

fn formatter_parse_options() -> OxcParseOptions {
    OxcParseOptions {
        preserve_parens: false,
        ..OxcParseOptions::default()
    }
}

/// Walk a `Fragment` recursively, appending `(start, end, replacement)`
/// edits for every JS expression we can safely format.
pub(crate) fn collect_template_edits(
    source: &str,
    fragment: &Fragment,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    for node in &fragment.nodes {
        collect_node_edits(source, node, options, edits)?;
    }
    Ok(())
}

fn collect_node_edits(
    source: &str,
    node: &TemplateNode,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    match node {
        TemplateNode::ExpressionTag(tag) => {
            push_expression_tag(source, tag, options, edits)?;
        }
        TemplateNode::HtmlTag(tag) => {
            push_tag_form(
                source,
                tag.start,
                tag.end,
                "@html",
                &tag.expression,
                options,
                edits,
            )?;
        }
        TemplateNode::RenderTag(tag) => {
            push_tag_form(
                source,
                tag.start,
                tag.end,
                "@render",
                &tag.expression,
                options,
                edits,
            )?;
        }
        TemplateNode::AttachTag(tag) => {
            push_tag_form(
                source,
                tag.start,
                tag.end,
                "@attach",
                &tag.expression,
                options,
                edits,
            )?;
        }
        TemplateNode::DebugTag(tag) => {
            push_debug_tag(source, tag.start, tag.end, &tag.identifiers, options, edits)?;
        }
        TemplateNode::ConstTag(_) | TemplateNode::DeclarationTag(_) => {
            // Statement-shaped tags (`{@const x = e}`, `{let x = e}`,
            // `{const x = e}`) — defer until statement formatting lands.
        }
        TemplateNode::RegularElement(elem) => {
            collect_attribute_list_edits(source, &elem.attributes, options, edits)?;
            collect_template_edits(source, &elem.fragment, options, edits)?;
        }
        TemplateNode::Component(c) => {
            collect_attribute_list_edits(source, &c.attributes, options, edits)?;
            collect_template_edits(source, &c.fragment, options, edits)?;
        }
        TemplateNode::TitleElement(t) => {
            collect_attribute_list_edits(source, &t.attributes, options, edits)?;
            collect_template_edits(source, &t.fragment, options, edits)?;
        }
        TemplateNode::SlotElement(s) => {
            collect_attribute_list_edits(source, &s.attributes, options, edits)?;
            collect_template_edits(source, &s.fragment, options, edits)?;
        }
        TemplateNode::SvelteHead(s)
        | TemplateNode::SvelteBody(s)
        | TemplateNode::SvelteDocument(s)
        | TemplateNode::SvelteFragment(s)
        | TemplateNode::SvelteBoundary(s)
        | TemplateNode::SvelteOptions(s)
        | TemplateNode::SvelteSelf(s)
        | TemplateNode::SvelteWindow(s) => {
            collect_attribute_list_edits(source, &s.attributes, options, edits)?;
            collect_template_edits(source, &s.fragment, options, edits)?;
        }
        TemplateNode::SvelteComponent(c) => {
            collect_attribute_list_edits(source, &c.attributes, options, edits)?;
            push_brace_wrapped_expression(source, &c.expression, options, edits)?;
            collect_template_edits(source, &c.fragment, options, edits)?;
        }
        TemplateNode::SvelteElement(e) => {
            collect_attribute_list_edits(source, &e.attributes, options, edits)?;
            push_brace_wrapped_expression(source, &e.tag, options, edits)?;
            collect_template_edits(source, &e.fragment, options, edits)?;
        }
        TemplateNode::IfBlock(blk) => {
            push_bare_expression(source, &blk.test, options, edits)?;
            collect_template_edits(source, &blk.consequent, options, edits)?;
            if let Some(alt) = &blk.alternate {
                collect_template_edits(source, alt, options, edits)?;
            }
        }
        TemplateNode::EachBlock(blk) => {
            push_bare_expression(source, &blk.expression, options, edits)?;
            if let Some(key) = &blk.key {
                push_brace_wrapped_expression(source, key, options, edits)?;
            }
            // `context` is a destructuring pattern — defer.
            collect_template_edits(source, &blk.body, options, edits)?;
            if let Some(fb) = &blk.fallback {
                collect_template_edits(source, fb, options, edits)?;
            }
        }
        TemplateNode::AwaitBlock(blk) => {
            push_bare_expression(source, &blk.expression, options, edits)?;
            // `value` / `error` are patterns — defer.
            if let Some(frag) = &blk.pending {
                collect_template_edits(source, frag, options, edits)?;
            }
            if let Some(frag) = &blk.then {
                collect_template_edits(source, frag, options, edits)?;
            }
            if let Some(frag) = &blk.catch {
                collect_template_edits(source, frag, options, edits)?;
            }
        }
        TemplateNode::KeyBlock(blk) => {
            push_bare_expression(source, &blk.expression, options, edits)?;
            collect_template_edits(source, &blk.fragment, options, edits)?;
        }
        TemplateNode::SnippetBlock(blk) => {
            push_bare_expression(source, &blk.expression, options, edits)?;
            collect_template_edits(source, &blk.body, options, edits)?;
        }
        TemplateNode::Text(_) | TemplateNode::Comment(_) => {}
    }
    Ok(())
}

fn collect_attribute_list_edits(
    source: &str,
    attributes: &[Attribute],
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    for attr in attributes {
        match attr {
            Attribute::Attribute(node) => {
                collect_attribute_value_edits(source, &node.value, options, edits)?;
            }
            Attribute::SpreadAttribute(spread) => {
                push_spread_attribute(
                    source,
                    spread.start,
                    spread.end,
                    &spread.expression,
                    options,
                    edits,
                )?;
            }
            Attribute::AttachTag(attach) => {
                push_tag_form(
                    source,
                    attach.start,
                    attach.end,
                    "@attach",
                    &attach.expression,
                    options,
                    edits,
                )?;
            }
            Attribute::BindDirective(d) => {
                push_brace_wrapped_expression(source, &d.expression, options, edits)?;
            }
            Attribute::ClassDirective(d) => {
                push_brace_wrapped_expression(source, &d.expression, options, edits)?;
            }
            Attribute::OnDirective(d) => {
                if let Some(expr) = &d.expression {
                    push_brace_wrapped_expression(source, expr, options, edits)?;
                }
            }
            Attribute::TransitionDirective(d) => {
                if let Some(expr) = &d.expression {
                    push_brace_wrapped_expression(source, expr, options, edits)?;
                }
            }
            Attribute::AnimateDirective(d) => {
                if let Some(expr) = &d.expression {
                    push_brace_wrapped_expression(source, expr, options, edits)?;
                }
            }
            Attribute::UseDirective(d) => {
                if let Some(expr) = &d.expression {
                    push_brace_wrapped_expression(source, expr, options, edits)?;
                }
            }
            Attribute::StyleDirective(d) => {
                collect_attribute_value_edits(source, &d.value, options, edits)?;
            }
            Attribute::LetDirective(_) => {
                // `let:item={pattern}` — value side is a destructuring
                // pattern. Defer until pattern formatting is in.
            }
        }
    }
    Ok(())
}

fn collect_attribute_value_edits(
    source: &str,
    value: &AttributeValue,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    match value {
        AttributeValue::True(_) => {}
        AttributeValue::Expression(tag) => {
            push_expression_tag(source, tag, options, edits)?;
        }
        AttributeValue::Sequence(parts) => {
            for part in parts {
                if let AttributeValuePart::ExpressionTag(tag) = part {
                    push_expression_tag(source, tag, options, edits)?;
                }
            }
        }
    }
    Ok(())
}

// ─── Splice strategies ──────────────────────────────────────────────────

/// Replace `{...}` (template-position or attribute-value `ExpressionTag`)
/// with the formatted expression body wrapped in braces. Collapses any
/// whitespace inside the braces.
fn push_expression_tag(
    source: &str,
    tag: &ExpressionTag,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    let outer = source
        .get(tag.start as usize..tag.end as usize)
        .ok_or_else(|| FormatError::Parse("expression tag span out of bounds".into()))?;
    let inner = outer
        .strip_prefix('{')
        .and_then(|s| s.strip_suffix('}'))
        .ok_or_else(|| FormatError::Parse("expression tag missing braces".into()))?
        .trim();

    if inner.is_empty() {
        return Ok(());
    }

    let formatted = format_expression_source(inner, options)?;
    edits.push((tag.start, tag.end, format!("{{{formatted}}}")));
    Ok(())
}

/// Replace `{@<keyword> EXPR}` (full tag span) with the formatted expression
/// body and a single space after the keyword.
fn push_tag_form(
    source: &str,
    tag_start: u32,
    tag_end: u32,
    keyword: &str,
    expr: &Expression,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    let (Some(start), Some(end)) = (expr.start(), expr.end()) else {
        return Ok(());
    };
    let slice = source
        .get(start as usize..end as usize)
        .ok_or_else(|| FormatError::Parse("tag expression span out of bounds".into()))?
        .trim();
    if slice.is_empty() {
        return Ok(());
    }
    let formatted = format_expression_source(slice, options)?;
    edits.push((tag_start, tag_end, format!("{{{keyword} {formatted}}}")));
    Ok(())
}

/// Replace `{@debug a, b, c}` with each identifier formatted, joined by
/// a comma + single space.
fn push_debug_tag(
    source: &str,
    tag_start: u32,
    tag_end: u32,
    identifiers: &[Expression],
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    let mut parts = Vec::with_capacity(identifiers.len());
    for id in identifiers {
        let (Some(start), Some(end)) = (id.start(), id.end()) else {
            continue;
        };
        let slice = source
            .get(start as usize..end as usize)
            .ok_or_else(|| FormatError::Parse("debug identifier span out of bounds".into()))?
            .trim();
        if slice.is_empty() {
            continue;
        }
        parts.push(format_expression_source(slice, options)?);
    }
    if parts.is_empty() {
        return Ok(());
    }
    let joined = parts.join(", ");
    edits.push((tag_start, tag_end, format!("{{@debug {joined}}}")));
    Ok(())
}

/// Replace `{...EXPR}` (spread-attribute full span) with the formatted
/// expression body prefixed by `...`.
fn push_spread_attribute(
    source: &str,
    attr_start: u32,
    attr_end: u32,
    expr: &Expression,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    let (Some(start), Some(end)) = (expr.start(), expr.end()) else {
        return Ok(());
    };
    let slice = source
        .get(start as usize..end as usize)
        .ok_or_else(|| FormatError::Parse("spread expression span out of bounds".into()))?
        .trim();
    if slice.is_empty() {
        return Ok(());
    }
    let formatted = format_expression_source(slice, options)?;
    edits.push((attr_start, attr_end, format!("{{...{formatted}}}")));
    Ok(())
}

/// Splice over an expression's enclosing `{ ... }` if the source has
/// `{ <ws> EXPR <ws> }` around the AST expression span (directive values,
/// `this={X}` etc.). If no such enclosure is detectable, splice just the
/// bare expression span (block headers like `{#if EXPR}` fall into this
/// branch — the `{#if ` keyword stops the back-scan).
fn push_brace_wrapped_expression(
    source: &str,
    expr: &Expression,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    let (Some(start), Some(end)) = (expr.start(), expr.end()) else {
        return Ok(());
    };
    let slice = source
        .get(start as usize..end as usize)
        .ok_or_else(|| FormatError::Parse("expression span out of bounds".into()))?
        .trim();
    if slice.is_empty() {
        return Ok(());
    }
    let formatted = format_expression_source(slice, options)?;

    if let Some((brace_start, brace_end)) = enclosing_braces_span(source, start, end) {
        edits.push((brace_start, brace_end, format!("{{{formatted}}}")));
    } else {
        edits.push((start, end, formatted));
    }
    Ok(())
}

/// Splice just the bare expression span — preserves whatever surrounds it
/// in the source. Used for block-header expressions (`{#if EXPR}`,
/// `{#each EXPR as ...}`, etc.) where the `{` is followed by a Svelte
/// keyword (`#if` / `#each` / ...) rather than the expression itself.
fn push_bare_expression(
    source: &str,
    expr: &Expression,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    let (Some(start), Some(end)) = (expr.start(), expr.end()) else {
        return Ok(());
    };
    let slice = source
        .get(start as usize..end as usize)
        .ok_or_else(|| FormatError::Parse("expression span out of bounds".into()))?
        .trim();
    if slice.is_empty() {
        return Ok(());
    }
    let formatted = format_expression_source(slice, options)?;
    edits.push((start, end, formatted));
    Ok(())
}

/// If the AST expression at `[expr_start, expr_end)` is enclosed by `{`
/// and `}` (only whitespace between brace and expression), return the
/// span covering the braces inclusive. Otherwise return `None`.
fn enclosing_braces_span(source: &str, expr_start: u32, expr_end: u32) -> Option<(u32, u32)> {
    let bytes = source.as_bytes();

    let mut lbrace = None;
    let mut i = expr_start as usize;
    while i > 0 {
        i -= 1;
        match bytes[i] {
            b' ' | b'\t' | b'\n' | b'\r' => continue,
            b'{' => {
                lbrace = Some(i);
                break;
            }
            _ => return None,
        }
    }
    let lbrace = lbrace?;

    let mut rbrace = None;
    let mut j = expr_end as usize;
    while j < bytes.len() {
        match bytes[j] {
            b' ' | b'\t' | b'\n' | b'\r' => j += 1,
            b'}' => {
                rbrace = Some(j);
                break;
            }
            _ => return None,
        }
    }
    let rbrace = rbrace?;

    Some((lbrace as u32, (rbrace + 1) as u32))
}

// ─── Expression formatter ───────────────────────────────────────────────

/// Format a single JS expression source. Wraps in parens to force
/// expression context (so object literals like `{a:1}` aren't parsed as
/// block statements) and strips the wrapper from the output.
pub(crate) fn format_expression_source(
    expr_source: &str,
    options: &FormatOptions,
) -> Result<String, FormatError> {
    let allocator = Allocator::default();
    let source_type = SourceType::default();

    let wrapped = format!("({expr_source});");
    let parser_ret = Parser::new(&allocator, &wrapped, source_type)
        .with_options(formatter_parse_options())
        .parse();
    if !parser_ret.errors.is_empty() {
        return Err(FormatError::ScriptParse(format!("{:?}", parser_ret.errors)));
    }

    let formatted = Formatter::new(&allocator, options.js.clone()).build(&parser_ret.program);

    let s = formatted.trim_end().trim_end_matches(';').trim_end();
    Ok(strip_outer_parens(s).trim().to_string())
}

fn strip_outer_parens(s: &str) -> &str {
    let trimmed = s.trim();
    let Some(inner) = trimmed.strip_prefix('(').and_then(|s| s.strip_suffix(')')) else {
        return s;
    };
    if outer_parens_match(inner) { inner } else { s }
}

fn outer_parens_match(inner: &str) -> bool {
    let mut depth: i32 = 0;
    for c in inner.chars() {
        match c {
            '(' => depth += 1,
            ')' => {
                depth -= 1;
                if depth < 0 {
                    return false;
                }
            }
            _ => {}
        }
    }
    depth == 0
}
