use std::collections::{HashMap, HashSet};
use std::fs;
use std::io::{BufRead, BufReader, Write};
use std::path::{Path, PathBuf};
use std::process::{Child, ChildStdin, Command, Stdio};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::mpsc::{self, Receiver, RecvTimeoutError};
use std::thread::{self, JoinHandle};
use std::time::{Duration, Instant};

use serde_json::{Value, json};

const RESPONSE_TIMEOUT: Duration = Duration::from_secs(10);
static NEXT_TEMP: AtomicU64 = AtomicU64::new(0);

struct TestDir(PathBuf);

impl TestDir {
    fn new(case: &str) -> Self {
        let unique = NEXT_TEMP.fetch_add(1, Ordering::Relaxed);
        let path = std::env::temp_dir().join(format!(
            "rsvelte-ls-robustness-{}-{unique}-{case}",
            std::process::id()
        ));
        fs::create_dir_all(&path).expect("create test directory");
        Self(path)
    }
}

impl Drop for TestDir {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.0);
    }
}

struct Server {
    child: Child,
    stdin: Option<ChildStdin>,
    messages: Receiver<Result<Value, String>>,
    reader: Option<JoinHandle<()>>,
    buffered: HashMap<i64, Value>,
    next_id: i64,
}

impl Server {
    fn start(root: Option<&Path>, environment: &[(&str, &Path)]) -> Self {
        let mut command = Command::new(env!("CARGO_BIN_EXE_rsvelte-language-server"));
        command
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit());
        for (key, value) in environment {
            command.env(key, value);
        }
        let mut child = command.spawn().expect("spawn language server");
        let stdin = child.stdin.take().expect("language server stdin");
        let stdout = child.stdout.take().expect("language server stdout");
        let (sender, messages) = mpsc::channel();
        let reader = thread::spawn(move || {
            let mut stdout = BufReader::new(stdout);
            loop {
                match read_message(&mut stdout) {
                    Ok(Some(message)) => {
                        if sender.send(Ok(message)).is_err() {
                            return;
                        }
                    }
                    Ok(None) => {
                        let _ = sender.send(Err("language server closed stdout".to_string()));
                        return;
                    }
                    Err(error) => {
                        let _ = sender.send(Err(error));
                        return;
                    }
                }
            }
        });
        let mut server = Self {
            child,
            stdin: Some(stdin),
            messages,
            reader: Some(reader),
            buffered: HashMap::new(),
            next_id: 0,
        };
        let root_uri = root.map(file_uri).map(Value::String).unwrap_or(Value::Null);
        let id = server.request(
            "initialize",
            json!({
                "processId": Value::Null,
                "rootUri": root_uri,
                "capabilities": {
                    "general": { "positionEncodings": ["utf-8", "utf-16"] },
                    "workspace": { "configuration": true },
                },
            }),
        );
        let response = server.response(id, RESPONSE_TIMEOUT);
        assert_eq!(
            response["result"]["serverInfo"]["name"],
            "rsvelte-language-server"
        );
        server.notify("initialized", json!({}));
        server
    }

    fn write(&mut self, message: &Value) {
        let body = serde_json::to_vec(message).expect("serialize LSP message");
        self.write_frame(&body);
    }

    /// The framing stays correct whatever the body is, so a caller can send a
    /// payload the *decoder* rejects without leaving the reader unable to find
    /// where the next frame starts.
    fn write_frame(&mut self, body: &[u8]) {
        let stdin = self.stdin.as_mut().expect("language server stdin is open");
        write!(stdin, "Content-Length: {}\r\n\r\n", body.len()).expect("write LSP header");
        stdin.write_all(body).expect("write LSP body");
        stdin.flush().expect("flush LSP body");
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

    fn response(&mut self, id: i64, timeout: Duration) -> Value {
        if let Some(message) = self.buffered.remove(&id) {
            return message;
        }
        let deadline = Instant::now() + timeout;
        loop {
            let message = self.next_message(deadline);
            if message.get("method").is_some() && message.get("id").is_some() {
                self.answer_server_request(&message);
                continue;
            }
            if let Some(response_id) = message.get("id").and_then(Value::as_i64) {
                if response_id == id {
                    return message;
                }
                self.buffered.insert(response_id, message);
            }
        }
    }

    fn next_message(&self, deadline: Instant) -> Value {
        let remaining = deadline.saturating_duration_since(Instant::now());
        match self.messages.recv_timeout(remaining) {
            Ok(Ok(message)) => message,
            Ok(Err(error)) => panic!("{error}"),
            Err(RecvTimeoutError::Timeout) => panic!("timed out waiting for language server"),
            Err(RecvTimeoutError::Disconnected) => panic!("language server reader stopped"),
        }
    }

    fn answer_server_request(&mut self, message: &Value) {
        let id = message["id"].clone();
        let result = if message["method"] == "workspace/configuration" {
            let values = message["params"]["items"]
                .as_array()
                .into_iter()
                .flatten()
                .map(|_| Value::Null)
                .collect();
            Value::Array(values)
        } else {
            Value::Null
        };
        self.write(&json!({ "jsonrpc": "2.0", "id": id, "result": result }));
    }

    fn open(&mut self, uri: &str, text: &str) {
        self.notify(
            "textDocument/didOpen",
            json!({
                "textDocument": {
                    "uri": uri,
                    "languageId": "svelte",
                    "version": 1,
                    "text": text,
                },
            }),
        );
    }

    fn change(&mut self, uri: &str, version: i64, text: &str) {
        self.notify(
            "textDocument/didChange",
            json!({
                "textDocument": { "uri": uri, "version": version },
                "contentChanges": [{ "text": text }],
            }),
        );
    }

    fn probe(&mut self) {
        let id = self.request("rsvelte/testLiveness", Value::Null);
        let response = self.response(id, RESPONSE_TIMEOUT);
        assert_eq!(response["error"]["code"], -32601);
    }

    fn shutdown(mut self) {
        let id = self.request("shutdown", Value::Null);
        let response = self.response(id, RESPONSE_TIMEOUT);
        assert!(
            response.get("result").is_some(),
            "shutdown failed: {response}"
        );
        self.notify("exit", Value::Null);
        self.stdin.take();
        let deadline = Instant::now() + Duration::from_secs(5);
        loop {
            match self.child.try_wait() {
                Ok(Some(status)) => {
                    assert!(status.success(), "language server exited with {status}");
                    break;
                }
                Ok(None) if Instant::now() < deadline => thread::sleep(Duration::from_millis(10)),
                Ok(None) => panic!("language server did not exit after shutdown"),
                Err(error) => panic!("could not wait for language server: {error}"),
            }
        }
        if let Some(reader) = self.reader.take() {
            reader.join().expect("join language server reader");
        }
    }
}

