//! AST visitors for the analyze phase.
//!
//! Each visitor handles a specific AST node type and performs semantic analysis.
//!
//! Corresponds to Svelte's `2-analyze/visitors/` directory.

// Allow dead code for stub implementations that will be integrated later
#![allow(dead_code)]

pub mod shared;

// Script visitor
mod script;
pub use script::{visit_script, visit_script_expr, walk_expression, walk_js_node};

// Template visitors
mod component;
mod fragment;
mod regular_element;
mod slot_element;
mod svelte_body;
mod svelte_boundary;
mod svelte_component;
mod svelte_document;
mod svelte_element;
mod svelte_fragment;
mod svelte_head;
mod svelte_options;
mod svelte_self;
mod svelte_window;
mod text;
mod title_element;

// Block visitors
mod await_block;
mod each_block;
mod if_block;
mod key_block;
mod snippet_block;

// Tag visitors
mod attach_tag;
mod const_tag;
mod debug_tag;
mod declaration_tag;
mod expression_tag;
mod html_tag;
mod render_tag;

// Directive visitors
mod animate_directive;
mod bind_directive;
mod class_directive;
mod let_directive;
mod on_directive;
mod style_directive;
mod transition_directive;
mod use_directive;

// Attribute visitors
mod attribute;
mod spread_attribute;

// JavaScript visitors
mod arrow_function_expression;
mod assignment_expression;
mod await_expression;
mod call_expression;
mod class_body;
mod class_declaration;
mod export_default_declaration;
mod export_named_declaration;
mod export_specifier;
mod expression_statement;
mod function_declaration;
mod function_expression;
mod identifier;
mod import_declaration;
mod labeled_statement;
mod literal;
mod member_expression;
mod new_expression;
mod property_definition;
mod template_element;
mod update_expression;
mod variable_declarator;

// Re-exports
pub use await_block::visit_await_block;
pub use component::visit as visit_component;
pub use each_block::visit_each_block;
pub use expression_tag::visit_expression_tag;
pub use fragment::visit_fragment;
pub use if_block::visit_if_block;
pub use key_block::visit_key_block;
pub use regular_element::visit_regular_element;
pub use render_tag::visit_render_tag;
pub use snippet_block::visit_snippet_block;
pub use text::visit_text;

use super::AnalysisError;
use super::types::{ComponentAnalysis, CssDomElement, DomStructure, SiblingCertainty};
use crate::ast::arena::ParseArena;
use crate::ast::template::{Root, TemplateNode};

/// Information about the current EachBlock context for animate: validation.
#[derive(Debug, Clone)]
pub struct EachBlockContext {
    /// Whether the EachBlock has a key.
    pub has_key: bool,
    /// Number of non-empty child elements in the EachBlock body.
    pub child_count: usize,
}

/// A wrapper that provides access to an AST node on the js_path.
///
/// Supports three modes:
/// - **Borrowed**: a raw pointer to a `Value` whose lifetime is managed by the caller
///   (used by `walk_js_node` where the `&Value` outlives the push/pop).
/// - **Owned**: a `Box<Value>` for cases where the value is created on the fly.
/// - **TypedNode**: a raw pointer to a `JsNode` with a lazily-materialized `Value`
///   (used by `walk_js_node_typed` to avoid the expensive `to_value()` conversion
///   for the vast majority of nodes that are never inspected via js_path).
pub enum JsPathEntry {
    Borrowed(*const serde_json::Value),
    Owned(Box<serde_json::Value>),
    TypedNode {
        node: *const crate::ast::typed_expr::JsNode,
        /// Lazily materialized Value. Only created when `as_value()` / `Deref` is called.
        cached_value: std::cell::UnsafeCell<Option<Box<serde_json::Value>>>,
    },
}

impl Clone for JsPathEntry {
    fn clone(&self) -> Self {
        match self {
            Self::Borrowed(ptr) => Self::Borrowed(*ptr),
            Self::Owned(boxed) => Self::Owned(boxed.clone()),
            Self::TypedNode { node, cached_value } => {
                // SAFETY: single-threaded read of the lazily-materialized cache;
                // `JsPathEntry` is never shared across threads.
                let cached = unsafe { &*cached_value.get() };
                Self::TypedNode {
                    node: *node,
                    cached_value: std::cell::UnsafeCell::new(cached.clone()),
                }
            }
        }
    }
}

