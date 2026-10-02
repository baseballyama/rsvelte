use super::{
    BinaryOperator, Formatter, Kind, NodeIdentifier, Op, Slot, UnaryOperator, mixes_nullish, op_of,
    should_flatten,
};

impl Formatter<'_> {
    /// The node an expression statement (or arrow body) starts with, when it must be wrapped in
    /// parentheses so it does not read as a block, a declaration or a destructuring statement.
    pub(super) fn leftmost_needing_parens(
        &self,
        e: NodeIdentifier,
        arrow_body: bool,
    ) -> Option<NodeIdentifier> {
        let mut cur = e;
        loop {
            match self.syntax_tree.kind(cur) {
                Kind::Object(_) => return Some(cur),
                Kind::Function { .. } if !arrow_body => return Some(cur),
                Kind::Member { object, .. } => cur = object,
                Kind::Call { callee, .. } => cur = callee,
                Kind::Binary(_, l, _) | Kind::Logical(_, l, _) => cur = l,
                Kind::Conditional { test, .. } => cur = test,
                Kind::Assign(_, l, _) => {
                    if !arrow_body && matches!(self.syntax_tree.kind(l), Kind::ObjectPattern(_)) {
                        return Some(cur);
                    }
                    cur = l;
                }
                Kind::Sequence(items) => cur = items[0],
                Kind::Update {
                    prefix: false, arg, ..
                } => cur = arg,
                _ => return None,
            }
        }
    }

    /// Prettier's `needsParens` for the node kinds this printer handles.
    pub(super) fn needs_parens(
        &self,
        identifier: NodeIdentifier,
        parent: NodeIdentifier,
        slot: Slot,
    ) -> bool {
        let pk = self.syntax_tree.kind(parent);
        let is_callee = slot == Slot::Callee;
        let is_object = slot == Slot::Object;
        let callee_or_object = matches!(pk, Kind::Call { .. } | Kind::New { .. }) && is_callee
            || matches!(pk, Kind::Member { .. }) && is_object;
        match self.syntax_tree.kind(identifier) {
            Kind::Sequence(_) => !matches!(pk, Kind::ExpressionStatement(_) | Kind::Sequence(_)),
            Kind::Assign(..) => match pk {
                Kind::ExpressionStatement(_)
                | Kind::Assign(..)
                | Kind::Sequence(_)
                | Kind::Declarator { .. }
                | Kind::Property { .. }
                | Kind::Array(_) => false,
                Kind::Arrow { .. } => slot == Slot::ArrowBody,
                Kind::Call { .. } | Kind::New { .. } => is_callee,
                _ => true,
            },
            Kind::Conditional { .. } => match pk {
                Kind::Unary(..)
                | Kind::Spread(_)
                | Kind::Binary(..)
                | Kind::Logical(..)
                | Kind::ExportDefault(_)
                | Kind::Await(_) => true,
                Kind::Conditional { .. } => slot == Slot::Test,
                _ => callee_or_object,
            },
            Kind::Arrow { .. } => match pk {
                Kind::Binary(..) | Kind::Logical(..) | Kind::Unary(..) | Kind::Await(_) => true,
                Kind::Conditional { .. } => slot == Slot::Test,
                _ => callee_or_object,
            },
            Kind::Function { .. } => callee_or_object,
            Kind::Unary(op, _) => match pk {
                Kind::Unary(pop, _) => {
                    op == pop && matches!(op, UnaryOperator::Plus | UnaryOperator::Neg)
                }
                Kind::Binary(BinaryOperator::Exp, ..) => slot == Slot::Left,
                _ => callee_or_object,
            },
            Kind::Update { prefix, op, .. } => match pk {
                Kind::Unary(pop, _) => {
                    prefix
                        && ((op.as_str() == "++" && pop == UnaryOperator::Plus)
                            || (op.as_str() == "--" && pop == UnaryOperator::Neg))
                }
                Kind::Binary(BinaryOperator::Exp, ..) => slot == Slot::Left,
                _ => callee_or_object,
            },
            Kind::Await(_) => match pk {
                Kind::Binary(BinaryOperator::Exp, ..) => slot == Slot::Left,
                _ => callee_or_object,
            },
            Kind::Binary(..) | Kind::Logical(..) => {
                let no = op_of(self.syntax_tree, identifier).expect("binaryish");
                match pk {
                    Kind::Unary(..) | Kind::Spread(_) | Kind::Await(_) => true,
                    Kind::Binary(..) | Kind::Logical(..) => {
                        let po = op_of(self.syntax_tree, parent).expect("binaryish");
                        if mixes_nullish(po, no) {
                            return true;
                        }
                        let (pp, np) = (po.precedence(), no.precedence());
                        if pp > np || (slot == Slot::Right && pp == np) {
                            return true;
                        }
                        if pp == np && !should_flatten(po, no) {
                            return true;
                        }
                        if pp < np && no == Op::Bin(BinaryOperator::Remainder) {
                            return matches!(
                                po,
                                Op::Bin(BinaryOperator::Add | BinaryOperator::Sub)
                            );
                        }
                        po.is_bitwise()
                    }
                    _ => callee_or_object,
                }
            }
            _ => false,
        }
    }
}
