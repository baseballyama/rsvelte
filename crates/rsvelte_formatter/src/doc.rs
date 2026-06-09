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

#[derive(Clone)]
pub(crate) enum Doc {
    Text(String),
    /// flat: a space; break: newline + indent.
    Line,
    /// flat: nothing; break: newline + indent.
    Softline,
    /// always a newline + indent.
    Hardline,
    Group(Vec<Doc>),
    Indent(Vec<Doc>),
    /// Alternating `[content, sep, content, sep, …]` greedily packed.
    Fill(Vec<Doc>),
    Concat(Vec<Doc>),
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
            Doc::Group(ps) => {
                let flat = fits(width as isize - pos as isize, &cmds, &ps);
                let m = if flat { Mode::Flat } else { Mode::Break };
                for p in ps.into_iter().rev() {
                    cmds.push((ind, m, p));
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
            Doc::Concat(ps) | Doc::Indent(ps) | Doc::Group(ps) | Doc::Fill(ps) => {
                for p in ps.into_iter().rev() {
                    local.push((mode, p));
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
            Doc::Hardline => {
                return true;
            }
        }
    }
}

fn trim_trailing_blanks(out: &mut String) {
    let trimmed = out.trim_end_matches([' ', '\t']).len();
    out.truncate(trimmed);
}
