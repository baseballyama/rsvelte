//! Server-specific types for code generation.
//!
//! This module contains types used during server-side code generation (SSR).
//!
//! Corresponds to `ServerTransformState` and `ComponentServerTransformState` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/server/types.d.ts`

use super::super::types::TransformState;
use crate::compiler::phases::phase2_analyze::scope::Scope;
use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
use rustc_hash::FxHashMap;

/// Base server-side transformation state.
///
/// This type mirrors the `ServerTransformState` interface from the official Svelte compiler.
/// It extends `TransformState` with server-specific transformation state.
///
/// Corresponds to `ServerTransformState` in `server/types.d.ts`.
#[derive(Debug)]
pub struct ServerTransformState<'a> {
    /// Base transformation state
    pub base: &'a TransformState<'a>,

    /// The $: calls, which will be ordered in the end
    ///
    /// Maps the original labeled statement to its transformed output.
    /// These are reactive statements that need to be topologically sorted
    /// based on their dependencies.
    pub legacy_reactive_statements: FxHashMap<JsLabeledStatement, JsStatement>,
}

impl<'a> ServerTransformState<'a> {
    /// Create a new server transform state.
    pub fn new(base: &'a TransformState<'a>) -> Self {
        Self {
            base,
            legacy_reactive_statements: FxHashMap::default(),
        }
    }
}

/// Component-level server-side transformation state.
///
/// This type extends `ServerTransformState` with component-specific state needed during
/// server-side code generation. It includes all the accumulated statements and metadata
/// that will be assembled into the final SSR output.
///
/// Corresponds to `ComponentServerTransformState` in `server/types.d.ts`.
#[derive(Debug)]
pub struct ComponentServerTransformState<'a> {
    /// Analysis results from phase 2
    pub analysis: &'a ComponentAnalysis,

    /// Compilation options
    pub options: ServerTransformOptions,

    /// Current scope being transformed
    pub scope: &'a Scope,

    /// Initialization statements (run once at component creation)
    pub init: Vec<JsStatement>,

    /// Hoisted statements (declarations that go at the top level)
    pub hoisted: Vec<JsStatement>,

    /// The SSR template
    ///
    /// Array of statements and expressions that build the HTML output.
    /// These will be concatenated to form the final SSR function body.
    pub template: Vec<TemplateItem>,

    /// Namespace (html, svg, mathml, foreign)
    pub namespace: String,

    /// Whether to preserve whitespace in the output
    pub preserve_whitespace: bool,

    /// Skip hydration boundaries optimization
    ///
    /// When true, hydration markers are not inserted for certain static content
    pub skip_hydration_boundaries: bool,

    /// Transformed async {@const} declarations (if any) and those coming after them
    pub async_consts: Option<AsyncConsts>,

    /// The $: calls, which will be ordered in the end
    pub legacy_reactive_statements: FxHashMap<JsLabeledStatement, JsStatement>,
}

impl<'a> ComponentServerTransformState<'a> {
    /// Create a new component server transform state.
    pub fn new(
        analysis: &'a ComponentAnalysis,
        scope: &'a Scope,
        options: ServerTransformOptions,
    ) -> Self {
        Self {
            analysis,
            options,
            scope,
            init: Vec::new(),
            hoisted: Vec::new(),
            template: Vec::new(),
            namespace: "html".to_string(),
            preserve_whitespace: false,
            skip_hydration_boundaries: false,
            async_consts: None,
            legacy_reactive_statements: FxHashMap::default(),
        }
    }
}

/// Server-side transformation options.
///
/// Subset of compile options relevant to server-side code generation.
#[derive(Debug, Clone)]
pub struct ServerTransformOptions {
    /// Development mode
    pub dev: bool,

    /// Whether to generate hydration markers
    pub generate_hydration_markers: bool,

    /// Whether to preserve whitespace
    pub preserve_whitespace: bool,

    /// Whether to preserve comments
    pub preserve_comments: bool,
}

impl Default for ServerTransformOptions {
    fn default() -> Self {
        Self {
            dev: false,
            generate_hydration_markers: true,
            preserve_whitespace: false,
            preserve_comments: false,
        }
    }
}

/// A template item - either a statement or an expression.
///
/// The SSR template consists of both statements (for control flow)
/// and expressions (for output).
#[derive(Debug, Clone)]
pub enum TemplateItem {
    /// A statement (e.g., for loop, if statement)
    Statement(JsStatement),

