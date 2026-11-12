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
use rsvelte_document_printer::{
    Embedding, LayoutInstructionIdentifier, LayoutInstructions, Unprinted,
};
pub(crate) use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::diagnostics::Unsupported;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Component, Part, TagAttributes, TemplateNode,
    TemplateNodeIdentifier, TokenType,
};

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
    rejected: Option<&Diagnostic>,
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
    // Prettier reads every line ending as `\n` before it parses. A lone `\r` becomes one in its
    // place, so the spans stay, and the line ending is still guessed from the source.
    if let Some(at) = text
        .match_indices('\r')
        .map(|(i, _)| i)
        .find(|&i| !text[i + 1..].starts_with('\n'))
    {
        let at = (at + bom.len()) as u32;
        let refused = || {
            Unsupported::at(
                "a carriage return without a line feed",
                Span::new(at, at + 1),
            )
        };
        let normalized = lone_returns_as_feeds(source_text);
        // Where the line feed breaks the parse, Prettier's parse fails too, with its own error.
        let reparsed =
            rsvelte_svelte_syntax::parse::parse(&normalized).map_err(|_parse_error| refused())?;
        let rejected = self::rejected(&reparsed, &normalized);
        let options = Options {
            end_of_line: match options.end_of_line {
                EndOfLine::Auto => guess_end_of_line(text),
                other => other,
            },
            ..options.clone()
        };
        return format(&reparsed, &normalized, &options, rejected.as_ref());
    }
    if rsvelte_document_printer::emoji_measured_otherwise(text) {
        return Err(Unsupported::nowhere(
            "an emoji sequence oxc's printer measures otherwise than Prettier",
        ));
    }
    let unparsed_script = match rejected {
        Some(rejected) => Some(
            unparsed_script(c, source_text, rejected)
                .ok_or_else(|| Unsupported::at("code a module rejects", rejected.span))?,
        ),
        None => None,
    };

    let core = core_options(options)?;
    let printed = rsvelte_typescript_tree::with_scratch_arena(|allocator| {
        print(
            c,
            options,
            source_text,
            text,
            core,
            unparsed_script,
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

/// `guessEndOfLine`: the first line ending decides.
fn guess_end_of_line(text: &str) -> EndOfLine {
    match text.find('\r') {
        Some(i) if text[i + 1..].starts_with('\n') => EndOfLine::Crlf,
        Some(_) => EndOfLine::Cr,
        None => EndOfLine::Lf,
    }
}

/// `text` with each `\r` not before a `\n` as a `\n`, of the same length.
fn lone_returns_as_feeds(text: &str) -> String {
    let mut bytes = text.as_bytes().to_vec();
    for i in 0..bytes.len() {
        if bytes[i] == b'\r' && bytes.get(i + 1) != Some(&b'\n') {
            bytes[i] = b'\n';
        }
    }
    String::from_utf8(bytes).expect("an ASCII byte replaced by an ASCII byte")
}

/// Prints `text`, the source without its byte order mark, with arena trees built in `allocator`.
fn print(
    c: &Component,
    options: &Options,
    source_text: &str,
    text: &str,
    core: CoreFormatOptions,
    unparsed_script: Option<Span>,
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
        unparsed_script,
    };
    let root = f.top_level()?;
    refuse_lost_comments(c, &f.embedder.kept, &f.embedder.dropped)?;
    let embedding = f.embedder.embedding;
    // Room for output a quarter longer than its source, so the buffer seldom grows.
    embedding
        .print(&docs, root, text.len() + text.len() / 4)
        .map_err(|unprinted| match unprinted {
            Unprinted::FlatOnly => Unsupported::nowhere("a layout only checked flat"),
            Unprinted::Rejected => Unsupported::nowhere("a document oxc's printer rejects"),
        })
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

/// The plugin's `langTsRegex` (`/\slang=["']?ts["']?/`) on a `<script>` tag: its value starts
/// with `ts`.
fn is_typescript(c: &Component, source_text: &str) -> bool {
    c.module.iter().chain(&c.instance).any(|s| {
        s.attributes.iter().any(|&(name, value)| {
            name.text(source_text) == "lang"
                && value.is_some_and(|v| v.text(source_text).starts_with("ts"))
        })
    })
}

/// The body of the JavaScript script holding `rejected`, an error Babel does not recover from
/// either, so the plugin keeps that body as it is. Babel recovers from the others, and Prettier's
/// TypeScript parser from more.
fn unparsed_script(c: &Component, source_text: &str, rejected: &Diagnostic) -> Option<Span> {
    // Each is a message's start and end.
    const BABEL_REJECTS: [(&str, &str); 11] = [
        ("await expression not allowed in formal parameter", ""),
        ("yield expression not allowed in formal parameter", ""),
        ("Super calls are not permitted outside constructors", ""),
        (
            "Illegal 'use strict' directive in function with non-simple parameter list",
            "",
        ),
        ("'super' can only be referenced in a derived class.", ""),
        ("Illegal continue statement", ""),
        ("Illegal break statement", ""),
        ("Jump target cannot cross function boundary.", ""),
        (
            "The operand of a 'delete' operator cannot be a private identifier.",
            "",
        ),
        ("Label `", "` has already been declared"),
        ("Identifier `#", "` has already been declared"),
    ];
    let message = rejected.message.as_str();
    if !(BABEL_REJECTS.iter())
        .any(|(start, end)| message.starts_with(start) && message.ends_with(end))
    {
        return None;
    }
    let script = (c.module.iter().chain(&c.instance)).find(|script| {
        script.content.start_offset <= rejected.span.start_offset
            && rejected.span.end_offset <= script.content.end_offset
    })?;
    let typescript = script.attributes.iter().any(|&(name, value)| {
        name.text(source_text) == "lang"
            && value.is_some_and(|v| v.text(source_text).starts_with("ts"))
    });
    (!typescript).then_some(script.content)
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
fn refuse_lost_comments(c: &Component, kept: &[Span], dropped: &[Span]) -> R<()> {
    let mut comments = c
        .tokens
        .iter()
        .filter(|t| t.kind == TokenType::JavaScriptComment)
        .map(|t| t.span)
        .filter(|comment| !dropped.contains(comment));
    comments
        .find(|comment| {
            !kept.iter().any(|s| {
                s.start_offset <= comment.start_offset && comment.end_offset <= s.end_offset
            })
        })
        .map_or(Ok(()), |comment| {
            Err(Unsupported::at(
                "comments in the template's JavaScript",
                comment,
            ))
        })
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

struct Printer<'a, 'd, 'x> {
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
    /// The body of the script Babel would reject, which the plugin prints as it is.
    unparsed_script: Option<Span>,
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
mod blocks;
mod children;
mod elements;
mod embed;
mod expressions;
mod javascript;
mod patterns;
mod tree;

#[cfg(test)]
mod tests;

/// The first error a module rejects in `c`, outside the artifact database.
pub(crate) fn rejected(c: &Component, source_text: &str) -> Option<Diagnostic> {
    let lowered = rsvelte_svelte_semantic::compiler_syntax_tree::lower(c, source_text);
    rsvelte_svelte_semantic::resolve::resolve(
        &c.javascript,
        c.instance.as_ref().map(|s| s.program),
        c.module.as_ref().map(|s| s.program),
        &lowered,
    )
    .syntax_error()
    .cloned()
}
