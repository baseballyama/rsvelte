//! Port of [`svelte-preprocess-less`](https://github.com/ls-age/svelte-preprocess-less)
//! (v0.4.0) — a `<style>` preprocessor that compiles Less to CSS.
//!
//! A **native** Rust compiler ([`compile_native`]) covers the common subset —
//! top-level variables (`@name: value;`) and flat rules — and reports undefined
//! variables with the upstream code-frame formatting. For anything it doesn't
//! support (nesting, mixins, operations, functions, `@import`, …) it falls back
//! to the user's installed `less` over a Node bridge ([`js/less-bridge.mjs`]),
//! since there is no mature pure-Rust Less compiler. Set
//! [`LessOptions::prefer_native`] to `false` to always use the bridge.

use std::io::Write;
use std::path::PathBuf;
use std::process::{Command, Stdio};

use rsvelte_core::compiler::preprocess::types::{
    AttributeValue, PreprocessAttributeMap as Map, PreprocessError, PreprocessorFn,
    PreprocessorGroup, PreprocessorOptions, PreprocessorResult, Processed,
};

use crate::filter::{FilterOptions, matches};

const BRIDGE: &str = include_str!("../js/less-bridge.mjs");

/// Options for the Less port.
#[derive(Debug, Clone)]
pub struct LessOptions {
    /// `less.render` options, as a JSON object (forwarded verbatim to the bridge).
    pub less_options: serde_json::Value,
    /// The Node binary to invoke (default `"node"`).
    pub node_bin: String,
    /// Directory the bridge resolves `less` from / runs in (default: the current
    /// working directory — i.e. the user's project root during a build).
    pub resolve_dir: Option<PathBuf>,
    /// Try the native Rust compiler first (variables + flat rules), falling back
    /// to the Node bridge for anything it doesn't support. Default `true`.
    pub prefer_native: bool,
}

impl Default for LessOptions {
    fn default() -> Self {
        LessOptions {
            less_options: serde_json::Value::Object(Default::default()),
            node_bin: "node".to_string(),
            resolve_dir: None,
            prefer_native: true,
        }
    }
}

/// A source position (1-based line/column, 0-based character index).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Pos {
    pub line: u32,
    pub column: u32,
    pub character: u32,
}

/// An error from the Less port.
#[derive(Debug)]
pub enum LessError {
    /// The Node bridge could not run / `less` is not installed.
    Bridge(String),
    /// `less.render` threw.
    Render {
        message: String,
        /// Formatted code frame (mirrors the upstream `err.frame`), when less
        /// supplied line/column/extract.
        frame: Option<String>,
        start: Option<Pos>,
        end: Option<Pos>,
    },
}

impl std::fmt::Display for LessError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            LessError::Bridge(m) => write!(f, "{m}"),
            LessError::Render { message, frame, .. } => match frame {
                Some(frame) => write!(f, "{message}\n{frame}"),
                None => write!(f, "{message}"),
            },
        }
    }
}

/// Core transform — mirrors the upstream `preprocessLess(lessOptions,
/// filterOptions, { filename, content, attributes })`.
///
/// Returns `Ok(None)` when the block's `type`/`lang` does not select Less.
pub fn preprocess_less(
    less_options: &LessOptions,
    filter_options: &FilterOptions,
    filename: Option<&str>,
    content: &str,
    attributes: &Map<String, AttributeValue>,
) -> Result<Option<Processed>, LessError> {
    // `filter(Object.assign({ name: 'less' }, filterOptions), { attributes })`
    let filter = FilterOptions {
        name: Some("less".to_string()),
        ..filter_options.clone()
    };
    if !matches(&filter, attributes) {
        return Ok(None);
    }

    // Native fast path (variables + flat rules); fall back to the bridge for
    // features the native compiler doesn't cover.
    if less_options.prefer_native {
        match compile_native(content) {
            Native::Compiled(css) => {
                return Ok(Some(Processed {
                    code: css,
                    ..Default::default()
                }));
            }
            Native::Failed(err) => return Err(err),
            Native::Unsupported => {}
        }
    }

    compile_bridge(less_options, filename, content)
}

