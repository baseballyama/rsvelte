//! The compiler's `svelte-ignore`: which nodes each comment's codes cover, the warnings about
//! codes it does not know, and which warnings end up ignored.

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;
use rsvelte_kernel::source::tokens::TokenKind;
use rsvelte_svelte_syntax::syntax_tree::{Component, Range, TemplateNode};
use rsvelte_typescript_syntax::syntax_tree::Kind;
use rsvelte_typescript_syntax::{NodeIdentifier, SyntaxTree};

use super::found::{Found, Stage};
use super::fuzzymatch::fuzzymatch;
use super::{CompileWarnings, Section, warning};

/// Svelte 4's codes whose Svelte 5 code is not the same with `-` read as `_`.
pub const LEGACY_REPLACEMENTS: &[(&str, &str)] = &[
    (
        "non-top-level-reactive-declaration",
        "reactive_declaration_invalid_placement",
    ),
    (
        "module-script-reactive-declaration",
        "reactive_declaration_module_script",
    ),
    ("empty-block", "block_empty"),
    ("avoid-is", "attribute_avoid_is"),
    ("invalid-html-attribute", "attribute_invalid_property_name"),
    ("a11y-structure", "a11y_figcaption_parent"),
    ("illegal-attribute-character", "attribute_illegal_colon"),
    ("invalid-rest-eachblock-binding", "bind_invalid_each_rest"),
    ("unused-export-let", "export_let_unused"),
];

/// The Svelte 5 code a legacy code stands for.
#[must_use]
pub fn code_for_v5(code: &str) -> String {
    LEGACY_REPLACEMENTS
        .iter()
        .find(|(old, _)| *old == code)
        .map_or_else(|| code.replace('-', "_"), |(_, new)| (*new).to_owned())
}

/// A node and the codes the `svelte-ignore` comments before it name.
pub(super) struct Region {
    pub(super) span: Span,
    pub(super) codes: Vec<String>,
}

/// `extract_svelte_ignore`: the codes of a comment whose text `text` starts at `offset`. In
/// runes mode an unknown code is a warning, and codes are separated by commas.
pub(super) fn extract(
    offset: u32,
    text: &str,
    runes: bool,
    mut warn: impl FnMut(Diagnostic),
) -> Vec<String> {
    let after_space = text.trim_start_matches(is_ecmascript_whitespace);
    let Some(rest) = after_space.strip_prefix("svelte-ignore") else {
        return Vec::new();
    };
    let Some(first) = rest.chars().next().filter(|c| is_ecmascript_whitespace(*c)) else {
        return Vec::new();
    };
    let start = (text.len() - rest.len() + first.len_utf8()) as u32;
    let rest = &rest[first.len_utf8()..];
    let codes = CompileWarnings::SVELTE_CODES;
    let mut out = Vec::new();
    for (at, word) in words(rest) {
        let comma = rest[at + word.len()..].starts_with(',');
        if !runes {
            out.push(word.to_owned());
            if !codes.contains(&word) {
                let replacement = code_for_v5(word);
                if codes.contains(&replacement.as_str()) {
                    out.push(replacement);
                }
            }
            continue;
        }
        if codes.contains(&word) {
            out.push(word.to_owned());
        } else {
            let replacement = code_for_v5(word);
            let begin = offset + start + at as u32;
            let span = Span::new(begin, begin + word.len() as u32);
            let found = if codes.contains(&replacement.as_str()) {
                let message =
                    format!("`{word}` is no longer valid — please use `{replacement}` instead");
                warning("legacy_code", &message, span)
            } else {
                let message = fuzzymatch(word, codes).map_or_else(
                    || format!("`{word}` is not a recognised code"),
                    |suggestion| {
                        format!("`{word}` is not a recognised code (did you mean `{suggestion}`?)")
                    },
                );
                warning("unknown_code", &message, span)
            };
            warn(found);
        }
        if !comma {
            break;
        }
    }
    out
}

/// `/[\w$-]+/g` over `text`: each match and its byte offset.
fn words(text: &str) -> impl Iterator<Item = (usize, &str)> {
    let is_word = |b: u8| b.is_ascii_alphanumeric() || matches!(b, b'_' | b'$' | b'-');
    let bytes = text.as_bytes();
    let mut i = 0;
    std::iter::from_fn(move || {
        while i < bytes.len() && !is_word(bytes[i]) {
            i += 1;
        }
        if i == bytes.len() {
            return None;
        }
        let start = i;
        while i < bytes.len() && is_word(bytes[i]) {
            i += 1;
        }
        Some((start, &text[start..i]))
    })
}