impl JsPathEntry {
    /// Create a new `JsPathEntry` from a reference (borrowed, zero-cost).
    #[inline]
    pub fn new(value: &serde_json::Value) -> Self {
        Self::Borrowed(value as *const _)
    }

    /// Create a new `JsPathEntry` that owns the `Value`.
    #[inline]
    pub fn new_owned(value: serde_json::Value) -> Self {
        Self::Owned(Box::new(value))
    }

    /// Create a new `JsPathEntry` from a `JsNode` reference (zero-cost).
    /// The Value will be lazily materialized only if `as_value()` or `Deref` is called.
    #[inline]
    pub fn new_typed(node: &crate::ast::typed_expr::JsNode) -> Self {
        Self::TypedNode {
            node: node as *const _,
            cached_value: std::cell::UnsafeCell::new(None),
        }
    }

    /// Get a reference to the underlying `Value`.
    ///
    /// For `TypedNode` entries, lazily converts the JsNode to Value on first access.
    #[inline]
    pub fn as_value(&self) -> &serde_json::Value {
        match self {
            Self::Borrowed(ptr) => {
                // SAFETY: The pointer is valid because walk_js_node maintains push/pop invariant.
                unsafe { &**ptr }
            }
            Self::Owned(boxed) => boxed,
            Self::TypedNode { node, cached_value } => {
                // SAFETY: Single-threaded access; walk_js_node_typed is not concurrent.
                let cached = unsafe { &mut *cached_value.get() };
                if cached.is_none() {
                    // SAFETY: `node` was installed by `JsPathEntry::new_typed` from a live
                    // `&JsNode` whose referent outlives this entry (upheld by the
                    // `walk_js_node_typed` push/pop discipline); access is single-threaded.
                    let js_node = unsafe { &**node };
                    *cached = Some(Box::new(js_node.to_value()));
                }
                cached.as_ref().unwrap()
            }
        }
    }

    /// Get the underlying `JsNode` reference, if this is a `TypedNode` entry.
    #[inline]
    pub fn as_js_node(&self) -> Option<&crate::ast::typed_expr::JsNode> {
        match self {
            // SAFETY: `node` was installed by `JsPathEntry::new_typed` from a live
            // `&JsNode` whose referent outlives this entry (upheld by the
            // `walk_js_node_typed` push/pop discipline); access is single-threaded.
            Self::TypedNode { node, .. } => Some(unsafe { &**node }),
            _ => None,
        }
    }

    /// Get the ESTree type string for this entry.
    ///
    /// Works across all variants without converting TypedNode to Value.
    #[inline]
    pub fn get_type_str(&self) -> Option<&str> {
        match self {
            Self::TypedNode { node, .. } => {
                // SAFETY: `node` was installed by `JsPathEntry::new_typed` from a live
                // `&JsNode` whose referent outlives this entry (upheld by the
                // `walk_js_node_typed` push/pop discipline); access is single-threaded.
                let js_node = unsafe { &**node };
                Some(js_node.type_str())
            }
            _ => self.as_value().get("type").and_then(|t| t.as_str()),
        }
    }

    /// Get a string field value by name.
    ///
    /// For Value entries, does `node.get(field).and_then(|v| v.as_str())`.
    /// For TypedNode entries, handles known fields like "name", "operator", "kind".
    pub fn get_field_str(&self, field: &str) -> Option<&str> {
        match self {
            Self::TypedNode { node, .. } => {
                // SAFETY: `node` was installed by `JsPathEntry::new_typed` from a live
                // `&JsNode` whose referent outlives this entry (upheld by the
                // `walk_js_node_typed` push/pop discipline); access is single-threaded.
                let js_node = unsafe { &**node };
                js_node.get_field_str(field)
            }
            _ => self.as_value().get(field).and_then(|v| v.as_str()),
        }
    }

    /// Get a boolean field value by name.
    pub fn get_field_bool(&self, field: &str) -> Option<bool> {
        match self {
            Self::TypedNode { node, .. } => {
                // SAFETY: `node` was installed by `JsPathEntry::new_typed` from a live
                // `&JsNode` whose referent outlives this entry (upheld by the
                // `walk_js_node_typed` push/pop discipline); access is single-threaded.
                let js_node = unsafe { &**node };
                js_node.get_field_bool(field)
            }
            _ => self.as_value().get(field).and_then(|v| v.as_bool()),
        }
    }

