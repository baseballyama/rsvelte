//! stdio JSON-RPC loop.
//!
//! Framing is LSP-style `Content-Length` headers. TypeScript pipelines: it
//! writes every transform request it can without waiting for a reply (measured
//! at 200 outstanding requests over one pipe), so transforms run on the thread
//! pool and answer out of order, which JSON-RPC allows.

use std::collections::HashMap;
use std::io::{BufRead, BufReader, Read, Write};
use std::sync::{Arc, Mutex, RwLock};

use serde_json::{Value, json};

use crate::{
    InitializeParams, MapperOptions, OpenProjectParams, OpenProjectResult, TransformParams,
    initialize, transform,
};

/// Serve the protocol until stdin closes.
///
/// # Errors
///
/// Returns an error only for an unreadable stream or malformed framing —
/// anything the protocol can express is answered as a response instead.
pub fn serve(input: impl Read + Send, output: impl Write + Send) -> std::io::Result<()> {
    let mut reader = BufReader::new(input);
    let out = Arc::new(Mutex::new(output));
    // One process serves many projects; `transform` carries only the handle,
    // so the options that came with `openProject` have to be kept per handle.
    let projects: Arc<RwLock<HashMap<String, MapperOptions>>> = Arc::default();
    // The scope is what makes a spawned transform's reply guaranteed: without
    // it, end of stdin returns from `serve` while transforms are still queued
    // and their responses are never written.
    rayon::scope(|scope| -> std::io::Result<()> {
        loop {
            let Some(body) = read_message(&mut reader)? else {
                return Ok(());
            };
            let Ok(msg) = serde_json::from_str::<Value>(&body) else {
                continue;
            };
            let id = msg.get("id").cloned().unwrap_or(Value::Null);
            let method = msg
                .get("method")
                .and_then(Value::as_str)
                .unwrap_or_default();
            let params = msg.get("params").cloned().unwrap_or(Value::Null);

            match method {
                "initialize" => {
                    let reply = serde_json::from_value::<InitializeParams>(params)
                        .map_err(|e| e.to_string())
                        .and_then(|p| initialize(&p));
                    match reply {
                        Ok(result) => respond(&out, &id, &json!(result)),
                        Err(message) => respond_error(&out, &id, &message),
                    }
                }
                "openProject" => {
                    if let Ok(p) = serde_json::from_value::<OpenProjectParams>(params) {
                        let options = p
                            .options
                            .and_then(|o| serde_json::from_value::<MapperOptions>(o).ok())
                            .unwrap_or_default();
                        if let Ok(mut projects) = projects.write() {
                            projects.insert(p.project_handle, options);
                        }
                    }
                    respond(&out, &id, &json!(OpenProjectResult {}));
                }
                "closeProject" => {
                    if let Some(handle) = params.get("projectHandle").and_then(Value::as_str)
                        && let Ok(mut projects) = projects.write()
                    {
                        projects.remove(handle);
                    }
                    respond(&out, &id, &json!({}));
                }
                "transform" => {
                    // Off the read loop: the next request is already in the pipe.
                    let out = Arc::clone(&out);
                    let projects = Arc::clone(&projects);
                    scope.spawn(
                        move |_| match serde_json::from_value::<TransformParams>(params) {
                            Ok(p) => {
                                let options = projects
                                    .read()
                                    .ok()
                                    .and_then(|m| m.get(&p.project_handle).cloned())
                                    .unwrap_or_default();
                                respond(&out, &id, &json!(transform(&p, &options)));
                            }
                            Err(e) => respond_error(&out, &id, &e.to_string()),
                        },
                    );
                }
                _ => respond_error(&out, &id, &format!("unknown method '{method}'")),
            }
        }
    })
}

/// Read one `Content-Length`-framed message. `Ok(None)` at end of stream.
fn read_message(reader: &mut BufReader<impl Read>) -> std::io::Result<Option<String>> {
    let mut length: Option<usize> = None;
    loop {
        let mut line = String::new();
        if reader.read_line(&mut line)? == 0 {
            return Ok(None);
        }
        let line = line.trim_end_matches(['\r', '\n']);
        if line.is_empty() {
            break;
        }
        if let Some(value) = line
            .split_once(':')
            .filter(|(name, _)| name.eq_ignore_ascii_case("content-length"))
            .and_then(|(_, v)| v.trim().parse::<usize>().ok())
        {
            length = Some(value);
        }
    }
    let Some(length) = length else {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            "message header carried no Content-Length",
        ));
    };
    let mut buf = vec![0u8; length];
    reader.read_exact(&mut buf)?;
    String::from_utf8(buf)
        .map(Some)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))
}

fn respond(out: &Mutex<impl Write>, id: &Value, result: &Value) {
    write_message(
        out,
        &json!({ "jsonrpc": "2.0", "id": id, "result": result }),
    );
}

fn respond_error(out: &Mutex<impl Write>, id: &Value, message: &str) {
    write_message(
        out,
        &json!({ "jsonrpc": "2.0", "id": id, "error": { "code": -32603, "message": message } }),
    );
}

