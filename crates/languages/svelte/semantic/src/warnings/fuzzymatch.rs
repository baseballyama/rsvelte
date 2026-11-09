//! Svelte's `fuzzymatch`: the closest of a list of names, by trigram then bigram cosine
//! similarity and then edit distance, when it is close enough.

use rustc_hash::FxHashMap;

/// The best match of `name` among `names` scoring above 0.7, the first on a tie.
pub(super) fn fuzzymatch<'a>(name: &str, names: &[&'a str]) -> Option<&'a str> {
    let wanted = name.to_lowercase();
    if let Some(exact) = names.iter().find(|n| n.to_lowercase() == wanted) {
        return Some(exact);
    }
    for size in [3, 2] {
        let matches = scored(&wanted, names, size);
        if let Some(&(score, best)) = matches.first() {
            return (score > 0.7).then_some(best);
        }
    }
    None
}

/// `FuzzySet.__get`: every name sharing a gram, by cosine similarity, its best 50 re-scored by
/// edit distance, the best of those.
fn scored<'a>(wanted: &str, names: &[&'a str], size: usize) -> Vec<(f64, &'a str)> {
    let counts = grams(wanted, size);
    let norm = (counts.values().map(|c| c * c).sum::<f64>()).sqrt();
    let mut seen: Vec<String> = Vec::with_capacity(names.len());
    let mut results: Vec<(f64, &str)> = Vec::new();
    for &name in names {
        let lower = name.to_lowercase();
        // `add` skips a name already in the set.
        if seen.contains(&lower) {
            continue;
        }
        let theirs = grams(&lower, size);
        seen.push(lower);
        let dot: f64 = counts
            .iter()
            .filter_map(|(gram, count)| theirs.get(gram).map(|other| count * other))
            .sum();
        if dot > 0.0 {
            let other = (theirs.values().map(|c| c * c).sum::<f64>()).sqrt();
            results.push((dot / (norm * other), name));
        }
    }
    // JavaScript's sort is stable, as is this one.
    results.sort_by(|a, b| b.0.total_cmp(&a.0));
    results.truncate(50);
    let mut rescored: Vec<(f64, &str)> = results
        .into_iter()
        .map(|(_, name)| (distance(&name.to_lowercase(), wanted), name))
        .collect();
    rescored.sort_by(|a, b| b.0.total_cmp(&a.0));
    let best = rescored.first().map(|(score, _)| *score);
    rescored.retain(|(score, _)| Some(*score) == best);
    rescored
}

/// `iterate_grams` counted: the grams of `-value-` with characters other than word characters,
/// `,` and space removed from the first run of them.
fn grams(value: &str, size: usize) -> FxHashMap<String, f64> {
    let mut simplified = String::from("-");
    let mut removed = false;
    let mut removing = false;
    for c in value.chars() {
        let word = c.is_ascii_alphanumeric() || c == '_' || c == ',' || c == ' ';
        if !word && !removed {
            removing = true;
            continue;
        }
        if removing {
            removed = true;
            removing = false;
        }
        simplified.push(c);
    }
    simplified.push('-');
    let units: Vec<u16> = simplified.encode_utf16().collect();
    let mut out: FxHashMap<String, f64> = FxHashMap::default();
    for window in units.windows(size) {
        *out.entry(String::from_utf16_lossy(window)).or_default() += 1.0;
    }
    out
}

/// `1 - levenshtein / max length`, over UTF-16 code units.
#[expect(
    clippy::cast_precision_loss,
    reason = "upstream divides JavaScript numbers, and a code is far shorter than 2^52"
)]
fn distance(a: &str, b: &str) -> f64 {
    let a: Vec<u16> = a.encode_utf16().collect();
    let b: Vec<u16> = b.encode_utf16().collect();
    let mut previous: Vec<usize> = (0..=a.len()).collect();
    for (i, cb) in b.iter().enumerate() {
        let mut current = vec![i + 1; a.len() + 1];
        for (j, ca) in a.iter().enumerate() {
            current[j + 1] = if ca == cb {
                previous[j]
            } else {
                previous[j].min(previous[j + 1]).min(current[j]) + 1
            };
        }
        previous = current;
    }
    let longest = a.len().max(b.len());
    if longest == 0 {
        return 1.0;
    }
    1.0 - previous[a.len()] as f64 / longest as f64
}
