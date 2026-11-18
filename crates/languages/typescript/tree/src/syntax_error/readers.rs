//! Whether the parser a host reads a script with after oxc throws on the errors oxc recovered
//! from in it.

use oxc_ast::AstKind;
use oxc_ast::ast::{Program, Statement};
use oxc_ast_visit::Visit;
use oxc_parser::Kind;

use super::typescript_eslint::{checks, thrown};
use super::{SyntaxError, TYPESCRIPT_ESLINT_UNCHECKED, typescript_eslint_check};
use crate::acorn_grammar::bodies;
use crate::{ProgramIdentifier, Recorded, Tree};

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
/// Prettier 3.9.10 does. Where that depends on a pair of modifiers, the pair is in source order.
const BABEL_TYPESCRIPT: [(u32, Option<[Kind; 2]>, bool); 65] = [
    (1015, None, false),
    (1016, None, false),
    (1024, None, true),
    (1029, None, true),
    (1031, None, true),
    (1038, None, false),
    (1039, None, true),
    (1040, Some([Kind::Override, Kind::Declare]), true),
    (1047, None, false),
    (1049, None, true),
    (1051, None, false),
    (1093, None, false),
    (1094, None, false),
    (1095, None, false),
    (1096, None, true),
    (1098, None, true),
    (1100, None, false),
    (1101, None, false),
    (1102, None, false),
    (1104, None, true),
    (1105, None, true),
    (1107, None, true),
    (1108, None, false),
    (1111, None, false),
    (1114, None, true),
    (1117, None, true),
    (1121, None, false),
    (1127, None, true),
    (1147, None, true),
    (1194, None, true),
    (1212, None, false),
    (1221, None, false),
    (1222, None, false),
    (1243, Some([Kind::Abstract, Kind::Async]), false),
    (1243, Some([Kind::Abstract, Kind::Private]), false),
    (1243, Some([Kind::Abstract, Kind::Static]), true),
    (1243, Some([Kind::Accessor, Kind::Declare]), true),
    (1243, Some([Kind::Accessor, Kind::Readonly]), true),
    (1243, Some([Kind::Async, Kind::Abstract]), true),
    (1243, Some([Kind::Declare, Kind::Accessor]), false),
    (1243, Some([Kind::Declare, Kind::Override]), true),
    (1243, Some([Kind::Private, Kind::Abstract]), false),
    (1243, Some([Kind::Readonly, Kind::Accessor]), false),
    (1243, Some([Kind::Static, Kind::Abstract]), true),
    (1244, None, false),
    (1253, None, false),
    (1257, None, true),
    (1263, None, false),
    (1264, None, false),
    (1267, None, true),
    (1275, None, true),
    (1276, None, true),
    (1347, None, true),
    (1487, None, false),
    (1488, None, false),
    (2335, None, true),
    (2337, None, true),
    (2368, None, false),
    (2392, None, false),
    (2523, None, true),
    (2524, None, true),
    (2681, None, false),
    (18010, None, true),
    (18011, None, true),
    (18037, None, true),
];

/// Whether `babel-ts` throws on an error of `code`, whatever the modifiers; `None` where that is
/// not known.
#[must_use]
pub fn babel_typescript_throws(code: u32) -> Option<bool> {
    (BABEL_TYPESCRIPT.iter())
        .find(|(number, pair, _)| *number == code && pair.is_none())
        .map(|&(_, _, throws)| throws)
}

/// Whether typescript-estree throws on an error of `code` that oxc's analysis reports.
///
/// It throws only on the errors tsc's parser reports and the ones typescript-eslint checks; the
/// others are the binder's and the checker's.
#[must_use]
pub fn typescript_estree_throws(code: u32) -> bool {
    thrown(code)
}

