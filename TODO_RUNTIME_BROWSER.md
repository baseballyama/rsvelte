# TODO: runtime-browser Tests

This document tracks the work needed to pass all 30 runtime-browser tests.

## Current Status

- **Passing**: 0/30 (0%)
- **Failing**: 30/30 (100%)
- **Root Cause**: Client-side code generation is incomplete. The generated JS is missing most runtime logic.

## Analysis Summary

### Expected vs Actual Output Comparison

**Expected** (binding-width-height-initialize/client.js):
```js
export default function Main($$anchor, $$props) {
  $.push($$props, false);
  let offsetHeight = $.prop($$props, 'offsetHeight', 12);
  let offsetWidth = $.prop($$props, 'offsetWidth', 12);
  let toggle = $.prop($$props, 'toggle', 12, false);
  $.legacy_pre_effect(() => ($.deep_read_state(offsetWidth())), () => {
    if (offsetWidth()) { toggle(true); }
  });
  $.legacy_pre_effect_reset();
  var div = root();
  let classes;
  var div_1 = $.child(div);
  var text = $.child(div_1, true);
  $.reset(div_1);
  $.reset(div);
  $.template_effect(() => {
    classes = $.set_class(div, 1, 'svelte-70s021', null, classes, { toggle: toggle() });
    $.set_text(text, offsetHeight());
  });
  $.bind_element_size(div_1, 'offsetHeight', offsetHeight);
  $.bind_element_size(div_1, 'offsetWidth', offsetWidth);
  $.append($$anchor, div);
  $.pop();
}
```

**Actual** (current output):
```js
export default function Main($$anchor) {
  export let offsetHeight;
  export let offsetWidth;
  export let toggle = false;
  $: if (offsetWidth) { toggle = true; }
  var div = root();
  var div_1 = $.first_child(div);
  div_1.textContent = offsetHeight;
  $.append($$anchor, div);
}
```

## Required Features (Priority Order)

### Phase 1: Core Component Structure (Critical)

These are blocking issues - without them, no tests can pass.

- [ ] **1.1 Function signature**: Add `$$props` parameter
  - Current: `function Main($$anchor)`
  - Expected: `function Main($$anchor, $$props)`

- [ ] **1.2 Component initialization**: Add `$.push()` and `$.pop()`
  - `$.push($$props, false)` at start
  - `$.pop()` at end
  - `$.init()` for legacy mode without reactive statements

- [ ] **1.3 Script content transformation**: Stop emitting raw script content
  - Current: `export let x = value;` inside function (invalid JS)
  - Expected: Transform to `let x = $.prop($$props, 'x', flags, defaultValue)`

### Phase 2: Props and Reactivity (High Priority)

- [ ] **2.1 `export let` transformation** (Legacy mode)
  - Convert `export let foo = value` to `let foo = $.prop($$props, 'foo', flags, value)`
  - Flags: 8 = writable, 12 = writable + bindable

- [ ] **2.2 `$:` reactive statements** (Legacy mode)
  - Convert `$: statement` to `$.legacy_pre_effect(() => deps, () => statement)`
  - Add `$.legacy_pre_effect_reset()` after all reactive statements
  - Track dependencies with `$.deep_read_state()`

- [ ] **2.3 `$state()` transformation** (Runes mode)
  - Already partially implemented, but needs verification
  - Ensure `$.state()` calls are correct

- [ ] **2.4 `$derived()` transformation** (Runes mode)
  - Convert to `$.derived()` or inline getters

### Phase 3: Template Effects and Bindings (High Priority)

- [ ] **3.1 `$.template_effect()`**
  - Wrap dynamic content updates in `$.template_effect(() => { ... })`
  - Collect all dynamic expressions for batching

- [ ] **3.2 Element bindings**
  - `bind:offsetWidth` / `bind:offsetHeight` -> `$.bind_element_size()`
  - `bind:clientWidth` / `bind:clientHeight` -> `$.bind_element_size()`
  - `bind:this` -> store reference
  - `bind:value` -> `$.bind_value()`
  - `bind:files` -> `$.bind_files()`
  - `bind:muted` / `bind:volume` / `bind:playbackRate` -> media bindings

- [ ] **3.3 Class directive**
  - `class:name={expr}` -> `$.set_class(element, flags, hash, static, classes, { name: expr })`

- [ ] **3.4 Style directive**
  - `style:property={value}` -> `$.set_style(element, '', styles, { 'property': value })`
  - `style:property|important={value}` -> handle important modifier

### Phase 4: Special Elements (Medium Priority)

- [ ] **4.1 `<svelte:head>`**
  - Generate `$.head(hash, ($$anchor) => { ... })`
  - Support dynamic content inside head

- [ ] **4.2 `<svelte:element>`**
  - Dynamic element tags with `this={tag}`
  - Handle custom elements

- [ ] **4.3 `<svelte:component>`**
  - Dynamic component with `this={Component}`
  - CSS custom properties (--var)

### Phase 5: Control Flow Blocks (Medium Priority)

