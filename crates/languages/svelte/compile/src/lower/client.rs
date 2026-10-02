//! DOM templates and reactive updates.

mod attributes;
mod blocks;
mod children;
mod directives;
mod elements;
mod events;
mod expressions;
mod fragments;
mod template;
mod template_chunk;

use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::source::positions::SourceLocation;
use rsvelte_markup::decode_text;
use rsvelte_svelte::compilation::compiler_syntax_tree::{
    Attribute, AttributeValue, CompilerNodeIdentifier, CompilerSyntaxTree, Element, ElementKind,
    NodeKind, Part,
};
use rsvelte_svelte::semantic::analyze::{Analysis, ExpressionMetadata};
use rsvelte_svelte::semantic::resolve::Resolution;
use rsvelte_svelte::syntax::parse::is_void;
use rsvelte_typescript::copy::copy;
use rsvelte_typescript::operators::{AssignmentOperator, BinaryOperator, LogicalOperator};
use rsvelte_typescript::scope::{BindingIdentifier, ScopeIdentifier};
use rsvelte_typescript::syntax_tree::flag;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rustc_hash::FxHashMap;

use super::javascript::{init_property, runtime_call};
use super::names::Names;
use super::script::ScriptRewrite;
use super::{
    Item, Prepared, Target, check_binding, check_foreign_element, escape_markup, event_attribute,
    has_dependency, is_customizable_select, is_directive, is_load_error_element, needs_clsx,
    sanitize_template_string, synthetic_value, unsupported,
};
use crate::render_plan::RenderPlan;

const TEMPLATE_FRAGMENT: u32 = 1;
const TEMPLATE_USE_IMPORT_NODE: u32 = 2;
const EACH_ITEM_REACTIVE: u32 = 1;
const EACH_INDEX_REACTIVE: u32 = 1 << 1;
const EACH_IS_CONTROLLED: u32 = 1 << 2;
const EACH_ITEM_IMMUTABLE: u32 = 1 << 4;
const PASSIVE_EVENTS: &[&str] = &["touchstart", "touchmove"];
const DELEGATED_EVENTS: &[&str] = &[
    "beforeinput",
    "click",
    "change",
    "dblclick",
    "contextmenu",
    "focusin",
    "focusout",
    "input",
    "keydown",
    "keyup",
    "mousedown",
    "mousemove",
    "mouseout",
    "mouseover",
    "mouseup",
    "pointerdown",
    "pointermove",
    "pointerout",
    "pointerover",
    "pointerup",
    "touchend",
    "touchmove",
    "touchstart",
];

type R<T> = Result<T, Diagnostic>;

/// Upstream `normalize_attribute`.
#[must_use]
pub(super) fn normalize_attribute(name: &str) -> String {
    let lower = name.to_ascii_lowercase();
    let alias = match lower.as_str() {
        "formnovalidate" => "formNoValidate",
        "ismap" => "isMap",
        "nomodule" => "noModule",
        "playsinline" => "playsInline",
        "readonly" => "readOnly",
        "defaultvalue" => "defaultValue",
        "defaultchecked" => "defaultChecked",
        "srcobject" => "srcObject",
        "novalidate" => "noValidate",
        "allowfullscreen" => "allowFullscreen",
        "disablepictureinpicture" => "disablePictureInPicture",
        "disableremoteplayback" => "disableRemotePlayback",
        _ => return lower,
    };
    alias.to_owned()
}

use template::Template;

/// Per fragment: the template and the memoized expressions (`$0`, `$1`, …) of its render effect.
#[derive(Default)]
struct Frag {
    tpl: Template,
    memo: Vec<NodeIdentifier>,
}

#[derive(Default)]
struct Lists {
    initializer: Vec<NodeIdentifier>,
    update: Vec<NodeIdentifier>,
    after: Vec<NodeIdentifier>,
}

