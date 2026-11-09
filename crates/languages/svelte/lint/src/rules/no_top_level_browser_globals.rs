use std::collections::BTreeMap;

use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::{Component, Range, TemplateNode};
use rsvelte_typescript_semantic::globals::{Global, global};
use rsvelte_typescript_semantic::reference_tracker::{
    global_references_matching, import_references, property_references,
};
use rsvelte_typescript_semantic::scope::Semantic;
use rsvelte_typescript_semantic::static_value::{StaticValues, Value};
use rsvelte_typescript_syntax::operators::BinaryOperator::{
    Eq, InstanceOf, NotEq, StrictEq, StrictNotEq,
};
use rsvelte_typescript_syntax::operators::{LogicalOperator, UnaryOperator};
use rsvelte_typescript_syntax::syntax_tree::Control;
use rsvelte_typescript_syntax::{Kind, NodeIdentifier, SyntaxTree};
use rustc_hash::{FxHashMap, FxHashSet};

use super::nodes::{is_named, roots, span, walk};
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

/// Every browser global that Node.js lacks, and `window` and `document`.
fn is_browser_global(name: &str) -> bool {
    matches!(global(name), Some(Global::Browser { node: false }))
        || name == "window"
        || name == "document"
}

/// The modules that export whether the code runs in a browser, and that export's name.
const ENVIRONMENT_MODULES: &[(&str, &str)] = &[
    ("esm-env", "BROWSER"),
    ("$app/environment", "browser"),
    ("$app/env", "browser"),
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
        let mut guards = Guards::new(file, tree, sem, parents);
        let mut found = Vec::new();
        let mut available: Vec<Available<'_>> = Vec::new();
        let mut functions = Vec::new();
        walk(file, |node| {
            if matches!(tree.kind(node), Kind::Function { .. } | Kind::Arrow { .. }) {
                functions.push(span(tree, node));
            }
            if let Kind::MetaProperty { meta, property } = tree.kind(node)
                && is_named(tree, meta, "import")
                && is_named(tree, property, "meta")
            {
                // `import.meta.env.SSR`, which Vite sets on the server.
                found.extend(property_references(
                    tree,
                    sem,
                    parents,
                    source,
                    node,
                    &["env"],
                    &["SSR"],
                ));
            }
        });
        guards.not_top_level(functions);
        for reference in std::mem::take(&mut found) {
            available.extend(guards.checker(reference.node, true).map(Available::browser));
        }
        let programs: Vec<NodeIdentifier> = roots(file)
            .into_iter()
            .filter(|&root| matches!(tree.kind(root), Kind::Program(_)))
            .collect();
        for (module, export) in ENVIRONMENT_MODULES {
            for reference in
                import_references(tree, sem, parents, source, &programs, module, &[export])
            {
                if matches!(
                    tree.kind(reference.node),
                    Kind::Identifier(_) | Kind::Member { .. }
                ) && guards.is_top_level(reference.node)
                {
                    available.extend(
                        guards
                            .checker(reference.node, false)
                            .map(Available::browser),
                    );
                }
            }
        }
        let mut candidates = Vec::new();
        for reference in global_references_matching(
            tree,
            sem,
            parents,
            source,
            is_browser_global,
            &["globalThis"],
        ) {
            let node = reference.node;
            if !guards.is_top_level(node) {
                continue;
            }
            let name = reference.name;
            match guards.checker_from_reference(node) {
                Some(checker) => available.push(Available {
                    checker,
                    name: Some(name),
                    browser: name == "window" || name == "document",
                }),
                None => candidates.push((node, name)),
            }
        }
        report_unguarded(tree, available, candidates, reporter);
    }
}