    /// Get a u64 field value by name (for start/end positions).
    pub fn get_field_u64(&self, field: &str) -> Option<u64> {
        match self {
            Self::TypedNode { node, .. } => {
                // SAFETY: `node` was installed by `JsPathEntry::new_typed` from a live
                // `&JsNode` whose referent outlives this entry (upheld by the
                // `walk_js_node_typed` push/pop discipline); access is single-threaded.
                let js_node = unsafe { &**node };
                js_node.get_field_u64(field)
            }
            _ => self.as_value().get(field).and_then(|v| v.as_u64()),
        }
    }

    /// Get the start position of a named child field.
    ///
    /// For `TypedNode` entries, resolves the child `JsNodeId` through the arena.
    /// For `Value` entries, does `node.get(field).get("start").as_u64()`.
    pub fn get_child_field_start(
        &self,
        field: &str,
        arena: &crate::ast::arena::ParseArena,
    ) -> Option<u32> {
        match self {
            Self::TypedNode { node, .. } => {
                // SAFETY: `node` was installed by `JsPathEntry::new_typed` from a live
                // `&JsNode` whose referent outlives this entry (upheld by the
                // `walk_js_node_typed` push/pop discipline); access is single-threaded.
                let js_node = unsafe { &**node };
                js_node.get_child_field_start(field, arena)
            }
            _ => self
                .as_value()
                .get(field)
                .and_then(|v| v.get("start"))
                .and_then(|s| s.as_u64())
                .map(|n| n as u32),
        }
    }

    /// Get the end position of a named child field.
    pub fn get_child_field_end(
        &self,
        field: &str,
        arena: &crate::ast::arena::ParseArena,
    ) -> Option<u32> {
        match self {
            Self::TypedNode { node, .. } => {
                // SAFETY: `node` was installed by `JsPathEntry::new_typed` from a live
                // `&JsNode` whose referent outlives this entry (upheld by the
                // `walk_js_node_typed` push/pop discipline); access is single-threaded.
                let js_node = unsafe { &**node };
                js_node.get_child_field_end(field, arena)
            }
            _ => self
                .as_value()
                .get(field)
                .and_then(|v| v.get("end"))
                .and_then(|e| e.as_u64())
                .map(|n| n as u32),
        }
    }

    /// Get the callee JsNode for a CallExpression entry, if typed.
    ///
    /// Falls back to None for non-typed entries.
    pub fn get_callee_typed<'a>(
        &self,
        arena: &'a crate::ast::arena::ParseArena,
    ) -> Option<&'a crate::ast::typed_expr::JsNode> {
        match self {
            Self::TypedNode { node, .. } => {
                // SAFETY: `node` was installed by `JsPathEntry::new_typed` from a live
                // `&JsNode` whose referent outlives this entry (upheld by the
                // `walk_js_node_typed` push/pop discipline); access is single-threaded.
                let js_node = unsafe { &**node };
                js_node.get_callee(arena)
            }
            _ => None,
        }
    }

    /// Check if this entry is a specific ESTree node type.
    #[inline]
    pub fn is_type(&self, type_name: &str) -> bool {
        self.get_type_str() == Some(type_name)
    }
}

impl std::ops::Deref for JsPathEntry {
    type Target = serde_json::Value;

    #[inline]
    fn deref(&self) -> &serde_json::Value {
        self.as_value()
    }
}

