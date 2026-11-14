//! Upstream's `fuzzymatch`, a trimmed `fuzzyset.js`: the name a misspelled one most likely means.
//! It counts in UTF-16 units and keeps JavaScript's stable sorts, so its ties break as upstream's.

const GRAM_SIZES: [usize; 2] = [3, 2];

/// The one of `names` that `name` most likely misspells, if it scores above upstream's 0.7.
pub(super) fn fuzzymatch<'n>(name: &str, names: &[&'n str]) -> Option<&'n str> {
    let normalized = name.to_lowercase();
    let lowered: Vec<String> = names.iter().map(|n| n.to_lowercase()).collect();
    if let Some(i) = lowered.iter().position(|n| *n == normalized) {
        return Some(names[i]);
    }
    let query: Vec<u16> = normalized.encode_utf16().collect();
    let items: Vec<Vec<u16>> = lowered.iter().map(|n| n.encode_utf16().collect()).collect();
    let (score, index) = GRAM_SIZES
        .iter()
        .find_map(|&size| best(&query, &items, size))?;
    (score > 0.7).then(|| names[index])
}

/// Upstream's `__get` for one gram size: the closest item by edit distance among the 50 that
/// share the most grams with `query`.
fn best(query: &[u16], items: &[Vec<u16>], size: usize) -> Option<(f64, usize)> {
    let grams = counts(query, size);
    let normal = |counts: &[(Vec<u16>, u32)]| {
        f64::from(counts.iter().map(|(_, c)| c * c).sum::<u32>()).sqrt()
    };
    let query_normal = normal(&grams);
    let mut matches: Vec<(usize, f64)> = Vec::new();
    for (index, item) in items.iter().enumerate() {
        let item_grams = counts(item, size);
        let shared: u32 = (grams.iter())
            .filter_map(|(gram, count)| {
                let (_, other) = item_grams.iter().find(|(g, _)| g == gram)?;
                Some(count * other)
            })
            .sum();
        if item_grams
            .iter()
            .any(|(g, _)| grams.iter().any(|(q, _)| q == g))
        {
            matches.push((
                index,
                f64::from(shared) / (query_normal * normal(&item_grams)),
            ));
        }
    }
    matches.sort_by(|a, b| b.1.total_cmp(&a.1));
    let mut scored: Vec<(f64, usize)> = (matches.iter().take(50))
        .map(|&(index, _)| (distance(&items[index], query), index))
        .collect();
    scored.sort_by(|a, b| b.0.total_cmp(&a.0));
    scored.first().copied()
}

/// Each gram of `value` with how often it occurs, in order of first occurrence.
fn counts(value: &[u16], size: usize) -> Vec<(Vec<u16>, u32)> {
    let mut simplified = vec![u16::from(b'-')];
    simplified.extend(strip_first_non_word_run(value));
    simplified.push(u16::from(b'-'));
    let mut counts: Vec<(Vec<u16>, u32)> = Vec::new();
    for gram in simplified.windows(size) {
        match counts.iter_mut().find(|(g, _)| g == gram) {
            Some((_, count)) => *count += 1,
            None => counts.push((gram.to_vec(), 1)),
        }
    }
    counts
}

/// Upstream's `replace(/[^\w, ]+/, '')`, which drops only the first run.
fn strip_first_non_word_run(value: &[u16]) -> Vec<u16> {
    let word = |&u: &u16| {
        u8::try_from(u).is_ok_and(|b| b.is_ascii_alphanumeric() || matches!(b, b'_' | b',' | b' '))
    };
    let Some(start) = value.iter().position(|u| !word(u)) else {
        return value.to_vec();
    };
    let end = (value[start..].iter())
        .position(word)
        .map_or(value.len(), |n| start + n);
    [&value[..start], &value[end..]].concat()
}

/// Upstream's `_distance`: one minus the edit distance over the longer length.
fn distance(a: &[u16], b: &[u16]) -> f64 {
    let longer = a.len().max(b.len());
    #[expect(
        clippy::cast_precision_loss,
        reason = "names are far shorter than 2^52"
    )]
    let ratio = levenshtein(a, b) as f64 / longer as f64;
    1.0 - ratio
}

fn levenshtein(a: &[u16], b: &[u16]) -> usize {
    let mut row: Vec<usize> = (0..=a.len()).collect();
    for (i, &bc) in b.iter().enumerate() {
        let mut diagonal = row[0];
        row[0] = i + 1;
        for (j, &ac) in a.iter().enumerate() {
            let above = row[j + 1];
            row[j + 1] = if ac == bc {
                diagonal
            } else {
                above.min(row[j]).min(diagonal) + 1
            };
            diagonal = above;
        }
    }
    row[a.len()]
}

#[cfg(test)]
mod tests;
