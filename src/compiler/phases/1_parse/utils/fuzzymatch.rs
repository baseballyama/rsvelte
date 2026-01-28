//! Fuzzy string matching utilities for the Svelte parser.
//!
//! # Svelte Compiler Correspondence
//!
//! This module corresponds to `svelte/packages/svelte/src/compiler/phases/1-parse/utils/fuzzymatch.js`
//!
//! It provides fuzzy matching capabilities for suggesting "did you mean X?" in error messages.
//! The algorithm uses n-gram based similarity combined with Levenshtein distance.

// Allow dead code for library functions that will be used by the validator
#![allow(dead_code)]

use rustc_hash::FxHashMap;

/// Threshold score for considering a match valid (0.0 - 1.0)
const MATCH_THRESHOLD: f64 = 0.7;

/// Minimum n-gram size
const GRAM_SIZE_LOWER: usize = 2;

/// Maximum n-gram size
const GRAM_SIZE_UPPER: usize = 3;

/// Find the best fuzzy match for a name from a list of candidates.
///
/// Returns the best matching name if the match score is above 0.7, otherwise None.
///
/// # Arguments
/// * `name` - The name to search for
/// * `candidates` - List of candidate names to match against
///
/// # Example
/// ```ignore
/// let result = fuzzymatch("onclik", &["onclick", "onchange", "onmouseover"]);
/// assert_eq!(result, Some("onclick".to_string()));
/// ```
pub fn fuzzymatch(name: &str, candidates: &[&str]) -> Option<String> {
    if candidates.is_empty() {
        return None;
    }

    let fuzzy_set = FuzzySet::new(candidates);
    let matches = fuzzy_set.get(name);

    matches
        .into_iter()
        .find(|(score, _)| *score > MATCH_THRESHOLD)
        .map(|(_, matched)| matched)
}

/// Calculate the edit distance similarity between two strings (0.0 - 1.0).
fn distance(str1: &str, str2: &str) -> f64 {
    if str1.is_empty() && str2.is_empty() {
        return 1.0;
    }
    if str1.is_empty() || str2.is_empty() {
        return 0.0;
    }

    let lev = levenshtein(str1, str2);
    1.0 - (lev as f64) / (str1.len().max(str2.len()) as f64)
}

/// Calculate Levenshtein distance between two strings.
fn levenshtein(str1: &str, str2: &str) -> usize {
    let s1: Vec<char> = str1.chars().collect();
    let s2: Vec<char> = str2.chars().collect();
    let m = s1.len();
    let n = s2.len();

    let mut current = vec![0; m + 1];

    // Initialize first row
    for (i, val) in current.iter_mut().enumerate().take(m + 1) {
        *val = i;
    }

    for i in 1..=n {
        let mut prev = current[0];
        current[0] = i;

        for j in 1..=m {
            let temp = current[j];
            if s1[j - 1] == s2[i - 1] {
                current[j] = prev;
            } else {
                current[j] = 1 + prev.min(current[j]).min(current[j - 1]);
            }
            prev = temp;
        }
    }

    current[m]
}

/// Generate n-grams from a string.
///
/// Corresponds to `iterate_grams` in fuzzymatch.js.
/// Note: The JavaScript implementation has a bug where it tries to pad `value`
/// instead of `simplified`, so padding doesn't actually work. We replicate this
/// exact behavior for compatibility.
fn iterate_grams(value: &str, gram_size: usize) -> Vec<String> {
    // JavaScript: const simplified = '-' + value.toLowerCase().replace(non_word_regex, '') + '-';
    // where non_word_regex = /[^\w, ]+/
    // \w in JavaScript is [a-zA-Z0-9_]
    let simplified: String = format!(
        "-{}-",
        value
            .to_lowercase()
            .chars()
            .filter(|c| c.is_alphanumeric() || *c == '_' || *c == ' ' || *c == ',')
            .collect::<String>()
    );

    let chars: Vec<char> = simplified.chars().collect();
    let len = chars.len();

    // JavaScript code has a bug where it pads `value` instead of `simplified`:
    // if (len_diff > 0) {
    //   for (let i = 0; i < len_diff; ++i) {
    //     value += '-';  // Bug: should be simplified
    //   }
    // }
    // This means if simplified.length < gram_size, the loop just returns fewer grams.
    // We replicate this exact behavior.

    let mut results = Vec::new();
    if len >= gram_size {
        for i in 0..=len - gram_size {
            results.push(chars[i..i + gram_size].iter().collect());
        }
    }
    // If len < gram_size, return empty vector (matching JavaScript bug behavior)
    results
}

