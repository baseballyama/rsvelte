use oxc_ast::ast::{BindingPattern, PropertyKey};
use rsvelte_typescript_semantic::semantic::Semantic;

use super::super::{BindingInformation, BindingKind, runes};

pub(super) fn classify_props<'a>(
    semantic: &Semantic,
    subscribed: &runes::Subscriptions,
    pattern: &'a BindingPattern<'a>,
    out: &mut [BindingInformation<'a>],
) {
    let mut set = |identifier: &oxc_ast::ast::BindingIdentifier<'_>,
                   info: BindingInformation<'a>| {
        if let Some(symbol) = identifier.symbol_id.get() {
            out[symbol.index()] = BindingInformation {
                is_function: false,
                ..info
            };
        }
    };
    let rest = BindingInformation {
        kind: BindingKind::RestProperty,
        is_function: false,
        initial: None,
        prop_key: None,
    };
    match pattern {
        BindingPattern::BindingIdentifier(identifier) => set(identifier, rest),
        BindingPattern::ObjectPattern(object) => {
            for property in &object.properties {
                let (local, default) = match &property.value {
                    BindingPattern::AssignmentPattern(assignment) => {
                        (&assignment.left, Some(&assignment.right))
                    }
                    value => (value, None),
                };
                let BindingPattern::BindingIdentifier(local) = local else {
                    continue;
                };
                let bindable = default
                    .and_then(|d| runes::rune(semantic, subscribed, d))
                    .filter(|(r, _)| *r == "$bindable");
                let key: &'a PropertyKey<'a> = &property.key;
                set(
                    local,
                    BindingInformation {
                        kind: if bindable.is_some() {
                            BindingKind::BindableProperty
                        } else {
                            BindingKind::Property
                        },
                        is_function: false,
                        initial: match bindable {
                            Some((_, argument)) => argument,
                            None => default.map(|d| crate::typescript::without_typescript(d)),
                        },
                        prop_key: Some(key),
                    },
                );
            }
            if let Some(rest_element) = &object.rest
                && let BindingPattern::BindingIdentifier(identifier) = &rest_element.argument
            {
                set(identifier, rest);
            }
        }
        _ => {}
    }
}
