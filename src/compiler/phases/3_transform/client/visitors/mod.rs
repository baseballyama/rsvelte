//! Client-side visitors for template transformation.
//!
//! This module contains visitor implementations for each AST node type.
//! Each visitor is responsible for generating client-side JavaScript code
//! for its specific node type.
//!
//! # Architecture
//!
//! The visitor pattern matches the official Svelte compiler structure at
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/`.
//!
//! Each visitor:
//! - Takes an AST node and a context reference
//! - Modifies the context state to build output code
//! - Returns a Result for error handling
//!
//! # Visitor List
//!
//! The following visitors are planned (matching Svelte's structure):
//!
//! ## Template Nodes
//! - `fragment.rs` - Fragment visitor (container for nodes)
//! - `text.rs` - Text node visitor (currently inline in mod.rs)
//! - `regular_element.rs` - RegularElement visitor
//! - `component.rs` - Component visitor
//! - `svelte_element.rs` - SvelteElement (dynamic element) visitor
//!
//! ## Expression/Tags
//! - `expression_tag.rs` - ExpressionTag visitor ({expressions})
//! - `html_tag.rs` - HtmlTag visitor ({@html})
//! - `render_tag.rs` - RenderTag visitor ({@render})
//!
//! ## Blocks
//! - `if_block.rs` - IfBlock visitor ({#if})
//! - `each_block.rs` - EachBlock visitor ({#each})
//! - `await_block.rs` - AwaitBlock visitor ({#await})
//! - `key_block.rs` - KeyBlock visitor ({#key})
//! - `snippet_block.rs` - SnippetBlock visitor ({#snippet})
//!
//! ## Attributes
//! - `attribute.rs` - Attribute visitor
//!
//! # Current Status
//!
//! Visitors are currently implemented inline in `../mod.rs` as methods on
//! `ClientCodeGenerator`. This module provides the infrastructure for
//! gradual extraction into separate files.
//!
//! To extract a visitor:
//! 1. Create a new file (e.g., `text.rs`)
//! 2. Define the visitor function with signature matching `VisitorFn`
//! 3. Add the module declaration here
//! 4. Replace the inline method with a call to the extracted visitor

pub mod shared;

// Visitor modules
pub mod animate_directive;
pub mod arrow_function_expression;
pub mod assignment_expression;
pub mod expression_converter;

// Additional visitor modules will be added here as they are extracted.
// Example:
pub mod text;
// pub mod expression_tag;
pub mod regular_element;
// pub mod component;
pub mod await_block;
pub mod each_block;
pub mod if_block;
// pub mod key_block;
pub mod snippet_block;
// pub mod html_tag;
// pub mod render_tag;
// pub mod svelte_element;
pub mod attribute;
pub mod bind_directive;
pub mod fragment;
pub mod on_directive;
pub mod transition_directive;
