use std::borrow::Cow;

use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    CompilerNodeIdentifier, CompilerSyntaxTree, ElementKind, MetadataTag, NodeKind,
};
use rsvelte_svelte_syntax::syntax_tree::{decode_text, escape_markup};
use rsvelte_typescript_tree::ExpressionIdentifier;

#[cfg(test)]
mod tests;

/// A node after whitespace cleaning.
#[derive(Debug, Clone)]
pub enum Item {
    /// An element or block.
    Node(CompilerNodeIdentifier),
    /// An `{expression}` tag, or an expression chunk of an attribute value.
    Expression(ExpressionIdentifier),
    Text {
        data: Text,
        raw: Text,
    },
    /// The empty comment upstream puts after a lone `<script>`, so the runtime can replace the
    /// script with one that runs.
    Comment,
}

/// A cleaned text, by where its string lives, so that the render plan, a shared artifact, keeps
/// no copy of what the document already holds.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Text {
    /// A range of the source.
    Source(Span),
    /// A range of a text node's decoded string.
    Decoded {
        node: CompilerNodeIdentifier,
        start: u32,
        end: u32,
    },
    Static(&'static str),
    /// A string that cleaning, decoding or escaping changed, which no range holds.
    Owned(Box<str>),
}

impl Text {
    /// The string, read from the document's source or compiler tree.
    #[must_use]
    pub fn get<'t>(&'t self, source_text: &'t str, tree: &'t CompilerSyntaxTree) -> &'t str {
        match self {
            Self::Source(span) => span.text(source_text),
            Self::Decoded { node, start, end } => match &tree.node(*node).kind {
                NodeKind::Text {
                    decoded: Some(decoded),
                    ..
                } => &decoded[*start as usize..*end as usize],
                _ => unreachable!("a decoded text points at a text node with a decoding"),
            },
            Self::Static(text) => text,
            Self::Owned(text) => text,
        }
    }

    /// The text at `span` after `transform`, which returns its input borrowed when it changes
    /// nothing.
    #[must_use]
    pub fn transformed(
        span: Span,
        source_text: &str,
        transform: impl FnOnce(&str) -> Cow<'_, str>,
    ) -> Self {
        let text = span.text(source_text);
        match transform(text) {
            Cow::Borrowed(same) => {
                debug_assert!(
                    std::ptr::eq(same, text),
                    "a transform borrows all of its input"
                );
                Self::Source(span)
            }
            Cow::Owned(changed) => Self::changed(text, changed),
        }
    }

    /// `changed`, made from `origin`, which must differ from it.
    fn changed(origin: &str, changed: String) -> Self {
        debug_assert_ne!(origin, changed, "an unchanged text stays a range");
        Self::Owned(changed.into_boxed_str())
    }

    /// The bytes `start..end` of a text that lives in a range or a fixed string.
    fn slice(&self, start: usize, end: usize) -> Self {
        let narrow = |from: u32| {
            (
                from + u32::try_from(start).expect("a range is within its text"),
                from + u32::try_from(end).expect("a range is within its text"),
            )
        };
        match self {
            Self::Source(span) => {
                let (start, end) = narrow(span.start_offset);
                Self::Source(Span::new(start, end))
            }
            Self::Decoded {
                node, start: from, ..
            } => {
                let (start, end) = narrow(*from);
                Self::Decoded {
                    node: *node,
                    start,
                    end,
                }
            }
            Self::Static(text) => Self::Static(&text[start..end]),
            Self::Owned(_) => unreachable!("an owned text is changed in place"),
        }
    }
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
pub struct Cleaned {
    pub hoisted: Box<[CompilerNodeIdentifier]>,
    pub items: Vec<Item>,
    /// Upstream `is_text_first`: the fragment starts with text and needs an anchor comment.
    pub text_first: bool,
}

/// Where upstream's parser ends the template it reads, `template.trimEnd()`, which only
/// `preserveWhitespace` can observe; [`clean_nodes`] takes it once per document.
///
/// # Panics
/// If the source is 4 GiB or longer, which no span can address.
#[must_use]
pub fn template_end(source_text: &str) -> u32 {
    u32::try_from(source_text.trim_end_matches(is_ecmascript_whitespace).len())
        .expect("a source is shorter than 4 GiB")
}