/// Every node a `svelte-ignore` covers. The warnings about unknown codes go to `found`, as the
/// walk meets them.
pub(super) fn regions(
    component: &Component,
    source: &str,
    runes: bool,
    found: &mut Found,
) -> Vec<Region> {
    let mut out = Vec::new();
    // The parser gives a script the comment before its tag as the program's leading comment.
    for script in [&component.module, &component.instance]
        .into_iter()
        .flatten()
    {
        if let Some(data) = preceding_comment(component, source, script.span.start_offset) {
            let codes = extract(data.start_offset, data.text(source), runes, |_| {});
            if let Some(span) = component.javascript.source_location(script.program).span() {
                out.push(Region { span, codes });
            }
        }
    }
    script_regions(component, source, runes, found, &mut out);
    fragment_regions(component, source, runes, component.root, found, &mut out);
    for node in &component.nodes {
        for range in child_ranges(node) {
            fragment_regions(component, source, runes, range, found, &mut out);
        }
    }
    out
}

/// The text of the comment right before the `<script>` or `<style>` tag at `start`, with only
/// whitespace between them: the parser's `prev_comment`.
pub(super) fn preceding_comment(component: &Component, source: &str, start: u32) -> Option<Span> {
    let children = component.children(component.root);
    let before = children.partition_point(|&c| component.node(c).span().end_offset <= start);
    let mut nodes = children[..before].iter().rev().map(|&c| component.node(c));
    let last = nodes.next()?;
    if last.span().end_offset != start {
        return None;
    }
    std::iter::once(last)
        .chain(nodes)
        .find_map(|node| match *node {
            TemplateNode::Comment { data, .. } => Some(Some(data)),
            TemplateNode::Text { span } if span.text(source).trim().is_empty() => None,
            _ => Some(None),
        })?
}

/// The child lists of a template node.
pub(super) fn child_ranges(node: &TemplateNode) -> impl Iterator<Item = Range> {
    let ranges: [Option<Range>; 3] = match *node {
        TemplateNode::Element { children, .. } => [Some(children), None, None],
        TemplateNode::If {
            consequent,
            alternate,
            ..
        } => [Some(consequent), alternate, None],
        TemplateNode::Each {
            body,
            fallback,
            has_fallback,
            ..
        } => [Some(body), has_fallback.then_some(fallback), None],
        TemplateNode::Key { body, .. } | TemplateNode::Snippet { body, .. } => {
            [Some(body), None, None]
        }
        TemplateNode::Await {
            pending,
            then,
            catch,
            ..
        } => [pending.present(), then.present(), catch.present()],
        _ => [None, None, None],
    };
    ranges.into_iter().flatten()
}

/// A fragment's nodes: each one but text and comments is covered by the comments before it,
/// up to the previous node of another kind.
fn fragment_regions(
    component: &Component,
    source: &str,
    runes: bool,
    range: Range,
    found: &mut Found,
    out: &mut Vec<Region>,
) {
    let children = component.children(range);
    for (i, &child) in children.iter().enumerate() {
        let node = component.node(child);
        if matches!(
            node,
            TemplateNode::Text { .. } | TemplateNode::Comment { .. }
        ) {
            continue;
        }
        let at = node.span().start_offset;
        let mut codes = Vec::new();
        for &previous in children[..i].iter().rev() {
            match *component.node(previous) {
                TemplateNode::Comment { data, .. } => {
                    let mut more = extract(data.start_offset, data.text(source), runes, |w| {
                        found.before(Stage::Walk(Section::Template), at, w);
                    });
                    codes.append(&mut more);
                }
                TemplateNode::Text { .. } => {}
                _ => break,
            }
        }
        if !codes.is_empty() {
            out.push(Region {
                span: node.span(),
                codes,
            });
        }
    }
}

