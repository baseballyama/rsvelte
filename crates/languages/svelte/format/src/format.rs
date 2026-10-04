//! Formats a component the way prettier-plugin-svelte 4.x does.
//!
//! The options are `printWidth: 80`, two-space
//! indentation, `svelteSortOrder: "options-scripts-markup-styles"`, `svelteIndentScriptAndStyle`,
//! `svelteAllowShorthand`, `bracketSameLine: false` and `htmlWhitespaceSensitivity: "css"`.
//!
//! The functions below port the plugin's `print`, `printChildren`, `printSvelteBlockChildren` and
//! its node helpers one to one, including the order in which it trims text nodes while printing:
//! the plugin mutates the text of its tree as it goes, and this port keeps that state in a side
//! table (`text`) instead of mutating the shared, immutable component.
//!
//! Script and expression bodies go through `rsvelte_typescript`'s formatter, style bodies through
//! `rsvelte_stylesheet`'s. Anything neither port covers is an [`Unsupported`] error, never an
//! approximation.

use std::borrow::Cow;

use rsvelte_kernel::output::document::{
    LayoutInstructionIdentifier, LayoutInstructions, PrintOptions, Refused,
};
use rsvelte_kernel::source::positions::{LineIndex, Span};
use rsvelte_svelte::syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Component, Part, TagAttributes, TemplateNode,
    TemplateNodeIdentifier,
};
pub use rsvelte_typescript_format::Unsupported;
use rsvelte_typescript_format::{Formatter, Options as JavaScriptOptions};

type R<T> = Result<T, Unsupported>;

const PRINT_WIDTH: usize = 80;
const TAB_WIDTH: usize = 2;

/// prettier-plugin-svelte `selfClosingTags`.
const SELF_CLOSING: &[&str] = &[
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source",
    "track", "wbr",
];

/// prettier-plugin-svelte `blockElements`.
const BLOCK_ELEMENTS: &[&str] = &[
    "address",
    "article",
    "aside",
    "blockquote",
    "details",
    "dialog",
    "dd",
    "div",
    "dl",
    "dt",
    "fieldset",
    "figcaption",
    "figure",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "header",
    "hgroup",
    "hr",
    "li",
    "main",
    "nav",
    "ol",
    "p",
    "pre",
    "section",
    "table",
    "ul",
];

/// # Errors
///
/// [`Unsupported`] if the component holds a construct this formatter does not print, or a
/// flat-only layout that does not fit.
/// `lines` is `source_text`'s, which the pipeline builds once per document.
pub fn format(c: &Component, source_text: &str, lines: &LineIndex) -> R<String> {
    let mut docs = LayoutInstructions::new();
    let javascript = Formatter::new(
        &c.javascript,
        source_text,
        lines,
        &mut docs,
        JavaScriptOptions::default(),
    );
    let mut f = Printer {
        c,
        source_text,
        javascript,
        text: vec![None; c.nodes.len()],
        in_pre: false,
        buffers: Vec::new(),
    };
    let root = f.top_level()?;
    let options = PrintOptions {
        width: PRINT_WIDTH,
        indent_spaces: Some(TAB_WIDTH),
        tab_width: TAB_WIDTH,
    };
    docs.print(root, &options)
        .map_err(|Refused| Unsupported::nowhere("a layout that does not fit on one line"))
}

struct Printer<'a, 'd> {
    c: &'a Component,
    source_text: &'a str,
    javascript: Formatter<'d>,
    /// The plugin's mutable `raw` of each text node, once it differs from the source.
    text: Vec<Option<Cow<'a, str>>>,
    /// The plugin's `isPreTagContent(path)`.
    in_pre: bool,
    /// Emptied lists of child layouts, kept so each text node and child list does not allocate.
    buffers: Vec<Vec<LayoutInstructionIdentifier>>,
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum ElementKind {
    Regular,
    Component,
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum BlockWs {
    None,
    Space,
    Line,
}

const fn is_collapse_ws(c: char) -> bool {
    matches!(c, '\t' | '\n' | '\x0C' | '\r' | ' ')
}

fn only_ws(s: &str) -> bool {
    s.chars().all(is_collapse_ws)
}

/// `^([\t\f\r ]*\n){n}`.
fn starts_with_linebreak(s: &str, n: usize) -> bool {
    let mut rest = s;
    for _ in 0..n {
        let t = rest.trim_start_matches(['\t', '\x0C', '\r', ' ']);
        let Some(after) = t.strip_prefix('\n') else {
            return false;
        };
        rest = after;
    }
    true
}

/// `(\n[\t\f\r ]*){n}$`.
fn ends_with_linebreak(s: &str, n: usize) -> bool {
    let mut rest = s;
    for _ in 0..n {
        let t = rest.trim_end_matches(['\t', '\x0C', '\r', ' ']);
        let Some(before) = t.strip_suffix('\n') else {
            return false;
        };
        rest = before;
    }
    true
}

/// The plugin's whitespace normalization of a `class` attribute's text on a regular element.
fn normalize_class(raw: &str, is_last_part: bool) -> String {
    // `([^ \t\n])(([ \t]+$)|([ \t]+(\r?\n))|[ \t]+)` → collapse inner runs, drop them before a
    // line break, keep them at the very end.
    let b = raw.as_bytes();
    let mut out = String::with_capacity(raw.len());
    let mut i = 0;
    while i < b.len() {
        let c = b[i];
        let run_start = i + 1;
        if !matches!(c, b' ' | b'\t' | b'\n')
            && run_start < b.len()
            && matches!(b[run_start], b' ' | b'\t')
        {
            let mut j = run_start;
            while j < b.len() && matches!(b[j], b' ' | b'\t') {
                j += 1;
            }
            out.push_str(&raw[i..run_start]);
            if j == b.len() {
                out.push_str(&raw[run_start..j]);
            } else if b[j] == b'\n' {
                out.push('\n');
                j += 1;
            } else if b[j] == b'\r' && b.get(j + 1) == Some(&b'\n') {
                out.push_str("\r\n");
                j += 2;
            } else {
                out.push(' ');
            }
            i = j;
            continue;
        }
        let ch = raw[i..].chars().next().expect("in bounds");
        out.push(ch);
        i += ch.len_utf8();
    }
    // `([^ \t\n])[ \t]+$` → `$1` at the end of the value, `$1 ` before an expression.
    let trimmed = out.trim_end_matches([' ', '\t']);
    if trimmed.len() < out.len() && !trimmed.is_empty() && !trimmed.ends_with('\n') {
        let mut s = trimmed.to_owned();
        if !is_last_part {
            s.push(' ');
        }
        return s;
    }
    out
}

mod attributes;
mod blocks;
mod children;
mod elements;
mod embed;
mod tree;

#[cfg(test)]
mod tests;
