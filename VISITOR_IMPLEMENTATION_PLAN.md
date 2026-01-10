# Phase 2 Visitor Implementation Plan

## Executive Summary

This document provides a prioritized implementation plan for completing the phase 2 analysis visitors in the Svelte Rust compiler. The analysis compares 5 core visitor files with their JavaScript counterparts and identifies missing features organized by priority.

---

## Critical Missing Features (Implement First)

### 1. Expression Context Infrastructure

**Location:** `src/compiler/phases/2_analyze/visitors/mod.rs`

**Changes Required:**

```rust
pub struct VisitorContext<'a> {
    // ... existing fields ...

    /// Stack of expression metadata being built during traversal
    /// This tracks nested expressions (e.g., expressions inside function calls)
    pub expression_stack: Vec<*mut crate::ast::template::ExpressionMetadata>,
}

impl<'a> VisitorContext<'a> {
    /// Push a new expression context onto the stack
    pub fn push_expression(&mut self, expr: *mut ExpressionMetadata) {
        self.expression_stack.push(expr);
    }

    /// Pop the current expression context
    pub fn pop_expression(&mut self) -> Option<*mut ExpressionMetadata> {
        self.expression_stack.pop()
    }

    /// Get the current expression being analyzed
    pub fn current_expression(&mut self) -> Option<&mut ExpressionMetadata> {
        self.expression_stack.last().and_then(|ptr| unsafe { ptr.as_mut() })
    }
}
```

**Impact:** Enables dependency tracking in all expression visitors.

---

### 2. Identifier Dependency Tracking

**Location:** `src/compiler/phases/2_analyze/visitors/identifier.rs`

**Implementation:**

Replace lines 116-122 with:

```rust
// Track dependencies and references in the current expression
if let Some(expression) = context.current_expression() {
    expression.dependencies.insert(binding_idx);
    expression.references.insert(binding_idx);

    // Check if this reference involves state
    let involves_state = binding.kind != BindingKind::Static
        && (binding.kind == BindingKind::Prop
            || binding.kind == BindingKind::BindableProp
            || binding.kind == BindingKind::RestProp
            || !binding.is_function());

    // TODO: Add scope.evaluate() check when implemented
    // && !context.state.scope.evaluate(node).is_known

    if involves_state {
        expression.has_state = true;
    }
}
```

**Dependencies:**
- Expression context infrastructure (above)
- `is_function()` method on Binding (see below)

---

### 3. UpdateExpression Reactive Statement Tracking

**Location:** `src/compiler/phases/2_analyze/visitors/update_expression.rs`

**Implementation:**

Replace lines 46-59 with:

```rust
// Track assignments in reactive statements (legacy mode)
if let Some(reactive_stmt_ptr) = context.reactive_statement {
    let reactive_stmt = unsafe { &mut *reactive_stmt_ptr };

    let id = if argument.get("type").and_then(|t| t.as_str()) == Some("MemberExpression") {
        get_object_identifier(argument)
    } else {
        Some(argument.clone())
    };

    if let Some(id) = id
        && id.get("type").and_then(|t| t.as_str()) == Some("Identifier")
        && let Some(name) = id.get("name").and_then(|n| n.as_str())
        && let Some(&binding_idx) = context.analysis.root.scope.declarations.get(name)
    {
        reactive_stmt.assignments.insert(binding_idx);
    }
}
```

Also, remove `#[allow(dead_code)]` from `get_object_identifier()` (line 99).

**Dependencies:**
- `reactive_statement` field already exists in VisitorContext
- Need to populate it in LabeledStatement visitor

---

### 4. MemberExpression Metadata Tracking

**Location:** `src/compiler/phases/2_analyze/visitors/member_expression.rs`

**Implementation:**

Replace lines 59-66 with:

```rust
// Track expression metadata
if let Some(expression) = context.current_expression() {
    expression.has_member_expression = true;

    if !is_pure(node, context) {
        expression.has_state = true;
    }
}
```

**Dependencies:**
- Expression context infrastructure
- `is_pure()` already implemented in shared/utils.rs

---

### 5. CallExpression Metadata Tracking

**Location:** `src/compiler/phases/2_analyze/visitors/call_expression.rs`

**Implementation:**

Replace lines 318-320 with:

```rust
// Track expression metadata for non-rune calls
if let Some(expression) = context.current_expression() {
    // Check if this call is pure and has no dependencies
    if let Some(callee) = node.get("callee") {
        let has_dependencies = expression.dependencies.len() > 0;
        let is_pure_call = super::shared::utils::is_pure(callee, context);

        if !is_pure_call || has_dependencies {
            expression.has_call = true;
            expression.has_state = true;
        }
    }
}
```

**Dependencies:**
- Expression context infrastructure

---

