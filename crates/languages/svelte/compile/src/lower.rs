//! Lowering: from a component's HIR and its analysis to an output JS tree.
//!
//! One meaning, one implementation (P2): whitespace cleaning, rune rewriting, text escaping and
//! name generation are shared; only the parts where the targets really differ (DOM building on
//! the client, string pushing on the server) live in `client` and `server`.

mod client;
mod coverage;
mod custom_element;
mod javascript;
mod names;
mod prepare;
mod rest_reads;
mod script;
mod server;
mod special;
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
    let validated = validate(input, res)?;
    let identity = crate::OutputIdentity::build(&input.component);
    let stylesheet = if validated.is_custom_element() && target == Target::Client {
        crate::stylesheet::scoped_stylesheet_with_mode(
            &input.component,
            an,
            &identity,
            rsvelte_stylesheet::scope::RenderMode::Minify,
        )
    } else {
        None
    };
    lower_with_facts(
        Lowering {
            input,
            res,
            an,
            plan,
            identity: &identity,
            validated: &validated,
            stylesheet: stylesheet.as_deref(),
        },
        target,
    )
}

pub(crate) fn lower_with_facts<'a>(
    facts: Lowering<'_, 'a>,
    target: Target,
) -> Result<crate::LoweredModule<'a>, Diagnostic> {
    let prepared = prepare::prepare(facts, target)?;
    let (tree, program) = match target {
        Target::Client => client::lower_prepared(facts, prepared),
        Target::Server => server::lower_prepared(facts, prepared),
    }?;
    Ok(crate::LoweredModule::new(
        tree,
        program,
        facts.input.component.source_text,
    ))
}

#[derive(Clone, Copy)]
pub(crate) struct Lowering<'context, 'source> {
    pub input: &'context CompileInput<'source>,
    pub res: &'context Resolution,
    pub an: &'context Analysis,
    pub plan: &'context RenderPlan,
    pub identity: &'context crate::OutputIdentity,
    pub validated: &'context ValidatedOptions,
    pub stylesheet: Option<&'context str>,
}

#[derive(Debug)]
pub struct ValidatedOptions {
    custom_element: Option<custom_element::CustomElement>,
    rest_reads: rustc_hash::FxHashSet<NodeIdentifier>,
}

impl ValidatedOptions {
    pub(crate) const fn is_custom_element(&self) -> bool {
        self.custom_element.is_some()
    }
}

pub(crate) fn validate(
    input: &CompileInput<'_>,
    res: &Resolution,
) -> Result<ValidatedOptions, Diagnostic> {
    let custom_element = special::validate(input)?;
    coverage::check(input)?;
    validation::check_typescript(input)?;
    check_stores(
        input.component.javascript,
        res,
        input.component.source_text,
        input.component.program,
    )?;
    let rest_reads = rest_reads::build(input, res, custom_element.is_some());
    Ok(ValidatedOptions {
        custom_element,
        rest_reads,
    })
}

#[derive(Debug)]
pub(crate) struct Prepared<'a> {
    out: SyntaxTree,
    names: names::Names,
    each_index: FxHashMap<CompilerNodeIdentifier, String>,
    hoisted: Vec<NodeIdentifier>,
    instance: Vec<NodeIdentifier>,
    custom_element: Option<&'a custom_element::CustomElement>,
    /// Upstream `analysis.name`: the component name, renamed if the source declares it.
    component_name: String,
}

/// The diagnostic for input this compiler does not lower yet. `what` is a singular subject.
fn unsupported<T>(what: &str, span: Span) -> Result<T, Diagnostic> {
    Err(Diagnostic::error(
        "unsupported",
        format!("{what} is not supported yet"),
        span,
    ))
}

mod validation;
pub use template::{
    DOM_BOOLEAN_ATTRIBUTES, is_boolean_attribute, is_customizable_select, sanitize_template_string,
};
use template::{
    check_binding, event_attribute, has_dependency, is_directive, is_dom_property,
    is_load_error_element, synthetic_value,
};
pub use validation::check_foreign_element;
use validation::{check_runes, check_stores};
