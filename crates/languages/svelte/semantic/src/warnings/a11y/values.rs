//! Attribute values the a11y checks parse: ARIA property values, `autocomplete`, numbers and
//! the few patterns `a11y/index.js` matches.

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;

use super::{Static, tables};

/// JavaScript's `Number(text)`.
pub(super) fn number(text: &str) -> f64 {
    let text = text.trim_matches(is_ecmascript_whitespace);
    if text.is_empty() {
        return 0.0;
    }
    if let Some(radix) = ["0x", "0X", "0o", "0O", "0b", "0B"]
        .iter()
        .any(|p| text.starts_with(p))
        .then(|| match text.as_bytes()[1] {
            b'x' | b'X' => 16,
            b'o' | b'O' => 8,
            _ => 2,
        })
    {
        let digits = &text[2..];
        if digits.is_empty() {
            return f64::NAN;
        }
        return digits
            .chars()
            .try_fold(0.0_f64, |n, c| {
                c.to_digit(radix)
                    .map(|d| n.mul_add(f64::from(radix), f64::from(d)))
            })
            .unwrap_or(f64::NAN);
    }
    match text.strip_prefix(['+', '-']).unwrap_or(text) {
        "Infinity" if text.starts_with('-') => return f64::NEG_INFINITY,
        "Infinity" => return f64::INFINITY,
        _ => {}
    }
    let numeric = text
        .bytes()
        .all(|b| b.is_ascii_digit() || matches!(b, b'+' | b'-' | b'.' | b'e' | b'E'));
    if numeric {
        text.parse::<f64>().unwrap_or(f64::NAN)
    } else {
        f64::NAN
    }
}

/// Svelte's `list`: `a`, `a or b`, `a, b or c`.
pub(super) fn list(items: &[&str], conjunction: &str) -> String {
    match items {
        [only] => (*only).to_owned(),
        [first, second] => format!("{first} {conjunction} {second}"),
        [init @ .., last] => format!("{} {conjunction} {last}", init.join(", ")),
        [] => String::new(),
    }
}

/// `text.split(/[…]+/)`: the pieces between runs of separators, an empty piece at either end
/// when the text starts or ends with one.
pub(super) fn split_runs(
    text: &str,
    separator: impl Fn(char) -> bool,
) -> impl Iterator<Item = &str> {
    let mut rest = Some(text);
    std::iter::from_fn(move || {
        let current = rest?;
        let Some(at) = current.find(&separator) else {
            rest = None;
            return Some(current);
        };
        rest = Some(current[at..].trim_start_matches(&separator));
        Some(&current[..at])
    })
}

/// `validate_aria_attribute_value`: a static value that does not fit the property's type.
pub(super) fn aria_value(
    name: &str,
    kind: &str,
    allowed: &[&str],
    value: &Static<'_>,
    span: Span,
) -> Option<Diagnostic> {
    let value = match value {
        Static::Unknown => return None,
        Static::Bare => "",
        Static::Text(text) => text.as_ref(),
    };
    let quoted = || {
        let quoted: Vec<String> = allowed.iter().map(|v| format!("\"{v}\"")).collect();
        list(&quoted.iter().map(String::as_str).collect::<Vec<_>>(), "or")
    };
    let (code, message) = match kind {
        "id" | "string" if value.is_empty() => (
            "a11y_incorrect_aria_attribute_type",
            format!("The value of '{name}' must be a non-empty string"),
        ),
        "number" if value.is_empty() || number(value).is_nan() => (
            "a11y_incorrect_aria_attribute_type",
            format!("The value of '{name}' must be a number"),
        ),
        "boolean" if !matches!(value, "true" | "false") => (
            "a11y_incorrect_aria_attribute_type_boolean",
            format!("The value of '{name}' must be either 'true' or 'false'. It cannot be empty"),
        ),
        "idlist" if value.is_empty() => (
            "a11y_incorrect_aria_attribute_type_idlist",
            format!(
                "The value of '{name}' must be a space-separated list of strings that represent \
                    DOM element IDs"
            ),
        ),
        "integer" if value.is_empty() || !is_integer(number(value)) => (
            "a11y_incorrect_aria_attribute_type_integer",
            format!("The value of '{name}' must be an integer"),
        ),
        "token" if !allowed.contains(&value.to_lowercase().as_str()) => (
            "a11y_incorrect_aria_attribute_type_token",
            format!("The value of '{name}' must be exactly one of {}", quoted()),
        ),
        "tokenlist"
            if split_runs(&value.to_lowercase(), is_ecmascript_whitespace)
                .any(|token| !allowed.contains(&token)) =>
        {
            (
                "a11y_incorrect_aria_attribute_type_tokenlist",
                format!(
                    "The value of '{name}' must be a space-separated list of one or more of {}",
                    quoted()
                ),
            )
        }
        "tristate" if !matches!(value, "true" | "false" | "mixed") => (
            "a11y_incorrect_aria_attribute_type_tristate",
            format!("The value of '{name}' must be exactly one of true, false, or mixed"),
        ),
        _ => return None,
    };
    Some(super::super::warning(code, &message, span))
}

