//! Directive comments, applied to every rule's findings: `ESLint`'s own (`/* eslint-disable */` in
//! JavaScript), and eslint-plugin-svelte's processor (`<!-- eslint-disable -->` in the template,
//! the rules `settings.svelte.ignoreWarnings` names outside `<script>`).

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::{LineColumn, LineIndex, Span};
use rsvelte_lint_runner::finding::{Finding, Fix, UNUSED_DIRECTIVE};
use rsvelte_svelte_syntax::syntax_tree::{Component, Script, TemplateNode};
use rustc_hash::{FxHashMap, FxHashSet};

use crate::Pattern;
use crate::words::{is_javascript_space, words};

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
pub(crate) struct MarkupDirective {
    pub(crate) kind: Kind,
    /// The whole comment, `<!--` and `-->` included.
    pub(crate) comment: Span,
    /// The rules it names; none means every rule.
    pub(crate) rules: Vec<Span>,
}

/// The template's directive comments, as eslint-plugin-svelte's `comment-directive` reads them.
pub(crate) fn markup_directives(component: &Component, source: &str) -> Vec<MarkupDirective> {
    let mut out = Vec::new();
    for node in &component.nodes {
        let TemplateNode::Comment { span, data } = *node else {
            continue;
        };
        let value = data.text(source);
        // Upstream keeps the text before a ` -- ` description and does not trim it.
        let text = &value[..justification_start(value).unwrap_or(value.len())];
        let trimmed = text.trim_start_matches(is_javascript_space);
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
                .is_some_and(|rest| rest.is_empty() || rest.starts_with(is_javascript_space))
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
        out.push(MarkupDirective {
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
        if !is_javascript_space(c) {
            return None;
        }
        let dashes = bytes[i + c.len_utf8()..]
            .iter()
            .take_while(|&&b| b == b'-')
            .count();
        let after = &value[i + c.len_utf8() + dashes..];
        (dashes >= 2 && after.starts_with(is_javascript_space)).then_some(i)
    })
}

/// One rule name of a directive comment, or every rule (`None`), at `ESLint`'s position: a line
/// and a 1-based column, where column 0 comes before the line's first finding.
struct Applied {
    at: (u32, u32),
    disable: bool,
    comment: usize,
    rule: Option<usize>,
}

/// The rules a directive comment names, each with whether it turned a finding off.
type Rules<'a> = Vec<(&'a str, bool)>;

/// A JavaScript directive comment.
struct Comment<'a> {
    span: Span,
    disable: bool,
    rules: Rules<'a>,
    /// The rule names as written, without the surrounding whitespace.
    list: &'a str,
}

/// Removes findings that `ESLint`'s own directive comments, in JavaScript comments, turn off, and
/// returns `ESLint`'s reports of the disable directives that turned nothing off. It reports only
/// what it can tell: a rule name that `running` says runs, whose findings are all here.
pub(crate) fn apply_javascript<'l>(
    findings: &mut Vec<Finding>,
    comments: &[Span],
    source: &str,
    lines: &dyn Fn() -> &'l LineIndex,
    running: impl Fn(&str) -> bool,
) -> Vec<Finding> {
    let mut parsed: Vec<Comment<'_>> = Vec::new();
    let mut blocks: Vec<Applied> = Vec::new();
    let mut line_directives: Vec<Applied> = Vec::new();
    for &span in comments {
        let Some((kind, block, rules, list)) = javascript_directive(span.text(source)) else {
            continue;
        };
        let start = lines().line_column(span.start_offset);
        let line = match kind {
            Kind::Disable | Kind::Enable if block => None,
            Kind::DisableLine if start.line == lines().line_column(span.end_offset).line => {
                Some(start.line)
            }
            Kind::DisableNextLine => Some(lines().line_column(span.end_offset).line + 1),
            _ => continue,
        };
        let comment = parsed.len();
        let every = std::iter::once(None).filter(|_| rules.is_empty());
        for rule in (0..rules.len()).map(Some).chain(every) {
            let applied = |at, disable| Applied {
                at,
                disable,
                comment,
                rule,
            };
            match line {
                None => blocks.push(applied(
                    (start.line, start.column + 1),
                    kind == Kind::Disable,
                )),
                Some(line) => {
                    line_directives.push(applied((line, 1), true));
                    line_directives.push(applied((line + 1, 0), false));
                }
            }
        }
        parsed.push(Comment {
            span,
            disable: kind != Kind::Enable,
            rules,
            list,
        });
    }
    if parsed.is_empty() {
        return Vec::new();
    }
    line_directives.sort_by_key(|d| d.at);
    let at: Vec<(u32, u32)> = findings
        .iter()
        .map(|f| {
            let at = lines().line_column(f.diagnostic.span.start_offset);
            (at.line, at.column + 1)
        })
        .collect();
    let mut suppressed = vec![false; findings.len()];
    // `apply-disable-directives`: block directives first, then line ones.
    for pass in [&blocks, &line_directives] {
        credit(pass, findings, &at, &mut parsed, &mut suppressed);
    }
    let mut keep = suppressed.into_iter();
    findings.retain(|_| !keep.next().expect("one verdict per finding"));
    parsed
        .iter()
        .filter(|comment| comment.disable)
        .flat_map(|comment| unused(comment, source, &running))
        .collect()
}

