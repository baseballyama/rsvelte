use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_typescript::scope::{DeclarationKind, ScopeIdentifier};
use rsvelte_typescript::semantic::reference_tracker::{global_references, import_references};
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rustc_hash::FxHashSet;

use super::javascript::span;
use super::legacy_reactivity::legacy;
use super::reactive_statements::{programs, reactive_statements};
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
        let javascript = &component.javascript;
        let sem = file.semantic();
        let parents = file.parents();
        let legacy = legacy(file);
        let roots: Vec<NodeIdentifier> = programs(component).collect();
        // The calls that run their callbacks in another microtask.
        let mut later: Vec<Span> = import_references(
            javascript,
            sem,
            parents,
            file.source(),
            &roots,
            "svelte",
            &["tick"],
        )
        .into_iter()
        .filter_map(|reference| reference.call)
        .filter(|&call| matches!(javascript.kind(call), Kind::Call { .. }))
        .map(|call| span(javascript, call))
        .collect();
        later.extend(
            global_references(
                javascript,
                sem,
                parents,
                file.source(),
                &["setTimeout", "setInterval", "queueMicrotask"],
            )
            .into_iter()
            .filter_map(|reference| reference.call)
            .filter(|&call| matches!(javascript.kind(call), Kind::Call { .. }))
            .map(|call| span(javascript, call)),
        );
        let reactive: FxHashSet<NodeIdentifier> = sem
            .references
            .iter()
            .zip(&legacy.references)
            .filter(|(reference, top)| {
                top.is_some() && !is_function_call(javascript, parents, reference.node)
            })
            .map(|(reference, _)| reference.node)
            .collect();
        for (statement, body) in statements {
            let range = span(javascript, statement);
            let names: FxHashSet<&str> = reactive
                .iter()
                .filter(|&&node| {
                    let at = span(javascript, node);
                    range.start_offset <= at.start_offset && at.end_offset <= range.end_offset
                })
                .map(|&node| javascript.name(node))
                .collect();
            let mut lint = Lint {
                file,
                javascript,
                parents,
                later: &later,
                reactive: &reactive,
                names: &names,
                statement_body: body,
                processed: FxHashSet::default(),
                reporter: &mut *reporter,
            };
            lint.verify(body, &mut Vec::new(), true);
        }
    }
}

struct Lint<'a, 'r, 'p> {
    file: &'a File<'a>,
    javascript: &'a SyntaxTree,
    parents: &'a [NodeIdentifier],
    later: &'a [Span],
    reactive: &'a FxHashSet<NodeIdentifier>,
    names: &'a FxHashSet<&'a str>,
    statement_body: NodeIdentifier,
    /// Bodies already walked, so that recursive functions end.
    processed: FxHashSet<NodeIdentifier>,
    reporter: &'r mut Reporter<'p>,
}

/// One walk of a body: whether the code runs in the reactive statement's microtask, and the
/// nodes whose leaving brings it back there.
struct Walk {
    same_microtask: bool,
    other_microtask: Vec<NodeIdentifier>,
}

