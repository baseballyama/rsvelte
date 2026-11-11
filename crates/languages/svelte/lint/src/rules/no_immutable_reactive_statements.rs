use oxc_ast::AstKind;
use oxc_ast::ast::{
    BindingPattern, Expression, FormalParameter, Statement, VariableDeclarationKind,
};
use oxc_semantic::{NodeId, ReferenceId, SymbolId};
use oxc_span::GetSpan;
use oxc_syntax::operator::{AssignmentOperator, UnaryOperator};
use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_semantic::legacy::{Legacy, Variable};
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_svelte_syntax::syntax_tree::{Component, TemplateNode};
use rsvelte_typescript_semantic::globals::global;
use rustc_hash::{FxHashMap, FxHashSet};

use super::legacy_reactivity::{bindings, expression_node, legacy};
use super::nodes::span;
use super::reactive_statements::{by_statement, reactive_statements};
use super::svelte_store::is_value;
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
        let resolution = file.resolution().expect("a component resolves");
        let mut checker = Checker::new(file, resolution, component);
        let scoping = resolution.scoping();
        let nodes = resolution.semantic().nodes();
        let ranges: Vec<Span> = statements
            .iter()
            .map(|&(statement, _)| span(statement))
            .collect();
        let references = by_statement(
            &ranges,
            (0..scoping.references_len())
                .map(ReferenceId::from_usize)
                .filter(|&id| is_value(scoping.get_reference(id)))
                .map(|id| {
                    let node = scoping.get_reference(id).node_id();
                    (nodes.kind(node).span().start, id)
                })
                .collect(),
        );
        for ((_, body), ids) in statements.into_iter().zip(references) {
            let mut reactive = false;
            for id in ids {
                let reference = scoping.get_reference(id);
                match checker.legacy.references[id.index()] {
                    Some(top) => {
                        let write_only = !top.store && reference.is_write() && !reference.is_read();
                        if !write_only && checker.is_mutable_reference(id) {
                            reactive = true;
                            break;
                        }
                    }
                    // A name no scope declares: `$$` builtins and names unknown to `ESLint` make
                    // the statement reactive.
                    None if reference.symbol_id().is_none() => {
                        let name = name_of(resolution, id);
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
            let at = match body {
                Statement::ExpressionStatement(statement) => match &statement.expression {
                    Expression::AssignmentExpression(assignment)
                        if assignment.operator == AssignmentOperator::Assign =>
                    {
                        span(&assignment.right)
                    }
                    _ => span(body),
                },
                _ => span(body),
            };
            reporter.report(
                Report::range(
                    "This statement is not reactive because all variables referenced in the \
                     reactive statement are immutable.",
                    at,
                )
                .message_id("immutable"),
            );
        }
    }
}

/// The name a reference uses.
fn name_of(resolution: &Resolution, id: ReferenceId) -> &str {
    let node = resolution.scoping().get_reference(id).node_id();
    match resolution.semantic().nodes().kind(node) {
        AstKind::IdentifierReference(identifier) => identifier.name.as_str(),
        _ => "",
    }
}

struct Checker<'a> {
    resolution: &'a Resolution,
    legacy: &'a Legacy,
    /// The `$name` references of each symbol, which upstream counts as its references.
    stores: FxHashMap<SymbolId, Vec<NodeId>>,
    bound: FxHashMap<NodeId, Span>,
    /// The context of the `{#each}` whose collection each expression is.
    each: FxHashMap<NodeId, &'a FormalParameter<'a>>,
    mutable: FxHashMap<SymbolId, bool>,
}

impl<'a> Checker<'a> {
    fn new(file: &File<'a>, resolution: &'a Resolution, component: &'a Component) -> Self {
        let legacy = legacy(file);
        let scoping = resolution.scoping();
        let javascript = &component.javascript;
        let mut stores: FxHashMap<SymbolId, Vec<NodeId>> = FxHashMap::default();
        for id in (0..scoping.references_len()).map(ReferenceId::from_usize) {
            let reference = scoping.get_reference(id);
            if is_value(reference)
                && let Some(top) = legacy.references[id.index()]
                && top.store
                && let Variable::Declared(symbol) = top.variable
            {
                stores.entry(symbol).or_default().push(reference.node_id());
            }
        }
        let each = component
            .nodes
            .iter()
            .filter_map(|node| match *node {
                TemplateNode::Each {
                    expression,
                    context: Some(context),
                    ..
                } => Some((
                    expression_node(javascript.get_expression(expression)),
                    javascript.get_pattern(context),
                )),
                _ => None,
            })
            .collect();
        Self {
            resolution,
            legacy,
            stores,
            bound: bindings(component),
            each,
            mutable: FxHashMap::default(),
        }
    }

    /// `isMutableVariableReference` of the reference `id`.
    fn is_mutable_reference(&mut self, id: ReferenceId) -> bool {
        if name_of(self.resolution, id).starts_with('$') {
            return true;
        }
        match self.legacy.references[id.index()].map(|top| top.variable) {
            Some(Variable::Declared(symbol)) => self.is_mutable(symbol),
            // A `$:` assignment declares a reactive value.
            Some(Variable::Implicit(_)) | None => true,
        }
    }

