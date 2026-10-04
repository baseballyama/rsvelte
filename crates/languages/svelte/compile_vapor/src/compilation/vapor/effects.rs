use rsvelte_kernel::source::positions::SourceLocation;
use rsvelte_typescript::copy::{Rewrite, copy};
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};

pub(super) fn lower(
    from: &SyntaxTree,
    program: NodeIdentifier,
    callbacks: &rustc_hash::FxHashMap<NodeIdentifier, NodeIdentifier>,
    order: &rustc_hash::FxHashMap<NodeIdentifier, usize>,
    cached_reads: &rustc_hash::FxHashSet<NodeIdentifier>,
) -> (SyntaxTree, NodeIdentifier) {
    let mut to = SyntaxTree::new();
    let program = copy(
        from,
        &mut to,
        &mut Effects {
            callbacks,
            order,
            cached_reads,
        },
        program,
    );
    (to, program)
}

struct Effects<'a> {
    callbacks: &'a rustc_hash::FxHashMap<NodeIdentifier, NodeIdentifier>,
    order: &'a rustc_hash::FxHashMap<NodeIdentifier, usize>,
    cached_reads: &'a rustc_hash::FxHashSet<NodeIdentifier>,
}

impl Rewrite for Effects<'_> {
    fn rewrite(
        &mut self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        let Kind::Block(statements) = from.kind(identifier) else {
            return None;
        };
        let effects: Vec<_> = statements
            .iter()
            .enumerate()
            .filter_map(|(index, &statement)| {
                dom_effect(from, statement, self.callbacks).map(|expression| (index, expression))
            })
            .collect();
        if effects.is_empty() {
            return None;
        }
        let last = statements.len()
            - usize::from(matches!(
                from.kind(statements[statements.len() - 1]),
                Kind::Return(_)
            ));
        let mut ordered = effects.clone();
        ordered.sort_by_key(|&(index, _)| {
            self.order
                .get(&statements[index])
                .copied()
                .unwrap_or(usize::MAX)
        });
        let mut reads = Vec::new();
        let mut seen = rustc_hash::FxHashSet::default();
        for &(_, expression) in &ordered {
            self.collect_reads(from, expression, &mut seen, &mut reads);
        }
        if reads.is_empty() && effects.len() == 1 && effects[0].0 + 1 == last {
            return None;
        }
        let calls: Vec<_> = reads
            .into_iter()
            .chain(ordered.iter().map(|&(_, expression)| expression))
            .map(|expression| {
                let expression = copy(from, to, self, expression);
                to.expression_statement(expression)
            })
            .collect();
        let block = to.block(&calls, SourceLocation::SYNTHETIC);
        let callback = to.arrow(&[], block, false, false, SourceLocation::SYNTHETIC);
        let callee = to.identifier("$$v_renderEffect");
        let call = to.call0(callee, &[callback]);
        let effect = to.expression_statement(call);
        let mut output = Vec::with_capacity(statements.len() - effects.len() + 1);
        let mut next = 0;
        for (index, &statement) in statements.iter().enumerate() {
            if index == last {
                output.push(effect);
            }
            if next < effects.len() && effects[next].0 == index {
                next += 1;
            } else {
                output.push(copy(from, to, self, statement));
            }
        }
        if last == statements.len() {
            output.push(effect);
        }
        Some(to.block(&output, from.source_location(identifier)))
    }
}

impl Effects<'_> {
    fn collect_reads(
        &self,
        tree: &SyntaxTree,
        node: NodeIdentifier,
        seen: &mut rustc_hash::FxHashSet<NodeIdentifier>,
        reads: &mut Vec<NodeIdentifier>,
    ) {
        if self.cached_reads.contains(&node) {
            if seen.insert(node) {
                reads.push(node);
            }
            return;
        }
        if let Some(&callback) = self.callbacks.get(&node) {
            self.collect_reads(tree, callback, seen, reads);
            return;
        }
        tree.for_each_child(node, |child| self.collect_reads(tree, child, seen, reads));
    }
}

fn dom_effect(
    tree: &SyntaxTree,
    statement: NodeIdentifier,
    callbacks: &rustc_hash::FxHashMap<NodeIdentifier, NodeIdentifier>,
) -> Option<NodeIdentifier> {
    let Kind::ExpressionStatement(call) = tree.kind(statement) else {
        return None;
    };
    let Kind::Call {
        callee, arguments, ..
    } = tree.kind(call)
    else {
        return None;
    };
    if !matches!(tree.kind(callee), Kind::Identifier(_))
        || tree.name(callee) != "$$v_renderEffect"
        || arguments.len() != 1
    {
        return None;
    }
    let Kind::Arrow {
        body,
        parameters,
        expression_body: true,
        ..
    } = tree.kind(arguments[0])
    else {
        return None;
    };
    if !parameters.is_empty() {
        return None;
    }
    dom_update(tree, body, callbacks).then_some(body)
}

fn dom_update(
    tree: &SyntaxTree,
    expression: NodeIdentifier,
    callbacks: &rustc_hash::FxHashMap<NodeIdentifier, NodeIdentifier>,
) -> bool {
    match tree.kind(expression) {
        Kind::Call {
            callee, arguments, ..
        } if matches!(tree.kind(callee), Kind::Identifier(_)) => {
            let name = tree.name(callee);
            if callbacks.contains_key(&callee) {
                return true;
            }
            if name == "$$tracked"
                && arguments.len() == 1
                && let Kind::Arrow {
                    body,
                    expression_body: true,
                    ..
                } = tree.kind(arguments[0])
            {
                return dom_update(tree, body, callbacks);
            }
            matches!(
                name,
                "$$v_setText"
                    | "$$v_setAttr"
                    | "$$v_setDOMProp"
                    | "$$v_setClass"
                    | "$$v_setStyle"
                    | "$$value"
            )
        }
        Kind::Assign(_, target, _) => {
            matches!(tree.kind(target), Kind::Member { property, computed: false, .. } if matches!(tree.name(property), "checked" | "selected"))
        }
        _ => false,
    }
}

pub(super) fn dom_callback(tree: &SyntaxTree, expression: NodeIdentifier) -> bool {
    let Kind::Arrow {
        body,
        expression_body: false,
        ..
    } = tree.kind(expression)
    else {
        return false;
    };
    let Kind::Block(statements) = tree.kind(body) else {
        return false;
    };
    if statements.len() != 1 {
        return false;
    }
    let Kind::If {
        consequent,
        alternate: None,
        ..
    } = tree.kind(statements[0])
    else {
        return false;
    };
    let Kind::Block(updates) = tree.kind(consequent) else {
        return false;
    };
    !updates.is_empty()
        && updates.iter().all(|&update| {
            let Kind::ExpressionStatement(call) = tree.kind(update) else {
                return false;
            };
            let Kind::Call { callee, .. } = tree.kind(call) else {
                return false;
            };
            matches!(tree.kind(callee), Kind::Identifier(_))
                && matches!(
                    tree.name(callee),
                    "$$set_class" | "$$style" | "$$styles" | "$$value" | "$$custom_element_data"
                )
        })
}
