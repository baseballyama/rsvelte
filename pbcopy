# 100x Single-Threaded Speedup: Implementation Guide

## Current State (2026-03-23, commit 737b7da)

### Benchmark (3654 Svelte test files)
```
Task               | JS       | Rust ST  | Speedup | Rust MT  | MT Speedup
Compile (Client)   |  ~700ms  |  ~310ms  |  2.3x   |  ~45ms   |  ~17x
Compile (SSR)      |  ~600ms  |  ~325ms  |  1.8x   |  ~45ms   |  ~14x
Parse              |  ~150ms  |  ~112ms  |  1.3x   |  ~15ms   |  ~10x
```

### Per-file Profile (7KB file, median)
```
Phase      | Time     | % of Total
Parse      | 226 us   | 15%
Analyze    | 395 us   | 25%
Transform  | 917 us   | 60%
Total      | 1540 us  | 100%
```

### Target
- **100x single-threaded**: ~310ms / 100 = 3.1ms for 3654 files = 0.85 us/file
- **Current**: ~310ms / 3654 = 85 us/file
- **Gap**: 100x improvement needed

---

## Why It's Slow: Root Causes

### 1. Text-based Transform Pipeline (48.86% CPU, 19,606 lines)
The #1 bottleneck. Instance script code is transformed by **character-by-character string scanning**:
- `$state(x)` -> `$.state(x)` (rune_transforms.rs, 2533 lines)
- `count` -> `$.get(count)` (expression_utils.rs, 4097 lines)
- `count = x` -> `$.set(count, x)` (state_transforms.rs, 2991 lines)
- `$store` -> `$.store_get(store)` (store_transforms.rs, 789 lines)
- Props, reactive, destructure transforms (6,196 lines)
- All followed by `normalize_js_with_oxc` (OXC reparse + formatting, 1,294 lines)

**Problem**: O(M*N) per transform where M=state vars, N=script length. Multiple passes.

### 2. JSON-based Analysis Walker (7.04% CPU)
`walk_js_node` in `script.rs` walks the script AST as `serde_json::Value`, doing string-based type dispatch:
```rust
match node.get("type").and_then(|t| t.as_str()) {
    Some("VariableDeclarator") => variable_declarator::visit(node, context),
    ...
}
```

### 3. Parser Double Conversion (12.01% CPU)
Parser chain: OXC AST -> serde_json::Value -> JsNode::from_value(). Most statement types
still create `Value::Object(Map)` then convert. Only 4 types use direct JsNode (as of 737b7da).

### 4. 718 clone() Calls in Phase 3 Client Transform
AST nodes are cloned extensively. `CompactString`, `Vec<JsExpr>`, `JsNode` clones.

### 5. 143 Box<T> Fields in AST Definitions
Every `Box<JsNode>` is an individual heap allocation. 92 in JsNode, 51 in JsExpr.

---

## Architecture Changes Required (in priority order)

### Change 1: Eliminate Text Transform Pipeline (est. 5-10x on Transform phase)
**Impact: Highest. Transform is 60% of compile time.**

The official Svelte compiler does NOT do text-based transforms. It walks the JS AST
with visitors (VariableDeclaration, AssignmentExpression, UpdateExpression, etc.) and
applies transforms at the AST level. Our code should do the same.

**Current flow (SLOW)**:
```
script text -> text transforms (19,606 lines of string ops) -> normalize_js_with_oxc -> JsProgram AST -> codegen
```

**Target flow (FAST)**:
```
script text -> OXC parse (1x) -> AST walk with transforms -> JsProgram AST -> codegen
```

**Implementation**:

A prototype AST transform module exists: `src/compiler/phases/3_transform/client/ast_state_transform.rs`
(32 unit tests passing). It does $.get()/.set()/.update() via OXC AST walk.

**BUT**: Direct integration INCREASED compile time because:
1. It adds a SECOND OXC parse (the script is already parsed in Phase 1)
2. The text transform pipeline has many interdependent steps that can't be partially replaced