- [ ] **5.1 `{#if}` block** (Client-side)
  - Currently only outputs `<!>` placeholder
  - Need `$.if(anchor, () => condition, ($$anchor) => { ... })`

- [ ] **5.2 `{#each}` block improvements**
  - Already partially implemented
  - Verify key handling and nested content

- [ ] **5.3 `{#key}` block**
  - Currently only outputs `<!>` placeholder
  - Need `$.key(anchor, () => key, ($$anchor) => { ... })`

- [ ] **5.4 `{@html}` tag**
  - Currently partially implemented
  - Verify `$.html()` generation

### Phase 6: Advanced Features (Lower Priority)

- [ ] **6.1 CSS custom properties on components**
  - `<Component --prop={value}>`
  - Wrap in `<div style="display: contents; --prop: value">`

- [ ] **6.2 Slots with bindings**
  - `bind:clientHeight` on slot content

- [ ] **6.3 Event handlers**
  - `on:event={handler}` and `onevent={handler}`
  - Capture events (gotpointercapture, lostpointercapture)

- [ ] **6.4 `$$restProps` / spread attributes**
  - `{...$$restProps}` support

## Test Case Categories

### Group A: Legacy Mode with Props (10 tests)
Tests using `export let` and `$:` reactive statements:
- binding-width-height-initialize
- binding-width-height-this-timing
- component-event-handler-contenteditable-false
- component-slot-binding-dimensions
- inline-style-directive-important
- inline-style-directive-precedence
- inline-style-directive-update-with-spread
- svelte-component-css-custom-properties
- svelte-component-css-custom-properties2
- svelte-self-css-custom-properties2

### Group B: Runes Mode ($state/$derived) (6 tests)
Tests using Svelte 5 runes:
- bind-muted
- bind-playbackrate
- bind-volume
- fine-grained-hydration-clean-attr
- mount-in-iframe
- sole-script-tag

### Group C: CSS Custom Properties (6 tests)
Tests with --prop on components:
- component-css-custom-properties
- component-css-custom-properties-dynamic
- component-css-custom-properties-dynamic-svg
- svelte-component-css-custom-properties-dynamic
- svelte-self-css-custom-properties
- svelte-self-css-custom-properties-dynamic

### Group D: Special Elements (4 tests)
- dynamic-element-custom-element (`<svelte:element>`)
- head-script (`<svelte:head>` with inline script)
- head-scripts (`<svelte:head>` with {#each})
- css-props-dynamic-component (dynamic component)

### Group E: Other Features (4 tests)
- binding-files (file input binding)
- browser-events-ending-with-capture (special event types)
- html-tag-script ({@html} with script)
- html-tag-script-2 ({@html} in {#if})

## Implementation Strategy

### Recommended Order

1. **Start with Phase 1** (Core Component Structure)
   - This unblocks all other phases
   - Without proper function signature and initialization, nothing works

2. **Then Phase 2** (Props and Reactivity)
   - Focus on legacy mode first (`export let`, `$:`)
   - This enables Group A tests

3. **Then Phase 3** (Template Effects and Bindings)
   - Start with `$.template_effect()` and `$.set_text()`
   - Then add bindings one by one

4. **Then Phases 4-6** incrementally

### Files to Modify

Primary file: `src/compiler/phases/3_transform/client/mod.rs`

Key functions:
- `transform_client()` - Entry point
- `build()` / `build_with_fragment()` - Code generation
- `generate_*` functions - Node-specific generation

## Progress Tracking

| Phase | Feature | Status | Tests Enabled |
|-------|---------|--------|---------------|
| 1.1 | Function signature | Not Started | 0 |
| 1.2 | $.push/$.pop | Not Started | 0 |
| 1.3 | Script transformation | Not Started | 0 |
| 2.1 | export let | Not Started | 0 |
| 2.2 | $: statements | Not Started | 0 |
| 2.3 | $state | Partial | 0 |
| 2.4 | $derived | Not Started | 0 |
| 3.1 | template_effect | Not Started | 0 |
| 3.2 | Element bindings | Not Started | 0 |
| 3.3 | Class directive | Not Started | 0 |
| 3.4 | Style directive | Not Started | 0 |
| 4.1 | svelte:head | Not Started | 0 |
| 4.2 | svelte:element | Partial | 0 |
| 4.3 | svelte:component | Not Started | 0 |
| 5.1 | {#if} block | Not Started | 0 |
| 5.2 | {#each} block | Partial | 0 |
| 5.3 | {#key} block | Not Started | 0 |
| 5.4 | {@html} | Partial | 0 |
| 6.1 | CSS custom props | Not Started | 0 |
| 6.2 | Slot bindings | Not Started | 0 |
| 6.3 | Event handlers | Partial | 0 |
| 6.4 | $$restProps | Not Started | 0 |

## Notes

- The Svelte official compiler generates cursor-based DOM navigation (`$.child()`, `$.sibling()`, `$.reset()`)
- Current implementation uses `$.first_child()` which is sometimes different
- Template generation (the HTML string) appears mostly correct, but JS logic is wrong
- Need to preserve the exact import structure: `import * as $ from 'svelte/internal/client'`
