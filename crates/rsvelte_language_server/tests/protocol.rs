//! Drives the real `rsvelte-language-server` binary over stdio and asserts
//! that what it publishes matches calling the formatter / linter directly.

use std::io::{BufRead, BufReader, Read, Write};
use std::path::{Path, PathBuf};
use std::process::{Child, ChildStdin, ChildStdout, Command, Stdio};
use std::sync::Arc;
use std::sync::Mutex;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;

use serde_json::{Value, json};

/// A component with an unformatted tag and a lint finding.
const SOURCE: &str = "<div   class='a'>{@html value}</div>\n";

struct Server {
    child: Arc<Mutex<Child>>,
    /// Taken (and thereby closed) on shutdown, so the server sees EOF.
    stdin: Option<ChildStdin>,
    stdout: BufReader<ChildStdout>,
    finished: Arc<AtomicBool>,
    next_id: i64,
}

impl Server {
    fn start() -> Self {
        let mut child = Command::new(env!("CARGO_BIN_EXE_rsvelte-language-server"))
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .spawn()
            .expect("spawn language server");
        let stdin = child.stdin.take().unwrap();
        let stdout = BufReader::new(child.stdout.take().unwrap());

        // A protocol bug would otherwise hang the test run forever.
        let child = Arc::new(Mutex::new(child));
        let finished = Arc::new(AtomicBool::new(false));
        {
            let child = Arc::clone(&child);
            let finished = Arc::clone(&finished);
            std::thread::spawn(move || {
                for _ in 0..600 {
                    if finished.load(Ordering::Relaxed) {
                        return;
                    }
                    std::thread::sleep(Duration::from_millis(100));
                }
                let _ = child.lock().unwrap().kill();
            });
        }

        Self {
            child,
            stdin: Some(stdin),
            stdout,
            finished,
            next_id: 0,
        }
    }

    /// Write errors are swallowed: a server that died shows up far more
    /// clearly as a failed read than as a broken pipe here.
    fn write(&mut self, message: &Value) {
        let body = serde_json::to_string(message).unwrap();
        let stdin = self.stdin.as_mut().expect("stdin is still open");
        let _ = write!(stdin, "Content-Length: {}\r\n\r\n{body}", body.len());
        let _ = stdin.flush();
    }

    fn read(&mut self) -> Value {
        self.try_read().expect("server closed the connection")
    }

    /// `None` once the server's stdout reaches EOF, i.e. it exited.
    fn try_read(&mut self) -> Option<Value> {
        let mut length = None;
        loop {
            let mut line = String::new();
            if self.stdout.read_line(&mut line).ok()? == 0 {
                return None;
            }
            let line = line.trim_end();
            if line.is_empty() {
                break;
            }
            if let Some(value) = line.strip_prefix("Content-Length: ") {
                length = Some(value.parse::<usize>().unwrap());
            }
        }
        let mut body = vec![0u8; length.expect("Content-Length header")];
        self.stdout.read_exact(&mut body).ok()?;
        serde_json::from_slice(&body).ok()
    }

    fn request(&mut self, method: &str, params: Value) -> i64 {
        self.next_id += 1;
        let id = self.next_id;
        self.write(&json!({ "jsonrpc": "2.0", "id": id, "method": method, "params": params }));
        id
    }

    fn notify(&mut self, method: &str, params: Value) {
        self.write(&json!({ "jsonrpc": "2.0", "method": method, "params": params }));
    }

    /// Read until the response to `id` arrives, answering any
    /// `workspace/configuration` the server asks for on the way.
    fn response(&mut self, id: i64) -> Value {
        loop {
            let message = self.read();
            if message.get("id").and_then(Value::as_i64) == Some(id) {
                return message["result"].clone();
            }
            self.answer_server_request(&message);
        }
    }