/// Context for AST visitor traversal.
/// Corresponds to AnalysisState in the official compiler.
pub struct VisitorContext<'a> {
    /// The current scope.
    pub scope: usize,
    /// The analysis being built.
    pub analysis: &'a mut ComponentAnalysis,
    /// The parse arena used to resolve JsNodeId and IdRange references.
    pub parse_arena: &'a ParseArena,
    /// The path of nodes from root to current (Svelte template nodes).
    pub path: Vec<&'a TemplateNode>,
    /// JavaScript AST node path (for expressions in scripts).
    /// Uses `JsPathEntry` (a raw pointer wrapper) to avoid expensive deep clones.
    /// SAFETY: Pointers are always valid because walk_js_node pushes a pointer
    /// before visiting and pops it after, matching the call stack lifetime.
    pub js_path: Vec<JsPathEntry>,
    /// Information about the current expression/directive/block value being analyzed.
    /// Set to Some(metadata) when visiting an expression, directive value, or block condition.
    pub expression: Option<*mut crate::ast::template::ExpressionMetadata>,
    /// Parent element name (for validation).
    /// Tag name of parent element. None if parent is svelte:element, #snippet, component or root.
    pub parent_element: Option<String>,
    /// Current function depth.
    pub function_depth: usize,
    /// Depth inside $derived(...) expressions (but not $derived.by(...)) or @const
    pub derived_function_depth: usize,
    /// Whether we have a $props() rune.
    pub has_props_rune: bool,
    /// Current component slots.
    pub component_slots: rustc_hash::FxHashSet<String>,
    /// AST type being analyzed ('instance', 'template', or 'module')
    pub ast_type: AstType,
    /// Current reactive statement being analyzed (for legacy mode)
    pub reactive_statement: Option<*mut super::types::ReactiveStatement>,
    /// Whether we're currently inside a `$:` reactive declaration.
    /// Used for reactive_declaration_module_script_dependency warning.
    pub in_reactive_declaration: bool,
    /// State fields in the current class (for class body analysis)
    pub state_fields: rustc_hash::FxHashMap<String, super::types::StateField>,
    /// Stack of DOM element indices for tracking parent-child relationships.
    pub dom_element_stack: Vec<usize>,
    /// Depth inside regular elements (for placement validation).
    pub element_depth: usize,
    /// Depth inside control flow blocks (for placement validation).
    pub block_depth: usize,
    /// Depth inside component elements (for placement validation).
    pub component_depth: usize,
    /// Whether we've seen svelte:window.
    pub has_svelte_window: bool,
    /// Whether we've seen svelte:body.
    pub has_svelte_body: bool,
    /// Whether we've seen svelte:document.
    pub has_svelte_document: bool,
    /// Whether we've seen svelte:head.
    pub has_svelte_head: bool,
    /// Whether we've seen svelte:options.
    pub has_svelte_options: bool,
    /// First on: directive encountered (name for error message).
    /// Used for mixed_event_handler_syntaxes validation.
    pub event_directive_node: Option<String>,
    /// Whether any event attributes (onclick, etc.) have been used.
    /// Used for mixed_event_handler_syntaxes validation.
    pub uses_event_attributes: bool,
    /// Whether we're inside a template expression tag ({expression}).
    /// Used to detect reactive context for pickled_awaits.
    pub in_expression_tag: bool,
    /// Whether the template expression walker (`walk_js_expression` /
    /// `walk_js_expression_node`) is currently inside a function body.
    /// Mirrors upstream's `expression: null` reset on function entry
    /// (`2-analyze/visitors/shared/function.js`) — awaits inside a function
    /// within a template expression are NOT suspending and must not trigger
    /// the `experimental_async` / `legacy_await_invalid` errors.
    pub in_template_function: bool,
    /// Stack of ignored warning codes.
    /// Each entry is a set of warning codes that should be ignored at that nesting level.
    /// Corresponds to ignore_stack in Svelte's state.js.
    pub ignore_stack: Vec<rustc_hash::FxHashSet<String>>,
    /// Stack of ancestor element names for node_invalid_placement validation.
    /// This is separate from path because path contains TemplateNode references that are difficult to manage.
    pub element_ancestors: Vec<String>,
    /// Tracks whether a block (IfBlock, EachBlock, AwaitBlock, KeyBlock) was entered
    /// since the last element. This is used to determine whether node_invalid_placement
    /// should be a warning (SSR) or error.
    /// The value is the block depth at the time the element was entered.
    pub block_depth_at_element: Vec<usize>,
    /// Stack of EachBlock contexts for animate: validation.
    /// When entering an EachBlock, we push info about it. When an element is visited,
    /// it checks if its direct parent is an EachBlock by checking the top of this stack.
    /// When entering an element, we push None to indicate we're no longer directly in the EachBlock.
    pub each_block_stack: Vec<Option<EachBlockContext>>,
    /// Tracks if we're directly inside a component (for svelte:fragment validation).
    /// This is set to true when entering a Component/SvelteComponent, and reset to false
    /// when entering any other element type.
    pub is_direct_child_of_component: bool,
    /// Stack of slot owner types (Component or CustomElement).
    /// When entering a component, push SlotOwnerType::Component.
    /// When entering a custom element (RegularElement with '-' in name), push SlotOwnerType::CustomElement.
    /// Used to determine if slot attribute is valid - the nearest owner determines behavior.
    pub slot_owner_ancestors: Vec<SlotOwnerType>,
    /// Stack of fragment owner types.
    /// Used for const_tag placement validation - const tags must be direct children of
    /// specific fragment owners (IfBlock, EachBlock, AwaitBlock, KeyBlock, SnippetBlock,
    /// Component, SvelteFragment, SvelteBoundary, or elements with slot attribute).
    pub fragment_owner_stack: Vec<FragmentOwnerType>,
    /// The current scope during template analysis.
    /// This is updated when entering scope-creating constructs like EachBlocks
    /// to allow correct binding lookup for directives inside those constructs.
    /// Used by bind_directive analysis to find the correct binding for bind:group.
    pub current_template_scope: usize,
    /// Whether we're currently inside a {@const} tag expression.
    /// Used to detect invalid rune usage (e.g., $derived() inside {@const}).
    pub in_const_tag: bool,
    /// Whether we're currently inside a bind:this directive expression.
    /// Used to prevent `identifier::visit` from setting `has_direct_template_read`
    /// for bind:this references, since bind:this has special non_reactive_update logic.
    pub in_bind_this: bool,
}