/// The JavaScript comments as `acorn`'s `add_comments` attaches them: a leading comment to the
/// first node after it, unless it trails the node before it on the same line or ends a body.
fn script_regions(
    component: &Component,
    source: &str,
    runes: bool,
    found: &mut Found,
    out: &mut Vec<Region>,
) {
    let javascript = &component.javascript;
    let ignores: Vec<Span> = javascript
        .comments
        .iter()
        .copied()
        .filter(|c| value(*c, source).contains("svelte-ignore"))
        .collect();
    if ignores.is_empty() {
        return;
    }
    let mut attach = Attach {
        javascript,
        source,
        runes,
        comments: &ignores,
        next: 0,
        found,
        out,
        section: Section::Module,
    };
    let roots = [
        (Section::Module, component.module.as_ref()),
        (Section::Instance, component.instance.as_ref()),
    ];
    for (section, script) in roots {
        let Some(script) = script else { continue };
        attach.section = section;
        attach.skip_before(script.content.start_offset);
        attach.node(script.program, None);
        attach.skip_before(script.content.end_offset);
    }
    attach.section = Section::Template;
    for &expression in &component.template_expressions {
        let Some(span) = javascript.source_location(expression).span() else {
            continue;
        };
        // Only a comment inside the expression's own braces is the expression's.
        while let Some(&comment) = attach.comments.get(attach.next) {
            let between = component
                .tokens
                .from_offset(comment.end_offset)
                .iter()
                .take_while(|t| t.span.start_offset < span.start_offset);
            if comment.start_offset >= span.start_offset
                || between.into_iter().all(|t| t.kind.is_trivia())
            {
                break;
            }
            attach.next += 1;
        }
        attach.node(expression, None);
        attach.skip_before(span.end_offset);
    }
}

/// A comment's text without its delimiters.
fn value(comment: Span, source: &str) -> &str {
    let text = comment.text(source);
    let inner = &text[2..];
    inner
        .strip_suffix("*/")
        .filter(|_| text.starts_with("/*"))
        .unwrap_or(inner)
}

struct Attach<'a, 'f> {
    javascript: &'a SyntaxTree,
    source: &'a str,
    runes: bool,
    comments: &'a [Span],
    next: usize,
    found: &'f mut Found,
    out: &'f mut Vec<Region>,
    section: Section,
}

impl Attach<'_, '_> {
    /// Drops the comments before `offset`: they belong to no node of this walk.
    fn skip_before(&mut self, offset: u32) {
        while self
            .comments
            .get(self.next)
            .is_some_and(|c| c.start_offset < offset)
        {
            self.next += 1;
        }
    }

    /// `parent` is the parent's span and whether `node` is the last of its body.
    fn node(&mut self, node: NodeIdentifier, parent: Option<(Span, bool)>) {
        let Some(span) = self.javascript.source_location(node).span() else {
            return;
        };
        let mut codes = Vec::new();
        while let Some(&comment) = self.comments.get(self.next) {
            if comment.start_offset >= span.start_offset {
                break;
            }
            self.next += 1;
            let stage = Stage::Walk(self.section);
            let found = &mut *self.found;
            codes.append(&mut extract(
                comment.start_offset + 2,
                value(comment, self.source),
                self.runes,
                |w| found.before(stage, span.start_offset, w),
            ));
        }
        if !codes.is_empty() {
            self.out.push(Region { span, codes });
        }
        let last = last_child(self.javascript, node);
        self.javascript.for_each_child(node, |child| {
            self.node(child, Some((span, Some(child) == last)));
        });
        let Some(&comment) = self.comments.get(self.next) else {
            return;
        };
        match parent {
            Some((parent, _)) if parent.end_offset == span.end_offset => {}
            Some((parent, true)) => self.skip_before(parent.end_offset),
            _ if span.end_offset <= comment.start_offset => {
                let gap = &self.source[span.end_offset as usize..comment.start_offset as usize];
                if gap.bytes().all(|b| matches!(b, b',' | b')' | b' ' | b'\t')) {
                    self.next += 1;
                }
            }
            _ => {}
        }
    }
}

/// The last child of a body, array or object, whose trailing comments run to the parent's end.
fn last_child(javascript: &SyntaxTree, node: NodeIdentifier) -> Option<NodeIdentifier> {
    match javascript.kind(node) {
        Kind::Program(items) | Kind::Block(items) | Kind::Array(items) | Kind::Object(items) => {
            items.last().copied()
        }
        _ => None,
    }
}

/// Marks each warning a region covers with one of its codes; only the walks' warnings can be.
pub(super) fn ignored(found: &[(Stage, Diagnostic)], regions: &[Region]) -> Vec<bool> {
    found
        .iter()
        .map(|(stage, warning)| {
            stage.ignorable()
                && regions.iter().any(|r| {
                    r.span.start_offset <= warning.span.start_offset
                        && warning.span.end_offset <= r.span.end_offset
                        && r.codes.iter().any(|c| c == &*warning.code)
                })
        })
        .collect()
}
