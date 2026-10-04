use rsvelte_typescript::operators::AssignmentOperator;
use rsvelte_typescript::syntax_tree::Class;

use super::{
    FxHashMap, FxHashSet, Kind, NodeIdentifier, R, SyntaxTree, rune_call, span, unsupported, walk,
};

#[derive(Debug, Default)]
pub(super) struct Plan {
    pub classes: FxHashMap<NodeIdentifier, Vec<Field>>,
    pub assignments: FxHashSet<NodeIdentifier>,
}

#[derive(Debug)]
pub(super) struct Field {
    pub assignment: NodeIdentifier,
    pub property: NodeIdentifier,
    pub rune: &'static str,
}

pub(super) fn collect(tree: &SyntaxTree, root: NodeIdentifier, plan: &mut Plan) -> R<()> {
    walk(tree, root, &mut |node| {
        let Kind::Class(Class::Definition { members, .. }) = tree.kind(node) else {
            return Ok(());
        };
        let mut initialized = FxHashSet::default();
        for &member in members {
            if let Kind::Class(Class::Field {
                key,
                value: Some(_),
                computed: false,
                ..
            }) = tree.kind(member)
            {
                initialized.insert(tree.name(key));
            }
        }
        let mut fields = Vec::new();
        for &member in members {
            let Kind::Class(Class::Method {
                key,
                function,
                computed: false,
                is_static: false,
                ..
            }) = tree.kind(member)
            else {
                continue;
            };
            if tree.name(key) != "constructor" {
                continue;
            }
            let Kind::Function { body, .. } = tree.kind(function) else {
                unreachable!()
            };
            let Kind::Block(statements) = tree.kind(body) else {
                unreachable!()
            };
            for &statement in statements {
                if let Some((expression, operator, property, rune)) = assignment(tree, statement) {
                    if initialized.contains(tree.name(property))
                        || operator != AssignmentOperator::Assign
                    {
                        return Err(unsupported(
                            "a rune after a class field's first assignment",
                            span(tree, expression),
                        ));
                    }
                    plan.assignments.insert(expression);
                    fields.push(Field {
                        assignment: expression,
                        property,
                        rune,
                    });
                }
                writes(tree, statement, &mut initialized);
            }
        }
        if !fields.is_empty() {
            plan.classes.insert(node, fields);
        }
        Ok(())
    })
}

fn assignment(
    tree: &SyntaxTree,
    statement: NodeIdentifier,
) -> Option<(
    NodeIdentifier,
    AssignmentOperator,
    NodeIdentifier,
    &'static str,
)> {
    let Kind::ExpressionStatement(expression) = tree.kind(statement) else {
        return None;
    };
    let Kind::Assign(operator, target, value) = tree.kind(expression) else {
        return None;
    };
    let property = property(tree, target)?;
    let (rune, _) = rune_call(tree, value).filter(|(name, _)| super::runes::value(name))?;
    Some((expression, operator, property, rune))
}

fn property(tree: &SyntaxTree, target: NodeIdentifier) -> Option<NodeIdentifier> {
    let Kind::Member {
        object,
        property,
        computed: false,
        optional: false,
    } = tree.kind(target)
    else {
        return None;
    };
    (matches!(tree.kind(object), Kind::This) && matches!(tree.kind(property), Kind::Identifier(_)))
        .then_some(property)
}

fn writes<'a>(tree: &'a SyntaxTree, root: NodeIdentifier, initialized: &mut FxHashSet<&'a str>) {
    let mut stack = vec![root];
    while let Some(node) = stack.pop() {
        let target = match tree.kind(node) {
            Kind::Assign(_, target, _) | Kind::Update { arg: target, .. } => Some(target),
            Kind::Function { .. } | Kind::Arrow { .. } | Kind::Class(Class::Definition { .. }) => {
                continue;
            }
            _ => None,
        };
        if let Some(property) = target.and_then(|target| property(tree, target)) {
            initialized.insert(tree.name(property));
        }
        tree.for_each_child(node, |child| stack.push(child));
    }
}
