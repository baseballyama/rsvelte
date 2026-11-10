//! Renderer output and structured template markers.

mod attributes;
mod blocks;
mod boundary;
mod children;
mod component;
mod directives;
mod dynamic_element;
mod elements {
    mod regular_element;
    mod select_value;
}
mod events;
mod expressions;
mod fragments;
mod special;

use std::borrow::Cow;

use events::{capture_event, push_captured_events};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::SourceLocation;
use rsvelte_markup_syntax::decode_attribute;
use rsvelte_svelte_semantic::analyze::Analysis;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    Attribute, AttributeValue, CompilerNodeIdentifier, CompilerSyntaxTree, Element, ElementKind,
    NodeKind, Part,
};
use rsvelte_svelte_semantic::resolve::{BindingKind, Resolution};
use rsvelte_svelte_syntax::parse::is_void;
use rsvelte_typescript_compile::copy::copy;
use rsvelte_typescript_semantic::scope::ScopeIdentifier;
use rsvelte_typescript_syntax::operators::{
    AssignmentOperator, BinaryOperator, UnaryOperator, UpdateOperator,
};
use rsvelte_typescript_syntax::syntax_tree::Control;
use rsvelte_typescript_syntax::syntax_tree::flag;
use rsvelte_typescript_syntax::{Kind, NodeIdentifier, SyntaxTree};
use rustc_hash::FxHashMap;

use super::javascript::{call_arguments, init_property, runtime_call};
use super::names::Names;
use super::script::ScriptRewrite;
use super::{
    Item, Prepared, Target, check_foreign_element, escape_markup, event_attribute,
    is_boolean_attribute, is_customizable_select, is_directive, is_load_error_element, needs_clsx,
    sanitize_template_string, synthetic_value, unsupported,
};
use crate::render_plan::RenderPlan;

type R<T> = Result<T, Diagnostic>;

const BLOCK_OPEN: &str = "<!--[-->";
const BLOCK_OPEN_ELSE: &str = "<!--[!-->";
const BLOCK_CLOSE: &str = "<!--]-->";
const EMPTY_COMMENT: &str = "<!---->";

/// One piece of a server template before it is folded into `$$renderer.push(…)` calls.
enum Piece {
    /// Cooked text.
    Text(String),
    /// A template literal, as cooked quasis and expressions.
    Template(Vec<String>, Vec<NodeIdentifier>),
    Expression(NodeIdentifier),
    Statement(NodeIdentifier),
}

/// `String(value ?? '')` for a known value.
fn known_string(v: &rsvelte_svelte_semantic::evaluate::Value) -> String {
    match v {
        rsvelte_svelte_semantic::evaluate::Value::Null
        | rsvelte_svelte_semantic::evaluate::Value::Undefined => String::new(),
        v => v.to_javascript_string(),
    }
}

struct ServerCompilationContext<'a> {
    javascript: &'a SyntaxTree,
    compiler_syntax_tree: &'a CompilerSyntaxTree,
    source_text: &'a str,
    res: &'a Resolution,
    an: &'a Analysis,
    out: SyntaxTree,
    names: Names,
    each_index: FxHashMap<CompilerNodeIdentifier, String>,
    plan: &'a RenderPlan,
    identity: &'a crate::OutputIdentity,
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
        exports,
        component_name,
        ..
    } = prepared;
    let mut sx = ServerCompilationContext {
        javascript,
        compiler_syntax_tree: input.component.compiler_syntax_tree,
        source_text: input.component.source_text,
        res,
        an,
        out,
        names,
        each_index,
        plan,
        identity,
    };
    let mut template = sx.fragment(input.component.compiler_syntax_tree.root)?;
    if uses_component_bindings(input) {
        template = sx.settle(&template);
    }

    let o = &mut sx.out;
    let mut body: Vec<NodeIdentifier> = instance;
    body.extend(template);
    body.extend(bind_props(
        javascript,
        input.component.source_text,
        res,
        &exports,
        o,
    ));
    if an.needs_context {
        let block = o.block(&body, SourceLocation::SYNTHETIC);
        let param = o.identifier("$$renderer");
        let f = o.arrow(&[param], block, false, false, SourceLocation::SYNTHETIC);
        let r = o.identifier("$$renderer");
        let callee = o.dot(r, "component");
        let call = o.call(callee, &[f], false, SourceLocation::SYNTHETIC);
        body = vec![o.expression_statement(call)];
    }
    let mut parameters = vec![o.identifier("$$renderer")];
    if an.needs_context || res.uses_props || !exports.is_empty() {
        parameters.push(o.identifier("$$props"));
    }
    let block = o.block(&body, SourceLocation::SYNTHETIC);
    let name = o.identifier(&component_name);
    let func = o.function(
        true,
        Some(name),
        &parameters,
        block,
        false,
        SourceLocation::SYNTHETIC,
    );

    let ns = o.identifier("$");
    let spec = o.import_namespace(ns, SourceLocation::SYNTHETIC);
    let source = o.write_string("svelte/internal/server");
    let mut program = vec![o.import(&[spec], source, false, SourceLocation::SYNTHETIC)];
    program.extend(hoisted);
    program.extend(module);
    program.push(o.export_default(func, SourceLocation::SYNTHETIC));
    let root = o.program(&program, SourceLocation::SYNTHETIC);
    Ok((sx.out, root))
}

