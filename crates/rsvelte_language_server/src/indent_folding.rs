//! Indentation-based folding, for text no template AST covers.
//!
//! A port of the official language server's
//! `lib/foldingRange/indentFolding.ts`, which it uses for `<script>` and
//! `<style>` bodies and for documents its parser could not read. The line
//! numbers come out of the shared [`LineIndex`], so they agree with every other
//! position this server sends.

use crate::text::{LineIndex, source_offset};

/// An inclusive, 0-based range of lines.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct LineRange {
    pub start_line: u32,
    pub end_line: u32,
}

struct Indent {
    tabs: u32,
    spaces: u32,
    line: u32,
}

/// The folds implied by the indentation of `ranges`, or of the whole document
/// when no range is given.
#[must_use]
pub fn indent_folding(text: &str, index: &LineIndex, ranges: &[LineRange]) -> Vec<LineRange> {
    let indents: Vec<Indent> = (0..index.line_count())
        .filter_map(|line| collect_indent(index.line_text(text, line), source_offset(line)))
        .collect();
    let tabs: u32 = indents.iter().map(|indent| indent.tabs).sum();
    let spaces: u32 = indents.iter().map(|indent| indent.spaces).sum();
    let tab_size = if tabs > 0 && spaces > 0 {
        guess_tab_size(&indents)
    } else {
        4
    };

    let whole = [LineRange {
        start_line: 0,
        end_line: source_offset(index.line_count().saturating_sub(1)),
    }];
    let ranges = if ranges.is_empty() {
        &whole[..]
    } else {
        ranges
    };

    let mut folds: Vec<LineRange> = Vec::new();
    // Indent level -> the fold opened at it, as an index into `folds`.
    let mut unfinished: Vec<(u32, usize)> = Vec::new();
    let mut current: Option<u32> = None;
    let mut remaining = ranges.iter();
    let Some(mut range) = remaining.next().copied() else {
        return folds;
    };

    for indent in &indents {
        if indent.line < range.start_line {
            continue;
        }
        if indent.line > range.end_line {
            for &(_, fold) in &unfinished {
                folds[fold].end_line = range.end_line;
            }
            match remaining.next() {
                Some(&next) => range = next,
                None => break,
            }
        }

        let level = indent.tabs * tab_size + indent.spaces;
        let level_before = *current.get_or_insert(level);

        if level > level_before {
            folds.push(LineRange {
                start_line: indent.line.saturating_sub(1),
                end_line: indent.line,
            });
            unfinished.push((level_before, folds.len() - 1));
            current = Some(level);
        } else if level < level_before {
            if let Some(at) = unfinished.iter().rposition(|&(open, _)| open == level) {
                let (_, fold) = unfinished.remove(at);
                folds[fold].end_line = folds[fold].end_line.max(indent.line.saturating_sub(1));
            }
            current = Some(level);
        }
    }

    folds
}

/// The indentation of a line, or `None` when the line holds only whitespace.
fn collect_indent(line: &str, index: u32) -> Option<Indent> {
    let mut tabs = 0;
    let mut spaces = 0;
    for byte in line.bytes() {
        match byte {
            b'\t' => tabs += 1,
            b' ' => spaces += 1,
            _ => {
                return Some(Indent {
                    tabs,
                    spaces,
                    line: index,
                });
            }
        }
    }
    None
}

/// A simplified port of VS Code's indentation guesser: the width most often
/// explaining the difference between one line's indentation and the previous
/// line's wins, with a tie going to the width used more.
fn guess_tab_size(lines: &[Indent]) -> u32 {
    const CANDIDATES: [u32; 7] = [2, 4, 6, 8, 3, 5, 7];
    const MAX_GUESS: u32 = 8;

    if lines.len() == 1 {
        return 4;
    }
    let mut counts = [0u32; CANDIDATES.len()];
    for (index, line) in lines.iter().enumerate() {
        let (previous_spaces, previous_tabs) = match index.checked_sub(1) {
            Some(previous) => (lines[previous].spaces, lines[previous].tabs),
            None => (0, 0),
        };
        let space_diff = line.spaces.abs_diff(previous_spaces);
        let tab_diff = line.tabs.abs_diff(previous_tabs);
        let diff = if tab_diff == 0 {
            space_diff
        } else if space_diff % tab_diff == 0 {
            space_diff / tab_diff
        } else {
            0
        };
        if diff == 0 || diff > MAX_GUESS {
            continue;
        }
        if let Some(at) = CANDIDATES.iter().position(|&guess| guess == diff) {
            counts[at] += 1;
        }
    }

    let mut max = 0;
    let mut guessed = None;
    for (at, &count) in counts.iter().enumerate() {
        max = max.max(count);
        if max == count && count > 0 {
            guessed = Some(CANDIDATES[at]);
        }
    }

    let four = counts[CANDIDATES.iter().position(|&g| g == 4).unwrap()];
    let two = counts[CANDIDATES.iter().position(|&g| g == 2).unwrap()];
    if guessed == Some(4) && four > 0 && two > 0 && two * 2 >= four {
        guessed = Some(2);
    }
    guessed.unwrap_or(4)
}

