//! Lowering: from the Svelte tree and its analysis to an output JS tree.
//!
//! One meaning, one implementation (P2): whitespace cleaning, rune rewriting, text escaping and
//! name generation are shared; only the parts where the targets really differ (DOM building on
//! the client, string pushing on the server) live in `client` and `server`.

pub mod client;
pub mod names;
pub mod script;
pub mod server;

use crate::ast::{Component, TId, TNode, decode_text};
use std::borrow::Cow;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Target {
    Client,
    Server,
}

/// A node after whitespace cleaning; text may have been trimmed, so it carries its own strings.
#[derive(Debug, Clone)]
pub enum Item<'a> {
    /// An element or block.
    Node(TId),
    /// An `{expression}` tag, or an expression chunk of an attribute value.
    Expr(rsv_js::NodeId),
    Text {
        data: Cow<'a, str>,
        raw: Cow<'a, str>,
    },
}

/// Which node holds the fragment; decides the special cases of [`clean_nodes`].
#[derive(Clone, Copy)]
pub enum Parent<'a> {
    Root,
    Element(&'a str),
    Block,
}

pub struct Cleaned<'a> {
    pub items: Vec<Item<'a>>,
    /// Upstream `is_text_first`: the fragment starts with text and needs an anchor comment.
    pub text_first: bool,
}

fn is_ws(c: char) -> bool {
    matches!(c, ' ' | '\t' | '\r' | '\n')
}

/// Upstream `clean_nodes` (3-transform/utils.js) for the node types this port has, with
/// `preserveComments: false`.
pub fn clean_nodes<'a>(
    c: &Component,
    src: &'a str,
    parent: Parent,
    list: &[TId],
    preserve_ws: bool,
) -> Cleaned<'a> {
    let mut regular: Vec<Item<'a>> = Vec::with_capacity(list.len());
    for &id in list {
        match c.node(id) {
            TNode::Comment { .. } => {}
            TNode::Text { span } => {
                let raw = span.text(src);
                regular.push(Item::Text {
                    data: decode_text(raw),
                    raw: Cow::Borrowed(raw),
                });
            }
            TNode::Expr { expr, .. } => regular.push(Item::Expr(*expr)),
            _ => regular.push(Item::Node(id)),
        }
    }
    let is_expr = |i: Option<&Item>| matches!(i, Some(Item::Expr(_)));

    let mut trimmed: Vec<Item<'a>> = if preserve_ws {
        regular
    } else {
        let all_ws = |i: &Item| matches!(i, Item::Text { data, .. } if data.chars().all(is_ws));
        while regular.first().is_some_and(all_ws) {
            regular.remove(0);
        }
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
        let can_remove_entirely = matches!(
            parent,
            Parent::Element(
                "select" | "tr" | "table" | "tbody" | "thead" | "tfoot" | "colgroup" | "datalist"
            )
        );
        let mut out = Vec::with_capacity(regular.len());
        for i in 0..regular.len() {
            let prev_is_expr = i > 0 && is_expr(regular.get(i - 1));
            let prev_text_ends_ws = i > 0
                && matches!(&regular[i - 1], Item::Text { data, .. } if data.ends_with(is_ws));
            let next_is_expr = is_expr(regular.get(i + 1));
            let item = &mut regular[i];
            if let Item::Text { data, raw } = item {
                if !prev_is_expr {
                    let with = if prev_text_ends_ws { "" } else { " " };
                    *data = replace_leading_ws(data, with);
                    *raw = replace_leading_ws(raw, with);
                }
                if !next_is_expr {
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

    if let Parent::Element("pre") = parent
        && let Some(Item::Text { data, .. }) = trimmed.first()
        && (data == "\n" || data == "\r\n")
    {
        trimmed.remove(0);
    }

    let text_first = matches!(parent, Parent::Root)
        && matches!(trimmed.first(), Some(Item::Text { .. } | Item::Expr(_)));
    Cleaned {
        items: trimmed,
        text_first,
    }
}

fn trim_start_owned<'a>(s: &Cow<'a, str>) -> Cow<'a, str> {
    let t = s.trim_start_matches(is_ws);
    if t.len() == s.len() {
        s.clone()
    } else {
        Cow::Owned(t.to_owned())
    }
}

fn trim_end_owned<'a>(s: &Cow<'a, str>) -> Cow<'a, str> {
    let t = s.trim_end_matches(is_ws);
    if t.len() == s.len() {
        s.clone()
    } else {
        Cow::Owned(t.to_owned())
    }
}

