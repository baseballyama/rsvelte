//! Formats a component the way prettier-plugin-svelte 4.x does.
//!
//! [`Options`] names every option that changes the output; a value this port does not print yet
//! is an [`Unsupported`] error, never the default's output.
//!
//! The functions below port the plugin's `print`, `printChildren`, `printSvelteBlockChildren` and
//! its node helpers one to one, including the order in which it trims text nodes while printing:
//! the plugin mutates the text of its tree as it goes, and this port keeps that state in a side
//! table (`text`) instead of mutating the shared, immutable component.
//!
//! Script and expression bodies go through `oxc_formatter`, style bodies through
//! `oxc_formatter_css`, and oxc's printer prints the whole document. Anything this port does not
//! cover is an [`Unsupported`] error, never an approximation.

use std::borrow::Cow;

use oxc_allocator::Allocator;
use oxc_formatter::{BracketSameLine, JsFormatOptions, QuoteStyle};
use oxc_formatter_core::{CoreFormatOptions, IndentStyle, IndentWidth, LineEnding, LineWidth};
use rsvelte_document_printer::{Embedding, LayoutInstructionIdentifier, LayoutInstructions};
use rsvelte_kernel::diagnostics::{Diagnostic, Unsupported};
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Component, Part, Script, TagAttributes, TemplateNode,
    TemplateNodeIdentifier, TokenType,
};
use rsvelte_typescript_tree::SyntaxError;

use crate::options::{EndOfLine, Options};

type R<T> = Result<T, Unsupported>;

/// # Errors
///
/// [`Unsupported`] if the component holds a construct this formatter does not print, or a
/// flat-only layout that does not fit.
/// `rejected` is the first error a module rejects that the parsers do not report, which the
/// plugin's parse fails on.
pub(crate) fn format(
    c: &Component,
    source_text: &str,
    options: &Options,
    rejected: Option<&SyntaxError>,
) -> R<String> {
    if let Some(name) = unported(options) {
        return Err(Unsupported::nowhere(name));
    }
    // Prettier sets a byte order mark aside before formatting and puts it back after.
    let (bom, text) = source_text
        .strip_prefix('\u{FEFF}')
        .map_or(("", source_text), |text| ("\u{FEFF}", text));
    if options.require_pragma && !has_pragma(text) {
        return Ok(source_text.to_owned());
    }
    if text.trim_matches(is_ecmascript_whitespace).is_empty() {
        return Ok(bom.to_owned());
    }
    // Prettier reads every line ending as `\n` before it parses, so the tree of the source, whose
    // spans hold the `\r`s, cannot serve; the line ending is still guessed from the source.
    if let Some(first) = source_text.find('\r') {
        let normalized = line_endings::Normalized::new(source_text);
        let lone = (source_text.match_indices('\r').map(|(i, _)| i))
            .find(|&i| !source_text[i + 1..].starts_with('\n'));
        let at = lone.unwrap_or(first) as u32;
        // Where the line feed breaks the parse, Prettier's parse fails too, with its own error.
        let reparsed = parsed(&normalized.text).map_err(|_parse_error| {
            Unsupported::at(
                if lone.is_some() {
                    "a carriage return without a line feed"
                } else {
                    "a line ending that parses otherwise as a line feed"
                },
                Span::new(at, at + 1),
            )
        })?;
        let rejected = self::rejected(&reparsed, &normalized.text);
        let options = Options {
            end_of_line: match options.end_of_line {
                EndOfLine::Auto => guess_end_of_line(text),
                other => other,
            },
            ..options.clone()
        };
        return format(&reparsed, &normalized.text, &options, rejected.as_ref()).map_err(
            |u| match u.source_location.span() {
                Some(span) => Unsupported::at(u.what, normalized.original(span)),
                None => u,
            },
        );
    }
    if rsvelte_document_printer::emoji_measured_otherwise(text) {
        return Err(Unsupported::nowhere(
            "an emoji sequence oxc's printer measures otherwise than Prettier",
        ));
    }
    let unparsed_scripts = unparsed::unparsed_scripts(c, source_text, rejected)?;
    awaits::refuse_misread_awaits(c, source_text, &unparsed_scripts)?;

    let core = core_options(options)?;
    let printed = rsvelte_typescript_tree::with_scratch_arena(|allocator| {
        print(
            c,
            options,
            source_text,
            text,
            core,
            unparsed_scripts,
            allocator,
        )
    })?;
    let eol = match options.end_of_line {
        EndOfLine::Lf => "\n",
        EndOfLine::Crlf => "\r\n",
        EndOfLine::Cr => "\r",
        EndOfLine::Auto => match guess_end_of_line(text) {
            EndOfLine::Crlf => "\r\n",
            EndOfLine::Cr => "\r",
            _ => "\n",
        },
    };
    // Prettier's printer writes every `\n` as the chosen line ending.
    let printed = if eol == "\n" {
        printed
    } else {
        printed.replace('\n', eol)
    };
    Ok(format!("{bom}{printed}"))
}

