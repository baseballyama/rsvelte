//! Where acorn fails, or reads what oxc rejects, for a host that reports as acorn does.

use oxc_ast::AstType;
use oxc_diagnostics::OxcDiagnostic;
use oxc_parser::{Kind, Token};

use super::locator::{Find, Holder, Locator, Reading, locate};
use super::word::{Home, home};

mod arguments;
mod lexer;
mod number;
use arguments::{ARGUMENTS_IN_STATIC_BLOCK, in_static_block};
pub(crate) use lexer::lexer_failure;
pub(crate) use number::shorter_number;
use number::stops_after_number;

/// Whether a host reports `error`, in the part whose tree `visit` walks: not when its code is one
/// of `unchecked`, the rules the host's parser does not check, nor, for a host that reads
/// `as_acorn`, where acorn reads the text oxc rejects.
pub(crate) fn reported(
    error: &OxcDiagnostic,
    unchecked: &[&str],
    as_acorn: bool,
    visit: impl FnOnce(&mut Locator),
) -> bool {
    let number = (error.code.scope.as_deref() == Some("TS"))
        .then(|| error.code.number.as_deref())
        .flatten();
    if number.is_none() && error.message == ARGUMENTS_IN_STATIC_BLOCK {
        return !as_acorn || in_static_block(error, visit);
    }
    number.is_none_or(|number| {
        let accepted = as_acorn && acorn_accepts(error, number, visit);
        !(unchecked.contains(&number) || accepted)
    })
}

/// Whether acorn reads the text oxc rejects with `error`, whose code is `number`, without failing.
#[cold]
fn acorn_accepts(error: &OxcDiagnostic, number: &str, visit: impl FnOnce(&mut Locator)) -> bool {
    let Some(label) = error.labels.first() else {
        return false;
    };
    let (start, end) = (label.offset(), label.offset() + label.len());
    match number {
        "1047" => optional_rest(start, end, visit),
        // An `await` where acorn reads it as the keyword: an enum at the top level is one.
        "1308" => home(start, end, std::iter::empty(), visit).is_some_and(Home::awaits),
        // acorn-typescript reads any statement in an ambient namespace, which upstream then
        // refuses as a namespace with values, and checks the body of a function declaration only.
        "1036" => true,
        "1183" => locate(start, end, Find::Implementation, visit).is_none(),
        // acorn-typescript reads a class accessor without a body as a signature.
        "1005" => locate(start, end, Find::BodilessAccessor, visit).is_some(),
        // acorn checks a class's name only where the class is a declaration, and a parameter's
        // only where its function has a body; acorn-typescript checks no type parameter's.
        "1100" => locate(start, end, Find::UncheckedName, visit).is_some(),
        // In an ambient context acorn-typescript checks a variable's initializer once it has read
        // the declaration, as the tree's walk does, and a class field's only where its name is
        // public.
        "1039" => locate(start, end, Find::PublicFieldValue, visit).is_none(),
        // acorn-typescript checks no interface, public class member, enum member, nor parameter
        // of a signature or of a function without a body, and a type alias only against the
        // types before it.
        "2300" => {
            let Some(second) = error.labels.get(1) else {
                return false;
            };
            let second = (second.offset(), second.offset() + second.len());
            let locator = redeclared((start, end), second, visit);
            match locator.found {
                Some((
                    _,
                    AstType::TSInterfaceDeclaration
                    | AstType::PropertyDefinition
                    | AstType::MethodDefinition
                    | AstType::AccessorProperty
                    | AstType::TSEnumMember
                    | AstType::Function
                    | AstType::TSFunctionType
                    | AstType::TSConstructorType
                    | AstType::TSMethodSignature
                    | AstType::TSCallSignatureDeclaration
                    | AstType::TSConstructSignatureDeclaration,
                )) => true,
                Some((_, AstType::TSTypeAliasDeclaration)) => !locator.first_is_type,
                _ => false,
            }
        }
        _ => false,
    }
}

/// Where acorn stops for `error`, in the part whose text is `text` and whose tokens are `tokens`,
/// followed by the token after the part that ended it, and whose tree `visit` walks: at the
/// keyword of a type assertion, which acorn does not read, or after a number it reads shorter, so
/// that the expression before ends there. `None` for any other error, which oxc reports in its
/// own words.
#[cold]
pub(crate) fn acorn_stop(
    error: &OxcDiagnostic,
    text: &str,
    (tokens, next): (&[Token], Option<Token>),
    visit: impl FnOnce(&mut Locator),
) -> Option<u32> {
    let label = error.labels.first()?;
    let (start, end) = (label.offset(), label.offset() + label.len());
    let read = || tokens.iter().copied().chain(next);
    if error.code.scope.as_deref() != Some("TS") {
        return stops_after_number(error, text, start, read());
    }
    let keyword = match error.code.number.as_deref()? {
        "8016" => Kind::As,
        "8037" => Kind::Satisfies,
        _ => return None,
    };
    // oxc labels the whole assertion, and the operand's span leaves out its parentheses.
    let operand_end = locate(start, end, Find::OperandEnd, visit)?.0;
    read()
        .find(|token| token.start() >= operand_end && token.kind() == keyword)
        .map(|token| token.start())
}

/// Whether acorn reads the rest element whose `?` is `question..end` as an optional one.
fn optional_rest(question: u32, end: u32, visit: impl FnOnce(&mut Locator)) -> bool {
    let mut locator = Locator::new(question, end, Find::OptionalRest);
    visit(&mut locator);
    let around = locator.rest;
    let Some((_, holder)) = around.rest else {
        return false;
    };
    match (holder, around.reading) {
        // acorn reads an object pattern's rest as a name, which ends before the `?`.
        (Holder::Object, _) => false,
        (_, Reading::Type) | (Holder::Parameters, Reading::Arrow { is_async: false }) => true,
        (_, Reading::Arrow { .. }) => false,
        (_, Reading::Binding) => around.ambient,
    }
}

/// The walk for a name oxc labels at `first` and declares again at `second`.
fn redeclared(first: (u32, u32), second: (u32, u32), visit: impl FnOnce(&mut Locator)) -> Locator {
    let first = oxc_span::Span::new(first.0, first.1);
    let mut locator = Locator::new(second.0, second.1, Find::Redeclared(first));
    visit(&mut locator);
    locator
}
