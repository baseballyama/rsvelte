//! Lowering: from a component's HIR and its analysis to an output oxc tree.
//!
//! One meaning, one implementation (P2): whitespace cleaning, rune rewriting, text escaping and
//! name generation are shared; only the parts where the targets really differ (DOM building on
//! the client, string pushing on the server) live in `client` and `server`.

mod binding_groups;
mod bindings;
mod builder;
mod class_fields;
mod client;
mod component;
mod coverage;
mod custom_element;
mod derived;
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
mod special;
mod stores;
mod template;

pub(crate) use builder::Builder;
pub(crate) use module::lower_module;
use oxc_allocator::Allocator;
use oxc_ast::ast::{Program, Statement};
use oxc_ast_visit::VisitMut;
use oxc_semantic::{ReferenceId, SymbolId};
use oxc_span::{GetSpan, SPAN, SourceType};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::analyze::Analysis;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    Attribute, AttributeValue, Children, CompilerNodeIdentifier, CompilerSyntaxTree, Element,
    ElementKind, NodeKind,
};
use rsvelte_svelte_semantic::resolve::{BindingKind, Resolution};
pub(crate) use rsvelte_svelte_semantic::template::{cannot_be_set_statically, needs_clsx};
use rustc_hash::{FxHashMap, FxHashSet};

pub use crate::input::{CompileInput, Target};
pub(crate) use crate::markup::escape_markup;
use crate::render_plan::RenderPlan;
pub use crate::render_plan::{Cleaned, Item, Parent, clean_nodes};

/// # Errors
/// Returns the first diagnostic from validation or target lowering.
pub fn lower<'o>(
    input: &CompileInput<'o>,
    res: &Resolution,
    an: &Analysis,
    target: Target,
    allocator: &'o Allocator,
) -> Result<Program<'o>, Diagnostic> {
    lower_with_plan(input, res, an, target, &RenderPlan::build(input), allocator)
}

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
    let stylesheet = if validated.is_custom_element() && target == Target::Client {
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
        allocator,
    )
}

/// The module of one target, in `allocator`; its spans index the component's text.
pub(crate) fn lower_with_facts<'o>(
    facts: Lowering<'_, 'o>,
    target: Target,
    allocator: &'o Allocator,
) -> Result<Program<'o>, Diagnostic> {
    coverage::check_static_custom_elements(facts.input, facts.an)?;
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
pub(crate) struct ValidatedOptions {
    custom_element: Option<custom_element::CustomElement>,
    /// The references to a rest prop that read `$$props` instead (upstream's `rest_prop` read).
    rest_reads: FxHashSet<ReferenceId>,
    /// The top-level snippets declared beside the component.
    hoistable: FxHashSet<SymbolId>,
    /// The store subscriptions (`$name`), in the order upstream declares them.
    stores: Vec<String>,
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
    validate_erased_by(input, res, Erasure::Svelte)
}

/// Who erases the types before upstream analyzes the source.
#[derive(Clone, Copy, PartialEq, Eq)]
pub(crate) enum Erasure {
    /// Upstream's own, which rejects a TypeScript feature that has a runtime meaning.
    Svelte,
    /// TypeScript's emit, as a bundler runs it on a `.svelte.ts` module.
    TypeScript,
}

pub(crate) fn validate_erased_by(
    input: &CompileInput<'_>,
    res: &Resolution,
    erasure: Erasure,
) -> Result<ValidatedOptions, Diagnostic> {
    // Acorn rejects at parse time what oxc's semantic checker finds after the parser.
    if let Some(error) = res.syntax_error() {
        return Err(error.clone());
    }
    let custom_element = special::validate(input)?;
    let names = stores::Names::new(input, res);
    validation::check_analysis(input, res, &names, snippets::errors(input, res))?;
    let hoistable = snippets::hoistable(input, res, &names);
    snippets::check_exports(input, res, &hoistable)?;
    coverage::check(input, res)?;
    if erasure == Erasure::Svelte {
        validation::check_typescript(input)?;
    }
    let rest_reads = rest_reads::build(res, custom_element.is_some());
    Ok(ValidatedOptions {
        custom_element,
        rest_reads,
        hoistable,
        stores: names.subscriptions(res),
    })
}

pub(crate) struct Prepared<'c, 'o> {
    names: names::Names,
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

/// Upstream `is_custom_element_node`: a regular element with a `-` in its name or an `is`
/// attribute, whose attributes upstream sets as properties.
fn is_custom_element_node(tree: &CompilerSyntaxTree, source_text: &str, el: &Element) -> bool {
    tree.is_custom_element(el, source_text)
}

/// The document span of an oxc node.
pub(crate) fn span_of(node: &impl GetSpan) -> Span {
    let span = node.span();
    Span::new(span.start, span.end)
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
pub use template::{DOM_BOOLEAN_ATTRIBUTES, is_boolean_attribute, is_customizable_select};
use template::{
    event_attribute, has_dependency, is_behaviour, is_directive, is_dom_property,
    is_load_error_element, synthetic_value,
};
use validation::{check_runes, uses_slots};