/// Type of ancestor that can "own" a slot attribute.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SlotOwnerType {
    /// A component (Component, SvelteComponent, SvelteSelf, SvelteElement)
    Component,
    /// A custom element (RegularElement with hyphen in name)
    CustomElement,
}

/// Type of parent that owns the current fragment being visited.
/// Used for const_tag placement validation.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum FragmentOwnerType {
    /// Root fragment (top-level)
    Root,
    /// Inside a RegularElement (without slot attribute)
    RegularElement,
    /// Inside a RegularElement with a slot attribute
    RegularElementWithSlot,
    /// Inside a Component (or SvelteComponent, SvelteSelf)
    Component,
    /// Inside an IfBlock branch
    IfBlock,
    /// Inside an EachBlock body or fallback
    EachBlock,
    /// Inside an AwaitBlock branch (pending, then, catch)
    AwaitBlock,
    /// Inside a KeyBlock
    KeyBlock,
    /// Inside a SnippetBlock (scope index, snippet name)
    SnippetBlock(usize, String),
    /// Inside a SvelteFragment
    SvelteFragment,
    /// Inside a SvelteBoundary
    SvelteBoundary,
    /// Inside a SvelteElement (without slot attribute)
    SvelteElement,
    /// Inside a SvelteElement with a slot attribute
    SvelteElementWithSlot,
    /// Inside a SlotElement
    SlotElement,
    /// Inside a SvelteHead
    SvelteHead,
    /// Inside a TitleElement
    TitleElement,
}

/// Type of AST being analyzed.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AstType {
    /// Instance script (`<script>`)
    Instance,
    /// Template (component body)
    Template,
    /// Module script (`<script context="module">`)
    Module,
}

impl<'a> VisitorContext<'a> {
    /// Create a new visitor context.
    pub fn new(analysis: &'a mut ComponentAnalysis, parse_arena: &'a ParseArena) -> Self {
        Self {
            scope: 0,
            analysis,
            parse_arena,
            path: Vec::new(),
            js_path: Vec::new(),
            expression: None,
            parent_element: None,
            function_depth: 0,
            derived_function_depth: 0,
            has_props_rune: false,
            component_slots: rustc_hash::FxHashSet::default(),
            ast_type: AstType::Template,
            reactive_statement: None,
            in_reactive_declaration: false,
            state_fields: rustc_hash::FxHashMap::default(),
            dom_element_stack: Vec::new(),
            element_depth: 0,
            block_depth: 0,
            component_depth: 0,
            has_svelte_window: false,
            has_svelte_body: false,
            has_svelte_document: false,
            has_svelte_head: false,
            has_svelte_options: false,
            event_directive_node: None,
            uses_event_attributes: false,
            in_expression_tag: false,
            in_template_function: false,
            ignore_stack: Vec::new(),
            element_ancestors: Vec::new(),
            block_depth_at_element: Vec::new(),
            each_block_stack: Vec::new(),
            is_direct_child_of_component: false,
            slot_owner_ancestors: Vec::new(),
            fragment_owner_stack: vec![FragmentOwnerType::Root],
            current_template_scope: 0,
            in_const_tag: false,
            in_bind_this: false,
        }
    }

    /// Check if currently inside an element or block (for placement validation).
    pub fn is_inside_element_or_block(&self) -> bool {
        self.element_depth > 0 || self.block_depth > 0 || self.component_depth > 0
    }

