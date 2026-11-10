use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_semantic::legacy::{Legacy, Variable};
use rsvelte_svelte_syntax::syntax_tree::{Component, TemplateNode};
use rsvelte_typescript_semantic::globals::global;
use rsvelte_typescript_semantic::scope::{BindingIdentifier, DeclarationKind};
use rsvelte_typescript_syntax::operators::{AssignmentOperator, UnaryOperator};
use rsvelte_typescript_syntax::{Kind, NodeIdentifier};
use rustc_hash::{FxHashMap, FxHashSet};

use super::javascript::span;
use super::legacy_reactivity::{bindings, legacy};
use super::reactive_statements::{by_statement, reactive_statements};
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-immutable-reactive-statements",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoImmutableReactiveStatements))
}

#[derive(Debug)]
struct NoImmutableReactiveStatements;

impl SvelteRule for NoImmutableReactiveStatements {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let statements: Vec<_> = reactive_statements(component, file.source()).collect();
        if statements.is_empty() {
            return;
        }
        let mut checker = Checker::new(file, component);
        let javascript = &component.javascript;
        let sem = file.semantic();
        let ranges: Vec<Span> = statements
            .iter()
            .map(|&(statement, _)| span(javascript, statement))
            .collect();
        let references = by_statement(
            &ranges,
            sem.references
                .iter()
                .enumerate()
                .map(|(index, reference)| (span(javascript, reference.node).start_offset, index))
                .collect(),
        );
        for ((_, body), indices) in statements.into_iter().zip(references) {
            let mut reactive = false;
            for index in indices {
                let reference = &sem.references[index];
                match checker.legacy.references[index] {
                    Some(top) => {
                        let write_only = !top.store && reference.write && !reference.read;
                        if !write_only && checker.is_mutable_reference(index) {
                            reactive = true;
                            break;
                        }
                    }
                    // A name no scope declares: `$$` builtins and names unknown to `ESLint` make
                    // the statement reactive.
                    None if reference.binding.is_none() => {
                        let name = javascript.name(reference.node);
                        if name.starts_with("$$") || global(name).is_none() {
                            reactive = true;
                            break;
                        }
                    }
                    None => {}
                }
            }
            if reactive {
                continue;
            }
            let node = match javascript.kind(body) {
                Kind::ExpressionStatement(expression) => match javascript.kind(expression) {
                    Kind::Assign(AssignmentOperator::Assign, _, right) => right,
                    _ => body,
                },
                _ => body,
            };
            reporter.report(
                Report::range(
                    "This statement is not reactive because all variables referenced in the \
                     reactive statement are immutable.",
                    span(javascript, node),
                )
                .message_id("immutable"),
            );
        }
    }
}

struct Checker<'a> {
    file: &'a File<'a>,
    component: &'a Component,
    legacy: &'a Legacy,
    /// The `$name` references of each binding, which upstream counts as its references.
    stores: FxHashMap<BindingIdentifier, Vec<NodeIdentifier>>,
    bound: FxHashMap<NodeIdentifier, Span>,
    /// The context of the `{#each}` whose collection each expression is.
    each: FxHashMap<NodeIdentifier, NodeIdentifier>,
    mutable: FxHashMap<BindingIdentifier, bool>,
}

impl<'a> Checker<'a> {
    fn new(file: &'a File<'a>, component: &'a Component) -> Self {
        let legacy = legacy(file);
        let sem = file.semantic();
        let mut stores: FxHashMap<BindingIdentifier, Vec<NodeIdentifier>> = FxHashMap::default();
        for (reference, top) in sem.references.iter().zip(&legacy.references) {
            if let Some(top) = top
                && top.store
                && let Variable::Declared(binding) = top.variable
            {
                stores.entry(binding).or_default().push(reference.node);
            }
        }
        let each = component
            .nodes
            .iter()
            .filter_map(|node| match *node {
                TemplateNode::Each {
                    expression,
                    context,
                    ..
                } if !context.is_none() => Some((expression, context)),
                _ => None,
            })
            .collect();
        Self {
            file,
            component,
            legacy,
            stores,
            bound: bindings(component),
            each,
            mutable: FxHashMap::default(),
        }
    }

