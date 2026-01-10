# analyze_component Implementation Guide

## Overview

This document provides a comprehensive guide for fully implementing the `analyze_component` function in `/Users/baseballyama/git/svelte-compiler-rust/src/compiler/phases/2_analyze/mod.rs` to match the official Svelte compiler at `svelte/packages/svelte/src/compiler/phases/2-analyze/index.js`.

## Current Status

The Rust implementation has a basic structure but is missing several critical features from the official compiler. The official implementation has ~935 lines implementing complex analysis logic that needs to be ported.

## Implementation Roadmap

### 1. Store Subscription Processing (Lines 346-445)

**Official compiler behavior:**
- Creates synthetic bindings for `$store` references
- Validates store subscriptions aren't in nested scopes
- Validates store subscriptions aren't used in module context
- In legacy mode, marks backing `let` declarations as state if reassigned
- Handles store/rune naming conflicts

**Implementation steps:**
1. Iterate through `module.scope.references` for names starting with `$`
2. Filter out reserved identifiers (`$$props`, `$$restProps`, `$$slots`)
3. Check for invalid patterns (`$` alone, `$$...`)
4. Determine if it's a rune or a store subscription:
   - If `options.runes === false` → store
   - If rune name but declaration has no rune init → store
   - Special handling for `$derived` from 'svelte/store'
5. Validate not in nested scope (check owner chain)
6. Validate not used in module script
7. Create synthetic binding: `instance.scope.declare(name, 'store_sub', 'synthetic')`
8. In legacy mode callback: mark backing declaration as state if reassigned

**Dependencies:**
- Requires full scope system integration
- Needs reference tracking with path information
- Requires rune detection utilities

**Complexity:** High - Deep scope system integration required

---

### 2. Runes Mode Auto-Detection (Lines 449-451) ✅ IMPLEMENTED

**Status:** Basic implementation complete

**Current implementation:**
```rust
analysis.runes = options.runes.unwrap_or(
    has_instance_await || has_module_await || has_rune_refs
);
```

**Matches official:**
```javascript
const runes =
    options.runes ??
    (has_await || instance.has_await || Array.from(module.scope.references.keys()).some(is_rune));
```

**Potential improvements:**
- Check `module.scope.references` for rune identifiers instead of string matching
- Use proper `has_await` from AST analysis instead of string contains

---

### 3. maybe_runes Mode (Lines 491-510) ✅ IMPLEMENTED

**Status:** Basic implementation complete

**Purpose:** Handles edge case where component doesn't use runes but could (e.g., external modules use runes)

**Conditions for `maybe_runes = true`:**
- Not in runes mode
- `options.runes !== false` (not explicitly disabled)
- No `$$props` or `$$restProps` references
- No `export let` declarations
- No labeled statements (reactive statements)

**Current implementation:** Simplified version that checks first two conditions. Needs AST parsing for full accuracy.

---

### 4. Options Processing ✅ MOSTLY IMPLEMENTED

**Implemented:**
- Custom element detection
- Immutable flag setting
- Inject styles mode
- Accessors mode (with compatibility API check)

**Missing:**
- Warning on deprecated `context="module"` attribute (line 459-463)
- Component name generation and scope

---

### 5. Legacy Mode Processing (Lines 562-673)

**Official compiler does three things:**

#### 5a. Export Let Processing (Lines 563-616)
Converts `export let/var` to props:

```javascript
for (const node of instance.ast.body) {
    if (node.type !== 'ExportNamedDeclaration') continue;

    if (node.declaration) {
        if (node.declaration.type === 'FunctionDeclaration' ||
            node.declaration.type === 'ClassDeclaration') {
            // Add to exports list
            analysis.exports.push({ name: node.declaration.id.name, alias: null });
        } else if (node.declaration.type === 'VariableDeclaration') {
            if (node.declaration.kind === 'const') {
                // Add identifiers to exports
            } else {
                // Mark bindings as bindable_prop
                binding.kind = 'bindable_prop';
            }
        }
    } else {
        // Handle export specifiers
        for (const specifier of node.specifiers) {
            const binding = instance.scope.get(specifier.local.name);
            if (binding && (binding.declaration_kind === 'var' || binding.declaration_kind === 'let')) {
                binding.kind = 'bindable_prop';
                if (specifier.exported.name !== specifier.local.name) {
                    binding.prop_alias = specifier.exported.name;
                }
            } else {
                analysis.exports.push({ name: specifier.local.name, alias: specifier.exported.name });
            }
        }
    }
}
```

