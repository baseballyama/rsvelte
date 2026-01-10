# Blocker Implementation for Async Dependencies

This document describes the implementation of the `calculate_blockers` function and related infrastructure for tracking async dependencies in Svelte component instance scripts.

## Overview

The blocker system is used to track async dependencies in instance-level declarations. When a component has top-level `await` expressions in its `<script>` tag, some bindings may not be immediately available. The blocker system ensures that:

1. Template reads of async-dependent bindings wait for the corresponding promises to resolve
2. Functions that reference async bindings are properly marked as blocked
3. The instance body is split into `sync`, `async`, `hoisted`, and `declarations` sections

## Reference Implementation

The implementation is based on `calculate_blockers()` in:
```
svelte/packages/svelte/src/compiler/phases/2-analyze/index.js
```

## Files Modified

### 1. `/src/compiler/phases/2_analyze/scope.rs`

Added blocker tracking to the `Binding` structure:

```rust
pub struct Binding {
    // ... existing fields ...

    /// Instance-level declarations may follow (or contain) a top-level `await`. In these cases,
    /// any reads that occur in the template must wait for the corresponding promise to resolve
    /// otherwise the initial value will not have been assigned.
    /// It is a member expression of the form `$$promises[n]`.
    /// Corresponds to `blocker` field in Svelte's Binding class (scope.js).
    pub blocker: Option<BlockerExpression>,
}

/// A blocker expression representing `$$promises[n]`.
/// Used to track async dependencies in instance-level declarations.
#[derive(Debug, Clone)]
pub struct BlockerExpression {
    /// The index in the $$promises array
    pub index: usize,
}
```

**Key Points:**
- The `blocker` field is `Option<BlockerExpression>` (None if not blocked)
- `BlockerExpression` stores the index into the `$$promises` array
- In the official compiler, this is a MemberExpression AST node (`$$promises[n]`)

### 2. `/src/compiler/phases/2_analyze/types.rs`

Updated `InstanceBody` to match the official compiler structure:

```rust
/// Pre-transformed instance script body sections.
/// Corresponds to `instance_body` in ComponentAnalysis (phases/types.d.ts).
#[derive(Debug, Default, Clone)]
pub struct InstanceBody {
    /// Statements hoisted to the top (imports)
    pub hoisted: Vec<serde_json::Value>,
    /// Synchronous statements (regular let/const declarations, function declarations)
    pub sync: Vec<serde_json::Value>,
    /// Asynchronous statements (with their await status)
    pub async_: Vec<AsyncStatement>,
    /// Variable declarations (identifiers that need blocker tracking)
    pub declarations: Vec<String>,
}

/// An asynchronous statement with its await status.
#[derive(Debug, Clone)]
pub struct AsyncStatement {
    /// The statement node (VariableDeclarator or Statement)
    pub node: serde_json::Value,
    /// Whether this statement contains await expressions
    pub has_await: bool,
}
```

**Key Changes:**
- Changed from `Vec<String>` to `Vec<serde_json::Value>` for AST nodes
- Renamed `async_stmts` to `async_` to match official compiler
- Added proper documentation

### 3. `/src/compiler/phases/2_analyze/blockers.rs` (New File)

Created a new module implementing the blocker calculation algorithm:

```rust
pub fn calculate_blockers(
    instance: &JsAnalysis,
    scopes: &HashMap<usize, Scope>,
    analysis: &mut ComponentAnalysis,
)
```

**Algorithm Overview:**

1. **Touch Bindings**: Recursively find all bindings referenced by an expression
   - Walk the AST to find all `Identifier` references
   - For each binding, recursively touch all its assignments
   - Prevents infinite loops with a `seen` set

2. **Trace References**: Find all bindings read and written by a statement
   - Track writes from `AssignmentExpression`, `UpdateExpression`
   - Track reads from `Identifier` references
   - Special handling for `CallExpression` (assumes mutations)
   - Skips `$effect` runes (they run after async work completes)

3. **Categorize Statements**:
   - **Imports** → `hoisted`
   - **Functions** → `sync` (analyzed later for indirect blockers)
   - **Variable declarations before first await** → `sync`
   - **Variable declarations after await** → `async` with blocker assignment
   - **Other statements after await** → `async` with blocker assignment

