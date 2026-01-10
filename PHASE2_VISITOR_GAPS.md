# Phase 2 Visitor Implementation Gaps

This document analyzes the missing features in the phase 2 analysis visitors by comparing the Rust implementation with the original JavaScript implementation.

## Summary

Five core visitor files need enhancements to match the original Svelte compiler:

1. **Identifier.js** → **identifier.rs** - Reactive identifier tracking
2. **CallExpression.js** → **call_expression.rs** - Expression metadata tracking
3. **MemberExpression.js** → **member_expression.rs** - Expression metadata tracking
4. **UpdateExpression.js** → **update_expression.rs** - Reactive statement tracking
5. **ExpressionStatement.js** → **expression_statement.rs** - Legacy component creation warnings

## Detailed Gap Analysis

### 1. Identifier.rs

**Missing Features:**

#### A. Expression Dependency Tracking (Lines 92-102 in JS)
```javascript
if (context.state.expression) {
    context.state.expression.dependencies.add(binding);
    context.state.expression.references.add(binding);
    context.state.expression.has_state ||=
        binding.kind !== 'static' &&
        (binding.kind === 'prop' || binding.kind === 'bindable_prop' ||
         binding.kind === 'rest_prop' || !binding.is_function()) &&
        !context.state.scope.evaluate(node).is_known;
}
```

**Status:** Partially commented out (lines 116-122)
**Required:** Need to implement expression context tracking in VisitorContext

#### B. State Reference Warnings (Lines 104-151 in JS)
Warns when $state/$derived is referenced locally within the same function scope.

```javascript
if (context.state.analysis.runes && node !== binding.node &&
    context.state.function_depth === binding.scope.function_depth && ...) {
    w.state_referenced_locally(node, node.name, type);
}
```

**Status:** Not implemented (TODO comment on line 120)
**Required:** Need to track function_depth properly and implement warning system

#### C. Reactive Declaration Module Warnings (Lines 153-159 in JS)
```javascript
if (context.state.reactive_statement &&
    binding.scope === context.state.analysis.module.scope &&
    binding.reassigned) {
    w.reactive_declaration_module_script_dependency(node);
}
```

**Status:** Not implemented (TODO comment on line 121)
**Required:** Need reactive_statement tracking in VisitorContext

#### D. Template Declaration Validation (Lines 161-191 in JS)
Validates {@const} declarations in snippets with experimental.async option.

**Status:** Not implemented (TODO comment on line 122)
**Required:** Need to implement template declaration metadata and experimental options

---

### 2. CallExpression.rs

**Missing Features:**

#### A. Expression Metadata for $derived (Lines 244-257 in JS)
```javascript
if (rune === '$derived') {
    const expression = new ExpressionMetadata();
    context.next({
        ...context.state,
        function_depth: context.state.function_depth + 1,
        derived_function_depth: context.state.function_depth + 1,
        expression
    });
    if (expression.has_await) {
        context.state.analysis.async_deriveds.add(node);
    }
}
```

**Status:** Commented out (lines 318-320)
**Required:** Need expression context stack and async_deriveds tracking

#### B. Expression Metadata for $inspect (Lines 258-260 in JS)
```javascript
else if (rune === '$inspect') {
    context.next({ ...context.state, function_depth: context.state.function_depth + 1 });
}
```

**Status:** Commented out (line 319)
**Required:** Need proper visitor traversal with state

#### C. Expression Has Call Tracking (Lines 264-272 in JS)
```javascript
if (context.state.expression) {
    if (!is_pure(node.callee, context) || context.state.expression.dependencies.size > 0) {
        context.state.expression.has_call = true;
        context.state.expression.has_state = true;
    }
}
```

**Status:** Commented out (line 320)
**Required:** Need expression context tracking

#### D. $inspect.trace Label Generation (Lines 213-224 in JS)
```javascript
if (dev) {
    if (node.arguments[0]) {
        context.state.scope.tracing = b.thunk(node.arguments[0]);
    } else {
        const label = get_function_label(context.path.slice(0, -2)) ?? 'trace';
        const loc = `(${locate_node(fn)})`;
        context.state.scope.tracing = b.thunk(b.literal(label + ' ' + loc));
    }
    context.state.analysis.tracing = true;
}
```

**Status:** Simplified (lines 279-280) - only sets tracing flag
**Required:** Need scope.tracing field and dev mode detection

---

### 3. MemberExpression.rs

**Missing Features:**

#### A. Expression Metadata Tracking (Lines 18-21 in JS)
```javascript
if (context.state.expression) {
    context.state.expression.has_member_expression = true;
    context.state.expression.has_state ||= !is_pure(node, context);
}
```

**Status:** Commented out (lines 59-66)
**Required:** Need expression context infrastructure

---

### 4. UpdateExpression.rs

**Missing Features:**

#### A. Reactive Statement Assignment Tracking (Lines 13-22 in JS)
```javascript
if (context.state.reactive_statement) {
    const id = node.argument.type === 'MemberExpression'
        ? object(node.argument)
        : node.argument;
    if (id?.type === 'Identifier') {
        const binding = context.state.scope.get(id.name);
        if (binding) {
            context.state.reactive_statement.assignments.add(binding);
        }
    }
}
```

**Status:** Commented out (lines 46-56)
**Required:** Need reactive_statement in VisitorContext and object() helper function

#### B. Expression Assignment Tracking (Lines 24-26 in JS)
```javascript
if (context.state.expression) {
    context.state.expression.has_assignment = true;
}
```

**Status:** Commented out (lines 69-78)
**Required:** Need expression context tracking

