//! `ESLint`'s configuration comments, `/* eslint svelte/rule: ["warn", {…}] */`, which set rules
//! for one file.

use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::positions::Span;
use serde::de::{Deserialize, Deserializer, MapAccess, Visitor};
use serde_json::value::RawValue;

use crate::Configuration;
use crate::configuration::{Running, applies};
use crate::directives::justification_start;
use crate::rule::{File, Files, SvelteRule};
use crate::words::is_javascript_space;

/// What a comment sets a rule to.
#[derive(Debug)]
pub(super) enum Setting {
    Off,
    /// On at a level, with the comment's options; without them, a configured rule keeps its own.
    On(Severity, Option<Vec<Box<RawValue>>>),
}

/// The rules the block comments set, each to what the last comment naming it says.
///
/// `ESLint` reports a comment it cannot read, or a level it does not know; such a comment sets
/// nothing here.
pub(super) fn settings(comments: &[Span], source: &str) -> Vec<(String, Setting)> {
    let mut out: Vec<(String, Setting)> = Vec::new();
    for comment in comments {
        let Some(value) = comment
            .text(source)
            .strip_prefix("/*")
            .and_then(|inner| inner.strip_suffix("*/"))
        else {
            continue;
        };
        let part = value[..justification_start(value).unwrap_or(value.len())]
            .trim_matches(is_javascript_space);
        let Some(rules) = part
            .strip_prefix("eslint")
            .filter(|rest| rest.is_empty() || rest.starts_with(is_javascript_space))
        else {
            continue;
        };
        let Some(rules) = parse_json_like(rules) else {
            continue;
        };
        for (name, value) in rules {
            let Some(setting) = setting(&value) else {
                continue;
            };
            out.retain(|(n, _)| *n != name);
            out.push((name, setting));
        }
    }
    out
}

/// `ConfigCommentParser.parseJSONLikeConfig`: the text as a JSON object's members, or, failing
/// that, with each name before a `:` quoted and a comma after the first `]` or digit that only
/// spaces separate from a `"`.
fn parse_json_like(text: &str) -> Option<Vec<(String, Box<RawValue>)>> {
    let parse = |text: String| serde_json::from_str::<Members>(&text).ok().map(|m| m.0);
    parse(format!("{{{text}}}")).or_else(|| parse(format!("{{{}}}", normalize(text))))
}

/// A JSON object's members in source order.
struct Members(Vec<(String, Box<RawValue>)>);

impl<'de> Deserialize<'de> for Members {
    fn deserialize<D: Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        struct Object;
        impl<'de> Visitor<'de> for Object {
            type Value = Members;

            fn expecting(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                formatter.write_str("an object")
            }

            fn visit_map<A: MapAccess<'de>>(self, mut map: A) -> Result<Members, A::Error> {
                let mut members = Vec::new();
                while let Some(member) = map.next_entry()? {
                    members.push(member);
                }
                Ok(Members(members))
            }
        }
        deserializer.deserialize_map(Object)
    }
}

fn normalize(text: &str) -> String {
    let is_name = |c: char| c.is_ascii_alphanumeric() || c == '-' || c == '/';
    let mut quoted = String::with_capacity(text.len() + 8);
    let mut rest = text;
    while let Some(start) = rest.find(is_name) {
        let end = rest[start..]
            .find(|c: char| !is_name(c))
            .map_or(rest.len(), |n| start + n);
        quoted.push_str(&rest[..start]);
        if rest[end..].starts_with(':') {
            quoted.push('"');
            quoted.push_str(&rest[start..end]);
            quoted.push('"');
        } else {
            quoted.push_str(&rest[start..end]);
        }
        rest = &rest[end..];
    }
    quoted.push_str(rest);
    let comma = quoted.char_indices().find_map(|(i, c)| {
        if c != ']' && !c.is_ascii_digit() {
            return None;
        }
        let after = &quoted[i + 1..];
        let spaces = after.len() - after.trim_start_matches(is_javascript_space).len();
        (spaces > 0 && after[spaces..].starts_with('"')).then_some((i + 1, i + 1 + spaces))
    });
    if let Some((start, end)) = comma {
        quoted.replace_range(start..end, ",");
    }
    quoted
}

