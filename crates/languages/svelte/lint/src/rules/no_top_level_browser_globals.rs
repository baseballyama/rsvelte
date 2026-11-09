use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte::syntax::syntax_tree::{Component, Range, TemplateNode};
use rsvelte_typescript::operators::BinaryOperator::{Eq, InstanceOf, NotEq, StrictEq, StrictNotEq};
use rsvelte_typescript::operators::{LogicalOperator, UnaryOperator};
use rsvelte_typescript::scope::Semantic;
use rsvelte_typescript::semantic::globals::{Global, global};
use rsvelte_typescript::syntax_tree::Control;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rustc_hash::FxHashMap;

use super::nodes::{is_named, roots, span, walk};
use super::reference_tracker::{Access, Found, Properties, ReferenceTracker, Trace};
use super::runes::is_svelte_file;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-top-level-browser-globals",
    files: Files::All,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoTopLevelBrowserGlobals))
}

#[derive(Debug)]
struct NoTopLevelBrowserGlobals;

static READ: Trace<'static> = Trace::READ;

/// Every browser global that Node.js lacks, and `window` and `document`.
static BROWSER_GLOBALS: Trace<'static> = Trace {
    properties: Properties::Lookup(|name| {
        let browser_only = matches!(global(name), Some(Global::Browser { node: false }));
        (browser_only || name == "window" || name == "document").then_some(&READ)
    }),
    ..Trace::NONE
};

/// `import.meta.env.SSR`, which Vite sets on the server.
static SSR: Trace<'static> =
    Trace::properties(&[("env", Trace::properties(&[("SSR", Trace::READ)]))]);

static ENVIRONMENT_MODULES: &[(&str, Trace<'static>)] = &[
    ("esm-env", Trace::properties(&[("BROWSER", Trace::READ)])),
    (
        "$app/environment",
        Trace::properties(&[("browser", Trace::READ)]),
    ),
    ("$app/env", Trace::properties(&[("browser", Trace::READ)])),
];

impl SvelteRule for NoTopLevelBrowserGlobals {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        if !is_svelte_file(file) {
            return;
        }
        let tree = file.javascript();
        let sem = file.semantic();
        let parents = file.parents();
        let source = file.source();
        let guards = Guards::new(file, tree, sem, parents);
        let mut tracker = ReferenceTracker::new(tree, sem, parents, source);
        let mut found = Vec::new();
        let mut available: Vec<Available<'_>> = Vec::new();
        walk(file, |node| {
            if let Kind::MetaProperty { meta, property } = tree.kind(node)
                && is_named(tree, meta, "import")
                && is_named(tree, property, "meta")
            {
                tracker.property_references(node, &[], &SSR, &mut found);
            }
        });
        for reference in std::mem::take(&mut found) {
            available.extend(guards.checker(reference.node, true).map(Available::browser));
        }
        let mut statements = Vec::new();
        for root in roots(file) {
            if let Kind::Program(body) = tree.kind(root) {
                statements.extend_from_slice(body);
            }
        }
        for (module, trace) in ENVIRONMENT_MODULES {
            tracker.esm_references(&statements, module, trace, &mut found);
        }
        let mut checks = Vec::new();
        for reference in std::mem::take(&mut found) {
            match tree.kind(reference.node) {
                Kind::Identifier(_) | Kind::Member { .. } => checks.push(reference.node),
                Kind::ImportNamed { local, .. } => {
                    let Some(binding) = sem.binding_of(local) else {
                        continue;
                    };
                    checks.extend(
                        sem.references_to(binding)
                            .filter(|r| r.read && tree.is_identifier(r.node))
                            .map(|r| r.node),
                    );
                }
                _ => {}
            }
        }
        for node in checks {
            if guards.is_top_level(node) {
                available.extend(guards.checker(node, false).map(Available::browser));
            }
        }
        tracker.global_references(
            &BROWSER_GLOBALS,
            &["globalThis"],
            |name| global(name).is_some(),
            &mut found,
        );
        let mut candidates = Vec::new();
        for Found { node, path, access } in found {
            debug_assert_eq!(access, Access::Read, "the trace reads only");
            if !guards.is_top_level(node) {
                continue;
            }
            let name = path[0];
            match guards.checker_from_reference(node) {
                Some(checker) => available.push(Available {
                    checker,
                    name: Some(name),
                    browser: name == "window" || name == "document",
                }),
                None => candidates.push((node, name)),
            }
        }
        for (node, name) in candidates {
            let at = span(tree, node);
            let guarded = available
                .iter()
                .any(|a| a.checker.contains(node, at) && (a.browser || a.name == Some(name)));
            if !guarded {
                reporter.report(
                    Report::range(
                        format!("Unexpected top-level browser global variable \"{name}\"."),
                        at,
                    )
                    .message_id("unexpectedGlobal"),
                );
            }
        }
    }
}