/// The lines strictly inside a `<script>` / `<style>` body spanning
/// `start..end`, which is what upstream's `indentBasedFoldingRangeForTag`
/// folds.
#[must_use]
pub fn body_lines(index: &LineIndex, text: &str, start: usize, end: usize) -> Option<LineRange> {
    let first = index.position(text, start).line;
    let last = index.position(text, end).line;
    let range = LineRange {
        start_line: first + 1,
        end_line: last.checked_sub(1)?,
    };
    (range.start_line < range.end_line).then_some(range)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn folds(text: &str) -> Vec<(u32, u32)> {
        let index = LineIndex::new(text);
        indent_folding(text, &index, &[])
            .into_iter()
            .map(|range| (range.start_line, range.end_line))
            .collect()
    }

    #[test]
    fn a_nested_block_folds_from_its_opening_line() {
        let text = "function a() {\n  b();\n}\n";
        assert_eq!(folds(text), vec![(0, 1)]);
    }

    #[test]
    fn siblings_and_nesting() {
        let text = "a\n  b\n    c\n  d\ne\n";
        assert_eq!(folds(text), vec![(0, 3), (1, 2)]);
    }

    #[test]
    fn blank_lines_do_not_close_a_fold() {
        let text = "a\n  b\n\n  c\nd\n";
        assert_eq!(folds(text), vec![(0, 3)]);
    }

    #[test]
    fn an_unclosed_fold_keeps_the_line_it_opened_on() {
        let text = "a\n  b\n";
        assert_eq!(folds(text), vec![(0, 1)]);
    }

    #[test]
    fn flat_text_folds_nothing() {
        assert_eq!(folds("a\nb\nc\n"), Vec::new());
        assert_eq!(folds(""), Vec::new());
    }

    #[test]
    fn tabs_and_spaces_mix() {
        let text = "a\n\tb\n\t\tc\n";
        assert_eq!(folds(text), vec![(0, 1), (1, 2)]);
    }

    #[test]
    fn the_tab_size_is_guessed_from_the_differences() {
        let two = [
            Indent {
                tabs: 0,
                spaces: 0,
                line: 0,
            },
            Indent {
                tabs: 0,
                spaces: 2,
                line: 1,
            },
            Indent {
                tabs: 0,
                spaces: 4,
                line: 2,
            },
        ];
        assert_eq!(guess_tab_size(&two), 2);
        let four = [
            Indent {
                tabs: 0,
                spaces: 0,
                line: 0,
            },
            Indent {
                tabs: 0,
                spaces: 4,
                line: 1,
            },
            Indent {
                tabs: 0,
                spaces: 8,
                line: 2,
            },
        ];
        assert_eq!(guess_tab_size(&four), 4);
    }

    #[test]
    fn a_single_line_guesses_four() {
        assert_eq!(
            guess_tab_size(&[Indent {
                tabs: 0,
                spaces: 2,
                line: 0
            }]),
            4
        );
    }

    #[test]
    fn a_given_range_bounds_the_folds() {
        let text = "a\n  b\nc\n  d\n";
        let index = LineIndex::new(text);
        let ranges = [LineRange {
            start_line: 2,
            end_line: 3,
        }];
        assert_eq!(
            indent_folding(text, &index, &ranges),
            vec![LineRange {
                start_line: 2,
                end_line: 3
            }]
        );
    }

    #[test]
    fn body_lines_skip_the_tag_lines() {
        let text = "<script>\n  a\n  b\n</script>";
        let index = LineIndex::new(text);
        let body = body_lines(&index, text, 8, text.len() - 9);
        assert_eq!(
            body,
            Some(LineRange {
                start_line: 1,
                end_line: 2
            })
        );
    }

    #[test]
    fn a_one_line_body_has_no_lines_to_fold() {
        let text = "<script>a</script>";
        let index = LineIndex::new(text);
        assert_eq!(body_lines(&index, text, 8, 9), None);
    }
}
