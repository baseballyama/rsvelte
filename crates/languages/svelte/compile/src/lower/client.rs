//! DOM templates and reactive updates.

mod attributes;
mod binding_accessors;
mod blocks;
mod boundary;
mod children;
mod component;
mod custom_element;
mod directives;
mod dynamic_element;
mod elements;
mod events;
mod expressions;
mod fragments;
mod global_bindings;
mod special;
mod template;
mod template_chunk;
mod title;

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::SourceLocation;
use rsvelte_markup_syntax::decode_text;
use rsvelte_svelte_semantic::analyze::Analysis;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    Attribute, AttributeValue, CompilerNodeIdentifier, CompilerSyntaxTree, Element, ElementKind,
    NodeKind, Part,
};
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_svelte_syntax::parse::is_void;
use rsvelte_typescript_compile::copy::copy;
use rsvelte_typescript_semantic::scope::{BindingIdentifier, ScopeIdentifier};
use rsvelte_typescript_syntax::operators::{AssignmentOperator, BinaryOperator, LogicalOperator};
use rsvelte_typescript_syntax::syntax_tree::flag;
use rsvelte_typescript_syntax::{Kind, NodeIdentifier, SyntaxTree};
use rustc_hash::FxHashMap;

use super::javascript::{init_property, runtime_call, unthunk};
use super::names::Names;
use super::script::{Read, ScriptRewrite};
use super::{
    Item, Prepared, Target, check_foreign_element, escape_markup, event_attribute, has_dependency,
    is_customizable_select, is_directive, is_load_error_element, needs_clsx,
    sanitize_template_string, synthetic_value, unsupported,
};
use crate::render_plan::RenderPlan;

const PASSIVE_EVENTS: &[&str] = &["touchstart", "touchmove"];

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
    memo: Memo,
}

/// The memoized expressions of one render effect or one component's props, and how they are
/// read.
#[derive(Default)]
struct Memo {
    values: Vec<NodeIdentifier>,
    /// The source expression each value was built from, which a derived's callback reads.
    sources: Vec<NodeIdentifier>,
    reads: MemoReads,
}

impl Memo {
    /// `$i`, the name the `i`th value is read by.
    fn name(out: &mut SyntaxTree, i: usize) -> NodeIdentifier {
        out.identifier(&format!("${i}"))
    }

    /// The names of all values.
    fn names(&self, out: &mut SyntaxTree) -> Vec<NodeIdentifier> {
        (0..self.values.len()).map(|i| Self::name(out, i)).collect()
    }
}

/// How memoized expressions are read: as the render effect's parameters, or, for a component's
/// props, from deriveds that also hold a stateful value when `if_state`.
#[derive(Clone, Copy, Default)]
enum MemoReads {
    #[default]
    Effect,
    Derived {
        if_state: bool,
    },
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
    /// How the template's names in scope are read.
    reads: FxHashMap<BindingIdentifier, Read>,
    each_index: FxHashMap<CompilerNodeIdentifier, String>,
    /// Where names in lowered expressions resolve: the innermost `{#each}` scope.
    scope: ScopeIdentifier,
    plan: &'a RenderPlan,
    identity: &'a crate::OutputIdentity,
    component_name: String,
    custom_element: Option<&'a super::custom_element::CustomElement>,
    rest_reads: &'a rustc_hash::FxHashSet<NodeIdentifier>,
    needs_props: bool,
}