/// A guard: where it makes a browser global available, and which.
#[derive(Debug)]
struct Available<'a> {
    checker: Checker,
    /// The global the guard checks, when it checks one.
    name: Option<&'a str>,
    /// The guard proves the code runs in a browser, so every global is available.
    browser: bool,
}

impl Available<'_> {
    const fn browser(checker: Checker) -> Self {
        Self {
            checker,
            name: None,
            browser: true,
        }
    }
}

/// The nodes a guard covers: ranges and one node itself.
#[derive(Debug, Default)]
struct Checker {
    ranges: Vec<Span>,
    node: Option<NodeIdentifier>,
}

impl Checker {
    fn range(span: Span) -> Self {
        Self {
            ranges: vec![span],
            node: None,
        }
    }

    fn contains(&self, node: NodeIdentifier, at: Span) -> bool {
        self.node == Some(node)
            || self
                .ranges
                .iter()
                .any(|r| r.start_offset <= at.start_offset && at.end_offset <= r.end_offset)
    }
}

/// What the guards are decided by: the tree, and the template's `{#if}` tests and snippets.
struct Guards<'a> {
    tree: &'a SyntaxTree,
    sem: &'a Semantic,
    source: &'a str,
    parents: &'a [NodeIdentifier],
    /// A template `{#if}` test, with the ranges its branch and its `{:else}` cover.
    if_tests: FxHashMap<NodeIdentifier, (Option<Span>, Option<Span>)>,
    /// The outermost snippets, in order; nothing in them is top-level.
    snippets: Vec<Span>,
    /// A script's statements are not in a program upstream but in a `<script>` element.
    statements_in_program: bool,
}

impl<'a> Guards<'a> {
    fn new(
        file: &File<'a>,
        tree: &'a SyntaxTree,
        sem: &'a Semantic,
        parents: &'a [NodeIdentifier],
    ) -> Self {
        let mut if_tests = FxHashMap::default();
        let mut snippets: Vec<Span> = Vec::new();
        if let Some(component) = file.component() {
            for node in &component.nodes {
                match node {
                    TemplateNode::If {
                        test,
                        consequent,
                        alternate,
                        ..
                    } => {
                        if_tests.insert(
                            *test,
                            (
                                cover(component, *consequent),
                                alternate.and_then(|a| cover(component, a)),
                            ),
                        );
                    }
                    TemplateNode::Snippet { span, .. } => snippets.push(*span),
                    _ => {}
                }
            }
            snippets.sort_by_key(|s| s.start_offset);
            let mut outermost: Vec<Span> = Vec::with_capacity(snippets.len());
            for s in snippets {
                if outermost
                    .last()
                    .is_none_or(|last| last.end_offset <= s.start_offset)
                {
                    outermost.push(s);
                }
            }
            snippets = outermost;
        }
        Self {
            tree,
            sem,
            source: file.source(),
            parents,
            if_tests,
            snippets,
            statements_in_program: !file.is_component(),
        }
    }

    fn parent(&self, node: NodeIdentifier) -> Option<NodeIdentifier> {
        self.parents[node.index()].opt()
    }

    /// Outside every function and snippet.
    fn is_top_level(&self, node: NodeIdentifier) -> bool {
        let mut at = self.parent(node);
        while let Some(current) = at {
            if matches!(
                self.tree.kind(current),
                Kind::Function { .. } | Kind::Arrow { .. }
            ) {
                return false;
            }
            at = self.parent(current);
        }
        let start = span(self.tree, node).start_offset;
        let i = self.snippets.partition_point(|s| s.start_offset <= start);
        !(i > 0 && span(self.tree, node).end_offset <= self.snippets[i - 1].end_offset)
    }

