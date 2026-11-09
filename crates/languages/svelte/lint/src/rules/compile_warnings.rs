//! The compiler's warnings as eslint-plugin-svelte's `svelte-compile-warns` reads them:
//! `svelte-ignore` comments matched to the nodes they lead, and styles in a language other than
//! CSS left out. Shared by `valid-compile` and `no-unused-svelte-ignore`.

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte::syntax::syntax_tree::{Component, Range, TemplateNode};
use rsvelte_svelte::warnings::{CompileWarnings, code_for_v5};
use rsvelte_typescript::Kind;

use crate::rule::File;
use crate::words::{is_js_space, words};

/// One code of a `svelte-ignore` comment.
#[derive(Debug)]
pub(super) struct IgnoreItem {
    /// As written.
    pub(super) code: Span,
    /// The code Svelte 5 knows it by: upstream's `codeForV5`.
    pub(super) code_for_v5: String,
    /// The whole comment.
    pub(super) comment: Span,
}

/// The `svelte-ignore` comments: their codes, and the comments that name none.
#[derive(Debug, Default)]
pub(super) struct Ignores {
    pub(super) items: Vec<IgnoreItem>,
    pub(super) missing_code: Vec<Span>,
}

const CSS_CODES: &[&str] = &[
    "css-unused-selector",
    "css_unused_selector",
    "css-invalid-global",
    "css-invalid-global-selector",
];

/// `getSvelteIgnoreItems`: JavaScript comments, then template comments.
pub(super) fn ignores(component: &Component, source: &str) -> Ignores {
    let mut out = Ignores::default();
    for &comment in &component.javascript.comments {
        // `//` and `/*` are two bytes, and so is a block comment's `*/`.
        let value = Span::new(comment.start_offset + 2, block_end(comment, source));
        read(value, comment, source, &mut out);
    }
    for node in &component.nodes {
        if let TemplateNode::Comment { span, data } = *node {
            read(data, span, source, &mut out);
        }
    }
    // Stable, so a comment's codes keep their order.
    out.items.sort_by_key(|item| item.comment.start_offset);
    out
}

fn block_end(comment: Span, source: &str) -> u32 {
    if comment.text(source).starts_with("/*") {
        comment.end_offset - 2
    } else {
        comment.end_offset
    }
}

/// `/^\s*svelte-ignore\s+/` and the codes after it, separated by spaces or commas; a
/// parenthesized note is not a code.
fn read(value: Span, comment: Span, source: &str, out: &mut Ignores) {
    let text = value.text(source);
    let trimmed = text.trim_start_matches(is_js_space);
    let Some(rest) = trimmed.strip_prefix("svelte-ignore") else {
        return;
    };
    let codes = rest.trim_start_matches(is_js_space);
    if codes.len() == rest.len() {
        return;
    }
    let base = value.end_offset - codes.len() as u32;
    // Notes become spaces, so offsets stay the source's.
    let mut masked = String::with_capacity(codes.len());
    let mut depth = None;
    for (i, c) in codes.char_indices() {
        if depth.is_none() && c == '(' && codes[i..].contains(')') {
            depth = Some(());
        }
        if depth.is_some() {
            masked.extend(std::iter::repeat_n(' ', c.len_utf8()));
            if c == ')' {
                depth = None;
            }
        } else {
            masked.push(c);
        }
    }
    // A note becomes spaces of its own byte length, so `masked` keeps the offsets of `codes`.
    let spans = words(&masked, base);
    if spans.is_empty() {
        out.missing_code.push(comment);
    }
    for span in spans {
        let code = span.text(source);
        out.items.push(IgnoreItem {
            code: span,
            code_for_v5: code_for_v5(code),
            comment,
        });
    }
}

impl Ignores {
    /// The items of `comment`, with their indexes.
    fn of(&self, comment: Span) -> impl Iterator<Item = (usize, &IgnoreItem)> {
        let start = self
            .items
            .partition_point(|item| item.comment.start_offset < comment.start_offset);
        self.items[start..]
            .iter()
            .take_while(move |item| item.comment == comment)
            .enumerate()
            .map(move |(k, item)| (start + k, item))
    }
}

impl IgnoreItem {
    fn names(&self, code: &str, source: &str) -> bool {
        self.code.text(source) == code || self.code_for_v5 == code
    }
}

/// The compiler's result once `svelte-ignore` comments are applied.
pub(super) struct Applied<'a> {
    pub(super) warnings: Vec<&'a Diagnostic>,
    /// The first analysis error; then there are no warnings.
    pub(super) error: Option<Diagnostic>,
    /// Per [`Ignores::items`], whether it ignored a warning.
    pub(super) used: Vec<bool>,
}

