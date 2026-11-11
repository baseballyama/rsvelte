//! The entry points of the official `svelte/compiler`: [`compile`], [`compile_module`] and
//! [`VERSION`], with the option and result names the official package uses. They run the same
//! artifacts as the `svelte.compile` task, on one source.

use std::sync::Arc;

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::document::{Document, DocumentError};
use rsvelte_kernel::source::positions::Span;
use rsvelte_plugin_interface::Function;

use crate::computation::CompileConfiguration;
use crate::{Configuration, CssHash, Target};

/// The version of the official compiler whose output this compiler reproduces.
pub const VERSION: &str = "5.57.3";

/// The official `CompileOptions` that this compiler reads. Components are always in runes mode.
#[derive(Clone, Debug)]
pub struct CompileOptions {
    /// The component name and the default CSS hash derive from it.
    pub filename: String,
    pub generate: Target,
    pub preserve_whitespace: bool,
    pub css_hash: Option<Function<CssHash>>,
}

impl Default for CompileOptions {
    fn default() -> Self {
        Self {
            filename: "(unknown)".to_owned(),
            generate: Target::Client,
            preserve_whitespace: false,
            css_hash: None,
        }
    }
}

/// The official `ModuleCompileOptions`.
#[derive(Clone, Debug)]
pub struct ModuleCompileOptions {
    pub filename: String,
    pub generate: Target,
}

impl Default for ModuleCompileOptions {
    fn default() -> Self {
        Self {
            filename: "(unknown)".to_owned(),
            generate: Target::Client,
        }
    }
}

#[derive(Debug)]
pub struct CompileResult {
    pub js: JavaScript,
    /// The scoped stylesheet, when the component has one and does not inject it.
    pub css: Option<String>,
    pub warnings: Vec<Diagnostic>,
}

#[derive(Debug)]
pub struct JavaScript {
    pub code: String,
    /// A source map (version 3) from `code` to the source.
    pub map: String,
}

/// Compiles a component, as the official `compile(source, options)` does.
///
/// # Errors
///
/// The first [`Diagnostic`]: what the official compiler rejects, or what this port does not
/// handle yet.
pub fn compile(source: &str, options: &CompileOptions) -> Result<CompileResult, Diagnostic> {
    let mut registry = Registry::new();
    crate::register(&mut registry);
    let configuration = Arc::new(Configuration {
        css_hash: options.css_hash.clone(),
        preserve_whitespace: options.preserve_whitespace,
    });
    // Every document of this registry is the one source, whatever its filename says.
    registry.provide::<CompileConfiguration>(
        "svelte",
        |_| true,
        move |_| Arc::clone(&configuration),
    );
    let document = document(&options.filename, source)?;
    let context = DocumentContext::new(&document, registry.artifacts());
    let compiled = crate::task::compiled(&context, options.generate, true)?;
    let map = compiled
        .javascript
        .source_map(context.line_index(), &options.filename);
    Ok(CompileResult {
        js: JavaScript {
            code: compiled.javascript.out,
            map,
        },
        css: compiled.stylesheet.map(str::to_owned),
        warnings: Vec::new(),
    })
}

/// Compiles a `.svelte.js` module, as the official `compileModule(source, options)` does. Like the
/// official one, it reads JavaScript only: strip the types of a `.svelte.ts` module first.
///
/// # Errors
///
/// Always, for now: this port does not compile modules yet.
pub fn compile_module(
    source: &str,
    options: &ModuleCompileOptions,
) -> Result<CompileResult, Diagnostic> {
    document(&options.filename, source)?;
    Err(Diagnostic::error(
        "svelte.compile_module.unsupported",
        "compiling a module is not supported yet",
        Span::new(0, 0),
    ))
}

fn document(filename: &str, source: &str) -> Result<Document, Diagnostic> {
    Document::new(filename.to_owned(), source.to_owned()).map_err(|DocumentError::TooLarge(n)| {
        Diagnostic::error(
            "svelte.compile.too_large",
            format!("the source is {n} bytes, too long for 32-bit positions"),
            Span::new(0, 0),
        )
    })
}

#[cfg(test)]
mod tests;