    /// `getGuardCheckerFromReference`: what a reference to a browser global guards, when it is
    /// a check for that global.
    fn checker_from_reference(&self, node: NodeIdentifier) -> Option<Checker> {
        let tree = self.tree;
        let is_member = matches!(tree.kind(node), Kind::Member { .. });
        let parent = self.parent(node);
        match parent.map(|p| (p, tree.kind(p))) {
            Some((parent, Kind::Binary(operator, left, right))) => {
                if operator == InstanceOf && left == node && is_member {
                    return self.checker(parent, false);
                }
                let operand = if left == node { right } else { left };
                if !is_member {
                    return None;
                }
                match (self.static_value(operand)?, operator) {
                    (Static::Undefined, StrictNotEq | NotEq) | (Static::Null, NotEq) => {
                        self.checker(parent, false)
                    }
                    (Static::Undefined, StrictEq | Eq) | (Static::Null, Eq) => {
                        self.checker(parent, true)
                    }
                    _ => None,
                }
            }
            Some((parent, Kind::Unary(UnaryOperator::TypeOf, _))) => {
                let comparison = self.parent(parent)?;
                let Kind::Binary(operator, left, right) = tree.kind(comparison) else {
                    return None;
                };
                let other = if left == parent { right } else { left };
                let undefined = match self.static_value(other)? {
                    Static::String("undefined") => true,
                    Static::String("object") => false,
                    _ => return None,
                };
                match operator {
                    StrictNotEq | NotEq => self.checker(comparison, !undefined),
                    StrictEq | Eq => self.checker(comparison, undefined),
                    _ => None,
                }
            }
            _ if is_member => {
                let optional_use = parent.is_some_and(|p| match tree.kind(p) {
                    Kind::Call {
                        callee, optional, ..
                    } => callee == node && optional,
                    Kind::Member {
                        object, optional, ..
                    } => object == node && optional,
                    _ => false,
                });
                if optional_use {
                    return Some(Checker {
                        ranges: Vec::new(),
                        node: Some(node),
                    });
                }
                self.checker(node, false)
            }
            _ => None,
        }
    }

    /// `getGuardChecker`: where `node` being truthy (falsy with `not`) holds.
    fn checker(&self, node: NodeIdentifier, not: bool) -> Option<Checker> {
        let tree = self.tree;
        let Some(parent) = self.parent(node) else {
            let &(consequent, alternate) = self.if_tests.get(&node)?;
            return if not { alternate } else { consequent }.map(Checker::range);
        };
        match tree.kind(parent) {
            Kind::Conditional {
                consequent,
                alternate,
                ..
            } => Some(Checker::range(span(
                tree,
                if not { alternate } else { consequent },
            ))),
            Kind::Unary(UnaryOperator::Not, _) => self.checker(parent, !not),
            Kind::If {
                test,
                consequent,
                alternate,
            } if test == node => {
                if !not {
                    return Some(Checker::range(span(tree, consequent)));
                }
                if let Some(alternate) = alternate {
                    return Some(Checker::range(span(tree, alternate)));
                }
                if !self.jumps_on_every_path(consequent) {
                    return None;
                }
                let host = self.parent(parent)?;
                let hosts = match tree.kind(host) {
                    Kind::Block(_) => true,
                    Kind::Program(_) => self.statements_in_program,
                    _ => false,
                };
                hosts.then(|| {
                    Checker::range(Span::new(
                        span(tree, parent).end_offset,
                        span(tree, host).end_offset,
                    ))
                })
            }
            Kind::Logical(operator, left, right) => {
                if !not && operator == LogicalOperator::And {
                    let mut checker = self.checker(parent, not);
                    if left == node {
                        checker
                            .get_or_insert_default()
                            .ranges
                            .push(span(tree, right));
                    }
                    return checker;
                }
                if not && operator == LogicalOperator::Or {
                    return self.checker(parent, not);
                }
                None
            }
            _ => None,
        }
    }

    /// `hasJumpStatementInAllPath`.
    fn jumps_on_every_path(&self, statement: NodeIdentifier) -> bool {
        match self.tree.kind(statement) {
            Kind::Return(_) | Kind::Control(Control::Jump { .. }) => true,
            Kind::Block(statements) => statements.iter().any(|&s| self.jumps_on_every_path(s)),
            Kind::If {
                consequent,
                alternate: Some(alternate),
                ..
            } => self.jumps_on_every_path(alternate) && self.jumps_on_every_path(consequent),
            _ => false,
        }
    }

    /// The few values `getStaticValue` finds that a guard compares with.
    fn static_value(&self, node: NodeIdentifier) -> Option<Static<'a>> {
        let tree = self.tree;
        Some(match tree.kind(node) {
            Kind::Identifier(_)
                if is_named(tree, node, "undefined") && self.sem.binding_of(node).is_none() =>
            {
                Static::Undefined
            }
            Kind::Unary(UnaryOperator::Void, argument) => {
                self.static_value(argument)?;
                Static::Undefined
            }
            Kind::Null => Static::Null,
            Kind::String => Static::String(tree.str_value(node, self.source)),
            Kind::Template {
                quasis: &[quasi],
                expressions: [],
            } => Static::String(tree.str_value(quasi, self.source)),
            Kind::Number(_) | Kind::Boolean(_) | Kind::BigInt => Static::Other,
            _ => return None,
        })
    }
}

enum Static<'a> {
    Undefined,
    Null,
    String(&'a str),
    Other,
}

/// From the first child's start to the last child's end; `None` without children.
fn cover(component: &Component, children: Range) -> Option<Span> {
    let children = component.children(children);
    let first = component.node(*children.first()?).span();
    let last = component.node(*children.last()?).span();
    Some(Span::new(first.start_offset, last.end_offset))
}
