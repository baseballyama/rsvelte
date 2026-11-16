//! Whether the parser a host reads a script with after oxc throws on the errors oxc recovered
//! from in it.

use super::typescript_eslint::{checks, thrown};
use super::{SyntaxError, TYPESCRIPT_ESLINT_UNCHECKED, typescript_eslint_check};
use crate::{ProgramIdentifier, Tree};

/// A parser that reads a script oxc read.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Reader {
    /// typescript-estree, which typescript-eslint and Prettier's `typescript` parser use.
    TypescriptEstree,
    /// Prettier's `babel-ts`: Babel with its TypeScript plugin, where Prettier throws on every
    /// error Babel recovers from except a few of plain JavaScript's.
    BabelTypescript,
}

/// tsc's codes of errors oxc or the analysis reports, and whether `babel-ts` throws on each, as
/// Prettier 3.9.10 does.
const BABEL_TYPESCRIPT: [(u32, bool); 38] = [
    (1015, false),
    (1016, false),
    (1024, true),
    (1029, true),
    (1031, true),
    (1038, false),
    (1039, true),
    (1047, false),
    (1049, true),
    (1051, false),
    (1093, false),
    (1094, false),
    (1095, false),
    (1096, true),
    (1098, true),
    (1104, true),
    (1105, true),
    (1107, true),
    (1114, true),
    (1147, true),
    (1194, true),
    (1221, false),
    (1222, false),
    (1257, true),
    (1263, false),
    (1264, false),
    (1267, true),
    (1275, true),
    (1308, true),
    (1347, true),
    (2335, true),
    (2337, true),
    (2368, false),
    (2523, true),
    (2524, true),
    (2681, false),
    (18010, true),
    (18011, true),
];

/// Whether `babel-ts` throws on an error of `code`; `None` where that is not known.
#[must_use]
pub fn babel_typescript_throws(code: u32) -> Option<bool> {
    (BABEL_TYPESCRIPT.iter())
        .find(|(number, _)| *number == code)
        .map(|&(_, throws)| throws)
}

impl Reader {
    /// Whether it throws on `errors`, oxc's errors in `program` of `tree`, which oxc recovered;
    /// `None` where that is not known.
    #[must_use]
    pub fn throws(
        self,
        tree: &Tree,
        program: ProgramIdentifier,
        errors: &[SyntaxError],
    ) -> Option<bool> {
        let codes = (errors.iter())
            .map(|error| error.typescript_code)
            .collect::<Option<Vec<u32>>>()?;
        match self {
            Self::TypescriptEstree => {
                if codes.iter().any(|&code| thrown(code)) {
                    return Some(true);
                }
                let passes = |code: u32| {
                    checks(code)
                        || (TYPESCRIPT_ESLINT_UNCHECKED.iter())
                            .any(|number| number.parse() == Ok(code))
                };
                (codes.iter().all(|&code| passes(code)))
                    .then(|| typescript_eslint_check(tree, errors, [program]).is_some())
            }
            Self::BabelTypescript => {
                let verdicts: Vec<_> = codes
                    .iter()
                    .map(|&code| babel_typescript_throws(code))
                    .collect();
                if verdicts.contains(&Some(true)) {
                    Some(true)
                } else {
                    (!verdicts.contains(&None)).then_some(false)
                }
            }
        }
    }
}

#[cfg(test)]
mod tests;