## High Priority Features (Implement Second)

### 6. Add `object()` Helper to Shared Utils

**Location:** `src/compiler/phases/2_analyze/visitors/shared/utils.rs`

**Implementation:**

Add at the end of the file:

```rust
/// Get the leftmost identifier in a MemberExpression chain.
///
/// For example:
/// - `foo.bar.baz` returns `foo`
/// - `foo` returns `foo`
/// - `this.foo` returns `None` (not an Identifier)
///
/// Corresponds to the `object()` function in Svelte's utils/ast.js.
///
/// # Arguments
///
/// * `expression` - The expression to analyze
///
/// # Returns
///
/// The leftmost identifier, or None if not found or not an Identifier
pub fn get_object_identifier(expression: &Value) -> Option<Value> {
    let mut current = expression;

    // Walk through MemberExpression chain to find the base object
    while current.get("type").and_then(|t| t.as_str()) == Some("MemberExpression") {
        if let Some(object) = current.get("object") {
            current = object;
        } else {
            break;
        }
    }

    // Return the identifier if we found one
    if current.get("type").and_then(|t| t.as_str()) == Some("Identifier") {
        Some(current.clone())
    } else {
        None
    }
}
```

Then update `update_expression.rs` to use this shared function instead of the local one.

---

### 7. Binding Metadata Extensions

**Location:** `src/compiler/phases/2_analyze/scope.rs`

**Add to Binding struct:**

```rust
pub struct Binding {
    // ... existing fields ...

    /// The scope index this binding belongs to (for depth comparison)
    pub scope_idx: usize,

    /// The initial value expression (for is_function check)
    pub initial: Option<serde_json::Value>,
}

impl Binding {
    /// Check if this binding represents a function.
    /// Returns true for function declarations and arrow functions.
    pub fn is_function(&self) -> bool {
        if let Some(ref initial) = self.initial {
            matches!(
                initial.get("type").and_then(|t| t.as_str()),
                Some("FunctionExpression")
                    | Some("ArrowFunctionExpression")
                    | Some("FunctionDeclaration")
            )
        } else {
            // Function declarations don't have 'initial' in some cases
            self.declaration_kind == DeclarationKind::Function
        }
    }
}
```

**Update scope_builder.rs** to populate these new fields when creating bindings.

---

### 8. ExpressionStatement Legacy Component Warning

**Location:** `src/compiler/phases/2_analyze/visitors/expression_statement.rs`

**Implementation:**

Replace the entire file with:

```rust
//! ExpressionStatement visitor.
//!
//! Analyzes expression statements.
//!
//! Corresponds to Svelte's `2-analyze/visitors/ExpressionStatement.js`.

use super::VisitorContext;
use crate::compiler::phases::phase2_analyze::{AnalysisError, BindingKind, DeclarationKind};
use serde_json::Value;

/// Visit an expression statement.
///
/// This visitor detects legacy component instantiation patterns and emits warnings.
pub fn visit(node: &Value, context: &mut VisitorContext) -> Result<(), AnalysisError> {
    // Check for `new Component({ target: ... })` pattern
    if let Some(expression) = node.get("expression")
        && expression.get("type").and_then(|t| t.as_str()) == Some("NewExpression")
        && let Some(callee) = expression.get("callee")
        && callee.get("type").and_then(|t| t.as_str()) == Some("Identifier")
        && let Some(arguments) = expression.get("arguments").and_then(|a| a.as_array())
        && arguments.len() == 1
        && arguments[0].get("type").and_then(|t| t.as_str()) == Some("ObjectExpression")
    {
        // Check if the object has a 'target' property
        let has_target = arguments[0]
            .get("properties")
            .and_then(|p| p.as_array())
            .map(|props| {
                props.iter().any(|p| {
                    p.get("type").and_then(|t| t.as_str()) == Some("Property")
                        && p.get("key")
                            .and_then(|k| k.get("type"))
                            .and_then(|t| t.as_str())
                            == Some("Identifier")
                        && p.get("key").and_then(|k| k.get("name")).and_then(|n| n.as_str())
                            == Some("target")
                })
            })
            .unwrap_or(false);

        if has_target {
            // Check if the callee is an imported .svelte component
            if let Some(name) = callee.get("name").and_then(|n| n.as_str())
                && let Some(&binding_idx) = context.analysis.root.scope.declarations.get(name)
            {
                let binding = &context.analysis.root.bindings[binding_idx];

                if binding.kind == BindingKind::Normal
                    && binding.declaration_kind == DeclarationKind::Import
                {
                    // Check if it's imported from a .svelte file
                    if let Some(ref initial) = binding.initial
                        && initial.get("type").and_then(|t| t.as_str())
                            == Some("ImportDeclaration")
                        && let Some(source) = initial.get("source")
                        && let Some(source_value) = source.get("value").and_then(|v| v.as_str())
                        && source_value.ends_with(".svelte")
                    {
                        // Check if it's a default import
                        if let Some(specifiers) = initial.get("specifiers").and_then(|s| s.as_array())
                        {
                            let is_default_import = specifiers.iter().any(|spec| {
                                spec.get("type").and_then(|t| t.as_str())
                                    == Some("ImportDefaultSpecifier")
                                    && spec
                                        .get("local")
                                        .and_then(|l| l.get("name"))
                                        .and_then(|n| n.as_str())
                                        == Some(name)
                            });

                            if is_default_import {
                                // Emit legacy component creation warning
                                context.emit_warning(
                                    super::super::warnings::legacy_component_creation(),
                                );
                            }
                        }
                    }
                }
            }
        }
    }

    // Visit the expression (continue traversal)
    if let Some(expression) = node.get("expression") {
        super::script::walk_js_node(expression, context)?;
    }

    Ok(())
}
```