fn write_message(out: &Mutex<impl Write>, message: &Value) {
    let body = message.to_string();
    let Ok(mut out) = out.lock() else {
        return;
    };
    let _ = write!(out, "Content-Length: {}\r\n\r\n{body}", body.len());
    let _ = out.flush();
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Drive the loop over a scripted stdin and return the framed replies.
    fn round_trip(requests: &[Value]) -> Vec<Value> {
        let mut input = Vec::new();
        for r in requests {
            let body = r.to_string();
            input.extend_from_slice(
                format!("Content-Length: {}\r\n\r\n{body}", body.len()).as_bytes(),
            );
        }
        let sink = Arc::new(Mutex::new(Vec::<u8>::new()));
        struct Shared(Arc<Mutex<Vec<u8>>>);
        impl Write for Shared {
            fn write(&mut self, buf: &[u8]) -> std::io::Result<usize> {
                self.0.lock().expect("sink poisoned").extend_from_slice(buf);
                Ok(buf.len())
            }
            fn flush(&mut self) -> std::io::Result<()> {
                Ok(())
            }
        }
        serve(input.as_slice(), Shared(Arc::clone(&sink))).expect("serve");
        let raw = String::from_utf8(sink.lock().expect("sink poisoned").clone()).expect("utf8");
        raw.split("Content-Length: ")
            .filter(|s| !s.is_empty())
            .filter_map(|s| s.split_once("\r\n\r\n"))
            .map(|(_, body)| serde_json::from_str(body).expect("reply is JSON"))
            .collect()
    }

    #[test]
    fn initialize_negotiates_utf8_and_a_non_ts_diagnostic_source() {
        let replies = round_trip(&[json!({
            "jsonrpc": "2.0", "id": 1, "method": "initialize",
            "params": { "protocolVersion": 1, "positionEncodings": ["utf-8", "utf-16"] }
        })]);
        assert_eq!(replies.len(), 1);
        let result = &replies[0]["result"];
        assert_eq!(result["protocolVersion"], 1);
        assert_eq!(result["positionEncoding"], "utf-8");
        assert_eq!(result["diagnosticSource"], "svelte");
        assert_ne!(result["diagnosticSource"], "ts");
    }

    #[test]
    fn a_transform_answers_with_camel_case_wire_fields() {
        let replies = round_trip(&[json!({
            "jsonrpc": "2.0", "id": 7, "method": "transform",
            "params": {
                "fileName": "/p/App.svelte",
                "content": "<script lang=\"ts\">\n  let a = 1;\n</script>\n<b>{a}</b>\n",
                "projectHandle": "h1"
            }
        })]);
        assert_eq!(replies.len(), 1);
        assert_eq!(replies[0]["id"], 7);
        let result = &replies[0]["result"];
        assert_eq!(result["extension"], ".tsx");
        assert!(result["text"].as_str().is_some_and(|t| !t.is_empty()));
        assert!(result["mappings"].as_array().is_some_and(|m| !m.is_empty()));
    }

    #[test]
    fn every_request_is_answered_even_when_transforms_finish_out_of_order() {
        let mut requests = vec![json!({
            "jsonrpc": "2.0", "id": 0, "method": "initialize",
            "params": { "protocolVersion": 1, "positionEncodings": ["utf-8"] }
        })];
        for id in 1..=32 {
            requests.push(json!({
                "jsonrpc": "2.0", "id": id, "method": "transform",
                "params": {
                    "fileName": format!("/p/C{id}.svelte"),
                    "content": format!("<script lang=\"ts\">\n  let v{id} = {id};\n</script>\n"),
                    "projectHandle": "h1"
                }
            }));
        }
        let replies = round_trip(&requests);
        let mut ids: Vec<u64> = replies.iter().filter_map(|r| r["id"].as_u64()).collect();
        ids.sort_unstable();
        assert_eq!(ids, (0..=32).collect::<Vec<_>>());
    }

    /// `transform` carries only a project handle, so options that never made
    /// it into the per-handle table would silently degrade to defaults — and a
    /// missing shim reference reads as hundreds of TS2304s, not as a bug here.
    #[test]
    fn open_project_options_reach_the_transform_for_that_handle() {
        let replies = round_trip(&[
            json!({
                "jsonrpc": "2.0", "id": 1, "method": "openProject",
                "params": {
                    "configFileName": "/p/tsconfig.json", "projectHandle": "h1",
                    "options": { "globalTypes": ["/abs/shims.d.ts"] },
                    "compilerOptions": {}
                }
            }),
            json!({
                "jsonrpc": "2.0", "id": 2, "method": "transform",
                "params": {
                    "fileName": "/p/App.svelte",
                    "content": "<script lang=\"ts\">\n  let a = 1;\n</script>\n",
                    "projectHandle": "h1"
                }
            }),
            json!({
                "jsonrpc": "2.0", "id": 3, "method": "transform",
                "params": {
                    "fileName": "/q/Other.svelte",
                    "content": "<script lang=\"ts\">\n  let a = 1;\n</script>\n",
                    "projectHandle": "unknown-handle"
                }
            }),
        ]);
        let text_of = |id: u64| {
            replies
                .iter()
                .find(|r| r["id"] == id)
                .and_then(|r| r["result"]["text"].as_str())
                .unwrap_or_default()
                .to_string()
        };
        assert!(text_of(2).starts_with("/// <reference path=\"/abs/shims.d.ts\" />"));
        assert!(!text_of(3).contains("/abs/shims.d.ts"));
    }

    #[test]
    fn an_unknown_method_is_an_error_response_rather_than_a_dropped_request() {
        let replies = round_trip(&[json!({ "jsonrpc": "2.0", "id": 3, "method": "nope" })]);
        assert_eq!(replies.len(), 1);
        assert!(replies[0]["error"]["message"].as_str().is_some());
    }
}
