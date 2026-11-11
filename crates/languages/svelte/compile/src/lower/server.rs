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
mod snippets;
mod special;

use std::borrow::Cow;

use events::{capture_event, capture_load_events, push_captured_events};
use oxc_ast::ast::{
    BindingIdentifier, ExportDefaultDeclarationKind, Expression, ImportDeclarationSpecifier,
    ImportOrExportKind, Statement, StringLiteral, UnaryOperator, VariableDeclarationKind,
};
use oxc_semantic::SymbolId;
use oxc_span::SPAN;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_markup_syntax::decode_attribute;
use rsvelte_svelte_semantic::analyze::Analysis;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    Attribute, AttributeValue, CompilerNodeIdentifier, CompilerSyntaxTree, Element, ElementKind,
    NodeKind, Part,
};
use rsvelte_svelte_semantic::resolve::{BindingKind, Resolution};
use rsvelte_svelte_syntax::parse::is_void;
use rsvelte_typescript_tree::Tree;
use rustc_hash::{FxHashMap, FxHashSet};

use super::names::Names;
use super::script::ScriptRewrite;
use super::{
    Builder, Item, Prepared, Target, check_foreign_element, escape_markup, event_attribute,
    is_behaviour, is_boolean_attribute, is_customizable_select, is_directive,
    is_load_error_element, needs_clsx, synthetic_value, unsupported,
};
use crate::lower::builder::Runtime;
use crate::render_plan::RenderPlan;

type R<T> = Result<T, Diagnostic>;

const BLOCK_OPEN: &str = "<!--[-->";
const BLOCK_OPEN_ELSE: &str = "<!--[!-->";
const BLOCK_CLOSE: &str = "<!--]-->";
const EMPTY_COMMENT: &str = "<!---->";

/// One piece of a server template before it is folded into `$$renderer.push(…)` calls.
enum Piece<'o> {
    /// Cooked text.
    Text(String),
    /// A template literal, as cooked quasis and expressions.
    Template(Vec<String>, Vec<Expression<'o>>),
    Expression(Expression<'o>),
    Statement(Statement<'o>),
}

/// `String(value ?? '')` for a known value.
fn known_string(v: &rsvelte_svelte_semantic::evaluate::Value) -> String {
    match v {
        rsvelte_svelte_semantic::evaluate::Value::Null
        | rsvelte_svelte_semantic::evaluate::Value::Undefined => String::new(),
        v => v.to_javascript_string(),
    }
}

struct ServerCompilationContext<'c, 'o> {
    b: &'c Builder<'o>,
    javascript: &'o Tree,
    compiler_syntax_tree: &'o CompilerSyntaxTree,
    source_text: &'o str,
    res: &'c Resolution,
    an: &'c Analysis,
    names: Names,
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
}

pub(super) fn lower_prepared<'c, 'o>(
    facts: super::Lowering<'c, 'o>,
    prepared: Prepared<'c, 'o>,
    b: &Builder<'o>,
) -> R<Vec<Statement<'o>>> {
    let super::Lowering {
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
    };
    let (mut snippets, template) =
        sx.fragment_parts(input.component.compiler_syntax_tree.root, |_| false)?;
    if uses_component_bindings(input) {
        sx.settle(template, &mut snippets);
    } else {
        snippets.extend(template);
    }
    let mut template = snippets;
    let stores = !facts.validated.stores.is_empty();
    if stores {
        let unsubscribe = b.stmt(b.runtime("unsubscribe_stores", [b.id("$$store_subs")]));
        template.push(b.if_(b.id("$$store_subs"), unsubscribe, None));
    }

    let mut body: Vec<Statement<'o>> = Vec::with_capacity(instance.len() + template.len() + 2);
    if stores {
        body.push(b.declare(VariableDeclarationKind::Var, "$$store_subs", None));
    }
    body.extend(instance);
    body.extend(template);
    body.extend(bind_props(b, res, &exports));
    if let Some(id) = &props_id {
        body.insert(0, b.const_(id, b.runtime("props_id", [b.id("$$renderer")])));
    }
    if an.needs_context {
        let callback = b.arrow_block(b.params(["$$renderer"]), body, false);
        let call = b.call(b.member(b.id("$$renderer"), "component"), [callback]);
        body = vec![b.stmt(call)];
    }
    let mut parameters = vec!["$$renderer"];
    if an.needs_context || res.uses_props() || !exports.is_empty() {
        parameters.push("$$props");
    }
    let Statement::FunctionDeclaration(function) =
        b.function_declaration(&component_name, b.params(parameters), body, false)
    else {
        unreachable!("a function declaration")
    };

    let namespace = ImportDeclarationSpecifier::new_import_namespace_specifier(
        SPAN,
        BindingIdentifier::new(SPAN, "$", b),
        b,
    );
    let mut program = vec![Statement::new_import_declaration(
        SPAN,
        Some(b.vec([namespace])),
        StringLiteral::new(SPAN, "svelte/internal/server", None, b),
        None,
        None,
        ImportOrExportKind::Value,
        b,
    )];
    program.extend(hoisted);
    program.append(&mut sx.hoisted_snippets);
    program.extend(module);
    program.push(Statement::new_export_default_declaration(
        SPAN,
        ExportDefaultDeclarationKind::FunctionDeclaration(function),
        b,
    ));
    Ok(program)
}

/// Upstream's `$.bind_props($$props, …)`: the bindable props, then the instance's exports. In runes
/// mode it only throws when `undefined` is passed to a bound prop that has a default.
fn bind_props<'o>(
    b: &Builder<'o>,
    res: &Resolution,
    exports: &[&BindingIdentifier<'_>],
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
            .map_or(Cow::Borrowed(name), super::javascript::prop_alias);
        bound.push(b.init(&key, b.id(name)));
    }
    bound.extend(super::javascript::export_properties(b, exports));
    if bound.is_empty() {
        return None;
    }
    let call = b.runtime("bind_props", [b.id("$$props"), b.object(bound)]);
    Some(b.stmt(call))
}

impl<'o> ServerCompilationContext<'_, 'o> {
    /// `$$renderer.push(text)` with one string literal, which `build_template` would merge with
    /// its neighbours.
    pub(super) fn push_literal(&self, text: &str) -> Statement<'o> {
        let b = self.b;
        b.stmt(b.call(b.member(b.id("$$renderer"), "push"), [b.string(text)]))
    }

    /// Renders the template until no child binding changes a value (`$$settled`), after the
    /// snippets, which stay outside where the component's own names can read them.
    fn settle(&self, template: Vec<Statement<'o>>, snippets: &mut Vec<Statement<'o>>) {
        let b = self.b;
        let render_inner =
            b.function_declaration("$$render_inner", b.params(["$$renderer"]), template, false);
        let copy = b.call(b.member(b.id("$$renderer"), "copy"), []);
        let render = b.call(b.id("$$render_inner"), [b.id("$$inner_renderer")]);
        let loop_body = b.block([
            set_settled(b, true),
            b.stmt(b.assign_name("$$inner_renderer", copy)),
            b.stmt(render),
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
            b.stmt(subsume),
        ]);
    }
}

/// `$$settled = value;`: a child binding that writes a value makes the render run again.
fn set_settled<'o>(b: &Builder<'o>, value: bool) -> Statement<'o> {
    b.stmt(b.assign_name("$$settled", b.boolean(value)))
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
