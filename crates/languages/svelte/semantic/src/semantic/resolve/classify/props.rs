use rsvelte_kernel::source::index::IndexVector;
use rsvelte_typescript::scope::{BindingIdentifier, Semantic};
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};

use super::super::{BindingInformation, BindingKind, rune_call};

pub(super) fn classify_props(
    syntax_tree: &SyntaxTree,
    sem: &Semantic,
    pattern: NodeIdentifier,
    out: &mut IndexVector<BindingIdentifier, BindingInformation>,
) {
    match syntax_tree.kind(pattern) {
        Kind::Identifier(_) => {
            if let Some(b) = sem.binding_of(pattern) {
                out[b].kind = BindingKind::RestProperty;
            }
        }
        Kind::ObjectPattern(props) => {
            for &p in props {
                match syntax_tree.kind(p) {
                    Kind::Property { key, value, .. } => {
                        let (local, default) = match syntax_tree.kind(value) {
                            Kind::AssignPattern(l, r) => (l, Some(r)),
                            _ => (value, None),
                        };
                        let bindable = default
                            .and_then(|d| rune_call(syntax_tree, d))
                            .is_some_and(|(r, _)| r == "$bindable");
                        if let Some(b) = sem.binding_of(local) {
                            let info = &mut out[b];
                            info.kind = if bindable {
                                BindingKind::BindableProperty
                            } else {
                                BindingKind::Property
                            };
                            info.initial = if bindable {
                                default
                                    .and_then(|d| rune_call(syntax_tree, d))
                                    .and_then(|(_, a)| a)
                            } else {
                                default
                            };
                            info.prop_key = Some(key);
                            info.is_function = false;
                        }
                    }
                    Kind::Rest(arg) => {
                        if let Some(b) = sem.binding_of(arg) {
                            out[b].kind = BindingKind::RestProperty;
                        }
                    }
                    _ => {}
                }
            }
        }
        _ => {}
    }
}
