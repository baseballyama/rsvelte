use rsvelte_kernel::output::emitter::BorrowedEdits as Edits;
use rsvelte_kernel::source::positions::Span;

use crate::matcher::is_global;
use crate::syntax_tree::{ComplexSelector, Rule, RuleKind, Simple, StyleSheet};

mod keyframes;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RenderMode {
    Preserve,
    Minify,
}

#[must_use]
pub fn render(source: &str, sheet: &StyleSheet, used: &[bool], hash: &str) -> String {
    render_with_facts(
        source,
        sheet,
        used,
        &vec![true; sheet.relative_count as usize],
        hash,
    )
}

#[must_use]
pub fn render_with_facts(
    source: &str,
    sheet: &StyleSheet,
    used: &[bool],
    scoped: &[bool],
    hash: &str,
) -> String {
    render_with_mode(source, sheet, used, scoped, hash, RenderMode::Preserve)
}

#[must_use]
pub fn render_with_mode(
    source: &str,
    sheet: &StyleSheet,
    used: &[bool],
    scoped: &[bool],
    hash: &str,
    mode: RenderMode,
) -> String {
    let modifier_end = hash.len() + ".".len();
    let repeated_end = modifier_end + hash.len() + ":where(.)".len();
    let mut modifiers = String::with_capacity(repeated_end + hash.len() + "-".len());
    modifiers.push('.');
    modifiers.push_str(hash);
    modifiers.push_str(":where(.");
    modifiers.push_str(hash);
    modifiers.push(')');
    modifiers.push_str(hash);
    modifiers.push('-');
    let modifier = &modifiers[..modifier_end];
    let repeated = &modifiers[modifier_end..repeated_end];
    let prefix = &modifiers[repeated_end..];
    let mut renderer = Renderer {
        source,
        sheet,
        used,
        scoped,
        mode,
        modifier,
        repeated,
        keyframes: keyframes::Names::new(source, sheet, prefix),
        edits: Edits::default(),
    };
    for rule in &sheet.rules {
        renderer.rule(rule, false, false);
    }
    if mode == RenderMode::Minify {
        renderer.trim_before(sheet.content.end_offset);
    }
    renderer.edits.apply_in(source, sheet.content)
}

#[must_use]
pub fn selectors(sheet: &StyleSheet) -> Vec<&ComplexSelector> {
    let mut out = Vec::new();
    visit_selectors(sheet, |selector| out.push(selector));
    out
}

pub fn visit_selectors<'a>(sheet: &'a StyleSheet, mut visit: impl FnMut(&'a ComplexSelector)) {
    fn walk<'a>(rules: &'a [Rule], visit: &mut impl FnMut(&'a ComplexSelector)) {
        for rule in rules {
            if let RuleKind::Style { selectors, .. } = &rule.kind {
                for selector in selectors {
                    visit(selector);
                }
            }
            walk(&rule.children, visit);
        }
    }
    walk(&sheet.rules, &mut visit);
}

struct Renderer<'a> {
    source: &'a str,
    sheet: &'a StyleSheet,
    used: &'a [bool],
    scoped: &'a [bool],
    mode: RenderMode,
    modifier: &'a str,
    repeated: &'a str,
    keyframes: keyframes::Names<'a>,
    edits: Edits<'a>,
}

