//! `svelte/no-dom-manipulating` — disallow directly manipulating a DOM element
//! that Svelte owns (one captured via `bind:this`). Mutating it behind Svelte's
//! back desyncs the runtime's view of the DOM.
//!
//! Port of the eslint-plugin-svelte rule. A DOM variable is a top-level binding
//! captured by `bind:this` on an HTML element (`RegularElement`) or
//! `<svelte:element>` — not on components. Every *reference* of that variable
//! (resolved through the shared tracker: both scripts and template-expression
//! handlers, shadows excluded) is checked for `domVar.method(...)` (a
//! DOM-mutating method) or `domVar.prop = …` (a DOM-mutating property),
//! reported at the member expression. `getPropertyName` semantics mean a
//! literal computed access (`el['remove']()`) matches; a variable key does not.
//! Optional chaining is unwrapped via `ChainExpression`, mirroring upstream.

use std::collections::HashSet;

use serde_json::Value;

use rsvelte_core::ast::template::Root;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::store_refs::{RefTracker, component_tracker, member_property_name};
use crate::script::{ProgramView, ScriptKind, ScriptRule, node_start, node_type, walk_js};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-dom-manipulating",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Error,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow DOM manipulating",
    options_schema: None,
};

const MESSAGE: &str = "Don't manipulate the DOM directly. The Svelte runtime can get confused if there is a difference between the actual DOM and the DOM expected by the Svelte runtime.";

const DOM_METHODS: &[&str] = &[
    "appendChild",
    "insertBefore",
    "normalize",
    "removeChild",
    "replaceChild",
    "after",
    "append",
    "before",
    "insertAdjacentElement",
    "insertAdjacentHTML",
    "insertAdjacentText",
    "prepend",
    "remove",
    "replaceChildren",
    "replaceWith",
];

const DOM_PROPERTIES: &[&str] = &[
    "textContent",
    "innerHTML",
    "outerHTML",
    "innerText",
    "outerText",
];

fn span(node: &Value) -> Option<(u32, u32)> {
    Some((
        node_start(node)?,
        node.get("end")
            .and_then(Value::as_u64)
            .and_then(|e| u32::try_from(e).ok())?,
    ))
}

/// Check one reference of a DOM variable — upstream's `verifyIdentifier`.
fn verify_reference(tracker: &RefTracker<'_>, ident: &Value, reports: &mut Vec<(u32, u32)>) {
    let Some(member) = tracker.parent_of(ident) else {
        return;
    };
    if node_type(member) != Some("MemberExpression")
        || member
            .get("object")
            .and_then(node_start)
            .zip(node_start(ident))
            .is_none_or(|(a, b)| a != b)
    {
        return;
    }
    let Some(name) = member_property_name(member) else {
        return;
    };
    // Walk up past ChainExpression wrappers to the call / assignment.
    let mut target = member;
    let mut parent = tracker.parent_of(target);
    while let Some(p) = parent
        && node_type(p) == Some("ChainExpression")
    {
        target = p;
        parent = tracker.parent_of(p);
    }
    let Some(parent) = parent else {
        return;
    };
    let manipulates = match node_type(parent) {
        Some("CallExpression") => {
            parent
                .get("callee")
                .and_then(node_start)
                .zip(node_start(target))
                .is_some_and(|(a, b)| a == b)
                && DOM_METHODS.contains(&name.as_str())
        }
        Some("AssignmentExpression") => {
            parent
                .get("left")
                .and_then(node_start)
                .zip(node_start(target))
                .is_some_and(|(a, b)| a == b)
                && DOM_PROPERTIES.contains(&name.as_str())
        }
        _ => false,
    };
    if manipulates && let Some(sp) = span(member) {
        reports.push(sp);
    }
}

#[derive(Default)]
pub struct NoDomManipulating;

impl ScriptRule for NoDomManipulating {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, _ctx: &mut LintContext, _program: &ProgramView<'_>, _kind: ScriptKind) {
        // A standalone module has no template, hence no `bind:this` — the
        // whole rule lives in `check_root`.
    }
}

impl Rule for NoDomManipulating {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        let root_json = ctx.root_json(root);
        if root_json.is_null() {
            return;
        }
        let Some(fragment) = root_json.get("fragment") else {
            return;
        };
        let tracker = component_tracker(ctx.source(), root, &root_json);

        // `bind:this={ident}` on an HTML element / `<svelte:element>`, resolved
        // to a top-level variable (upstream: scope type module/global).
        let mut dom_vars = Vec::new();
        let mut seen = HashSet::new();
        walk_js(fragment, |node, ancestors| {
            if node_type(node) != Some("BindDirective")
                || node.get("name").and_then(Value::as_str) != Some("this")
            {
                return;
            }
            let Some(expr) = node.get("expression") else {
                return;
            };
            if node_type(expr) != Some("Identifier") {
                return;
            }
            let owner = ancestors.last().and_then(|p| node_type(p));
            if owner != Some("RegularElement") && owner != Some("SvelteElement") {
                return;
            }
            if let Some(var) = tracker.find_variable(expr)
                && tracker.is_root(var)
                && seen.insert(var)
            {
                dom_vars.push(var);
            }
        });

        let mut reports: Vec<(u32, u32)> = Vec::new();
        for var in dom_vars {
            for ident in tracker.read_references(var) {
                verify_reference(&tracker, ident, &mut reports);
            }
        }
        reports.sort_unstable();
        reports.dedup();
        for (start, end) in reports {
            ctx.report(start, end, MESSAGE);
        }
    }
}
