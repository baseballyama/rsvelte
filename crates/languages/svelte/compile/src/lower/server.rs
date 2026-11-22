//! Renderer output and structured template markers.

mod attributes;
mod blocks;
mod boundary;
mod children;
mod component;
mod const_tag;
mod directives;
mod dynamic_element;
mod elements {
    mod regular_element;
    mod select_value;
}
mod events;
mod expressions;
mod fragments;
mod slot_element;
mod snippets;
mod special;
mod template;

use std::borrow::Cow;

use oxc_ast::ast::{BindingIdentifier, Statement, UnaryOperator, VariableDeclarationKind};
use oxc_semantic::SymbolId;
use oxc_span::{SPAN, Span};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_svelte_semantic::analyze::Analysis;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    AttributeValue, CompilerNodeIdentifier, CompilerSyntaxTree,
};
use rsvelte_svelte_semantic::resolve::{BindingKind, Resolution};
use rsvelte_typescript_tree::Tree;
use rustc_hash::{FxHashMap, FxHashSet};

use super::builder::{Runtime, export_default, import};
use super::names::Names;
use super::{Builder, Prepared, props_id_declaration, takes_props, uses_slots};
use crate::input::{CompileInput, Target};
use crate::render_plan::RenderPlan;

type R<T> = Result<T, Diagnostic>;

const BLOCK_OPEN: &str = "<!--[-->";
const BLOCK_OPEN_ELSE: &str = "<!--[!-->";
const BLOCK_CLOSE: &str = "<!--]-->";
const EMPTY_COMMENT: &str = "<!---->";

struct ServerCompilationContext<'c, 'o> {
    b: &'c Builder<'o>,
    javascript: &'o Tree,
    compiler_syntax_tree: &'o CompilerSyntaxTree,
    source_text: &'o str,
    res: &'c Resolution,
    an: &'c Analysis,
    names: Names<'c>,
    each_index: FxHashMap<CompilerNodeIdentifier, String>,
    /// The `{#each}` blocks that pass their index to a `bind:group`.
    group_each: FxHashSet<CompilerNodeIdentifier>,
    plan: &'c RenderPlan,
    identity: &'c crate::OutputIdentity,
    /// The snippets the block being lowered declares (upstream `state.init`).
    snippets: Vec<Statement<'o>>,
    /// Top-level snippets that read only module-level names, declared beside the component.
    hoisted_snippets: Vec<Statement<'o>>,
    hoistable: &'c FxHashSet<SymbolId>,
    /// The component has an instance script, whose names its function declares.
    instance_script: bool,
    /// The component's function, which `<svelte:self>` calls.
    component_name: &'c str,
}

/// The statements upstream puts around the component's body: `$.props_id` first, the
/// `$$renderer.component` callback that gives it a context, and `$$slots` outside it. The block
/// that holds the instance script's statements stands at `instance`: the callback's body, or else
/// the function's, whose position comes back with the statements.
fn wrap_body<'o>(
    b: &Builder<'o>,
    an: &Analysis,
    res: &Resolution,
    props_id: Option<&BindingIdentifier<'_>>,
    mut body: Vec<Statement<'o>>,
    instance: Span,
) -> (Vec<Statement<'o>>, Span) {
    let mut function_body = instance;
    if let Some(id) = props_id {
        let init = b.runtime("props_id", [b.id("$$renderer")]);
        body.insert(0, props_id_declaration(b, id, init));
    }
    if an.needs_context {
        let callback = b.arrow_block_at(instance, b.parameters(["$$renderer"]), body, false);
        let call = b.call(b.member(b.id("$$renderer"), "component"), [callback]);
        body = vec![b.statement(call)];
        function_body = SPAN;
    }
    if uses_slots(res) {
        let slots = b.runtime("sanitize_slots", [b.id("$$props")]);
        body.insert(0, b.const_("$$slots", slots));
    }
    (body, function_body)
}

pub(super) fn lower_prepared<'c, 'o>(
    facts: super::LoweringFacts<'c, 'o>,
    prepared: Prepared<'c, 'o>,
    b: &Builder<'o>,
) -> R<Vec<Statement<'o>>> {
    let super::LoweringFacts {
        input,
        res,
        an,
        plan,
        identity,
        ..
    } = facts;
    let Prepared {
        names,
        each_index,
        binding_groups,
        module,
        hoisted,
        instance,
        exports,
        component_name,
        props_id,
        ..
    } = prepared;
    let mut sx = ServerCompilationContext {
        b,
        javascript: input.component.javascript,
        compiler_syntax_tree: input.component.compiler_syntax_tree,
        source_text: input.component.source_text,
        res,
        an,
        names,
        each_index,
        group_each: binding_groups.each,
        plan,
        identity,
        snippets: Vec::new(),
        hoisted_snippets: Vec::new(),
        hoistable: &facts.validated.hoistable,
        instance_script: input.component.instance.is_some(),
        component_name: &component_name,
    };
    let (mut snippets, template) =
        sx.fragment_parts(input.component.compiler_syntax_tree.root, |_| false)?;
    if uses_component_bindings(input) {
        snippets = sx.settle(snippets, template);
    } else {
        snippets.extend(template);
    }
    let mut template = snippets;
    let stores = !facts.validated.stores.is_empty();
    if stores {
        let unsubscribe = b.statement(b.runtime("unsubscribe_stores", [b.id("$$store_subs")]));
        template.push(b.if_(b.id("$$store_subs"), unsubscribe, None));
    }

    let mut body: Vec<Statement<'o>> = Vec::with_capacity(instance.len() + template.len() + 2);
    if stores {
        body.push(b.declare(VariableDeclarationKind::Var, "$$store_subs", None));
    }
    body.extend(instance);
    body.extend(template);
    body.extend(bind_props(b, res, &exports));
    let stylesheet = super::embedded_stylesheet(b, &facts, Target::Server);
    let instance = super::script::instance_span(input.component);
    let (mut body, body_span) = wrap_body(b, an, res, props_id, body, instance);
    if stylesheet.is_some() {
        let add = b.member(
            b.member(b.member(b.id("$$renderer"), "global"), "css"),
            "add",
        );
        body.insert(0, b.statement(b.call(add, [b.id("$$css")])));
    }
    let mut parameters = vec!["$$renderer"];
    if takes_props(
        an,
        res,
        !exports.is_empty(),
        input.component.compiler_syntax_tree,
    ) {
        parameters.push("$$props");
    }
    let parameters = b.parameters(parameters);
    let function = b.function_declaration_at(body_span, &component_name, parameters, body, false);
    let function = super::script::with_prologue(b, function, input.component);
    let mut program = vec![import(b, Some("$"), Target::Server.runtime())];
    program.extend(hoisted);
    program.append(&mut sx.hoisted_snippets);
    program.extend(module);
    program.extend(stylesheet);
    program.push(export_default(b, function));
    Ok(program)
}

