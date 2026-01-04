//! Scope management for the analyzer.
//!
//! Tracks variable bindings, declarations, and references across scopes.

use std::collections::HashMap;

/// The root scope container for a component.
#[derive(Debug, Default)]
pub struct ScopeRoot {
    /// All unique bindings in the component
    pub bindings: Vec<Binding>,
    /// The root scope
    pub scope: Scope,
}

impl ScopeRoot {
    /// Create a new scope root.
    pub fn new() -> Self {
        Self {
            bindings: Vec::new(),
            scope: Scope::new(None),
        }
    }
}

/// A lexical scope containing variable bindings.
#[derive(Debug, Default)]
pub struct Scope {
    /// Parent scope index (None for root)
    pub parent: Option<usize>,
    /// Bindings declared in this scope (name -> binding index)
    pub declarations: HashMap<String, usize>,
    /// References to bindings in this scope
    pub references: Vec<Reference>,
    /// Child scopes
    pub children: Vec<usize>,
}

impl Scope {
    /// Create a new scope.
    pub fn new(parent: Option<usize>) -> Self {
        Self {
            parent,
            declarations: HashMap::new(),
            references: Vec::new(),
            children: Vec::new(),
        }
    }

    /// Declare a binding in this scope.
    pub fn declare(&mut self, name: String, binding_index: usize) {
        self.declarations.insert(name, binding_index);
    }

    /// Check if a name is declared in this scope.
    pub fn is_declared(&self, name: &str) -> bool {
        self.declarations.contains_key(name)
    }
}

/// A variable binding.
#[derive(Debug, Clone)]
pub struct Binding {
    /// The binding kind
    pub kind: BindingKind,
    /// The name of the binding
    pub name: String,
    /// Whether the binding is mutable
    pub is_mutable: bool,
    /// Whether the binding has been mutated
    pub is_mutated: bool,
    /// Whether the binding is reactive (uses $state, $derived, etc.)
    pub is_reactive: bool,
    /// Whether the binding is referenced
    pub is_referenced: bool,
    /// The scope index where this binding is declared
    pub scope_index: usize,
    /// Initial value expression (if any)
    pub initial: Option<String>,
}

impl Binding {
    /// Create a new binding.
    pub fn new(name: String, kind: BindingKind, scope_index: usize) -> Self {
        Self {
            kind,
            name,
            is_mutable: false,
            is_mutated: false,
            is_reactive: false,
            is_referenced: false,
            scope_index,
            initial: None,
        }
    }
}

/// The kind of binding.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BindingKind {
    /// A normal variable binding (let, const, var)
    Normal,
    /// A component prop
    Prop,
    /// A rest prop ($$restProps)
    RestProp,
    /// An each block item
    EachItem,
    /// An each block index
    EachIndex,
    /// An await block value (then value)
    AwaitThen,
    /// An await block error (catch error)
    AwaitCatch,
    /// A snippet parameter
    SnippetParam,
    /// A let directive binding
    Let,
    /// A store subscription ($store)
    Store,
    /// A legacy reactive statement ($:)
    LegacyReactive,
}

/// A reference to a binding.
#[derive(Debug, Clone)]
pub struct Reference {
    /// The name being referenced
    pub name: String,
    /// The binding index (if resolved)
    pub binding_index: Option<usize>,
    /// Start position in source
    pub start: usize,
    /// End position in source
    pub end: usize,
}

impl Reference {
    /// Create a new reference.
    pub fn new(name: String, start: usize, end: usize) -> Self {
        Self {
            name,
            binding_index: None,
            start,
            end,
        }
    }
}
