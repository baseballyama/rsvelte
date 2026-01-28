# Svelte Compiler Rust - Progress Report

## Current Test Status (2026-01-28)

### Runtime-Runes Tests
| Metric | Count | Percentage |
|--------|-------|------------|
| Total Passed | 179/737 | 24.3% |
| Client Passed | 205/737 | 27.8% |
| Server Passed | 440/737 | 59.7% |
| Skipped | 14 | - |

### Recent Improvements

#### Session 2026-01-28 (Continued)

7. **Added missing expression types to convert_expression** (Total: 177→179)
   - Added `NewExpression` handling - `new FormData(e.target)` now correctly parsed
   - Added `ThisExpression`, `Super`, `FunctionExpression`, `ClassExpression`
   - Added `ImportExpression`, `AwaitExpression`, `YieldExpression`
   - Added `ChainExpression` with full inner element support
   - Added `PrivateFieldExpression`, `TaggedTemplateExpression`
   - Added `MetaProperty`, `RegExpLiteral`
   - Fixed "unknown" fallback issue in event handler arrow function bodies

8. **Fixed store assignment transformation panic**
   - Added check for overlapping matches to prevent `begin <= end` panic
   - Fixed handling of multiple `$store` assignments in same line

#### Earlier in Session 2026-01-28
1. **Fixed ReturnStatement handling in AST conversion** (Server: 421→422)
   - `convert_statement_for_program` was missing ReturnStatement
   - Function bodies containing return statements now properly converted

2. **Added $state.snapshot and $inspect transformations** (Client: 189→196)
   - Client: `$state.snapshot()` → `$.snapshot()`
   - Client: `$inspect()` → removed in non-dev mode, `$.inspect()` in dev mode
   - Server: `$state.snapshot()` → `$.snapshot()`

3. **Added TaggedTemplateExpression and ChainExpression support**
   - New JsTaggedTemplate struct for tagged template expressions
   - Proper code generation for tagged templates
   - ChainExpression handling for optional chaining

4. **Fixed PrivateIdentifier parsing in class fields** (Server: 422→432)
   - Parser now correctly generates PrivateIdentifier AST nodes
   - Fixed duplicate_class_field validation for classes with private fields
   - Classes with `#count = $state(0)` and getter/setter for `count` now compile

5. **Added store subscription assignment transformation** (Total: 175→177)
   - Server: `$count += 1` → `$.store_set(count, $.store_get($$store_subs ??= {}, '$count', count) + 1)`
   - Client: `$count += 1` → `$.store_set(count, $count() + 1)`
   - Handles all compound operators (+=, -=, *=, etc.) and increment/decrement (++, --)

6. **Added statement types to AST conversion**
   - ForStatement, ForOfStatement, ForInStatement
   - WhileStatement, TryStatement, ThrowStatement
   - BreakStatement, ContinueStatement
   - SwitchStatement, DoWhileStatement, LabeledStatement
   - EmptyStatement, DebuggerStatement

### Known Issues / Next Steps

1. **$derived destructuring** - Not properly expanded into individual derived signals
   - Currently generates: `let { foo, bar } = $.derived(() => stuff)`
   - Should generate: `let foo = $.derived(() => stuff.foo), bar = $.derived(() => stuff.bar)`

2. **Missing $.push/$.pop generation** in some cases

3. **Missing $.delegate for events**

4. **Module-level snippet export ordering** - `export { foo }` placed before snippet declaration

### Test Categories Status
| Category | Status |
|----------|--------|
| Parser Modern | ✅ 100% |
| Parser Legacy | ✅ 100% |
| CSS | ⚠️ 62% |
| Runtime Runes | 🔄 24.3% |
| Runtime Legacy | ❌ Low |
| SSR | 🔄 12.5% |
| Hydration | ❌ 5.7% |
