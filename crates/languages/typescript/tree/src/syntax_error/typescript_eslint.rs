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

/// The codes of TypeScript 6.0.3's parser and scanner, whose first error typescript-eslint throws
/// before it checks anything itself.
const PARSER_CODES: [u32; 141] = [
    1002, 1003, 1005, 1007, 1010, 1011, 1012, 1034, 1068, 1069, 1109, 1110, 1121, 1124, 1125, 1126,
    1127, 1128, 1129, 1130, 1131, 1132, 1134, 1135, 1136, 1137, 1138, 1139, 1140, 1142, 1144, 1145,
    1146, 1160, 1161, 1177, 1178, 1179, 1180, 1181, 1198, 1199, 1209, 1223, 1228, 1260, 1351, 1352,
    1353, 1357, 1359, 1369, 1381, 1382, 1385, 1386, 1387, 1388, 1389, 1390, 1433, 1434, 1435, 1436,
    1437, 1438, 1439, 1440, 1441, 1442, 1443, 1472, 1477, 1478, 1487, 1488, 1489, 1490, 1499, 1500,
    1501, 1502, 1503, 1504, 1505, 1506, 1507, 1508, 1509, 1510, 1511, 1512, 1513, 1514, 1515, 1516,
    1517, 1518, 1519, 1520, 1521, 1522, 1523, 1524, 1525, 1526, 1527, 1528, 1529, 1530, 1531, 1532,
    1533, 1534, 1535, 1536, 1537, 1538, 2427, 2457, 2657, 2754, 2809, 2819, 6188, 6189, 8033, 8034,
    8039, 17002, 17006, 17007, 17008, 17014, 17015, 17021, 18009, 18016, 18026, 18029, 18030,
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

/// The error of `errors`, oxc's in its order, that typescript-eslint throws.
///
/// It is the first of tsc's parser's errors, or else the first of the checks typescript-eslint
/// makes, unless an error whose code is unknown comes before it; `None` for no errors.
#[must_use]
pub fn typescript_eslint_error(errors: &[SyntaxError]) -> Option<&SyntaxError> {
    let at = |error: &&SyntaxError| error.diagnostic.span.start_offset;
    let first = |keep: &dyn Fn(u32) -> bool| {
        errors
            .iter()
            .filter(|error| error.typescript_code.is_some_and(keep))
            .min_by_key(at)
    };
    let thrown = first(&|code| PARSER_CODES.contains(&code))
        .or_else(|| first(&|code| MESSAGES.iter().any(|(number, _)| *number == code)));
    let unknown = errors
        .iter()
        .filter(|error| error.typescript_code.is_none())
        .min_by_key(at);
    match (thrown, unknown) {
        (Some(thrown), Some(unknown)) if at(&unknown) < at(&thrown) => Some(unknown),
        (Some(thrown), _) => Some(thrown),
        (None, unknown) => unknown.or_else(|| errors.first()),
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
