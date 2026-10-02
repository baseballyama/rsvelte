use super::{Formatter, Kind, Layout, LayoutInstructionIdentifier, NodeIdentifier};

impl Formatter<'_> {
    /// Prettier's `printAssignment`.
    pub(super) fn assignment(
        &mut self,
        left: LayoutInstructionIdentifier,
        op: LayoutInstructionIdentifier,
        right: LayoutInstructionIdentifier,
        target: NodeIdentifier,
        value: NodeIdentifier,
    ) -> LayoutInstructionIdentifier {
        match self.assignment_layout(target, value) {
            Layout::BreakAfterOperator => {
                let l = self.docs.group(&[left]);
                let line = self.docs.line();
                let r = self.cat(&[line, right]);
                let r = self.docs.indent(r);
                let r = self.docs.group(&[r]);
                self.docs.group(&[l, op, r])
            }
            Layout::NeverBreakAfterOperator => {
                let l = self.docs.group(&[left]);
                let sp = self.lit(" ");
                self.docs.group(&[l, op, sp, right])
            }
            Layout::BreakLhs => {
                let sp = self.lit(" ");
                let r = self.docs.group(&[right]);
                self.docs.group(&[left, op, sp, r])
            }
            Layout::Fluid => {
                let l = self.docs.group(&[left]);
                let identifier = self.docs.new_group_identifier();
                let line = self.docs.line();
                let indentation = self.docs.indent(line);
                let g = self.docs.group_with_identifier(&[indentation], identifier);
                let r = self.docs.indent_if_break(right, identifier);
                self.docs.group(&[l, op, g, r])
            }
            Layout::Unported => {
                let sp = self.lit(" ");
                let flat = self.cat(&[left, op, sp, right]);
                self.docs.flat_only(flat)
            }
        }
    }

    /// Prettier's `chooseLayout`. Its `canBreakLeftDoc` holds only for a non-empty destructuring
    /// pattern here, since types print as plain text.
    pub(super) fn assignment_layout(
        &self,
        target: NodeIdentifier,
        value: NodeIdentifier,
    ) -> Layout {
        let left_can_break = match self.syntax_tree.kind(target) {
            Kind::ObjectPattern(p) | Kind::ArrayPattern(p) => !p.is_empty(),
            _ => false,
        };
        let v = self.syntax_tree.kind(value);
        if matches!(v, Kind::Assign(..)) {
            return Layout::Unported;
        }
        if self.breaks_after_operator(value) {
            return Layout::BreakAfterOperator;
        }
        if self.complex_destructuring(target) {
            return Layout::BreakLhs;
        }
        match v {
            Kind::Arrow { .. } if left_can_break => Layout::BreakLhs,
            Kind::String | Kind::Sequence(_) => Layout::BreakAfterOperator,
            Kind::Conditional { test, .. } if self.breaks_after_operator(test) => {
                Layout::BreakAfterOperator
            }
            Kind::Unary(_, a) | Kind::Await(a) => match self.syntax_tree.kind(a) {
                Kind::String => Layout::BreakAfterOperator,
                Kind::Member { .. } | Kind::Call { .. } | Kind::New { .. } => Layout::Unported,
                _ => Layout::Fluid,
            },
            // `isPoorlyBreakableMemberOrCallChain` decides these.
            Kind::Member { .. } | Kind::Call { .. } | Kind::New { .. } => Layout::Unported,
            Kind::Template { .. } | Kind::Boolean(_) | Kind::Number(_) if !left_can_break => {
                Layout::NeverBreakAfterOperator
            }
            _ => Layout::Fluid,
        }
    }

    /// A binary or logical expression Prettier does not inline (`shouldInlineLogicalExpression`).
    pub(super) fn breaks_after_operator(&self, identifier: NodeIdentifier) -> bool {
        match self.syntax_tree.kind(identifier) {
            Kind::Binary(..) => true,
            Kind::Logical(_, _, r) => match self.syntax_tree.kind(r) {
                Kind::Object(p) => p.is_empty(),
                Kind::Array(e) => e.is_empty(),
                _ => true,
            },
            _ => false,
        }
    }

    /// Prettier's `isComplexDestructuringTarget`.
    pub(super) fn complex_destructuring(&self, target: NodeIdentifier) -> bool {
        let Kind::ObjectPattern(props) = self.syntax_tree.kind(target) else {
            return false;
        };
        props.len() > 2
            && props.iter().any(|&p| match self.syntax_tree.kind(p) {
                Kind::Property {
                    shorthand, value, ..
                } => !shorthand || matches!(self.syntax_tree.kind(value), Kind::AssignPattern(..)),
                _ => false,
            })
    }
}
