use oxc_allocator::Allocator;
use oxc_formatter::Formatter;
use oxc_parser::{ParseOptions as OxcParseOptions, Parser};
use oxc_span::SourceType;
use svelte_compiler_rust::ast::template::{ExpressionTag, Fragment, TemplateNode};

use crate::error::FormatError;
use crate::options::FormatOptions;

fn formatter_parse_options() -> OxcParseOptions {
    OxcParseOptions {
        preserve_parens: false,
        ..OxcParseOptions::default()
    }
}

/// Walk a `Fragment` recursively and append `(start, end, replacement)`
/// edits for every `{expression}` tag whose body can be formatted.
pub(crate) fn collect_expression_tag_edits(
    source: &str,
    fragment: &Fragment,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    for node in &fragment.nodes {
        match node {
            TemplateNode::ExpressionTag(tag) => {
                if let Some((start, end, formatted)) = format_expression_tag(source, tag, options)?
                {
                    edits.push((start, end, formatted));
                }
            }
            TemplateNode::RegularElement(elem) => {
                collect_expression_tag_edits(source, &elem.fragment, options, edits)?;
            }
            TemplateNode::Component(c) => {
                collect_expression_tag_edits(source, &c.fragment, options, edits)?;
            }
            TemplateNode::TitleElement(t) => {
                collect_expression_tag_edits(source, &t.fragment, options, edits)?;
            }
            TemplateNode::IfBlock(blk) => {
                collect_expression_tag_edits(source, &blk.consequent, options, edits)?;
                if let Some(alt) = &blk.alternate {
                    collect_expression_tag_edits(source, alt, options, edits)?;
                }
            }
            TemplateNode::EachBlock(blk) => {
                collect_expression_tag_edits(source, &blk.body, options, edits)?;
                if let Some(fb) = &blk.fallback {
                    collect_expression_tag_edits(source, fb, options, edits)?;
                }
            }
            TemplateNode::AwaitBlock(blk) => {
                if let Some(frag) = &blk.pending {
                    collect_expression_tag_edits(source, frag, options, edits)?;
                }
                if let Some(frag) = &blk.then {
                    collect_expression_tag_edits(source, frag, options, edits)?;
                }
                if let Some(frag) = &blk.catch {
                    collect_expression_tag_edits(source, frag, options, edits)?;
                }
            }
            TemplateNode::KeyBlock(blk) => {
                collect_expression_tag_edits(source, &blk.fragment, options, edits)?;
            }
            TemplateNode::SnippetBlock(blk) => {
                collect_expression_tag_edits(source, &blk.body, options, edits)?;
            }
            _ => {}
        }
    }
    Ok(())
}

fn format_expression_tag(
    source: &str,
    tag: &ExpressionTag,
    options: &FormatOptions,
) -> Result<Option<(u32, u32, String)>, FormatError> {
    let outer = source
        .get(tag.start as usize..tag.end as usize)
        .ok_or_else(|| FormatError::Parse("expression tag span out of bounds".into()))?;
    let inner = outer
        .strip_prefix('{')
        .and_then(|s| s.strip_suffix('}'))
        .ok_or_else(|| FormatError::Parse("expression tag missing braces".into()))?
        .trim();

    if inner.is_empty() {
        return Ok(None);
    }

    let formatted = format_expression_source(inner, options)?;
    Ok(Some((tag.start, tag.end, format!("{{{formatted}}}"))))
}

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

    // Output shape: "(<formatted>);\n" — strip trailing whitespace, the
    // statement-terminator semicolon, then the wrapper parens we added.
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

/// Returns true if the outer `(` and `)` we just stripped were a matching
/// pair (i.e. they aren't part of two unrelated sub-expressions like
/// `(a) + (b)`).
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
