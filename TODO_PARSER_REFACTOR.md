# Parser Directory Structure Refactoring Plan

## Goal

Align `src/compiler/phases/1_parse/` directory structure with the official Svelte compiler (`svelte/packages/svelte/src/compiler/phases/1-parse/`).

## Current vs Target Structure

### Current (Rust)
```
1_parse/
├── mod.rs            # parse(), ParseOptions
├── state.rs          # ALL parsing logic (3616 lines!)
├── css.rs            # CSS parsing
├── expression.rs     # Expression parsing
├── legacy.rs         # Legacy AST conversion
└── lexer.rs          # Tokenization utilities
```

### Target (Aligned with Svelte)
```
1_parse/
├── mod.rs              # Public API: parse(), ParseOptions (like index.js)
├── parser.rs           # Parser struct + helper methods
├── css.rs              # CSS parsing (keep as-is)
├── expression.rs       # Expression parsing (keep as-is, like read/expression.js)
├── legacy.rs           # Legacy AST conversion (Rust-specific, keep as-is)
├── lexer.rs            # Tokenization utilities (keep as-is)
├── read/               # NEW: Reading specific constructs
│   ├── mod.rs
│   ├── script.rs       # parse_script_tag()
│   ├── style.rs        # parse_style_tag()
│   └── options.rs      # parse_svelte_options()
├── state/              # NEW: Parser state machines
│   ├── mod.rs
│   ├── element.rs      # Element parsing, attributes, directives
│   ├── fragment.rs     # parse_fragment(), parse_node() dispatcher
│   ├── tag.rs          # Mustache tags, blocks (if/each/await/key/snippet)
│   └── text.rs         # Text node parsing
└── utils/              # NEW: Utility functions
    ├── mod.rs
    └── html.rs         # is_void_element(), closing_tag_omitted(), etc.
```

## Mapping: state.rs Functions to New Files

### state/fragment.rs (~50 lines)
- `parse()` (entry point, calls parse_fragment)
- `parse_fragment()`
- `parse_node()` (dispatcher)
- `remaining_is_whitespace_only()`

### state/element.rs (~1200 lines)
- `parse_element_or_comment()`
- `parse_attributes()`
- `parse_attribute()`
- `parse_on_directive()`
- `parse_bind_directive()`
- `parse_use_directive()`
- `parse_class_directive()`
- `parse_style_directive()`
- `parse_transition_directive()`
- `parse_animate_directive()`
- `parse_let_directive()`
- `parse_attach_attribute()`
- `parse_attribute_value()`
- `extract_this_attribute()`
- `get_element_type()`
- `is_inside_svelte_head()`
- `is_valid_closing_tag()`
- `should_implicitly_close()`
- `is_inside_shadowroot_template()`
- `has_shadowrootmode_attr()`
- `create_name_loc()`
- `extract_name_and_modifiers()`
- `merge_attribute_parts_to_text()`
- `parse_raw_text_content()`

### state/tag.rs (~700 lines)
- `parse_mustache()`
- `parse_block_open()`
- `parse_if_block()`
- `parse_if_alternate()`
- `parse_each_block()`
- `parse_binding_pattern()`
- `parse_await_block()`
- `parse_key_block()`
- `parse_snippet_block()`
- `parse_special_tag()` (@html, @debug, @const, @render)
- `parse_js_expression()`

### state/text.rs (~40 lines)
- `parse_text()`

### read/script.rs (~120 lines)
- `parse_script_tag()`

### read/style.rs (~80 lines)
- `parse_style_tag()`

### read/options.rs (~80 lines)
- `parse_svelte_options()`

### parser.rs (~200 lines)
- `Parser` struct definition
- `Parser::new()`
- `get_location()`
- `get_location_range()`
- Basic helpers: `is_eof()`, `current_char()`, `advance()`, `advance_by()`
- `match_str()`, `eat()`, `expect()`
- `skip_whitespace()`
- `read_identifier()`, `read_tag_name()`, `read_attribute_name()`
- `peek_chars()`
- `StackEntry` enum
- `ElementType` enum

### utils/html.rs (~40 lines)
- `is_void_element()`
- (Future: `closing_tag_omitted()` if needed)

## TODO List

### Phase 1: Create Directory Structure
- [ ] Create `src/compiler/phases/1_parse/state/` directory
- [ ] Create `src/compiler/phases/1_parse/read/` directory
- [ ] Create `src/compiler/phases/1_parse/utils/` directory

### Phase 2: Extract Parser Core (parser.rs)
- [ ] Create `parser.rs` with Parser struct and basic helpers
- [ ] Move `Parser` struct, `StackEntry`, `ElementType` from state.rs
- [ ] Move basic helper methods (is_eof, current_char, advance, etc.)
- [ ] Move location calculation methods
- [ ] Update mod.rs to export from parser.rs

### Phase 3: Create state/ Directory
- [ ] Create `state/mod.rs` with module declarations
- [ ] Create `state/fragment.rs` with parse_fragment, parse_node
- [ ] Create `state/text.rs` with parse_text
- [ ] Create `state/tag.rs` with mustache/block parsing
- [ ] Create `state/element.rs` with element/attribute/directive parsing

### Phase 4: Create read/ Directory
- [ ] Create `read/mod.rs` with module declarations
- [ ] Create `read/script.rs` with parse_script_tag
- [ ] Create `read/style.rs` with parse_style_tag
- [ ] Create `read/options.rs` with parse_svelte_options

### Phase 5: Create utils/ Directory
- [ ] Create `utils/mod.rs` with module declarations
- [ ] Create `utils/html.rs` with is_void_element and related functions

### Phase 6: Update Imports and Clean Up
- [ ] Update mod.rs to include new modules
- [ ] Remove old state.rs (should be empty after extraction)
- [ ] Run `cargo fmt`
- [ ] Run `cargo clippy --all-targets --all-features -- -D warnings`
- [ ] Run `cargo test` to verify all tests pass

### Phase 7: Documentation
- [ ] Update AGENTS.md with new directory structure
- [ ] Add doc comments to new modules

## Notes

### Why Not 1:1 Mapping with Svelte?
1. `acorn.js` - Not needed, we use OXC for JS parsing
2. `remove_typescript_nodes.js` - OXC handles this internally
3. `legacy.rs` - Rust-specific for Svelte 4 compatibility
4. `read/context.js` - Merged into expression.rs (pattern parsing)

### Performance Considerations
- No performance impact from file splitting (Rust inlines across module boundaries)
- May improve incremental compilation times
- Maintains same memory layout and data structures

### Testing Strategy
- All existing tests must pass after each phase
- Run benchmarks before/after to verify no performance regression