impl Drop for Server {
    fn drop(&mut self) {
        self.stdin.take();
        let _ = self.child.kill();
        let _ = self.child.wait();
        if let Some(reader) = self.reader.take() {
            let _ = reader.join();
        }
    }
}

fn read_message(reader: &mut impl BufRead) -> Result<Option<Value>, String> {
    let mut content_length = None;
    loop {
        let mut line = String::new();
        let read = reader
            .read_line(&mut line)
            .map_err(|error| error.to_string())?;
        if read == 0 {
            return Ok(None);
        }
        if line == "\r\n" || line == "\n" {
            break;
        }
        if let Some(value) = line.strip_prefix("Content-Length:") {
            content_length = Some(
                value
                    .trim()
                    .parse::<usize>()
                    .map_err(|error| error.to_string())?,
            );
        }
    }
    let length = content_length.ok_or_else(|| "LSP message omitted Content-Length".to_string())?;
    let mut body = vec![0; length];
    reader
        .read_exact(&mut body)
        .map_err(|error| error.to_string())?;
    serde_json::from_slice(&body)
        .map(Some)
        .map_err(|error| error.to_string())
}

fn file_uri(path: &Path) -> String {
    url::Url::from_file_path(path)
        .expect("absolute file path")
        .to_string()
}

fn document_request(server: &mut Server, method: &str, uri: &str) -> Value {
    let id = server.request(method, json!({ "textDocument": { "uri": uri } }));
    server.response(id, RESPONSE_TIMEOUT)
}

#[test]
fn file_uris_encode_spaces_and_non_ascii_paths() {
    let dir = TestDir::new("uri space-雪");
    let uri = file_uri(&dir.0.join("Component name.svelte"));
    assert!(uri.contains("uri%20space-%E9%9B%AA"), "{uri}");
    assert!(uri.ends_with("Component%20name.svelte"), "{uri}");
}

/// Malformed at the *protocol* layer rather than the document layer: a frame
/// whose body will not deserialize into a JSON-RPC message. `lsp_server`'s own
/// stdio transport ends its reader thread on the first one, which closes the
/// connection and takes every open document's language features with it — so
/// this is the one robustness case the sibling test above cannot reach, because
/// its inputs are all valid messages carrying invalid Svelte.
#[test]
fn undecodable_protocol_messages_do_not_end_the_session() {
    let dir = TestDir::new("undecodable");
    let uri = file_uri(&dir.0.join("App.svelte"));
    let mut server = Server::start(None, &[]);
    server.open(&uri, "<script>let value = 1;</script>\n<p>{value}</p>\n");

    for body in [
        "{ this is not json",
        "[]",
        "null",
        "42",
        r#"{"jsonrpc":"2.0"}"#,
        r#"{"jsonrpc":"2.0","method":42}"#,
    ] {
        server.write_frame(body.as_bytes());
        server.probe();
    }

    let response = document_request(&mut server, "textDocument/foldingRange", &uri);
    assert!(
        response.get("result").is_some(),
        "no response after undecodable protocol messages: {response}"
    );
    server.shutdown();
}