/// Upstream's `$.bind_props($$props, …)`: the bindable props, then the instance's exports. In runes
/// mode it only throws when `undefined` is passed to a bound prop that has a default.
fn bind_props(
    javascript: &SyntaxTree,
    source_text: &str,
    res: &Resolution,
    exports: &[NodeIdentifier],
    o: &mut SyntaxTree,
) -> Option<NodeIdentifier> {
    let mut bound = Vec::new();
    for (b, binding) in res.sem.bindings.iter_enumerated() {
        let info = &res.bindings[b];
        let name = javascript.atoms.get(binding.name);
        if binding.scope != ScopeIdentifier::ROOT
            || info.kind != BindingKind::BindableProperty
            || name.starts_with("$$")
        {
            continue;
        }
        let key = info.prop_key.map_or(Cow::Borrowed(name), |k| {
            super::javascript::prop_alias(javascript, source_text, k)
        });
        let value = o.identifier(name);
        bound.push(init_property(o, &key, value));
    }
    bound.extend(super::javascript::export_properties(o, javascript, exports));
    if bound.is_empty() {
        return None;
    }
    let props = o.identifier("$$props");
    let object = o.object(&bound, SourceLocation::SYNTHETIC);
    let call = o.runtime("$", "bind_props", &[props, object]);
    Some(o.expression_statement(call))
}

impl ServerCompilationContext<'_> {
    /// `$$renderer.push(text)` with one string literal, which `build_template` would merge with
    /// its neighbours.
    pub(super) fn push_literal(&mut self, text: &str) -> NodeIdentifier {
        let text = self.out.write_string(text);
        let call = self.out.runtime("$$renderer", "push", &[text]);
        self.out.expression_statement(call)
    }

    /// Renders the template until no child binding changes a value (`$$settled`).
    fn settle(&mut self, template: &[NodeIdentifier]) -> Vec<NodeIdentifier> {
        let o = &mut self.out;
        let settled = o.identifier("$$settled");
        let yes = o.write_boolean(true, SourceLocation::SYNTHETIC);
        let declare_settled = o.let_(flag::LET, settled, Some(yes));
        let inner = o.identifier("$$inner_renderer");
        let declare_inner = o.let_(flag::LET, inner, None);
        let body = o.block(template, SourceLocation::SYNTHETIC);
        let name = o.identifier("$$render_inner");
        let renderer = o.identifier("$$renderer");
        let render_inner = o.function(
            true,
            Some(name),
            &[renderer],
            body,
            false,
            SourceLocation::SYNTHETIC,
        );
        let reset = set_settled(o, true);
        let inner = o.identifier("$$inner_renderer");
        let copy = o.runtime("$$renderer", "copy", &[]);
        let copy = assign_statement(o, inner, copy);
        let inner = o.identifier("$$inner_renderer");
        let name = o.identifier("$$render_inner");
        let render = o.call0(name, &[inner]);
        let loop_body = [reset, copy, o.expression_statement(render)];
        let loop_body = o.block(&loop_body, SourceLocation::SYNTHETIC);
        let settled = o.identifier("$$settled");
        let unsettled = o.unary(UnaryOperator::Not, settled, SourceLocation::SYNTHETIC);
        let do_while = o.control(
            Control::While {
                test: unsettled,
                body: loop_body,
                is_do: true,
            },
            SourceLocation::SYNTHETIC,
        );
        let inner = o.identifier("$$inner_renderer");
        let subsume = o.runtime("$$renderer", "subsume", &[inner]);
        vec![
            declare_settled,
            declare_inner,
            render_inner,
            do_while,
            o.expression_statement(subsume),
        ]
    }
}

fn assign_statement(
    out: &mut SyntaxTree,
    target: NodeIdentifier,
    value: NodeIdentifier,
) -> NodeIdentifier {
    let assignment = out.assign(
        AssignmentOperator::Assign,
        target,
        value,
        SourceLocation::SYNTHETIC,
    );
    out.expression_statement(assignment)
}

/// `$$settled = value;`: a child binding that writes a value makes the render run again.
fn set_settled(out: &mut SyntaxTree, value: bool) -> NodeIdentifier {
    let settled = out.identifier("$$settled");
    let value = out.write_boolean(value, SourceLocation::SYNTHETIC);
    assign_statement(out, settled, value)
}

/// Upstream `analysis.uses_component_bindings`.
fn uses_component_bindings(input: &super::CompileInput<'_>) -> bool {
    let tree = input.component.compiler_syntax_tree;
    tree.elements().any(|(_, element)| {
        element.kind.renders_component()
            && tree.attributes(element.attributes).iter().any(|a| {
                matches!(a.value, AttributeValue::Bind(_))
                    && a.name.text(input.component.source_text) != "this"
            })
    })
}
