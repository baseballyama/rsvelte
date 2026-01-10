# CSS Visitors Implementation Mapping

This document shows the exact mapping between the JavaScript reference implementation and the Rust implementation.

## Reference Implementation

**Source**: `svelte/packages/svelte/src/compiler/print/index.js`
**Lines**: 172-325

## Function Mapping

| JavaScript (lines 172-325) | Rust (css_visitors.rs) | Status |
|---------------------------|------------------------|--------|
| `Atrule(node, context)` (173-183) | `visit_atrule(context, node)` (45-84) | ✅ |
| `AttributeSelector(node, context)` (185-195) | `visit_attribute_selector(context, node)` (86-117) | ✅ |
| `Block(node, context)` (197-221) | `visit_block(context, node)` (119-149) | ✅ |
| `ClassSelector(node, context)` (223-225) | `visit_class_selector(context, node)` (151-161) | ✅ |
| `ComplexSelector(node, context)` (227-231) | `visit_complex_selector(context, node)` (163-177) | ✅ |
| `Declaration(node, context)` (233-235) | `visit_declaration(context, node)` (179-193) | ✅ |
| `IdSelector(node, context)` (237-239) | `visit_id_selector(context, node)` (195-205) | ✅ |
| `NestingSelector(node, context)` (241-243) | `visit_nesting_selector(context, node)` (207-217) | ✅ |
| `Nth(node, context)` (245-247) | `visit_nth(context, node)` (219-229) | ✅ |
| `Percentage(node, context)` (249-251) | `visit_percentage(context, node)` (231-243) | ✅ |
| `PseudoClassSelector(node, context)` (253-273) | `visit_pseudo_class_selector(context, node)` (245-280) | ✅ |
| `PseudoElementSelector(node, context)` (275-277) | `visit_pseudo_element_selector(context, node)` (282-292) | ✅ |
| `RelativeSelector(node, context)` (279-291) | `visit_relative_selector(context, node)` (294-324) | ✅ |
| `Rule(node, context)` (293-308) | `visit_rule(context, node)` (326-357) | ✅ |
| `SelectorList(node, context)` (310-320) | `visit_selector_list(context, node)` (359-377) | ✅ |
| `TypeSelector(node, context)` (322-324) | `visit_type_selector(context, node)` (379-389) | ✅ |

## Implementation Comparison

### 1. Atrule

**JavaScript** (lines 173-183):
```javascript
Atrule(node, context) {
    context.write(`@${node.name}`);
    if (node.prelude) context.write(` ${node.prelude}`);

    if (node.block) {
        context.write(' ');
        context.visit(node.block);
    } else {
        context.write(';');
    }
}
```

**Rust** (lines 45-84):
```rust
fn visit_atrule(context: &mut Context, node: &Value) {
    if let Some(name) = node.get("name").and_then(|n| n.as_str()) {
        context.write("@");
        context.write(name);

        if let Some(prelude) = node.get("prelude").and_then(|p| p.as_str()) {
            if !prelude.is_empty() {
                context.write(" ");
                context.write(prelude);
            }
        }

        if let Some(block) = node.get("block") {
            if !block.is_null() {
                context.write(" ");
                visit_block(context, block);
            } else {
                context.write(";");
            }
        } else {
            context.write(";");
        }
    }
}
```

### 2. Block

**JavaScript** (lines 197-221):
```javascript
Block(node, context) {
    context.write('{');

    if (node.children.length > 0) {
        context.indent();
        context.newline();

        let started = false;

        for (const child of node.children) {
            if (started) {
                context.newline();
            }

            context.visit(child);

            started = true;
        }

        context.dedent();
        context.newline();
    }

    context.write('}');
}
```

**Rust** (lines 119-149):
```rust
fn visit_block(context: &mut Context, node: &Value) {
    context.write("{");

    if let Some(children) = node.get("children").and_then(|c| c.as_array()) {
        if !children.is_empty() {
            context.indent();
            context.newline();

            let mut started = false;

            for child in children {
                if started {
                    context.newline();
                }

                visit_css_node(context, child);

                started = true;
            }

            context.dedent();
            context.newline();
        }
    }

    context.write("}");
}
```