**Dependencies:**
- Warning function: `warnings::legacy_component_creation()`

---

## Medium Priority Features (Implement Third)

### 9. State Reference Warnings

**Location:** `src/compiler/phases/2_analyze/visitors/identifier.rs`

**Implementation:**

Add after line 103 (after binding lookup):

```rust
// Warn about state being referenced locally in the same function scope
if context.analysis.runes
    && let Some(&binding_idx) = context.analysis.root.scope.declarations.get(name)
{
    let binding = &context.analysis.root.bindings[binding_idx];

    // Check if we're reading (not writing) state/derived/prop in the same function scope
    let is_read = if let Some(parent) = parent {
        !(parent.get("type").and_then(|t| t.as_str()) == Some("AssignmentExpression")
            && parent.get("left") == Some(node))
            && parent.get("type").and_then(|t| t.as_str()) != Some("UpdateExpression")
    } else {
        true
    };

    if is_read
        && context.function_depth == binding.scope.function_depth
        && matches!(
            binding.kind,
            BindingKind::State
                | BindingKind::RawState
                | BindingKind::Derived
                | BindingKind::Prop
        )
    {
        // Determine if this is a closure or derived context
        let mut warning_type = "closure";

        // Walk up to find if we're inside a $state/$state.raw call
        for ancestor in context.js_path.iter().rev() {
            if ancestor.get("type").and_then(|t| t.as_str()) == Some("CallExpression")
                && context.js_path.iter().any(|n| {
                    n.get("arguments")
                        .and_then(|a| a.as_array())
                        .map(|args| args.iter().any(|arg| {
                            std::ptr::eq(arg as *const _, ancestor as *const _)
                        }))
                        .unwrap_or(false)
                })
            {
                // TODO: Check if this is a $state or $state.raw rune
                // if let Some(rune) = get_rune(ancestor, context) {
                //     if rune == "$state" || rune == "$state.raw" {
                //         warning_type = "derived";
                //         break;
                //     }
                // }
            }

            if matches!(
                ancestor.get("type").and_then(|t| t.as_str()),
                Some("FunctionDeclaration")
                    | Some("FunctionExpression")
                    | Some("ArrowFunctionExpression")
            ) {
                break;
            }
        }

        context.emit_warning(super::super::warnings::state_referenced_locally(
            name,
            warning_type,
        ));
    }
}
```

**Dependencies:**
- `scope.function_depth` field in Scope struct
- Warning function: `warnings::state_referenced_locally()`

---

### 10. Warning System Functions

**Location:** `src/compiler/phases/2_analyze/warnings.rs`

**Add these warning functions:**

```rust
/// Warning when state is referenced locally within the same function
pub fn state_referenced_locally(name: &str, context_type: &str) -> AnalysisWarning {
    AnalysisWarning {
        code: "state_referenced_locally".to_string(),
        message: format!(
            "State variable '{}' is referenced in the same function scope where it's declared. \
             This is a potential issue in {} context.",
            name, context_type
        ),
    }
}

/// Warning when reactive declaration depends on module-scoped variable
pub fn reactive_declaration_module_script_dependency() -> AnalysisWarning {
    AnalysisWarning {
        code: "reactive_declaration_module_script_dependency".to_string(),
        message: "Reactive declaration depends on a variable from the module script which can \
                  cause unexpected behavior."
            .to_string(),
    }
}

/// Warning when using legacy component instantiation
pub fn legacy_component_creation() -> AnalysisWarning {
    AnalysisWarning {
        code: "legacy_component_creation".to_string(),
        message: "Instantiating a component with 'new' is deprecated in Svelte 5. \
                  Use mount() or hydrate() from 'svelte' instead."
            .to_string(),
    }
}
```

---