    /// Read until diagnostics for `uri` arrive.
    fn diagnostics(&mut self, uri: &str) -> Vec<Value> {
        loop {
            let message = self.read();
            if message["method"] == "textDocument/publishDiagnostics"
                && message["params"]["uri"] == uri
            {
                return message["params"]["diagnostics"]
                    .as_array()
                    .cloned()
                    .unwrap_or_default();
            }
            self.answer_server_request(&message);
        }
    }

    /// Read publishes for `uri` until one satisfies `want`, so a publish still
    /// in flight from an earlier change cannot decide an assertion.
    fn diagnostics_matching(&mut self, uri: &str, want: impl Fn(&[Value]) -> bool) -> Vec<Value> {
        for _ in 0..8 {
            let diagnostics = self.diagnostics(uri);
            if want(&diagnostics) {
                return diagnostics;
            }
        }
        panic!("diagnostics for {uri} never reached the expected state");
    }

    /// Read until `uri`'s diagnostics are cleared, skipping any publish a
    /// debounced lint got in first.
    fn cleared_diagnostics(&mut self, uri: &str) {
        self.diagnostics_matching(uri, <[Value]>::is_empty);
    }

    fn answer_server_request(&mut self, message: &Value) {
        let (Some(method), Some(id)) = (message["method"].as_str(), message.get("id")) else {
            return;
        };
        let result = if method == "workspace/configuration" {
            let items = message["params"]["items"].as_array().map_or(0, Vec::len);
            Value::Array(vec![
                json!({ "format": { "enable": true }, "lint": { "enable": true } });
                items
            ])
        } else {
            Value::Null
        };
        self.write(&json!({ "jsonrpc": "2.0", "id": id, "result": result }));
    }

    fn shutdown(&mut self) -> Option<i32> {
        let id = self.request("shutdown", Value::Null);
        self.response(id);
        self.exit()
    }

    /// Send `exit` and wait for the process, returning its exit code.
    fn exit(&mut self) -> Option<i32> {
        self.notify("exit", Value::Null);
        // Closing the pipe is what a real client's process exit does, and it is
        // what ends the server's reader thread — without it the server never
        // finishes shutting down.
        self.stdin.take();
        // Polled rather than `wait()`ed so the watchdog can still take the lock
        // and kill a server that refuses to exit.
        let mut code = None;
        for _ in 0..300 {
            if let Ok(Some(status)) = self.child.lock().unwrap().try_wait() {
                code = Some(status.code().unwrap_or(-1));
                break;
            }
            std::thread::sleep(Duration::from_millis(100));
        }
        self.finished.store(true, Ordering::Relaxed);
        code
    }

    /// Whether the server still answers. An unknown method must always draw a
    /// `MethodNotFound` response, which makes it a cheap liveness probe.
    fn is_alive(&mut self) -> bool {
        if matches!(self.child.lock().unwrap().try_wait(), Ok(Some(_))) {
            return false;
        }
        let id = self.request("rsvelte/ping", Value::Null);
        loop {
            let Some(message) = self.try_read() else {
                return false;
            };
            if message.get("id").and_then(Value::as_i64) == Some(id) {
                return true;
            }
            self.answer_server_request(&message);
        }
    }
}

impl Drop for Server {
    /// A surviving child keeps cargo's inherited stderr pipe open, which wedges
    /// the whole test run — so it is killed even when the test panicked.
    fn drop(&mut self) {
        self.stdin.take();
        let _ = self.child.lock().unwrap().kill();
    }
}

/// A directory of this test's own, so a config file one case writes cannot
/// reach another's documents.
fn temp_dir(case: &str) -> PathBuf {
    let dir =
        std::env::temp_dir().join(format!("rsvelte-ls-protocol-{}-{case}", std::process::id()));
    std::fs::remove_dir_all(&dir).ok();
    std::fs::create_dir_all(&dir).unwrap();
    dir
}

fn temp_component() -> PathBuf {
    temp_dir("format").join("App.svelte")
}

fn file_uri(path: &Path) -> String {
    format!("file://{}", path.display())
}

