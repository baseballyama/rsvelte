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

/// Whether `expression` is exactly the compiler-generated identifier `name`.
fn is_generated_root(expression: &Expression<'_>, name: &str) -> bool {
    matches!(expression, Expression::Identifier(root) if root.name == name)
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
            AssignmentTarget::ComputedMemberExpression(member) => (
                &member.object,
                self.computed_path_element(&member.expression)?,
            ),
            _ => return None,
        };
        let (root, mut path) = self.expression_root_and_path(expression)?;
        path.push(tail);
        Some((root, path))
    }

    /// The path element a computed access contributes, or `None` where upstream
    /// bails out of the whole wrap.
    ///
    /// Upstream tests the *source* property and accepts only a `Literal` or an
    /// `Identifier`; by the time this pass runs, an identifier has been through
    /// its read transform, so it is also a call (`k()`, `$s()`, `$.get(i)`) or a
    /// `$$props` member. A binary, template-literal or plain member key reaches
    /// none of those, which is how `item[a.b] = v` stays unwrapped.
    fn computed_path_element(&self, expression: &Expression<'_>) -> Option<String> {
        let readable = match expression {
            Expression::Identifier(_) => true,
            Expression::CallExpression(call) => match &call.callee {
                Expression::Identifier(_) => call.arguments.is_empty(),
                Expression::StaticMemberExpression(member) => {
                    is_generated_root(&member.object, "$")
                }
                _ => false,
            },
            // A non-bindable runes prop reads as `$$props.name`, which a source
            // member key cannot spell: `$$` is reserved.
            Expression::StaticMemberExpression(member) => {
                is_generated_root(&member.object, "$$props")
                    || is_generated_root(&member.object, "$$restProps")
            }
            other => other.is_literal(),
        };
        let span = expression.span();
        readable.then(|| self.generated[span.start as usize..span.end as usize].to_string())
    }

    fn simple_target_root_and_path(
        &self,
        target: &SimpleAssignmentTarget<'_>,
    ) -> Option<(String, Vec<String>)> {
        let (expression, tail) = match target {
            SimpleAssignmentTarget::StaticMemberExpression(member) => {
                (&member.object, format!("'{}'", member.property.name))
            }
            SimpleAssignmentTarget::ComputedMemberExpression(member) => (
                &member.object,
                self.computed_path_element(&member.expression)?,
            ),
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
                    path.push(self.computed_path_element(&member.expression)?);
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

    /// Whether the source has any member write through this prop. A generated
    /// setter call for a prop the source never writes through a member of came
    /// from a destructuring pattern, which upstream's `left.type !==
    /// 'MemberExpression'` bail leaves unvalidated.
    fn source_writes_a_member(&self, name: &str) -> bool {
        self.sites
            .iter()
            .find(|(candidate, _, _)| candidate == name)
            .is_none_or(|(_, _, sites)| !sites.is_empty())
    }

    fn location(&mut self, name: &str, path: &[String], value: &str) -> (usize, usize) {
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
            .and_then(|(_, _, sites)| sites.take(static_path.as_deref(), value))
            .unwrap_or_else(|| {
                super::props_transforms::find_prop_mutation_location(self.source, name)
            })
    }

    fn wrap(&mut self, span: Span, name: String, path: Vec<String>, value: Option<Span>) {
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
        if !self.source_writes_a_member(&name) {
            return;
        }
        // The right-hand side alone: `span` is the whole setter call, whose
        // `, true)` tail would otherwise be matched against the source value.
        let generated = self.generated;
        let value = value.map_or("", |value| {
            &generated[value.start as usize..value.end as usize]
        });
        let (line, column) = self.location(&name, &path, value);
        let mut expression = self.generated[span.start as usize..span.end as usize].to_string();

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
    ) -> Option<(Span, Span, Span, String, Vec<String>)> {
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
        Some((
            call.span,
            assignment.span,
            assignment.right.span(),
            name,
            path,
        ))
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
                        .map(|(name, path)| (name, path, Some(assignment.right.span())))
                }
                Argument::UpdateExpression(update) => {
                    self.skip.push(update.span);
                    self.simple_target_root_and_path(&update.argument)
                        .map(|(name, path)| (name, path, None))
                }
                _ => None,
            }
        } else {
            None
        };
        walk::walk_call_expression(self, call);
        if let Some((name, path, value)) = setter {
            self.wrap(call.span, name, path, value);
        }
    }

    fn visit_sequence_expression(&mut self, sequence: &SequenceExpression<'ast>) {
        let setter = sequence
            .expressions
            .iter()
            .find_map(|expression| self.setter_path(expression));
        if let Some((call_span, assignment_span, _, _, _)) = &setter {
            self.skip_calls.push(*call_span);
            self.skip.push(*assignment_span);
        }
        walk::walk_sequence_expression(self, sequence);
        if let Some((_, _, value, name, path)) = setter {
            self.wrap(self.sequence_span(sequence.span), name, path, Some(value));
        }
    }

    fn visit_assignment_expression(&mut self, assignment: &AssignmentExpression<'ast>) {
        walk::walk_assignment_expression(self, assignment);
        if self.skip.contains(&assignment.span) {
            return;
        }
        if let Some((name, path)) = self.root_and_path(&assignment.left) {
            self.wrap(assignment.span, name, path, Some(assignment.right.span()));
        }
    }

    fn visit_update_expression(&mut self, update: &UpdateExpression<'ast>) {
        walk::walk_update_expression(self, update);
        if self.skip.contains(&update.span) {
            return;
        }
        if let Some((name, path)) = self.simple_target_root_and_path(&update.argument) {
            self.wrap(update.span, name, path, None);
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

    /// Upstream calls `validate_mutation` on the source `AssignmentExpression`,
    /// whose `left` is the pattern — not on the per-leaf writes the destructure
    /// lowers to — so a prop the source never writes through a member of gets
    /// no wrap however its generated setters look.
    #[test]
    fn a_destructuring_target_is_not_a_member_mutation() {
        let props = vec![("items".to_string(), None)];
        for source in [
            "<script>\nexport let items;\n[items[0], items[1]] = [items[1], items[0]];\n</script>",
            "<script>\nexport let items;\n({ a: items[0] } = src);\n</script>",
        ] {
            let generated = "items(items()[0] = $$array[0], true);";
            assert_eq!(
                wrap_prop_mutation_validation_ast(generated, &props, source).as_deref(),
                Some(generated),
                "{source}"
            );
        }
    }

    /// The control: one plain member write in the source and the same generated
    /// setter is wrapped again.
    #[test]
    fn a_plain_member_write_in_the_source_still_wraps() {
        let source = "<script>\nexport let items;\nitems[0] = 1;\n</script>";
        let props = vec![("items".to_string(), None)];
        let output =
            wrap_prop_mutation_validation_ast("items(items()[0] = 1, true);", &props, source)
                .unwrap();
        assert!(
            output.starts_with("$$ownership_validator.mutation(null, ['items', 0]"),
            "{output}"
        );
    }

    #[test]
    fn wraps_runes_computed_member_assignment() {
        let source =
            "<script>\nlet { item } = $props();\nlet key = 'k';\nitem[key] = value;\n</script>";
        let props = vec![("item".to_string(), Some("item".to_string()))];
        let output =
            wrap_prop_mutation_validation_ast("item()[key] = value;", &props, source).unwrap();
        assert!(output.starts_with(
            "$$ownership_validator.mutation('item', ['item', key], item()[key] = value"
        ));
    }

    /// Upstream's `validate_mutation` accepts a computed key only as a `Literal`
    /// or an `Identifier`; a template literal and a member expression each leave
    /// the assignment unwrapped.
    #[test]
    fn leaves_an_unnameable_computed_key_unwrapped() {
        let props = vec![("item".to_string(), Some("item".to_string()))];
        for (source, generated) in [
            (
                "<script>\nlet { item } = $props();\nlet key = 'k';\nitem[`${key}`] = value;\n</script>",
                "item()[`${key}`] = value;",
            ),
            (
                "<script>\nlet { item } = $props();\nlet d = { k: 1 };\nitem[d.k] = value;\n</script>",
                "item()[d.k] = value;",
            ),
        ] {
            assert_eq!(
                wrap_prop_mutation_validation_ast(generated, &props, source).as_deref(),
                Some(generated),
            );
        }
    }

    /// A right-hand side that opens on the line after its `=` still contributes
    /// its words, which is what tells two same-path mutations apart.
    #[test]
    fn a_multi_line_right_hand_side_still_discriminates_two_sites() {
        let source = "<script>\nexport let collection;\nfunction a() {\n\tcollection.items =\n\t\tcollection.items.filter(\n\t\t\t(it) => it.kind === 'note'\n\t\t);\n}\nfunction b() {\n\tcollection.items = collection.items.filter((it) => it.id !== id);\n}\n</script>";
        let output = wrap_prop_mutation_validation_ast(
            "collection(collection().items = collection().items.filter((it) => it.id !== id), true);\ncollection(collection().items = collection().items.filter((it) => it.kind === 'note'), true);",
            &[("collection".to_string(), None)],
            source,
        )
        .unwrap();

        assert!(output.contains("it.id !== id), true), 10, 1)"), "{output}");
        assert!(
            output.contains("it.kind === 'note'), true), 4, 1)"),
            "{output}"
        );
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

        assert!(output.ends_with(", 4, 1);"));
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

        assert!(output.contains("result()[key] = true, true), 5, 1)"));
        assert!(output.contains("step().params._id = 'next', true), 6, 1)"));
    }
}
