//! Port of [`svelte-preprocess-less`](https://github.com/ls-age/svelte-preprocess-less)
//! (v0.4.0) — a `<style>` preprocessor that compiles Less to CSS.
//!
//! There is no mature pure-Rust Less compiler, so this port follows the
//! **JS-fallback** pattern: it shells out to the user's installed `less` over a
//! small Node bridge ([`js/less-bridge.mjs`]). The detection (`filter`) and the
//! error-frame formatting are the package's own logic and are reproduced in
//! Rust so the output is byte-identical to the JS original given less's stable
//! error fields.

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
}

impl Default for LessOptions {
    fn default() -> Self {
        LessOptions {
            less_options: serde_json::Value::Object(Default::default()),
            node_bin: "node".to_string(),
            resolve_dir: None,
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
        character: character.unwrap_or(0),
    };
    LessError::Render {
        message,
        frame: Some(frame.join("\n")),
        start: Some(pos),
        end: Some(pos),
    }
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