/// `initialize` + `initialized`, declaring `workspace/configuration` support.
fn initialized_server() -> Server {
    let mut server = Server::start();
    let id = server.request(
        "initialize",
        json!({
            "processId": Value::Null,
            "rootUri": Value::Null,
            "capabilities": { "workspace": { "configuration": true } },
        }),
    );
    server.response(id);
    server.notify("initialized", json!({}));
    server
}

fn did_open(server: &mut Server, uri: &str, text: &str) {
    server.notify(
        "textDocument/didOpen",
        json!({
            "textDocument": {
                "uri": uri,
                "languageId": "svelte",
                "version": 1,
                "text": text,
            }
        }),
    );
}

#[test]
fn serves_diagnostics_and_formatting() {
    let path = temp_component();
    let uri = file_uri(&path);

    let mut server = Server::start();
    let id = server.request(
        "initialize",
        json!({
            "processId": Value::Null,
            "rootUri": Value::Null,
            "capabilities": { "workspace": { "configuration": true } },
        }),
    );
    let result = server.response(id);

    assert_eq!(result["serverInfo"]["name"], "rsvelte-language-server");
    assert_eq!(result["serverInfo"]["version"], env!("CARGO_PKG_VERSION"));
    let sync = &result["capabilities"]["textDocumentSync"];
    assert_eq!(sync["openClose"], json!(true));
    // 2 == TextDocumentSyncKind.Incremental
    assert_eq!(sync["change"], json!(2));
    assert_eq!(sync["save"], json!(true));
    assert_eq!(
        result["capabilities"]["documentFormattingProvider"],
        json!(true)
    );

    server.notify("initialized", json!({}));
    server.notify(
        "textDocument/didOpen",
        json!({
            "textDocument": {
                "uri": uri,
                "languageId": "svelte",
                "version": 1,
                "text": SOURCE,
            }
        }),
    );

    // Diagnostics must match a direct lint of the same source.
    let mut config_cache = rsvelte_language_server::lint::LintConfigCache::default();
    let config = config_cache.get(path.parent().unwrap());
    let expected: Vec<Value> = rsvelte_language_server::lint::lint(&path, SOURCE, &config)
        .iter()
        .map(|d| serde_json::to_value(rsvelte_language_server::diagnostics::to_lsp(d)).unwrap())
        .collect();
    assert!(!expected.is_empty(), "the fixture should produce findings");
    assert_eq!(server.diagnostics(&uri), expected);

    // Formatting must match a direct in-process format of the same source.
    let session = rsvelte_fmt::FormatSession::resolve(&path).unwrap();
    let formatted = session.format(SOURCE, &path).unwrap();
    assert_ne!(formatted, SOURCE, "the fixture should need reformatting");

    let id = server.request(
        "textDocument/formatting",
        json!({
            "textDocument": { "uri": uri },
            "options": { "tabSize": 2, "insertSpaces": true },
        }),
    );
    let edits = server.response(id);
    let edits = edits.as_array().expect("formatting edits");
    assert_eq!(edits.len(), 1);
    assert_eq!(edits[0]["newText"], json!(formatted));
    assert_eq!(
        edits[0]["range"]["start"],
        json!({ "line": 0, "character": 0 })
    );

    // An already-formatted document yields no edits.
    server.notify(
        "textDocument/didChange",
        json!({
            "textDocument": { "uri": uri, "version": 2 },
            "contentChanges": [{ "text": formatted }],
        }),
    );
    let id = server.request(
        "textDocument/formatting",
        json!({
            "textDocument": { "uri": uri },
            "options": { "tabSize": 2, "insertSpaces": true },
        }),
    );
    assert_eq!(server.response(id), json!([]));

    // Closing clears the document's diagnostics.
    server.notify(
        "textDocument/didClose",
        json!({ "textDocument": { "uri": uri } }),
    );
    server.cleared_diagnostics(&uri);

    assert_eq!(server.shutdown(), Some(0));
}

