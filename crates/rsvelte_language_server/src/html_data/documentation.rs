//! `generateDocumentation` (`languageFacts/dataProvider.js:197-235`) and the
//! baseline helpers it calls, over the vendored web data.

use std::fmt::Write as _;

use super::web::{
    BASELINE_HIGH_IMAGE, BASELINE_LIMITED_IMAGE, BASELINE_LOW_IMAGE, Baseline, Reference, Status,
};

/// The fields `generateDocumentation` reads, whatever kind of entry carries
/// them — upstream passes tags, attributes and values through one function.
pub struct Entry<'a> {
    pub description: Option<&'a str>,
    pub status: Option<&'a Status>,
    pub browsers: &'a [&'a str],
    pub references: &'a [Reference],
}

#[must_use]
pub fn documentation(entry: &Entry, markdown: bool) -> Option<String> {
    let mut value = String::new();
    if let Some(description) = entry.description {
        value.push_str(description);
    }
    if let Some(status) = entry.status {
        if !value.is_empty() {
            value.push_str("\n\n");
        }
        let baseline = baseline_status(status, entry.browsers);
        if markdown {
            let _ = write!(value, "![Baseline icon]({}) _{baseline}_", image(status));
        } else {
            value.push_str(&baseline);
        }
    }
    if !entry.references.is_empty() {
        if !value.is_empty() {
            value.push_str("\n\n");
        }
        let separator = if markdown { " | " } else { "\n" };
        let rendered = entry
            .references
            .iter()
            .map(|reference| {
                if markdown {
                    format!("[{}]({})", reference.name, reference.url)
                } else {
                    format!("{}: {}", reference.name, reference.url)
                }
            })
            .collect::<Vec<_>>()
            .join(separator);
        value.push_str(&rendered);
    }
    (!value.is_empty()).then_some(value)
}

fn image(status: &Status) -> &'static str {
    match status.baseline {
        Baseline::Low => BASELINE_LOW_IMAGE,
        Baseline::High => BASELINE_HIGH_IMAGE,
        Baseline::Limited => BASELINE_LIMITED_IMAGE,
    }
}

fn baseline_status(status: &Status, browsers: &[&str]) -> String {
    if matches!(status.baseline, Baseline::Limited) {
        let missing = missing_baseline_browsers(browsers);
        let mut text = "Limited availability across major browsers".to_string();
        if !missing.is_empty() {
            let _ = write!(text, " (Not fully implemented in {missing})");
        }
        return text;
    }
    let year = status
        .low_date
        .and_then(|date| date.split('-').next())
        // `${undefined}` is what upstream prints when the date is absent.
        .unwrap_or("undefined");
    let availability = if matches!(status.baseline, Baseline::Low) {
        "Newly"
    } else {
        "Widely"
    };
    format!("{availability} available across major browsers (Baseline since {year})")
}

/// `browserNames` in source order — the reduce below reads it as an insertion
/// ordered map, so the order decides which platform suffix survives.
const BROWSER_NAMES: &[(&str, &str, &str)] = &[
    ("C", "Chrome", "desktop"),
    ("CA", "Chrome", "Android"),
    ("E", "Edge", "desktop"),
    ("FF", "Firefox", "desktop"),
    ("FFA", "Firefox", "Android"),
    ("S", "Safari", "macOS"),
    ("SM", "Safari", "iOS"),
];

/// The alternation order of `shortCompatPattern`. `exec` takes the leftmost
/// match, so the position wins before the alternation does.
const COMPAT_ALTERNATIVES: &[&str] = &["E", "FFA", "FF", "SM", "S", "CA", "C", "IE", "O"];

fn compat_browser(short: &str) -> Option<&'static str> {
    (0..short.len()).find_map(|start| {
        COMPAT_ALTERNATIVES
            .iter()
            .find(|alternative| short[start..].starts_with(**alternative))
            .copied()
    })
}

