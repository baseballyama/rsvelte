//! What typescript-eslint throws for a syntax error: tsc's message for most codes, its own for
//! the checks it makes itself. The codes it lets through, such as a duplicate declaration, are
//! not here.

use std::borrow::Cow;

use super::SyntaxError;

/// The message of a code, where `{0}` stands for the name or token oxc's message quotes. Those of
/// 1070, 1071, 1090, 2404, 2483 and 2499 are typescript-eslint's words, the others tsc's.
const MESSAGES: [(u32, &str); 28] = [
    (1005, "'{0}' expected."),
    (
        1024,
        "'readonly' modifier can only appear on a property declaration or index signature.",
    ),
    (1028, "Accessibility modifier already seen."),
    (
        1031,
        "'{0}' modifier cannot appear on class elements of this kind.",
    ),
    (1070, "'{0}' modifier cannot appear on a type member"),
    (1071, "'{0}' modifier cannot appear on an index signature"),
    (
        1090,
        "A parameter property is only allowed in a constructor implementation.",
    ),
    (1097, "'{0}' list cannot be empty."),
    (1098, "Type parameter list cannot be empty."),
    (1099, "Type argument list cannot be empty."),
    (1109, "Expression expected."),
    (1110, "Type expected."),
    (1161, "Unterminated regular expression literal."),
    (1172, "'extends' clause already seen."),
    (1173, "'extends' clause must precede 'implements' clause."),
    (1174, "Classes can only extend a single class."),
    (
        1176,
        "Interface declaration cannot have 'implements' clause.",
    ),
    (
        1242,
        "'abstract' modifier can only appear on a class, method, or property declaration.",
    ),
    (
        1245,
        "Method '{0}' cannot have an implementation because it is marked abstract.",
    ),
    (
        1275,
        "'accessor' modifier can only appear on a property declaration.",
    ),
    (1434, "Unexpected keyword or identifier."),
    (1435, "Unknown keyword or identifier. Did you mean '{0}'?"),
    (1489, "Decimals with leading zeros are not allowed."),
    (
        2369,
        "A parameter property is only allowed in a constructor implementation.",
    ),
    (
        2404,
        "The variable declaration of a 'for...in' statement cannot have a type annotation.",
    ),
    (2452, "An enum member cannot have a numeric name."),
    (
        2483,
        "The variable declaration of a 'for...of' statement cannot have a type annotation.",
    ),
    (
        2499,
        "Interface declaration can only extend an identifier/qualified name with optional type \
         arguments.",
    ),
];

/// oxc's message for a missing semicolon, the one 1005 that quotes no token.
const MISSING_SEMICOLON: &str =
    "Expected a semicolon or an implicit semicolon after a statement, but found none";

impl SyntaxError {
    /// typescript-eslint's message for this error, which it reports where oxc labels it; `None`
    /// for an error it does not throw on, or whose message this does not know.
    #[must_use]
    pub fn typescript_eslint_message(&self) -> Option<Cow<'static, str>> {
        let code = self.typescript_code?;
        let (_, template) = MESSAGES.iter().find(|(number, _)| *number == code)?;
        if !template.contains("{0}") {
            return Some(Cow::Borrowed(template));
        }
        let message = self.diagnostic.message.as_str();
        let argument = if code == 1005 && message == MISSING_SEMICOLON {
            ";"
        } else {
            first_quoted(message)?
        };
        Some(Cow::Owned(template.replace("{0}", argument)))
    }
}

/// The first part of `message` between a pair of `'` or of `` ` ``.
fn first_quoted(message: &str) -> Option<&str> {
    let (open, rest) = message
        .char_indices()
        .find(|&(_, c)| c == '\'' || c == '`')
        .map(|(at, c)| (c, &message[at + 1..]))?;
    rest.split_once(open).map(|(quoted, _)| quoted)
}

#[cfg(test)]
mod tests;
