# Test Compatibility Progress

## Current Status (2026-01-28)

### Runtime Runes Tests
- **Server**: ~394/710 (55.5%) with improved normalization
- **Client**: 189/737 (25.6%)
- **Total**: 165/737 (22.4%)

Note: Server count varies based on normalization stringency.

## Session Work Log

### Completed Fixes
1. ✅ Property name quoting for hyphenated attributes (`data-count` → `'data-count'`)
2. ✅ Spread props with component bindings (`$.spread_props([...])`)
3. ✅ Await block whitespace trimming
4. ✅ $derived.by() class field support
5. ✅ $state() class field transformation (`0 = $state();` → `0;`)

### Remaining Issues by Category
| Category | Count | Description |
|----------|-------|-------------|
| unknown | ~250 | Various differences needing investigation |
| missing_props_param | 32 | Missing $$props and wrapper for some $state uses |
| missing_select | 10 | Missing $$renderer.select() for select elements |
| await_signature_diff | 7 | $.await() formatting differences |
| missing_derived | 7 | Constructor-based $derived transformation |
| push_vs_code | 4 | Output type differences |
| function_signature | 3 | Wrapper not needed in some cases |
| missing_svelte_head | 3 | Missing $.head() for svelte:head |

### Key Missing Features
1. **$$renderer.select()** - Special handling for `<select>` elements with value binding
2. **$.head()** - Support for `<svelte:head>` elements
3. **Constructor $derived** - `this.property = $derived(...)` in class constructors
4. **Wrapper detection** - Better logic for when $$renderer.component() is needed

## Next Steps
- [ ] Implement $$renderer.select() for select elements
- [ ] Implement $.head() for svelte:head
- [ ] Improve constructor $derived transformation
- [ ] Refine $$renderer.component() wrapper logic
