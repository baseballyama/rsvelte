//! Formats a component the way prettier 3 formats a `.vue` file.
//!
//! The options are `printWidth: 80`, two-space indentation, `htmlWhitespaceSensitivity: "css"`,
//! `bracketSameLine: false` and `vueIndentScriptAndStyle: false`. This is prettier's HTML printer
//! (`language-html`), not a Vue-specific one: the file is an HTML document whose root elements
//! are the blocks.
//!
//! The port keeps prettier's two stages. `Tree::build` is `print-preprocess` (whitespace
//! extraction, CSS display, space sensitivity, simple-element merging) over a tree of its own,
//! since the preprocessing rewrites text and removes nodes. `Printer` is `printChildren`,
//! `printElement` and the tag helpers of `print/tag.js`, one function per upstream function.
//! Script bodies and template expressions go through `rsvelte_typescript`'s formatter, style bodies
//! through `rsvelte_stylesheet`'s; anything neither covers is an [`Unsupported`] error, never an
//! approximation.

use std::borrow::Cow;

use rsvelte_kernel::output::document::{
    GroupIdentifier, LayoutInstructionIdentifier, LayoutInstructions, PrintOptions, Refused,
};
use rsvelte_kernel::source::positions::{LineIndex, Span};
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
pub use rsvelte_typescript_format::Unsupported;
use rsvelte_typescript_format::{Formatter, Options as JavaScriptOptions};
use rsvelte_vue::syntax_tree::{
    Attribute, AttributeKind, DirectiveExpression, DirectiveName, SingleFileComponent,
    TagAttributes, TemplateNode, TemplateNodeIdentifier,
};

type R<T> = Result<T, Unsupported>;

const PRINT_WIDTH: usize = 80;
const TAB_WIDTH: usize = 2;

/// prettier's `CSS_DISPLAY_TAGS` (from `html-ua-styles`, with its special cases), for the tags
/// whose display is not `inline`.
const STYLESHEET_DISPLAY: &[(&str, &str)] = &[
    ("area", "none"),
    ("base", "none"),
    ("basefont", "none"),
    ("datalist", "none"),
    ("head", "none"),
    ("link", "none"),
    ("meta", "none"),
    ("noembed", "none"),
    ("noframes", "none"),
    ("param", "block"),
    ("rp", "none"),
    ("script", "block"),
    ("style", "none"),
    ("title", "none"),
    ("html", "block"),
    ("body", "block"),
    ("address", "block"),
    ("blockquote", "block"),
    ("center", "block"),
    ("dialog", "block"),
    ("div", "block"),
    ("figure", "block"),
    ("figcaption", "block"),
    ("footer", "block"),
    ("form", "block"),
    ("header", "block"),
    ("hr", "block"),
    ("legend", "block"),
    ("listing", "block"),
    ("main", "block"),
    ("p", "block"),
    ("plaintext", "block"),
    ("pre", "block"),
    ("search", "block"),
    ("xmp", "block"),
    ("slot", "contents"),
    ("ruby", "ruby"),
    ("rt", "ruby-text"),
    ("article", "block"),
    ("aside", "block"),
    ("h1", "block"),
    ("h2", "block"),
    ("h3", "block"),
    ("h4", "block"),
    ("h5", "block"),
    ("h6", "block"),
    ("hgroup", "block"),
    ("nav", "block"),
    ("section", "block"),
    ("dir", "block"),
    ("dd", "block"),
    ("dl", "block"),
    ("dt", "block"),
    ("menu", "block"),
    ("ol", "block"),
    ("ul", "block"),
    ("li", "list-item"),
    ("table", "table"),
    ("caption", "table-caption"),
    ("colgroup", "table-column-group"),
    ("col", "table-column"),
    ("thead", "table-header-group"),
    ("tbody", "table-row-group"),
    ("tfoot", "table-footer-group"),
    ("tr", "table-row"),
    ("td", "table-cell"),
    ("th", "table-cell"),
    ("input", "inline-block"),
    ("button", "inline-block"),
    ("fieldset", "block"),
    ("details", "block"),
    ("summary", "block"),
    ("marquee", "inline-block"),
    ("option", "block"),
    ("optgroup", "block"),
    ("select", "inline-block"),
    ("source", "block"),
    ("track", "block"),
    ("meter", "inline-block"),
    ("progress", "inline-block"),
    ("object", "inline-block"),
    ("video", "inline-block"),
    ("audio", "inline-block"),
];

/// Elements whose `white-space` is not `normal` (`CSS_WHITE_SPACE_TAGS`) or whose attributes
/// prettier formats with a language this port does not have.
const REFUSED_TAGS: &[&str] = &[
    "listing",
    "plaintext",
    "pre",
    "xmp",
    "textarea",
    "svg",
    "math",
];

