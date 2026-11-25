//! acorn-typescript's errors at a declaration: an implementation in an ambient context, a class
//! field's initializer and an import alias.

use std::borrow::Cow;

use oxc_ast::AstType;
use oxc_parser::{Kind, Token};

use super::super::Acorn;
use super::super::locator::{Find, Locator, locate};
use super::fails;

/// acorn-typescript's error for tsc's code `number`, at the declaration the label is in.
pub(super) fn declaration(
    number: &str,
    (start, end): (u32, u32),
    text: &str,
    tokens: impl Iterator<Item = Token>,
    visit: impl FnOnce(&mut Locator),
) -> Option<Acorn> {
    match number {
        "1183" => implementation(start, end, tokens, visit),
        "1392" => import_alias(start, end, tokens, visit),
        _ => field_initializer(number, (start, end), text, tokens, visit),
    }
}

/// acorn-typescript's error at a class field's initializer, in an ambient context (`1039`, whose
/// label is the value) or marked abstract (`1267`, whose label is the key). It reports both at
/// the `=`, and names a key that is not a plain name by its source in brackets.
fn field_initializer(
    number: &str,
    (start, end): (u32, u32),
    text: &str,
    tokens: impl Iterator<Item = Token>,
    visit: impl FnOnce(&mut Locator),
) -> Option<Acorn> {
    let value = match number {
        "1039" => start,
        _ => locate(start, end, Find::Initializer, visit)?.0,
    };
    let (mut previous, mut named) = (None::<Token>, false);
    for token in tokens.take_while(|token| token.start() < value) {
        if token.start() == start {
            named = token.kind().is_identifier_name()
                && previous.is_none_or(|previous| previous.kind() != Kind::LBrack);
        }
        previous = Some(token);
    }
    let at = previous?.start();
    if number == "1039" {
        return Some(fails(
            "Initializers are not allowed in ambient contexts.",
            at,
        ));
    }
    let key = text.get(start as usize..end as usize)?;
    let key = if named {
        Cow::Borrowed(key)
    } else {
        Cow::Owned(format!("[{key}]"))
    };
    Some(Acorn::Fails {
        message: Cow::Owned(format!(
            "Property '{key}' cannot have an initializer because it is marked abstract."
        )),
        at,
    })
}

/// acorn-typescript's error at a function declaration in an ambient context whose body is the
/// label, at its start: after `declare` for one an export declares, as acorn-typescript reads the
/// export's `declare` before the declaration.
fn implementation(
    start: u32,
    end: u32,
    mut tokens: impl Iterator<Item = Token>,
    visit: impl FnOnce(&mut Locator),
) -> Option<Acorn> {
    let (at, found) = locate(start, end, Find::Implementation, visit)?;
    let at = match found {
        AstType::ExportDeclaration => tokens.find(|token| token.start() > at)?.start(),
        _ => at,
    };
    Some(fails(
        "An implementation cannot be declared in ambient contexts.",
        at,
    ))
}

/// acorn-typescript's error at an import alias with `import type`: it reads the whole module
/// reference, and refuses it at its start before it reads the `;`.
fn import_alias(
    start: u32,
    end: u32,
    tokens: impl Iterator<Item = Token>,
    visit: impl FnOnce(&mut Locator),
) -> Option<Acorn> {
    let (at, _) = locate(start, end, Find::ModuleReference, visit)?;
    let reference = tokens.take_while(|token| token.start() < end);
    let last = reference
        .filter(|token| token.kind() != Kind::Semicolon)
        .last()?;
    Some(Acorn::FailsLater {
        message: Cow::Borrowed("An import alias can not use 'import type'."),
        at,
        raised: last.end(),
    })
}
