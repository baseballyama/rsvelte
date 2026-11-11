//! DOM templates and reactive updates.

mod attributes;
mod binding_accessors;
mod blocks;
mod boundary;
mod children;
mod component;
mod const_tag;
mod custom_element;
mod directives;
mod dynamic_element;
mod elements;
mod events;
mod exports;
mod expressions;
mod fragments;
mod global_bindings;
mod lets;
mod markup_tag;
mod slot_element;
mod snippets;
mod special;
mod stores;
mod template;
mod template_chunk;
mod title;

use oxc_allocator::ArenaBox;
use oxc_ast::ast::{
    Expression, FormalParameters, ImportDeclarationSpecifier, ImportOrExportKind, Statement,
    StringLiteral,
};
use oxc_semantic::{ReferenceId, ScopeId, SymbolId};
use oxc_span::SPAN;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_markup_syntax::decode_attribute;
use rsvelte_svelte_semantic::analyze::Analysis;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    Attribute, AttributeValue, CompilerNodeIdentifier, CompilerSyntaxTree, Element, ElementKind,
    NodeKind, Part,
};
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_svelte_syntax::parse::is_void;
use rsvelte_typescript_tree::{ExpressionIdentifier, Tree};
use rustc_hash::{FxHashMap, FxHashSet};

use super::names::Names;
use super::script::{Read, ScriptRewrite};
use super::slot_element::has_slot_element;
use super::{
    Builder, Item, Prepared, Target, escape_markup, event_attribute, has_dependency, is_behaviour,
    is_custom_element_node, is_customizable_select, is_directive, is_load_error_element,
    needs_clsx, synthetic_value, unsupported, uses_slots,
};
use crate::lower::builder::Runtime;
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

use binding_accessors::each_scopes;
use template::Template;

/// Per fragment: the template and the memoized expressions (`$0`, `$1`, …) of its render effect.
#[derive(Default)]
struct Frag<'o> {
    tpl: Template,
    memo: Memo<'o>,
}

/// Upstream's `Memoizer`: the memoized expressions of one render effect or one component's props.
#[derive(Default)]
struct Memo<'o> {
    entries: Vec<Memoized<'o>>,
    /// A component reads each value from a derived (`$.get($0)`), a render effect as a parameter.
    derived: bool,
}

struct Memoized<'o> {
    value: Expression<'o>,
    /// The template expression `value` was built from, which a derived's callback reads.
    source: Option<ExpressionIdentifier>,
    name: String,
}

impl<'o> Memo<'o> {
    const fn derived() -> Self {
        Self {
            entries: Vec::new(),
            derived: true,
        }
    }

    /// Upstream `Memoizer.apply` for an effect: the parameters of the callback that takes the
    /// values, and the array of thunks that compute them, which is absent when none is.
    fn into_effect(
        self,
        b: &Builder<'o>,
    ) -> (ArenaBox<'o, FormalParameters<'o>>, Option<Expression<'o>>) {
        let parameters = b.parameters(self.entries.iter().map(|m| m.name.as_str()));
        let thunks = (!self.entries.is_empty()).then(|| {
            b.array(
                self.entries
                    .into_iter()
                    .map(|m| b.arrow(b.parameters([]), m.value)),
            )
        });
        (parameters, thunks)
    }
}

#[derive(Default)]
struct Lists<'o> {
    /// Upstream `state.let_directives`, which open the fragment.
    lets: Vec<Statement<'o>>,
    /// Upstream `state.consts`, which follow them.
    consts: Vec<Statement<'o>>,
    initializer: Vec<Statement<'o>>,
    update: Vec<Statement<'o>>,
    after: Vec<Statement<'o>>,
}

/// How to reach the first node of a child list (upstream `process_children`'s `initial`).
#[derive(Clone)]
enum Prev {
    Call {
        method: &'static str,
        of: String,
        /// Reads the children of a `<template>`'s content.
        content: bool,
    },
    Identifier(String),
}