#[test]
fn malformed_documents_do_not_end_the_session() {
    let dir = TestDir::new("malformed");
    let mut server = Server::start(None, &[]);
    for (index, source) in [
        "<script>let value = {</script><p>{value}</p>",
        "<style>.broken { color: red;</style><div />",
        "{#if ready}<div>{#each items as item}{item}{/if}",
        "<svelte:component this={Thing><span></svelte:component>",
        "<p>{`unterminated ${value}`</p>",
    ]
    .into_iter()
    .enumerate()
    {
        let uri = file_uri(&dir.0.join(format!("Malformed{index}.svelte")));
        server.open(&uri, source);
        server.probe();
    }
    let uri = file_uri(&dir.0.join("Recovered.svelte"));
    server.open(&uri, "<script>let value = 1;</script>\n<p>{value}</p>\n");
    let response = document_request(&mut server, "textDocument/foldingRange", &uri);
    assert!(
        response.get("result").is_some(),
        "no response after malformed input: {response}"
    );
    server.shutdown();
}

#[test]
fn a_mid_edit_parse_error_recovers_in_the_same_document() {
    let dir = TestDir::new("mid-edit");
    let uri = file_uri(&dir.0.join("App.svelte"));
    let mut server = Server::start(None, &[]);
    server.open(&uri, "<script>let answer = 42;</script>\n<p>{answer}</p>\n");
    assert!(
        document_request(&mut server, "textDocument/foldingRange", &uri)
            .get("result")
            .is_some()
    );

    server.change(&uri, 2, "<script>let answer = {</script>\n{#if answer}<p>");
    assert!(
        document_request(&mut server, "textDocument/documentSymbol", &uri)
            .get("result")
            .is_some()
    );

    server.change(
        &uri,
        3,
        "<script>let answer = 42;</script>\n<p>{answer}</p>\n",
    );
    assert!(
        document_request(&mut server, "textDocument/documentSymbol", &uri)
            .get("result")
            .is_some()
    );
    server.probe();
    server.shutdown();
}

#[test]
fn a_cancellation_storm_finishes_every_request_and_preserves_liveness() {
    let dir = TestDir::new("cancel-storm");
    let uri = file_uri(&dir.0.join("App.svelte"));
    let mut server = Server::start(None, &[]);
    server.open(&uri, &"<div class='item'>value</div>\n".repeat(1_000));

    let mut pending = HashSet::new();
    for _ in 0..24 {
        pending.insert(server.request(
            "textDocument/formatting",
            json!({
                "textDocument": { "uri": uri },
                "options": { "tabSize": 2, "insertSpaces": true },
            }),
        ));
    }
    for id in &pending {
        server.notify("$/cancelRequest", json!({ "id": id }));
    }

    let deadline = Instant::now() + Duration::from_secs(20);
    let mut cancelled = 0;
    while !pending.is_empty() {
        let message = server.next_message(deadline);
        if message.get("method").is_some() && message.get("id").is_some() {
            server.answer_server_request(&message);
            continue;
        }
        let Some(id) = message.get("id").and_then(Value::as_i64) else {
            continue;
        };
        if pending.remove(&id) && message["error"]["code"] == -32800 {
            cancelled += 1;
        }
    }
    assert!(cancelled > 0, "the storm did not exercise cancellation");
    server.probe();
    server.shutdown();
}

