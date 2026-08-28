//! AST/span based ownership-validation wrapping for prop mutations.

use std::cell::RefCell;
use std::fmt::Write as _;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::{Visit, walk};
use oxc_parser::ParseOptions;
use oxc_span::{GetSpan, SourceType, Span};

use super::ast_rewrite::{self, Edit};
use super::props_transforms::{PropMutationScan, PropMutationSites};

thread_local! {
    static PROP_MUTATION_VALIDATION_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

pub(super) fn wrap_prop_mutation_validation_ast(
    generated: &str,
    prop_vars: &[(String, Option<String>)],
    source: &str,
) -> Option<String> {
    if prop_vars.is_empty() {
        return Some(generated.to_string());
    }
    ast_rewrite::with_program(
        &PROP_MUTATION_VALIDATION_ALLOC,
        generated,
        SourceType::mjs(),
        ParseOptions::default(),
        |program| {
            let scan = PropMutationScan::new(source);
            let sites = prop_vars
                .iter()
                .map(|(name, alias)| {
                    (
                        name.clone(),
                        alias.clone(),
                        PropMutationSites::collect(source, name, &scan),
                    )
                })
                .collect();
            let mut collector = Collector {
                generated,
                source,
                prop_vars,
                sites,
                edits: Vec::new(),
                skip: Vec::new(),
                skip_calls: Vec::new(),
                ownership: Vec::new(),
            };
            collector.visit_program(program);
            ast_rewrite::splice(generated, collector.edits, false)
                .or_else(|| Some(generated.to_string()))
        },
    )
}

struct Collector<'a> {
    generated: &'a str,
    source: &'a str,
    prop_vars: &'a [(String, Option<String>)],
    sites: Vec<(String, Option<String>, PropMutationSites)>,
    edits: Vec<Edit>,
    skip: Vec<Span>,
    skip_calls: Vec<Span>,
    ownership: Vec<Span>,
}

impl<'a> Collector<'a> {
    fn prop(&self, name: &str) -> Option<&Option<String>> {
        self.prop_vars
            .iter()
            .find_map(|(candidate, alias)| (candidate == name).then_some(alias))
    }

    fn root_and_path(&self, target: &AssignmentTarget<'_>) -> Option<(String, Vec<String>)> {
        let (expression, tail) = match target {
            AssignmentTarget::StaticMemberExpression(member) => {
                (&member.object, format!("'{}'", member.property.name))
            }
            AssignmentTarget::ComputedMemberExpression(member) => {
                let span = member.expression.span();
                (
                    &member.object,
                    self.generated[span.start as usize..span.end as usize].to_string(),
                )
            }
            _ => return None,
        };
        let (root, mut path) = self.expression_root_and_path(expression)?;
        path.push(tail);
        Some((root, path))
    }

    fn simple_target_root_and_path(
        &self,
        target: &SimpleAssignmentTarget<'_>,
    ) -> Option<(String, Vec<String>)> {
        let (expression, tail) = match target {
            SimpleAssignmentTarget::StaticMemberExpression(member) => {
                (&member.object, format!("'{}'", member.property.name))
            }
            SimpleAssignmentTarget::ComputedMemberExpression(member) => {
                let span = member.expression.span();
                (
                    &member.object,
                    self.generated[span.start as usize..span.end as usize].to_string(),
                )
            }
            _ => return None,
        };
        let (root, mut path) = self.expression_root_and_path(expression)?;
        path.push(tail);
        Some((root, path))
    }

    fn expression_root_and_path(
        &self,
        expression: &Expression<'_>,
    ) -> Option<(String, Vec<String>)> {
        let mut current = expression;
        let mut path = Vec::new();
        loop {
            match current {
                Expression::StaticMemberExpression(member) => {
                    path.push(format!("'{}'", member.property.name));
                    current = &member.object;
                }
                Expression::ComputedMemberExpression(member) => {
                    let span = member.expression.span();
                    path.push(self.generated[span.start as usize..span.end as usize].to_string());
                    current = &member.object;
                }
                Expression::CallExpression(call) if call.arguments.is_empty() => {
                    let Expression::Identifier(identifier) = &call.callee else {
                        return None;
                    };
                    path.reverse();
                    return Some((identifier.name.to_string(), path));
                }
                _ => return None,
            }
        }
    }

    fn location(&mut self, name: &str, path: &[String], expression: &str) -> (usize, usize) {
        let static_path = path
            .iter()
            .map(|part| {
                part.strip_prefix('\'')
                    .and_then(|part| part.strip_suffix('\''))
                    .map(str::to_string)
            })
            .collect::<Option<Vec<_>>>();
        self.sites
            .iter_mut()
            .find(|(candidate, _, _)| candidate == name)
            .and_then(|(_, _, sites)| sites.take(static_path.as_deref(), expression))
            .unwrap_or_else(|| {
                super::props_transforms::find_prop_mutation_location(self.source, name)
            })
    }

