# CSS Visitors Implementation

This document describes the CSS visitor implementation for the Svelte compiler's print functionality.

## Overview

The CSS visitors module (`css_visitors.rs`) implements functions to convert CSS AST nodes back into CSS source code. This is part of the print module that converts a complete Svelte AST back to source code.

## Reference Implementation

The implementation follows the official Svelte compiler:
- `svelte/packages/svelte/src/compiler/print/index.js` (lines 172-325)

## Implemented Visitors

All 16 CSS visitor functions have been implemented:

### Selectors

1. **TypeSelector** - Element selectors (e.g., `div`, `p`)
2. **ClassSelector** - Class selectors (e.g., `.my-class`)
3. **IdSelector** - ID selectors (e.g., `#my-id`)
4. **AttributeSelector** - Attribute selectors (e.g., `[type="text"]`)
5. **PseudoClassSelector** - Pseudo-classes (e.g., `:hover`, `:is()`)
6. **PseudoElementSelector** - Pseudo-elements (e.g., `::before`)
7. **NestingSelector** - Nesting selector (`&`)

### Selector Combinators

8. **ComplexSelector** - Compound selectors (e.g., `a b c`)
9. **RelativeSelector** - Relative selectors with combinators (e.g., `> b`, `+ c`)
10. **SelectorList** - Comma-separated selectors (e.g., `a, b, c`)

### Values

11. **Nth** - nth expressions (e.g., `2n+1`)
12. **Percentage** - Percentage values (e.g., `50%`)

### Blocks and Rules

13. **Block** - CSS blocks with declarations (`{ property: value; }`)
14. **Declaration** - CSS property declarations (`color: red;`)
15. **Rule** - Complete CSS rules (selector + block)
16. **Atrule** - At-rules (e.g., `@media`, `@keyframes`)

## Usage

The CSS visitors are integrated into the main print flow:

```rust
use svelte_compiler_rust::{parse, ParseOptions};
use svelte_compiler_rust::compiler::print::print;

let source = r#"
<div>Hello</div>
<style>
  div { color: blue; }
</style>
"#;

let ast = parse(source, ParseOptions { modern: true, ..Default::default() })?;
let result = print(&ast, None)?;
println!("{}", result.code);
```

## Format Examples

### Simple Rule
```css
div {
  color: red;
  font-size: 16px;
}
```

### Multiple Selectors
```css
h1,
h2,
h3 {
  margin: 0;
}
```

### Media Query
```css
@media screen and (min-width: 768px) {
  div {
    width: 50%;
  }
}
```

### Complex Selectors
```css
div > p:hover {
  background: blue;
}
```

### Attribute Selectors
```css
input[type="text"] {
  border: 1px solid gray;
}

a[href^="https"] {
  color: green;
}
```

### Pseudo-class with Arguments
```css
li:nth-child(2n+1) {
  background: #f0f0f0;
}

div:is(.warning, .error) {
  color: red;
}
```

## Implementation Details

### Data Structure

CSS nodes are represented as `serde_json::Value` objects (JSON) because:
1. The CSS parser produces JSON nodes to avoid coupling with a specific CSS AST
2. This allows flexibility in the CSS parsing strategy
3. The parser can use different CSS parsing libraries without affecting the printer

### Formatting Rules

- **Indentation**: 2 spaces per level
- **Line breaks**: After each declaration in a block
- **Selector separators**: Comma + newline for multiple selectors
- **Combinator spacing**: Space before and after combinators (except descendant)
- **Empty blocks**: `{}` on same line if empty

### Context Methods Used

- `write()` - Write text to output
- `newline()` - Add a newline
- `indent()` - Increase indentation level
- `dedent()` - Decrease indentation level

## Testing

Tests are provided in:
- `css_visitors.rs` - Unit tests for individual visitors
- `css_test.rs` - Integration tests with full parsing

Run tests:
```bash
cargo test --lib compiler::print::css_visitors
cargo test --lib compiler::print::css_test
```

## Future Enhancements

Potential improvements:
1. Source map generation for CSS nodes
2. CSS minification option
3. Configurable formatting options (indentation, line breaks)
4. Preserve CSS comments
5. Support for CSS custom properties (variables)

## Related Files

- `src/compiler/print/css_visitors.rs` - CSS visitor implementations
- `src/compiler/print/visitors.rs` - Main template visitors
- `src/compiler/print/context.rs` - Output context
- `src/compiler/phases/1_parse/read/style.rs` - CSS parser
- `src/ast/css.rs` - CSS AST types
