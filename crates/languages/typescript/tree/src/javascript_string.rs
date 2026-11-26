//! A JavaScript string value, which may hold a lone surrogate where a Rust string cannot.

use std::borrow::Cow;
use std::fmt;

use oxc_allocator::GetAllocator;
use oxc_str::{JSStr, JSStrBuilder};

/// A string of UTF-16 code units. Well-formed text is a plain `String`; only a string with a lone
/// surrogate pays for one, so equal strings are always the same variant.
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub enum JavaScriptString {
    Text(String),
    Lone(Box<Lone>),
}

/// The well-formed text of a string with lone surrogates, and each surrogate at the byte offset
/// of `text` it comes before; never empty. A surrogate pair is always one `char` of `text`.
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct Lone {
    text: String,
    surrogates: Vec<(usize, u16)>,
}

/// A part of a [`JavaScriptString`]: text, or one lone surrogate.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Run<'s> {
    Text(&'s str),
    Surrogate(u16),
}

impl Default for JavaScriptString {
    fn default() -> Self {
        Self::new()
    }
}

impl JavaScriptString {
    #[must_use]
    pub const fn new() -> Self {
        Self::Text(String::new())
    }

    /// The value of an oxc string.
    #[must_use]
    #[inline]
    pub fn from_oxc(value: JSStr<'_>) -> Self {
        value
            .as_str()
            .map_or_else(|| Self::from_utf16(value.encode_utf16()), Self::from)
    }

    /// The string of `units`, which need not be well-formed UTF-16.
    #[must_use]
    pub fn from_utf16(units: impl IntoIterator<Item = u16>) -> Self {
        let mut string = Self::new();
        for unit in char::decode_utf16(units) {
            match unit {
                Ok(character) => string.push(character),
                Err(error) => string.push_surrogate(error.unpaired_surrogate()),
            }
        }
        string
    }

    /// The text, unless the string holds a lone surrogate.
    #[must_use]
    #[inline]
    pub fn as_str(&self) -> Option<&str> {
        match self {
            Self::Text(text) => Some(text),
            Self::Lone(_) => None,
        }
    }

    fn parts(&self) -> (&str, &[(usize, u16)]) {
        match self {
            Self::Text(text) => (text, &[]),
            Self::Lone(lone) => (&lone.text, &lone.surrogates),
        }
    }

    fn text_mut(&mut self) -> &mut String {
        match self {
            Self::Text(text) => text,
            Self::Lone(lone) => &mut lone.text,
        }
    }