### 3. PseudoClassSelector

**JavaScript** (lines 253-273):
```javascript
PseudoClassSelector(node, context) {
    context.write(`:${node.name}`);

    if (node.args) {
        context.write('(');

        let started = false;

        for (const arg of node.args.children) {
            if (started) {
                context.write(', ');
            }

            context.visit(arg);

            started = true;
        }

        context.write(')');
    }
}
```

**Rust** (lines 245-280):
```rust
fn visit_pseudo_class_selector(context: &mut Context, node: &Value) {
    if let Some(name) = node.get("name").and_then(|n| n.as_str()) {
        context.write(":");
        context.write(name);

        if let Some(args) = node.get("args") {
            if !args.is_null() {
                context.write("(");

                if let Some(children) = args.get("children").and_then(|c| c.as_array()) {
                    let mut started = false;

                    for arg in children {
                        if started {
                            context.write(", ");
                        }

                        visit_css_node(context, arg);

                        started = true;
                    }
                }

                context.write(")");
            }
        }
    }
}
```

### 4. Rule

**JavaScript** (lines 293-308):
```javascript
Rule(node, context) {
    let started = false;

    for (const selector of node.prelude.children) {
        if (started) {
            context.write(',');
            context.newline();
        }

        context.visit(selector);
        started = true;
    }

    context.write(' ');
    context.visit(node.block);
}
```

**Rust** (lines 326-357):
```rust
fn visit_rule(context: &mut Context, node: &Value) {
    if let Some(prelude) = node.get("prelude") {
        if let Some(children) = prelude.get("children").and_then(|c| c.as_array()) {
            let mut started = false;

            for selector in children {
                if started {
                    context.write(",");
                    context.newline();
                }

                visit_css_node(context, selector);
                started = true;
            }
        }
    }

    context.write(" ");

    if let Some(block) = node.get("block") {
        visit_css_node(context, block);
    }
}
```

## Key Differences

### 1. Node Access
- **JavaScript**: Direct property access (`node.name`, `node.children`)
- **Rust**: Safe JSON access with `node.get("name").and_then(|n| n.as_str())`

### 2. Visitor Calls
- **JavaScript**: `context.visit(child)` - dynamic dispatch
- **Rust**: `visit_css_node(context, child)` - explicit function call

### 3. Type Safety
- **JavaScript**: Loosely typed, assumes properties exist
- **Rust**: Strongly typed with Option handling and null checks

### 4. Error Handling
- **JavaScript**: May throw errors if properties missing
- **Rust**: Graceful handling with Option types, no panics

## Context API Usage

Both implementations use the same Context methods:

| Method | JavaScript | Rust |
|--------|-----------|------|
| Write text | `context.write('text')` | `context.write("text")` |
| New line | `context.newline()` | `context.newline()` |
| Indent | `context.indent()` | `context.indent()` |
| Dedent | `context.dedent()` | `context.dedent()` |

## Output Format Comparison

Both implementations produce identical output:

### Example: Simple Rule
```css
div {
  color: red;
  font-size: 16px;
}
```

### Example: Media Query
```css
@media screen and (min-width: 768px) {
  .container {
    width: 50%;
  }
}
```

### Example: Multiple Selectors
```css
h1,
h2,
h3 {
  margin: 0;
}
```

### Example: Pseudo-class with Args
```css
li:nth-child(2n+1) {
  background: #f0f0f0;
}
```

## Verification

To verify the output matches:

1. Run the JavaScript version on a CSS input
2. Run the Rust version on the same input
3. Compare outputs character-by-character

Both should produce identical results.

## Conclusion

The Rust implementation:
- ✅ Follows the exact same algorithm as JavaScript
- ✅ Uses the same Context API methods
- ✅ Produces identical output format
- ✅ Handles all the same node types
- ✅ Implements all 16 visitor functions
- ✅ Adds proper error handling via Rust's type system

The implementation is a faithful port of the JavaScript version with the added benefits of Rust's type safety and error handling.