4. **Assign Blockers**:
   - Each async statement gets a blocker: `$$promises[n]` where `n` is the index
   - All bindings written by that statement get the same blocker
   - All identifiers declared by that statement are tracked in `declarations`

5. **Analyze Functions** (deferred):
   - After categorization, analyze function bodies
   - Find the maximum blocker index referenced in the function
   - Assign that blocker to the function binding
   - This ensures functions wait for all async dependencies

## How Blockers Work

### Example 1: Simple Async Declaration

```svelte
<script>
  const data = await fetch('/api/data').then(r => r.json());
  let processed = data.map(x => x * 2);
</script>

<div>{processed}</div>
```

**Analysis:**
1. `data` is async (contains await) → blocker = `$$promises[0]`
2. `processed` references `data` → blocker = `$$promises[0]`
3. Template reads `processed` → must wait for `$$promises[0]`

### Example 2: Function Referencing Async Binding

```svelte
<script>
  const config = await loadConfig();

  function useConfig() {
    return config.value;
  }
</script>

<button on:click={useConfig}>Use</button>
```

**Analysis:**
1. `config` is async → blocker = `$$promises[0]`
2. `useConfig` references `config` → blocker = `$$promises[0]`
3. Event handler must wait for `$$promises[0]` before calling

### Example 3: Indirect Dependencies

```svelte
<script>
  const a = await fetchA();
  const b = await fetchB();
  let c = a + b;

  function process() {
    return c * 2;
  }
</script>
```

**Analysis:**
1. `a` → blocker = `$$promises[0]`
2. `b` → blocker = `$$promises[1]`
3. `c` references both → blocker = `$$promises[1]` (latest)
4. `process` references `c` → blocker = `$$promises[1]`

## Integration Points

The blocker system integrates with:

1. **Phase 2 Analysis** (`analyze_component`):
   - Called after scope creation
   - Populates `analysis.instance_body`
   - Sets `binding.blocker` for all affected bindings

2. **Phase 3 Client Transform**:
   - Generates `$$promises` array
   - Wraps async statements in promise chains
   - Inserts `await` for blocker dependencies in templates
   - Generates proper initialization order

3. **Template Code Generation**:
   - Checks `binding.blocker` when reading bindings
   - Inserts `await $$promises[n]` before first read
   - Ensures correct execution order

## Current Implementation Status

✅ **Completed:**
- Blocker field added to `Binding` structure
- `BlockerExpression` type defined
- `InstanceBody` structure updated
- Blocker calculation module created
- Helper functions for AST traversal

⚠️ **Partial/TODO:**
- Full AST walking implementation (requires JavaScript AST parser integration)
- Binding assignments tracking (requires Phase 2 scope builder enhancement)
- Integration with `analyze_component` function
- `has_await_expression` helper function
- Rune detection (`get_rune` for `$effect`, `$props.id`)

❌ **Not Started:**
- Phase 3 code generation for blockers
- `$$promises` array generation
- Template blocker injection

## Testing

To test the blocker system:

1. Create a component with top-level await:
```svelte
<script>
  const data = await fetch('/api').then(r => r.json());
  let count = data.count;
</script>
<div>{count}</div>
```

2. Run analysis and check:
   - `instance_body.async` contains the await statement
   - `instance_body.declarations` contains `data` and `count`
   - Bindings for `data` and `count` have `blocker.index = 0`

3. Verify Phase 3 generates:
```js
const $$promises = [];
$$promises[0] = fetch('/api').then(r => r.json()).then(data => {
  count = data.count;
});
```

## References

- Official Implementation: `svelte/packages/svelte/src/compiler/phases/2-analyze/index.js` (lines 937-1215)
- Binding Definition: `svelte/packages/svelte/src/compiler/phases/scope.js` (lines 87-189)
- Type Definitions: `svelte/packages/svelte/src/compiler/types/index.d.ts`
- Phase 3 Usage: `svelte/packages/svelte/src/compiler/phases/3-transform/client/transform-client.js`

## Next Steps

1. Implement full `calculate_blockers` with real AST walking
2. Add `has_await_expression` helper
3. Integrate with `analyze_component`
4. Add unit tests for blocker assignment
5. Implement Phase 3 code generation for `$$promises`
6. Add integration tests with real components