    /// An expression (e.g., string literal, function call)
    Expression(JsExpr),
}

/// Async const declarations.
///
/// Used for {@const} blocks that contain await expressions.
#[derive(Debug, Clone)]
pub struct AsyncConsts {
    /// Identifier for the async const wrapper
    pub id: JsExpr,

    /// Thunk expressions to be evaluated
    pub thunks: Vec<JsExpr>,
}

/// A component binding - either a simple variable binding or a sequence expression binding (getter/setter pair).
#[derive(Debug)]
pub(crate) enum ComponentBinding {
    /// Simple binding: `bind:prop={variable}` or `bind:prop={$store.field}`
    Simple { prop_name: String, var_name: String },
    /// Sequence expression binding: `bind:prop={() => val, (v) => { val = v }}`
    /// The getter and setter are extracted from the SequenceExpression.
    SequenceExpression {
        prop_name: String,
        getter_expr: String,
        setter_expr: String,
    },
}

/// A part of the output - either static HTML or dynamic code.
#[derive(Debug)]
pub(crate) enum OutputPart {
    Html(String),
    Expression(String),
    /// Raw expression that doesn't need escaping (e.g., $.attributes())
    RawExpression(String),
    /// Raw HTML expression - {@html expr}
    HtmlExpression(String),
    Component {
        name: String,
        /// Interleaved props and spreads, preserving source order.
        /// When spread_props is needed, each Props group becomes an object literal
        /// and each Spread becomes a direct expression in the array.
        props_and_spreads: Vec<ComponentPropItem>,
        has_prior_content: bool,
        children: Option<Vec<OutputPart>>,
        /// Snippets defined inside the component (name, params, body, is_true_snippet)
        /// is_true_snippet=true means it's a SnippetBlock (needs hoisting as function)
        /// is_true_snippet=false means it's a slot child (inline in $$slots with destructured params)
        snippets: Vec<(String, Vec<String>, Vec<OutputPart>, bool)>,
        /// Slot names to add to $$slots
        slot_names: Vec<String>,
        /// Whether this component is dynamic (could be undefined/null)
        dynamic: bool,
        /// Let directive names on the component itself (e.g., `<Counter let:count>` -> ["count"])
        /// These apply to the default slot and require special handling:
        /// - children becomes $.invalid_default_snippet
        /// - default slot content moves to $$slots.default with destructured params
        let_directives: Vec<String>,
        /// CSS custom properties (e.g., --color="red") to wrap in $.css_props()
        css_custom_props: Vec<(String, String)>,
    },
    /// Component with bind directives - requires do/while settling
    ComponentWithBindings {
        name: String,
        /// Interleaved props and spreads, preserving source order.
        props_and_spreads: Vec<ComponentPropItem>,
        bindings: Vec<ComponentBinding>,
        #[allow(dead_code)]
        // Always true for component bindings - comment marker handled in build_parts
        has_prior_content: bool,
        #[allow(dead_code)] // TODO: Handle children for components with bindings
        children: Option<Vec<OutputPart>>,
        /// Whether this component is dynamic (could be undefined/null)
        dynamic: bool,
        /// CSS custom properties (e.g., --color="red") to wrap in $.css_props()
        #[allow(dead_code)]
        css_custom_props: Vec<(String, String)>,
    },
    Comment,
    /// Each block - produces a for loop
    EachBlock {
        iterable: String,
        context_name: Option<String>,
        index_name: Option<String>,
        body: Vec<OutputPart>,
        /// Fallback content (for {:else} clause)
        #[allow(dead_code)]
        fallback: Option<Vec<OutputPart>>,
    },
    /// If block - produces an if statement
    IfBlock {
        test_expr: String,
        consequent_body: Vec<OutputPart>,
        alternate_body: Option<Vec<OutputPart>>,
    },
    /// svelte:element - dynamic element
    SvelteElement {
        tag_expr: String,
        /// Attributes expression (e.g., "{ class: 'foo' }" or "void 0" for none)
        attrs_expr: Option<String>,
        /// Body content (children)
        body: Vec<OutputPart>,
    },
    /// Select element with value - produces $$renderer.select() call
    SelectElement {
        attrs_obj: String,
        body: Vec<OutputPart>,
        /// Whether this select has rich content
        is_rich: bool,
        /// CSS hash for scoped elements
        css_hash: Option<String>,
    },
    /// Option element - produces $$renderer.option() call
    OptionElement {
        /// Raw attribute entries: each is either "key: value" or "...expr"
        attr_entries: Vec<String>,
        body: Vec<OutputPart>,
        /// Whether this option has rich content (requires 7th argument `true`)
        is_rich: bool,
        /// Direct value expression (when synthetic_value_node is set) - passed directly without callback
        direct_value: Option<String>,
        /// CSS hash for scoped elements
        css_hash: Option<String>,
    },
    /// Await block - produces $.await() call
    AwaitBlock {
        promise: String,
        then_param: String,
        pending_body: Vec<OutputPart>,
        then_body: Vec<OutputPart>,
        /// Catch param - populated by the visitor but not used in server-side output
        /// (the official Svelte compiler only passes 4 args to $.await on the server)
        #[allow(dead_code)]
        catch_param: String,
        /// Catch body - populated by the visitor but not used in server-side output
        #[allow(dead_code)]
        catch_body: Vec<OutputPart>,
    },
    /// svelte:boundary - async error boundary
    SvelteBoundary {
        body: Vec<OutputPart>,
        /// True if this is rendering the pending state (use <!--[!-->) marker)
        /// False if rendering main content (use <!--[--> marker)
        is_pending: bool,
    },
    /// svelte:head - document head manipulation
    SvelteHead {
        hash: String,
        body: Vec<OutputPart>,
    },
    /// title element inside svelte:head - uses $$renderer.title()
    TitleElement {
        body: Vec<OutputPart>,
    },
    /// Textarea body with value - generates const $$body = $.escape(expr); if ($$body) { ... }
    TextareaBody {
        value_expr: String,
    },
    /// Render tag call - calls a snippet function
    RenderCall {
        call_str: String,
        /// Whether to skip the hydration boundary marker after the call
        /// This is true when the RenderTag is the only child in a fragment (standalone)
        skip_boundary: bool,
    },
    /// Const declaration - produces const variable
    ConstDeclaration(String),
    /// Block scope - wraps content in { } JavaScript block
    BlockScope {
        body: Vec<OutputPart>,
    },
    /// Hydration anchor marker - outputs "<!>" after Components/RenderTags/HtmlTags in select/optgroup
    HydrationAnchor,
    /// Raw JavaScript statement(s) to emit directly
    RawStatement(String),
    /// Local snippet function declaration (e.g., `function failed($$renderer, e) { ... }`)
    /// Used for snippets inside svelte:boundary that need to be local functions
    SnippetFunction {
        name: String,
        params: Vec<String>,
        body: Vec<OutputPart>,
    },
}

