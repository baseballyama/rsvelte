//! Port of `svelte-preprocess`'s `replace` transformer
//! (`src/transformers/replace.ts`) — applies an ordered list of regex
//! replacements to the markup.

use std::sync::Arc;

use regex::{Captures, Regex};

/// A replacement value: a template string (with `$1`/`${1}` group refs, like
/// the JS string form) or a function (the JS function-replacer form).
#[derive(Clone)]
pub enum Replacement {
    /// Template string passed to `Regex::replace_all` (supports `${1}` refs).
    Template(String),
    /// Function replacer, receiving the capture groups.
    Func(Arc<dyn Fn(&Captures) -> String + Send + Sync>),
}

impl std::fmt::Debug for Replacement {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Replacement::Template(s) => write!(f, "Template({s:?})"),
            Replacement::Func(_) => write!(f, "Func(..)"),
        }
    }
}

impl From<&str> for Replacement {
    fn from(s: &str) -> Self {
        Replacement::Template(s.to_string())
    }
}

/// One `[regex, replacement]` rule (mirrors the JS tuple).
#[derive(Clone, Debug)]
pub struct ReplaceRule {
    pub regex: Regex,
    pub replacement: Replacement,
}

impl ReplaceRule {
    pub fn new(regex: Regex, replacement: impl Into<Replacement>) -> Self {
        ReplaceRule {
            regex,
            replacement: replacement.into(),
        }
    }
}

/// Apply the rules in order, each as a global replace — mirrors the upstream
/// `for (const [regex, replacer] of options) content = content.replace(...)`.
pub fn apply(content: &str, rules: &[ReplaceRule]) -> String {
    let mut out = content.to_string();
    for rule in rules {
        out = match &rule.replacement {
            Replacement::Template(t) => rule.regex.replace_all(&out, t.as_str()).into_owned(),
            Replacement::Func(f) => rule
                .regex
                .replace_all(&out, |caps: &Captures| f(caps))
                .into_owned(),
        };
    }
    out
}