    /// `isMutableVariable`.
    fn is_mutable(&mut self, symbol: SymbolId) -> bool {
        if let Some(&known) = self.mutable.get(&symbol) {
            return known;
        }
        let resolution = self.resolution;
        let nodes = resolution.semantic().nodes();
        let mutable = match resolution.declaration(symbol) {
            AstKind::VariableDeclarator(declarator) => {
                let constant =
                    resolution.variable_kind(symbol) == Some(VariableDeclarationKind::Const);
                let declaration = nodes.parent_id(declarator.node_id());
                if constant
                    && declarator.init.as_ref().is_some_and(|initializer| {
                        matches!(
                            initializer,
                            Expression::FunctionExpression(_)
                                | Expression::ArrowFunctionExpression(_)
                                | Expression::StringLiteral(_)
                                | Expression::NumericLiteral(_)
                                | Expression::BooleanLiteral(_)
                                | Expression::NullLiteral(_)
                                | Expression::RegExpLiteral(_)
                                | Expression::BigIntLiteral(_)
                        )
                    })
                {
                    false
                } else if !constant
                    && matches!(
                        nodes.parent_kind(declaration),
                        AstKind::ExportDeclaration(_)
                    )
                {
                    // A prop.
                    true
                } else {
                    self.has_write(symbol, &mut FxHashSet::default())
                }
            }
            _ => false,
        };
        self.mutable.insert(symbol, mutable);
        mutable
    }

    /// `hasWrite`: a reference after the declaration writes the symbol or a member of it.
    fn has_write(&self, symbol: SymbolId, visited: &mut FxHashSet<NodeId>) -> bool {
        let scoping = self.resolution.scoping();
        let nodes = self.resolution.semantic().nodes();
        let declared = scoping.symbol_span(symbol);
        let stores = self.stores.get(&symbol).map_or(&[][..], Vec::as_slice);
        scoping
            .get_resolved_reference_ids(symbol)
            .iter()
            .map(|&id| scoping.get_reference(id))
            .filter(|reference| is_value(reference))
            .map(|reference| (reference.node_id(), reference.is_write()))
            .chain(stores.iter().map(|&node| (node, false)))
            .any(|(node, write)| {
                let at = nodes.kind(node).span();
                let in_declaration = declared.start <= at.start && at.end <= declared.end;
                (write && !in_declaration) || self.has_write_member(node, visited)
            })
    }

    /// `hasWriteMember`: `expression` is assigned, updated, deleted, bound, or a member of one.
    fn has_write_member(&self, expression: NodeId, visited: &mut FxHashSet<NodeId>) -> bool {
        let nodes = self.resolution.semantic().nodes();
        let parent = nodes.parent_id(expression);
        let at = nodes.kind(expression).span();
        let is_expression = |e: &Expression<'_>| expression_node(e) == expression;
        match nodes.kind(parent) {
            // A template expression, whose parent upstream is its directive or block.
            AstKind::Program(_) if parent != expression => {
                if self.bound.contains_key(&expression) {
                    return true;
                }
                self.each.get(&expression).is_some_and(|context| {
                    let mut identifiers = Vec::new();
                    pattern_identifiers(&context.pattern, &mut identifiers);
                    identifiers.into_iter().any(|(node, symbol)| {
                        visited.insert(node)
                            && symbol.is_some_and(|symbol| self.has_write(symbol, visited))
                    })
                })
            }
            AstKind::AssignmentExpression(assignment) => assignment.left.span() == at,
            AstKind::UpdateExpression(update) => update.argument.span() == at,
            AstKind::UnaryExpression(unary) => {
                unary.operator == UnaryOperator::Delete && is_expression(&unary.argument)
            }
            AstKind::StaticMemberExpression(member) => {
                is_expression(&member.object) && self.has_write_member(parent, visited)
            }
            AstKind::ComputedMemberExpression(member) => {
                is_expression(&member.object) && self.has_write_member(parent, visited)
            }
            AstKind::PrivateFieldExpression(member) => {
                is_expression(&member.object) && self.has_write_member(parent, visited)
            }
            _ => false,
        }
    }
}

/// The identifiers a pattern declares, in source order, with their symbols.
fn pattern_identifiers(pattern: &BindingPattern<'_>, out: &mut Vec<(NodeId, Option<SymbolId>)>) {
    match pattern {
        BindingPattern::BindingIdentifier(identifier) => {
            out.push((identifier.node_id(), identifier.symbol_id.get()));
        }
        BindingPattern::ObjectPattern(object) => {
            for property in &object.properties {
                pattern_identifiers(&property.value, out);
            }
            if let Some(rest) = &object.rest {
                pattern_identifiers(&rest.argument, out);
            }
        }
        BindingPattern::ArrayPattern(array) => {
            for element in array.elements.iter().flatten() {
                pattern_identifiers(element, out);
            }
            if let Some(rest) = &array.rest {
                pattern_identifiers(&rest.argument, out);
            }
        }
        BindingPattern::AssignmentPattern(pattern) => pattern_identifiers(&pattern.left, out),
    }
}