/// Upstream's `$.bind_props($$props, …)`: the bindable props, then the instance's exports. In runes
/// mode it only throws when `undefined` is passed to a bound prop that has a default.
fn bind_props<'o>(
    b: &Builder<'o>,
    res: &Resolution,
    exports: &[super::script::Export<'_>],
) -> Option<Statement<'o>> {
    let scoping = res.scoping();
    let instance = res.instance_scope();
    let mut bound = Vec::new();
    for symbol in scoping.symbol_ids() {
        let info = res.binding(symbol);
        let name = scoping.symbol_name(symbol);
        if scoping.symbol_scope_id(symbol) != instance
            || info.kind != BindingKind::BindableProperty
            || name.starts_with("$$")
        {
            continue;
        }
        let key = info
            .prop_key
            .and_then(super::javascript::literal_key_name)
            .unwrap_or(Cow::Borrowed(name));
        bound.push(b.init(&key, b.id(name)));
    }
    bound.extend(super::javascript::export_properties(b, exports));
    if bound.is_empty() {
        return None;
    }
    let call = b.runtime("bind_props", [b.id("$$props"), b.object(bound)]);
    Some(b.statement(call))
}

impl<'o> ServerCompilationContext<'_, 'o> {
    /// `$$renderer.push(text)` with one string literal, which `build_template` would merge with
    /// its neighbours.
    pub(super) fn push_literal(&self, text: &str) -> Statement<'o> {
        let b = self.b;
        b.statement(b.call(b.member(b.id("$$renderer"), "push"), [b.string(text)]))
    }

    /// Renders the template until no child binding changes a value (`$$settled`), after the
    /// snippets, which stay outside where the component's own names can read them. A binding's
    /// accessors, declared beside the snippets, go inside.
    fn settle(
        &self,
        declarations: Vec<Statement<'o>>,
        template: Vec<Statement<'o>>,
    ) -> Vec<Statement<'o>> {
        let b = self.b;
        let (mut snippets, mut inner): (Vec<_>, Vec<_>) = declarations
            .into_iter()
            .partition(|s| matches!(s, Statement::FunctionDeclaration(_)));
        inner.extend(template);
        let template = inner;
        let render_inner = b.function_declaration(
            "$$render_inner",
            b.parameters(["$$renderer"]),
            template,
            false,
        );
        let copy = b.call(b.member(b.id("$$renderer"), "copy"), []);
        let render = b.call(b.id("$$render_inner"), [b.id("$$inner_renderer")]);
        let loop_body = b.block([
            set_settled(b, true),
            b.statement(b.assign_name("$$inner_renderer", copy)),
            b.statement(render),
        ]);
        let unsettled = b.unary(UnaryOperator::LogicalNot, b.id("$$settled"));
        let do_while = Statement::new_do_while_statement(SPAN, loop_body, unsettled, b);
        let subsume = b.call(
            b.member(b.id("$$renderer"), "subsume"),
            [b.id("$$inner_renderer")],
        );
        snippets.extend([
            b.declare(
                VariableDeclarationKind::Let,
                "$$settled",
                Some(b.boolean(true)),
            ),
            b.declare(VariableDeclarationKind::Let, "$$inner_renderer", None),
            render_inner,
            do_while,
            b.statement(subsume),
        ]);
        snippets
    }
}

/// `$$settled = value;`: a child binding that writes a value makes the render run again.
fn set_settled<'o>(b: &Builder<'o>, value: bool) -> Statement<'o> {
    b.statement(b.assign_name("$$settled", b.boolean(value)))
}

/// Upstream `analysis.uses_component_bindings`.
fn uses_component_bindings(input: &CompileInput<'_>) -> bool {
    let tree = input.component.compiler_syntax_tree;
    tree.elements().any(|(_, element)| {
        element.kind.renders_component()
            && tree.attributes(element.attributes).iter().any(|a| {
                matches!(a.value, AttributeValue::Bind(_))
                    && a.name.text(input.component.source_text) != "this"
            })
    })
}
