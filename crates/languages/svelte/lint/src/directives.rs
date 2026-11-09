//! Directive comments, applied to every rule's findings: `ESLint`'s own (`/* eslint-disable */` in
//! JavaScript), and eslint-plugin-svelte's processor (`<!-- eslint-disable -->` in the template,
//! the rules `settings.svelte.ignoreWarnings` names outside `<script>`).

use rsvelte_kernel::source::positions::{LineColumn, LineIndex, Span};
use rsvelte_lint_runner::finding::Finding;
use rsvelte_svelte::syntax::syntax_tree::{Component, Script, TemplateNode};

use rustc_hash::{FxHashMap, FxHashSet};

use crate::Pattern;
use crate::words::{is_js_space, words};

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub(crate) enum Kind {
    Disable,
    Enable,
    DisableLine,
    DisableNextLine,
}

impl Kind {
    pub(crate) const fn keyword(self) -> &'static str {
        match self {
            Self::Disable => "eslint-disable",
            Self::Enable => "eslint-enable",
            Self::DisableLine => "eslint-disable-line",
            Self::DisableNextLine => "eslint-disable-next-line",
        }
    }
}

/// An `<!-- eslint-… -->` comment of the template.
#[derive(Debug)]
pub(crate) struct HtmlDirective {
    pub(crate) kind: Kind,
    /// The whole comment, `<!--` and `-->` included.
    pub(crate) comment: Span,
    /// The rules it names; none means every rule.
    pub(crate) rules: Vec<Span>,
}

/// The template's directive comments, as eslint-plugin-svelte's `comment-directive` reads them.
pub(crate) fn html_directives(component: &Component, source: &str) -> Vec<HtmlDirective> {
    let mut out = Vec::new();
    for node in &component.nodes {
        let TemplateNode::Comment { span, data } = *node else {
            continue;
        };
        let value = data.text(source);
        // Upstream keeps the text before a ` -- ` description and does not trim it.
        let text = &value[..justification_start(value).unwrap_or(value.len())];
        let trimmed = text.trim_start_matches(is_js_space);
        let at = text.len() - trimmed.len();
        let Some((kind, keyword)) = [
            Kind::DisableNextLine,
            Kind::DisableLine,
            Kind::Disable,
            Kind::Enable,
        ]
        .into_iter()
        .map(|kind| (kind, kind.keyword()))
        .find(|(_, keyword)| {
            trimmed
                .strip_prefix(keyword)
                .is_some_and(|rest| rest.is_empty() || rest.starts_with(is_js_space))
        }) else {
            continue;
        };
        let single_line = !span
            .text(source)
            .contains(['\n', '\r', '\u{2028}', '\u{2029}']);
        if matches!(kind, Kind::DisableLine | Kind::DisableNextLine) && !single_line {
            continue;
        }
        let names = &text[at + keyword.len()..];
        let base = data.start_offset + (at + keyword.len()) as u32;
        let rules = words(names, base);
        out.push(HtmlDirective {
            kind,
            comment: span,
            rules,
        });
    }
    out
}

/// `ESLint`'s `/\s-{2,}\s/u`: where a directive's description starts.
fn justification_start(value: &str) -> Option<usize> {
    let bytes = value.as_bytes();
    value.char_indices().find_map(|(i, c)| {
        if !is_js_space(c) {
            return None;
        }
        let dashes = bytes[i + c.len_utf8()..]
            .iter()
            .take_while(|&&b| b == b'-')
            .count();
        let after = &value[i + c.len_utf8() + dashes..];
        (dashes >= 2 && after.starts_with(is_js_space)).then_some(i)
    })
}

