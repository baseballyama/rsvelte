use oxc_ast::AstKind;
use oxc_ast::ast::{
    ArrowFunctionBody, AssignmentTarget, BindingPattern, Expression, FunctionBody, Statement,
};
use oxc_ast_visit::Visit;
use oxc_semantic::{AstNodes, NodeId, ReferenceId, Scoping};
use oxc_span::GetSpan;
use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_typescript_semantic::reference_tracker::{global_references, import_references};
use rustc_hash::FxHashSet;

use super::legacy_reactivity::{expression_node, legacy};
use super::nodes::span;
use super::reactive_statements::{by_statement, reactive_statements};
use super::svelte_store::is_value;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/infinite-reactive-loop",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(InfiniteReactiveLoop))
}

#[derive(Debug)]
struct InfiniteReactiveLoop;

impl SvelteRule for InfiniteReactiveLoop {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let statements: Vec<_> = reactive_statements(component, file.source()).collect();
        if statements.is_empty() {
            return;
        }
        let semantic = file.semantic();
        let scoping = semantic.scoping();
        let nodes = semantic.nodes();
        let legacy = legacy(file);
        // The calls that run their callbacks in another microtask.
        let programs = file.programs();
        let later: FxHashSet<NodeId> = import_references(semantic, &programs, "svelte", &["tick"])
            .into_iter()
            .chain(global_references(
                semantic,
                &["setTimeout", "setInterval", "queueMicrotask"],
            ))
            .filter_map(|reference| reference.call)
            .filter(|&call| matches!(nodes.kind(call), AstKind::CallExpression(_)))
            .collect();
        let reactive: FxHashSet<NodeId> = (0..scoping.references_len())
            .map(ReferenceId::from_usize)
            .filter(|&id| {
                is_value(scoping.get_reference(id)) && legacy.references[id.index()].is_some()
            })
            .map(|id| scoping.get_reference(id).node_id())
            .filter(|&node| !is_function_call(nodes, node))
            .collect();
        let ranges: Vec<Span> = statements
            .iter()
            .map(|&(statement, _)| span(statement))
            .collect();
        let names = by_statement(
            &ranges,
            reactive
                .iter()
                .filter_map(|&node| {
                    let AstKind::IdentifierReference(identifier) = nodes.kind(node) else {
                        return None;
                    };
                    Some((identifier.span.start, identifier.name.as_str()))
                })
                .collect(),
        );
        for ((_, body), names) in statements.into_iter().zip(names) {
            let names: FxHashSet<&str> = names.into_iter().collect();
            let mut lint = Lint {
                nodes,
                scoping,
                later: &later,
                reactive: &reactive,
                names: &names,
                statement_body: None,
                processed: FxHashSet::default(),
                walks: Vec::new(),
                calls: Vec::new(),
                reporter: &mut *reporter,
            };
            lint.verify(body);
        }
    }
}

struct Lint<'a, 'r, 'p> {
    nodes: &'a AstNodes<'a>,
    scoping: &'a Scoping,
    later: &'a FxHashSet<NodeId>,
    reactive: &'a FxHashSet<NodeId>,
    names: &'a FxHashSet<&'a str>,
    statement_body: Option<NodeId>,
    /// Bodies already walked, so that recursive functions end.
    processed: FxHashSet<NodeId>,
    /// The walk of the statement's body, then of each function it calls into.
    walks: Vec<Walk>,
    /// The calls that led to the body being walked.
    calls: Vec<NodeId>,
    reporter: &'r mut Reporter<'p>,
}

/// One walk of a body: whether the code runs in the reactive statement's microtask, and the
/// nodes whose leaving brings it back there.
struct Walk {
    /// The body's node, known once the walk enters it.
    body: Option<NodeId>,
    same_microtask: bool,
    other_microtask: FxHashSet<NodeId>,
    /// How many of the calls in `later` enclose the node being walked.
    inside_later: usize,
}

impl Walk {
    fn new(same: bool) -> Self {
        Self {
            body: None,
            same_microtask: same,
            other_microtask: FxHashSet::default(),
            inside_later: 0,
        }
    }
}

/// The body of a function: a block, or an arrow's expression.
#[derive(Clone, Copy)]
enum Body<'a> {
    Block(&'a FunctionBody<'a>),
    Expression(&'a Expression<'a>),
}

impl Body<'_> {
    fn node(self) -> NodeId {
        match self {
            Self::Block(body) => body.node_id(),
            Self::Expression(expression) => expression_node(expression),
        }
    }
}

