//! Folds by indentation, as the official server folds the text of a `<template>`.

use super::FoldingRange;

/// A line that has more than its indentation.
struct Indented {
    line: u32,
    tabs: u32,
    spaces: u32,
}

/// A fold from each line that the next indented line indents further, to the last line before
/// the indentation comes back, for the lines `first..=last` of `text`.
pub(super) fn folds(text: &str, first: u32, last: u32) -> Vec<FoldingRange> {
    // The server splits at `\n` with an optional `\r` before it, unlike its line count.
    let indented: Vec<Indented> = (text.split('\n').enumerate())
        .filter_map(|(line, text)| {
            let text = text.strip_suffix('\r').unwrap_or(text);
            let indentation = text.len() - text.trim_start_matches(['\t', ' ']).len();
            (indentation < text.len()).then(|| {
                let tabs = text[..indentation].bytes().filter(|&b| b == b'\t').count();
                Indented {
                    line: line as u32,
                    tabs: tabs as u32,
                    spaces: (indentation - tabs) as u32,
                }
            })
        })
        .collect();
    let tabs: u32 = indented.iter().map(|line| line.tabs).sum();
    let spaces: u32 = indented.iter().map(|line| line.spaces).sum();
    let tab_size = if tabs > 0 && spaces > 0 {
        tab_size(&indented)
    } else {
        4
    };
    let mut folds: Vec<FoldingRange> = Vec::new();
    // The fold each indentation opened, by that indentation.
    let mut unfinished: Vec<(u32, usize)> = Vec::new();
    let mut current = None;
    for line in &indented {
        if line.line < first {
            continue;
        }
        if line.line > last {
            for &(_, fold) in &unfinished {
                folds[fold].end_line = last;
            }
            break;
        }
        let indentation = line.tabs * tab_size + line.spaces;
        let current_indentation = *current.get_or_insert(indentation);
        if indentation > current_indentation {
            folds.push(FoldingRange {
                start_line: line.line - 1,
                end_line: line.line,
                kind: None,
            });
            unfinished.retain(|&(at, _)| at != current_indentation);
            unfinished.push((current_indentation, folds.len() - 1));
            current = Some(indentation);
        } else if indentation < current_indentation {
            if let Some(index) = unfinished.iter().position(|&(at, _)| at == indentation) {
                let (_, fold) = unfinished.remove(index);
                folds[fold].end_line = folds[fold].end_line.max(line.line - 1);
            }
            current = Some(indentation);
        }
    }
    folds
}

/// The tab size the indentation suggests: the step between lines that occurs most, preferring 2
/// over 4 where 2 is close.
fn tab_size(lines: &[Indented]) -> u32 {
    const GUESSES: [u32; 7] = [2, 4, 6, 8, 3, 5, 7];
    if lines.len() == 1 {
        return 4;
    }
    // In the order each size was first seen, which breaks ties.
    let mut counts: Vec<(u32, u32)> = Vec::new();
    let mut previous = (0, 0);
    for line in lines {
        let spaces = line.spaces.abs_diff(previous.0);
        let tabs = line.tabs.abs_diff(previous.1);
        previous = (line.spaces, line.tabs);
        let step = match tabs {
            0 => spaces,
            tabs if spaces % tabs == 0 => spaces / tabs,
            _ => 0,
        };
        if step == 0 || step > 8 || !GUESSES.contains(&step) {
            continue;
        }
        match counts.iter_mut().find(|(size, _)| *size == step) {
            Some((_, count)) => *count += 1,
            None => counts.push((step, 1)),
        }
    }
    let mut most = 0;
    let mut size = None;
    for &(guess, count) in &counts {
        most = most.max(count);
        if most == count {
            size = Some(guess);
        }
    }
    let count_of = |guess| {
        counts
            .iter()
            .find(|(size, _)| *size == guess)
            .map_or(0, |c| c.1)
    };
    let (fours, twos) = (count_of(4), count_of(2));
    if size == Some(4) && fours > 0 && twos > 0 && twos * 2 >= fours {
        return 2;
    }
    size.unwrap_or(4)
}
