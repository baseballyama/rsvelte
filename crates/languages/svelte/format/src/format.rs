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
//! Script and expression bodies go through `rsvelte_typescript_format`'s formatter, style bodies
//! through `rsvelte_stylesheet_format`'s. Anything neither port covers is an [`Unsupported`] error,
//! never an approximation.

use std::borrow::Cow;

use rsvelte_document_printer::{
    LayoutInstructionIdentifier, LayoutInstructions, PrintOptions, Refused,
};
use rsvelte_kernel::source::positions::{LineIndex, Span};
use rsvelte_svelte_syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Component, Part, TagAttributes, TemplateNode,
    TemplateNodeIdentifier,
};
pub use rsvelte_typescript_format::Unsupported;
use rsvelte_typescript_format::{Formatter, Options as JavaScriptOptions};

type R<T> = Result<T, Unsupported>;

const PRINT_WIDTH: usize = 80;
const TAB_WIDTH: usize = 2;

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

mod attributes;
mod blocks;
mod children;
mod elements;
mod embed;
mod tree;

#[cfg(test)]
mod tests;
