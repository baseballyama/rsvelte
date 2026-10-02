//! Renderer output and structured template markers.

mod attributes;
mod blocks;
mod elements;
mod fragments;

use attributes::known_string;
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::source::positions::SourceLocation;
use rsvelte_markup::decode_text;
use rsvelte_svelte::compilation::compiler_syntax_tree::{
    Attribute, AttributeValue, CompilerNodeIdentifier, CompilerSyntaxTree, Element, ElementKind,
    NodeKind, Part,
};
use rsvelte_svelte::semantic::analyze::Analysis;
use rsvelte_svelte::semantic::resolve::{BindingKind, Resolution};
use rsvelte_svelte::syntax::parse::is_void;
use rsvelte_typescript::copy::copy;
use rsvelte_typescript::operators::{BinaryOperator, UpdateOperator};
use rsvelte_typescript::scope::ScopeIdentifier;
use rsvelte_typescript::syntax_tree::flag;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rustc_hash::FxHashMap;

use super::javascript::{call_arguments, init_property, runtime_call};
use super::names::Names;
use super::script::ScriptRewrite;
use super::{
    Item, Prepared, Target, check_binding, check_foreign_element, escape_markup, event_attribute,
    is_boolean_attribute, is_customizable_select, is_directive, is_load_error_element, needs_clsx,
    sanitize_template_string, synthetic_value,
};
use crate::render_plan::RenderPlan;

type R<T> = Result<T, Diagnostic>;

const BLOCK_OPEN: &str = "<!--[-->";
const BLOCK_OPEN_ELSE: &str = "<!--[!-->";
const BLOCK_CLOSE: &str = "<!--]-->";
const EMPTY_COMMENT: &str = "<!---->";
const ELEMENT_IS_INPUT: u32 = 1 << 2;

/// One piece of a server template before it is folded into `$$renderer.push(…)` calls.
enum Piece {
    /// Cooked text.
    Text(String),
    /// A template literal, as cooked quasis and expressions.
    Template(Vec<String>, Vec<NodeIdentifier>),
    Expression(NodeIdentifier),
    Statement(NodeIdentifier),
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
    let template = sx.fragment(input.component.compiler_syntax_tree.root)?;

    let o = &mut sx.out;
    let mut body: Vec<NodeIdentifier> = instance;
    body.extend(template);
    // Upstream: in runes mode this only throws when `undefined` is passed to a bound prop that
    // has a default.
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
        let key = info.prop_key.map_or_else(
            || name.to_owned(),
            |k| match javascript.kind(k) {
                Kind::Identifier(_) => javascript.name(k).to_owned(),
                _ => javascript
                    .str_value(k, input.component.source_text)
                    .to_owned(),
            },
        );
        let value = o.identifier(name);
        bound.push(init_property(o, &key, value));
    }
    if !bound.is_empty() {
        let props = o.identifier("$$props");
        let object = o.object(&bound, SourceLocation::SYNTHETIC);
        let call = o.runtime("$", "bind_props", &[props, object]);
        body.push(o.expression_statement(call));
    }
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
    if an.needs_context || res.uses_props {
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

    let ns = o.identifier("$");
    let spec = o.import_namespace(ns, SourceLocation::SYNTHETIC);
    let source = o.write_string("svelte/internal/server");
    let mut program = vec![o.import(&[spec], source, false, SourceLocation::SYNTHETIC)];
    program.extend(hoisted);
    program.push(o.export_default(func, SourceLocation::SYNTHETIC));
    let root = o.program(&program, SourceLocation::SYNTHETIC);
    Ok((sx.out, root))
}
