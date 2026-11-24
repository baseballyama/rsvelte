//! Directive comments, applied to every rule's findings: `ESLint`'s own (`/* eslint-disable */` in
//! JavaScript), and eslint-plugin-svelte's processor (`<!-- eslint-disable -->` in the template,
//! the rules `settings.svelte.ignoreWarnings` names outside `<script>`).

use rsvelte_kernel::source::characters::{is_ecmascript_line_terminator, is_ecmascript_whitespace};
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{Component, TemplateNode};

use crate::words::words;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub(crate) enum Kind {
    Disable,
    Enable,
    DisableLine,
    DisableNextLine,
}

impl Kind {
    /// `ESLint`'s keyword.
    pub(crate) const fn keyword(self) -> &'static str {
        match self {
            Self::Disable => "eslint-disable",
            Self::Enable => "eslint-enable",
            Self::DisableLine => "eslint-disable-line",
            Self::DisableNextLine => "eslint-disable-next-line",
        }
    }

    const fn suffix(self) -> &'static str {
        match self {
            Self::Disable => "-disable",
            Self::Enable => "-enable",
            Self::DisableLine => "-disable-line",
            Self::DisableNextLine => "-disable-next-line",
        }
    }
}

/// The prefixes of `ESLint`'s directive comments.
pub(crate) const ESLINT: &[&str] = &["eslint"];
/// oxlint's, which takes `ESLint`'s too.
pub(crate) const OXLINT: &[&str] = &["eslint", "oxlint"];

/// An `<!-- eslint-… -->` comment of the template.
#[derive(Debug)]
pub(crate) struct MarkupDirective {
    pub(crate) prefix: &'static str,
    pub(crate) kind: Kind,
    /// The whole comment, `<!--` and `-->` included.
    pub(crate) comment: Span,
    /// The rules it names; none means every rule.
    pub(crate) rules: Vec<Span>,
}

impl MarkupDirective {
    /// As written, as in `oxlint-disable-next-line`.
    pub(crate) fn keyword(&self) -> String {
        format!("{}{}", self.prefix, self.kind.suffix())
    }
}

/// The template's directive comments with one of `prefixes`, as eslint-plugin-svelte's
/// `comment-directive` reads them.
pub(crate) fn markup_directives(
    component: &Component,
    source: &str,
    prefixes: &[&'static str],
) -> Vec<MarkupDirective> {
    let mut out = Vec::new();
    for node in &component.nodes {
        let TemplateNode::Comment { span, data } = *node else {
            continue;
        };
        let value = data.text(source);
        // Upstream keeps the text before a ` -- ` description and does not trim it.
        let text = &value[..justification_start(value).unwrap_or(value.len())];
        let trimmed = text.trim_start_matches(is_ecmascript_whitespace);
        let at = text.len() - trimmed.len();
        let kinds = [
            Kind::DisableNextLine,
            Kind::DisableLine,
            Kind::Disable,
            Kind::Enable,
        ];
        let Some((prefix, kind, keyword)) = (prefixes.iter())
            .flat_map(|&prefix| kinds.map(|kind| (prefix, kind)))
            .find_map(|(prefix, kind)| {
                let rest = trimmed.strip_prefix(prefix)?.strip_prefix(kind.suffix())?;
                (rest.is_empty() || rest.starts_with(is_ecmascript_whitespace))
                    .then(|| (prefix, kind, prefix.len() + kind.suffix().len()))
            })
        else {
            continue;
        };
        let single_line = !span.text(source).contains(is_ecmascript_line_terminator);
        if matches!(kind, Kind::DisableLine | Kind::DisableNextLine) && !single_line {
            continue;
        }
        let names = &text[at + keyword..];
        let base = data.start_offset + (at + keyword) as u32;
        let rules = words(names, base);
        out.push(MarkupDirective {
            prefix,
            kind,
            comment: span,
            rules,
        });
    }
    out
}

/// `ESLint`'s `/\s-{2,}\s/u`: where a directive's description starts.
pub(crate) fn justification_start(value: &str) -> Option<usize> {
    let bytes = value.as_bytes();
    value.char_indices().find_map(|(i, c)| {
        if !is_ecmascript_whitespace(c) {
            return None;
        }
        let dashes = bytes[i + c.len_utf8()..]
            .iter()
            .take_while(|&&b| b == b'-')
            .count();
        let after = &value[i + c.len_utf8() + dashes..];
        (dashes >= 2 && after.starts_with(is_ecmascript_whitespace)).then_some(i)
    })
}

pub(crate) mod javascript;
pub(crate) mod processor;

#[cfg(test)]
mod tests;