    /// `isMutableVariableReference` of the reference at `index`.
    fn is_mutable_reference(&mut self, index: usize) -> bool {
        let sem = self.file.semantic();
        let javascript = &self.component.javascript;
        let reference = &sem.references[index];
        if javascript.name(reference.node).starts_with('$') {
            return true;
        }
        match self.legacy.references[index].map(|top| top.variable) {
            Some(Variable::Declared(binding)) => self.is_mutable(binding),
            // A `$:` assignment declares a reactive value.
            Some(Variable::Implicit(_)) | None => true,
        }
    }

    /// `isMutableVariable`.
    fn is_mutable(&mut self, binding: BindingIdentifier) -> bool {
        if let Some(&known) = self.mutable.get(&binding) {
            return known;
        }
        let javascript = &self.component.javascript;
        let parents = self.file.parents();
        let declared = &self.file.semantic().bindings[binding];
        let mutable = match (declared.kind, declared.declaration) {
            (
                DeclarationKind::Variable | DeclarationKind::Let | DeclarationKind::Const,
                Some(declarator),
            ) if matches!(javascript.kind(declarator), Kind::Declarator { .. }) => {
                let declaration = parents[declarator.index()];
                let constant = declared.kind == DeclarationKind::Const;
                let initializer = declared.initializer(javascript);
                if constant
                    && initializer.is_some_and(|initializer| {
                        matches!(
                            javascript.kind(initializer),
                            Kind::Function { .. }
                                | Kind::Arrow { .. }
                                | Kind::String
                                | Kind::Number(_)
                                | Kind::Boolean(_)
                                | Kind::Null
                                | Kind::Regex { .. }
                                | Kind::BigInt
                        )
                    })
                {
                    false
                } else if !constant
                    && parents.get(declaration.index()).is_some_and(|&p| {
                        !p.is_none() && matches!(javascript.kind(p), Kind::ExportNamed(_))
                    })
                {
                    // A prop.
                    true
                } else {
                    self.has_write(binding, &mut FxHashSet::default())
                }
            }
            _ => false,
        };
        self.mutable.insert(binding, mutable);
        mutable
    }

    /// `hasWrite`: a reference after the declaration writes the binding or a member of it.
    fn has_write(
        &self,
        binding: BindingIdentifier,
        visited: &mut FxHashSet<NodeIdentifier>,
    ) -> bool {
        let sem = self.file.semantic();
        let javascript = &self.component.javascript;
        let declared = span(javascript, sem.bindings[binding].node);
        let stores = self.stores.get(&binding).map_or(&[][..], Vec::as_slice);
        sem.references_to(binding)
            .map(|reference| (reference.node, reference.write))
            .chain(stores.iter().map(|&node| (node, false)))
            .any(|(node, write)| {
                let at = span(javascript, node);
                let in_declaration = declared.start_offset <= at.start_offset
                    && at.end_offset <= declared.end_offset;
                (write && !in_declaration) || self.has_write_member(node, visited)
            })
    }

    /// `hasWriteMember`: `expression` is assigned, updated, deleted, bound, or a member of one.
    fn has_write_member(
        &self,
        expression: NodeIdentifier,
        visited: &mut FxHashSet<NodeIdentifier>,
    ) -> bool {
        let javascript = &self.component.javascript;
        let parent = self.file.parents()[expression.index()];
        if parent.is_none() {
            if self.bound.contains_key(&expression) {
                return true;
            }
            return self.each.get(&expression).is_some_and(|&context| {
                let mut write = false;
                rsvelte_svelte_semantic::resolve::for_each_pattern_target(
                    javascript,
                    context,
                    &mut |identifier| {
                        if !write
                            && visited.insert(identifier)
                            && let Some(binding) = self.file.semantic().binding_of(identifier)
                        {
                            write = self.has_write(binding, visited);
                        }
                    },
                );
                write
            });
        }
        match javascript.kind(parent) {
            Kind::Assign(_, left, _) => left == expression,
            Kind::Update { arg, .. } => arg == expression,
            Kind::Unary(UnaryOperator::Delete, argument) => argument == expression,
            Kind::Member { object, .. } => {
                object == expression && self.has_write_member(parent, visited)
            }
            _ => false,
        }
    }
}
