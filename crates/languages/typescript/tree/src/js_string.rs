//! A JavaScript string value, which may hold a lone surrogate where a Rust string cannot.

use std::borrow::Cow;
use std::fmt;

use oxc_allocator::GetAllocator;
use oxc_str::{JSStr, JSStrBuilder};

/// A string of UTF-16 code units: the well-formed text, and each lone surrogate at the byte
/// offset of `text` it comes before. A surrogate pair is always one `char` of `text`, so equal
/// strings are equal values.
#[derive(Clone, Debug, Default, PartialEq, Eq, Hash)]
pub struct JsString {
    text: String,
    surrogates: Surrogates,
}

/// The lone surrogates of a [`JsString`], boxed so that the string is a word larger than its text
/// and `None` when there are none, which keeps equal strings equal.
#[derive(Clone, Debug, Default, PartialEq, Eq, Hash)]
struct Surrogates(Option<Box<[(usize, u16)]>>);

impl Surrogates {
    #[inline]
    const fn is_empty(&self) -> bool {
        self.0.is_none()
    }

    fn as_slice(&self) -> &[(usize, u16)] {
        self.0.as_deref().unwrap_or_default()
    }

    fn push(&mut self, surrogate: (usize, u16)) {
        let mut surrogates = self.0.take().map_or_else(Vec::new, Vec::from);
        surrogates.push(surrogate);
        self.0 = Some(surrogates.into_boxed_slice());
    }

    fn pop(&mut self) {
        let mut surrogates = self.0.take().map_or_else(Vec::new, Vec::from);
        surrogates.pop();
        *self = surrogates.into_iter().collect();
    }
}

impl FromIterator<(usize, u16)> for Surrogates {
    fn from_iter<I: IntoIterator<Item = (usize, u16)>>(iter: I) -> Self {
        let surrogates: Box<[_]> = iter.into_iter().collect();
        Self((!surrogates.is_empty()).then_some(surrogates))
    }
}

/// A part of a [`JsString`]: text, or one lone surrogate.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Run<'s> {
    Text(&'s str),
    Surrogate(u16),
}

impl JsString {
    #[must_use]
    pub const fn new() -> Self {
        Self {
            text: String::new(),
            surrogates: Surrogates(None),
        }
    }