/// Upstream's `processIgnore`, over the warnings of a style in CSS only.
pub(super) fn apply<'a>(
    file: &File<'a>,
    compile: &'a CompileWarnings,
    ignores: &Ignores,
    experimental_async: bool,
) -> Applied<'a> {
    let component = file.component().expect("a component");
    let source = file.source();
    let mut used = vec![false; ignores.items.len()];
    let stripped = component
        .style
        .as_ref()
        .filter(|style| !is_css(style.attributes.as_slice(), source))
        .map(|style| style.span);
    // A style sheet that does not parse fails the compile before analysis; a stripped one is
    // never parsed.
    let parse_error = component
        .style_error()
        .filter(|_| stripped.is_none())
        .cloned();
    let first_error = parse_error.or_else(|| compile.first_error(component, experimental_async));
    if let Some(error) = first_error {
        return Applied {
            warnings: Vec::new(),
            error: Some(error),
            used,
        };
    }
    let targets = Targets { component };
    let mut warnings = Vec::new();
    for warning in &compile.warnings {
        if stripped.is_some_and(|s| contains(s, warning.span.start_offset)) {
            continue;
        }
        let mut silenced = false;
        for leading in targets.chain(warning.span) {
            // The comment nearest the node that names the code wins.
            let hit = leading.iter().rev().find_map(|&comment| {
                ignores
                    .of(comment)
                    .find(|(_, item)| item.names(&warning.code, source))
            });
            if let Some((i, _)) = hit {
                used[i] = true;
                silenced = true;
            }
        }
        if !silenced {
            warnings.push(warning);
        }
    }
    // A style left out cannot tell; a CSS code before it counts as used.
    if let Some(style) = stripped {
        let leading = targets.leading(component.root, style.start_offset);
        if let Some((i, _)) = leading.iter().rev().find_map(|&comment| {
            ignores.of(comment).find(|(_, item)| {
                CSS_CODES.contains(&item.code.text(source))
                    || CSS_CODES.contains(&item.code_for_v5.as_str())
            })
        }) {
            used[i] = true;
        }
    }
    Applied {
        warnings,
        error: None,
        used,
    }
}

/// `lang` absent, `css`, or a language upstream transforms to CSS without a preprocessor
/// package: `postcss`.
fn is_css(attributes: &[(Span, Option<Span>)], source: &str) -> bool {
    attributes
        .iter()
        .find(|(name, _)| name.text(source) == "lang")
        .and_then(|(_, value)| *value)
        .is_none_or(|value| {
            let lang = value.text(source).to_ascii_lowercase();
            matches!(lang.as_str(), "css" | "postcss" | "pcss")
        })
}

const fn contains(span: Span, offset: u32) -> bool {
    span.start_offset <= offset && offset < span.end_offset
}

/// The nodes a warning's `svelte-ignore` comments may lead, as upstream finds them.
#[derive(Clone, Copy)]
struct Targets<'a> {
    component: &'a Component,
}

