use rsvelte_typescript::copy::{Rewrite, copy};
use rsvelte_typescript::operators::BinaryOperator;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};

use super::SourceLocation;

const SYNTHETIC: SourceLocation = SourceLocation::SYNTHETIC;

#[derive(Clone, Copy)]
enum Mode {
    State,
    RawState,
    Derived { tracking: bool },
}

pub(crate) fn declaration(
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    rewrite: &mut impl Rewrite,
    pattern: NodeIdentifier,
    source: NodeIdentifier,
    rune: &str,
    tracking: bool,
) -> NodeIdentifier {
    let base = to.identifier(&format!("$$pattern_base_{}", pattern.index()));
    let mut declarations = vec![to.declarator(base, Some(source), SYNTHETIC)];
    let value = to.dot(base, "value");
    let mode = match rune {
        "$state" => Mode::State,
        "$state.raw" => Mode::RawState,
        "$derived" | "$derived.by" => Mode::Derived { tracking },
        _ => unreachable!("a checked rune value"),
    };
    lower(from, to, rewrite, pattern, value, mode, &mut declarations);
    to.var_declaration(
        rsvelte_typescript::syntax_tree::flag::CONST,
        &declarations,
        SYNTHETIC,
    )
}

fn lower(
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    rewrite: &mut impl Rewrite,
    pattern: NodeIdentifier,
    mut value: NodeIdentifier,
    mode: Mode,
    declarations: &mut Vec<NodeIdentifier>,
) {
    if let Kind::AssignPattern(target, fallback) = from.kind(pattern) {
        let input = to.identifier("$$pattern_default");
        let undefined = to.identifier("undefined");
        let test = to.binary(BinaryOperator::StrictEq, input, undefined, SYNTHETIC);
        let fallback = copy(from, to, rewrite, fallback);
        let result = to.cond(test, fallback, input, SYNTHETIC);
        let select = to.arrow(&[input], result, true, false, SYNTHETIC);
        value = to.call0(select, &[value]);
        let cell = intermediate(to, pattern, value, mode, declarations);
        lower(from, to, rewrite, target, cell, mode, declarations);
        return;
    }
    if let Kind::ArrayPattern(items) = from.kind(pattern) {
        let convert = to.identifier("$$destructure_array");
        let mut arguments = vec![value];
        if !items
            .last()
            .is_some_and(|&item| matches!(from.kind(item), Kind::Rest(_)))
        {
            arguments.push(to.write_number(
                f64::from(u32::try_from(items.len()).expect("patterns use u32 nodes")),
                SYNTHETIC,
            ));
        }
        value = to.call0(convert, &arguments);
    }
    if matches!(from.kind(pattern), Kind::Identifier(_)) {
        let cell = cell(to, value, mode);
        let name = to.ident(from.name(pattern), from.source_location(pattern));
        declarations.push(to.declarator(name, Some(cell), from.source_location(pattern)));
        return;
    }
    let parent = intermediate(to, pattern, value, mode, declarations);
    match from.kind(pattern) {
        Kind::ObjectPattern(properties) => {
            let mut excluded = Vec::new();
            for &property in properties {
                match from.kind(property) {
                    Kind::Property {
                        key,
                        value,
                        computed,
                        ..
                    } => {
                        let (key, exclusion) =
                            property_key(from, to, rewrite, key, computed, mode, declarations);
                        excluded.push(exclusion);
                        let value_read = to.member(parent, key, true, false, SYNTHETIC);
                        lower(from, to, rewrite, value, value_read, mode, declarations);
                    }
                    Kind::Rest(target) => {
                        let keys = to.array(&excluded, SYNTHETIC);
                        let rest = to.identifier("$$destructure_rest");
                        let value = to.call0(rest, &[parent, keys]);
                        lower(from, to, rewrite, target, value, mode, declarations);
                    }
                    _ => unreachable!("an object pattern has properties and rest"),
                }
            }
        }
        Kind::ArrayPattern(items) => {
            for (index, &item) in items.iter().enumerate() {
                if matches!(from.kind(item), Kind::Hole) {
                    continue;
                }
                let index = to.write_number(
                    f64::from(u32::try_from(index).expect("patterns use u32 nodes")),
                    SYNTHETIC,
                );
                let (target, value) = if let Kind::Rest(target) = from.kind(item) {
                    let slice = to.dot(parent, "slice");
                    (target, to.call0(slice, &[index]))
                } else {
                    (item, to.member(parent, index, true, false, SYNTHETIC))
                };
                lower(from, to, rewrite, target, value, mode, declarations);
            }
        }
        _ => unreachable!("a checked rune has a binding pattern"),
    }
}

fn property_key(
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    rewrite: &mut impl Rewrite,
    key: NodeIdentifier,
    computed: bool,
    mode: Mode,
    declarations: &mut Vec<NodeIdentifier>,
) -> (NodeIdentifier, NodeIdentifier) {
    if !computed && matches!(from.kind(key), Kind::Identifier(_)) {
        let key = to.write_string(from.name(key));
        return (key, key);
    }
    let value = copy(from, to, rewrite, key);
    if !computed {
        return (value, value);
    }
    let value = cell(to, value, mode);
    let name = to.identifier(&format!("$$pattern_key_{}", key.index()));
    declarations.push(to.declarator(name, Some(value), SYNTHETIC));
    let key = if computed {
        to.dot(name, "value")
    } else {
        name
    };
    let excluded = if computed {
        let string = to.identifier("String");
        to.call0(string, &[key])
    } else {
        key
    };
    (key, excluded)
}

fn intermediate(
    to: &mut SyntaxTree,
    pattern: NodeIdentifier,
    value: NodeIdentifier,
    mode: Mode,
    declarations: &mut Vec<NodeIdentifier>,
) -> NodeIdentifier {
    let name = to.identifier(&format!("$$pattern_{}", pattern.index()));
    let value = cell(to, value, mode);
    declarations.push(to.declarator(name, Some(value), SYNTHETIC));
    to.dot(name, "value")
}

fn cell(to: &mut SyntaxTree, value: NodeIdentifier, mode: Mode) -> NodeIdentifier {
    let (helper, value) = if let Mode::Derived { tracking } = mode {
        let value = super::emit::tracked(to, value, tracking);
        ("$$computed", to.arrow(&[], value, true, false, SYNTHETIC))
    } else {
        (
            if matches!(mode, Mode::State) {
                "$$ref"
            } else {
                "$$shallowRef"
            },
            value,
        )
    };
    let callee = to.identifier(helper);
    to.call0(callee, &[value])
}
