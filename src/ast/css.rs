//! CSS AST types.
//!
//! This module contains the CSS AST types for Svelte's <style> blocks.
//! For now, we use a JSON value to represent CSS, as parsing CSS is a
//! separate concern from parsing Svelte templates.

use serde::{Deserialize, Serialize};

/// A CSS stylesheet.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StyleSheet {
    #[serde(rename = "type")]
    pub node_type: StyleSheetType,
    pub start: u32,
    pub end: u32,
    pub attributes: Vec<serde_json::Value>,
    pub children: Vec<serde_json::Value>,
    pub content: StyleSheetContent,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum StyleSheetType {
    StyleSheet,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StyleSheetContent {
    pub start: u32,
    pub end: u32,
    pub styles: String,
}
