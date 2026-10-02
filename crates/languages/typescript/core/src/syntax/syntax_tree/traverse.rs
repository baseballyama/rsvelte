use super::{Kind, NodeIdentifier, SyntaxTree};

impl SyntaxTree {
    /// Calls `f` on each direct child, in source order.
    #[expect(clippy::too_many_lines, reason = "one arm per node kind")]
    pub fn for_each_child(&self, identifier: NodeIdentifier, mut f: impl FnMut(NodeIdentifier)) {
        let mut each =
            |identifiers: &[NodeIdentifier]| Self::visit_present_nodes(identifiers, &mut f);
        match self.kind(identifier) {
            Kind::Program(l)
            | Kind::Block(l)
            | Kind::Array(l)
            | Kind::Object(l)
            | Kind::Sequence(l)
            | Kind::ObjectPattern(l)
            | Kind::ArrayPattern(l) => each(l),
            Kind::VariableDeclaration { declarations, .. } => each(declarations),
            Kind::Declarator {
                identifier,
                initializer,
            } => each(&[identifier, initializer.unwrap_or(NodeIdentifier::NONE)]),
            Kind::ExpressionStatement(e)
            | Kind::Spread(e)
            | Kind::Await(e)
            | Kind::Rest(e)
            | Kind::ExportNamed(e)
            | Kind::ExportDefault(e)
            | Kind::ImportDefault(e)
            | Kind::ImportNamespace(e)
            | Kind::Unary(_, e)
            | Kind::Update { arg: e, .. } => each(&[e]),
            Kind::Function {
                name,
                parameters,
                body,
                ..
            } => {
                each(&[name.unwrap_or(NodeIdentifier::NONE)]);
                each(parameters);
                each(&[body]);
            }
            Kind::Return(e) => each(&[e.unwrap_or(NodeIdentifier::NONE)]),
            Kind::If {
                test,
                consequent,
                alternate,
            } => each(&[test, consequent, alternate.unwrap_or(NodeIdentifier::NONE)]),
            Kind::For {
                initializer,
                test,
                update,
                body,
            } => each(&[
                initializer.unwrap_or(NodeIdentifier::NONE),
                test.unwrap_or(NodeIdentifier::NONE),
                update.unwrap_or(NodeIdentifier::NONE),
                body,
            ]),
            Kind::Import {
                specifiers, source, ..
            } => {
                each(specifiers);
                each(&[source]);
            }
            Kind::ImportNamed { imported, local } => each(&[imported, local]),
            Kind::Template {
                quasis,
                expressions,
            } => {
                Self::for_each_template_child(quasis, expressions, &mut each);
            }
            Kind::Property {
                key,
                value,
                shorthand,
                ..
            } => Self::for_each_property_child(key, value, shorthand, &mut each),
            Kind::Member {
                object, property, ..
            } => each(&[object, property]),
            Kind::Call {
                callee, arguments, ..
            }
            | Kind::New { callee, arguments } => {
                each(&[callee]);
                each(arguments);
            }
            Kind::Arrow {
                parameters, body, ..
            } => {
                each(parameters);
                each(&[body]);
            }
            Kind::Binary(_, l, r)
            | Kind::Logical(_, l, r)
            | Kind::Assign(_, l, r)
            | Kind::AssignPattern(l, r) => each(&[l, r]),
            Kind::Conditional {
                test,
                consequent,
                alternate,
            } => each(&[test, consequent, alternate]),
            // Types are not scope-visible: an interface's names never resolve as values.
            Kind::TypeScriptDeclaration
            | Kind::TypeScriptInterface { .. }
            | Kind::TypeScriptPropertySignature { .. }
            | Kind::Identifier(_)
            | Kind::Number(_)
            | Kind::String
            | Kind::Boolean(_)
            | Kind::Null
            | Kind::This
            | Kind::TemplateElement { .. }
            | Kind::Empty
            | Kind::Hole => {}
        }
    }

    pub(super) fn visit_present_nodes(
        identifiers: &[NodeIdentifier],
        visit: &mut impl FnMut(NodeIdentifier),
    ) {
        identifiers
            .iter()
            .copied()
            .filter(|child| !child.is_none())
            .for_each(visit);
    }

    pub(super) fn for_each_property_child(
        key: NodeIdentifier,
        value: NodeIdentifier,
        shorthand: bool,
        each: &mut impl FnMut(&[NodeIdentifier]),
    ) {
        if shorthand {
            each(&[value]);
        } else {
            each(&[key, value]);
        }
    }

    pub(super) fn for_each_template_child(
        quasis: &[NodeIdentifier],
        expressions: &[NodeIdentifier],
        each: &mut impl FnMut(&[NodeIdentifier]),
    ) {
        for (index, quasi) in quasis.iter().enumerate() {
            each(&[*quasi]);
            if let Some(expression) = expressions.get(index) {
                each(&[*expression]);
            }
        }
    }
}