struct ClientCompilationContext<'c, 'o> {
    b: &'c Builder<'o>,
    javascript: &'o Tree,
    compiler_syntax_tree: &'o CompilerSyntaxTree,
    source_text: &'o str,
    res: &'c Resolution,
    an: &'c Analysis,
    names: Names<'c>,
    hoisted: Vec<Statement<'o>>,
    templates: FxHashMap<String, String>,
    events: Vec<String>,
    /// How the template's names in scope are read.
    reads: FxHashMap<SymbolId, Read>,
    each_index: FxHashMap<CompilerNodeIdentifier, String>,
    binding_groups: super::binding_groups::BindingGroups,
    /// The scopes whose names a `bind:this` passes to its accessors; see [`each_scopes`].
    each_scopes: FxHashSet<ScopeId>,
    /// Where a name of a tree this lowering built resolves when it is evaluated: the innermost
    /// `{#each}` or snippet scope.
    scope: ScopeId,
    plan: &'c RenderPlan,
    identity: &'c crate::OutputIdentity,
    component_name: String,
    custom_element: Option<&'c super::custom_element::CustomElement>,
    rest_reads: &'c FxHashSet<ReferenceId>,
    needs_props: bool,
    /// The snippets the block being lowered declares (upstream `state.snippets`).
    snippets: Vec<Statement<'o>>,
    /// Top-level snippets that read only module-level names, declared after the imports.
    module_snippets: Vec<Statement<'o>>,
    /// The other top-level snippets, declared before the instance script.
    instance_snippets: Vec<Statement<'o>>,
    hoistable: &'c FxHashSet<SymbolId>,
    /// The snippets a component holds, read as the outer name each shadows.
    shadows: FxHashMap<SymbolId, SymbolId>,
    /// The store subscriptions (`$name`), in the order upstream declares them.
    stores: &'c [String],
    /// The `{#each}` items of a store's collection, with the subscription a mutation of each
    /// invalidates.
    invalidates: FxHashMap<SymbolId, &'o str>,
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
        custom_element,
        component_name,
        props_id,
    } = prepared;
    let mut context = ClientCompilationContext {
        b,
        javascript: input.component.javascript,
        compiler_syntax_tree: input.component.compiler_syntax_tree,
        source_text: input.component.source_text,
        res,
        an,
        names,
        hoisted,
        templates: FxHashMap::default(),
        events: Vec::new(),
        reads: FxHashMap::default(),
        each_index,
        binding_groups,
        each_scopes: each_scopes(input.component.compiler_syntax_tree, res),
        scope: res.instance_scope(),
        plan,
        identity,
        component_name,
        custom_element,
        rest_reads: &facts.validated.rest_reads,
        needs_props: res.unresolved_names().any(|name| name == "$host")
            || has_slot_element(input.component.compiler_syntax_tree)
            || uses_slots(res),
        snippets: Vec::new(),
        module_snippets: Vec::new(),
        instance_snippets: Vec::new(),
        hoistable: &facts.validated.hoistable,
        shadows: super::snippets::component_child_shadows(input, res),
        stores: &facts.validated.stores,
        invalidates: FxHashMap::default(),
    };
    let template = context.fragment(input.component.compiler_syntax_tree.root)?;

    let stylesheet = super::embedded_stylesheet(b, &facts, Target::Client);
    let mut returned = context.export_properties(&exports);
    returned.extend(context.custom_element_exports());
    let func = context.component_function(
        instance,
        template,
        returned,
        stylesheet.is_some(),
        props_id.as_deref(),
    );
    let registration = context.custom_element_registration(&exports);

    let mut program = Vec::new();
    program.push(import(b, None, "svelte/internal/disclose-version"));
    let runtime = import(b, Some("$"), "svelte/internal/client");
    // Upstream lists `[...module, $, ...hoisted]` and moves every import to the top in that order.
    let (imports, rest): (Vec<_>, Vec<_>) = module
        .into_iter()
        .chain([runtime])
        .chain(context.hoisted)
        .partition(|statement| matches!(statement, Statement::ImportDeclaration(_)));
    program.extend(imports);
    program.append(&mut context.module_snippets);
    program.extend(rest);
    program.extend(stylesheet);
    program.push(export_default(b, func));
    if !context.events.is_empty() {
        let names = b.array(context.events.iter().map(|e| b.string(e)));
        program.push(b.statement(b.runtime("delegate", [names])));
    }
    program.extend(registration);
    Ok(program)
}