impl<'a> Lint<'a, '_, '_> {
    /// `verifyInternal` for the statement's body and, through calls, the functions it calls.
    fn verify(&mut self, body: &'a Statement<'a>) {
        self.walks.push(Walk::new(true));
        self.visit_statement(body);
        self.walks.pop();
    }

    fn walk(&mut self) -> &mut Walk {
        self.walks.last_mut().expect("a walk")
    }

    fn parent(&self, node: NodeId) -> Option<NodeId> {
        let parent = self.nodes.parent_id(node);
        (parent != node).then_some(parent)
    }

    /// The first node of a walk is its body; the calls in `later` around it count.
    fn start(&mut self, node: NodeId) {
        if self.walks.last().is_some_and(|walk| walk.body.is_some()) {
            return;
        }
        let mut inside_later = 0;
        let mut at = self.parent(node);
        while let Some(ancestor) = at {
            inside_later += usize::from(self.later.contains(&ancestor));
            at = self.parent(ancestor);
        }
        if self.statement_body.is_none() {
            self.statement_body = Some(node);
            self.processed.insert(node);
        }
        let walk = self.walk();
        walk.body = Some(node);
        walk.inside_later = inside_later;
    }

    /// `name = await …`, whose assignment runs in another microtask.
    fn is_awaited_assignment(&self, node: NodeId) -> bool {
        let at = self.nodes.kind(node).span();
        self.parent(node).is_some_and(|parent| {
            matches!(self.nodes.kind(parent), AstKind::AssignmentExpression(assignment)
                if assignment.left.span() == at
                    && matches!(assignment.right, Expression::AwaitExpression(_)))
        })
    }

    /// Reports `node` when it assigns a variable the statement reads, with the calls that led
    /// to it.
    fn report(&mut self, node: NodeId) {
        let AstKind::IdentifierReference(identifier) = self.nodes.kind(node) else {
            return;
        };
        let name = identifier.name.as_str();
        if !(self.reactive.contains(&node)
            && self.names.contains(name)
            && self.is_assigned(node, name))
        {
            return;
        }
        self.reporter.report(
            Report::range(
                "Possibly it may occur an infinite reactive loop.",
                span(identifier),
            )
            .message_id("unexpected"),
        );
        for &call in &self.calls {
            self.reporter.report(
                Report::range(
                    format!(
                        "Possibly it may occur an infinite reactive loop because this function \
                         may update `{name}`."
                    ),
                    span(&self.nodes.kind(call)),
                )
                .message_id("unexpectedCall"),
            );
        }
    }

    /// `isPromiseThenOrCatchBody`: a function passed to `.then()` or `.catch()`.
    fn is_promise_callback(&self, kind: AstKind<'_>, node: NodeId) -> bool {
        let declares_function = match kind {
            AstKind::VariableDeclarator(declarator) => {
                matches!(declarator.id, BindingPattern::BindingIdentifier(_))
                    && matches!(
                        declarator.init,
                        Some(
                            Expression::FunctionExpression(_)
                                | Expression::ArrowFunctionExpression(_)
                        )
                    )
            }
            AstKind::Function(function) => function.is_declaration() && function.id.is_some(),
            AstKind::ArrowFunctionExpression(_) => true,
            _ => false,
        };
        if !declares_function {
            return false;
        }
        let Some(parent) = self.parent(node) else {
            return false;
        };
        let AstKind::CallExpression(call) = self.nodes.kind(parent) else {
            return false;
        };
        matches!(&call.callee, Expression::StaticMemberExpression(member)
            if matches!(member.property.name.as_str(), "then" | "catch"))
    }

