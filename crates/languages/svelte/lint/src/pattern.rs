//! eslint-plugin-svelte's `toRegExp`: an option string that is either a name or a `/pattern/flags`
//! regular expression.

use std::borrow::Cow;

use regress::{Flags, Regex};

/// A compiled option string: `/^foo/u` is an ECMAScript regular expression, anything else matches
/// only itself.
#[derive(Debug)]
pub enum Pattern {
    Exact(String),
    Regex {
        regex: Regex,
        sticky: bool,
        /// With `u` or `v`; without, a pattern sees UTF-16 code units, as JavaScript's does.
        unicode: bool,
    },
}

impl Pattern {
    /// # Errors
    ///
    /// The flags or the pattern are not valid, where `new RegExp` throws.
    pub fn new(option: &str) -> Result<Self, String> {
        let Some((body, flags)) = split(option) else {
            return Ok(Self::Exact(option.to_owned()));
        };
        let mut seen = String::new();
        for flag in flags.chars() {
            if !"dgimsuvy".contains(flag) || seen.contains(flag) {
                return Err(format!("invalid regular expression flags in `{option}`"));
            }
            seen.push(flag);
        }
        if seen.contains('u') && seen.contains('v') {
            return Err(format!("invalid regular expression flags in `{option}`"));
        }
        let unicode = seen.contains(['u', 'v']);
        let body = if unicode {
            Cow::Borrowed(body)
        } else {
            without_code_point_escapes(body)
        };
        let regex = Regex::with_flags(&body, Flags::from(flags))
            .map_err(|error| format!("invalid regular expression `{option}`: {error}"))?;
        Ok(Self::Regex {
            regex,
            sticky: seen.contains('y'),
            unicode,
        })
    }

    /// `RegExp.prototype.test` on a fresh expression, or string equality.
    #[must_use]
    pub fn matches(&self, text: &str) -> bool {
        match self {
            Self::Exact(name) => name == text,
            Self::Regex {
                regex,
                sticky,
                unicode,
            } => {
                let found = if *unicode {
                    regex.find(text)
                } else {
                    let units: Vec<u16> = text.encode_utf16().collect();
                    regex.find_from_ucs2(&units, 0).next()
                };
                found.is_some_and(|found| !sticky || found.start() == 0)
            }
        }
    }
}

/// `/^\/(.+)\/([A-Za-z]*)$/u`: the body and the flags; the last `/` ends the body.
fn split(option: &str) -> Option<(&str, &str)> {
    let rest = option.strip_prefix('/')?;
    let slash = rest.rfind('/')?;
    let (body, flags) = (&rest[..slash], &rest[slash + 1..]);
    // `.` stops at a line terminator.
    let one_line = !body.contains(['\n', '\r', '\u{2028}', '\u{2029}']);
    (!body.is_empty() && one_line && flags.bytes().all(|b| b.is_ascii_alphabetic()))
        .then_some((body, flags))
}

/// Without `u`, JavaScript reads `\u{61}` as `u{61}`: `u` 61 times. `regress` reads a code point
/// escape either way, so the backslash goes.
fn without_code_point_escapes(body: &str) -> Cow<'_, str> {
    if !body.contains("\\u{") {
        return Cow::Borrowed(body);
    }
    let mut out = String::with_capacity(body.len());
    let mut chars = body.chars().peekable();
    while let Some(c) = chars.next() {
        if c != '\\' {
            out.push(c);
            continue;
        }
        match chars.next() {
            Some('u') if chars.peek() == Some(&'{') => out.push('u'),
            Some(escaped) => {
                out.push('\\');
                out.push(escaped);
            }
            None => out.push('\\'),
        }
    }
    Cow::Owned(out)
}

#[cfg(test)]
mod tests;