impl Renderer<'_> {
    fn trim_before(&mut self, end: u32) {
        let index = self
            .sheet
            .whitespace
            .partition_point(|span| span.end_offset < end);
        if let Some(&span) = self
            .sheet
            .whitespace
            .get(index)
            .filter(|span| span.end_offset == end)
        {
            self.edits.replace(span, "");
        }
    }

    fn minify_declaration(&mut self, declaration: &crate::syntax_tree::Declaration) {
        let property = declaration.property.text(self.source);
        let name = property
            .strip_prefix("-webkit-")
            .or_else(|| property.strip_prefix("-moz-"))
            .or_else(|| property.strip_prefix("-o-"))
            .unwrap_or(property);
        if name.eq_ignore_ascii_case("animation") || name.eq_ignore_ascii_case("animation-name") {
            return;
        }
        self.trim_before(declaration.span.start_offset);
        if !property.starts_with("--") {
            let start = declaration.property.end_offset + 1;
            let index = self
                .sheet
                .whitespace
                .partition_point(|span| span.start_offset < start);
            if let Some(&span) = self
                .sheet
                .whitespace
                .get(index)
                .filter(|span| span.start_offset == start)
            {
                self.edits.replace(span, "");
            }
        }
    }

    fn used(&self, selector: &ComplexSelector) -> bool {
        self.used[selector.id as usize] || selector.parts.iter().all(|p| is_global(self.source, p))
    }

    fn empty(&self, rule: &Rule, global: bool) -> bool {
        rule.declarations.is_empty()
            && rule.children.iter().all(|child| match &child.kind {
                RuleKind::At { block, .. } => {
                    block.is_some() && child.declarations.is_empty() && child.children.is_empty()
                }
                RuleKind::Keyframe { .. } => false,
                RuleKind::Style { selectors, .. } => {
                    let child_global = global
                        || selectors.iter().any(|s| {
                            s.parts.iter().any(|p| {
                                p.simple
                                    .iter()
                                    .any(|simple| simple.is_global_block(self.source))
                            })
                        });
                    (!child_global && !selectors.iter().any(|s| self.used(s)))
                        || self.empty(child, child_global)
                }
            })
    }

    fn comment(&mut self, span: Span, open: &'static str) {
        self.edits.insert(span.start_offset, open);
        self.edits.insert(span.end_offset, "*/");
        let first = self
            .sheet
            .comments
            .partition_point(|c| c.end_offset <= span.start_offset);
        for comment in &self.sheet.comments[first..] {
            if comment.start_offset >= span.end_offset {
                break;
            }
            self.edits.insert(comment.end_offset - 1, "\\");
        }
        let first = self
            .sheet
            .comment_closers
            .partition_point(|c| c.end_offset <= span.start_offset);
        for comment in &self.sheet.comment_closers[first..] {
            if comment.start_offset >= span.end_offset {
                break;
            }
            self.edits.insert(comment.start_offset, "\\");
        }
    }

    fn rule(&mut self, rule: &Rule, global: bool, inherited_bump: bool) {
        let mut child_global = global;
        let mut child_bump = inherited_bump;
        match &rule.kind {
            RuleKind::Style { selectors, block } => {
                if self.mode == RenderMode::Minify {
                    self.trim_before(rule.span.start_offset);
                }
                let global_block = selectors.iter().any(|s| {
                    s.parts.iter().any(|p| {
                        p.simple
                            .iter()
                            .any(|simple| simple.is_global_block(self.source))
                    })
                });
                child_global |= global_block;
                if self.empty(rule, child_global) {
                    if self.mode == RenderMode::Minify {
                        self.edits.replace(rule.span, "");
                    } else {
                        self.comment(rule.span, "/* (empty) ");
                    }
                    return;
                }
                if !global && !selectors.iter().any(|s| self.used(s)) {
                    if self.mode == RenderMode::Minify {
                        self.edits.replace(rule.span, "");
                    } else {
                        self.comment(rule.span, "/* (unused) ");
                    }
                    return;
                }
                if self.mode == RenderMode::Minify {
                    self.trim_before(block.end_offset - 1);
                }
                let bare_global = global_block
                    && selectors.len() == 1
                    && selectors[0].parts.len() == 1
                    && selectors[0].parts[0].simple.len() == 1;
                if !bare_global {
                    for selector in selectors {
                        if self.mode == RenderMode::Preserve || global || self.used(selector) {
                            self.strip_globals(selector);
                        }
                    }
                }
                if bare_global && self.mode == RenderMode::Minify {
                    self.edits.replace(
                        Span::new(rule.span.start_offset, block.start_offset + 1),
                        "",
                    );
                    self.edits
                        .replace(Span::new(block.end_offset - 1, block.end_offset), "");
                } else if bare_global {
                    self.comment(
                        Span::new(rule.span.start_offset, block.start_offset + 1),
                        "/* ",
                    );
                    self.comment(Span::new(block.end_offset - 1, block.end_offset), "/*");
                } else if !global {
                    self.prune(selectors);
                    for selector in selectors {
                        if self.used(selector) {
                            self.selector(selector, inherited_bump, true);
                        }
                    }
                    child_bump |= selectors.iter().any(|s| {
                        s.parts
                            .iter()
                            .any(|p| self.scoped[p.id as usize] && !is_global(self.source, p))
                    });
                }
            }
            RuleKind::At { name, prelude, .. } if name.text(self.source).ends_with("keyframes") => {
                self.keyframes.rename(*prelude, global, &mut self.edits);
                return;
            }
            RuleKind::At { .. } | RuleKind::Keyframe { .. } => {}
        }
        for declaration in &rule.declarations {
            self.keyframes.declaration(declaration, &mut self.edits);
            if self.mode == RenderMode::Minify {
                self.minify_declaration(declaration);
            }
        }
        for child in &rule.children {
            self.rule(child, child_global, child_bump);
        }
    }

    fn strip_globals(&mut self, selector: &ComplexSelector) {
        for (index, relative) in selector.parts.iter().enumerate() {
            for simple in &relative.simple {
                if let Simple::PseudoClass {
                    span,
                    name,
                    arguments,
                    ..
                } = simple
                    && name.text(self.source) == "global"
                {
                    if let Some(arguments) = arguments {
                        self.edits
                            .replace(Span::new(span.start_offset, arguments.start_offset), "");
                        self.edits
                            .replace(Span::new(arguments.end_offset, span.end_offset), "");
                    } else if index > 0 {
                        self.edits.replace(
                            Span::new(selector.parts[index - 1].span.end_offset, span.end_offset),
                            "",
                        );
                    } else {
                        let replacement = if relative.parent_rule.is_some() {
                            "&"
                        } else {
                            ""
                        };
                        self.edits.replace(*span, replacement);
                    }
                }
            }
            for simple in &relative.simple {
                if let Simple::PseudoClass { selectors, .. } = simple {
                    for selector in selectors {
                        self.strip_globals(selector);
                    }
                }
            }
        }
    }

    fn selector(&mut self, selector: &ComplexSelector, mut bumped: bool, prune: bool) {
        for relative in &selector.parts {
            let outer_global = relative.global
                || relative
                    .simple
                    .first()
                    .is_pseudo(self.source, &["global", "root", "host"]);
            bumped |= relative.simple.first().is_pseudo(self.source, &["root"])
                && relative
                    .simple
                    .iter()
                    .any(|s| s.is_pseudo(self.source, &["has"]));
            let standalone_function = relative.simple.len() == 1
                && relative.simple[0].is_pseudo(self.source, &["is", "where"]);
            let nesting = relative
                .simple
                .iter()
                .any(|s| matches!(s, Simple::Nesting(_)));
            if self.scoped[relative.id as usize]
                && !standalone_function
                && !nesting
                && !outer_global
            {
                let modifier = if bumped { self.repeated } else { self.modifier };
                for (i, simple) in relative.simple.iter().enumerate().rev() {
                    match simple {
                        Simple::PseudoClass { span, name, .. }
                        | Simple::PseudoElement { span, name } => {
                            if i == 0 && !matches!(name.text(self.source), "root" | "host") {
                                self.edits.insert(span.start_offset, modifier);
                                bumped = true;
                            }
                        }
                        Simple::Universal(span) => {
                            self.edits.replace(*span, modifier);
                            bumped = true;
                            break;
                        }
                        _ => {
                            self.edits.insert(simple.span().end_offset, modifier);
                            bumped = true;
                            break;
                        }
                    }
                }
            }
        }
        for relative in &selector.parts {
            for simple in &relative.simple {
                if let Simple::PseudoClass {
                    name, selectors, ..
                } = simple
                    && !relative.global
                    && matches!(name.text(self.source), "is" | "where" | "has" | "not")
                {
                    let negated = name.text(self.source) == "not";
                    if prune && !negated {
                        self.prune(selectors);
                    }
                    for nested in selectors {
                        if !prune || negated || self.used(nested) {
                            self.selector(nested, bumped, prune && !negated);
                        }
                    }
                }
            }
        }
    }

    fn prune(&mut self, selectors: &[ComplexSelector]) {
        let mut i = 0;
        while i < selectors.len() {
            if self.used(&selectors[i]) {
                i += 1;
                continue;
            }
            let start = i;
            while i < selectors.len() && !self.used(&selectors[i]) {
                i += 1;
            }
            let end = if i == selectors.len() {
                selectors[i - 1].span.end_offset
            } else {
                let comma = selectors[i - 1].comma.expect("a comma separates selectors");
                if start == 0 {
                    comma.end_offset
                } else {
                    comma.start_offset
                }
            };
            if self.mode == RenderMode::Minify {
                let start = if start > 0 {
                    selectors[start - 1].span.end_offset
                } else {
                    selectors[start].span.start_offset
                };
                self.edits.replace(Span::new(start, end), "");
                continue;
            }
            if start > 0 {
                self.edits.replace(
                    Span::new(
                        selectors[start - 1].span.end_offset,
                        selectors[start].span.start_offset,
                    ),
                    " /* (unused) ",
                );
                self.comment(Span::new(selectors[start].span.start_offset, end), "");
            } else {
                self.comment(
                    Span::new(selectors[start].span.start_offset, end),
                    "/* (unused) ",
                );
            }
        }
    }
}