    /// `getFunctionDeclarationNode`: the body of the function a called name refers to.
    fn function_body(&self, name: NodeId) -> Option<Body<'a>> {
        let AstKind::IdentifierReference(identifier) = self.nodes.kind(name) else {
            return None;
        };
        let scoping = self.scoping;
        let symbol = identifier
            .reference_id
            .get()
            .and_then(|id| scoping.get_reference(id).symbol_id())
            .or_else(|| {
                // `findVariable` looks `$store` up as `store` when nothing declares `$store`.
                let store = identifier.name.strip_prefix('$')?;
                let scope = self.nodes.get_node(name).scope_id();
                scoping.find_binding(scope, store.into())
            })?;
        match self.nodes.kind(scoping.symbol_declaration(symbol)) {
            AstKind::VariableDeclarator(declarator) => match declarator.init.as_ref()? {
                Expression::FunctionExpression(function) => {
                    function.body.as_deref().map(Body::Block)
                }
                Expression::ArrowFunctionExpression(arrow) => Some(match &arrow.body {
                    ArrowFunctionBody::FunctionBody(body) => Body::Block(body),
                    body => Body::Expression(body.as_expression()?),
                }),
                _ => None,
            },
            AstKind::Function(function) if function.is_declaration() => {
                function.body.as_deref().map(Body::Block)
            }
            _ => None,
        }
    }

    /// `isInsideOfFunction`: an `async` function declaration or `const f = async …` encloses it.
    fn is_inside_async_function(&self, node: NodeId) -> bool {
        self.nodes
            .ancestor_kinds(node)
            .skip(1)
            .any(|kind| match kind {
                AstKind::Function(function) => function.r#async && function.is_declaration(),
                AstKind::VariableDeclarator(declarator) => match &declarator.init {
                    Some(Expression::FunctionExpression(function)) => function.r#async,
                    Some(Expression::ArrowFunctionExpression(arrow)) => arrow.r#async,
                    _ => false,
                },
                _ => false,
            })
    }

    /// `isNodeForAssign`: `name = …`, or `name.x = …` when `node` is in it.
    fn is_assigned(&self, node: NodeId, name: &str) -> bool {
        let named = |target: &AssignmentTarget<'_>| {
            matches!(target, AssignmentTarget::AssignmentTargetIdentifier(identifier)
                if identifier.name == name)
        };
        let Some(parent) = self.parent(node) else {
            return false;
        };
        match self.nodes.kind(parent) {
            AstKind::AssignmentExpression(assignment) => named(&assignment.left),
            AstKind::StaticMemberExpression(_)
            | AstKind::ComputedMemberExpression(_)
            | AstKind::PrivateFieldExpression(_) => {
                let Some(assignment) = self.parent(parent) else {
                    return false;
                };
                let AstKind::AssignmentExpression(assignment) = self.nodes.kind(assignment) else {
                    return false;
                };
                let object = match &assignment.left {
                    AssignmentTarget::StaticMemberExpression(member) => &member.object,
                    AssignmentTarget::ComputedMemberExpression(member) => &member.object,
                    AssignmentTarget::PrivateFieldExpression(member) => &member.object,
                    _ => return false,
                };
                matches!(object, Expression::Identifier(identifier) if identifier.name == name)
            }
            _ => false,
        }
    }
}

impl<'a> Visit<'a> for Lint<'a, '_, '_> {
    fn enter_node(&mut self, kind: AstKind<'a>) {
        let node = kind.node_id();
        self.start(node);
        let later = self.walk().inside_later > 0;
        if self.is_promise_callback(kind, node) || later || self.is_awaited_assignment(node) {
            let walk = self.walk();
            walk.other_microtask.insert(node);
            walk.same_microtask = false;
        }
        if is_function_call(self.nodes, node)
            && let Some(body) = self.function_body(node)
            && self.processed.insert(body.node())
        {
            let same = self.walk().same_microtask;
            self.calls.push(node);
            self.walks.push(Walk::new(same));
            match body {
                Body::Block(body) => self.visit_function_body(body),
                Body::Expression(expression) => self.visit_expression(expression),
            }
            self.walks.pop();
            self.calls.pop();
        }
        if !self.walk().same_microtask {
            self.report(node);
        }
        if self.later.contains(&node) {
            self.walk().inside_later += 1;
        }
    }

    fn leave_node(&mut self, kind: AstKind<'a>) {
        let node = kind.node_id();
        let other_body = self.walks.last().and_then(|walk| walk.body) != self.statement_body;
        let leaves_microtask = matches!(kind, AstKind::AwaitExpression(_))
            && (other_body || !self.is_inside_async_function(node));
        let later = self.later.contains(&node);
        let walk = self.walk();
        if later {
            walk.inside_later -= 1;
        }
        if leaves_microtask {
            walk.same_microtask = false;
        }
        if walk.other_microtask.contains(&node) {
            walk.same_microtask = true;
        }
    }
}

/// `isFunctionCall`: a name whose parent is a call of a callee by the same name.
fn is_function_call(nodes: &AstNodes<'_>, node: NodeId) -> bool {
    let AstKind::IdentifierReference(identifier) = nodes.kind(node) else {
        return false;
    };
    let parent = nodes.parent_id(node);
    if parent == node {
        return false;
    }
    let AstKind::CallExpression(call) = nodes.kind(parent) else {
        return false;
    };
    matches!(&call.callee, Expression::Identifier(callee) if callee.name == identifier.name)
}