**Correct approach**: Don't add OXC parse. Instead:
1. In Phase 1, the script is parsed with OXC. The OXC AST has lifetime `'a` tied to the allocator.
2. **Serialize the OXC AST to a flat byte buffer** (like rkyv or a custom format) in Phase 1
3. Deserialize in Phase 3 (zero-copy) and walk for transforms
4. OR: Store the script source text + analysis bindings, and in Phase 3 do ONE OXC parse
   that simultaneously applies ALL transforms (runes + state + store + props) in a single walk

**Key insight**: The transforms are simple pattern matching:
- `IdentifierReference` where name is in state_vars -> wrap with `$.get()`
- `AssignmentExpression` where LHS is state var -> convert to `$.set()`
- `UpdateExpression` where arg is state var -> convert to `$.update()`
- `CallExpression` where callee name starts with `$` -> rune transform

One AST walk can do ALL of these. The 19,606 lines of text transforms become ~500 lines of visitor.

**Test files**: 56% of test files have complex scripts (with $ or export). These are the
files that benefit most from this change.

### Change 2: Arena Allocation with bumpalo (est. 2-3x)
**Impact: High. Eliminates ~143 Box<> heap allocations per AST.**

`bumpalo` is already in Cargo.toml but unused. OXC uses this pattern extensively.

**Current**: Each `Box<JsNode>`, `Box<JsExpr>`, `Vec<JsNode>` is a separate heap allocation.
**Target**: All AST nodes allocated from a single arena. Deallocation is free (drop the arena).

**Implementation**:
1. Add `'a` lifetime to JsNode: `JsNode<'a>` with `Box<'a, JsNode<'a>>` from bumpalo
2. Thread the allocator through parser and transform
3. Replace `Vec<JsNode>` with `bumpalo::collections::Vec<'a, JsNode<'a>>`
4. This is a large refactor (touches every file that uses AST types)

**Alternative (easier)**: Use index-based arena (no lifetime propagation):
```rust
struct Arena { nodes: Vec<JsNode> }
type NodeId = u32;
```
Replace `Box<JsNode>` with `NodeId`. Much simpler to implement.

### Change 3: Direct Buffer Codegen (est. 2-3x)
**Impact: Medium. Eliminates JsProgram intermediate AST.**

**Current flow**:
```
Transform visitors build JsExpr/JsStatement/JsProgram -> codegen serializes to String
```

**Target flow**:
```
Transform visitors write directly to String buffer
```

**Implementation**:
```rust
struct CodeWriter { buf: String, indent: u32 }
impl CodeWriter {
    fn write_import(&mut self, specifiers: &[&str], source: &str) { ... }
    fn write_function(&mut self, name: &str, params: &[&str], body: impl FnOnce(&mut Self)) { ... }
    fn write_call(&mut self, callee: &str, args: &[&str]) { ... }
}
```

Visitors call `writer.write_call("$.template_effect", &[...])` instead of building
`b::call(b::member_path("$.template_effect"), vec![...])`.

### Change 4: Eliminate Remaining JSON from Hot Path (est. 1.5x)
**Impact: Medium.**

286 remaining `.as_json()` calls. Most are in:
- Parser: 101 calls (expression.rs) - convert remaining statement types to direct JsNode
- Phase 3 dispatch wrappers: ~48 calls (delegate to JSON-walking helpers)
- Phase 2: 17 calls (deep JSON walkers in mod.rs, scope_builder.rs)
- Legacy: 34 calls (not hot path)

**Implementation**: Continue the approach from this session.

### Change 5: Reduce Cloning (est. 1.5x)
**Impact: Medium. 718 .clone() calls in Phase 3 client.**

Replace clones with references or Rc<T>. Many clones are `CompactString::clone()`
(cheap but adds up) and `Vec<JsExpr>::clone()` (expensive).

---

## Execution Order

### Phase A: Text Transform Elimination (biggest bang)
1. Create `src/compiler/phases/3_transform/client/script_visitor.rs` (~500 lines)
   - Single OXC parse of the instance script
   - Walk AST with a `ScriptTransformVisitor` that applies ALL transforms:
     - Rune transforms ($state -> $.state, $derived -> $.derived(() => ...), etc.)
     - State transforms ($.get, $.set, $.update, $.update_pre)
     - Store transforms ($store -> $.store_get)
     - Prop transforms (export let -> $.prop)
   - Output: transformed script text (using offset-based replacements)
