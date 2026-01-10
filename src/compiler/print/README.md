# Print Module

The print module converts Svelte AST nodes back into source code. It is designed for tools that parse and transform components using the compiler's modern AST representation.

## Overview

This module implements functionality similar to the official Svelte compiler's `print` function, which is based on the [esrap](https://www.npmjs.com/package/esrap) library's Context API for JavaScript/TypeScript.

## Architecture

The print module consists of three main components:

### 1. Context (`context.rs`)

The `Context` structure manages the output buffer and formatting state. It provides methods for:

- **Writing text**: `write()` - Adds text to the output buffer
- **Managing indentation**: `indent()` / `dedent()` - Controls indentation levels
- **Creating newlines**: `newline()` - Adds line breaks and marks multiline content
- **Measuring output**: `measure()` - Returns the current output length
- **Creating child contexts**: `child()` - Creates isolated formatting contexts
- **Appending contexts**: `append()` - Combines contexts together

The Context automatically handles indentation when writing text at the start of a new line.

### 2. Helpers (`helpers.rs`)

Helper functions and constants used throughout the printing process:

- **`LINE_BREAK_THRESHOLD`**: Constant (50 chars) - determines when to break content across lines
- **`block()`**: Formats content blocks with optional inline formatting
- **`is_void_element()`**: Checks if an HTML element is self-closing
- **`escape_attribute_value()`**: Escapes strings for use in HTML attributes
- **`escape_html()`**: Escapes HTML special characters

Future additions:
- **`format_expression()`**: Format JavaScript expressions using oxc_codegen (TODO)
- **`format_statement()`**: Format JavaScript statements using oxc_codegen (TODO)

### 3. Visitors (`visitors.rs`)

Visitor functions for each AST node type. Each visitor writes the appropriate source code representation:

Implemented visitors:
- **`visit_root()`**: Handles the root node, visiting scripts, template, and CSS
- **`visit_fragment()`**: Processes fragment children
- **`visit_template_node()`**: Dispatches to specific node visitors
- **`visit_text()`**: Prints text nodes
- **`visit_regular_element()`**: Prints HTML elements with attributes and children
- **`visit_component()`**: Prints Svelte components
- **`visit_if_block()`**: Prints {#if} blocks
- **`visit_each_block()`**: Prints {#each} blocks
- **`visit_await_block()`**: Prints {#await} blocks
- **`visit_key_block()`**: Prints {#key} blocks
- **`visit_snippet_block()`**: Prints {#snippet} blocks

## Implementation Status

### ✅ Completed

- Context API with all core methods
- Basic element and text printing
- Attribute handling (normal attributes)
- Comment nodes
- Fragment traversal
- Indentation and multiline detection
- Line break threshold logic

### 🚧 In Progress

- Script block formatting (placeholder content currently)
- CSS formatting (placeholder content currently)
- Expression formatting (placeholder markers currently)

### ⏳ Not Yet Implemented

- **JavaScript/TypeScript Integration**:
  - oxc_codegen integration for formatting expressions
  - Statement formatting
  - Script content formatting

- **Directive Attributes**:
  - bind: directives
  - on: event handlers
  - class: and style: directives
  - transition: and animate: directives
  - use: actions
  - let: slot props

- **Special Elements**:
  - svelte:element
  - svelte:component
  - svelte:window
  - svelte:body
  - svelte:head
  - svelte:options
  - svelte:self
  - svelte:boundary
  - svelte:fragment

- **Advanced Features**:
  - Source map generation
  - Comment preservation
  - Leading/trailing comment handling
  - CSS visitor implementation

## Usage

```rust
use svelte_compiler_rust::compiler::print::print;
use svelte_compiler_rust::{parse, ParseOptions};

let source = "<h1>Hello World</h1>";
let parse_options = ParseOptions {
    modern: true,
    ..Default::default()
};

let ast = parse(source, parse_options).unwrap();
let result = print(&ast, None).unwrap();

println!("{}", result.code);
// Output: <h1>Hello World</h1>
```

## Design Decisions

### 1. Line Breaking

Content is formatted on multiple lines if:
- The measured length exceeds `LINE_BREAK_THRESHOLD` (50 characters)
- The content contains multiline children
- Attributes are too long to fit on one line

### 2. Indentation

- Uses 2 spaces per indentation level (matches Svelte conventions)
- Automatically applied at line starts
- Context tracks indentation level independently

### 3. Child Contexts

The Context uses child contexts for measuring and formatting:
- Measure content length before deciding inline vs multiline
- Format attributes separately to determine layout
- Isolate formatting decisions for nested content

### 4. Attribute Formatting

Attributes are formatted inline unless:
- Total attribute length exceeds `LINE_BREAK_THRESHOLD`
- Then each attribute gets its own line with indentation

## Reference Implementation

This implementation follows the official Svelte compiler:
- `svelte/packages/svelte/src/compiler/print/index.js`
- Based on the [esrap](https://www.npmjs.com/package/esrap) Context API

Key differences from the JS implementation:
- Rust ownership model requires explicit context cloning/appending
- Uses `oxc_codegen` instead of `esrap` for JavaScript formatting
- More explicit type handling for AST variants

## Testing

The module includes tests in:
- `src/compiler/print/context.rs` - Context API tests
- `src/compiler/print/helpers.rs` - Helper function tests
- `src/compiler/print/mod.rs` - Integration tests
- `tests/print_basic.rs` - End-to-end tests

## Future Work

1. **Complete JavaScript Integration**
   - Integrate oxc_codegen for expression/statement formatting
   - Format script block contents properly

2. **Complete Directive Support**
   - Implement all directive attribute visitors
   - Handle directive shorthand syntax

3. **Source Map Generation**
   - Track source positions during printing
   - Generate sourcemap JSON output
   - Use the `sourcemap` crate

4. **CSS Visitor**
   - Implement CSS node visitors
   - Format CSS rules and selectors
   - Preserve CSS structure

5. **Special Element Support**
   - Complete all svelte: element visitors
   - Handle dynamic elements properly

6. **Comment Preservation**
   - Implement leading/trailing comment tracking
   - Preserve comment positions from original source
   - Use PrintOptions callbacks for comment handling

## Performance Considerations

- Child contexts are created frequently - ensure minimal allocation overhead
- String concatenation uses Rust's `String` which amortizes allocations
- Line break threshold prevents excessive measurement overhead
- Indentation is applied lazily (only when writing at line start)

## Contributing

When adding new visitors:

1. Follow the pattern of existing visitors
2. Use child contexts for measurement
3. Respect `LINE_BREAK_THRESHOLD` for formatting decisions
4. Add tests for the new visitor
5. Update this README with implementation status