#[cfg(unix)]
#[test]
fn a_crashed_tsgo_restarts_replays_the_buffer_and_serves_hover() {
    let dir = TestDir::new("tsgo-restart");
    let helper_source = dir.0.join("fake_tsgo.rs");
    let helper = dir.0.join("fake-tsgo");
    let state = dir.0.join("generation");
    let replayed = dir.0.join("replayed");
    fs::write(&helper_source, FAKE_TSGO).expect("write fake tsgo source");
    let rustc = std::env::var_os("RUSTC").unwrap_or_else(|| "rustc".into());
    assert!(
        Command::new(rustc)
            .arg("--edition=2024")
            .arg(&helper_source)
            .arg("-o")
            .arg(&helper)
            .status()
            .expect("run rustc")
            .success(),
        "compile fake tsgo"
    );
    fs::write(dir.0.join("package.json"), "{}").expect("write package.json");
    let source = "<script lang=\"ts\">\nlet answer = 42;\n</script>\n<p>{answer}</p>\n";
    let component = dir.0.join("App.svelte");
    fs::write(&component, source).expect("write component");
    let uri = file_uri(&component);
    let mut server = Server::start(
        Some(&dir.0),
        &[
            ("TSGO_BIN", helper.as_path()),
            ("RSVELTE_TEST_TSGO_STATE", state.as_path()),
        ],
    );
    server.open(&uri, source);

    let deadline = Instant::now() + Duration::from_secs(15);
    let mut recovered = false;
    while Instant::now() < deadline && !recovered {
        let id = server.request(
            "textDocument/hover",
            json!({
                "textDocument": { "uri": uri },
                "position": { "line": 1, "character": 5 },
            }),
        );
        let response = server.response(id, Duration::from_secs(3));
        recovered = response.to_string().contains("generation-2");
        if !recovered {
            thread::sleep(Duration::from_millis(100));
        }
    }
    assert!(recovered, "hover did not recover after the tsgo crash");
    assert_eq!(fs::read_to_string(&state).unwrap().trim(), "2");
    assert_eq!(fs::read_to_string(&replayed).unwrap().trim(), "2");
    server.shutdown();
}

#[cfg(unix)]
const FAKE_TSGO: &str = r###"
use std::fs;
use std::io::{self, BufRead, Write};
use std::path::PathBuf;

fn main() {
    let state = PathBuf::from(std::env::var_os("RSVELTE_TEST_TSGO_STATE").unwrap());
    let generation = fs::read_to_string(&state)
        .ok()
        .and_then(|value| value.trim().parse::<u32>().ok())
        .map_or(1, |value| value + 1);
    fs::write(&state, generation.to_string()).unwrap();
    let stdin = io::stdin();
    let mut input = stdin.lock();
    let stdout = io::stdout();
    let mut output = stdout.lock();
    loop {
        let Some(message) = read_message(&mut input).unwrap() else { return };
        if message.contains(r#""method":"initialize""#) {
            let id = json_id(&message);
            write_message(&mut output, &format!(
                r#"{{"jsonrpc":"2.0","id":{id},"result":{{"capabilities":{{"positionEncoding":"utf-8","hoverProvider":true}}}}}}"#
            )).unwrap();
        } else if message.contains(r#""method":"textDocument/didOpen""#) {
            if generation == 1 {
                std::process::exit(7);
            }
            fs::write(state.with_file_name("replayed"), generation.to_string()).unwrap();
        } else if message.contains(r#""method":"textDocument/hover""#) {
            let id = json_id(&message);
            write_message(&mut output, &format!(
                r#"{{"jsonrpc":"2.0","id":{id},"result":{{"contents":{{"kind":"plaintext","value":"generation-{generation}"}}}}}}"#
            )).unwrap();
        } else if message.contains(r#""method":"shutdown""#) {
            let id = json_id(&message);
            write_message(&mut output, &format!(r#"{{"jsonrpc":"2.0","id":{id},"result":null}}"#)).unwrap();
        } else if message.contains(r#""method":"exit""#) {
            return;
        } else if message.contains(r#""method":""#) && message.contains(r#""id":"#) {
            let id = json_id(&message);
            write_message(&mut output, &format!(r#"{{"jsonrpc":"2.0","id":{id},"result":null}}"#)).unwrap();
        }
    }
}

fn read_message(reader: &mut impl BufRead) -> io::Result<Option<String>> {
    let mut content_length = None;
    loop {
        let mut line = String::new();
        if reader.read_line(&mut line)? == 0 { return Ok(None) }
        if line == "\r\n" { break }
        if let Some(value) = line.strip_prefix("Content-Length:") {
            content_length = Some(value.trim().parse::<usize>().unwrap());
        }
    }
    let mut body = vec![0; content_length.unwrap()];
    reader.read_exact(&mut body)?;
    Ok(Some(String::from_utf8(body).unwrap()))
}

fn write_message(writer: &mut impl Write, body: &str) -> io::Result<()> {
    write!(writer, "Content-Length: {}\r\n\r\n{body}", body.len())?;
    writer.flush()
}

fn json_id(message: &str) -> &str {
    let rest = message.split_once(r#""id":"#).unwrap().1;
    if let Some(rest) = rest.strip_prefix('"') {
        let end = rest.find('"').unwrap();
        &message[message.len() - rest.len() - 1..message.len() - rest.len() + end + 1]
    } else {
        let end = rest.find(|character: char| !character.is_ascii_digit() && character != '-').unwrap_or(rest.len());
        &rest[..end]
    }
}
"###;
