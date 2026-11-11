use std::collections::BTreeMap;

use oxc_ast::AstKind;
use oxc_ast::ast::Statement;
use oxc_semantic::{AstNodes, NodeId};
use oxc_syntax::operator::BinaryOperator::{
    Equality, Inequality, Instanceof, StrictEquality, StrictInequality,
};
use oxc_syntax::operator::{LogicalOperator, UnaryOperator};
use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte_syntax::syntax_tree::{Component, Range, TemplateNode};
use rsvelte_typescript_semantic::globals::{Global, global};
use rsvelte_typescript_semantic::reference_tracker::{
    global_references_matching, import_references, property_references,
};
use rsvelte_typescript_semantic::semantic::Semantic;
use rsvelte_typescript_semantic::static_value::{StaticValues, Value};
use rustc_hash::{FxHashMap, FxHashSet};

use super::javascript::walk;
use super::nodes::span;
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
        let semantic = file.semantic();
        let mut guards = Guards::new(file, semantic);
        let mut found = Vec::new();
        let mut available: Vec<Available<'_>> = Vec::new();
        let mut functions = Vec::new();
        walk(file, |node| match node.kind() {
            AstKind::Function(function) => functions.push(span(function)),
            AstKind::ArrowFunctionExpression(arrow) => functions.push(span(arrow)),
            AstKind::ImportMeta(_) => {
                // `import.meta.env.SSR`, which Vite sets on the server.
                found.extend(property_references(semantic, node.id(), &["env"], &["SSR"]));
            }
            _ => {}
        });
        guards.not_top_level(functions);
        for reference in std::mem::take(&mut found) {
            available.extend(guards.checker(reference.node, true).map(Available::browser));
        }
        let programs = file.programs();
        for (module, export) in ENVIRONMENT_MODULES {
            for reference in import_references(semantic, &programs, module, &[export]) {
                if matches!(
                    guards.nodes.kind(reference.node),
                    AstKind::IdentifierReference(_)
                        | AstKind::StaticMemberExpression(_)
                        | AstKind::ComputedMemberExpression(_)
                        | AstKind::PrivateFieldExpression(_)
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
        for reference in global_references_matching(semantic, is_browser_global, &["globalThis"]) {
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
        report_unguarded(guards.nodes, available, candidates, reporter);
    }
}

/// Reports each candidate no guard covers.
fn report_unguarded(
    nodes: &AstNodes<'_>,
    available: Vec<Available<'_>>,
    candidates: Vec<(NodeId, &str)>,
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
        let at = span(&nodes.kind(node));
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
    node: Option<NodeId>,
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
    nodes: FxHashSet<NodeId>,
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
    fn contains(&self, node: NodeId, at: Span) -> bool {
        let i = self.ranges.partition_point(|r| r.0 <= at.start_offset);
        (i > 0 && at.end_offset <= self.ranges[i - 1].1) || self.nodes.contains(&node)
    }
}

/// What the guards are decided by: the trees, and the template's `{#if}` tests and snippets.
struct Guards<'a> {
    nodes: &'a AstNodes<'a>,
    values: StaticValues<'a>,
    /// A template `{#if}` test, with the ranges its branch and its `{:else}` cover.
    if_tests: FxHashMap<NodeId, (Option<Span>, Option<Span>)>,
    /// The outermost functions and snippets, in order; nothing in them is top-level.
    enclosed: Vec<Span>,
    /// A script's statements are not in a program upstream but in a `<script>` element.
    statements_in_program: bool,
}

impl<'a> Guards<'a> {
    fn new(file: &File<'a>, semantic: &'a Semantic) -> Self {
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
                            component.javascript.get_expression(*test).node_id(),
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
            nodes: semantic.nodes(),
            values: StaticValues::new(semantic),
            if_tests,
            enclosed,
            statements_in_program: !file.is_component(),
        }
    }

    /// The parent of `node`; `None` at a program, whose children are a script's statements and
    /// the template's expressions.
    fn parent(&self, node: NodeId) -> Option<NodeId> {
        let parent = self.nodes.parent_id(node);
        (parent != node && !matches!(self.nodes.kind(parent), AstKind::Program(_)))
            .then_some(parent)
    }

    fn span(&self, node: NodeId) -> Span {
        span(&self.nodes.kind(node))
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
    fn is_top_level(&self, node: NodeId) -> bool {
        let at = self.span(node);
        let i = self
            .enclosed
            .partition_point(|s| s.start_offset <= at.start_offset);
        !(i > 0 && at.end_offset <= self.enclosed[i - 1].end_offset)
    }

    fn is_member(&self, node: NodeId) -> bool {
        matches!(
            self.nodes.kind(node),
            AstKind::StaticMemberExpression(_)
                | AstKind::ComputedMemberExpression(_)
                | AstKind::PrivateFieldExpression(_)
        )
    }

    /// `getGuardCheckerFromReference`: what a reference to a browser global guards, when it is
    /// a check for that global.
    fn checker_from_reference(&self, node: NodeId) -> Option<Checker> {
        let nodes = self.nodes;
        let is_member = self.is_member(node);
        let parent = self.parent(node);
        match parent.map(|p| (p, nodes.kind(p))) {
            Some((parent, AstKind::BinaryExpression(binary))) => {
                let operator = binary.operator;
                let left = binary.left.node_id() == node;
                if operator == Instanceof && left && is_member {
                    return self.checker(parent, false);
                }
                let operand = if left { &binary.right } else { &binary.left };
                if !is_member {
                    return None;
                }
                match (self.values.value(operand)?, operator) {
                    (Value::Undefined, StrictInequality | Inequality)
                    | (Value::Null, Inequality) => self.checker(parent, false),
                    (Value::Undefined, StrictEquality | Equality) | (Value::Null, Equality) => {
                        self.checker(parent, true)
                    }
                    _ => None,
                }
            }
            Some((parent, AstKind::UnaryExpression(unary)))
                if unary.operator == UnaryOperator::Typeof =>
            {
                let comparison = self.parent(parent)?;
                let AstKind::BinaryExpression(binary) = nodes.kind(comparison) else {
                    return None;
                };
                let other = if binary.left.node_id() == parent {
                    &binary.right
                } else {
                    &binary.left
                };
                let undefined = match self.values.value(other)? {
                    Value::String(s) if s == "undefined" => true,
                    Value::String(s) if s == "object" => false,
                    _ => return None,
                };
                match binary.operator {
                    StrictInequality | Inequality => self.checker(comparison, !undefined),
                    StrictEquality | Equality => self.checker(comparison, undefined),
                    _ => None,
                }
            }
            _ if is_member => {
                let optional_use = parent.is_some_and(|p| match nodes.kind(p) {
                    AstKind::CallExpression(call) => call.callee.node_id() == node && call.optional,
                    AstKind::StaticMemberExpression(member) => {
                        member.object.node_id() == node && member.optional
                    }
                    AstKind::ComputedMemberExpression(member) => {
                        member.object.node_id() == node && member.optional
                    }
                    AstKind::PrivateFieldExpression(member) => {
                        member.object.node_id() == node && member.optional
                    }
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
    fn checker(&self, node: NodeId, not: bool) -> Option<Checker> {
        let Some(parent) = self.parent(node) else {
            let &(consequent, alternate) = self.if_tests.get(&node)?;
            return if not { alternate } else { consequent }.map(Checker::range);
        };
        match self.nodes.kind(parent) {
            AstKind::ConditionalExpression(conditional) => Some(Checker::range(span(if not {
                &conditional.alternate
            } else {
                &conditional.consequent
            }))),
            AstKind::UnaryExpression(unary) if unary.operator == UnaryOperator::LogicalNot => {
                self.checker(parent, !not)
            }
            AstKind::IfStatement(statement) if statement.test.node_id() == node => {
                if !not {
                    return Some(Checker::range(span(&statement.consequent)));
                }
                if let Some(alternate) = &statement.alternate {
                    return Some(Checker::range(span(alternate)));
                }
                if !jumps_on_every_path(&statement.consequent) {
                    return None;
                }
                let host = self.nodes.parent_id(parent);
                let hosts = match self.nodes.kind(host) {
                    AstKind::BlockStatement(_) => true,
                    AstKind::Program(_) => self.statements_in_program,
                    _ => false,
                };
                hosts.then(|| {
                    Checker::range(Span::new(
                        self.span(parent).end_offset,
                        self.span(host).end_offset,
                    ))
                })
            }
            AstKind::LogicalExpression(logical) => {
                if !not && logical.operator == LogicalOperator::And {
                    let mut checker = self.checker(parent, not);
                    if logical.left.node_id() == node {
                        checker
                            .get_or_insert_default()
                            .ranges
                            .push(span(&logical.right));
                    }
                    return checker;
                }
                if not && logical.operator == LogicalOperator::Or {
                    return self.checker(parent, not);
                }
                None
            }
            _ => None,
        }
    }
}

/// `hasJumpStatementInAllPath`.
fn jumps_on_every_path(statement: &Statement<'_>) -> bool {
    match statement {
        Statement::ReturnStatement(_)
        | Statement::BreakStatement(_)
        | Statement::ContinueStatement(_) => true,
        Statement::BlockStatement(block) => block.body.iter().any(jumps_on_every_path),
        Statement::IfStatement(statement) => {
            statement.alternate.as_ref().is_some_and(|alternate| {
                jumps_on_every_path(alternate) && jumps_on_every_path(&statement.consequent)
            })
        }
        _ => false,
    }
}

/// From the first child's start to the last child's end; `None` without children.
fn cover(component: &Component, children: Range) -> Option<Span> {
    let children = component.children(children);
    let first = component.node(*children.first()?).span();
    let last = component.node(*children.last()?).span();
    Some(Span::new(first.start_offset, last.end_offset))
}