/// The component as the plugin reads it, as
/// [`rsvelte_svelte_syntax::parsed_reading_scripts_as_typescript`] does.
pub(crate) fn parsed(source_text: &str) -> Result<Component, Diagnostic> {
    rsvelte_svelte_syntax::parse::parse_reading_scripts_as_typescript(source_text)
}

/// `guessEndOfLine`: the first line ending decides.
fn guess_end_of_line(text: &str) -> EndOfLine {
    match text.find('\r') {
        Some(i) if text[i + 1..].starts_with('\n') => EndOfLine::Crlf,
        Some(_) => EndOfLine::Cr,
        None => EndOfLine::Lf,
    }
}

/// Prints `text`, the source without its byte order mark, with arena trees built in `allocator`.
fn print(
    c: &Component,
    options: &Options,
    source_text: &str,
    text: &str,
    core: CoreFormatOptions,
    unparsed_scripts: Vec<Span>,
    allocator: &Allocator,
) -> R<String> {
    let mut docs = LayoutInstructions::new();
    let mut f = Printer {
        c,
        options,
        source_text,
        docs: &mut docs,
        embedder: javascript::Embedder {
            embedding: Embedding::new(allocator, core),
            typescript: is_typescript(c, source_text),
            options: javascript_options(options, core),
            kept: Vec::new(),
            dropped: Vec::new(),
        },
        text: vec![None; c.nodes.len()],
        in_pre: false,
        in_head: false,
        in_shadow_root: false,
        last_in_block: None,
        buffers: Vec::new(),
        ignore: Ignore::default(),
        unparsed_scripts,
        comments: (c.tokens.iter())
            .filter(|t| t.kind == TokenType::JavaScriptComment)
            .map(|t| t.span)
            .collect(),
    };
    let root = f.top_level()?;
    refuse_lost_comments(&f.comments, &f.embedder.kept, &f.embedder.dropped)?;
    let embedding = f.embedder.embedding;
    // Room for output a quarter longer than its source, so the buffer seldom grows.
    embedding.print(&docs, root, text.len() + text.len() / 4)
}

/// The options oxc's printer and formatters share.
fn core_options(options: &Options) -> R<CoreFormatOptions> {
    let tab_width = u8::try_from(options.tab_width)
        .ok()
        .and_then(|w| IndentWidth::try_from(w).ok())
        .ok_or_else(|| Unsupported::nowhere("a `tabWidth` oxc's formatter does not take"))?;
    let line_width = u16::try_from(options.print_width)
        .ok()
        .and_then(|w| LineWidth::try_from(w).ok())
        .ok_or_else(|| Unsupported::nowhere("a `printWidth` oxc's formatter does not take"))?;
    Ok(CoreFormatOptions {
        indent_style: if options.use_tabs {
            IndentStyle::Tab
        } else {
            IndentStyle::Space
        },
        indent_width: tab_width,
        line_width,
        line_ending: LineEnding::Lf,
    })
}