## Low Priority Features (Implement Last)

### 11. $derived Async Tracking

**Location:** `src/compiler/phases/2_analyze/visitors/call_expression.rs`

Add after the rune validation (around line 242):

```rust
// Handle $derived with special expression context
if rune.as_deref() == Some("$derived") {
    let mut expr_metadata = crate::ast::template::ExpressionMetadata::default();
    let expr_ptr = &mut expr_metadata as *mut _;

    context.push_expression(expr_ptr);
    context.function_depth += 1;
    context.derived_function_depth += 1;

    // Visit children with new context
    if let Some(arguments) = node.get("arguments").and_then(|a| a.as_array()) {
        for arg in arguments {
            super::script::walk_js_node(arg, context)?;
        }
    }

    context.pop_expression();
    context.function_depth -= 1;
    context.derived_function_depth -= 1;

    // Track async deriveds
    if expr_metadata.has_await {
        context.analysis.async_deriveds.insert(node as *const _);
    }

    return Ok(());
}
```

**Dependencies:**
- `async_deriveds` field in ComponentAnalysis

---

### 12. Template Declaration Validation

**Location:** `src/compiler/phases/2_analyze/visitors/identifier.rs`

Add after binding lookup (around line 161):

```rust
// Validate template declaration usage in snippets (experimental.async)
if binding.metadata.is_template_declaration
    && context.analysis.options.experimental.async
{
    let mut snippet_name = None;

    // Find if we're inside a snippet at the same level as the {@const}
    for (i, node) in context.path.iter().enumerate().rev() {
        if let TemplateNode::SnippetBlock(snippet) = node {
            snippet_name = Some(&snippet.expression.name);
        } else if let Some(name) = snippet_name {
            if let TemplateNode::Fragment(fragment) = node {
                if let Some(parent) = context.path.get(i.saturating_sub(1)) {
                    match parent {
                        TemplateNode::Component(comp) if comp.metadata.scopes.default == binding.scope_idx => {
                            return Err(errors::const_tag_invalid_reference(name));
                        }
                        TemplateNode::SvelteBoundary(_) if matches!(name.as_str(), "failed" | "pending") => {
                            // Check scope match
                            if context.analysis.scopes.get(fragment) == Some(&binding.scope_idx) {
                                return Err(errors::const_tag_invalid_reference(name));
                            }
                        }
                        _ => break,
                    }
                }
            }
        }
    }
}
```

**Dependencies:**
- `is_template_declaration` metadata on Binding
- Experimental options support

---

## Testing Plan

### Phase 1: Unit Tests
1. Test expression dependency tracking with nested expressions
2. Test reactive statement assignment detection
3. Test state reference warnings in various scopes
4. Test legacy component creation detection

### Phase 2: Integration Tests
1. Compare analysis output with official compiler on all fixture files
2. Verify warning generation matches expected output
3. Test edge cases for each visitor

### Phase 3: Regression Tests
1. Ensure existing tests still pass
2. Verify no performance degradation
3. Check memory usage with large components

---

## Implementation Order

1. ✅ Create gap analysis document (this file)
2. ⬜ Implement expression context infrastructure (Critical #1)
3. ⬜ Add Binding metadata extensions (High Priority #7)
4. ⬜ Implement Identifier dependency tracking (Critical #2)
5. ⬜ Implement UpdateExpression reactive tracking (Critical #3)
6. ⬜ Implement MemberExpression metadata (Critical #4)
7. ⬜ Implement CallExpression metadata (Critical #5)
8. ⬜ Add object() helper to shared utils (High Priority #6)
9. ⬜ Implement ExpressionStatement warning (High Priority #8)
10. ⬜ Add warning system functions (Medium Priority #10)
11. ⬜ Implement state reference warnings (Medium Priority #9)
12. ⬜ Test and validate all changes
13. ⬜ (Optional) Implement $derived async tracking (Low Priority #11)
14. ⬜ (Optional) Implement template declaration validation (Low Priority #12)

---

## Estimated Effort

- **Critical Features**: 6-8 hours
- **High Priority Features**: 3-4 hours
- **Medium Priority Features**: 4-5 hours
- **Low Priority Features**: 3-4 hours
- **Testing**: 4-6 hours

**Total**: 20-27 hours

---

## Success Criteria

1. All critical features implemented and working
2. Expression dependency tracking matches JavaScript output
3. Reactive statement tracking works correctly
4. Warning system produces expected warnings
5. All existing tests pass
6. Test pass rate improves (target: 80%+ for validator tests)

---

## Notes

- The infrastructure is well-designed; main gap is expression context
- Once expression context is in place, many TODOs resolve quickly
- Warning system is partially implemented; just needs specific functions
- Consider using a feature flag for low-priority experimental features