/// `Number.isInteger`.
fn is_integer(n: f64) -> bool {
    n.is_finite() && n.fract() == 0.0
}

/// `is_valid_autocomplete`.
pub(super) fn is_valid_autocomplete(value: &Static<'_>) -> bool {
    let text = match value {
        Static::Bare => return false,
        Static::Unknown => return true,
        Static::Text(text) if text.is_empty() => return true,
        Static::Text(text) => text,
    };
    let lowered = text.trim_matches(is_ecmascript_whitespace).to_lowercase();
    let tokens: Vec<&str> = split_runs(&lowered, is_ecmascript_whitespace).collect();
    let mut tokens = tokens.as_slice();
    skip(&mut tokens, &|t| t.starts_with("section-"));
    skip(&mut tokens, &|t| tables::ADDRESS_TYPE_TOKENS.contains(&t));
    if !skip(&mut tokens, &|t| {
        tables::AUTOFILL_FIELD_NAME_TOKENS.contains(&t)
    }) {
        skip(&mut tokens, &|t| tables::CONTACT_TYPE_TOKENS.contains(&t));
        if !skip(&mut tokens, &|t| {
            tables::AUTOFILL_CONTACT_FIELD_NAME_TOKENS.contains(&t)
        }) {
            return false;
        }
    }
    skip(&mut tokens, &|t| t == "webauthn");
    tokens.is_empty()
}

const fn is_word(c: char) -> bool {
    c.is_ascii_alphanumeric() || c == '_'
}

/// `/\b(image|picture|photo)\b/i`.
pub(super) fn redundant_alt(alt: &str) -> bool {
    let lowered = alt.to_ascii_lowercase();
    ["image", "picture", "photo"].iter().any(|word| {
        lowered.match_indices(word).any(|(at, _)| {
            let before = lowered[..at]
                .chars()
                .next_back()
                .is_none_or(|c| !is_word(c));
            let after = lowered[at + word.len()..]
                .chars()
                .next()
                .is_none_or(|c| !is_word(c));
            before && after
        })
    })
}

/// `/^\W*javascript:/i`.
pub(super) fn javascript_url(href: &str) -> bool {
    let rest = href.trim_start_matches(|c: char| !is_word(c));
    rest.get(..11)
        .is_some_and(|prefix| prefix.eq_ignore_ascii_case("javascript:"))
}

/// Drops the first token when it fits.
fn skip(tokens: &mut &[&str], when: &dyn Fn(&str) -> bool) -> bool {
    match tokens.first() {
        Some(first) if when(first) => {
            *tokens = &tokens[1..];
            true
        }
        _ => false,
    }
}