    /// Add a DOM element to the structure and return its index.
    pub fn add_dom_element(&mut self, element: CssDomElement) -> usize {
        let idx = self.analysis.css.dom_structure.elements.len();
        self.analysis.css.dom_structure.elements.push(element);
        idx
    }

    /// Get the current parent element index (if any).
    pub fn current_parent_idx(&self) -> Option<usize> {
        self.dom_element_stack.last().copied()
    }

    /// Push ignore codes onto the stack.
    /// This is called when entering a node with preceding svelte-ignore comments.
    pub fn push_ignore(&mut self, ignores: Vec<String>) {
        // Combine with previous level's ignores
        let mut combined = if let Some(prev) = self.ignore_stack.last() {
            prev.clone()
        } else {
            rustc_hash::FxHashSet::default()
        };
        combined.extend(ignores);
        self.ignore_stack.push(combined);
    }

    /// Pop ignore codes from the stack.
    /// This is called when leaving a node that pushed ignores.
    pub fn pop_ignore(&mut self) {
        self.ignore_stack.pop();
    }

    /// Check if a warning code is currently being ignored.
    pub fn is_ignored(&self, code: &str) -> bool {
        if let Some(current_ignores) = self.ignore_stack.last() {
            current_ignores.contains(code)
        } else {
            false
        }
    }

    /// Emit a warning during analysis, but only if it's not being ignored.
    pub fn emit_warning(&mut self, warning: super::warnings::AnalysisWarning) {
        // Check if this warning code is being ignored
        if !self.is_ignored(&warning.code) {
            self.analysis.warnings.push(warning);
        }
    }

    /// Get the current expression being analyzed.
    ///
    /// Returns a mutable reference to the ExpressionMetadata if we're currently
    /// analyzing an expression, or None otherwise.
    ///
    /// This is used by visitors to track metadata about the current expression,
    /// such as whether it contains calls, state references, or assignments.
    pub fn current_expression(&mut self) -> Option<&mut crate::ast::template::ExpressionMetadata> {
        // SAFETY: when set, `self.expression` points at an `ExpressionMetadata`
        // field of an AST node borrowed mutably by the enclosing visit scope
        // (installed and restored by the block visitors, e.g. `if_block`); the
        // referent outlives this `&mut self` borrow and is never aliased
        // (single-threaded traversal), so the dereference is unique and valid.
        self.expression.and_then(|ptr| unsafe { ptr.as_mut() })
    }
}

/// Analyze the template portion of the AST.
pub fn analyze_template(
    ast: &mut Root,
    analysis: &mut ComponentAnalysis,
    parse_arena: &ParseArena,
) -> Result<(), AnalysisError> {
    let mut context = VisitorContext::new(analysis, parse_arena);
    fragment::analyze(&mut ast.fragment, &mut context)?;

    // Build sibling relationships for CSS sibling combinator detection
    build_sibling_relationships(&mut context.analysis.css.dom_structure);

    // Check for mixed event handler syntaxes (on:event and onevent mixed)
    if let Some(ref event_name) = context.event_directive_node
        && context.uses_event_attributes
    {
        return Err(super::errors::mixed_event_handler_syntaxes(event_name));
    }

    Ok(())
}

