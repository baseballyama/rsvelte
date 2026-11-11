use std::borrow::Cow;

use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    CompilerNodeIdentifier, CompilerSyntaxTree, ElementKind, MetadataTag, NodeKind,
};
use rsvelte_svelte_syntax::syntax_tree::decode_text;
use rsvelte_typescript_tree::ExpressionIdentifier;

/// A node after whitespace cleaning; text may have been trimmed, so it carries its own strings.
#[derive(Debug, Clone)]
pub enum Item<'a> {
    /// An element or block.
    Node(CompilerNodeIdentifier),
    /// An `{expression}` tag, or an expression chunk of an attribute value.
    Expression(ExpressionIdentifier),
    Text {
        data: Cow<'a, str>,
        raw: Cow<'a, str>,
    },
}

/// Which node holds the fragment; decides the special cases of [`clean_nodes`].
#[derive(Clone, Copy, Debug)]
pub enum Parent<'a> {
    Root,
    Element(&'a str),
    /// An `{#if}` branch.
    Block,
    /// The body or the fallback of an `{#each}`.
    Each,
    Snippet,
    /// A component's children.
    Component,
}

#[derive(Debug)]
pub struct Cleaned<'a> {
    pub hoisted: Box<[CompilerNodeIdentifier]>,
    pub items: Vec<Item<'a>>,
    /// Upstream `is_text_first`: the fragment starts with text and needs an anchor comment.
    pub text_first: bool,
}

/// Upstream's template whitespace, the set `regex_not_whitespace` excludes.
pub(crate) const fn is_template_whitespace(c: char) -> bool {
    matches!(c, ' ' | '\t' | '\r' | '\n')
}

