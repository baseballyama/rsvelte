//! `ESLint`'s own directive comments, in JavaScript comments.

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::{LineIndex, Span};
use rsvelte_lint_runner::finding::{Finding, Fix, UNUSED_DIRECTIVE};
use rustc_hash::FxHashMap;

use super::{Kind, justification_start};
use crate::rule::JavaScriptComment;

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
pub(crate) fn apply<'l>(
    findings: &mut Vec<Finding>,
    comments: &[JavaScriptComment],
    source: &str,
    lines: &dyn Fn() -> &'l LineIndex,
    running: impl Fn(&str) -> bool,
) -> Vec<Finding> {
    let mut parsed: Vec<Comment<'_>> = Vec::new();
    let mut blocks: Vec<Applied> = Vec::new();
    let mut line_directives: Vec<Applied> = Vec::new();
    for &JavaScriptComment { span, value, block } in comments {
        let Some((kind, rules, list)) = javascript_directive(value.text(source)) else {
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

/// The kind of a directive comment whose text between the delimiters is `value`, the rules it
/// names, and their list as written.
fn javascript_directive(value: &str) -> Option<(Kind, Rules<'_>, &str)> {
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
        (rest.is_empty() || rest.starts_with(is_ecmascript_whitespace)).then_some((kind, rest))
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
    Some((kind, rules, rest.trim()))
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

mod removal;