/// Reports each candidate no guard covers.
fn report_unguarded(
    tree: &SyntaxTree,
    available: Vec<Available<'_>>,
    candidates: Vec<(NodeIdentifier, &str)>,
    reporter: &mut Reporter<'_>,
) {
    let mut browser = Coverage::default();
    let mut by_name: BTreeMap<&str, Coverage> = BTreeMap::new();
    for a in available {
        match a.name {
            Some(name) if !a.browser => by_name.entry(name).or_default().add(a.checker),
            _ => browser.add(a.checker),
        }
    }
    browser.index();
    for coverage in by_name.values_mut() {
        coverage.index();
    }
    for (node, name) in candidates {
        let at = span(tree, node);
        let guarded =
            browser.contains(node, at) || by_name.get(name).is_some_and(|c| c.contains(node, at));
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
}

/// Where a set of guards makes globals available, searchable in logarithmic time.
#[derive(Default)]
struct Coverage {
    /// Sorted by start, each with the furthest end of it and the ranges before it.
    ranges: Vec<(u32, u32)>,
    nodes: FxHashSet<NodeIdentifier>,
}

impl Coverage {
    fn add(&mut self, checker: Checker) {
        self.ranges.extend(
            checker
                .ranges
                .into_iter()
                .map(|r| (r.start_offset, r.end_offset)),
        );
        self.nodes.extend(checker.node);
    }

    fn index(&mut self) {
        self.ranges.sort_unstable();
        let mut furthest = 0;
        for range in &mut self.ranges {
            furthest = furthest.max(range.1);
            range.1 = furthest;
        }
    }

    /// Some range that starts at or before `at` also ends at or after it, or the guard is `node`.
    fn contains(&self, node: NodeIdentifier, at: Span) -> bool {
        let i = self.ranges.partition_point(|r| r.0 <= at.start_offset);
        (i > 0 && at.end_offset <= self.ranges[i - 1].1) || self.nodes.contains(&node)
    }
}

/// What the guards are decided by: the tree, and the template's `{#if}` tests and snippets.
struct Guards<'a> {
    tree: &'a SyntaxTree,
    values: StaticValues<'a>,
    parents: &'a [NodeIdentifier],
    /// A template `{#if}` test, with the ranges its branch and its `{:else}` cover.
    if_tests: FxHashMap<NodeIdentifier, (Option<Span>, Option<Span>)>,
    /// The outermost functions and snippets, in order; nothing in them is top-level.
    enclosed: Vec<Span>,
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
        let mut enclosed: Vec<Span> = Vec::new();
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
                    TemplateNode::Snippet { span, .. } => enclosed.push(*span),
                    _ => {}
                }
            }
        }
        Self {
            tree,
            values: StaticValues::new(tree, file.source(), Some(sem)),
            parents,
            if_tests,
            enclosed,
            statements_in_program: !file.is_component(),
        }
    }

    fn parent(&self, node: NodeIdentifier) -> Option<NodeIdentifier> {
        self.parents[node.index()].opt()
    }

    /// Adds the functions to the snippets, and keeps the outermost of them in order.
    fn not_top_level(&mut self, functions: Vec<Span>) {
        let mut spans = std::mem::take(&mut self.enclosed);
        spans.extend(functions);
        spans.sort_by_key(|s| s.start_offset);
        for s in spans {
            if self
                .enclosed
                .last()
                .is_none_or(|last| last.end_offset <= s.start_offset)
            {
                self.enclosed.push(s);
            }
        }
    }

    /// Outside every function and snippet: a node is in one exactly when its range is.
    fn is_top_level(&self, node: NodeIdentifier) -> bool {
        let at = span(self.tree, node);
        let i = self
            .enclosed
            .partition_point(|s| s.start_offset <= at.start_offset);
        !(i > 0 && at.end_offset <= self.enclosed[i - 1].end_offset)
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
                match (self.values.value(operand)?, operator) {
                    (Value::Undefined, StrictNotEq | NotEq) | (Value::Null, NotEq) => {
                        self.checker(parent, false)
                    }
                    (Value::Undefined, StrictEq | Eq) | (Value::Null, Eq) => {
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
                let undefined = match self.values.value(other)? {
                    Value::String(s) if s == "undefined" => true,
                    Value::String(s) if s == "object" => false,
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
}

/// From the first child's start to the last child's end; `None` without children.
fn cover(component: &Component, children: Range) -> Option<Span> {
    let children = component.children(children);
    let first = component.node(*children.first()?).span();
    let last = component.node(*children.last()?).span();
    Some(Span::new(first.start_offset, last.end_offset))
}