fn replace_leading_ws<'a>(s: &Cow<'a, str>, with: &str) -> Cow<'a, str> {
    let t = s.trim_start_matches(is_ws);
    if t.len() == s.len() {
        s.clone()
    } else {
        Cow::Owned(format!("{with}{t}"))
    }
}

fn replace_trailing_ws<'a>(s: &Cow<'a, str>, with: &str) -> Cow<'a, str> {
    let t = s.trim_end_matches(is_ws);
    if t.len() == s.len() {
        s.clone()
    } else {
        Cow::Owned(format!("{t}{with}"))
    }
}

/// Upstream `escape_html`.
pub fn escape_html(s: &str, is_attr: bool) -> Cow<'_, str> {
    let needs = |c: char| c == '&' || c == '<' || (is_attr && c == '"');
    if !s.contains(needs) {
        return Cow::Borrowed(s);
    }
    let mut out = String::with_capacity(s.len() + 8);
    for ch in s.chars() {
        match ch {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '"' if is_attr => out.push_str("&quot;"),
            _ => out.push(ch),
        }
    }
    Cow::Owned(out)
}

/// Upstream `sanitize_template_string`: cooked text → raw template literal text.
pub fn sanitize_template_string(s: &str) -> Cow<'_, str> {
    if !s.contains(['`', '\\']) && !s.contains("${") {
        return Cow::Borrowed(s);
    }
    let mut out = String::with_capacity(s.len() + 4);
    let b = s.as_bytes();
    let mut i = 0;
    while i < s.len() {
        let c = b[i];
        if c == b'`' || c == b'\\' || (c == b'$' && b.get(i + 1) == Some(&b'{')) {
            out.push('\\');
        }
        let ch = s[i..].chars().next().expect("in bounds");
        out.push(ch);
        i += ch.len_utf8();
    }
    Cow::Owned(out)
}

const DOM_BOOLEAN_ATTRIBUTES: &[&str] = &[
    "allowfullscreen",
    "async",
    "autofocus",
    "autoplay",
    "checked",
    "controls",
    "default",
    "disabled",
    "formnovalidate",
    "indeterminate",
    "inert",
    "ismap",
    "loop",
    "multiple",
    "muted",
    "nomodule",
    "novalidate",
    "open",
    "playsinline",
    "readonly",
    "required",
    "reversed",
    "seamless",
    "selected",
    "webkitdirectory",
    "defer",
    "disablepictureinpicture",
    "disableremoteplayback",
];

pub fn is_boolean_attribute(name: &str) -> bool {
    DOM_BOOLEAN_ATTRIBUTES.contains(&name)
}

/// Upstream `is_dom_property`: the boolean attributes plus the aliased property names.
pub fn is_dom_property(name: &str) -> bool {
    is_boolean_attribute(name)
        || matches!(
            name,
            "formNoValidate"
                | "isMap"
                | "noModule"
                | "playsInline"
                | "readOnly"
                | "value"
                | "volume"
                | "defaultValue"
                | "defaultChecked"
                | "srcObject"
                | "noValidate"
                | "allowFullscreen"
                | "disablePictureInPicture"
                | "disableRemotePlayback"
        )
}

/// Upstream `cannot_be_set_statically`.
pub fn cannot_be_set_statically(name: &str) -> bool {
    matches!(
        name,
        "autofocus" | "muted" | "defaultValue" | "defaultChecked"
    )
}

/// Upstream `is_event_attribute` for this port's attribute shapes.
pub fn event_attribute(c: &Component, src: &str, a: &crate::ast::Attr) -> Option<rsv_js::NodeId> {
    let crate::ast::AttrValue::Parts(r) = a.value else {
        return None;
    };
    match c.parts(r) {
        [crate::ast::Part::Expr { expr, .. }] if a.name.text(src).starts_with("on") => Some(*expr),
        _ => None,
    }
}
