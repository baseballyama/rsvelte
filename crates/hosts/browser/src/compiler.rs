//! `compile`, `compileModule` and `parse` of `@rsvelte/rsvelte/compiler` in a browser.
//!
//! Each returns what the Node.js addon returns, its reports as JSON, so that one JavaScript module
//! shapes both into the official results.
// On a function, the expectation goes unfulfilled on the code wasm-bindgen generates from it.
#![expect(
    clippy::needless_pass_by_value,
    reason = "a JavaScript string arrives owned"
)]

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::positions::LineIndex;
use rsvelte_svelte_compile::{CompileOptions, CompileResult, ModuleCompileOptions, Target};
use wasm_bindgen::prelude::*;

/// The version of the official compiler whose output this compiler reproduces.
#[wasm_bindgen]
#[must_use]
pub fn version() -> String {
    rsvelte_svelte_compile::VERSION.to_owned()
}

/// Compiles a component.
///
/// # Errors
/// A `generate` this compiler does not take.
#[wasm_bindgen]
pub fn compile(
    source: &str,
    filename: Option<String>,
    generate: Option<String>,
    preserve_whitespace: Option<bool>,
) -> Result<String, JsError> {
    let options = CompileOptions {
        generate: target(generate.as_deref())?,
        filename: filename.unwrap_or_else(|| CompileOptions::default().filename),
        preserve_whitespace: preserve_whitespace.unwrap_or(false),
        css_hash: None,
    };
    Ok(outcome(
        source,
        rsvelte_svelte_compile::compile(source, &options),
    ))
}

/// Compiles a `.svelte.js` module.
///
/// # Errors
/// A `generate` this compiler does not take.
#[wasm_bindgen(js_name = compileModule)]
pub fn compile_module(
    source: &str,
    filename: Option<String>,
    generate: Option<String>,
) -> Result<String, JsError> {
    let options = ModuleCompileOptions {
        generate: target(generate.as_deref())?,
        filename: filename.unwrap_or_else(|| ModuleCompileOptions::default().filename),
    };
    Ok(outcome(
        source,
        rsvelte_svelte_compile::compile_module(source, &options),
    ))
}

/// A component's modern AST as JSON, or why it does not parse.
#[wasm_bindgen(getter_with_clone)]
#[derive(Debug)]
pub struct Parsed {
    pub ast: Option<String>,
    /// The report, as JSON.
    pub error: Option<String>,
}

/// Parses a component.
#[wasm_bindgen]
#[must_use]
pub fn parse(source: &str) -> Parsed {
    match rsvelte_svelte_compile::parse(source) {
        Ok(ast) => Parsed {
            ast: Some(ast),
            error: None,
        },
        Err(error) => {
            let mut json = StructuredDataWriter::new(false);
            report(&mut json, &LineIndex::new(source), &error);
            Parsed {
                ast: None,
                error: Some(json.finish()),
            }
        }
    }
}

fn target(generate: Option<&str>) -> Result<Target, JsError> {
    match generate {
        None | Some("client") => Ok(Target::Client),
        Some("server") => Ok(Target::Server),
        Some(other) => Err(JsError::new(&format!(
            "`generate` is \"client\" or \"server\", not {other:?}"
        ))),
    }
}

fn outcome(source: &str, result: Result<CompileResult, Diagnostic>) -> String {
    let lines = LineIndex::new(source);
    let mut json = StructuredDataWriter::new(false);
    json.begin_object();
    match result {
        Ok(result) => {
            json.key("compiled")
                .begin_object()
                .key("js")
                .begin_object()
                .key("code")
                .write_string(&result.js.code)
                .key("map")
                .write_string(&result.js.map)
                .end_object()
                .key("css");
            match &result.css {
                Some(code) => json
                    .begin_object()
                    .key("code")
                    .write_string(code)
                    .end_object(),
                None => json.null(),
            };
            json.key("warnings").begin_array();
            for warning in &result.warnings {
                report(&mut json, &lines, warning);
            }
            json.end_array().end_object();
        }
        Err(error) => {
            json.key("error");
            report(&mut json, &lines, &error);
        }
    }
    json.end_object();
    json.finish()
}

fn report(json: &mut StructuredDataWriter, lines: &LineIndex, diagnostic: &Diagnostic) {
    json.begin_object()
        .key("code")
        .write_string(&diagnostic.code)
        .key("message")
        .write_string(&diagnostic.message);
    for (key, byte) in [
        ("start", diagnostic.span.start_offset),
        ("end", diagnostic.span.end_offset),
    ] {
        let at = lines.line_column(byte);
        json.key(key)
            .begin_object()
            .key("line")
            .write_number(at.line)
            .key("column")
            .write_number(at.column)
            .key("character")
            .write_number(at.character)
            .end_object();
    }
    json.end_object();
}

#[cfg(test)]
mod tests;