/// Whether `babel-ts` throws on `error`, where `tokens` are the script's: for a code that depends
/// on a pair of modifiers, the pair in the run of modifiers that holds the error.
fn babel_typescript_throws_on(error: &SyntaxError, tokens: &[Recorded]) -> Option<bool> {
    // `await` outside an async function; Babel reads `await (…)` there as a call, but not
    // `for await (…)`.
    const AWAIT_OUTSIDE_ASYNC: u32 = 1308;
    let code = error.typescript_code?;
    let at = error.diagnostic.span.start_offset;
    let index = || {
        tokens
            .iter()
            .position(|token| token.span.start_offset == at)
    };
    if code == AWAIT_OUTSIDE_ASYNC {
        let index = index()?;
        let kind = |at: Option<usize>| at.and_then(|at| tokens.get(at)).and_then(|t| t.kind);
        let call = kind(Some(index + 1)) == Some(Kind::LParen)
            && kind(index.checked_sub(1)) != Some(Kind::For);
        return Some(!call);
    }
    if let Some(throws) = babel_typescript_throws(code) {
        return Some(throws);
    }
    let index = index()?;
    let modifier = |token: &Recorded| token.kind.is_some_and(Kind::is_modifier_kind);
    let start = index
        - tokens[..index]
            .iter()
            .rev()
            .take_while(|t| modifier(t))
            .count();
    let end = index + tokens[index..].iter().take_while(|t| modifier(t)).count();
    let run: Vec<Kind> = tokens[start..end]
        .iter()
        .filter_map(|token| token.kind)
        .collect();
    let before = |a: Kind, b: Kind| {
        let position = |kind| run.iter().position(|&k| k == kind);
        position(a).zip(position(b)).is_some_and(|(a, b)| a < b)
    };
    let mut verdicts = (BABEL_TYPESCRIPT.iter()).filter_map(|&(number, pair, throws)| {
        let [a, b] = pair?;
        (number == code && before(a, b)).then_some(throws)
    });
    let throws = verdicts.next()?;
    verdicts.all(|other| other == throws).then_some(throws)
}

/// Whether the function declaration that starts at `at` in `program` is async, where it is the
/// body of a statement and not in a block, which a module does not allow.
#[must_use]
pub fn function_as_body(program: &Program<'_>, at: u32) -> Option<bool> {
    struct Find {
        at: u32,
        found: Option<bool>,
    }
    impl<'a> Visit<'a> for Find {
        fn enter_node(&mut self, kind: AstKind<'a>) {
            // Only acorn's rule counts a `with` statement's body.
            if matches!(kind, AstKind::WithStatement(_)) {
                return;
            }
            for body in bodies(kind).into_iter().flatten() {
                if let Statement::FunctionDeclaration(function) = body
                    && function.span.start == self.at
                {
                    self.found = Some(function.r#async);
                }
            }
        }
    }
    let mut find = Find { at, found: None };
    find.visit_program(program);
    find.found
}

impl Reader {
    /// Whether it throws on `errors`, oxc's errors in `program` of `tree`, which oxc recovered
    /// and read as `tokens`; `None` where that is not known.
    #[must_use]
    pub fn throws(
        self,
        tree: &Tree,
        program: ProgramIdentifier,
        errors: &[&SyntaxError],
        tokens: &[Recorded],
    ) -> Option<bool> {
        // A function declared as a statement's body, which oxc reports without tsc's code, as
        // tsc reports nothing there: Babel throws only on an async one.
        let body = |error: &SyntaxError| {
            (error.typescript_code.is_none())
                .then(|| {
                    function_as_body(
                        tree.get_program(program),
                        error.diagnostic.span.start_offset,
                    )
                })
                .flatten()
        };
        let mut bodies = Vec::new();
        let mut others = Vec::new();
        for &error in errors {
            match body(error) {
                Some(is_async) => bodies.push(is_async),
                None => others.push(error),
            }
        }
        let errors = others.as_slice();
        if self == Self::BabelTypescript && bodies.contains(&true) {
            return Some(true);
        }
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
                (codes.iter().all(|&code| passes(code))).then(|| {
                    typescript_eslint_check(tree, errors.iter().copied(), [program]).is_some()
                })
            }
            Self::BabelTypescript => {
                let verdicts: Vec<_> = (errors.iter())
                    .map(|error| babel_typescript_throws_on(error, tokens))
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