    /// The value of an oxc string.
    #[must_use]
    #[inline]
    pub fn from_js_str(value: JSStr<'_>) -> Self {
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
                Ok(character) => string.text.push(character),
                Err(error) => string.push_surrogate(error.unpaired_surrogate()),
            }
        }
        string
    }

    /// The text, unless the string holds a lone surrogate.
    #[must_use]
    #[inline]
    pub fn as_str(&self) -> Option<&str> {
        self.surrogates.is_empty().then_some(self.text.as_str())
    }

    /// The text, each lone surrogate replaced by U+FFFD, as `TextEncoder` writes it.
    #[must_use]
    #[inline]
    pub fn to_string_lossy(&self) -> Cow<'_, str> {
        if self.surrogates.is_empty() {
            return Cow::Borrowed(&self.text);
        }
        let mut text =
            String::with_capacity(self.text.len() + 3 * self.surrogates.as_slice().len());
        for run in self.runs() {
            match run {
                Run::Text(part) => text.push_str(part),
                Run::Surrogate(_) => text.push(char::REPLACEMENT_CHARACTER),
            }
        }
        Cow::Owned(text)
    }

    #[must_use]
    pub const fn is_empty(&self) -> bool {
        self.text.is_empty() && self.surrogates.is_empty()
    }

    #[inline]
    pub fn push_str(&mut self, text: &str) {
        self.text.push_str(text);
    }

    #[inline]
    pub fn push(&mut self, character: char) {
        self.text.push(character);
    }

    /// Appends `other`, pairing a trailing lead surrogate with a leading trail surrogate.
    #[inline]
    pub fn push_js(&mut self, other: &Self) {
        if other.surrogates.is_empty() {
            return self.text.push_str(&other.text);
        }
        for run in other.runs() {
            match run {
                Run::Text(part) => self.text.push_str(part),
                Run::Surrogate(unit) => self.push_surrogate(unit),
            }
        }
    }

    fn push_surrogate(&mut self, unit: u16) {
        let end = self.text.len();
        if let Some(&(at, lead)) = self.surrogates.as_slice().last()
            && at == end
            && (0xD800..0xDC00).contains(&lead)
            && (0xDC00..0xE000).contains(&unit)
            && let Some(Ok(character)) = char::decode_utf16([lead, unit]).next()
        {
            self.surrogates.pop();
            self.text.push(character);
            return;
        }
        self.surrogates.push((end, unit));
    }

    /// The string without the characters that `trim` matches at its start, before any lone
    /// surrogate.
    #[must_use]
    pub fn trim_start_matches(&self, trim: impl Fn(char) -> bool) -> Self {
        let limit = self
            .surrogates
            .as_slice()
            .first()
            .map_or(self.text.len(), |&(at, _)| at);
        let cut = limit - self.text[..limit].trim_start_matches(trim).len();
        Self {
            text: self.text[cut..].to_owned(),
            surrogates: (self.surrogates.as_slice().iter())
                .map(|&(at, unit)| (at - cut, unit))
                .collect(),
        }
    }

    /// The text between lone surrogates, and the surrogates, in order.
    pub fn runs(&self) -> impl Iterator<Item = Run<'_>> {
        let mut from = 0;
        let mut surrogates = self.surrogates.as_slice().iter();
        let mut pending = None;
        std::iter::from_fn(move || {
            if let Some(unit) = pending.take() {
                return Some(Run::Surrogate(unit));
            }
            match surrogates.next() {
                Some(&(at, unit)) => {
                    let part = &self.text[from..at];
                    from = at;
                    if part.is_empty() {
                        Some(Run::Surrogate(unit))
                    } else {
                        pending = Some(unit);
                        Some(Run::Text(part))
                    }
                }
                None if from < self.text.len() => {
                    let part = &self.text[from..];
                    from = self.text.len();
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
        string.push_js_mapped(self, map);
        string
    }

    /// Appends `other` with `map` applied to each of its text runs, as [`Self::push_js`] does.
    #[inline]
    pub fn push_js_mapped(&mut self, other: &Self, map: impl Fn(&str) -> Cow<'_, str>) {
        if other.surrogates.is_empty() {
            return self.text.push_str(&map(&other.text));
        }
        for run in other.runs() {
            match run {
                Run::Text(part) => self.text.push_str(&map(part)),
                Run::Surrogate(unit) => self.push_surrogate(unit),
            }
        }
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
    pub fn to_js_str_in<'a>(&self, allocator: &impl GetAllocator<'a>) -> JSStr<'a> {
        if self.surrogates.is_empty() {
            return JSStr::from_str_in(&self.text, allocator);
        }
        let mut builder = JSStrBuilder::with_capacity_in(
            self.text.len() + 3 * self.surrogates.as_slice().len(),
            allocator,
        );
        for run in self.runs() {
            match run {
                Run::Text(part) => builder.push_str(part),
                Run::Surrogate(unit) => builder.push_code_unit(unit),
            }
        }
        builder.into_js_str()
    }
}

impl From<String> for JsString {
    fn from(text: String) -> Self {
        Self {
            text,
            surrogates: Surrogates(None),
        }
    }
}

impl From<&str> for JsString {
    fn from(text: &str) -> Self {
        Self::from(text.to_owned())
    }
}

impl PartialEq<str> for JsString {
    fn eq(&self, other: &str) -> bool {
        self.as_str() == Some(other)
    }
}

impl PartialEq<&str> for JsString {
    fn eq(&self, other: &&str) -> bool {
        self.as_str() == Some(*other)
    }
}

impl PartialOrd for JsString {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for JsString {
    /// By code units, as JavaScript compares strings.
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        self.encode_utf16().cmp(other.encode_utf16())
    }
}

impl fmt::Write for JsString {
    #[inline]
    fn write_str(&mut self, s: &str) -> fmt::Result {
        self.text.push_str(s);
        Ok(())
    }
}

#[cfg(test)]
mod tests;