/// Input that recurses deeper than a default stack allows. The analysis is
/// expected to fail; the session is not.
#[test]
fn a_pathological_document_does_not_take_the_session_down() {
    let dir = temp_dir("pathological");
    let mut server = initialized_server();

    for (name, text) in [
        (
            "nested-elements",
            format!("{}{}", "<div>".repeat(500), "</div>".repeat(500)),
        ),
        (
            "nested-expression",
            format!("<p>{{{}1{}}}</p>", "(".repeat(1000), ")".repeat(1000)),
        ),
        (
            "nested-script",
            format!("<script>{}1{}</script>", "(".repeat(2000), ")".repeat(2000)),
        ),
    ] {
        let uri = file_uri(&dir.join(format!("{name}.svelte")));
        did_open(&mut server, &uri, &text);
        assert!(server.is_alive(), "server died on {name}");
    }

    // And it still serves an ordinary document afterwards.
    let uri = file_uri(&dir.join("Ok.svelte"));
    did_open(&mut server, &uri, "<div>{@html value}</div>\n");
    assert!(
        !server.diagnostics(&uri).is_empty(),
        "diagnostics stopped working"
    );

    assert_eq!(server.shutdown(), Some(0));
}

/// `initialize` payloads whose individual fields this build cannot parse must
/// still be answered — a client left waiting sees an unexplained hang.
#[test]
fn a_malformed_initialize_is_still_answered() {
    for params in [
        json!({ "rootUri": "not a uri", "capabilities": {} }),
        json!({ "capabilities": Value::Null }),
        json!({ "trace": "bogus", "capabilities": {} }),
        json!({}),
    ] {
        let mut server = Server::start();
        let id = server.request("initialize", params.clone());
        let result = server.response(id);
        assert_eq!(
            result["serverInfo"]["name"], "rsvelte-language-server",
            "no initialize result for {params}"
        );
        server.notify("initialized", json!({}));
        assert_eq!(server.shutdown(), Some(0));
    }
}

/// `exit` before `shutdown` is an abnormal end and must be reported as one.
#[test]
fn exit_without_shutdown_fails() {
    let mut server = initialized_server();
    assert_eq!(server.exit(), Some(1));
}

/// A notification arriving between `shutdown` and `exit` is allowed, and must
/// not turn a clean shutdown into a failure.
#[test]
fn a_notification_between_shutdown_and_exit_is_harmless() {
    let mut server = initialized_server();
    let id = server.request("shutdown", Value::Null);
    server.response(id);
    server.notify("$/cancelRequest", json!({ "id": 1 }));
    assert_eq!(server.exit(), Some(0));
}

/// Editing `rsvelte-lint.json` reaches the server as a configuration change,
/// and the resolved config must be re-read rather than served from the cache.
#[test]
fn a_config_change_invalidates_the_resolved_lint_config() {
    let dir = temp_dir("lint-config");
    let uri = file_uri(&dir.join("App.svelte"));
    let mut server = initialized_server();

    fn reports_at_html(diagnostics: &[Value]) -> bool {
        diagnostics
            .iter()
            .any(|d| d["code"] == "svelte/no-at-html-tags")
    }

    did_open(&mut server, &uri, "<div>{@html value}</div>\n");
    server.diagnostics_matching(&uri, reports_at_html);

    std::fs::write(
        dir.join("rsvelte-lint.json"),
        r#"{ "rules": { "svelte/no-at-html-tags": "off" } }"#,
    )
    .unwrap();
    server.notify(
        "workspace/didChangeConfiguration",
        json!({ "settings": Value::Null }),
    );

    // The re-lint re-reads the config from disk rather than serving the one it
    // resolved on open, so the rule is gone.
    server.diagnostics_matching(&uri, |d| !reports_at_html(d));

    assert_eq!(server.shutdown(), Some(0));
}