    fn wrap(&mut self, span: Span, name: String, path: Vec<String>) {
        if self
            .ownership
            .iter()
            .any(|outer| outer.start <= span.start && span.end <= outer.end)
        {
            return;
        }
        let Some(alias) = self.prop(&name).cloned() else {
            return;
        };
        let original_expression =
            self.generated[span.start as usize..span.end as usize].to_string();
        let (line, column) = self.location(&name, &path, &original_expression);
        let mut expression = original_expression;

        // The traversal is child-first, so fold already-wrapped descendants into this
        // replacement. Leaving overlapping edits for `splice` would apply the outer edit
        // with offsets from the unmodified program and corrupt the generated JavaScript.
        let mut inner = Vec::new();
        self.edits.retain(|edit| {
            if edit.0 >= span.start && edit.1 <= span.end {
                inner.push(edit.clone());
                false
            } else {
                true
            }
        });
        inner.sort_by_key(|edit| std::cmp::Reverse(edit.0));
        for (start, end, replacement) in inner {
            expression.replace_range(
                (start - span.start) as usize..(end - span.start) as usize,
                &replacement,
            );
        }
        let alias = alias.map_or_else(|| "null".to_string(), |value| format!("'{value}'"));
        let mut replacement = format!(
            "$$ownership_validator.mutation({}, ['{}', {}], {}",
            alias,
            name,
            path.join(", "),
            expression,
        );
        if line > 0 {
            let _ = write!(replacement, ", {line}, {column}");
        }
        replacement.push(')');
        self.edits.push((span.start, span.end, replacement));
    }

    fn setter_path(
        &self,
        expression: &Expression<'_>,
    ) -> Option<(Span, Span, String, Vec<String>)> {
        let Expression::CallExpression(call) = expression else {
            return None;
        };
        if call.arguments.len() != 2 {
            return None;
        }
        let Expression::Identifier(callee) = &call.callee else {
            return None;
        };
        self.prop(callee.name.as_str())?;
        let Argument::BooleanLiteral(flag) = &call.arguments[1] else {
            return None;
        };
        if !flag.value {
            return None;
        }
        let Argument::AssignmentExpression(assignment) = &call.arguments[0] else {
            return None;
        };
        let (name, path) = self.root_and_path(&assignment.left)?;
        Some((call.span, assignment.span, name, path))
    }

    fn sequence_span(&self, span: Span) -> Span {
        let start = self.generated[..span.start as usize].trim_end().len();
        let end = span.end as usize
            + (self.generated[span.end as usize..].len()
                - self.generated[span.end as usize..].trim_start().len());
        if self.generated.as_bytes().get(start.wrapping_sub(1)) == Some(&b'(')
            && self.generated.as_bytes().get(end) == Some(&b')')
        {
            Span::new((start - 1) as u32, (end + 1) as u32)
        } else {
            span
        }
    }
}

impl<'a, 'ast> Visit<'ast> for Collector<'a> {
    fn visit_call_expression(&mut self, call: &CallExpression<'ast>) {
        if let Expression::StaticMemberExpression(member) = &call.callee
            && member.property.name == "mutation"
        {
            self.ownership.push(call.span);
        }

        if self.skip_calls.contains(&call.span) {
            walk::walk_call_expression(self, call);
            return;
        }

        let setter = if call.arguments.len() == 2
            && let Expression::Identifier(callee) = &call.callee
            && self.prop(callee.name.as_str()).is_some()
            && let Argument::BooleanLiteral(flag) = &call.arguments[1]
            && flag.value
        {
            match &call.arguments[0] {
                Argument::AssignmentExpression(assignment) => {
                    self.skip.push(assignment.span);
                    self.root_and_path(&assignment.left)
                }
                Argument::UpdateExpression(update) => {
                    self.skip.push(update.span);
                    self.simple_target_root_and_path(&update.argument)
                }
                _ => None,
            }
        } else {
            None
        };
        walk::walk_call_expression(self, call);
        if let Some((name, path)) = setter {
            self.wrap(call.span, name, path);
        }
    }

    fn visit_sequence_expression(&mut self, sequence: &SequenceExpression<'ast>) {
        let setter = sequence
            .expressions
            .iter()
            .find_map(|expression| self.setter_path(expression));
        if let Some((call_span, assignment_span, _, _)) = &setter {
            self.skip_calls.push(*call_span);
            self.skip.push(*assignment_span);
        }
        walk::walk_sequence_expression(self, sequence);
        if let Some((_, _, name, path)) = setter {
            self.wrap(self.sequence_span(sequence.span), name, path);
        }
    }