/// Prettier's options for the JavaScript in the component; [`unported`] has refused the others.
fn javascript_options(options: &Options, core: CoreFormatOptions) -> JsFormatOptions {
    JsFormatOptions {
        indent_style: core.indent_style,
        indent_width: core.indent_width,
        line_width: core.line_width,
        line_ending: core.line_ending,
        jsx_quote_style: if options.jsx_single_quote {
            QuoteStyle::Single
        } else {
            QuoteStyle::Double
        },
        bracket_same_line: BracketSameLine::from(options.bracket_same_line),
        ..JsFormatOptions::default()
    }
}

/// The errors inside a script's `body`: the TypeScript errors oxc reported for the scripts, and the
/// ones the compiler lets pass.
fn script_errors(c: &Component, body: Span) -> impl Iterator<Item = &SyntaxError> {
    let inside = move |error: &&SyntaxError| {
        let at = error.diagnostic.span.start_offset;
        body.start_offset <= at && at <= body.end_offset
    };
    (c.script_typescript_errors.iter())
        .chain(c.javascript.unchecked_errors())
        .filter(inside)
}

/// The plugin's `langTsRegex` (`/\slang=["']?ts["']?/`) on a `<script>` tag: its value starts
/// with `ts`.
fn is_typescript(c: &Component, source_text: &str) -> bool {
    (c.module.iter().chain(&c.instance)).any(|script| in_typescript(script, source_text))
}

/// Whether the plugin reads `script` with Prettier's TypeScript parser: its `lang` starts with
/// `ts`. Any other script goes to `babel-ts`.
fn in_typescript(script: &Script, source_text: &str) -> bool {
    script.attributes.iter().any(|&(name, value)| {
        name.text(source_text) == "lang"
            && value.is_some_and(|v| v.text(source_text).starts_with("ts"))
    })
}

/// The plugin's `hasPragma`: `/^\s*<!--\s*@(format|prettier)\W/`.
fn has_pragma(text: &str) -> bool {
    let Some(rest) = text
        .trim_start_matches(is_ecmascript_whitespace)
        .strip_prefix("<!--")
    else {
        return false;
    };
    let Some(rest) = rest
        .trim_start_matches(is_ecmascript_whitespace)
        .strip_prefix('@')
    else {
        return false;
    };
    ["format", "prettier"].iter().any(|word| {
        rest.strip_prefix(word)
            .and_then(|r| r.chars().next())
            .is_some_and(|c| !(c.is_ascii_alphanumeric() || c == '_'))
    })
}

/// A JavaScript comment outside the code the output keeps as text, which the template printer
/// does not place: around an expression (`{/* a */ b}`) or between a tag's attributes
/// (`<A // b={1}>`, only a token), it would be lost.
fn refuse_lost_comments(
    comments: &[Span],
    kept: &[Span],
    dropped: &[(Span, &'static str)],
) -> R<()> {
    for &comment in comments {
        if let Some(&(_, why)) = dropped.iter().find(|(d, _)| *d == comment) {
            return Err(Unsupported::at(why, comment));
        }
        let printed = kept
            .iter()
            .any(|s| s.start_offset <= comment.start_offset && comment.end_offset <= s.end_offset);
        if !printed {
            return Err(Unsupported::at(
                "comments in the template's JavaScript",
                comment,
            ));
        }
    }
    Ok(())
}

/// The first option whose value this port does not print yet. The pattern names every field, so
/// a new option does not compile until it is decided here.
#[must_use]
#[expect(
    clippy::unneeded_field_pattern,
    reason = "`..` would let a new option through unchecked"
)]
pub(crate) fn unported(o: &Options) -> Option<&'static str> {
    let Options {
        print_width: _,
        tab_width: _,
        use_tabs: _,
        semi,
        single_quote,
        jsx_single_quote: _,
        quote_props,
        trailing_comma,
        bracket_spacing,
        object_wrap,
        bracket_same_line: _,
        arrow_parens,
        markup_whitespace_sensitivity: _,
        end_of_line: _,
        embedded_language_formatting: _,
        single_attribute_per_line: _,
        prose_wrap: _,
        require_pragma: _,
        insert_pragma: _,
        check_ignore_pragma: _,
        range_start,
        range_end,
        experimental_ternaries,
        experimental_operator_position,
        svelte_sort_order: _,
        svelte_allow_shorthand: _,
        svelte_indent_script_and_style: _,
    } = o;
    let d = Options::default();
    [
        ("semi", *semi != d.semi),
        ("singleQuote", *single_quote != d.single_quote),
        ("quoteProps", *quote_props != d.quote_props),
        ("trailingComma", *trailing_comma != d.trailing_comma),
        ("bracketSpacing", *bracket_spacing != d.bracket_spacing),
        ("objectWrap", *object_wrap != d.object_wrap),
        ("arrowParens", *arrow_parens != d.arrow_parens),
        ("rangeStart", *range_start != d.range_start),
        ("rangeEnd", *range_end != d.range_end),
        (
            "experimentalTernaries",
            *experimental_ternaries != d.experimental_ternaries,
        ),
        (
            "experimentalOperatorPosition",
            *experimental_operator_position != d.experimental_operator_position,
        ),
    ]
    .into_iter()
    .find_map(|(name, differs)| differs.then_some(name))
}

