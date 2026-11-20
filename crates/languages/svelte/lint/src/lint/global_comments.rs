//! `ESLint`'s `/* global name, name: setting */` comments (or `/* globals */`), which set a
//! document's global variables over the configuration's.

use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_semantic::globals::Setting;

use super::directive_comments::justification_start;
use crate::words::words;

/// The globals the block comments among `comments` set, in order, so that a later one wins.
///
/// A name without a setting is read-only. `ESLint` reports a setting it does not know, which sets
/// nothing here.
pub(crate) fn settings(comments: &[Span], source: &str) -> Vec<(Box<str>, Setting)> {
    let mut out = Vec::new();
    for comment in comments {
        let Some(list) = comment
            .text(source)
            .strip_prefix("/*")
            .and_then(|inner| inner.strip_suffix("*/"))
            .and_then(directive)
        else {
            continue;
        };
        let list = collapse(list);
        for word in words(&list, 0) {
            let entry = word.text(&list);
            let (name, setting) = match entry.split_once(':') {
                None => (entry, Some(Setting::Readonly)),
                Some((name, value)) => {
                    let value = value.split_once(':').map_or(value, |(value, _)| value);
                    (name, Setting::named(value))
                }
            };
            if let Some(setting) = setting {
                out.push((name.into(), setting));
            }
        }
    }
    out
}

/// The list of a `global` or `globals` directive (`parseDirective`), without its ` -- `
/// description.
fn directive(value: &str) -> Option<&str> {
    let part = value[..justification_start(value).unwrap_or(value.len())]
        .trim_matches(is_ecmascript_whitespace);
    let rest = part
        .strip_prefix("globals")
        .or_else(|| part.strip_prefix("global"))?;
    (rest.is_empty() || rest.starts_with(is_ecmascript_whitespace))
        .then(|| rest.trim_matches(is_ecmascript_whitespace))
}

/// `parseStringConfig`'s first step: the list without the spaces around a `:` or a `,`.
fn collapse(list: &str) -> String {
    let mut out = String::with_capacity(list.len());
    let mut spaces = String::new();
    for c in list.chars() {
        if is_ecmascript_whitespace(c) {
            if !out.ends_with([':', ',']) {
                spaces.push(c);
            }
            continue;
        }
        if !matches!(c, ':' | ',') {
            out.push_str(&spaces);
        }
        spaces.clear();
        out.push(c);
    }
    out
}

#[cfg(test)]
mod tests;
