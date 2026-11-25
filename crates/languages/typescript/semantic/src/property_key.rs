use std::borrow::Cow;

use oxc_ast::ast::PropertyKey;
use oxc_str::JSStr;

/// A key's name as JavaScript reads it: an identifier's name, or `String(key.value)` for any
/// `ESTree` `Literal`, computed or not; `None` for a key only the running code can name.
#[must_use]
pub fn literal_key_name<'s>(key: &'s PropertyKey<'s>) -> Option<Cow<'s, str>> {
    Some(match key {
        PropertyKey::StaticIdentifier(identifier) => Cow::Borrowed(identifier.name.as_str()),
        PropertyKey::StaticStringLiteral(literal) | PropertyKey::StringLiteral(literal) => {
            string_value(literal.value)
        }
        PropertyKey::StaticNumericLiteral(literal) | PropertyKey::NumericLiteral(literal) => {
            Cow::Owned(crate::number::number(literal.value))
        }
        PropertyKey::StaticBigIntLiteral(literal) | PropertyKey::BigIntLiteral(literal) => {
            Cow::Borrowed(literal.value.as_str())
        }
        PropertyKey::BooleanLiteral(literal) => {
            Cow::Borrowed(if literal.value { "true" } else { "false" })
        }
        PropertyKey::NullLiteral(_) => Cow::Borrowed("null"),
        PropertyKey::RegExpLiteral(literal) => Cow::Owned(format!(
            "/{}/{}",
            literal.regex.pattern.text, literal.regex.flags
        )),
        _ => return None,
    })
}

/// A string literal's value; a lone surrogate prints as the replacement character.
#[must_use]
pub fn string_value(value: JSStr<'_>) -> Cow<'_, str> {
    value
        .as_str()
        .map_or_else(|| Cow::Owned(value.display().to_string()), Cow::Borrowed)
}