/// Removes findings that `ESLint`'s own directive comments, in JavaScript comments, turn off.
pub(crate) fn apply_javascript(
    findings: &mut Vec<Finding>,
    comments: &[Span],
    source: &str,
    lines: &LineIndex,
) {
    let mut blocks: Vec<(u32, bool, Vec<&str>)> = Vec::new();
    let mut disabled_lines: FxHashMap<u32, Vec<Vec<&str>>> = FxHashMap::default();
    for &comment in comments {
        let text = comment.text(source);
        let (block, value) = text.strip_prefix("/*").map_or_else(
            || (false, text.strip_prefix("//").unwrap_or(text)),
            |inner| (true, inner.strip_suffix("*/").unwrap_or(inner)),
        );
        let part = value[..justification_start(value).unwrap_or(value.len())].trim();
        let Some((kind, rest)) = [
            Kind::DisableNextLine,
            Kind::DisableLine,
            Kind::Disable,
            Kind::Enable,
        ]
        .into_iter()
        .find_map(|kind| {
            let rest = part.strip_prefix(kind.keyword())?;
            (rest.is_empty() || rest.starts_with(is_js_space)).then_some((kind, rest))
        }) else {
            continue;
        };
        // `parseListConfig`: commas separate names, which may be quoted.
        let rules: Vec<&str> = rest
            .split(',')
            .map(|name| {
                let name = name.trim();
                ['"', '\'']
                    .into_iter()
                    .find_map(|q| name.strip_prefix(q)?.strip_suffix(q))
                    .unwrap_or(name)
            })
            .filter(|name| !name.is_empty())
            .collect();
        let start = lines.line_column(comment.start_offset).line;
        match kind {
            Kind::Disable | Kind::Enable if block => {
                blocks.push((comment.start_offset, kind == Kind::Disable, rules));
            }
            Kind::DisableLine if start == lines.line_column(comment.end_offset).line => {
                disabled_lines.entry(start).or_default().push(rules);
            }
            Kind::DisableNextLine => {
                disabled_lines
                    .entry(lines.line_column(comment.end_offset).line + 1)
                    .or_default()
                    .push(rules);
            }
            _ => {}
        }
    }
    if blocks.is_empty() && disabled_lines.is_empty() {
        return;
    }
    // `apply-disable-directives`: walk the findings in order, applying each directive at or
    // before them; a rule enabled after `eslint-disable` stays on.
    let mut next = 0;
    let mut all_disabled = false;
    let mut disabled: FxHashSet<&str> = FxHashSet::default();
    let mut enabled: FxHashSet<&str> = FxHashSet::default();
    findings.retain(|finding| {
        let at = finding.diagnostic.span.start_offset;
        while let Some((_, disable, rules)) = blocks.get(next).filter(|b| b.0 <= at) {
            next += 1;
            match (*disable, rules.is_empty()) {
                (true, true) => {
                    all_disabled = true;
                    disabled.clear();
                    enabled.clear();
                }
                (false, true) => {
                    all_disabled = false;
                    disabled.clear();
                }
                (true, false) => {
                    for rule in rules {
                        enabled.remove(rule);
                        disabled.insert(rule);
                    }
                }
                (false, false) => {
                    for rule in rules {
                        if all_disabled {
                            enabled.insert(rule);
                        }
                        disabled.remove(rule);
                    }
                }
            }
        }
        let rule = &*finding.diagnostic.code;
        if disabled.contains(&rule) || (all_disabled && !enabled.contains(&rule)) {
            return false;
        }
        let line = lines.line_column(at).line;
        !disabled_lines.get(&line).is_some_and(|directives| {
            directives
                .iter()
                .any(|rules| rules.is_empty() || rules.contains(&rule))
        })
    });
}

/// Which rules a directive of the processor applies to.
#[derive(Clone, Copy)]
pub(crate) enum Target<'a> {
    All,
    Rule(&'a str),
    Ignored(&'a [Pattern]),
}

impl Target<'_> {
    fn applies(self, rule: &str) -> bool {
        match self {
            Self::All => true,
            Self::Rule(name) => name == rule,
            Self::Ignored(patterns) => patterns.iter().any(|p| p.matches(rule)),
        }
    }
}