**Status:** NOT IMPLEMENTED
**Complexity:** Medium - Requires AST walking and binding mutation

#### 5b. State Conversion (Lines 618-636)
Convert reassigned/mutated bindings to state if used in template:

```javascript
for (const binding of instance.scope.declarations.values()) {
    if (binding.kind !== 'normal') continue;

    for (const { node, path } of binding.references) {
        if (node === binding.node) continue;

        if (binding.updated) {
            if (path[path.length - 1].type === 'StyleDirective' ||
                path.some((node) => node.type === 'Fragment') ||
                (path[1].type === 'LabeledStatement' && path[1].label.name === '$')) {
                binding.kind = 'state';
            }
        }
    }
}
```

**Status:** NOT IMPLEMENTED
**Complexity:** Medium - Requires path tracking in references

#### 5c. Each Block Mutations (Lines 638-673)
If an each block binding is mutated, treat the expression as mutated:

```javascript
walk(template.ast, null, {
    EachBlock(node) {
        const scope = template.scopes.get(node);
        for (const binding of scope.declarations.values()) {
            if (binding.updated) {
                // Walk node.expression and mark bindings as state
            }
        }
    }
});
```

**Status:** NOT IMPLEMENTED
**Complexity:** Medium - Requires recursive AST walking

---

### 6. Post-Analysis Validations (Lines 694-934)

#### 6a. Runes Mode Validation (Lines 694-703) ✅ PARTIAL

**Current:** Basic check for `$$props`/`$$restProps` in source
**Needed:** Check actual scope references and throw proper errors

#### 6b. Non-Reactive Update Warnings (Lines 728-768)

Warn when normal bindings are reassigned and used in template:

```javascript
for (const scope of [module.scope, instance.scope]) {
    outer: for (const [name, binding] of scope.declarations) {
        if (binding.kind === 'normal' && binding.reassigned) {
            inner: for (const { path } of binding.references) {
                if (path[0].type !== 'Fragment') continue;
                // Check if in function context
                for (let i = 1; i < path.length; i += 1) {
                    const type = path[i].type;
                    if (type === 'FunctionDeclaration' ||
                        type === 'FunctionExpression' ||
                        type === 'ArrowFunctionExpression') {
                        continue inner;
                    }
                    // Special handling for bind:this
                }
                w.non_reactive_update(binding.node, name);
                continue outer;
            }
        }
    }
}
```

**Status:** NOT IMPLEMENTED
**Complexity:** High - Requires full reference path tracking

#### 6c. Legacy Mode Specifics (Lines 769-809)

- Declare synthetic `$$props` and `$$restProps` bindings
- Warn on unused `export let`
- Order reactive statements

**Status:** PARTIALLY IMPLEMENTED (order_reactive_statements exists)

#### 6d. Export Validation (Lines 812-827)

Check that exported identifiers exist:

```javascript
for (const node of analysis.module.ast.body) {
    if (node.type === 'ExportNamedDeclaration' && node.specifiers && !node.source) {
        for (const specifier of node.specifiers) {
            const name = specifier.local.name;
            const binding = analysis.module.scope.get(name);
            if (!binding) {
                if (analysis.snippets.find(s => s.expression.name === name)) {
                    e.snippet_invalid_export(specifier);
                } else {
                    e.export_undefined(specifier, name);
                }
            }
        }
    }
}
```

**Status:** NOT IMPLEMENTED
**Complexity:** Low - Straightforward validation

#### 6e. Mixed Event Handler Syntax Check (Lines 829-834) ✅ PARTIAL

**Current:** Basic check implemented
**Needed:** Proper error throwing

#### 6f. Snippet Renderer Resolution (Lines 836-844)

```javascript
for (const [node, resolved] of analysis.snippet_renderers) {
    if (!resolved) {
        node.metadata.snippets = analysis.snippets;
    }
    for (const snippet of node.metadata.snippets) {
        snippet.metadata.sites.add(node);
    }
}
```

**Status:** NOT IMPLEMENTED
**Complexity:** Medium - Requires snippet tracking

