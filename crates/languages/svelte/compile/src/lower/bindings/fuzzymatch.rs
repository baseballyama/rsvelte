//! Upstream's `fuzzymatch`, a trimmed `fuzzyset.js`: the name a misspelled one most likely means.
//! It counts in UTF-16 units and keeps JavaScript's stable sorts, so its ties break as upstream's.

const GRAM_SIZES: [usize; 2] = [3, 2];

/// The one of `names` that `name` most likely misspells, if it scores above upstream's 0.7.
pub(super) fn fuzzymatch<'n>(name: &str, names: &[&'n str]) -> Option<&'n str> {
    let normalized = name.to_lowercase();
    if let Some(&exact) = names.iter().find(|n| lowered(n).eq(normalized.chars())) {
        return Some(exact);
    }
    let query: Vec<u16> = normalized.encode_utf16().collect();
    // Every name's lowered UTF-16 units in one buffer, and where each one ends.
    let mut units = Vec::new();
    let mut ends = Vec::with_capacity(names.len());
    for n in names {
        for c in lowered(n) {
            units.extend_from_slice(c.encode_utf16(&mut [0; 2]));
        }
        ends.push(units.len());
    }
    let items = Items {
        units: &units,
        ends: &ends,
    };
    let mut scratch = Scratch::default();
    let (score, index) = GRAM_SIZES
        .iter()
        .find_map(|&size| best(&query, items, size, &mut scratch))?;
    (score > 0.7).then(|| names[index])
}

fn lowered(n: &str) -> impl Iterator<Item = char> + '_ {
    n.chars().flat_map(char::to_lowercase)
}

#[derive(Clone, Copy)]
struct Items<'a> {
    units: &'a [u16],
    ends: &'a [usize],
}

impl<'a> Items<'a> {
    fn get(self, index: usize) -> &'a [u16] {
        let start = index.checked_sub(1).map_or(0, |i| self.ends[i]);
        &self.units[start..self.ends[index]]
    }
}

/// The buffers one lookup reuses across its items.
#[derive(Default)]
struct Scratch {
    query: Grams,
    item: Grams,
    matches: Vec<(usize, f64)>,
    scored: Vec<(f64, usize)>,
    row: Vec<usize>,
}

/// Upstream's `__get` for one gram size: the closest item by edit distance among the 50 that
/// share the most grams with `query`.
fn best(query: &[u16], items: Items<'_>, size: usize, s: &mut Scratch) -> Option<(f64, usize)> {
    s.query.fill(query, size);
    let query_normal = s.query.normal();
    s.matches.clear();
    for index in 0..items.ends.len() {
        s.item.fill(items.get(index), size);
        let shared: u32 = (s.query.counts.iter())
            .filter_map(|&(at, count)| Some(count * s.item.count_of(s.query.gram(at))?))
            .sum();
        // Every count is at least one, so a shared gram makes the product positive.
        if shared > 0 {
            let score = f64::from(shared) / (query_normal * s.item.normal());
            s.matches.push((index, score));
        }
    }
    s.matches.sort_by(|a, b| b.1.total_cmp(&a.1));
    s.scored.clear();
    for &(index, _) in s.matches.iter().take(50) {
        s.scored
            .push((distance(items.get(index), query, &mut s.row), index));
    }
    s.scored.sort_by(|a, b| b.0.total_cmp(&a.0));
    s.scored.first().copied()
}

/// Each gram of a value with how often it occurs, in order of first occurrence, as where it
/// starts in `text`.
#[derive(Default)]
struct Grams {
    text: Vec<u16>,
    size: usize,
    counts: Vec<(usize, u32)>,
}

impl Grams {
    fn fill(&mut self, value: &[u16], size: usize) {
        let Self { text, counts, .. } = self;
        self.size = size;
        text.clear();
        text.push(u16::from(b'-'));
        let (start, end) = first_non_word_run(value);
        text.extend_from_slice(&value[..start]);
        text.extend_from_slice(&value[end..]);
        text.push(u16::from(b'-'));
        counts.clear();
        for at in 0..(text.len() + 1).saturating_sub(size) {
            let gram = &text[at..at + size];
            match counts
                .iter_mut()
                .find(|(g, _)| &text[*g..*g + size] == gram)
            {
                Some((_, count)) => *count += 1,
                None => counts.push((at, 1)),
            }
        }
    }

    fn gram(&self, at: usize) -> &[u16] {
        &self.text[at..at + self.size]
    }

    fn count_of(&self, gram: &[u16]) -> Option<u32> {
        (self.counts.iter())
            .find(|&&(at, _)| self.gram(at) == gram)
            .map(|&(_, count)| count)
    }

    fn normal(&self) -> f64 {
        f64::from(self.counts.iter().map(|(_, c)| c * c).sum::<u32>()).sqrt()
    }
}

/// Where upstream's `replace(/[^\w, ]+/, '')` cuts: only the first run.
fn first_non_word_run(value: &[u16]) -> (usize, usize) {
    let word = |&u: &u16| {
        u8::try_from(u).is_ok_and(|b| b.is_ascii_alphanumeric() || matches!(b, b'_' | b',' | b' '))
    };
    let Some(start) = value.iter().position(|u| !word(u)) else {
        return (value.len(), value.len());
    };
    let end = (value[start..].iter())
        .position(word)
        .map_or(value.len(), |n| start + n);
    (start, end)
}

/// Upstream's `_distance`: one minus the edit distance over the longer length.
fn distance(a: &[u16], b: &[u16], row: &mut Vec<usize>) -> f64 {
    let longer = a.len().max(b.len());
    #[expect(
        clippy::cast_precision_loss,
        reason = "names are far shorter than 2^52"
    )]
    let ratio = levenshtein(a, b, row) as f64 / longer as f64;
    1.0 - ratio
}

fn levenshtein(a: &[u16], b: &[u16], row: &mut Vec<usize>) -> usize {
    row.clear();
    row.extend(0..=a.len());
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