/// Bridge to the installed `less` (used for features the native compiler does
/// not support, or when `prefer_native` is off).
fn compile_bridge(
    less_options: &LessOptions,
    filename: Option<&str>,
    content: &str,
) -> Result<Option<Processed>, LessError> {
    let request = serde_json::json!({
        "content": content,
        "filename": filename,
        "options": less_options.less_options,
    });

    let mut command = Command::new(&less_options.node_bin);
    command
        .arg("--input-type=module")
        .arg("-e")
        .arg(BRIDGE)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    if let Some(dir) = &less_options.resolve_dir {
        command.current_dir(dir);
    }

    let mut child = command.spawn().map_err(|e| {
        LessError::Bridge(format!("failed to spawn `{}`: {e}", less_options.node_bin))
    })?;
    child
        .stdin
        .take()
        .expect("piped stdin")
        .write_all(request.to_string().as_bytes())
        .map_err(|e| LessError::Bridge(format!("failed to write to bridge stdin: {e}")))?;
    let output = child
        .wait_with_output()
        .map_err(|e| LessError::Bridge(format!("bridge did not complete: {e}")))?;

    if !output.status.success() {
        return Err(LessError::Bridge(format!(
            "less bridge exited with {}: {}",
            output.status,
            String::from_utf8_lossy(&output.stderr)
        )));
    }

    let response: serde_json::Value = serde_json::from_slice(&output.stdout).map_err(|e| {
        LessError::Bridge(format!(
            "invalid bridge response: {e}: {}",
            String::from_utf8_lossy(&output.stdout)
        ))
    })?;

    if let Some(msg) = response.get("bridgeError").and_then(|v| v.as_str()) {
        return Err(LessError::Bridge(msg.to_string()));
    }

    if let Some(ok) = response.get("ok") {
        let css = ok
            .get("css")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();
        let dependencies = ok
            .get("imports")
            .and_then(|v| v.as_array())
            .map(|a| {
                a.iter()
                    .filter_map(|v| v.as_str().map(str::to_string))
                    .collect()
            })
            .unwrap_or_default();
        return Ok(Some(Processed {
            code: css,
            dependencies,
            ..Default::default()
        }));
    }

    if let Some(err) = response.get("renderError") {
        return Err(format_render_error(err));
    }

    Err(LessError::Bridge("empty bridge response".to_string()))
}

/// Reproduce the upstream error massaging in `preprocessLess`'s `catch`.
fn format_render_error(err: &serde_json::Value) -> LessError {
    let message = err
        .get("message")
        .and_then(|v| v.as_str())
        .unwrap_or("Less error")
        .to_string();
    let line = err.get("line").and_then(|v| v.as_u64()).map(|v| v as u32);
    let column = err.get("column").and_then(|v| v.as_u64()).map(|v| v as u32);
    let character = err.get("index").and_then(|v| v.as_u64()).map(|v| v as u32);
    let extract: Option<Vec<String>> = err.get("extract").and_then(|v| v.as_array()).map(|a| {
        a.iter()
            .map(|v| v.as_str().unwrap_or("").to_string())
            .collect()
    });

    // `if (!(line && column && extract)) throw err;`
    let (Some(line), Some(column), Some(extract)) = (line, column, extract) else {
        return LessError::Render {
            message,
            frame: None,
            start: None,
            end: None,
        };
    };
    build_render_error(message, line, column, character.unwrap_or(0), &extract)
}

/// Build a [`LessError::Render`] with the upstream code-frame formatting.
fn build_render_error(
    message: String,
    line: u32,
    column: u32,
    character: u32,
    extract: &[String],
) -> LessError {
    // const frame = extract.map((l, i) => `${(line - 1) + i}:${l}`);
    let mut frame: Vec<String> = extract
        .iter()
        .enumerate()
        .map(|(i, l)| format!("{}:{l}", (line - 1) + i as u32))
        .collect();
    // frame.splice(2, 0, '^'.padStart(column + line.toString().length + 2));
    let pad = (column as usize) + line.to_string().len() + 2;
    let mut marker = " ".repeat(pad.saturating_sub(1));
    marker.push('^');
    let insert_at = frame.len().min(2);
    frame.insert(insert_at, marker);

    let pos = Pos {
        line,
        column,
        character,
    };
    LessError::Render {
        message,
        frame: Some(frame.join("\n")),
        start: Some(pos),
        end: Some(pos),
    }
}