/// Count n-gram occurrences in a string.
fn gram_counter(value: &str, gram_size: usize) -> FxHashMap<String, usize> {
    let grams = iterate_grams(value, gram_size);
    let mut counts = FxHashMap::default();

    for gram in grams {
        *counts.entry(gram).or_insert(0) += 1;
    }

    counts
}

/// A fuzzy matching set for efficient string matching.
struct FuzzySet {
    /// Exact match lookup: normalized -> original
    exact_set: FxHashMap<String, String>,
    /// Match dictionary: gram -> [(index, count)]
    match_dict: FxHashMap<String, Vec<(usize, usize)>>,
    /// Items for each gram size: gram_size -> [(vector_normal, normalized_value)]
    items: FxHashMap<usize, Vec<(f64, String)>>,
}

impl FuzzySet {
    /// Create a new FuzzySet from a list of strings.
    fn new(arr: &[&str]) -> Self {
        let mut set = FuzzySet {
            exact_set: FxHashMap::default(),
            match_dict: FxHashMap::default(),
            items: FxHashMap::default(),
        };

        // Initialize items for each gram size
        for gram_size in GRAM_SIZE_LOWER..=GRAM_SIZE_UPPER {
            set.items.insert(gram_size, Vec::new());
        }

        // Add all items
        for value in arr {
            set.add(value);
        }

        set
    }

    /// Add a value to the set.
    fn add(&mut self, value: &str) {
        let normalized = value.to_lowercase();
        if self.exact_set.contains_key(&normalized) {
            return;
        }

        for gram_size in GRAM_SIZE_LOWER..=GRAM_SIZE_UPPER {
            self.add_with_gram_size(value, gram_size);
        }
    }

    /// Add a value with a specific gram size.
    fn add_with_gram_size(&mut self, value: &str, gram_size: usize) {
        let normalized = value.to_lowercase();
        let items = self.items.entry(gram_size).or_default();
        let index = items.len();

        let gram_counts = gram_counter(&normalized, gram_size);
        let sum_of_squares: usize = gram_counts.values().map(|&c| c * c).sum();

        for (gram, count) in &gram_counts {
            self.match_dict
                .entry(gram.clone())
                .or_default()
                .push((index, *count));
        }

        let vector_normal = (sum_of_squares as f64).sqrt();
        items.push((vector_normal, normalized.clone()));
        self.exact_set.insert(normalized, value.to_string());
    }

    /// Get the best matches for a value.
    fn get(&self, value: &str) -> Vec<(f64, String)> {
        let normalized = value.to_lowercase();

        // Check for exact match first
        if let Some(exact) = self.exact_set.get(&normalized) {
            return vec![(1.0, exact.clone())];
        }

        // Try each gram size from largest to smallest
        for gram_size in (GRAM_SIZE_LOWER..=GRAM_SIZE_UPPER).rev() {
            let results = self.get_with_gram_size(value, gram_size);
            if !results.is_empty() {
                return results;
            }
        }

        Vec::new()
    }

