//! `this.x = $state(…)` in a constructor: a field the class stores a cell for.

use oxc_ast::ast::{
    AssignmentOperator, AssignmentTarget, Class, ClassElement, Expression, MethodDefinitionKind,
    PropertyKey, SimpleAssignmentTarget, Statement,
};
use oxc_ast_visit::{Visit, walk};
use oxc_semantic::NodeId;
use oxc_syntax::scope::ScopeFlags;

use super::{FxHashMap, FxHashSet, R, Resolution, Root, span_of, unsupported};

#[derive(Debug, Default)]
pub(super) struct Plan {
    /// By class: each field a constructor assigns a value rune to.
    pub classes: FxHashMap<NodeId, Vec<Field>>,
    /// The assignments of those fields.
    pub assignments: FxHashSet<NodeId>,
}

#[derive(Debug)]
pub(super) struct Field {
    pub assignment: NodeId,
    pub property: String,
    pub rune: &'static str,
}

pub(super) fn collect(res: &Resolution, root: &Root<'_>, plan: &mut Plan) -> R<()> {
    let mut v = Classes {
        res,
        plan,
        result: Ok(()),
    };
    root.visit(&mut v);
    v.result
}

struct Classes<'r> {
    res: &'r Resolution,
    plan: &'r mut Plan,
    result: R<()>,
}

impl<'a> Visit<'a> for Classes<'_> {
    fn visit_class(&mut self, it: &Class<'a>) {
        if self.result.is_ok() {
            self.result = self.class(it);
        }
        walk::walk_class(self, it);
    }
}

impl Classes<'_> {
    fn class(&mut self, class: &Class<'_>) -> R<()> {
        // Keys like `0 = $state()` are literals; `assignment` only matches `this.<identifier>`.
        let mut initialized = FxHashSet::default();
        for member in &class.body.body {
            if let ClassElement::PropertyDefinition(p) = member
                && p.value.is_some()
                && !p.computed
                && let Some(key) = key_name(&p.key)
            {
                initialized.insert(key);
            }
        }
        let mut fields = Vec::new();
        for member in &class.body.body {
            let ClassElement::MethodDefinition(m) = member else {
                continue;
            };
            if m.kind != MethodDefinitionKind::Constructor || m.r#static {
                continue;
            }
            let Some(body) = &m.value.body else { continue };
            for statement in &body.statements {
                if let Some((node, operator, property, rune)) = self.assignment(statement) {
                    if initialized.contains(&property) || operator != AssignmentOperator::Assign {
                        let Statement::ExpressionStatement(s) = statement else {
                            unreachable!()
                        };
                        return Err(unsupported(
                            "a rune after a class field's first assignment",
                            span_of(oxc_span::GetSpan::span(&s.expression)),
                        ));
                    }
                    self.plan.assignments.insert(node);
                    fields.push(Field {
                        assignment: node,
                        property,
                        rune,
                    });
                }
                let mut w = Writes(&mut initialized);
                w.visit_statement(statement);
            }
        }
        if !fields.is_empty() {
            self.plan.classes.insert(class.node_id.get(), fields);
        }
        Ok(())
    }

    fn assignment(
        &self,
        statement: &Statement<'_>,
    ) -> Option<(NodeId, AssignmentOperator, String, &'static str)> {
        let Statement::ExpressionStatement(s) = statement else {
            return None;
        };
        let Expression::AssignmentExpression(a) = &s.expression else {
            return None;
        };
        let property = this_property(&a.left)?;
        let (rune, _) = self
            .res
            .rune(&a.right)
            .filter(|(name, _)| super::runes::value(name))?;
        Some((a.node_id.get(), a.operator, property, rune))
    }
}

/// `x` of the target `this.x`, `#x` of `this.#x`.
fn this_property(target: &AssignmentTarget<'_>) -> Option<String> {
    match target {
        AssignmentTarget::StaticMemberExpression(m)
            if matches!(m.object, Expression::ThisExpression(_)) && !m.optional =>
        {
            Some(m.property.name.as_str().to_owned())
        }
        AssignmentTarget::PrivateFieldExpression(m)
            if matches!(m.object, Expression::ThisExpression(_)) && !m.optional =>
        {
            Some(format!("#{}", m.field.name))
        }
        _ => None,
    }
}

/// A field's name as the translation keys it: `x`, or `#x` for a private one.
pub(super) fn key_name(key: &PropertyKey<'_>) -> Option<String> {
    match key {
        PropertyKey::StaticIdentifier(id) => Some(id.name.as_str().to_owned()),
        PropertyKey::PrivateIdentifier(id) => Some(format!("#{}", id.name)),
        _ => None,
    }
}

/// The `this.x` a statement assigns or updates, outside nested functions and classes.
struct Writes<'s>(&'s mut FxHashSet<String>);

impl<'a> Visit<'a> for Writes<'_> {
    fn visit_assignment_target(&mut self, it: &AssignmentTarget<'a>) {
        if let Some(property) = this_property(it) {
            self.0.insert(property);
        }
        walk::walk_assignment_target(self, it);
    }

    fn visit_update_expression(&mut self, it: &oxc_ast::ast::UpdateExpression<'a>) {
        let target = match &it.argument {
            SimpleAssignmentTarget::StaticMemberExpression(m)
                if matches!(m.object, Expression::ThisExpression(_)) && !m.optional =>
            {
                Some(m.property.name.as_str().to_owned())
            }
            SimpleAssignmentTarget::PrivateFieldExpression(m)
                if matches!(m.object, Expression::ThisExpression(_)) && !m.optional =>
            {
                Some(format!("#{}", m.field.name))
            }
            _ => None,
        };
        self.0.extend(target);
        walk::walk_update_expression(self, it);
    }

    fn visit_function(&mut self, _: &oxc_ast::ast::Function<'a>, _: ScopeFlags) {}

    fn visit_arrow_function_expression(&mut self, _: &oxc_ast::ast::ArrowFunctionExpression<'a>) {}

    fn visit_class(&mut self, _: &Class<'a>) {}
}
