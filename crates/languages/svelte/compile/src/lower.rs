//! Lowering: from a component's HIR and its analysis to an output oxc tree.
//!
//! One meaning, one implementation (P2): whitespace cleaning, rune rewriting, text escaping and
//! name generation are shared; only the parts where the targets really differ (DOM building on
//! the client, string pushing on the server) live in `client` and `server`.

mod attributes;
mod binding_groups;
mod bindings;
mod builder;
mod class_fields;
mod client;
mod component;
mod custom_element;
mod debug_tag;
mod derived;
mod global_binding_table;
mod javascript;
mod lets;
mod module;
mod names;
mod paths;
mod prepare;
mod rest_reads;
mod script;
mod server;
mod slot_element;
mod snippets;
mod stores;
mod unsupported_syntax;
mod validation;

pub use attributes::{DOM_BOOLEAN_ATTRIBUTES, is_boolean_attribute, is_customizable_select};
pub(crate) use builder::Builder;
pub(crate) use module::lower_module;
use oxc_allocator::Allocator;
use oxc_ast::ast::{Program, Statement};
use oxc_ast_visit::VisitMut;
use oxc_span::{SPAN, SourceType};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::analyze::Analysis;
use rsvelte_svelte_semantic::compiler_syntax_tree::CompilerNodeIdentifier;
use rsvelte_svelte_semantic::resolve::Resolution;
pub(crate) use rsvelte_svelte_syntax::svelte_diagnostics::error;
use rustc_hash::FxHashMap;
pub use script::is_expression_async;
pub use validation::CompileErrors;
pub(crate) use validation::{
    Unit, Validation, mode_independent_errors, raised_in_parse, rune_error, validate, validate_unit,
};

use crate::input::{CompileInput, Target};
use crate::render_plan::RenderPlan;

/// `plan` must be built from this input and its whitespace option.
///
/// # Errors
/// Returns the first diagnostic from validation or target lowering.
pub fn lower_with_plan<'o>(
    input: &CompileInput<'o>,
    res: &Resolution,
    an: &Analysis,
    target: Target,
    plan: &RenderPlan,
    allocator: &'o Allocator,
) -> Result<Program<'o>, Diagnostic> {
    let validated = validate(input, res)?;
    let identity = crate::OutputIdentity::build(&input.component);
    let stylesheet = if validated.embeds_stylesheet(target) {
        crate::stylesheet::scoped_stylesheet_with_mode(
            &input.component,
            an,
            &identity,
            rsvelte_stylesheet_compile::scope::RenderMode::Minify,
        )
    } else {
        None
    };
    lower_with_facts(
        LoweringFacts {
            input,
            res,
            an,
            plan,
            identity: &identity,
            validated: &validated,
            stylesheet: stylesheet.as_deref(),
        },
        target,
        allocator,
    )
}

/// The module of one target, in `allocator`; its spans index the component's text.
pub(crate) fn lower_with_facts<'o>(
    facts: LoweringFacts<'_, 'o>,
    target: Target,
    allocator: &'o Allocator,
) -> Result<Program<'o>, Diagnostic> {
    let b = Builder::new(allocator);
    let prepared = prepare::prepare(facts, target, &b)?;
    let body = match target {
        Target::Client => client::lower_prepared(facts, prepared, &b),
        Target::Server => server::lower_prepared(facts, prepared, &b),
    }?;
    let component = &facts.input.component;
    let mut program = Program::new(
        SPAN,
        SourceType::mjs(),
        component.source_text,
        [],
        None,
        [],
        b.vec(body),
        &b,
    );
    // Upstream erases a TypeScript component's types before it analyzes it; the output keeps
    // the input's nodes, so they are erased once here.
    let typescript = component
        .module
        .into_iter()
        .chain(component.instance)
        .any(|p| {
            component
                .javascript
                .get_program(p)
                .source_type
                .is_typescript()
        });
    if typescript {
        rsvelte_typescript_compile::strip::Strip::new(allocator).visit_program(&mut program);
    }
    Ok(program)
}

#[derive(Clone, Copy)]
pub(crate) struct LoweringFacts<'context, 'source> {
    pub input: &'context CompileInput<'source>,
    pub res: &'context Resolution,
    pub an: &'context Analysis,
    pub plan: &'context RenderPlan,
    pub identity: &'context crate::OutputIdentity,
    pub validated: &'context Validation,
    pub stylesheet: Option<&'context str>,
}

/// Upstream's `const $$css = { hash, code }`, when `target`'s module adds the stylesheet itself.
fn embedded_stylesheet<'o>(
    b: &Builder<'o>,
    facts: &LoweringFacts<'_, 'o>,
    target: Target,
) -> Option<Statement<'o>> {
    let code = facts
        .stylesheet
        .filter(|_| facts.validated.embeds_stylesheet(target))?;
    // A component has a stylesheet hash exactly when it has a stylesheet.
    let hash = facts.identity.stylesheet_hash.as_deref()?;
    let hash = b.init("hash", b.string(hash));
    Some(b.const_("$$css", b.object([hash, b.init("code", b.string(code))])))
}

pub(crate) struct Prepared<'c, 'o> {
    names: names::Names<'c>,
    each_index: FxHashMap<CompilerNodeIdentifier, String>,
    binding_groups: binding_groups::BindingGroups,
    /// The module script, imports included. Upstream places it apart from `hoisted`, and the
    /// client and server place it differently.
    module: Vec<Statement<'o>>,
    hoisted: Vec<Statement<'o>>,
    instance: Vec<Statement<'o>>,
    /// Upstream `analysis.props_id`, which each target declares first in the component.
    props_id: Option<String>,
    /// The names the instance script exports, in source order.
    exports: Vec<script::Export<'o>>,
    custom_element: Option<&'c custom_element::CustomElement>,
    /// Upstream `analysis.name`: the component name, renamed if the source declares it.
    component_name: String,
}

/// The code of what this port refuses, which upstream compiles.
pub(crate) const UNSUPPORTED: &str = "unsupported";

/// The diagnostic for input this compiler does not lower yet. `what` is a singular subject.
fn unsupported<T>(what: &str, span: Span) -> Result<T, Diagnostic> {
    Err(Diagnostic::error(
        UNSUPPORTED,
        format!("{what} is not supported yet"),
        span,
    ))
}

/// An upstream error, whose message ends with the link to its documentation.
pub(crate) fn invalid<T>(
    code: &'static str,
    message: impl AsRef<str>,
    span: Span,
) -> Result<T, Diagnostic> {
    Err(error(code, message, span))
}
