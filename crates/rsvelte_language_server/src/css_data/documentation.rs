//! `getEntryDescription` (`languageFacts/entry.js:82-170`) and the helpers it
//! calls, over the vendored CSS data.

use std::fmt::Write as _;

use super::web::{Baseline, BaselineStatus, Entry, Property, Reference, STATUS_PREFIXES, Value};

/// One browser of `browserNames`, in that object's own order — the reduce that
/// builds the missing-browser list reads it positionally.
const BROWSERS: &[(&str, &str, &str)] = &[
    ("C", "Chrome", "desktop"),
    ("CA", "Chrome", "Android"),
    ("E", "Edge", "desktop"),
    ("FF", "Firefox", "desktop"),
    ("FFA", "Firefox", "Android"),
    ("S", "Safari", "macOS"),
    ("SM", "Safari", "iOS"),
];

/// The alternation of `shortCompatPattern`, whose order decides which id a
/// string like `FFA4` or `IE4` reports.
const COMPAT_IDS: &[&str] = &["E", "FFA", "FF", "SM", "S", "CA", "C", "IE", "O"];

/// The fields `getEntryDescription` reads, whatever kind of entry carries them
/// — upstream passes properties, at-directives, selectors and values through
/// one function.
pub struct Described<'a> {
    pub description: Option<&'a str>,
    pub status: Option<&'a str>,
    pub baseline: Option<&'a Baseline>,
    pub browsers: Option<&'a [&'a str]>,
    pub references: &'a [Reference],
    /// Only a property carries `syntax`; upstream keys the branch on the
    /// property being present at all.
    pub syntax: Option<&'a str>,
}

impl<'a> From<&'a Entry> for Described<'a> {
    fn from(entry: &'a Entry) -> Self {
        Self {
            description: entry.description,
            status: entry.status,
            baseline: entry.baseline.as_ref(),
            browsers: entry.browsers,
            references: entry.references,
            syntax: None,
        }
    }
}

impl<'a> From<&'a Property> for Described<'a> {
    fn from(property: &'a Property) -> Self {
        Self {
            description: property.description,
            status: property.status,
            baseline: property.baseline.as_ref(),
            browsers: property.browsers,
            references: property.references,
            syntax: property.syntax,
        }
    }
}

impl<'a> From<&'a Value> for Described<'a> {
    fn from(value: &'a Value) -> Self {
        Self {
            description: value.description,
            status: None,
            baseline: value.baseline.as_ref(),
            browsers: value.browsers,
            references: &[],
            syntax: None,
        }
    }
}

#[must_use]
pub fn documentation(entry: &Described, markdown: bool) -> Option<String> {
    let description = entry.description.filter(|text| !text.is_empty())?;
    let status = entry
        .status
        .and_then(|status| {
            STATUS_PREFIXES
                .iter()
                .find(|(name, _)| *name == status)
                .map(|(_, prefix)| *prefix)
        })
        .unwrap_or("");
    let mut value = String::from(status);
    if markdown {
        value.push_str(&marked_string(description));
    } else {
        value.push_str(description);
    }
    if let Some(baseline) = entry.baseline
        && status.is_empty()
    {
        let availability = baseline_status(baseline, entry.browsers);
        if markdown {
            let _ = write!(
                value,
                "\n\n![Baseline icon]({}) _{availability}_",
                baseline_image(baseline)
            );
        } else {
            let _ = write!(value, "\n\n{availability}");
        }
    }
    if let Some(syntax) = entry.syntax {
        if markdown {
            let _ = write!(value, "\n\nSyntax: {}", marked_string(syntax));
        } else {
            let _ = write!(value, "\n\nSyntax: {syntax}");
        }
    }
    if !entry.references.is_empty() {
        if !value.is_empty() {
            value.push_str("\n\n");
        }
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
            .join(" | ");
        value.push_str(&rendered);
    }
    (!value.is_empty()).then_some(value)
}

fn baseline_image(baseline: &Baseline) -> &'static str {
    match baseline.status {
        BaselineStatus::Low => super::web::BASELINE_LOW_IMAGE,
        BaselineStatus::High => super::web::BASELINE_HIGH_IMAGE,
        BaselineStatus::Limited => super::web::BASELINE_LIMITED_IMAGE,
    }
}

fn baseline_status(baseline: &Baseline, browsers: Option<&[&str]>) -> String {
    if matches!(baseline.status, BaselineStatus::Limited) {
        let missing = missing_baseline_browsers(browsers);
        return if missing.is_empty() {
            "Limited availability across major browsers".to_string()
        } else {
            format!(
                "Limited availability across major browsers (Not fully implemented in {missing})"
            )
        };
    }
    let word = if matches!(baseline.status, BaselineStatus::Low) {
        "Newly"
    } else {
        "Widely"
    };
    // `${undefined}` where the date is absent, which upstream prints verbatim.
    let year = baseline
        .low_date
        .and_then(|date| date.split('-').next())
        .unwrap_or("undefined");
    format!("{word} available across major browsers (Baseline since {year})")
}

/// The id `shortCompatPattern` reports for one entry of a `browsers` list. The
/// pattern is unanchored, so the earliest position wins and the alternation's
/// order decides between overlapping ids.
fn compat_id(entry: &str) -> Option<&'static str> {
    (0..entry.len()).find_map(|start| {
        let rest = &entry[start..];
        COMPAT_IDS.iter().copied().find(|id| rest.starts_with(*id))
    })
}

fn missing_baseline_browsers(browsers: Option<&[&str]>) -> String {
    // `if (!browsers) return ''` — an absent list is not an empty one.
    let Some(browsers) = browsers else {
        return String::new();
    };
    let present: Vec<&str> = browsers
        .iter()
        .filter_map(|entry| compat_id(entry))
        .collect();
    // Keyed by browser NAME, so the two platforms of one browser collapse and
    // the later one wins; the order is that of first insertion.
    let mut labels: Vec<(&str, String)> = Vec::new();
    for (id, name, platform) in BROWSERS {
        if present.contains(id) {
            continue;
        }
        let label = if *id == "E" || labels.iter().any(|(seen, _)| seen == name) {
            (*name).to_string()
        } else {
            format!("{name} on {platform}")
        };
        match labels.iter_mut().find(|(seen, _)| seen == name) {
            Some(slot) => slot.1 = label,
            None => labels.push((*name, label)),
        }
    }
    disjunction(
        &labels
            .iter()
            .map(|(_, label)| label.as_str())
            .collect::<Vec<_>>(),
    )
}

/// `Intl.ListFormat("en", { style: "long", type: "disjunction" })`.
fn disjunction(items: &[&str]) -> String {
    match items {
        [] => String::new(),
        [only] => (*only).to_string(),
        [first, second] => format!("{first} or {second}"),
        [head @ .., last] => format!("{}, or {last}", head.join(", ")),
    }
}

/// `textToMarkedString`: escape the markdown syntax tokens, then the brackets.
fn marked_string(text: &str) -> String {
    let mut escaped = String::with_capacity(text.len());
    for character in text.chars() {
        match character {
            '\\' | '`' | '*' | '_' | '{' | '}' | '[' | ']' | '(' | ')' | '#' | '+' | '-' | '.'
            | '!' => {
                escaped.push('\\');
                escaped.push(character);
            }
            '<' => escaped.push_str("&lt;"),
            '>' => escaped.push_str("&gt;"),
            other => escaped.push(other),
        }
    }
    escaped
}
