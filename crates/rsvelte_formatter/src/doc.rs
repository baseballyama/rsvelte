//! A minimal prettier-style document IR and printer.
//!
//! A faithful subset of prettier's `Doc` builders and printing algorithm
//! (`group` / `fill` / `indent` / `line` / `softline` / `hardline` with a
//! `fits` look-ahead). Used by the markup formatter to reproduce
//! prettier-plugin-svelte's prose fill + inline-element hug-break exactly — the
//! one behaviour the edit-based passes cannot express, because the choice
//! between an inline hug and a fresh-line break depends on column-aware
//! measurement of the surrounding content.

use unicode_width::UnicodeWidthStr;

// Several variants below (`Literalline`, `ForcedGroup`, `Dedent`, `BreakParent`)
// and `propagate_breaks` are the IR scaffolding for the prettier-plugin-svelte
// child-layout port (see docs/fmt-layout-port-plan.md); they are exercised by
// unit tests here and consumed by the markup child-printer in the next milestone.
#[derive(Clone)]
#[allow(dead_code)]
pub(crate) enum Doc {
    Text(String),
    /// flat: a space; break: newline + indent.
    Line,
    /// flat: nothing; break: newline + indent.
    Softline,
    /// always a newline + indent.
    Hardline,
    /// always a raw newline with NO indentation (prettier's `literalline`) —
    /// for verbatim content such as `<pre>` bodies.
    Literalline,
    Group(Vec<Doc>),
    /// A group already forced into break mode (prettier's broken group, produced
    /// by [`propagate_breaks`] from a group containing a [`Doc::BreakParent`] or a
    /// hard break). Never measured with `fits`.
    ForcedGroup(Vec<Doc>),
    Indent(Vec<Doc>),
    /// `-1` indent level for its contents (prettier's `dedent`) — puts a wrapped
    /// open tag's trailing `>` back at the outer column.
    Dedent(Vec<Doc>),
    /// Alternating `[content, sep, content, sep, …]` greedily packed.
    Fill(Vec<Doc>),
    Concat(Vec<Doc>),
    /// Sentinel: forces the nearest enclosing group to break. Consumed by
    /// [`propagate_breaks`]; prints as nothing.
    BreakParent,
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum Mode {
    Flat,
    Break,
}

/// Render `doc`. `base_indent` is the indent level of the root (newlines emit
/// `unit` repeated by the current level). `start_col` is the column the first
/// line begins at (so `fits` measures correctly when the output is spliced after
/// a prefix). The first line is NOT prefixed with indentation — the caller owns
/// that.
pub(crate) fn print(
    doc: Doc,
    width: usize,
    unit: &str,
    base_indent: usize,
    start_col: usize,
) -> String {
    let mut out = String::new();
    let mut pos = start_col;
    let mut cmds: Vec<(usize, Mode, Doc)> = vec![(base_indent, Mode::Break, doc)];

    while let Some((ind, mode, d)) = cmds.pop() {
        match d {
            Doc::Text(s) => {
                pos += s.width();
                out.push_str(&s);
            }
            Doc::Concat(ps) => {
                for p in ps.into_iter().rev() {
                    cmds.push((ind, mode, p));
                }
            }
            Doc::Indent(ps) => {
                for p in ps.into_iter().rev() {
                    cmds.push((ind + 1, mode, p));
                }
            }
            Doc::Dedent(ps) => {
                let de = ind.saturating_sub(1);
                for p in ps.into_iter().rev() {
                    cmds.push((de, mode, p));
                }
            }
            Doc::Line | Doc::Softline | Doc::Hardline => {
                let hard = matches!(d, Doc::Hardline);
                if mode == Mode::Flat && !hard {
                    if matches!(d, Doc::Line) {
                        out.push(' ');
                        pos += 1;
                    }
                } else {
                    trim_trailing_blanks(&mut out);
                    out.push('\n');
                    let pad = unit.repeat(ind);
                    out.push_str(&pad);
                    pos = pad.width();
                }
            }
            Doc::Literalline => {
                // Raw newline with no indentation (verbatim content).
                trim_trailing_blanks(&mut out);
                out.push('\n');
                pos = 0;
            }
            Doc::BreakParent => {} // consumed by propagate_breaks; prints nothing
            Doc::Group(ps) => {
                let flat = fits(width as isize - pos as isize, &cmds, &ps);
                let m = if flat { Mode::Flat } else { Mode::Break };
                for p in ps.into_iter().rev() {
                    cmds.push((ind, m, p));
                }
            }
            Doc::ForcedGroup(ps) => {
                // Already known to break — never measured.
                for p in ps.into_iter().rev() {
                    cmds.push((ind, Mode::Break, p));
                }
            }
            Doc::Fill(mut ps) => {
                if ps.is_empty() {
                    continue;
                }
                let content = ps[0].clone();
                // Fill measures locally (a content item / a content–sep–content
                // pair), NOT the whole rest of the document — otherwise a large
                // sibling after the fill (an element) would make every word
                // "not fit" and break the prose one word per line.
                let content_fits = fits(
                    width as isize - pos as isize,
                    &[],
                    std::slice::from_ref(&content),
                );
                if ps.len() == 1 {
                    let m = if content_fits {
                        Mode::Flat
                    } else {
                        Mode::Break
                    };
                    cmds.push((ind, m, content));
                    continue;
                }
                let ws = ps[1].clone();
                if ps.len() == 2 {
                    let m = if content_fits {
                        Mode::Flat
                    } else {
                        Mode::Break
                    };
                    cmds.push((ind, m, ws));
                    cmds.push((ind, m, content));
                    continue;
                }
                let rest = Doc::Fill(ps.split_off(2));
                let second = match &rest {
                    Doc::Fill(rp) => rp[0].clone(),
                    _ => unreachable!(),
                };
                let pair = vec![content.clone(), ws.clone(), second];
                let pair_fits = fits(width as isize - pos as isize, &[], &pair);
                cmds.push((ind, mode, rest));
                if pair_fits {
                    cmds.push((ind, Mode::Flat, ws));
                    cmds.push((ind, Mode::Flat, content));
                } else if content_fits {
                    cmds.push((ind, Mode::Break, ws));
                    cmds.push((ind, Mode::Flat, content));
                } else {
                    cmds.push((ind, Mode::Break, ws));
                    cmds.push((ind, Mode::Break, content));
                }
            }
        }
    }
    out
}

/// Whether `next` (rendered flat) followed by the rest of the command stack fits
/// within `remaining` columns before the next forced line break. A faithful port
/// of prettier's `doc.js` `fits`: a soft `line` defers a pending space that is
/// only charged when a following string is emitted (so a trailing `line` costs
/// nothing), and a hard/break line ends the measurement successfully.
fn fits(mut remaining: isize, rest_stack: &[(usize, Mode, Doc)], next: &[Doc]) -> bool {
    let mut local: Vec<(Mode, Doc)> = next.iter().rev().map(|d| (Mode::Flat, d.clone())).collect();
    let mut rest_idx = rest_stack.len();
    let mut has_pending_space = false;

    loop {
        if remaining < 0 {
            return false;
        }
        let (mode, d) = match local.pop() {
            Some(x) => x,
            None => {
                if rest_idx == 0 {
                    return true;
                }
                rest_idx -= 1;
                let (_, m, dd) = &rest_stack[rest_idx];
                (*m, dd.clone())
            }
        };
        match d {
            Doc::Text(s) => {
                if !s.is_empty() {
                    if has_pending_space {
                        remaining -= 1;
                        has_pending_space = false;
                    }
                    remaining -= s.width() as isize;
                }
            }
            Doc::Concat(ps)
            | Doc::Indent(ps)
            | Doc::Dedent(ps)
            | Doc::Group(ps)
            | Doc::Fill(ps) => {
                for p in ps.into_iter().rev() {
                    local.push((mode, p));
                }
            }
            Doc::ForcedGroup(ps) => {
                // A forced-break group: its contents render in break mode, so its
                // first line break ends the (successful) measurement.
                for p in ps.into_iter().rev() {
                    local.push((Mode::Break, p));
                }
            }
            Doc::Line => {
                if mode == Mode::Break {
                    return true;
                }
                has_pending_space = true;
            }
            Doc::Softline => {
                if mode == Mode::Break {
                    return true;
                }
            }
            Doc::Hardline | Doc::Literalline => {
                return true;
            }
            // A break-parent surviving to `fits` means the enclosing group
            // cannot render flat.
            Doc::BreakParent => {
                return false;
            }
        }
    }
}

fn trim_trailing_blanks(out: &mut String) {
    let trimmed = out.trim_end_matches([' ', '\t']).len();
    out.truncate(trimmed);
}

/// Prettier's `propagateBreaks`: any group that (transitively) contains a
/// [`Doc::BreakParent`] or a hard break ([`Doc::Hardline`] / [`Doc::Literalline`])
/// is forced to break, and that break propagates up through every enclosing
/// group. Run once on a Doc tree before [`print`] so groups that must break are
/// converted to [`Doc::ForcedGroup`] (and never measured with `fits`).
#[allow(dead_code)] // consumed by the child-layout port (see Doc enum note)
pub(crate) fn propagate_breaks(doc: Doc) -> Doc {
    fn go(doc: Doc) -> (Doc, bool) {
        fn map_children(ps: Vec<Doc>) -> (Vec<Doc>, bool) {
            let mut forces = false;
            let out = ps
                .into_iter()
                .map(|p| {
                    let (np, f) = go(p);
                    forces |= f;
                    np
                })
                .collect();
            (out, forces)
        }
        match doc {
            Doc::Text(_) | Doc::Line | Doc::Softline => (doc, false),
            Doc::Hardline | Doc::Literalline | Doc::BreakParent => (doc, true),
            Doc::Concat(ps) => {
                let (ps, f) = map_children(ps);
                (Doc::Concat(ps), f)
            }
            Doc::Indent(ps) => {
                let (ps, f) = map_children(ps);
                (Doc::Indent(ps), f)
            }
            Doc::Dedent(ps) => {
                let (ps, f) = map_children(ps);
                (Doc::Dedent(ps), f)
            }
            Doc::Fill(ps) => {
                let (ps, f) = map_children(ps);
                (Doc::Fill(ps), f)
            }
            Doc::Group(ps) => {
                let (ps, f) = map_children(ps);
                // A broken group still forces its own ancestors to break.
                if f {
                    (Doc::ForcedGroup(ps), true)
                } else {
                    (Doc::Group(ps), false)
                }
            }
            Doc::ForcedGroup(ps) => {
                let (ps, _) = map_children(ps);
                (Doc::ForcedGroup(ps), true)
            }
        }
    }
    go(doc).0
}

#[cfg(test)]
mod tests {
    use super::*;