/// Visit a template node and dispatch to the appropriate visitor.
///
/// Pushes the node onto `context.path` before dispatching, so that the inner
/// visitors and any helpers they call (e.g. `attribute::visit` reading
/// `context.path.last()` for delegated-event detection) see the correct
/// `TemplateNode` enum as their immediate parent. Without this, paths read
/// garbage discriminants from inner-struct casts and matches like
/// `Some(TemplateNode::RegularElement(_))` silently never fire.
///
/// SAFETY: We push a `&TemplateNode` raw-pointer-cast from `node` (which is
/// `&mut TemplateNode`) and immediately pop it after the inner visitor
/// returns. The inner visitor receives `&mut InnerStruct` (e.g.
/// `&mut RegularElement`), which aliases the same memory for the duration of
/// its run. None of the path readers traverse the alias's mutated subtrees,
/// so the only observable property they rely on — the enum discriminant —
/// stays valid.
pub fn visit_node(
    node: &mut TemplateNode,
    context: &mut VisitorContext,
) -> Result<(), AnalysisError> {
    let node_ptr: *const TemplateNode = node as *const _;
    // SAFETY: see this function's doc comment — `node_ptr` aliases `node` for the
    // duration of the inner visit and is popped before `node` is used again; path
    // readers only rely on the enum discriminant, which stays valid.
    context.path.push(unsafe { &*node_ptr });
    let result = match node {
        TemplateNode::Text(text) => text::visit(text, context),
        TemplateNode::RegularElement(element) => regular_element::visit(element, context),
        TemplateNode::Component(component) => component::visit(component, context),
        TemplateNode::SvelteElement(element) => svelte_element::visit(element, context),
        TemplateNode::SvelteComponent(component) => svelte_component::visit(component, context),
        TemplateNode::SvelteSelf(self_) => svelte_self::visit(self_, context),
        TemplateNode::SvelteFragment(fragment) => svelte_fragment::visit(fragment, context),
        TemplateNode::SvelteHead(head) => svelte_head::visit(head, context),
        TemplateNode::SvelteBody(body) => svelte_body::visit(body, context),
        TemplateNode::SvelteWindow(window) => svelte_window::visit(window, context),
        TemplateNode::SvelteDocument(document) => svelte_document::visit(document, context),
        TemplateNode::SvelteBoundary(boundary) => svelte_boundary::visit(boundary, context),
        TemplateNode::SlotElement(slot) => slot_element::visit(slot, context),
        TemplateNode::TitleElement(title) => title_element::visit(title, context),
        TemplateNode::IfBlock(block) => if_block::visit(block, context),
        TemplateNode::EachBlock(block) => each_block::visit(block, context),
        TemplateNode::AwaitBlock(block) => await_block::visit(block, context),
        TemplateNode::KeyBlock(block) => key_block::visit(block, context),
        TemplateNode::SnippetBlock(block) => snippet_block::visit(block, context),
        TemplateNode::ExpressionTag(tag) => expression_tag::visit(tag, context),
        TemplateNode::HtmlTag(tag) => html_tag::visit(tag, context),
        TemplateNode::ConstTag(tag) => const_tag::visit(tag, context),
        TemplateNode::DeclarationTag(tag) => declaration_tag::visit(tag, context),
        TemplateNode::DebugTag(tag) => debug_tag::visit(tag, context),
        TemplateNode::RenderTag(tag) => render_tag::visit(tag, context),
        TemplateNode::AttachTag(tag) => attach_tag::visit(tag, context),
        TemplateNode::SvelteOptions(options) => svelte_options::visit(options, context),
        TemplateNode::Comment(_) => Ok(()), // Comments don't need analysis
    };
    context.path.pop();
    result
}

/// Build sibling relationships for CSS sibling combinator detection.
/// This populates possible_prev_adjacent, possible_next_adjacent,
/// possible_prev_general, and possible_next_general fields in CssDomElement.
fn build_sibling_relationships(dom_structure: &mut DomStructure) {
    // Group elements by their parent
    let mut parent_children: rustc_hash::FxHashMap<Option<usize>, Vec<usize>> =
        rustc_hash::FxHashMap::default();

    for (idx, element) in dom_structure.elements.iter().enumerate() {
        parent_children
            .entry(element.parent_idx)
            .or_default()
            .push(idx);
    }

    // For each parent, build sibling relationships among its children
    for children_indices in parent_children.values() {
        if children_indices.len() < 2 {
            continue; // No siblings if only one child
        }

        // Build adjacent sibling relationships (+ combinator)
        for i in 0..children_indices.len() {
            let current_idx = children_indices[i];

            // Previous adjacent sibling
            if i > 0 {
                let prev_idx = children_indices[i - 1];
                dom_structure.elements[current_idx]
                    .possible_prev_adjacent
                    .push((prev_idx, SiblingCertainty::Definite));
            }

            // Next adjacent sibling
            if i < children_indices.len() - 1 {
                let next_idx = children_indices[i + 1];
                dom_structure.elements[current_idx]
                    .possible_next_adjacent
                    .push((next_idx, SiblingCertainty::Definite));
            }
        }

        // Build general sibling relationships (~ combinator)
        for i in 0..children_indices.len() {
            let current_idx = children_indices[i];

            // All previous siblings
            for &prev_idx in children_indices.iter().take(i) {
                dom_structure.elements[current_idx]
                    .possible_prev_general
                    .push((prev_idx, SiblingCertainty::Definite));
            }

            // All next siblings
            for &next_idx in children_indices.iter().skip(i + 1) {
                dom_structure.elements[current_idx]
                    .possible_next_general
                    .push((next_idx, SiblingCertainty::Definite));
            }
        }
    }
}