    fn visit_assignment_expression(&mut self, assignment: &AssignmentExpression<'ast>) {
        walk::walk_assignment_expression(self, assignment);
        if self.skip.contains(&assignment.span) {
            return;
        }
        if let Some((name, path)) = self.root_and_path(&assignment.left) {
            self.wrap(assignment.span, name, path);
        }
    }

    fn visit_update_expression(&mut self, update: &UpdateExpression<'ast>) {
        walk::walk_update_expression(self, update);
        if self.skip.contains(&update.span) {
            return;
        }
        if let Some((name, path)) = self.simple_target_root_and_path(&update.argument) {
            self.wrap(update.span, name, path);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::wrap_prop_mutation_validation_ast;

    #[test]
    fn wraps_legacy_setter_without_scanning_its_arguments() {
        let source = "<script>\nexport let item;\nitem.name = /[,)]/.test(`x${key}`);\n</script>";
        let props = vec![("item".to_string(), Some("item".to_string()))];
        assert_eq!(
            wrap_prop_mutation_validation_ast(
                "item(item().name = /[,)]/.test(`x${key}`), true);",
                &props,
                source,
            ),
            Some("$$ownership_validator.mutation('item', ['item', 'name'], item(item().name = /[,)]/.test(`x${key}`), true), 3, 0);".to_string()),
        );
    }

    #[test]
    fn wraps_runes_computed_member_assignment() {
        let source = "<script>\nlet { item } = $props();\nitem[`${key}`] = value;\n</script>";
        let props = vec![("item".to_string(), Some("item".to_string()))];
        let output =
            wrap_prop_mutation_validation_ast("item()[`${key}`] = value;", &props, source).unwrap();
        assert!(output.starts_with(
            "$$ownership_validator.mutation('item', ['item', `${key}`], item()[`${key}`] = value"
        ));
    }

    #[test]
    fn ignores_plain_prop_member_assignments() {
        let output = wrap_prop_mutation_validation_ast(
            "item.value = value;",
            &[("item".to_string(), Some("item".to_string()))],
            "<script>let { item = $bindable() } = $props(); item.value = value;</script>",
        )
        .unwrap();
        assert_eq!(output, "item.value = value;");
    }

    #[test]
    fn composes_nested_prop_setter_mutations() {
        let source = "<script>\nexport let props;\nprops.createDrawing = async () => {\n  props.drawings = [1];\n};\n</script>";
        let output = wrap_prop_mutation_validation_ast(
            "props(props().createDrawing = async () => { props(props().drawings = [1], true); }, true);",
            &[("props".to_string(), None)],
            source,
        )
        .unwrap();

        assert_eq!(
            output,
            "$$ownership_validator.mutation(null, ['props', 'createDrawing'], props(props().createDrawing = async () => { $$ownership_validator.mutation(null, ['props', 'drawings'], props(props().drawings = [1], true), 4, 2); }, true), 3, 0);",
        );
    }

    #[test]
    fn repeated_rhs_words_do_not_steal_an_earlier_mutation_location() {
        let source = "<script>\nexport let filter;\nconst targets = new Set();\nfilter.value = filter.value.filter((p) => targets.has(p));\nfilter.value = filter.value.filter((p) => value ? p !== value.id : p != null);\n</script>";
        let output = wrap_prop_mutation_validation_ast(
            "filter(filter().value = filter().value.filter((p) => targets.has(p)), true);\nfilter(filter().value = filter().value.filter((p) => value ? p !== value.id : p != null), true);",
            &[("filter".to_string(), None)],
            source,
        )
        .unwrap();

        assert!(output.contains("targets.has(p)), true), 4, 0)"));
        assert!(output.contains("p != null), true), 5, 0)"));
    }

    #[test]
    fn locates_parenthesized_typescript_assertion_targets() {
        let source = "<script lang=\"ts\">\nexport let step;\nlet params = step.params;\n(step.params as any) = params;\n</script>";
        let output = wrap_prop_mutation_validation_ast(
            "step(step().params = params, true);",
            &[("step".to_string(), None)],
            source,
        )
        .unwrap();

        assert!(output.ends_with(", 4, 0);"));
    }

    #[test]
    fn locates_typescript_assertions_before_member_accesses() {
        let source = "<script lang=\"ts\">\nexport let result;\nexport let step;\nlet key = 'done';\n(result as any)[key] = true;\n(step.params as any)._id = 'next';\n</script>";
        let output = wrap_prop_mutation_validation_ast(
            "result(result()[key] = true, true);\nstep(step().params._id = 'next', true);",
            &[("result".to_string(), None), ("step".to_string(), None)],
            source,
        )
        .unwrap();

        assert!(output.contains("result()[key] = true, true), 5, 0)"));
        assert!(output.contains("step().params._id = 'next', true), 6, 0)"));
    }
}