/// A decoded text's length, which a span's offset type holds as it holds the source's.
fn length(text: &str) -> u32 {
    u32::try_from(text.len()).expect("a text is shorter than 4 GiB")
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
pub fn clean_nodes(
    compiler_syntax_tree: &CompilerSyntaxTree,
    source_text: &str,
    parent: Parent<'_>,
    list: &[CompilerNodeIdentifier],
    preserve_ws: bool,
    drops_foreign_whitespace: bool,
    end: u32,
) -> Cleaned {
    let mut regular: Vec<Item> = Vec::with_capacity(list.len());
    let mut hoisted = Vec::new();
    for &identifier in list {
        match &compiler_syntax_tree.node(identifier).kind {
            NodeKind::Comment { .. } => {}
            // A frontend's spelled text is not in a Svelte source the parser trimmed.
            NodeKind::Text { raw, spelled, .. } if !spelled && raw.start_offset >= end => {}
            NodeKind::Text { raw, spelled, .. } if !spelled && raw.end_offset > end => {
                let raw = Span::new(raw.start_offset, end);
                regular.push(Item::Text {
                    data: Text::transformed(raw, source_text, decode_text),
                    raw: Text::Source(raw),
                });
            }
            NodeKind::Text {
                raw,
                decoded,
                spelled,
            } => {
                let data = decoded
                    .as_ref()
                    .map_or(Text::Source(*raw), |decoded| Text::Decoded {
                        node: identifier,
                        start: 0,
                        end: length(decoded),
                    });
                let raw = if *spelled {
                    let decoded = data.get(source_text, compiler_syntax_tree);
                    match escape_markup(decoded, false) {
                        Cow::Borrowed(_) => data.clone(),
                        Cow::Owned(escaped) => Text::changed(decoded, escaped),
                    }
                } else {
                    Text::Source(*raw)
                };
                regular.push(Item::Text { data, raw });
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
    let is_expression = |i: Option<&Item>| matches!(i, Some(Item::Expression(_)));

    if !preserve_ws {
        let all_ws = |i: &Item| matches!(i, Item::Text { data, .. } if data.get(source_text, compiler_syntax_tree).chars().all(is_template_whitespace));
        let leading = regular.iter().take_while(|item| all_ws(item)).count();
        regular.drain(..leading);
        if let Some(Item::Text { data, raw }) = regular.first_mut() {
            collapse_text(
                data,
                raw,
                Some(""),
                None,
                (source_text, compiler_syntax_tree),
            );
        }
        while regular.last().is_some_and(all_ws) {
            regular.pop();
        }
        if let Some(Item::Text { data, raw }) = regular.last_mut() {
            collapse_text(
                data,
                raw,
                None,
                Some(""),
                (source_text, compiler_syntax_tree),
            );
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
        for i in 0..regular.len() {
            let prev_is_expression = i > 0 && is_expression(regular.get(i - 1));
            let prev_text_ends_ws = i > 0
                && matches!(&regular[i - 1], Item::Text { data, .. } if data.get(source_text, compiler_syntax_tree).ends_with(is_template_whitespace));
            let next_is_expression = is_expression(regular.get(i + 1));
            if let Item::Text { data, raw } = &mut regular[i] {
                let lead =
                    (!prev_is_expression).then_some(if prev_text_ends_ws { "" } else { " " });
                let trail = (!next_is_expression).then_some(" ");
                collapse_text(data, raw, lead, trail, (source_text, compiler_syntax_tree));
            }
        }
        regular.retain(|item| {
            !matches!(item, Item::Text { data, .. } if { let data = data.get(source_text, compiler_syntax_tree); data.is_empty() || (data == " " && can_remove_entirely) })
        });
    }
    let mut trimmed = regular;

    if matches!(parent, Parent::Element("pre"))
        && let Some(Item::Text { data, .. }) = trimmed.first()
        && matches!(data.get(source_text, compiler_syntax_tree), "\n" | "\r\n")
    {
        trimmed.remove(0);
    }

    if let [Item::Node(only)] = trimmed.as_slice()
        && matches!(&compiler_syntax_tree.node(*only).kind,
            NodeKind::Element(el) if el.kind == ElementKind::Regular && el.name.text(source_text) == "script")
    {
        trimmed.push(Item::Comment);
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

/// [`collapse`] over a text's data and raw, once when both are the same text.
fn collapse_text(
    data: &mut Text,
    raw: &mut Text,
    lead: Option<&'static str>,
    trail: Option<&'static str>,
    document: (&str, &CompilerSyntaxTree),
) {
    let same = data == raw;
    *data = collapse(data, lead, trail, document);
    *raw = if same {
        data.clone()
    } else {
        collapse(raw, lead, trail, document)
    };
}

/// `text` with its leading template whitespace replaced by `lead`, then its trailing by `trail`,
/// each when given and present; a range stays a range when the result is a slice of it.
fn collapse(
    text: &mut Text,
    lead: Option<&'static str>,
    trail: Option<&'static str>,
    (source_text, tree): (&str, &CompilerSyntaxTree),
) -> Text {
    let s = text.get(source_text, tree);
    let start = s.len() - s.trim_start_matches(is_template_whitespace).len();
    let (start, mut prefix) = match lead {
        Some(lead) if start > 0 => (start, lead),
        _ => (0, ""),
    };
    let core = s[start..].trim_end_matches(is_template_whitespace);
    let (end, suffix) = match trail {
        Some(trail) if core.len() < s.len() - start => (start + core.len(), trail),
        // Only the replaced leading whitespace is left to trim.
        Some(trail) if core.is_empty() && prefix == " " => {
            prefix = "";
            (start, trail)
        }
        _ => (s.len(), ""),
    };
    let borrowed = !matches!(text, Text::Owned(_));
    let sliced = s[..start].ends_with(prefix) && s[end..].starts_with(suffix);
    let space = start == end && prefix.len() + suffix.len() == 1;
    let changed = (borrowed && !sliced && !space).then(|| {
        let collapsed = format!("{prefix}{}{suffix}", &s[start..end]);
        // The spaces it adds stand only at its ends, so a range of `s` could hold it only as a
        // slice.
        debug_assert!(!s.contains(&collapsed), "{collapsed:?} is a range of {s:?}");
        Text::changed(s, collapsed)
    });
    match text {
        Text::Owned(owned) => {
            let mut owned = String::from(std::mem::take(owned));
            owned.replace_range(end.., suffix);
            owned.replace_range(..start, prefix);
            Text::Owned(owned.into_boxed_str())
        }
        _ if sliced => text.slice(start - prefix.len(), end + suffix.len()),
        _ if space => Text::Static(" "),
        _ => changed.expect("a range that collapsing changed"),
    }
}
