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
pub(crate) use rsvelte_typescript_format::Unsupported;
use rsvelte_typescript_format::{Formatter, Options as JavaScriptOptions};

use crate::options::{EndOfLine, Options};

type R<T> = Result<T, Unsupported>;

/// # Errors
///
/// [`Unsupported`] if the component holds a construct this formatter does not print, or a
/// flat-only layout that does not fit.
/// `lines` is `source_text`'s, which the pipeline builds once per document.
pub(crate) fn format(
    c: &Component,
    source_text: &str,
    lines: &LineIndex,
    options: &Options,
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
    if text
        .trim_matches(embed::is_javascript_whitespace)
        .is_empty()
    {
        return Ok(bom.to_owned());
    }
    // Prettier reads a lone `\r` as a line break; this port reads line breaks as `\n` only.
    if let Some(at) = text
        .match_indices('\r')
        .map(|(i, _)| i)
        .find(|&i| !text[i + 1..].starts_with('\n'))
    {
        let at = (at + bom.len()) as u32;
        return Err(Unsupported::at(
            "a carriage return without a line feed",
            Span::new(at, at + 1),
        ));
    }
    if rsvelte_document_printer::has_emoji_sequence(text) {
        return Err(Unsupported::nowhere(
            "an emoji sequence, which Prettier measures as one character",
        ));
    }
    refuse_template_comments(c)?;
    refuse_rejected_tags(c, source_text)?;
    rsvelte_typescript_format::refuse_strict_errors(&c.javascript, source_text)?;

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
        options,
        source_text,
        javascript,
        text: vec![None; c.nodes.len()],
        in_pre: false,
        in_head: false,
        in_shadow_root: false,
        last_in_block: None,
        buffers: Vec::new(),
    };
    let root = f.top_level()?;
    let print = PrintOptions {
        width: options.print_width,
        indent_spaces: (!options.use_tabs).then_some(options.tab_width),
        tab_width: options.tab_width,
    };
    let printed = docs
        .print(root, &print)
        .map_err(|Refused| Unsupported::nowhere("a layout that does not fit on one line"))?;
    let eol = match options.end_of_line {
        EndOfLine::Lf => "\n",
        EndOfLine::Crlf => "\r\n",
        EndOfLine::Cr => "\r",
        // `guessEndOfLine`: the first line ending decides.
        EndOfLine::Auto => match text.find('\r') {
            Some(i) if text[i + 1..].starts_with('\n') => "\r\n",
            Some(_) => "\r",
            None => "\n",
        },
    };
    // Prettier reads `\r\n` as `\n` before parsing; here a `\r` reaches the output only in text
    // copied from the source. Its printer then writes every `\n` as the chosen line ending.
    let printed = if printed.contains('\r') {
        printed.replace("\r\n", "\n")
    } else {
        printed
    };
    let printed = if eol == "\n" {
        printed
    } else {
        printed.replace('\n', eol)
    };
    Ok(format!("{bom}{printed}"))
}

/// The plugin's `hasPragma`: `/^\s*<!--\s*@(format|prettier)\W/`.
fn has_pragma(text: &str) -> bool {
    let Some(rest) = text
        .trim_start_matches(embed::is_javascript_whitespace)
        .strip_prefix("<!--")
    else {
        return false;
    };
    let Some(rest) = rest
        .trim_start_matches(embed::is_javascript_whitespace)
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

/// Any JavaScript comment outside the scripts: the template printer does not place them yet, and
/// the expression printer only checks the comments inside its own expression, so one in a tag or
/// directive outside it (`bind:value={/* a */ b}`) would be lost.
fn refuse_template_comments(c: &Component) -> R<()> {
    let scripts: Vec<Span> = c
        .module
        .iter()
        .chain(&c.instance)
        .map(|s| s.content)
        .collect();
    match c.javascript.comments.iter().find(|comment| {
        !scripts
            .iter()
            .any(|s| s.start_offset <= comment.start_offset && comment.end_offset <= s.end_offset)
    }) {
        Some(&comment) => Err(Unsupported::at(
            "comments in the template's JavaScript",
            comment,
        )),
        None => Ok(()),
    }
}

/// What Svelte's parser rejects and this parser does not yet: a root-only `svelte:` tag twice,
/// and an attribute named twice on one element.
fn refuse_rejected_tags(c: &Component, source_text: &str) -> R<()> {
    let mut seen: Vec<&str> = Vec::new();
    let mut names: Vec<(AttributeKind, &str)> = Vec::new();
    for node in &c.nodes {
        let TemplateNode::Element {
            name,
            attributes,
            span,
            ..
        } = *node
        else {
            continue;
        };
        let name = name.text(source_text);
        if matches!(
            name,
            "svelte:head" | "svelte:options" | "svelte:window" | "svelte:document" | "svelte:body"
        ) {
            if seen.contains(&name) {
                return Err(Unsupported::at("a root-only `svelte:` tag twice", span));
            }
            seen.push(name);
        }
        names.clear();
        for a in attributes.get(&c.attributes) {
            // Svelte's `unique_names`: a binding and an attribute share names; `this` repeats.
            let kind = match a.kind {
                AttributeKind::Attribute | AttributeKind::Bind => AttributeKind::Attribute,
                k @ (AttributeKind::Style | AttributeKind::Class) => k,
                _ => continue,
            };
            let mut written = a.name.text(source_text);
            if a.kind != AttributeKind::Attribute {
                written = written.split_once(':').map_or(written, |(_, n)| n);
                written = written.split_once('|').map_or(written, |(n, _)| n);
            }
            if written == "this" {
                continue;
            }
            if names.contains(&(kind, written)) {
                return Err(Unsupported::at("an attribute named twice", a.span));
            }
            names.push((kind, written));
        }
    }
    // A root `<script>` or `<style>` reads every attribute as a plain one, named as written.
    let roots = c.module.iter().chain(&c.instance).map(|s| &s.attributes);
    for attributes in roots.chain(c.style.iter().map(|s| &s.attributes)) {
        for (i, &(name, _)) in attributes.iter().enumerate() {
            let written = name.text(source_text);
            if written != "this"
                && attributes[..i]
                    .iter()
                    .any(|(n, _)| n.text(source_text) == written)
            {
                return Err(Unsupported::at("an attribute named twice", name));
            }
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
        html_whitespace_sensitivity: _,
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

struct Printer<'a, 'd> {
    c: &'a Component,
    options: &'a Options,
    source_text: &'a str,
    javascript: Formatter<'d>,
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
mod patterns;
mod tree;

#[cfg(test)]
mod tests;