/// A directive comment's kind, whether it is a block comment, the rules it names, and their
/// list as written.
fn javascript_directive(text: &str) -> Option<(Kind, bool, Rules<'_>, &str)> {
    let (block, value) = text.strip_prefix("/*").map_or_else(
        || (false, text.strip_prefix("//").unwrap_or(text)),
        |inner| (true, inner.strip_suffix("*/").unwrap_or(inner)),
    );
    let part = value[..justification_start(value).unwrap_or(value.len())].trim();
    let (kind, rest) = [
        Kind::DisableNextLine,
        Kind::DisableLine,
        Kind::Disable,
        Kind::Enable,
    ]
    .into_iter()
    .find_map(|kind| {
        let rest = part.strip_prefix(kind.keyword())?;
        (rest.is_empty() || rest.starts_with(is_javascript_space)).then_some((kind, rest))
    })?;
    // `parseListConfig`: commas separate names, which may be quoted; a repeated name is one.
    let mut rules: Rules<'_> = Vec::new();
    for name in rest.split(',') {
        let name = name.trim();
        let name = ['"', '\'']
            .into_iter()
            .find_map(|q| name.strip_prefix(q)?.strip_suffix(q))
            .unwrap_or(name);
        if !name.is_empty() && !rules.iter().any(|&(r, _)| r == name) {
            rules.push((name, false));
        }
    }
    Some((kind, block, rules, rest.trim()))
}

/// One pass of `applyDirectives`: the latest directive at or before a finding that names its
/// rule or every rule decides, and a disable one is credited unless an earlier pass was.
fn credit(
    pass: &[Applied],
    findings: &[Finding],
    at: &[(u32, u32)],
    parsed: &mut [Comment<'_>],
    suppressed: &mut [bool],
) {
    let mut next = 0;
    let mut all: Option<usize> = None;
    let mut named: FxHashMap<&str, usize> = FxHashMap::default();
    for (i, finding) in findings.iter().enumerate() {
        while let Some(directive) = pass.get(next).filter(|d| d.at <= at[i]) {
            match directive.rule {
                None => all = Some(next),
                Some(rule) => {
                    named.insert(parsed[directive.comment].rules[rule].0, next);
                }
            }
            next += 1;
        }
        let latest = all.max(named.get(&*finding.diagnostic.code).copied());
        let Some(directive) = latest.map(|latest| &pass[latest]) else {
            continue;
        };
        if !directive.disable {
            continue;
        }
        if !suppressed[i]
            && let Some(rule) = directive.rule
        {
            parsed[directive.comment].rules[rule].1 = true;
        }
        suppressed[i] = true;
    }
}

/// `processUnusedDirectives` for one disable comment: one report naming every rule when none
/// turned anything off, else one per unused rule.
fn unused(comment: &Comment<'_>, source: &str, running: &impl Fn(&str) -> bool) -> Vec<Finding> {
    let mut unused = comment.rules.iter().filter(|&&(_, used)| !used).peekable();
    // An unnamed directive also covers rules rsvelte does not run, which may have used it.
    if unused.peek().is_none() {
        return Vec::new();
    }
    let report = |description: &str, fix: Option<Fix>| {
        let message = format!(
            "Unused eslint-disable directive (no problems were reported from {description})."
        );
        let at = Span::new(comment.span.start_offset, comment.span.start_offset);
        let mut finding =
            Finding::from(Diagnostic::warning(UNUSED_DIRECTIVE, message, at).without_end());
        finding.fix = fix;
        finding
    };
    let all_run = comment.rules.iter().all(|&(rule, _)| running(rule));
    let any_used = comment.rules.iter().any(|&(_, used)| used);
    if all_run && !any_used {
        let names: Vec<String> = comment
            .rules
            .iter()
            .map(|(rule, _)| format!("'{rule}'"))
            .collect();
        let description = match names.as_slice() {
            [.., last] if names.len() > 2 => {
                format!("{}, or {last}", names[..names.len() - 1].join(", "))
            }
            _ => names.join(" or "),
        };
        return vec![report(&description, Some(Fix::replace(comment.span, " ")))];
    }
    // An unknown or non-running rule may have used it, which decides one report or one per rule.
    if !any_used {
        return Vec::new();
    }
    // `ESLint` finds the list from the comment's start, as `indexOf` does.
    let text = comment.span.text(source);
    let list_start = text
        .find(comment.list)
        .map(|i| comment.span.start_offset as usize + i);
    unused
        .filter(|&&(rule, _)| running(rule))
        .map(|(rule, _)| {
            let fix = list_start.and_then(|start| {
                let (from, to) = removal::rule_removal(comment.list, rule)?;
                Some(Fix::remove(Span::new(
                    (start + from) as u32,
                    (start + to) as u32,
                )))
            });
            report(&format!("'{rule}'"), fix)
        })
        .collect()
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
    for directive in markup_directives(component, source) {
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

mod removal;

#[cfg(test)]
mod tests;