/// The component outlives the arena its layouts are built in, so they may borrow its trees.
struct Printer<'a: 'x, 'd, 'x> {
    c: &'a Component,
    options: &'a Options,
    source_text: &'a str,
    docs: &'d mut LayoutInstructions,
    embedder: javascript::Embedder<'x>,
    /// The plugin's mutable `raw` of each text node, once it differs from the source.
    text: Vec<Option<Cow<'a, str>>>,
    /// The plugin's `isPreTagContent(path)`.
    in_pre: bool,
    /// Svelte's `parent_is_head`: a `<title>` here is a `TitleElement`.
    in_head: bool,
    /// Svelte's `parent_is_shadowroot_template`: a `<slot>` here is a `RegularElement`.
    in_shadow_root: bool,
    /// The last child, ignoring blank text, of the block element being printed.
    last_in_block: Option<TemplateNodeIdentifier>,
    /// Emptied lists of child layouts, kept so each text node and child list does not allocate.
    buffers: Vec<Vec<LayoutInstructionIdentifier>>,
    ignore: Ignore,
    /// The bodies of the scripts the plugin's parser throws on, which it prints as they are.
    unparsed_scripts: Vec<Span>,
    /// Every JavaScript comment's span, in order.
    comments: Vec<Span>,
}

impl Printer<'_, '_, '_> {
    /// Whether a JavaScript comment starts inside `span`.
    fn holds_comment(&self, span: Span) -> bool {
        let i = self
            .comments
            .partition_point(|c| c.start_offset < span.start_offset);
        self.comments
            .get(i)
            .is_some_and(|c| c.start_offset < span.end_offset)
    }
}

/// The plugin's `ignoreNext` and `ignoreRange`.
#[derive(Default)]
struct Ignore {
    /// A `prettier-ignore` comment was printed, so the next sibling that is not blank text keeps
    /// its source.
    next: bool,
    /// Between a root `prettier-ignore-start` and `prettier-ignore-end`: each node keeps its
    /// source.
    range: bool,
}

/// Whether Svelte parses an element as a `RegularElement`, which is all the plugin asks.
#[derive(Clone, Copy, PartialEq, Eq)]
enum ElementKind {
    Regular,
    /// A component, a `svelte:` element, a `<slot>` or a `<title>` in `<svelte:head>`.
    Other,
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
mod awaits;
mod blocks;
mod children;
mod elements;
mod embed;
mod expressions;
mod javascript;
mod line_endings;
mod patterns;
mod tree;
mod unparsed;

#[cfg(test)]
mod tests;

/// The first error a module rejects in `c`, outside the artifact database.
pub(crate) fn rejected(c: &Component, source_text: &str) -> Option<SyntaxError> {
    let lowered = rsvelte_svelte_semantic::compiler_syntax_tree::lower(c, source_text);
    rsvelte_svelte_semantic::resolve::resolve(
        &c.javascript,
        c.instance.as_ref().map(|s| s.program),
        c.module.as_ref().map(|s| s.program),
        &lowered,
    )
    .javascript_syntax_error()
    .cloned()
}