/// `@vue/shared`'s `VOID_TAGS`, which the HTML parser prettier uses agrees with.
const VOID_TAGS: &[&str] = &[
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source",
    "track", "wbr",
];

/// # Errors
///
/// [`Unsupported`] if the component holds a construct this formatter does not print.
/// `lines` is `source_text`'s, which the pipeline builds once per document.
pub fn format(c: &SingleFileComponent, source_text: &str, lines: &LineIndex) -> R<String> {
    let tree = Tree::build(c, source_text, lines)?;
    let mut docs = LayoutInstructions::new();
    let javascript = Formatter::new(
        &c.javascript,
        source_text,
        lines,
        &mut docs,
        JavaScriptOptions::default(),
    );
    let mut p = Printer {
        c,
        source_text,
        t: &tree,
        javascript,
    };
    let children = p.children(ROOT)?;
    let body = p.javascript.docs.group(&children);
    let h = p.javascript.docs.hardline();
    let root = p.javascript.docs.concat(&[body, h]);
    let options = PrintOptions {
        width: PRINT_WIDTH,
        indent_spaces: Some(TAB_WIDTH),
        tab_width: TAB_WIDTH,
    };
    docs.print(root, &options)
        .map_err(|Refused| Unsupported::nowhere("a layout that does not fit on one line"))
}

const ROOT: usize = 0;

#[derive(Debug)]
enum Kind2<'a> {
    Root,
    Element {
        name: &'a str,
        attributes: Attributes<'a>,
        embed: Embed,
    },
    Text(Cow<'a, str>),
    Interpolation(NodeIdentifier),
}

#[derive(Debug, Clone, Copy)]
enum Attributes<'a> {
    Template(&'a [Attribute]),
    Block(&'a [TagAttributes]),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Embed {
    None,
    Script(NodeIdentifier),
    Style(usize),
}

#[derive(Debug)]
struct Node<'a> {
    kind: Kind2<'a>,
    parent: usize,
    children: Vec<usize>,
    prev: Option<usize>,
    next: Option<usize>,
    /// `sourceSpan`.
    span: Span,
    /// `startSourceSpan.end`, for an element.
    open_end: u32,
    /// `endSourceSpan.start`, for an element with an end tag.
    close_start: Option<u32>,
    display: &'static str,
    /// `hasLeadingSpaces`, `hasTrailingSpaces`, `hasDanglingSpaces`.
    has: Sides,
    /// `isLeadingSpaceSensitive`, `isTrailingSpaceSensitive`, `isDanglingSpaceSensitive`.
    sensitive: Sides,
    self_closing: bool,
}

/// Whitespace facts about a node's two sides and, for a container, its empty inside.
#[derive(Debug, Clone, Copy, Default)]
struct Sides {
    leading: bool,
    trailing: bool,
    dangling: bool,
}

impl<'a> Node<'a> {
    const fn new(kind: Kind2<'a>, parent: usize, span: Span) -> Self {
        Node {
            kind,
            parent,
            children: Vec::new(),
            prev: None,
            next: None,
            span,
            open_end: span.end_offset,
            close_start: None,
            display: "inline",
            has: Sides {
                leading: false,
                trailing: false,
                dangling: false,
            },
            sensitive: Sides {
                leading: false,
                trailing: false,
                dangling: false,
            },
            self_closing: false,
        }
    }
}

/// The preprocessed document (`print-preprocess.js`).
#[derive(Debug)]
struct Tree<'a> {
    n: Vec<Node<'a>>,
    lines: &'a LineIndex,
    source_text: &'a str,
}

const fn is_markup_ws(b: u8) -> bool {
    matches!(b, b' ' | b'\t' | b'\n' | b'\x0c' | b'\r')
}

fn only_ws(s: &str) -> bool {
    s.bytes().all(is_markup_ws)
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum Between {
    None,
    Soft,
    Line,
    Hard,
}

struct Printer<'a, 'd> {
    c: &'a SingleFileComponent,
    source_text: &'a str,
    t: &'a Tree<'a>,
    javascript: Formatter<'d>,
}

impl Printer<'_, '_> {
    const fn d(&mut self) -> &mut LayoutInstructions {
        self.javascript.docs
    }
}

const fn attributes_len(a: Attributes<'_>) -> usize {
    match a {
        Attributes::Template(l) => l.len(),
        Attributes::Block(l) => l.len(),
    }
}

mod tree;
mod whitespace;

mod attributes;
mod children;
mod print;
mod tags;
