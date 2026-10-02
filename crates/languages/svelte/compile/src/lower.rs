//! Lowering: from a component's HIR and its analysis to an output JS tree.
//!
//! One meaning, one implementation (P2): whitespace cleaning, rune rewriting, text escaping and
//! name generation are shared; only the parts where the targets really differ (DOM building on
//! the client, string pushing on the server) live in `client` and `server`.

mod client;
mod javascript;
mod names;
mod prepare;
mod script;
mod server;
mod template;

use std::borrow::Cow;

use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte::compilation::compiler_syntax_tree::{
    Attribute, AttributeValue, Children, CompilerNodeIdentifier, CompilerSyntaxTree, Element,
    NodeKind,
};
use rsvelte_svelte::semantic::analyze::Analysis;
use rsvelte_svelte::semantic::resolve::{BindingKind, Resolution};
pub use rsvelte_svelte::semantic::template::{cannot_be_set_statically, needs_clsx};
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rustc_hash::FxHashMap;

pub use crate::input::{CompileInput, Target};
pub use crate::markup::escape_markup;
use crate::render_plan::RenderPlan;
pub use crate::render_plan::{Cleaned, Item, Parent, clean_nodes};

/// # Errors
/// Returns the first diagnostic from validation or target lowering.
pub fn lower<'a>(
    input: &CompileInput<'a>,
    res: &Resolution,
    an: &Analysis,
    target: Target,
) -> Result<crate::LoweredModule<'a>, Diagnostic> {
    lower_with_plan(input, res, an, target, &RenderPlan::build(input))
}

/// `plan` must be built from this input and its whitespace option.
///
/// # Errors
/// Returns the first diagnostic from validation or target lowering.
pub fn lower_with_plan<'a>(
    input: &CompileInput<'a>,
    res: &Resolution,
    an: &Analysis,
    target: Target,
    plan: &RenderPlan,
) -> Result<crate::LoweredModule<'a>, Diagnostic> {
    lower_with_facts(
        input,
        res,
        an,
        target,
        plan,
        &crate::OutputIdentity::build(&input.component),
    )
}

pub(crate) fn lower_with_facts<'a>(
    input: &CompileInput<'a>,
    res: &Resolution,
    an: &Analysis,
    target: Target,
    plan: &RenderPlan,
    identity: &crate::OutputIdentity,
) -> Result<crate::LoweredModule<'a>, Diagnostic> {
    let prepared = prepare::prepare(input, res, target)?;
    let facts = Lowering {
        input,
        res,
        an,
        plan,
        identity,
    };
    let (tree, program) = match target {
        Target::Client => client::lower_prepared(facts, prepared),
        Target::Server => server::lower_prepared(facts, prepared),
    }?;
    Ok(crate::LoweredModule::new(
        tree,
        program,
        input.component.source_text,
    ))
}

#[derive(Clone, Copy)]
struct Lowering<'ctx, 'src> {
    input: &'ctx CompileInput<'src>,
    res: &'ctx Resolution,
    an: &'ctx Analysis,
    plan: &'ctx RenderPlan,
    identity: &'ctx crate::OutputIdentity,
}

#[derive(Debug)]
pub(crate) struct Prepared {
    out: SyntaxTree,
    names: names::Names,
    each_index: FxHashMap<CompilerNodeIdentifier, String>,
    hoisted: Vec<NodeIdentifier>,
    instance: Vec<NodeIdentifier>,
}

mod validation;
use template::{
    check_binding, event_attribute, has_dependency, is_boolean_attribute, is_directive,
    is_dom_property, is_load_error_element, synthetic_value,
};
pub use template::{is_customizable_select, sanitize_template_string};
pub use validation::check_foreign_element;
use validation::{check_runes, check_stores};