    /// The text, each lone surrogate replaced by U+FFFD, as `TextEncoder` writes it.
    #[must_use]
    #[inline]
    pub fn to_string_lossy(&self) -> Cow<'_, str> {
        match self {
            Self::Text(text) => Cow::Borrowed(text),
            Self::Lone(_) => Cow::Owned(self.lossy()),
        }
    }

    #[cold]
    fn lossy(&self) -> String {
        let mut text = String::new();
        for run in self.runs() {
            match run {
                Run::Text(part) => text.push_str(part),
                Run::Surrogate(_) => text.push(char::REPLACEMENT_CHARACTER),
            }
        }
        text
    }

    #[must_use]
    pub const fn is_empty(&self) -> bool {
        match self {
            Self::Text(text) => text.is_empty(),
            Self::Lone(_) => false,
        }
    }

    /// Empties the string, keeping its text's buffer.
    pub fn clear(&mut self) {
        if let Self::Lone(lone) = self {
            *self = Self::Text(std::mem::take(&mut lone.text));
        }
        self.text_mut().clear();
    }

    #[inline]
    pub fn push_str(&mut self, text: &str) {
        self.text_mut().push_str(text);
    }

    #[inline]
    pub fn push(&mut self, character: char) {
        self.text_mut().push(character);
    }

    /// Appends `other`, pairing a trailing lead surrogate with a leading trail surrogate.
    #[inline]
    pub fn push_string(&mut self, other: &Self) {
        match other {
            Self::Text(text) => self.push_str(text),
            Self::Lone(_) => self.push_runs(other, |text| Cow::Borrowed(text)),
        }
    }

    /// Appends `other` with `map` applied to each of its text runs, as [`Self::push_string`] does.
    #[inline]
    pub fn push_string_mapped(&mut self, other: &Self, map: impl Fn(&str) -> Cow<'_, str>) {
        match other {
            Self::Text(text) => self.push_str(&map(text)),
            Self::Lone(_) => self.push_runs(other, map),
        }
    }

    #[cold]
    fn push_runs(&mut self, other: &Self, map: impl Fn(&str) -> Cow<'_, str>) {
        for run in other.runs() {
            match run {
                Run::Text(part) => self.push_str(&map(part)),
                Run::Surrogate(unit) => self.push_surrogate(unit),
            }
        }
    }

    #[cold]
    fn push_surrogate(&mut self, unit: u16) {
        if let Self::Text(text) = self {
            let text = std::mem::take(text);
            let surrogates = vec![(text.len(), unit)];
            *self = Self::Lone(Box::new(Lone { text, surrogates }));
            return;
        }
        let Self::Lone(lone) = self else {
            unreachable!("a string with text only was handled above")
        };
        let end = lone.text.len();
        let pair = match lone.surrogates.last() {
            Some(&(at, lead)) if at == end => char::decode_utf16([lead, unit]).next(),
            _ => None,
        };
        let Some(Ok(character)) = pair else {
            return lone.surrogates.push((end, unit));
        };
        lone.surrogates.pop();
        lone.text.push(character);
        if lone.surrogates.is_empty() {
            *self = Self::Text(std::mem::take(&mut lone.text));
        }
    }

    /// The string without the characters that `trim` matches at its start, before any lone
    /// surrogate.
    #[must_use]
    pub fn trim_start_matches(&self, trim: impl Fn(char) -> bool) -> Self {
        match self {
            Self::Text(text) => Self::Text(text.trim_start_matches(trim).to_owned()),
            Self::Lone(lone) => {
                let limit = lone.surrogates[0].0;
                let cut = limit - lone.text[..limit].trim_start_matches(trim).len();
                Self::Lone(Box::new(Lone {
                    text: lone.text[cut..].to_owned(),
                    surrogates: (lone.surrogates.iter())
                        .map(|&(at, unit)| (at - cut, unit))
                        .collect(),
                }))
            }
        }
    }

    /// The text between lone surrogates, and the surrogates, in order.
    pub fn runs(&self) -> impl Iterator<Item = Run<'_>> {
        let (text, surrogates) = self.parts();
        let mut from = 0;
        let mut surrogates = surrogates.iter();
        let mut pending = None;
        std::iter::from_fn(move || {
            if let Some(unit) = pending.take() {
                return Some(Run::Surrogate(unit));
            }
            match surrogates.next() {
                Some(&(at, unit)) => {
                    let part = &text[from..at];
                    from = at;
                    if part.is_empty() {
                        Some(Run::Surrogate(unit))
                    } else {
                        pending = Some(unit);
                        Some(Run::Text(part))
                    }
                }
                None if from < text.len() => {
                    let part = &text[from..];
                    from = text.len();
                    Some(Run::Text(part))
                }
                None => None,
            }
        })
    }

    /// The string with `map` applied to each text run; the lone surrogates stay.
    #[must_use]
    pub fn map_text(&self, map: impl Fn(&str) -> Cow<'_, str>) -> Self {
        let mut string = Self::new();
        string.push_string_mapped(self, map);
        string
    }

    pub fn encode_utf16(&self) -> impl Iterator<Item = u16> + '_ {
        self.runs().flat_map(|run| {
            let (text, unit) = match run {
                Run::Text(text) => (text, None),
                Run::Surrogate(unit) => ("", Some(unit)),
            };
            text.encode_utf16().chain(unit)
        })
    }

    /// The string in `allocator`, as an oxc string.
    #[inline]
    pub fn to_oxc_in<'a>(&self, allocator: &impl GetAllocator<'a>) -> JSStr<'a> {
        match self {
            Self::Text(text) => JSStr::from(allocator.allocator().alloc_str(text)),
            Self::Lone(_) => self.lone_to_oxc_in(allocator),
        }
    }

    #[cold]
    fn lone_to_oxc_in<'a>(&self, allocator: &impl GetAllocator<'a>) -> JSStr<'a> {
        let mut builder = JSStrBuilder::new_in(allocator);
        for run in self.runs() {
            match run {
                Run::Text(part) => builder.push_str(part),
                Run::Surrogate(unit) => builder.push_code_unit(unit),
            }
        }
        builder.into_js_str()
    }
}

impl From<String> for JavaScriptString {
    fn from(text: String) -> Self {
        Self::Text(text)
    }
}

impl From<&str> for JavaScriptString {
    fn from(text: &str) -> Self {
        Self::Text(text.to_owned())
    }
}

impl PartialEq<str> for JavaScriptString {
    fn eq(&self, other: &str) -> bool {
        self.as_str() == Some(other)
    }
}

impl PartialEq<&str> for JavaScriptString {
    fn eq(&self, other: &&str) -> bool {
        self.as_str() == Some(*other)
    }
}

impl PartialOrd for JavaScriptString {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for JavaScriptString {
    /// By code units, as JavaScript compares strings.
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        self.encode_utf16().cmp(other.encode_utf16())
    }
}

impl fmt::Write for JavaScriptString {
    #[inline]
    fn write_str(&mut self, s: &str) -> fmt::Result {
        self.push_str(s);
        Ok(())
    }

    #[inline]
    fn write_char(&mut self, c: char) -> fmt::Result {
        self.push(c);
        Ok(())
    }
}

#[cfg(test)]
mod tests;
