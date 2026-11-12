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
//! Script bodies and template expressions go through `oxc_formatter`, each in the root oxc's own
//! Vue formatter gives it, style bodies through `oxc_formatter_css`, and oxc's printer prints the
//! document. Anything neither covers is an [`Unsupported`] error, never an approximation.

use std::borrow::Cow;

use oxc_allocator::Allocator;
use oxc_formatter::JsFormatOptions;
use oxc_formatter_core::{CoreFormatOptions, IndentStyle, IndentWidth, LineEnding, LineWidth};
use rsvelte_document_printer::{
    Embedding, GroupIdentifier, LayoutInstructionIdentifier, LayoutInstructions, Unprinted,
};
pub(crate) use rsvelte_kernel::diagnostics::Unsupported;
use rsvelte_kernel::source::positions::{LineIndex, Span};
use rsvelte_vue_syntax::syntax_tree::{
    Attribute, AttributeKind, DirectiveExpression, SingleFileComponent, TagAttributes,
    TemplateNode, TemplateNodeIdentifier,
};

type R<T> = Result<T, Unsupported>;

const PRINT_WIDTH: usize = 80;
const TAB_WIDTH: usize = 2;

/// # Errors
///
/// [`Unsupported`] if the component holds a construct this formatter does not print.
/// `lines` is `source_text`'s, which the pipeline builds once per document.
pub(crate) fn format(c: &SingleFileComponent, source_text: &str, lines: &LineIndex) -> R<String> {
    if rsvelte_document_printer::has_emoji_sequence(source_text) {
        return Err(Unsupported::nowhere(
            "an emoji sequence, which Prettier measures as one character",
        ));
    }
    let tree = Tree::build(c, source_text, lines)?;
    let mut docs = LayoutInstructions::new();
    let allocator = Allocator::default();
    let core = core_options();
    let mut p = Printer {
        c,
        source_text,
        t: &tree,
        docs: &mut docs,
        embedding: Embedding::new(&allocator, core),
        options: JsFormatOptions {
            line_width: core.line_width,
            ..JsFormatOptions::default()
        },
    };
    let children = p.children(ROOT)?;
    let body = p.d().group(&children);
    let h = p.d().hardline();
    let root = p.d().concat(&[body, h]);
    let embedding = p.embedding;
    embedding
        .print(&docs, root, source_text.len())
        .map_err(|unprinted| match unprinted {
            Unprinted::FlatOnly => Unsupported::nowhere("a layout that does not fit on one line"),
            Unprinted::Rejected => Unsupported::nowhere("a document oxc's printer rejects"),
        })
}

/// Prettier's defaults, which are the only options this port prints.
fn core_options() -> CoreFormatOptions {
    CoreFormatOptions {
        indent_style: IndentStyle::Space,
        indent_width: IndentWidth::try_from(TAB_WIDTH as u8).expect("2 is an indent width"),
        line_width: LineWidth::try_from(PRINT_WIDTH as u16).expect("80 is a line width"),
        line_ending: LineEnding::Lf,
    }
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
    /// `{{ … }}`, at its whole span.
    Interpolation(Span),
}

#[derive(Debug, Clone, Copy)]
enum Attributes<'a> {
    Template(&'a [Attribute]),
    Block(&'a [TagAttributes]),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Embed {
    None,
    /// The script's content.
    Script(Span),
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

struct Printer<'a, 'd, 'x> {
    c: &'a SingleFileComponent,
    source_text: &'a str,
    t: &'a Tree<'a>,
    docs: &'d mut LayoutInstructions,
    embedding: Embedding<'x>,
    options: JsFormatOptions,
}

impl Printer<'_, '_, '_> {
    const fn d(&mut self) -> &mut LayoutInstructions {
        self.docs
    }
}

mod javascript;

mod tree;
mod whitespace;

mod attributes;
mod children;
mod print;
mod tags;