/// Upstream `clean_nodes` (3-transform/utils.js) for the node types this port has, with
/// `preserveComments: false`.
///
/// `drops_foreign_whitespace` is upstream's svg half of `can_remove_entirely`, which needs the
/// fragment's inferred namespace.
#[expect(
    clippy::too_many_lines,
    reason = "ports upstream's `clean_nodes` in one piece"
)]
pub fn clean_nodes<'a>(
    compiler_syntax_tree: &'a CompilerSyntaxTree,
    source_text: &'a str,
    parent: Parent<'_>,
    list: &[CompilerNodeIdentifier],
    preserve_ws: bool,
    drops_foreign_whitespace: bool,
) -> Cleaned<'a> {
    // Upstream's parser reads `template.trimEnd()`; only `preserveWhitespace` can observe it.
    let end = source_text.trim_end_matches(is_ecmascript_whitespace).len();
    let mut regular: Vec<Item<'a>> = Vec::with_capacity(list.len());
    let mut hoisted = Vec::new();
    for &identifier in list {
        match &compiler_syntax_tree.node(identifier).kind {
            NodeKind::Comment { .. } => {}
            // A frontend's spelled text is not in a Svelte source the parser trimmed.
            NodeKind::Text { raw, spelled, .. } if !spelled && raw.start_offset as usize >= end => {
            }
            NodeKind::Text { raw, spelled, .. } if !spelled && raw.end_offset as usize > end => {
                let raw = &source_text[raw.start_offset as usize..end];
                regular.push(Item::Text {
                    data: decode_text(raw),
                    raw: Cow::Borrowed(raw),
                });
            }
            NodeKind::Text {
                raw,
                decoded,
                spelled,
            } => {
                let raw = raw.text(source_text);
                let data = decoded.as_deref().unwrap_or(raw);
                regular.push(Item::Text {
                    data: Cow::Borrowed(data),
                    raw: if *spelled {
                        crate::markup::escape_markup(data, false)
                    } else {
                        Cow::Borrowed(raw)
                    },
                });
            }
            NodeKind::Expression { expression } => regular.push(Item::Expression(*expression)),
            NodeKind::Element(el)
                if matches!(
                    el.kind,
                    ElementKind::Title
                        | ElementKind::Metadata(Some(
                            MetadataTag::Head
                                | MetadataTag::Window
                                | MetadataTag::Document
                                | MetadataTag::Body
                        ))
                ) =>
            {
                hoisted.push(identifier);
            }
            NodeKind::Element(el)
                if el.kind == ElementKind::Metadata(Some(MetadataTag::Options)) => {}
            NodeKind::Const { .. }
            | NodeKind::Declaration { .. }
            | NodeKind::Debug { .. }
            | NodeKind::Snippet(_) => hoisted.push(identifier),
            NodeKind::Element(_)
            | NodeKind::If { .. }
            | NodeKind::Each(_)
            | NodeKind::Key { .. }
            | NodeKind::Await(_)
            | NodeKind::Render { .. }
            | NodeKind::Html { .. } => {
                regular.push(Item::Node(identifier));
            }
        }
    }
    let is_expression = |i: Option<&Item<'_>>| matches!(i, Some(Item::Expression(_)));

    let mut trimmed: Vec<Item<'a>> = if preserve_ws {
        regular
    } else {
        let all_ws = |i: &Item<'_>| matches!(i, Item::Text { data, .. } if data.chars().all(is_template_whitespace));
        let leading = regular.iter().take_while(|item| all_ws(item)).count();
        regular.drain(..leading);
        if let Some(Item::Text { data, raw }) = regular.first_mut() {
            *data = trim_start_owned(data);
            *raw = trim_start_owned(raw);
        }
        while regular.last().is_some_and(all_ws) {
            regular.pop();
        }
        if let Some(Item::Text { data, raw }) = regular.last_mut() {
            *data = trim_end_owned(data);
            *raw = trim_end_owned(raw);
        }
        let can_remove_entirely = drops_foreign_whitespace
            || matches!(
                parent,
                Parent::Element(
                    "select"
                        | "tr"
                        | "table"
                        | "tbody"
                        | "thead"
                        | "tfoot"
                        | "colgroup"
                        | "datalist"
                )
            );
        let mut out = Vec::with_capacity(regular.len());
        for i in 0..regular.len() {
            let prev_is_expression = i > 0 && is_expression(regular.get(i - 1));
            let prev_text_ends_ws = i > 0
                && matches!(&regular[i - 1], Item::Text { data, .. } if data.ends_with(is_template_whitespace));
            let next_is_expression = is_expression(regular.get(i + 1));
            let item = &mut regular[i];
            if let Item::Text { data, raw } = item {
                if !prev_is_expression {
                    let with = if prev_text_ends_ws { "" } else { " " };
                    *data = replace_leading_ws(data, with);
                    *raw = replace_leading_ws(raw, with);
                }
                if !next_is_expression {
                    *data = replace_trailing_ws(data, " ");
                    *raw = replace_trailing_ws(raw, " ");
                }
                if !data.is_empty() && (data != " " || !can_remove_entirely) {
                    out.push(item.clone());
                }
            } else {
                out.push(item.clone());
            }
        }
        out
    };

    if matches!(parent, Parent::Element("pre"))
        && let Some(Item::Text { data, .. }) = trimmed.first()
        && (data == "\n" || data == "\r\n")
    {
        trimmed.remove(0);
    }

    let text_first = matches!(
        parent,
        Parent::Root
            | Parent::Each
            | Parent::Snippet
            | Parent::Component
            | Parent::Element("svelte:boundary")
    ) && matches!(
        trimmed.first(),
        Some(Item::Text { .. } | Item::Expression(_))
    );
    Cleaned {
        hoisted: hoisted.into_boxed_slice(),
        items: trimmed,
        text_first,
    }
}

fn trim_start_owned<'a>(s: &Cow<'a, str>) -> Cow<'a, str> {
    let t = s.trim_start_matches(is_template_whitespace);
    if t.len() == s.len() {
        s.clone()
    } else {
        Cow::Owned(t.to_owned())
    }
}

fn trim_end_owned<'a>(s: &Cow<'a, str>) -> Cow<'a, str> {
    let t = s.trim_end_matches(is_template_whitespace);
    if t.len() == s.len() {
        s.clone()
    } else {
        Cow::Owned(t.to_owned())
    }
}

fn replace_leading_ws<'a>(s: &Cow<'a, str>, with: &str) -> Cow<'a, str> {
    let t = s.trim_start_matches(is_template_whitespace);
    if t.len() == s.len() {
        s.clone()
    } else {
        Cow::Owned(format!("{with}{t}"))
    }
}

fn replace_trailing_ws<'a>(s: &Cow<'a, str>, with: &str) -> Cow<'a, str> {
    let t = s.trim_end_matches(is_template_whitespace);
    if t.len() == s.len() {
        s.clone()
    } else {
        Cow::Owned(format!("{t}{with}"))
    }
}
