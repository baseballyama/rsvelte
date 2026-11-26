//! The options and results of `compile` and `compileModule`, as JavaScript objects. A compile
//! error is data in the outcome, so that JavaScript throws it as the official `CompileError`.

use napi_derive::napi;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::{LineColumn, LineIndex};
use rsvelte_svelte_compile::{CompileOptions, CompileResult, ModuleCompileOptions, Target};

/// The official options this compiler takes; `rsvelte/compiler` refuses the others by name.
#[napi(object)]
#[derive(Debug)]
pub struct Options {
    pub filename: Option<String>,
    pub generate: Option<String>,
    pub preserve_whitespace: Option<bool>,
}

#[napi(object)]
#[derive(Debug, PartialEq, Eq)]
pub struct Position {
    /// From 1.
    pub line: u32,
    /// In UTF-16 code units, from 0.
    pub column: u32,
    /// The UTF-16 offset in the source.
    pub character: u32,
}

/// A warning or the error, with the official `code`.
#[napi(object)]
#[derive(Debug, PartialEq, Eq)]
pub struct Report {
    pub code: String,
    pub message: String,
    pub start: Position,
    pub end: Position,
}

#[napi(object)]
#[derive(Debug)]
pub struct Output {
    pub code: String,
    /// A source map (version 3) as JSON.
    pub map: Option<String>,
}

#[napi(object)]
#[derive(Debug)]
pub struct Compiled {
    #[napi(js_name = "js")]
    pub javascript: Output,
    #[napi(js_name = "css")]
    pub stylesheet: Option<Output>,
    pub warnings: Vec<Report>,
}

/// Exactly one of the two.
#[napi(object)]
#[derive(Debug)]
pub struct Outcome {
    pub compiled: Option<Compiled>,
    pub error: Option<Report>,
}

/// # Errors
/// An option value this compiler does not take.
pub fn compile(source: &str, options: Options) -> Result<Outcome, String> {
    let options = CompileOptions {
        generate: target(&options)?,
        filename: filename(options.filename),
        preserve_whitespace: options.preserve_whitespace.unwrap_or(false),
        css_hash: None,
    };
    Ok(outcome(
        source,
        rsvelte_svelte_compile::compile(source, &options),
    ))
}

/// # Errors
/// An option value this compiler does not take.
pub fn compile_module(source: &str, options: Options) -> Result<Outcome, String> {
    let options = ModuleCompileOptions {
        generate: target(&options)?,
        filename: filename(options.filename),
    };
    Ok(outcome(
        source,
        rsvelte_svelte_compile::compile_module(source, &options),
    ))
}

fn filename(filename: Option<String>) -> String {
    filename.unwrap_or_else(|| ModuleCompileOptions::default().filename)
}

fn target(options: &Options) -> Result<Target, String> {
    match options.generate.as_deref() {
        None | Some("client") => Ok(Target::Client),
        Some("server") => Ok(Target::Server),
        Some(other) => Err(format!(
            "`generate` is \"client\" or \"server\", not {other:?}"
        )),
    }
}

fn outcome(source: &str, result: Result<CompileResult, Diagnostic>) -> Outcome {
    let lines = LineIndex::new(source);
    match result {
        Ok(result) => Outcome {
            compiled: Some(Compiled {
                javascript: Output {
                    code: result.js.code,
                    map: Some(result.js.map),
                },
                stylesheet: result.css.map(|code| Output { code, map: None }),
                warnings: result
                    .warnings
                    .iter()
                    .map(|warning| report(&lines, warning))
                    .collect(),
            }),
            error: None,
        },
        Err(error) => Outcome {
            compiled: None,
            error: Some(report(&lines, &error)),
        },
    }
}

fn report(lines: &LineIndex, diagnostic: &Diagnostic) -> Report {
    Report {
        code: diagnostic.code.to_string(),
        message: diagnostic.message.clone(),
        start: position(&lines.line_column(diagnostic.span.start_offset)),
        end: position(&lines.line_column(diagnostic.span.end_offset)),
    }
}

const fn position(at: &LineColumn) -> Position {
    Position {
        line: at.line,
        column: at.column,
        character: at.character,
    }
}

/// The modern AST as JSON, or the parse error.
#[napi(object)]
#[derive(Debug)]
pub struct Parsed {
    pub ast: Option<String>,
    pub error: Option<Report>,
}

#[must_use]
pub fn parse(source: &str) -> Parsed {
    match rsvelte_svelte_compile::parse(source) {
        Ok(ast) => Parsed {
            ast: Some(ast),
            error: None,
        },
        Err(error) => Parsed {
            ast: None,
            error: Some(report(&LineIndex::new(source), &error)),
        },
    }
}