pub(super) fn lower_prepared(
    facts: super::Lowering<'_, '_>,
    prepared: Prepared<'_>,
) -> R<(SyntaxTree, NodeIdentifier)> {
    let super::Lowering {
        input,
        res,
        an,
        plan,
        identity,
        ..
    } = facts;
    let javascript = input.component.javascript;
    let Prepared {
        out,
        names,
        each_index,
        module,
        hoisted,
        instance,
        custom_element,
        component_name,
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
        reads: FxHashMap::default(),
        each_index,
        scope: ScopeIdentifier::ROOT,
        plan,
        identity,
        component_name,
        custom_element,
        rest_reads: &facts.validated.rest_reads,
        needs_props: res.sem.references.iter().any(|reference| {
            javascript.name(reference.node) == "$host"
                && res.sem.binding_of(reference.node).is_none()
        }),
    };
    let template = context.fragment(input.component.compiler_syntax_tree.root)?;

    let stylesheet = context.custom_element_stylesheet(facts.stylesheet);
    let exports = context.custom_element_exports();
    let func = context.component_function(instance, template, &exports, stylesheet.is_some());
    let registration = context.custom_element_registration();
    let o = &mut context.out;

    let mut program = Vec::new();
    let src1 = o.write_string("svelte/internal/disclose-version");
    program.push(o.import(&[], src1, false, SourceLocation::SYNTHETIC));
    let ns = o.identifier("$");
    let spec = o.import_namespace(ns, SourceLocation::SYNTHETIC);
    let src2 = o.write_string("svelte/internal/client");
    let runtime = o.import(&[spec], src2, false, SourceLocation::SYNTHETIC);
    // Upstream lists `[...module, $, ...hoisted]` and moves every import to the top in that order.
    let (imports, rest): (Vec<_>, Vec<_>) = module
        .iter()
        .copied()
        .chain([runtime])
        .chain(context.hoisted.iter().copied())
        .partition(|&statement| matches!(o.kind(statement), Kind::Import { .. }));
    program.extend(imports);
    program.extend(rest);
    program.extend(stylesheet);
    let o = &mut context.out;
    program.push(o.export_default(func, SourceLocation::SYNTHETIC));
    if !context.events.is_empty() {
        let names: Vec<NodeIdentifier> = context.events.iter().map(|e| o.write_string(e)).collect();
        let arr = o.array(&names, SourceLocation::SYNTHETIC);
        let d = o.runtime("$", "delegate", &[arr]);
        program.push(o.expression_statement(d));
    }
    program.extend(registration);
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

impl ClientCompilationContext<'_> {
    fn component_function(
        &mut self,
        instance: Vec<NodeIdentifier>,
        template: Vec<NodeIdentifier>,
        exports: &[NodeIdentifier],
        stylesheet: bool,
    ) -> NodeIdentifier {
        let needs_context = self.an.needs_context || !exports.is_empty();
        let o = &mut self.out;
        let mut body = Vec::new();
        if needs_context {
            let props = o.identifier("$$props");
            let t = o.write_boolean(true, SourceLocation::SYNTHETIC);
            let push = o.runtime("$", "push", &[props, t]);
            body.push(o.expression_statement(push));
        }
        if stylesheet {
            let anchor = o.identifier("$$anchor");
            let stylesheet = o.identifier("$$css");
            let call = o.runtime("$", "append_styles", &[anchor, stylesheet]);
            body.push(o.expression_statement(call));
        }
        body.extend(instance);
        if !exports.is_empty() {
            let object = o.object(exports, SourceLocation::SYNTHETIC);
            let name = o.identifier("$$exports");
            body.push(o.let_(flag::VAR, name, Some(object)));
        }
        body.extend(template);
        if needs_context {
            if exports.is_empty() {
                let pop = o.runtime("$", "pop", &[]);
                body.push(o.expression_statement(pop));
            } else {
                let exports = o.identifier("$$exports");
                let pop = o.runtime("$", "pop", &[exports]);
                body.push(o.return_(Some(pop), SourceLocation::SYNTHETIC));
            }
        }
        let mut parameters = vec![o.identifier("$$anchor")];
        if self.res.uses_props || needs_context || self.needs_props {
            parameters.push(o.identifier("$$props"));
        }
        let block = o.block(&body, SourceLocation::SYNTHETIC);
        let name = o.identifier(&self.component_name);
        o.function(
            true,
            Some(name),
            &parameters,
            block,
            false,
            SourceLocation::SYNTHETIC,
        )
    }
}
