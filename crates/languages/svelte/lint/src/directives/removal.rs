//! The fixes `ESLint`'s `processUnusedDirectives` attaches to its reports of unused disable
//! directives.

/// `createIndividualDirectivesRemoval`: the range of `list`, a directive's rule names, to delete
/// so that `rule` goes and the rest keep their formatting. `ESLint` matches
/// `(?:^|\s*,\s*)(['"]?)rule\1(?:\s*,\s*|$)` and keeps one comma of a name in the middle.
pub(super) fn rule_removal(list: &str, rule: &str) -> Option<(usize, usize)> {
    let bytes = list.as_bytes();
    let spaces = |mut i: usize| {
        while let Some(c) = list[i..].chars().next().filter(|c| c.is_whitespace()) {
            i += c.len_utf8();
        }
        i
    };
    // `\s*,\s*` from `i`, greedy: names do not start with whitespace.
    let separator = |i: usize| {
        let at = spaces(i);
        (bytes.get(at) == Some(&b',')).then(|| spaces(at + 1))
    };
    let name_end = |start: usize| {
        let quoted = (bytes.get(start).copied())
            .filter(|q| matches!(q, b'"' | b'\''))
            .and_then(|q| {
                let end = start + 1 + rule.len();
                (list[start + 1..].starts_with(rule) && bytes.get(end) == Some(&q))
                    .then_some(end + 1)
            });
        quoted.or_else(|| {
            list[start..]
                .starts_with(rule)
                .then_some(start + rule.len())
        })
    };
    for begin in (0..=list.len()).filter(|&i| list.is_char_boundary(i)) {
        let starts = [(begin == 0).then_some(0), separator(begin)];
        for start in starts.into_iter().flatten() {
            let Some(end) = name_end(start) else {
                continue;
            };
            let Some(end) = separator(end).or_else(|| (end == list.len()).then_some(end)) else {
                continue;
            };
            let matched = &list[begin..end];
            let (first_comma, last_comma) = (matched.find(','), matched.rfind(','));
            return Some(match (first_comma, last_comma) {
                (Some(first), Some(other)) if first != other => (begin + first, begin + other),
                _ => (begin, end),
            });
        }
    }
    None
}

#[cfg(test)]
mod tests;