// ─── native Less compiler (variables + flat rules) ────────────────────────────

/// Outcome of the native Less compiler.
enum Native {
    /// Successfully compiled to CSS.
    Compiled(String),
    /// Compilation failed (e.g. undefined variable) — a real Less error.
    Failed(LessError),
    /// Uses a feature the native compiler doesn't support — caller should bridge.
    Unsupported,
}

/// A conservative native Less compiler covering the common subset: top-level
/// variable definitions (`@name: value;`) and flat rules with simple
/// declarations. Anything else (nesting, mixins, operations, functions,
/// `@import`, `@media`, …) returns [`Native::Unsupported`] so the caller can
/// fall back to the real `less` over the bridge.
fn compile_native(content: &str) -> Native {
    let mut vars: std::collections::HashMap<String, String> = std::collections::HashMap::new();
    let mut rules: Vec<(String, Vec<(String, String)>)> = Vec::new();

    let bytes = content.as_bytes();
    let mut i = 0;
    while i < content.len() {
        // Skip whitespace.
        if bytes[i].is_ascii_whitespace() {
            i += 1;
            continue;
        }
        // Skip comments (treated as supported / ignorable).
        if content[i..].starts_with("//") {
            i = content[i..]
                .find('\n')
                .map(|p| i + p)
                .unwrap_or(content.len());
            continue;
        }
        if content[i..].starts_with("/*") {
            i = content[i..]
                .find("*/")
                .map(|p| i + p + 2)
                .unwrap_or(content.len());
            continue;
        }

        // Scan to the next top-level `{` or `;`.
        let start = i;
        let mut j = i;
        let mut delim = 0u8;
        while j < content.len() {
            match bytes[j] {
                b'{' | b';' | b'}' => {
                    delim = bytes[j];
                    break;
                }
                _ => j += 1,
            }
        }

        match delim {
            b';' => {
                // Expect a variable definition `@name: value`.
                let stmt = content[start..j].trim();
                if let Some(rest) = stmt.strip_prefix('@') {
                    if rest.starts_with("import") || rest.starts_with("media") {
                        return Native::Unsupported;
                    }
                    let Some((name, value)) = rest.split_once(':') else {
                        return Native::Unsupported;
                    };
                    let value = value.trim();
                    if !is_simple_value(value) {
                        return Native::Unsupported;
                    }
                    match resolve_value(value, &vars, content, start) {
                        Ok(v) => {
                            vars.insert(name.trim().to_string(), v);
                        }
                        Err(e) => return Native::Failed(e),
                    }
                } else {
                    return Native::Unsupported;
                }
                i = j + 1;
            }
            b'{' => {
                let selector = content[start..j].trim();
                if selector.starts_with('@') || selector.contains('&') {
                    return Native::Unsupported;
                }
                // Find the matching close; reject nesting.
                let body_start = j + 1;
                let mut k = body_start;
                while k < content.len() && bytes[k] != b'}' {
                    if bytes[k] == b'{' {
                        return Native::Unsupported; // nested rule
                    }
                    k += 1;
                }
                if k >= content.len() {
                    return Native::Unsupported;
                }
                let body = &content[body_start..k];
                let mut decls = Vec::new();
                let mut off = body_start;
                for piece in split_decls(body) {
                    let trimmed = piece.trim();
                    if trimmed.is_empty() {
                        off += piece.len() + 1;
                        continue;
                    }
                    let Some((prop, value)) = trimmed.split_once(':') else {
                        return Native::Unsupported;
                    };
                    let value = value.trim();
                    if !is_simple_value(value) {
                        return Native::Unsupported;
                    }
                    // Locate the value's offset for accurate error positions.
                    let value_off = off + piece.len() - piece.trim_start().len();
                    let value_off = content[value_off..]
                        .find(value)
                        .map(|p| value_off + p)
                        .unwrap_or(value_off);
                    match resolve_value(value, &vars, content, value_off) {
                        Ok(v) => decls.push((prop.trim().to_string(), v)),
                        Err(e) => return Native::Failed(e),
                    }
                    off += piece.len() + 1;
                }
                rules.push((selector.to_string(), decls));
                i = k + 1;
            }
            _ => return Native::Unsupported,
        }
    }

    // Emit canonical less output (2-space indent, expanded, trailing newline).
    use std::fmt::Write as _;
    let mut out = String::new();
    for (selector, decls) in &rules {
        out.push_str(selector);
        out.push_str(" {\n");
        for (prop, value) in decls {
            let _ = writeln!(out, "  {prop}: {value};");
        }
        out.push_str("}\n");
    }
    Native::Compiled(out)
}