struct Block<'a> {
    at: LineColumn,
    target: Target<'a>,
    enable: bool,
    /// Where the directive is written: the rule's name, or the comment.
    define: u32,
}

struct Line<'a> {
    number: u32,
    target: Target<'a>,
    define: u32,
}

/// eslint-plugin-svelte's `CommentDirectives`, which its processor applies after `ESLint`.
#[derive(Default)]
pub(crate) struct ProcessorDirectives<'a> {
    blocks: Vec<Block<'a>>,
    lines: Vec<Line<'a>>,
}

impl<'a> ProcessorDirectives<'a> {
    pub(crate) fn block(
        &mut self,
        lines: &LineIndex,
        offset: u32,
        target: Target<'a>,
        enable: bool,
        define: u32,
    ) {
        self.blocks.push(Block {
            at: lines.line_column(offset),
            target,
            enable,
            define,
        });
    }

    pub(crate) fn line(&mut self, line: u32, target: Target<'a>, define: u32) {
        self.lines.push(Line {
            number: line,
            target,
            define,
        });
    }

    /// Removes the findings the directives turn off; with `unused_rule`, also that rule's
    /// reports of directives that turned something off.
    pub(crate) fn apply(
        &self,
        findings: &mut Vec<Finding>,
        lines: &LineIndex,
        unused_rule: Option<&str>,
    ) {
        // Earliest first; ties put a computed directive before a named one, so the named one is
        // the later, as upstream sorts.
        let mut order: Vec<usize> = (0..self.blocks.len()).collect();
        order.sort_by(|&a, &b| {
            let (x, y) = (&self.blocks[a], &self.blocks[b]);
            (x.at.line, x.at.column)
                .cmp(&(y.at.line, y.at.column))
                .then_with(|| is_rule(x.target).cmp(&is_rule(y.target)))
                .then_with(|| b.cmp(&a))
        });
        let mut used: FxHashSet<u32> = FxHashSet::default();
        if unused_rule.is_some() {
            self.used_enables(&order, &mut used);
        }
        let mut on_line: FxHashMap<u32, Vec<&Line<'_>>> = FxHashMap::default();
        for line in &self.lines {
            on_line.entry(line.number).or_default().push(line);
        }
        let positions: Vec<LineColumn> = findings
            .iter()
            .map(|f| lines.line_column(f.diagnostic.span.start_offset))
            .collect();
        let mut by_position: Vec<usize> = (0..findings.len()).collect();
        by_position.sort_by_key(|&i| (positions[i].line, positions[i].column));
        // The latest block so far of each target; the latest that applies decides.
        let mut all: Option<usize> = None;
        let mut named: FxHashMap<&str, usize> = FxHashMap::default();
        let mut ignored: Vec<(&[Pattern], usize)> = Vec::new();
        let mut next = 0;
        let mut keep = vec![true; findings.len()];
        for i in by_position {
            let rule = &*findings[i].diagnostic.code;
            let at = &positions[i];
            let line = on_line.get(&at.line).and_then(|directives| {
                let find = |is_named: bool| {
                    directives
                        .iter()
                        .find(|l| is_rule(l.target) == is_named && l.target.applies(rule))
                };
                find(true).or_else(|| find(false))
            });
            if let Some(line) = line {
                used.insert(line.define);
                keep[i] = false;
                continue;
            }
            // A finding's column counts from 1 and a directive's from 0, as upstream compares.
            let position = (at.line, at.column + 1);
            while let Some(&b) = order.get(next) {
                let block = &self.blocks[b];
                if position < (block.at.line, block.at.column) {
                    break;
                }
                next += 1;
                match block.target {
                    Target::All => all = Some(next),
                    Target::Rule(name) => {
                        named.insert(name, next);
                    }
                    Target::Ignored(patterns) => {
                        match ignored.iter_mut().find(|(p, _)| std::ptr::eq(*p, patterns)) {
                            Some(last) => last.1 = next,
                            None => ignored.push((patterns, next)),
                        }
                    }
                }
            }
            let decides = [all, named.get(rule).copied()]
                .into_iter()
                .chain(ignored.iter().filter_map(|&(patterns, rank)| {
                    Target::Ignored(patterns)
                        .applies(rule)
                        .then_some(Some(rank))
                }))
                .flatten()
                .max();
            if let Some(rank) = decides {
                let block = &self.blocks[order[rank - 1]];
                if !block.enable {
                    used.insert(block.define);
                    keep[i] = false;
                }
            }
        }
        let mut keep = keep.into_iter();
        findings.retain(|_| keep.next().expect("one verdict per finding"));
        if let Some(name) = unused_rule {
            findings.retain(|f| {
                &*f.diagnostic.code != name || !used.contains(&f.diagnostic.span.start_offset)
            });
        }
    }