/// How to reach the first node of a child list (upstream `process_children`'s `initial`).
#[derive(Clone)]
enum Prev {
    Call { method: &'static str, of: String },
    Identifier(String),
}

struct ClientCompilationContext<'a> {
    javascript: &'a SyntaxTree,
    compiler_syntax_tree: &'a CompilerSyntaxTree,
    source_text: &'a str,
    res: &'a Resolution,
    an: &'a Analysis,
    out: SyntaxTree,
    names: Names,
    hoisted: Vec<NodeIdentifier>,
    templates: FxHashMap<String, String>,
    events: Vec<String>,
    /// The `{#each}` names in scope, and whether a read goes through `$.get`.
    each: FxHashMap<BindingIdentifier, bool>,
    each_index: FxHashMap<CompilerNodeIdentifier, String>,
    /// Where names in lowered expressions resolve: the innermost `{#each}` scope.
    scope: ScopeIdentifier,
    plan: &'a RenderPlan,
    identity: &'a crate::OutputIdentity,
}

pub(super) fn lower_prepared(
    facts: super::Lowering<'_, '_>,
    prepared: Prepared,
) -> R<(SyntaxTree, NodeIdentifier)> {
    let super::Lowering {
        input,
        res,
        an,
        plan,
        identity,
    } = facts;
    let javascript = input.component.javascript;
    let Prepared {
        out,
        names,
        each_index,
        hoisted,
        instance,
    } = prepared;
    let mut context = ClientCompilationContext {
        javascript,
        compiler_syntax_tree: input.component.compiler_syntax_tree,
        source_text: input.component.source_text,
        res,
        an,
        out,
        names,
        hoisted,
        templates: FxHashMap::default(),
        events: Vec::new(),
        each: FxHashMap::default(),
        each_index,
        scope: ScopeIdentifier::ROOT,
        plan,
        identity,
    };
    let template = context.fragment(input.component.compiler_syntax_tree.root)?;

    let o = &mut context.out;
    let mut body = Vec::new();
    if an.needs_context {
        let props = o.identifier("$$props");
        let t = o.write_boolean(true, SourceLocation::SYNTHETIC);
        let push = o.runtime("$", "push", &[props, t]);
        body.push(o.expression_statement(push));
    }
    body.extend(instance);
    body.extend(template);
    if an.needs_context {
        let pop = o.runtime("$", "pop", &[]);
        body.push(o.expression_statement(pop));
    }
    let mut parameters = vec![o.identifier("$$anchor")];
    if res.uses_props || an.needs_context {
        parameters.push(o.identifier("$$props"));
    }
    let block = o.block(&body, SourceLocation::SYNTHETIC);
    let name = o.identifier(&identity.name);
    let func = o.function(
        true,
        Some(name),
        &parameters,
        block,
        false,
        SourceLocation::SYNTHETIC,
    );

    let mut program = Vec::new();
    let src1 = o.write_string("svelte/internal/disclose-version");
    program.push(o.import(&[], src1, false, SourceLocation::SYNTHETIC));
    let ns = o.identifier("$");
    let spec = o.import_namespace(ns, SourceLocation::SYNTHETIC);
    let src2 = o.write_string("svelte/internal/client");
    program.push(o.import(&[spec], src2, false, SourceLocation::SYNTHETIC));
    program.extend(context.hoisted.iter().copied());
    let o = &mut context.out;
    program.push(o.export_default(func, SourceLocation::SYNTHETIC));
    if !context.events.is_empty() {
        let names: Vec<NodeIdentifier> = context.events.iter().map(|e| o.write_string(e)).collect();
        let arr = o.array(&names, SourceLocation::SYNTHETIC);
        let d = o.runtime("$", "delegate", &[arr]);
        program.push(o.expression_statement(d));
    }
    let root = o.program(&program, SourceLocation::SYNTHETIC);
    Ok((context.out, root))
}

struct Walk {
    prev: Prev,
    skipped: u32,
}

impl Walk {
    /// The node a static element would be visited with (upstream passes the parent's state).
    fn prev_name(&self) -> String {
        match &self.prev {
            Prev::Identifier(n) => n.clone(),
            Prev::Call { of, .. } => of.clone(),
        }
    }
}