/// A snippet definition.
#[derive(Debug)]
pub(crate) struct SnippetDef {
    pub(crate) name: String,
    pub(crate) params: Vec<String>,
    pub(crate) body_parts: Vec<OutputPart>,
    /// Whether this snippet can be hoisted to module level
    pub(crate) can_hoist: bool,
}

/// Represents either a group of consecutive props or a spread expression,
/// preserving the order in which they appear in the source.
#[derive(Debug)]
pub(crate) enum ComponentPropItem {
    /// A group of consecutive regular props (e.g., `foo: 1, bar: 2`)
    Props(Vec<String>),
    /// A spread expression (e.g., `props` from `{...props}`)
    Spread(String),
}

/// Push a prop string into a `Vec<ComponentPropItem>`, grouping consecutive
/// props together in a single `Props` variant (mirrors the official compiler's
/// `push_prop` helper).
#[allow(dead_code)]
pub(crate) fn push_component_prop(items: &mut Vec<ComponentPropItem>, prop: String) {
    if let Some(ComponentPropItem::Props(props)) = items.last_mut() {
        props.push(prop);
    } else {
        items.push(ComponentPropItem::Props(vec![prop]));
    }
}

/// Check whether a `Vec<ComponentPropItem>` contains any spreads.
pub(crate) fn has_spreads(items: &[ComponentPropItem]) -> bool {
    items
        .iter()
        .any(|i| matches!(i, ComponentPropItem::Spread(_)))
}

/// Collect all prop strings from a `Vec<ComponentPropItem>` (flattened).
pub(crate) fn collect_all_props(items: &[ComponentPropItem]) -> Vec<String> {
    items
        .iter()
        .flat_map(|item| match item {
            ComponentPropItem::Props(props) => props.clone(),
            ComponentPropItem::Spread(_) => Vec::new(),
        })
        .collect()
}

/// Result of constant folding.
pub(crate) enum ConstantFoldResult {
    Null,
    Constant(String),
    Dynamic,
}