fn missing_baseline_browsers(browsers: &[&str]) -> String {
    let mut missing: Vec<(&str, &str, &str)> = BROWSER_NAMES.to_vec();
    for short in browsers {
        if let Some(id) = compat_browser(short) {
            missing.retain(|(candidate, _, _)| *candidate != id);
        }
    }
    let mut names: Vec<(&str, String)> = Vec::new();
    for (id, name, platform) in missing {
        // A name already claimed, or Edge, loses its platform suffix.
        let label = if names.iter().any(|(key, _)| *key == name) || id == "E" {
            name.to_string()
        } else {
            format!("{name} on {platform}")
        };
        match names.iter_mut().find(|(key, _)| *key == name) {
            Some(entry) => entry.1 = label,
            None => names.push((name, label)),
        }
    }
    list_disjunction(
        &names
            .into_iter()
            .map(|(_, label)| label)
            .collect::<Vec<_>>(),
    )
}

/// `Intl.ListFormat("en", { style: "long", type: "disjunction" })`.
fn list_disjunction(items: &[String]) -> String {
    match items {
        [] => String::new(),
        [only] => only.clone(),
        [first, second] => format!("{first} or {second}"),
        [head @ .., last] => format!("{}, or {last}", head.join(", ")),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const REFERENCE: &[Reference] = &[Reference {
        name: "MDN Reference",
        url: "https://developer.mozilla.org/x",
    }];

    fn high() -> Status {
        Status {
            baseline: Baseline::High,
            low_date: Some("2015-07-29"),
            high_date: Some("2018-01-29"),
        }
    }

    #[test]
    fn a_widely_available_entry_reads_the_year_out_of_the_low_date() {
        let status = high();
        let entry = Entry {
            description: Some("Prose."),
            status: Some(&status),
            browsers: &[],
            references: REFERENCE,
        };
        assert_eq!(
            documentation(&entry, false).unwrap(),
            "Prose.\n\nWidely available across major browsers (Baseline since 2015)\n\nMDN Reference: https://developer.mozilla.org/x"
        );
        let markdown = documentation(&entry, true).unwrap();
        assert!(markdown.contains("![Baseline icon](data:image/svg+xml;base64,"));
        assert!(markdown.ends_with("_\n\n[MDN Reference](https://developer.mozilla.org/x)"));
    }

    #[test]
    fn an_entry_with_nothing_to_say_has_no_documentation() {
        let entry = Entry {
            description: None,
            status: None,
            browsers: &[],
            references: &[],
        };
        assert!(documentation(&entry, true).is_none());
    }

    /// The reduce keys on the browser NAME, so a browser missing on both of its
    /// platforms is listed once without a platform.
    #[test]
    fn missing_browsers_collapse_by_name_and_edge_never_carries_a_platform() {
        assert_eq!(
            missing_baseline_browsers(&["C1", "CA18", "FF1", "FFA4", "S1", "SM1"]),
            "Edge"
        );
        assert_eq!(
            missing_baseline_browsers(&["C1", "CA18", "E12"]),
            "Firefox or Safari"
        );
        assert_eq!(
            missing_baseline_browsers(&["C1", "CA18", "E12", "FF1", "FFA4", "S1"]),
            "Safari on iOS"
        );
        assert_eq!(
            missing_baseline_browsers(&["C1", "CA18", "E12", "FF1", "FFA4"]),
            "Safari"
        );
    }

    /// `IE` matches at index 0, so it wins over the `E` one character later
    /// even though the alternation lists `E` first — and `IE` is not a browser
    /// the map holds, so nothing is deleted.
    #[test]
    fn a_short_compat_string_is_read_the_way_the_pattern_scans_it() {
        assert_eq!(compat_browser("SM1"), Some("SM"));
        assert_eq!(compat_browser("CA18"), Some("CA"));
        assert_eq!(compat_browser("FFA4"), Some("FFA"));
        assert_eq!(compat_browser("IE11"), Some("IE"));
        assert_eq!(compat_browser("X1"), None);
    }
}