impl Targets<'_> {
    /// The leading comments of each node a warning at `span` can be ignored by, innermost
    /// first.
    fn chain(self, span: Span) -> Vec<Vec<Span>> {
        let component = self.component;
        let at = span.start_offset;
        if let Some(style) = &component.style
            && contains(style.span, at)
        {
            return vec![self.leading(component.root, style.span.start_offset)];
        }
        if let Some(script) = component
            .module
            .iter()
            .chain(&component.instance)
            .find(|s| contains(s.span, at))
        {
            return self.statement(script.program, script.content.start_offset, at);
        }
        // Upstream retries at the warning's middle, then its end, when nothing is at its start.
        let middle = span.start_offset + span.len() / 2;
        let path = [at, middle, span.end_offset]
            .into_iter()
            .map(|offset| self.path(offset))
            .find(|path| !path.is_empty())
            .unwrap_or_default();
        let Some(mut i) = path
            .iter()
            .rposition(|(node, _)| matches!(component.node(*node), TemplateNode::Element { .. }))
        else {
            return path
                .first()
                .map(|&(node, fragment)| vec![self.leading(fragment, self.start(node))])
                .unwrap_or_default();
        };
        let mut out = Vec::new();
        loop {
            let (node, fragment) = path[i];
            out.push(self.leading(fragment, self.start(node)));
            let climbs = matches!(
                component.node(node),
                TemplateNode::Element { .. }
                    | TemplateNode::If { .. }
                    | TemplateNode::Key { .. }
                    | TemplateNode::Each { .. }
                    | TemplateNode::Await { .. }
            );
            if !climbs || i == 0 {
                return out;
            }
            i -= 1;
            // An `{#await}` is reached only through its branches; a snippet or other node stops.
            if !matches!(
                component.node(path[i].0),
                TemplateNode::Element { .. }
                    | TemplateNode::If { .. }
                    | TemplateNode::Key { .. }
                    | TemplateNode::Each { .. }
                    | TemplateNode::Await { .. }
            ) {
                return out;
            }
        }
    }

    fn start(self, node: u32) -> u32 {
        self.component.node(node).span().start_offset
    }

    /// The template nodes containing `offset`, outermost first, each with the fragment it is in.
    fn path(self, offset: u32) -> Vec<(u32, Range)> {
        let component = self.component;
        let mut out = Vec::new();
        let mut fragments = vec![component.root];
        while let Some(fragment) = fragments.pop() {
            // Siblings are in document order and do not overlap.
            let children = component.children(fragment);
            let i = children
                .partition_point(|&child| component.node(child).span().end_offset <= offset);
            let Some(&node) = children
                .get(i)
                .filter(|&&child| contains(component.node(child).span(), offset))
            else {
                continue;
            };
            out.push((node, fragment));
            fragments.clear();
            match *component.node(node) {
                TemplateNode::Element { children, .. } => fragments.push(children),
                TemplateNode::If {
                    consequent,
                    alternate,
                    ..
                } => fragments.extend([Some(consequent), alternate].into_iter().flatten()),
                TemplateNode::Each { body, fallback, .. } => fragments.extend([body, fallback]),
                TemplateNode::Key { body, .. } | TemplateNode::Snippet { body, .. } => {
                    fragments.push(body);
                }
                TemplateNode::Await {
                    pending,
                    then,
                    catch,
                    ..
                } => fragments.extend(
                    [pending, then, catch]
                        .into_iter()
                        .filter_map(Range::present),
                ),
                _ => {}
            }
        }
        out
    }

    /// The comments before the node at `start` in `fragment`, back to the previous node that is
    /// neither text nor a comment, or to a `<script>` or `<style>` between.
    fn leading(self, fragment: Range, start: u32) -> Vec<Span> {
        let component = self.component;
        let raw = component
            .style
            .iter()
            .map(|s| s.span)
            .chain(
                component
                    .module
                    .iter()
                    .chain(&component.instance)
                    .map(|s| s.span),
            )
            .filter(|s| s.end_offset <= start)
            .map(|s| s.end_offset)
            .max();
        let mut out = Vec::new();
        let children = component.children(fragment);
        let before =
            children.partition_point(|&child| component.node(child).span().start_offset < start);
        for &child in children[..before].iter().rev() {
            let node = component.node(child);
            let span = node.span();
            if raw.is_some_and(|end| span.end_offset <= end) {
                break;
            }
            match node {
                TemplateNode::Comment { .. } => out.push(span),
                TemplateNode::Text { .. } => {}
                _ => break,
            }
        }
        out.reverse();
        out
    }

    /// The comments before the top-level statement of `program` that holds `at`.
    fn statement(
        self,
        program: rsvelte_typescript::NodeIdentifier,
        content: u32,
        at: u32,
    ) -> Vec<Vec<Span>> {
        let javascript = &self.component.javascript;
        let Kind::Program(statements) = javascript.kind(program) else {
            return Vec::new();
        };
        let span = |statement| javascript.source_location(statement).span();
        let i = statements
            .partition_point(|&statement| span(statement).is_some_and(|s| s.end_offset <= at));
        let Some(here) = statements
            .get(i)
            .and_then(|&s| span(s))
            .filter(|s| contains(*s, at))
        else {
            return Vec::new();
        };
        let previous_end = statements[..i]
            .iter()
            .rev()
            .find_map(|&s| span(s))
            .map_or(content, |s| s.end_offset);
        let comments = &javascript.comments;
        let first = comments.partition_point(|c| c.start_offset < previous_end);
        let last = comments.partition_point(|c| c.end_offset <= here.start_offset);
        vec![comments[first..last.max(first)].to_vec()]
    }
}

/// Whether a warning code is one the compiler warnings check, so an ignore of it that ignored
/// nothing is unused; a Svelte code they do not check cannot be told apart.
pub(super) fn decidable(item: &IgnoreItem, source: &str) -> bool {
    let named = |codes: &[&str]| {
        codes.contains(&item.code.text(source)) || codes.contains(&item.code_for_v5.as_str())
    };
    named(CompileWarnings::CODES) || !named(CompileWarnings::SVELTE_CODES)
}