    fn p(doc: Doc, width: usize) -> String {
        print(doc, width, "  ", 0, 0)
    }

    #[test]
    fn dedent_pulls_back_one_level() {
        // Indent two levels, then Dedent one, on a broken group.
        let doc = Doc::ForcedGroup(vec![Doc::Indent(vec![
            Doc::Hardline,
            Doc::Text("a".into()),
            Doc::Dedent(vec![Doc::Hardline, Doc::Text("b".into())]),
        ])]);
        assert_eq!(p(doc, 80), "\n  a\nb");
    }

    #[test]
    fn literalline_emits_raw_newline_no_indent() {
        let doc = Doc::Indent(vec![Doc::Concat(vec![
            Doc::Text("a".into()),
            Doc::Literalline,
            Doc::Text("b".into()),
        ])]);
        // Even nested under Indent, literalline adds no indentation.
        assert_eq!(p(doc, 80), "a\nb");
    }

    #[test]
    fn break_parent_forces_enclosing_group_to_break() {
        // A group that would fit flat, but contains BreakParent → must break.
        let doc = propagate_breaks(Doc::Group(vec![
            Doc::Text("<a>".into()),
            Doc::Indent(vec![Doc::Softline, Doc::Text("x".into()), Doc::BreakParent]),
            Doc::Softline,
            Doc::Text("</a>".into()),
        ]));
        assert_eq!(p(doc, 80), "<a>\n  x\n</a>");
    }

    #[test]
    fn group_without_break_stays_flat() {
        let doc = propagate_breaks(Doc::Group(vec![
            Doc::Text("<a>".into()),
            Doc::Indent(vec![Doc::Softline, Doc::Text("x".into())]),
            Doc::Softline,
            Doc::Text("</a>".into()),
        ]));
        assert_eq!(p(doc, 80), "<a>x</a>");
    }

    #[test]
    fn hardline_propagates_break_to_all_ancestor_groups() {
        let doc = propagate_breaks(Doc::Group(vec![
            Doc::Text("o(".into()),
            Doc::Group(vec![
                Doc::Text("i".into()),
                Doc::Hardline,
                Doc::Text("j".into()),
            ]),
            Doc::Text(")".into()),
        ]));
        // Inner hardline forces both groups to break (outer can't be flat).
        assert_eq!(p(doc, 80), "o(i\nj)");
    }
}