impl Lint<'_, '_, '_> {
    /// `verifyInternal`.
    fn verify(&mut self, body: NodeIdentifier, calls: &mut Vec<NodeIdentifier>, same: bool) {
        if !self.processed.insert(body) {
            return;
        }
        let mut walk = Walk {
            same_microtask: same,
            other_microtask: Vec::new(),
        };
        self.visit(body, body, calls, &mut walk);
    }

    fn parent(&self, node: NodeIdentifier) -> Option<NodeIdentifier> {
        self.parents[node.index()].opt()
    }

    fn visit(
        &mut self,
        body: NodeIdentifier,
        node: NodeIdentifier,
        calls: &mut Vec<NodeIdentifier>,
        walk: &mut Walk,
    ) {
        let javascript = self.javascript;
        if self.is_promise_callback(node) {
            walk.other_microtask.push(node);
            walk.same_microtask = false;
        }
        let at = span(javascript, node);
        for call in self.later {
            if call.start_offset <= at.start_offset
                && at.end_offset <= call.end_offset
                && *call != at
            {
                walk.other_microtask.push(node);
                walk.same_microtask = false;
            }
        }
        if let Some(parent) = self.parent(node)
            && let Kind::Assign(_, left, right) = javascript.kind(parent)
            && left == node
            && matches!(javascript.kind(right), Kind::Await(_))
        {
            walk.other_microtask.push(node);
            walk.same_microtask = false;
        }
        if is_function_call(javascript, self.parents, node)
            && let Some(function_body) = self.function_body(node)
        {
            calls.push(node);
            self.verify(function_body, calls, walk.same_microtask);
            calls.pop();
        }
        if !walk.same_microtask
            && self.reactive.contains(&node)
            && self.names.contains(javascript.name(node))
            && self.is_assigned(node)
        {
            self.reporter.report(
                Report::range(
                    "Possibly it may occur an infinite reactive loop.",
                    span(javascript, node),
                )
                .message_id("unexpected"),
            );
            for &call in calls.iter() {
                self.reporter.report(
                    Report::range(
                        format!(
                            "Possibly it may occur an infinite reactive loop because this \
                             function may update `{}`.",
                            javascript.name(node)
                        ),
                        span(javascript, call),
                    )
                    .message_id("unexpectedCall"),
                );
            }
        }
        let mut children = Vec::new();
        javascript.for_each_child(node, |child| children.push(child));
        for child in children {
            self.visit(body, child, calls, walk);
        }
        if matches!(javascript.kind(node), Kind::Await(_))
            && (body != self.statement_body || !self.is_inside_async_function(node))
        {
            walk.same_microtask = false;
        }
        if walk.other_microtask.contains(&node) {
            walk.same_microtask = true;
        }
    }

    /// `isPromiseThenOrCatchBody`: a function passed to `.then()` or `.catch()`.
    fn is_promise_callback(&self, node: NodeIdentifier) -> bool {
        let javascript = self.javascript;
        let declares_function = match javascript.kind(node) {
            Kind::Declarator {
                identifier,
                initializer: Some(initializer),
            } => {
                javascript.is_identifier(identifier)
                    && matches!(
                        javascript.kind(initializer),
                        Kind::Function { .. } | Kind::Arrow { .. }
                    )
            }
            Kind::Function {
                name: Some(_),
                declaration: true,
                ..
            }
            | Kind::Arrow { .. } => true,
            _ => false,
        };
        if !declares_function {
            return false;
        }
        let Some(parent) = self.parent(node) else {
            return false;
        };
        let Kind::Call { callee, .. } = javascript.kind(parent) else {
            return false;
        };
        let Kind::Member {
            property,
            computed: false,
            ..
        } = javascript.kind(callee)
        else {
            return false;
        };
        matches!(javascript.name(property), "then" | "catch")
    }

    /// `getFunctionDeclarationNode`: the body of the function a called name refers to.
    fn function_body(&self, name: NodeIdentifier) -> Option<NodeIdentifier> {
        let javascript = self.javascript;
        let sem = self.file.semantic();
        let binding = sem.binding_of(name).or_else(|| {
            // `findVariable` looks `$store` up as `store` when nothing declares `$store`.
            let store = javascript.name(name).strip_prefix('$')?;
            let scope = self.scope_of(name);
            sem.lookup(scope, javascript.atoms.lookup(store)?)
        })?;
        let declared = &sem.bindings[binding];
        if let Some(initializer) = declared.initializer(javascript) {
            return match javascript.kind(initializer) {
                Kind::Function { body, .. } | Kind::Arrow { body, .. } => Some(body),
                _ => None,
            };
        }
        if declared.kind != DeclarationKind::Function {
            return None;
        }
        match javascript.kind(self.parent(declared.node)?) {
            Kind::Function {
                body,
                declaration: true,
                ..
            } => Some(body),
            _ => None,
        }
    }

    /// The innermost scope around `node`.
    fn scope_of(&self, node: NodeIdentifier) -> ScopeIdentifier {
        let sem = self.file.semantic();
        let mut at = Some(node);
        while let Some(node) = at {
            if let Some(scope) = sem.scope_of(node) {
                return scope;
            }
            at = self.parent(node);
        }
        ScopeIdentifier::ROOT
    }

    /// `isInsideOfFunction`: an `async` function declaration or `const f = async …` encloses it.
    fn is_inside_async_function(&self, node: NodeIdentifier) -> bool {
        let javascript = self.javascript;
        let mut at = self.parent(node);
        while let Some(node) = at {
            match javascript.kind(node) {
                Kind::Function {
                    is_async: true,
                    declaration: true,
                    ..
                } => return true,
                Kind::Declarator {
                    initializer: Some(initializer),
                    ..
                } if matches!(
                    javascript.kind(initializer),
                    Kind::Function { is_async: true, .. } | Kind::Arrow { is_async: true, .. }
                ) =>
                {
                    return true;
                }
                _ => {}
            }
            at = self.parent(node);
        }
        false
    }

    /// `isNodeForAssign`: `name = …`, or `name.x = …` when `node` is in it.
    fn is_assigned(&self, node: NodeIdentifier) -> bool {
        let javascript = self.javascript;
        let name = javascript.name(node);
        let named = |n: NodeIdentifier| javascript.is_identifier(n) && javascript.name(n) == name;
        let Some(parent) = self.parent(node) else {
            return false;
        };
        match javascript.kind(parent) {
            Kind::Assign(_, left, _) => named(left),
            Kind::Member { .. } => {
                let Some(assignment) = self.parent(parent) else {
                    return false;
                };
                let Kind::Assign(_, left, _) = javascript.kind(assignment) else {
                    return false;
                };
                matches!(javascript.kind(left), Kind::Member { object, .. } if named(object))
            }
            _ => false,
        }
    }
}

/// `isFunctionCall`: a name whose parent is a call of a callee by the same name.
fn is_function_call(
    javascript: &SyntaxTree,
    parents: &[NodeIdentifier],
    node: NodeIdentifier,
) -> bool {
    if !javascript.is_identifier(node) {
        return false;
    }
    let parent = parents[node.index()];
    if parent.is_none() {
        return false;
    }
    let Kind::Call { callee, .. } = javascript.kind(parent) else {
        return false;
    };
    javascript.is_identifier(callee) && javascript.name(callee) == javascript.name(node)
}