2. Replace `transform_instance_script_for_visitors` with the new visitor
3. Delete 19,606 lines of text transform code
4. Delete `normalize_js_with_oxc` (no longer needed - OXC codegen outputs clean JS)

### Phase B: Index-based Arena
1. Add `Arena` struct with `Vec<JsNode>` and `NodeId = u32`
2. Replace `Box<JsNode>` with `NodeId` in JsNode enum (92 places)
3. Replace `Box<JsExpr>` with index in JsExpr (51 places)
4. Thread `&mut Arena` through transform visitors

### Phase C: Direct Codegen
1. Create `CodeWriter` struct
2. For each visitor, add a `write()` method that writes to buffer
3. Replace JsProgram construction with direct writes
4. Keep JsProgram as fallback for complex cases

### Phase D: Remaining JSON + Cloning
1. Convert remaining parser statement types to direct JsNode
2. Replace JSON-walking helpers with JsNode pattern matching
3. Audit and reduce cloning

---

## Key Files

| File | Lines | Role | Change Needed |
|------|-------|------|--------------|
| `3_transform/client/mod.rs` | 4,848 | Transform orchestration | Replace text pipeline |
| `3_transform/client/expression_utils.rs` | 4,097 | Char-by-char scanning | DELETE |
| `3_transform/client/state_transforms.rs` | 2,991 | $.get/.set/.update | DELETE |
| `3_transform/client/rune_transforms.rs` | 2,533 | $state/$derived | DELETE |
| `3_transform/client/props_transforms.rs` | 2,966 | Export let -> $.prop | DELETE |
| `3_transform/client/formatting.rs` | 1,294 | OXC reparse | DELETE |
| `3_transform/client/ast_state_transform.rs` | 600 | AST prototype | Expand |
| `3_transform/client/visitors/*.rs` | 38,552 | Template visitors | Keep |
| `3_transform/js_ast/nodes.rs` | 866 | JsExpr/JsStatement | Arena-ize |
| `3_transform/js_ast/codegen.rs` | ~2,000 | Serialize to JS | Replace with CodeWriter |
| `ast/typed_expr.rs` | 3,500 | JsNode enum | Arena-ize |
| `1_parse/read/expression.rs` | ~9,000 | OXC->JSON->JsNode | Direct JsNode |

## Verification

After each change:
```bash
# Unit tests
cargo test --release

# Runtime tests (MUST run in Docker)
docker exec svelte-compiler-rust-dev cargo test --release --test runtime

# Benchmark
./scripts/bench.sh --quick

# Profile
./scripts/bench.sh --profile
cargo flamegraph --bin profiler -- --file svelte/packages/svelte/tests/runtime-runes/samples/form-default-value-spread/main.svelte --iterations 200 --warmup 20

# Parse flamegraph
python3 -c "
import re
with open('flamegraph.svg') as f:
    content = f.read()
matches = re.findall(r'<title>([^<]+) \((\d+) samples?, ([\d.]+)%\)</title>', content)
for name, samples, pct in sorted(matches, key=lambda x: float(x[2]), reverse=True)[:20]:
    if float(pct) >= 2.0:
        short = name.split('::')[-1]
        print(f'{pct:>6}%  {samples:>4}  {short}')
"
```

## Critical Lessons from This Session

1. **flamegraph profiling is essential** - `cargo flamegraph` found the real bottlenecks (replace_with_word_boundary_scoped at 43.79%, transform_state_assignments at 66.88%)
2. **OXC codegen is fast** - Thread-local allocator makes OXC parse+codegen only 0.7% of total time
3. **Adding a 2nd OXC parse HURTS** - AST transform integration increased compile time because it added a parse on top of text transforms. Must REPLACE, not ADD.
4. **JsNode::Raw fallback is critical** - ArrowFunctionExpression bodies store child nodes as JsNode::Raw(Value). All pattern matching must handle Raw with JSON fallback.
5. **Test in Docker** - `docker exec svelte-compiler-rust-dev cargo test --release --test runtime`
6. **Benchmark is noisy** - Run 3 times, look at Rust absolute ms not the ratio (JS varies too)
7. **Small files dominate** - Median test file is 154 bytes. Fixed per-file overhead matters more than per-byte efficiency.