/// `import 'source'`, or `import * as namespace from 'source'`.
pub(super) fn import<'o>(b: &Builder<'o>, namespace: Option<&str>, source: &str) -> Statement<'o> {
    let specifiers = namespace.map(|n| {
        b.vec([ImportDeclarationSpecifier::new_import_namespace_specifier(
            SPAN,
            oxc_ast::ast::BindingIdentifier::new(SPAN, b.str(n), b),
            b,
        )])
    });
    Statement::new_import_declaration(
        SPAN,
        specifiers,
        StringLiteral::new(SPAN, b.str(source), None, b),
        None,
        None,
        ImportOrExportKind::Value,
        b,
    )
}

/// `export default function …`, from a function declaration.
fn export_default<'o>(b: &Builder<'o>, function: Statement<'o>) -> Statement<'o> {
    let Statement::FunctionDeclaration(function) = function else {
        unreachable!("the component is a function declaration")
    };
    Statement::new_export_default_declaration(
        SPAN,
        oxc_ast::ast::ExportDefaultDeclarationKind::FunctionDeclaration(function),
        b,
    )
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

impl<'o> ClientCompilationContext<'_, 'o> {
    fn component_function(
        &mut self,
        instance: Vec<Statement<'o>>,
        template: Vec<Statement<'o>>,
        exports: Vec<oxc_ast::ast::ObjectPropertyKind<'o>>,
        stylesheet: bool,
        props_id: Option<&str>,
    ) -> Statement<'o> {
        let b = self.b;
        let has_exports = !exports.is_empty();
        let needs_context = self.an.needs_context || has_exports;
        let mut body = Vec::new();
        if needs_context {
            body.push(b.statement(b.runtime("push", [b.id("$$props"), b.boolean(true)])));
        }
        if stylesheet {
            body.push(b.statement(b.runtime("append_styles", [b.id("$$anchor"), b.id("$$css")])));
        }
        let stores = self.store_setup();
        let cleanup = !stores.is_empty();
        body.extend(stores);
        for group in &self.binding_groups.names {
            body.push(b.const_(group, b.array([])));
        }
        body.append(&mut self.instance_snippets);
        body.extend(instance);
        if has_exports {
            body.push(b.var("$$exports", b.object(exports)));
        }
        body.extend(template);
        if needs_context {
            if has_exports && cleanup {
                body.push(b.var("$$pop", b.runtime("pop", [b.id("$$exports")])));
            } else if has_exports {
                body.push(b.return_(Some(b.runtime("pop", [b.id("$$exports")]))));
            } else {
                body.push(b.statement(b.runtime("pop", [])));
            }
        }
        if cleanup {
            body.push(b.statement(b.call(b.id("$$cleanup"), [])));
            if has_exports {
                body.push(b.return_(Some(b.id("$$pop"))));
            }
        }
        if uses_slots(self.res) {
            let slots = b.runtime("sanitize_slots", [b.id("$$props")]);
            body.insert(0, b.const_("$$slots", slots));
        }
        if let Some(id) = props_id {
            body.insert(0, b.const_(id, b.runtime("props_id", [])));
        }
        let mut parameters = vec!["$$anchor"];
        if self.res.uses_props() || needs_context || self.needs_props {
            parameters.push("$$props");
        }
        b.function_declaration(&self.component_name, b.parameters(parameters), body, false)
    }
}