**Helper Function Needed:**
The `object()` function (lines 99-118) is defined but marked as dead_code. This extracts the leftmost identifier from a MemberExpression chain.

---

### 5. ExpressionStatement.rs

**Missing Features:**

#### A. Legacy Component Creation Warning (Lines 10-35 in JS)
```javascript
if (node.expression.type === 'NewExpression' &&
    node.expression.callee.type === 'Identifier' &&
    node.expression.arguments.length === 1 &&
    node.expression.arguments[0].type === 'ObjectExpression' &&
    node.expression.arguments[0].properties.some(p =>
        p.type === 'Property' && p.key.type === 'Identifier' && p.key.name === 'target'
    )) {
    const binding = context.state.scope.get(node.expression.callee.name);
    if (binding?.kind === 'normal' && binding.declaration_kind === 'import') {
        const declaration = binding.initial;
        if (declaration.source.value.endsWith('.svelte') &&
            declaration.specifiers.find(s =>
                s.local.name === binding.node.name && s.type === 'ImportDefaultSpecifier'
            )) {
            w.legacy_component_creation(node.expression);
        }
    }
}
```

**Status:** Not implemented - file only contains basic visitor stub (lines 14-21)
**Required:** Need to detect `new Component({ target: ... })` pattern and check import source

---

## Infrastructure Requirements

To implement these missing features, the following infrastructure needs to be added:

### 1. Expression Context Stack in VisitorContext

```rust
pub struct VisitorContext<'a> {
    // ... existing fields ...

    /// Stack of expression metadata being built during traversal
    pub expression_stack: Vec<&'a mut crate::ast::template::ExpressionMetadata>,

    /// Current expression being analyzed (top of stack)
    pub expression: Option<&'a mut crate::ast::template::ExpressionMetadata>,
}
```

### 2. Reactive Statement Tracking

Already present in VisitorContext:
```rust
pub reactive_statement: Option<*mut super::types::ReactiveStatement>,
```

Need to properly populate and use this field in LabeledStatement visitor.

### 3. Helper Functions

#### object() function
Extract the leftmost identifier from a MemberExpression chain.
Already implemented in update_expression.rs but marked as dead_code (lines 99-118).
Should be moved to shared/utils.rs and used across visitors.

#### is_function() method on Binding
Check if a binding represents a function declaration.
Currently not implemented in the Binding struct.

#### evaluate() method on Scope
Evaluate if an expression has a known static value.
Currently not implemented.

### 4. Warning System

Need to implement warning functions:
- `w.state_referenced_locally()`
- `w.reactive_declaration_module_script_dependency()`
- `w.legacy_component_creation()`
- `w.block_empty()`

Already have a warnings module at `src/compiler/phases/2_analyze/warnings.rs`

### 5. Binding Metadata

Need to add fields to Binding struct:
```rust
pub struct Binding {
    // ... existing fields ...

    /// The scope this binding belongs to (for function_depth comparison)
    pub scope: usize,

    /// Whether this represents a template declaration ({@const})
    pub is_template_declaration: bool,

    /// The initial value node (for checking function vs value bindings)
    pub initial: Option<serde_json::Value>,
}
```

### 6. Scope Metadata

Need to add to Scope struct:
```rust
pub struct Scope {
    // ... existing fields ...

    /// Function depth of this scope
    pub function_depth: usize,

    /// Tracing expression for $inspect.trace() (dev mode only)
    pub tracing: Option<serde_json::Value>,
}
```

### 7. ComponentAnalysis Fields

Need to add:
```rust
pub struct ComponentAnalysis {
    // ... existing fields ...

    /// Set of CallExpression nodes that are async $derived
    pub async_deriveds: HashSet<*const serde_json::Value>,
}
```

---

## Implementation Priority

1. **High Priority** (Required for correctness):
   - Expression dependency tracking (Identifier.rs A)
   - Reactive statement tracking (UpdateExpression.rs A)
   - Expression metadata tracking (CallExpression.rs C, MemberExpression.rs A)

2. **Medium Priority** (Required for warnings):
   - State reference warnings (Identifier.rs B)
   - Reactive declaration warnings (Identifier.rs C)
   - Legacy component creation warnings (ExpressionStatement.rs A)

3. **Low Priority** (Required for advanced features):
   - Template declaration validation (Identifier.rs D)
   - $derived async tracking (CallExpression.rs A)
   - $inspect.trace label generation (CallExpression.rs D)

---

## Testing Strategy

After implementing the missing features:

1. Run existing phase 2 tests to ensure no regressions
2. Add specific test cases for:
   - Expression dependency tracking in various contexts
   - Reactive statement assignment tracking
   - State reference warnings in different scopes
   - Legacy component creation detection
3. Compare analysis output with official compiler on fixture files

---

## Notes

- The Rust implementation already has good structure and many features implemented
- Main gap is the expression context tracking infrastructure
- Once expression context is implemented, many TODOs can be resolved
- Warning system needs to be fleshed out but infrastructure is in place
- Some features like scope.evaluate() and binding.is_function() require additional infrastructure

---

## Next Steps

1. Implement expression context stack in VisitorContext
2. Add object() helper to shared/utils.rs
3. Implement missing Binding and Scope metadata fields
4. Update Identifier visitor with dependency tracking
5. Update UpdateExpression with reactive statement tracking
6. Update MemberExpression with expression metadata
7. Update CallExpression with expression metadata
8. Implement ExpressionStatement legacy component warning
9. Add warning system functions
10. Test and validate against official compiler output
