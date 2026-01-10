//! Server-side visitors for template transformation.
//!
//! This module contains visitor implementations for each AST node type.
//! Each visitor is responsible for generating server-side JavaScript code
//! for its specific node type.
//!
//! # Architecture
//!
//! The visitor pattern matches the official Svelte compiler structure at
//! `svelte/packages/svelte/src/compiler/phases/3-transform/server/visitors/`.
//!
//! Each visitor:
//! - Takes an AST node and a context reference
//! - Returns OutputPart(s) representing the generated code
//! - May recursively visit child nodes
//!
//! # Visitor List
//!
//! The following visitors are planned (matching Svelte's structure):
//!
//! ## Template Nodes
//! - `fragment.rs` - Fragment visitor
//! - `regular_element.rs` - RegularElement visitor
//! - `component.rs` - Component visitor
//! - `svelte_element.rs` - SvelteElement (dynamic element) visitor
//! - `slot_element.rs` - SlotElement visitor
//! - `title_element.rs` - TitleElement visitor
//!
//! ## Expression/Tags
//! - `html_tag.rs` - HtmlTag visitor ({@html})
//! - `render_tag.rs` - RenderTag visitor ({@render})
//! - `const_tag.rs` - ConstTag visitor ({@const})
//! - `debug_tag.rs` - DebugTag visitor ({@debug})
//!
//! ## Blocks
//! - `if_block.rs` - IfBlock visitor ({#if})
//! - `each_block.rs` - EachBlock visitor ({#each})
//! - `await_block.rs` - AwaitBlock visitor ({#await})
//! - `key_block.rs` - KeyBlock visitor ({#key})
//! - `snippet_block.rs` - SnippetBlock visitor ({#snippet})
//!
//! ## Special Svelte Elements
//! - `svelte_component.rs` - svelte:component visitor
//! - `svelte_self.rs` - svelte:self visitor
//! - `svelte_fragment.rs` - svelte:fragment visitor
//! - `svelte_head.rs` - svelte:head visitor
//! - `svelte_boundary.rs` - svelte:boundary visitor
//!
//! # Current Status
//!
//! Visitors are currently implemented inline in `../transform_server.rs` as methods
//! on `ServerCodeGenerator`. This module provides the infrastructure for
//! gradual extraction into separate files.
//!
//! To extract a visitor:
//! 1. Create a new file (e.g., `html_tag.rs`)
//! 2. Define the visitor function
//! 3. Add the module declaration here
//! 4. Update the call site in transform_server.rs

pub mod shared;

// Visitor modules will be added here as they are extracted.
// Example:
// pub mod fragment;
// pub mod regular_element;
// pub mod component;
// pub mod html_tag;
// pub mod render_tag;
// pub mod if_block;
// pub mod each_block;
// pub mod await_block;
// pub mod key_block;
// pub mod snippet_block;
// pub mod svelte_element;
// pub mod svelte_component;
// pub mod svelte_self;
// pub mod svelte_fragment;
// pub mod svelte_head;
// pub mod svelte_boundary;
// pub mod slot_element;
// pub mod title_element;
// pub mod const_tag;
// pub mod debug_tag;