/// A rule's value: its level, or an array of the level and the options.
fn setting(value: &RawValue) -> Option<Setting> {
    let level = |value: &RawValue| match value.get() {
        "0" | "\"off\"" => Some(None),
        "1" | "\"warn\"" => Some(Some(Severity::Warning)),
        "2" | "\"error\"" => Some(Some(Severity::Error)),
        _ => None,
    };
    let (severity, options) = if value.get().starts_with('[') {
        let mut entry: Vec<Box<RawValue>> = serde_json::from_str(value.get()).ok()?;
        if entry.is_empty() {
            return None;
        }
        let severity = level(&entry[0])?;
        entry.remove(0);
        (severity, (!entry.is_empty()).then_some(entry))
    } else {
        (level(value)?, None)
    };
    Some(severity.map_or(Setting::Off, |severity| Setting::On(severity, options)))
}

/// A rule that runs over one file.
#[derive(Debug)]
enum Slot {
    /// Configuration's rule, at this level.
    Configured(usize, Severity),
    /// A rule the file's comments configure.
    Commented {
        name: &'static str,
        severity: Severity,
        files: Files,
        rule: Box<dyn SvelteRule>,
    },
}

/// The rules that run over one file: configuration's, as the file's comments set them.
#[derive(Debug, Default)]
pub(crate) struct FileRules {
    /// Empty when no comment sets a rule, so the configuration's rules run as they are.
    slots: Vec<Slot>,
    /// Comments turned every rule off.
    none: bool,
}

impl FileRules {
    pub(super) fn new(configuration: &Configuration, settings: Vec<(String, Setting)>) -> Self {
        if settings.is_empty() {
            return Self::default();
        }
        let rules = configuration.rules();
        let mut slots: Vec<Option<Slot>> = rules
            .iter()
            .enumerate()
            .map(|(i, rule)| Some(Slot::Configured(i, rule.severity())))
            .collect();
        for (name, setting) in settings {
            let at = rules.iter().position(|rule| rule.name() == name);
            match (setting, at) {
                (Setting::Off, Some(i)) => slots[i] = None,
                (Setting::Off, None) => {}
                (Setting::On(severity, None), Some(i)) => {
                    slots[i] = Some(Slot::Configured(i, severity));
                }
                (Setting::On(severity, options), at) => {
                    let options = options.unwrap_or_default();
                    let Ok((definition, rule)) = configuration.configure_again(&name, &options)
                    else {
                        continue;
                    };
                    let slot = Slot::Commented {
                        name: definition.name,
                        severity,
                        files: definition.files,
                        rule,
                    };
                    match at {
                        Some(i) => slots[i] = Some(slot),
                        None => slots.push(Some(slot)),
                    }
                }
            }
        }
        let slots: Vec<Slot> = slots.into_iter().flatten().collect();
        Self {
            none: slots.is_empty(),
            slots,
        }
    }

    /// The rules that run over `file`, in configuration order, then those only the comments
    /// turned on.
    pub(crate) fn running<'a>(
        &'a self,
        configuration: &'a Configuration,
        file: &'a File<'_>,
    ) -> impl Iterator<Item = Running<'a>> + Clone + 'a {
        let configured = (self.slots.is_empty() && !self.none)
            .then(|| configuration.rules().iter().map(Running::configured))
            .into_iter()
            .flatten();
        let commented = self.slots.iter().map(|slot| match slot {
            &Slot::Configured(i, severity) => Running {
                severity,
                ..Running::configured(&configuration.rules()[i])
            },
            Slot::Commented {
                name,
                severity,
                files,
                rule,
            } => Running {
                name,
                severity: *severity,
                files: *files,
                rule: rule.as_ref(),
            },
        });
        configured
            .chain(commented)
            .filter(move |rule| applies(rule.files, file))
    }
}

#[cfg(test)]
mod tests;