    /// Get matches using a specific gram size.
    fn get_with_gram_size(&self, value: &str, gram_size: usize) -> Vec<(f64, String)> {
        let normalized = value.to_lowercase();
        let gram_counts = gram_counter(&normalized, gram_size);
        let items = match self.items.get(&gram_size) {
            Some(items) => items,
            None => return Vec::new(),
        };

        // Calculate match scores using cosine similarity
        let mut matches: FxHashMap<usize, usize> = FxHashMap::default();
        let sum_of_squares: usize = gram_counts.values().map(|&c| c * c).sum();

        for (gram, count) in &gram_counts {
            if let Some(dict_matches) = self.match_dict.get(gram) {
                for &(index, other_count) in dict_matches {
                    *matches.entry(index).or_insert(0) += count * other_count;
                }
            }
        }

        let vector_normal = (sum_of_squares as f64).sqrt();

        // Build results list
        let mut results: Vec<(f64, String)> = Vec::new();
        for (&index, &match_score) in &matches {
            if let Some((item_normal, item_value)) = items.get(index)
                && *item_normal > 0.0
                && vector_normal > 0.0
            {
                let score = (match_score as f64) / (vector_normal * item_normal);
                results.push((score, item_value.clone()));
            }
        }

        // Sort by score descending
        results.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));

        // Truncate to 50 results and refine with Levenshtein distance
        let end_index = results.len().min(50);
        let mut refined: Vec<(f64, String)> = results[..end_index]
            .iter()
            .map(|(_, matched)| {
                let dist_score = distance(matched, &normalized);
                (dist_score, matched.clone())
            })
            .collect();

        // Sort again by Levenshtein-based score
        refined.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));

        // Keep only the best matches (those with the same score as the best)
        if let Some((best_score, _)) = refined.first() {
            let best_score = *best_score;
            refined
                .into_iter()
                .filter(|(score, _)| (*score - best_score).abs() < f64::EPSILON)
                .map(|(score, normalized_value)| {
                    // Return the original (non-normalized) value
                    let original = self
                        .exact_set
                        .get(&normalized_value)
                        .cloned()
                        .unwrap_or(normalized_value);
                    (score, original)
                })
                .collect()
        } else {
            Vec::new()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_levenshtein() {
        assert_eq!(levenshtein("", ""), 0);
        assert_eq!(levenshtein("a", "a"), 0);
        assert_eq!(levenshtein("a", "b"), 1);
        assert_eq!(levenshtein("abc", "abc"), 0);
        assert_eq!(levenshtein("abc", "abd"), 1);
        assert_eq!(levenshtein("kitten", "sitting"), 3);
    }

    #[test]
    fn test_distance() {
        assert!((distance("abc", "abc") - 1.0).abs() < f64::EPSILON);
        assert!(distance("abc", "abd") > 0.5);
        assert!(distance("abc", "xyz") < 0.5);
    }

    #[test]
    fn test_iterate_grams() {
        let grams = iterate_grams("hello", 2);
        assert!(grams.contains(&"-h".to_string()));
        assert!(grams.contains(&"he".to_string()));
        assert!(grams.contains(&"el".to_string()));
        assert!(grams.contains(&"ll".to_string()));
        assert!(grams.contains(&"lo".to_string()));
        assert!(grams.contains(&"o-".to_string()));
    }

    #[test]
    fn test_fuzzymatch_exact() {
        let result = fuzzymatch("onclick", &["onclick", "onchange", "onmouseover"]);
        assert_eq!(result, Some("onclick".to_string()));
    }

    #[test]
    fn test_fuzzymatch_typo() {
        let result = fuzzymatch("onclik", &["onclick", "onchange", "onmouseover"]);
        assert_eq!(result, Some("onclick".to_string()));
    }

    #[test]
    fn test_fuzzymatch_no_match() {
        let result = fuzzymatch("xyz", &["onclick", "onchange", "onmouseover"]);
        assert_eq!(result, None);
    }

    #[test]
    fn test_fuzzymatch_empty_candidates() {
        let result = fuzzymatch("onclick", &[]);
        assert_eq!(result, None);
    }

    #[test]
    fn test_fuzzymatch_case_insensitive() {
        let result = fuzzymatch("ONCLICK", &["onclick", "onchange", "onmouseover"]);
        assert_eq!(result, Some("onclick".to_string()));
    }

    #[test]
    fn test_fuzzymatch_similar_words() {
        // Test with longer words that have better n-gram overlap
        let directives = &["transition", "animate", "action", "bind", "class", "style"];
        assert_eq!(
            fuzzymatch("trnsition", directives),
            Some("transition".to_string())
        );
        assert_eq!(
            fuzzymatch("animte", directives),
            Some("animate".to_string())
        );
    }

    #[test]
    fn test_fuzzymatch_attribute_names() {
        // Test with event handlers (more realistic Svelte use case)
        let events = &[
            "onclick",
            "onchange",
            "onmouseover",
            "onmouseout",
            "onkeydown",
            "onkeyup",
        ];
        assert_eq!(fuzzymatch("onlcick", events), Some("onclick".to_string()));
        assert_eq!(fuzzymatch("onchagne", events), Some("onchange".to_string()));
    }
}
