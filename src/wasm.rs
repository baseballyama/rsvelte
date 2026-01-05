//! WebAssembly bindings for the Svelte compiler.
//!
//! This module provides JavaScript-accessible functions for compiling
//! Svelte components in the browser.

use wasm_bindgen::prelude::*;

use crate::compiler::{CompileOptions, GenerateMode, compile};
use crate::parser::{ParseOptions, parse};

/// Initialize panic hook for better error messages in the browser console.
#[wasm_bindgen(start)]
pub fn init() {
    console_error_panic_hook::set_once();
}

/// Result of parsing a Svelte component.
#[wasm_bindgen]
pub struct ParseResultWasm {
    success: bool,
    ast_json: String,
    error: Option<String>,
}

#[wasm_bindgen]
impl ParseResultWasm {
    #[wasm_bindgen(getter)]
    pub fn success(&self) -> bool {
        self.success
    }

    #[wasm_bindgen(getter)]
    pub fn ast(&self) -> String {
        self.ast_json.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn error(&self) -> Option<String> {
        self.error.clone()
    }
}

/// Result of compiling a Svelte component.
#[wasm_bindgen]
pub struct CompileResultWasm {
    success: bool,
    js: String,
    css: String,
    error: Option<String>,
}

#[wasm_bindgen]
impl CompileResultWasm {
    #[wasm_bindgen(getter)]
    pub fn success(&self) -> bool {
        self.success
    }

    #[wasm_bindgen(getter)]
    pub fn js(&self) -> String {
        self.js.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn css(&self) -> String {
        self.css.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn error(&self) -> Option<String> {
        self.error.clone()
    }
}

/// Parse a Svelte component and return the AST as JSON.
#[wasm_bindgen]
pub fn parse_svelte(source: &str) -> ParseResultWasm {
    let options = ParseOptions::default();

    match parse(source, options) {
        Ok(ast) => {
            let ast_json = serde_json::to_string_pretty(&ast).unwrap_or_default();
            ParseResultWasm {
                success: true,
                ast_json,
                error: None,
            }
        }
        Err(e) => ParseResultWasm {
            success: false,
            ast_json: String::new(),
            error: Some(format!("{:?}", e)),
        },
    }
}

/// Compile a Svelte component to client-side JavaScript.
#[wasm_bindgen]
pub fn compile_client(source: &str, name: &str) -> CompileResultWasm {
    let options = CompileOptions {
        generate: GenerateMode::Client,
        name: Some(name.to_string()),
        ..Default::default()
    };

    match compile(source, options) {
        Ok(result) => CompileResultWasm {
            success: true,
            js: result.js.code,
            css: result.css.map(|c| c.code).unwrap_or_default(),
            error: None,
        },
        Err(e) => CompileResultWasm {
            success: false,
            js: String::new(),
            css: String::new(),
            error: Some(format!("{:?}", e)),
        },
    }
}

/// Compile a Svelte component to server-side JavaScript.
#[wasm_bindgen]
pub fn compile_server(source: &str, name: &str) -> CompileResultWasm {
    let options = CompileOptions {
        generate: GenerateMode::Server,
        name: Some(name.to_string()),
        ..Default::default()
    };

    match compile(source, options) {
        Ok(result) => CompileResultWasm {
            success: true,
            js: result.js.code,
            css: result.css.map(|c| c.code).unwrap_or_default(),
            error: None,
        },
        Err(e) => CompileResultWasm {
            success: false,
            js: String::new(),
            css: String::new(),
            error: Some(format!("{:?}", e)),
        },
    }
}

/// Get the version of the compiler.
#[wasm_bindgen]
pub fn version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}