#### 6g. Slot/Snippet Conflict Check (Lines 846-852) ✅ PARTIAL

**Current:** Basic check implemented
**Needed:** Proper error with position

#### 6h. Empty Attribute Addition (Lines 874-929)

Add empty `class=""` and `style=""` where needed:

```javascript
for (const node of analysis.elements) {
    if (node.metadata.scoped && is_custom_element_node(node)) {
        mark_subtree_dynamic(node.metadata.path);
    }

    let has_class = false;
    let has_style = false;
    let has_spread = false;
    let has_class_directive = false;
    let has_style_directive = false;

    for (const attribute of node.attributes) {
        // Check attribute types
    }

    // Add empty class if needed
    if (!has_spread && !has_class && (node.metadata.scoped || has_class_directive)) {
        node.attributes.push(create_attribute('class', ...));
    }

    // Add empty style if needed
    if (!has_spread && !has_style && has_style_directive) {
        node.attributes.push(create_attribute('style', ...));
    }
}
```

**Status:** NOT IMPLEMENTED
**Complexity:** Medium - Requires AST mutation

---

### 7. Blocker Calculation (Lines 937-1216)

This is the most complex feature. It analyzes async dependencies to determine execution order.

**Purpose:**
- Categorize statements into hoisted/sync/async
- Track which bindings depend on async operations
- Set `blocker` fields on bindings
- Build `instance_body` structure

**Algorithm:**
1. Walk through `instance.ast.body`
2. For each statement:
   - `ImportDeclaration` → hoisted
   - `FunctionDeclaration` → sync (but analyze body later)
   - `VariableDeclaration`:
     - If function expression → sync
     - If no await in file yet → sync
     - Otherwise → async (with dependency tracking)
   - Other statements with await → async
3. For async statements:
   - Trace all read/write references
   - Create blocker expression: `promises[index]`
   - Assign blocker to all written bindings
4. For functions:
   - Analyze after all statements categorized
   - Find max blocker of referenced bindings
   - Assign that blocker to function binding

**Data structures:**
```rust
pub struct InstanceBody {
    pub hoisted: Vec<Statement>,
    pub sync: Vec<Statement>,
    pub async_stmts: Vec<AsyncStatement>,
    pub declarations: Vec<Identifier>,
}

pub struct AsyncStatement {
    pub node: Statement,
    pub has_await: bool,
}

// On Binding:
pub blocker: Option<MemberExpression>, // promises[index]
```

**Status:** NOT IMPLEMENTED
**Complexity:** VERY HIGH - Requires:
- AST walking with scope tracking
- Dependency graph analysis
- Reference tracing (reads vs writes)
- Recursive function analysis

---

## Priority Implementation Order

1. **High Priority** (Blocks runtime test progress):
   - Legacy mode export let processing
   - State conversion for reassigned bindings
   - Non-reactive update warnings
   - Export validation

2. **Medium Priority** (Improves correctness):
   - Store subscription processing
   - Blocker calculation (for async support)
   - Empty attribute addition

3. **Low Priority** (Polish):
   - Improved runes detection (use scope refs)
   - Snippet renderer resolution
   - Unused export let warnings

## Helper Functions Status

### ✅ order_reactive_statements (Lines 1218-1282)
**Status:** IMPLEMENTED
- Topologically sorts reactive statements
- Detects cycles
- Preserves insertion order

### ✅ check_graph_for_cycles (Lines 1218-1282)
**Status:** IMPLEMENTED
- DFS-based cycle detection
- Returns first cycle found

### ❌ calculate_blockers (Lines 937-1216)
**Status:** NOT IMPLEMENTED
- Most complex helper
- Requires full implementation

## Testing Strategy

1. Start with simple components (no legacy features)
2. Add export let tests
3. Add reactive statement tests
4. Add async/await tests
5. Add store subscription tests

## References

- Official implementation: `svelte/packages/svelte/src/compiler/phases/2-analyze/index.js`
- Rust implementation: `src/compiler/phases/2_analyze/mod.rs`
- Test suite: `fixtures/compiler-snapshot/*.svelte`

## Notes

The implementation should follow the official compiler's structure exactly, even if some features seem redundant or complex. This ensures 100% compatibility with the existing test suite and ecosystem.