/// Split a rule body on top-level `;`.
fn split_decls(body: &str) -> Vec<&str> {
    body.split(';').collect()
}

/// Whether a value is "simple" enough for the native compiler (no function
/// calls or arithmetic — those need real Less).
fn is_simple_value(value: &str) -> bool {
    !value.contains('(') && !value.contains('+') && !value.contains('*')
}

/// Resolve `@var` references in a value. Errors (with position) on an undefined
/// variable, mirroring less's `variable @name is undefined` error.
fn resolve_value(
    value: &str,
    vars: &std::collections::HashMap<String, String>,
    content: &str,
    value_off: usize,
) -> Result<String, LessError> {
    if let Some(at) = value.find('@') {
        let rest = &value[at + 1..];
        let name_len = rest
            .find(|c: char| !(c.is_alphanumeric() || c == '-' || c == '_'))
            .unwrap_or(rest.len());
        let name = &rest[..name_len];
        let Some(resolved) = vars.get(name) else {
            let abs = value_off + at;
            return Err(undefined_variable_error(content, abs, name));
        };
        // Substitute and recurse (handles `@a: @b`).
        let substituted = format!(
            "{}{}{}",
            &value[..at],
            resolved,
            &value[at + 1 + name_len..]
        );
        return resolve_value(&substituted, vars, content, value_off);
    }
    Ok(value.to_string())
}

/// Build the undefined-variable error at byte offset `at` in `content`.
fn undefined_variable_error(content: &str, at: usize, name: &str) -> LessError {
    let (line, column) = line_col(content, at);
    let lines: Vec<&str> = content.split('\n').collect();
    // extract = [prev line, error line, next line] (1-based `line`).
    let mut extract = Vec::new();
    for idx in (line as isize - 2)..=(line as isize) {
        if idx >= 0 && (idx as usize) < lines.len() {
            extract.push(lines[idx as usize].to_string());
        }
    }
    build_render_error(
        format!("variable @{name} is undefined"),
        line,
        column,
        at as u32,
        &extract,
    )
}

/// 1-based line and 0-based column-within-line for a byte offset.
fn line_col(content: &str, at: usize) -> (u32, u32) {
    let mut line = 1u32;
    let mut col = 0u32;
    for (i, c) in content.char_indices() {
        if i >= at {
            break;
        }
        if c == '\n' {
            line += 1;
            col = 0;
        } else {
            col += 1;
        }
    }
    (line, col)
}

/// Build the `svelte-preprocess-less` [`PreprocessorGroup`].
///
/// Mirrors the upstream `less(lessOptions, filterOptions)` factory.
pub fn less(less_options: LessOptions, filter_options: FilterOptions) -> PreprocessorGroup {
    PreprocessorGroup {
        name: Some("svelte-preprocess-less".to_string()),
        style: Some(
            Box::new(move |opts: PreprocessorOptions| -> PreprocessorResult {
                let less_options = less_options.clone();
                let filter_options = filter_options.clone();
                Box::pin(async move {
                    preprocess_less(
                        &less_options,
                        &filter_options,
                        opts.filename.as_deref(),
                        &opts.content,
                        &opts.attributes,
                    )
                    .map_err(|e| PreprocessError::Other(e.to_string()))
                })
            }) as PreprocessorFn,
        ),
        ..Default::default()
    }
}
