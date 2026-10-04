use rsvelte_kernel::source::index::TypedIndex;
use rsvelte_typescript::scope::DeclarationKind;
use rsvelte_typescript::{Kind, NodeIdentifier};

use super::globals::global_function;
use super::{Evaluator, Tree, Value, Values, add};
use crate::semantic::resolve::{BindingKind, rune_call};

impl<'a> Evaluator<'a> {
    fn resolve(
        &self,
        tree: Tree<'a>,
        e: NodeIdentifier,
    ) -> Option<rsvelte_typescript::scope::BindingIdentifier> {
        match tree {
            Tree::Source => self.res.sem.binding_of(e),
            Tree::Output(syntax_tree, scope) => self
                .source
                .atoms
                .lookup(syntax_tree.name(e))
                .and_then(|a| self.res.sem.lookup(scope, a)),
        }
    }

    pub(super) fn identifier(&mut self, tree: Tree<'a>, e: NodeIdentifier, values: &mut Values) {
        let Some((b, info)) = self.resolve(tree, e).map(|b| (b, self.res.bindings[b])) else {
            if self.syntax_tree(tree).name(e) == "undefined" {
                add(values, Value::Undefined);
            } else {
                add(values, Value::Unknown);
            }
            return;
        };
        let s = &self.res.sem.bindings[b];
        // Upstream: an `{#each}` index's initial value is the block, which evaluates to a number.
        if matches!(
            info.kind,
            BindingKind::StaticIndex | BindingKind::KeyedIndex
        ) {
            add(values, Value::AnyNumber);
            return;
        }
        let is_prop = matches!(
            info.kind,
            BindingKind::Property | BindingKind::BindableProperty | BindingKind::RestProperty
        );
        let updated = s.writes > 0 || s.mutations > 0;
        if !updated && !is_prop {
            match s.kind {
                DeclarationKind::Function => {
                    add(values, Value::AnyFunction);
                    return;
                }
                DeclarationKind::Variable | DeclarationKind::Let | DeclarationKind::Const => {
                    if let Some(initializer) = s.initializer(self.source) {
                        // Cycles follow bindings, not the acyclic expression tree.
                        if self.in_progress.insert(b.index()) {
                            self.eval_into(Tree::Source, initializer, values);
                            self.in_progress.remove(b.index());
                        } else {
                            add(values, Value::Unknown);
                        }
                        return;
                    }
                }
                DeclarationKind::Param | DeclarationKind::Import | DeclarationKind::Host => {}
            }
        }
        add(values, Value::Unknown);
    }

    pub(super) fn call(
        &mut self,
        tree: Tree<'a>,
        e: NodeIdentifier,
        arguments: &[NodeIdentifier],
        values: &mut Values,
    ) {
        let syntax_tree = self.syntax_tree(tree);
        if let Some((rune, arg)) =
            rune_call(syntax_tree, e).filter(|_| matches!(tree, Tree::Source))
        {
            // A rune only counts when its name is not shadowed (upstream `get_global_keypath`).
            match rune {
                "$state" | "$state.raw" | "$derived" => match arg {
                    Some(a) => self.eval_into(tree, a, values),
                    None => add(values, Value::Undefined),
                },
                "$derived.by" => match arg.map(|a| syntax_tree.kind(a)) {
                    Some(Kind::Arrow {
                        body,
                        expression_body: true,
                        ..
                    }) => self.eval_into(tree, body, values),
                    _ => add(values, Value::Unknown),
                },
                _ => add(values, Value::Unknown),
            }
            return;
        }
        let Kind::Call { callee, .. } = syntax_tree.kind(e) else {
            unreachable!("called on calls")
        };
        if let Some(path) = self.global_keypath(tree, callee)
            && let Some((kind, fold)) = global_function(path)
        {
            let mut inline = [Value::Undefined, Value::Undefined];
            let mut overflow = Vec::new();
            let known = if arguments.len() <= inline.len() {
                &mut inline[..arguments.len()]
            } else {
                overflow.resize_with(arguments.len(), || Value::Undefined);
                overflow.as_mut_slice()
            };
            let mut all_known = true;
            let mut has_bigint = false;
            for (&argument, value) in arguments.iter().zip(known.iter_mut()) {
                let evaluation = self.evaluate_inner(tree, argument);
                all_known &= evaluation.is_known();
                has_bigint |= matches!(evaluation.value(), Value::BigInt(_));
                *value = evaluation.into_value();
            }
            if path.0 == "Math" && has_bigint {
                add(values, Value::Unknown);
            } else if let Some(fold) = fold.filter(|_| all_known) {
                add(values, fold(known));
            } else {
                add(values, kind);
            }
            return;
        }
        add(values, Value::Unknown);
    }

    pub(super) fn global_keypath(
        &self,
        tree: Tree<'a>,
        e: NodeIdentifier,
    ) -> Option<(&'a str, Option<&'a str>)> {
        let syntax_tree = self.syntax_tree(tree);
        let (root, member) = match syntax_tree.kind(e) {
            Kind::Identifier(_) => (e, None),
            Kind::Member {
                object,
                property,
                computed: false,
                ..
            } if matches!(syntax_tree.kind(object), Kind::Identifier(_)) => {
                (object, Some(syntax_tree.name(property)))
            }
            _ => return None,
        };
        self.resolve(tree, root)
            .is_none()
            .then(|| (syntax_tree.name(root), member))
    }
}
