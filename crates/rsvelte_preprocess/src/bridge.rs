//! Shared Node JS-fallback boundary.
//!
//! Several preprocessors have no faithful pure-Rust backend (their fixtures are
//! defined by a specific JS engine — `marked`, `unified`/remark, postcss-based
//! `@modular-css/processor`, KaTeX, …). For those, the port plan (§2.2)
//! sanctions delegating to the user's installed JS tool over a thin boundary.
//!
//! This module spawns `node` running a caller-provided ES-module script, sends a
//! JSON request on stdin, and returns the parsed JSON the script writes to
//! stdout. The upstream tool is resolved from the working directory (the user's
//! project), exactly like the real JS preprocessors resolve their peers.

use std::io::Write;
use std::path::PathBuf;
use std::process::{Command, Stdio};

/// How to invoke the bridge.
#[derive(Debug, Clone)]
pub struct BridgeOptions {
    /// Node binary (default `"node"`).
    pub node_bin: String,
    /// Working directory the script resolves modules from / runs in.
    pub cwd: Option<PathBuf>,
}

impl Default for BridgeOptions {
    fn default() -> Self {
        BridgeOptions {
            node_bin: "node".to_string(),
            cwd: None,
        }
    }
}

/// Run `script` (an ES module) under Node, passing `request` as JSON on stdin
/// and returning the JSON value the script writes to stdout.
pub fn run(
    script: &str,
    request: &serde_json::Value,
    opts: &BridgeOptions,
) -> Result<serde_json::Value, String> {
    let mut command = Command::new(&opts.node_bin);
    command
        .arg("--input-type=module")
        .arg("-e")
        .arg(script)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    if let Some(dir) = &opts.cwd {
        command.current_dir(dir);
    }

    let mut child = command
        .spawn()
        .map_err(|e| format!("failed to spawn `{}`: {e}", opts.node_bin))?;
    child
        .stdin
        .take()
        .expect("piped stdin")
        .write_all(request.to_string().as_bytes())
        .map_err(|e| format!("failed to write bridge stdin: {e}"))?;
    let output = child
        .wait_with_output()
        .map_err(|e| format!("bridge did not complete: {e}"))?;

    if !output.status.success() {
        return Err(format!(
            "node bridge exited with {}: {}",
            output.status,
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let value: serde_json::Value = serde_json::from_slice(&output.stdout).map_err(|e| {
        format!(
            "invalid bridge response: {e}: {}",
            String::from_utf8_lossy(&output.stdout)
        )
    })?;

    if let Some(msg) = value.get("bridgeError").and_then(|v| v.as_str()) {
        return Err(msg.to_string());
    }
    Ok(value)
}

/// Configuration shared by the markup-bridge preprocessors.
#[derive(Debug, Clone, Default)]
pub struct MarkupBridge {
    /// Upstream-tool options object, forwarded verbatim as JSON.
    pub options: serde_json::Value,
    /// Node invocation / module-resolution settings.
    pub bridge: BridgeOptions,
}

/// Build a markup [`PreprocessorGroup`] that delegates to a Node bridge script.
///
/// The script receives `{ content, filename, options }` on stdin and must reply
/// with `{ ok: { code, map } }`, `{ bridgeError }`, or `{ renderError }`.
pub fn markup_group(
    name: &'static str,
    script: &'static str,
    config: MarkupBridge,
) -> rsvelte_core::compiler::preprocess::types::PreprocessorGroup {
    use rsvelte_core::compiler::preprocess::types::{
        MarkupPreprocessorFn, MarkupPreprocessorOptions, PreprocessError, PreprocessorGroup,
        PreprocessorResult, Processed, SourceMapInput,
    };

    PreprocessorGroup {
        name: Some(name.to_string()),
        markup: Some(Box::new(
            move |opts: MarkupPreprocessorOptions| -> PreprocessorResult {
                let config = config.clone();
                Box::pin(async move {
                    let request = serde_json::json!({
                        "content": opts.content,
                        "filename": opts.filename,
                        "options": config.options,
                    });
                    let value =
                        run(script, &request, &config.bridge).map_err(PreprocessError::Other)?;

                    if let Some(err) = value.get("renderError").and_then(|v| v.as_str()) {
                        return Err(PreprocessError::Other(err.to_string()));
                    }
                    let Some(ok) = value.get("ok") else {
                        return Err(PreprocessError::Other("empty bridge response".to_string()));
                    };
                    let code = ok
                        .get("code")
                        .and_then(|v| v.as_str())
                        .unwrap_or(&opts.content)
                        .to_string();
                    let map = ok
                        .get("map")
                        .and_then(|v| v.as_str())
                        .map(|m| SourceMapInput::Json(m.to_string()));
                    Ok(Some(Processed {
                        code,
                        map,
                        ..Default::default()
                    }))
                })
            },
        ) as MarkupPreprocessorFn),
        ..Default::default()
    }
}