    /// An enable directive is used when a disable directive before it is.
    fn used_enables(&self, order: &[usize], used: &mut FxHashSet<u32>) {
        let mut named: FxHashMap<&str, Vec<u32>> = FxHashMap::default();
        let mut other: Vec<u32> = Vec::new();
        for &i in order.iter().rev() {
            let block = &self.blocks[i];
            match (block.enable, block.target) {
                (true, Target::Rule(name)) => named.entry(name).or_default().push(block.define),
                (true, _) => {
                    named.clear();
                    other.clear();
                    other.push(block.define);
                }
                (false, Target::Rule(name)) => {
                    used.extend(named.remove(name).into_iter().flatten());
                    used.extend(std::mem::take(&mut other));
                }
                (false, _) => {
                    used.extend(named.drain().flat_map(|(_, defines)| defines));
                    used.extend(std::mem::take(&mut other));
                }
            }
        }
    }
}

/// The template's directive comments; each `<script>` turns every rule back on.
pub(crate) fn template<'a>(
    component: &Component,
    source: &'a str,
    lines: &LineIndex,
) -> ProcessorDirectives<'a> {
    let mut out = ProcessorDirectives::default();
    for directive in html_directives(component, source) {
        let comment = directive.comment;
        let targets: Vec<(Target<'a>, u32)> = if directive.rules.is_empty() {
            vec![(Target::All, comment.start_offset)]
        } else {
            directive
                .rules
                .iter()
                .map(|rule| (Target::Rule(rule.text(source)), rule.start_offset))
                .collect()
        };
        for (target, define) in targets {
            match directive.kind {
                Kind::Disable => out.block(lines, comment.end_offset, target, false, define),
                Kind::Enable => out.block(lines, comment.start_offset, target, true, define),
                Kind::DisableLine | Kind::DisableNextLine => {
                    let next = u32::from(directive.kind == Kind::DisableNextLine);
                    out.line(
                        lines.line_column(comment.start_offset).line + next,
                        target,
                        define,
                    );
                }
            }
        }
    }
    for script in scripts(component) {
        out.block(
            lines,
            script.content.start_offset,
            Target::All,
            true,
            script.span.start_offset,
        );
    }
    out
}

/// eslint-plugin-svelte's `system` rule: the rules `ignoreWarnings` names are off outside
/// `<script>`.
pub(crate) fn ignored_in_template<'a>(
    component: &Component,
    patterns: &'a [Pattern],
    lines: &LineIndex,
) -> ProcessorDirectives<'a> {
    let mut out = ProcessorDirectives::default();
    let target = Target::Ignored(patterns);
    out.block(lines, 0, target, false, 0);
    for script in scripts(component) {
        out.block(lines, script.content.start_offset, target, true, 0);
        out.block(lines, script.content.end_offset, target, false, 0);
    }
    out
}

fn scripts(component: &Component) -> impl Iterator<Item = &Script> {
    component.module.iter().chain(&component.instance)
}

const fn is_rule(target: Target<'_>) -> bool {
    matches!(target, Target::Rule(_))
}

#[cfg(test)]
mod tests;
