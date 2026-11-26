//! `rsvelte lsp`, driven as an editor drives it, against what `rsvelte lint` prints and fixes and
//! what `rsvelte format` writes for the same files.

use std::io::{BufRead, BufReader, Write};
use std::path::Path;
use std::process::{Child, ChildStdin, Command, Stdio};
use std::sync::mpsc::{Receiver, RecvTimeoutError, channel};
use std::time::Duration;

use serde_json::{Value, json};

use crate::Scratch;

/// Long enough for a debug build that starts a `node` for nothing; a hang fails rather than waits.
const PATIENCE: Duration = Duration::from_secs(60);

/// The configuration `rsvelte lint` reads, as oxlint does.
const CONFIG: &str = r#"{ "rules": {
    "svelte/no-useless-mustaches": "error",
    "svelte/button-has-type": "error",
    "no-unused-vars": "warn"
} }"#;

/// A UTF-16 pair before the second mustache, so its column counts code units, not bytes.
const COMPONENT: &str =
    "<script>\n  let unused = 1;\n</script>\n<p>{\"😀\"} {\"x\"}</p>\n<button>b</button>\n";

const UNFORMATTED: &str = "<script>\nlet   a=1\n</script>\n<p   class=\"x\">{a}</p>\n";

/// An editor's end of a running `rsvelte lsp`.
struct Client {
    child: Child,
    input: ChildStdin,
    messages: Receiver<Value>,
    next: u64,
    /// Notifications read while waiting for a response.
    notifications: Vec<Value>,
}

impl Client {
    /// Starts the server in `root` and initializes it with `root` as the workspace folder. `pull`:
    /// the client asks for diagnostics, else the server publishes them.
    fn start(root: &Path, pull: bool) -> (Self, Value) {
        let mut child = Command::new(env!("CARGO_BIN_EXE_rsvelte"))
            .args(["lsp", "--stdio"])
            .current_dir(root)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .spawn()
            .expect("start rsvelte lsp");
        let input = child.stdin.take().expect("stdin");
        let mut output = BufReader::new(child.stdout.take().expect("stdout"));
        let (send, messages) = channel();
        std::thread::spawn(move || {
            while let Some(message) = read_message(&mut output) {
                if send.send(message).is_err() {
                    break;
                }
            }
        });
        let mut client = Self {
            child,
            input,
            messages,
            next: 0,
            notifications: Vec::new(),
        };
        let diagnostics = if pull {
            json!({
                "textDocument": { "diagnostic": {} },
                "workspace": { "diagnostics": { "refreshSupport": true } },
            })
        } else {
            json!({})
        };
        let mut capabilities =
            json!({ "workspace": { "applyEdit": true, "workspaceFolders": true } });
        merge(&mut capabilities, diagnostics);
        let uri = uri(root);
        let initialized = client.request(
            "initialize",
            &json!({
                "processId": null,
                "rootUri": uri,
                "capabilities": capabilities,
                "workspaceFolders": [{ "uri": uri, "name": "root" }],
            }),
        );
        client.notify("initialized", &json!({}));
        (client, initialized)
    }

    fn send(&mut self, message: &Value) {
        let body = message.to_string();
        write!(self.input, "Content-Length: {}\r\n\r\n{body}", body.len()).expect("write");
        self.input.flush().expect("flush");
    }

    fn notify(&mut self, method: &str, parameters: &Value) {
        self.send(&json!({ "jsonrpc": "2.0", "method": method, "params": parameters }));
    }

    /// The result of `method`, answering the server's own requests on the way.
    fn request(&mut self, method: &str, parameters: &Value) -> Value {
        self.next += 1;
        let id = self.next;
        self.send(&json!({ "jsonrpc": "2.0", "id": id, "method": method, "params": parameters }));
        loop {
            let message = self.receive();
            if message.get("id") == Some(&json!(id)) && message.get("method").is_none() {
                assert!(message.get("error").is_none(), "{method}: {message}");
                // A client rejects a response without one, `null` as for `shutdown` too.
                let result = message.get("result");
                return result
                    .unwrap_or_else(|| panic!("{method}: {message}"))
                    .clone();
            }
            self.answer_or_keep(message);
        }
    }

    /// The `params` of the next notification `method`.
    fn notification(&mut self, method: &str) -> Value {
        if let Some(i) = self
            .notifications
            .iter()
            .position(|n| n["method"] == method)
        {
            return self.notifications.remove(i)["params"].clone();
        }
        loop {
            let message = self.receive();
            if message["method"] == method && message.get("id").is_none() {
                return message["params"].clone();
            }
            self.answer_or_keep(message);
        }
    }

    fn receive(&self) -> Value {
        match self.messages.recv_timeout(PATIENCE) {
            Ok(message) => message,
            Err(RecvTimeoutError::Timeout) => panic!("no message from rsvelte lsp"),
            Err(RecvTimeoutError::Disconnected) => panic!("rsvelte lsp exited"),
        }
    }

    /// Answers a request of the server, as VS Code does, or keeps a notification for later.
    fn answer_or_keep(&mut self, message: Value) {
        match (message.get("id"), message.get("method")) {
            (Some(id), Some(method)) => {
                let result = if method == "workspace/configuration" {
                    let asked = message["params"]["items"].as_array().map_or(0, Vec::len);
                    Value::Array(vec![Value::Null; asked])
                } else {
                    Value::Null
                };
                let id = id.clone();
                self.send(&json!({ "jsonrpc": "2.0", "id": id, "result": result }));
            }
            (None, Some(_)) => self.notifications.push(message),
            _ => panic!("an answer to no request: {message}"),
        }
    }

    fn open(&mut self, path: &Path, text: &str) {
        self.notify(
            "textDocument/didOpen",
            &json!({ "textDocument": {
                "uri": uri(path), "languageId": "svelte", "version": 1, "text": text,
            } }),
        );
    }

    /// Shuts the server down as an editor does, and returns its exit code.
    fn exit(mut self) -> Option<i32> {
        self.request("shutdown", &Value::Null);
        self.notify("exit", &Value::Null);
        let status = self.child.wait().expect("wait for rsvelte lsp");
        status.code()
    }
}

fn read_message(output: &mut impl BufRead) -> Option<Value> {
    let mut length = None;
    loop {
        let mut line = String::new();
        if output.read_line(&mut line).ok()? == 0 {
            return None;
        }
        let line = line.trim_end();
        if line.is_empty() {
            break;
        }
        if let Some(value) = line.strip_prefix("Content-Length: ") {
            length = value.parse().ok();
        }
    }
    let mut body = vec![0; length?];
    output.read_exact(&mut body).ok()?;
    serde_json::from_slice(&body).ok()
}

fn merge(into: &mut Value, from: Value) {
    if let (Value::Object(into), Value::Object(from)) = (into, from) {
        into.extend(from);
    }
}

fn uri(path: &Path) -> String {
    format!("file://{}", path.display())
}

/// `text` with LSP `edits` applied, lines and columns read as the protocol reads them.
fn apply(text: &str, edits: &Value) -> String {
    let offset = |position: &Value| -> usize {
        let (line, character) = (
            position["line"]
                .as_u64()
                .expect("as the protocol writes it"),
            position["character"]
                .as_u64()
                .expect("as the protocol writes it"),
        );
        let mut at = 0;
        for _ in 0..line {
            let rest = &text[at..];
            let end = rest.find(['\r', '\n']).expect("the line exists");
            at += end
                + if rest[end..].starts_with("\r\n") {
                    2
                } else {
                    1
                };
        }
        let mut units = 0;
        for (i, c) in text[at..].char_indices() {
            if units >= character as usize || c == '\r' || c == '\n' {
                return at + i;
            }
            units += c.len_utf16();
        }
        text.len()
    };
    let mut edits: Vec<(usize, usize, &str)> =
        (edits.as_array().expect("as the protocol writes it").iter())
            .map(|edit| {
                (
                    offset(&edit["range"]["start"]),
                    offset(&edit["range"]["end"]),
                    edit["newText"].as_str().expect("as the protocol writes it"),
                )
            })
            .collect();
    edits.sort_by_key(|&(start, ..)| std::cmp::Reverse(start));
    let mut out = text.to_owned();
    for (start, end, new) in edits {
        out.replace_range(start..end, new);
    }
    out
}

/// `(line, column, severity, code)` of each problem `rsvelte lint` prints, 1-based, its column in
/// UTF-16 code units as the protocol counts them.
fn linted(root: &Path, file: &str) -> Vec<(u64, u64, String, String)> {
    let text = std::fs::read_to_string(root.join(file)).expect("the linted file");
    let output = Command::new(env!("CARGO_BIN_EXE_rsvelte"))
        .args(["lint", "-f", "json", file])
        .current_dir(root)
        .output()
        .expect("run rsvelte lint");
    let report: Value = serde_json::from_slice(&output.stdout).expect("oxlint's JSON report");
    (report["diagnostics"]
        .as_array()
        .expect("diagnostics")
        .iter())
    .map(|d| {
        let offset = d["labels"][0]["span"]["offset"]
            .as_u64()
            .expect("an offset") as usize;
        let before = &text[..offset];
        let start = before.rfind('\n').map_or(0, |at| at + 1);
        (
            before.matches('\n').count() as u64 + 1,
            before[start..].encode_utf16().count() as u64 + 1,
            d["severity"].as_str().expect("a severity").to_owned(),
            d["code"].as_str().expect("a code").to_owned(),
        )
    })
    .collect()
}

#[test]
fn pulled_diagnostics_are_the_problems_rsvelte_lint_prints() {
    let root = Scratch::new(&[(".oxlintrc.json", CONFIG), ("src/A.svelte", COMPONENT)]);
    let (mut client, initialized) = Client::start(&root, true);
    let capabilities = &initialized["capabilities"];
    assert!(
        capabilities["diagnosticProvider"].is_object(),
        "{capabilities}"
    );
    assert_eq!(capabilities["documentFormattingProvider"], true);
    let file = root.join("src/A.svelte");
    client.open(&file, COMPONENT);
    let report = client.request(
        "textDocument/diagnostic",
        &json!({ "textDocument": { "uri": uri(&file) } }),
    );
    let items = report["items"].as_array().expect("items");
    let served: Vec<(u64, u64, String, String)> = (items.iter())
        .map(|d| {
            let severity = if d["severity"] == 1 {
                "error"
            } else {
                "warning"
            };
            let start = &d["range"]["start"];
            assert_eq!(d["source"], "oxc");
            (
                start["line"].as_u64().expect("as the protocol writes it") + 1,
                start["character"]
                    .as_u64()
                    .expect("as the protocol writes it")
                    + 1,
                severity.to_owned(),
                d["code"]
                    .as_str()
                    .expect("as the protocol writes it")
                    .to_owned(),
            )
        })
        .collect();
    let mut printed = linted(&root, "src/A.svelte");
    let mut served_sorted = served.clone();
    printed.sort();
    served_sorted.sort();
    assert_eq!(served_sorted, printed);
    assert_eq!(served.len(), 4, "{served:?}");
    assert_eq!(client.exit(), Some(0));
}

#[test]
fn published_diagnostics_follow_each_change_and_clear() {
    let root = Scratch::new(&[(".oxlintrc.json", CONFIG), ("src/A.svelte", COMPONENT)]);
    let (mut client, initialized) = Client::start(&root, false);
    assert!(initialized["capabilities"]["diagnosticProvider"].is_null());
    let file = root.join("src/A.svelte");
    client.open(&file, COMPONENT);
    let published = client.notification("textDocument/publishDiagnostics");
    assert_eq!(published["uri"], uri(&file));
    assert_eq!(
        published["diagnostics"].as_array().map(Vec::len),
        Some(4),
        "{published}"
    );
    // The unsaved text, not the file, is what the server lints.
    client.notify(
        "textDocument/didChange",
        &json!({
            "textDocument": { "uri": uri(&file), "version": 2 },
            "contentChanges": [{ "text": "<p>clean</p>\n" }],
        }),
    );
    let published = client.notification("textDocument/publishDiagnostics");
    assert_eq!(published["diagnostics"], json!([]), "{published}");
    assert_eq!(client.exit(), Some(0));
}

#[test]
fn a_quick_fix_and_the_fix_of_all_problems_edit_as_rsvelte_lint_fix_writes() {
    let root = Scratch::new(&[(".oxlintrc.json", CONFIG), ("src/A.svelte", COMPONENT)]);
    let (mut client, _) = Client::start(&root, true);
    let file = root.join("src/A.svelte");
    client.open(&file, COMPONENT);
    // The client asks for the diagnostics before it asks for their actions.
    client.request(
        "textDocument/diagnostic",
        &json!({ "textDocument": { "uri": uri(&file) } }),
    );
    let whole =
        json!({ "start": { "line": 0, "character": 0 }, "end": { "line": 5, "character": 0 } });
    let actions = client.request(
        "textDocument/codeAction",
        &json!({
            "textDocument": { "uri": uri(&file) },
            "range": whole,
            "context": { "diagnostics": [], "only": ["quickfix"] },
        }),
    );
    let preferred = (actions
        .as_array()
        .expect("as the protocol writes it")
        .iter())
    .any(|a| a["isPreferred"] == true);
    assert!(preferred, "{actions}");
    let all = client.request(
        "textDocument/codeAction",
        &json!({
            "textDocument": { "uri": uri(&file) },
            "range": whole,
            "context": { "diagnostics": [], "only": ["source.fixAll.oxc"] },
        }),
    );
    assert_eq!(all[0]["kind"], "source.fixAll.oxc", "{all}");
    let fixed = apply(COMPONENT, &all[0]["edit"]["changes"][uri(&file)]);
    let written = Command::new(env!("CARGO_BIN_EXE_rsvelte"))
        .args(["lint", "--fix", "src/A.svelte"])
        .current_dir(&root)
        .output()
        .expect("run rsvelte lint --fix");
    assert!(written.status.code().is_some(), "{written:?}");
    assert_eq!(fixed, std::fs::read_to_string(&file).expect("fixed file"));
    assert_ne!(fixed, COMPONENT);
    assert_eq!(client.exit(), Some(0));
}

#[test]
fn formatting_edits_the_text_as_rsvelte_format_writes_the_file() {
    // A CRLF file: an edit that started between its CR and LF would lose a CR.
    let crlf = UNFORMATTED.replace('\n', "\r\n");
    let root = Scratch::new(&[("src/A.svelte", UNFORMATTED), ("src/B.svelte", &crlf)]);
    let (mut client, _) = Client::start(&root, true);
    let mut served = Vec::new();
    for (name, text) in [
        ("src/A.svelte", UNFORMATTED),
        ("src/B.svelte", crlf.as_str()),
    ] {
        let file = root.join(name);
        client.open(&file, text);
        let edits = client.request(
            "textDocument/formatting",
            &json!({
                "textDocument": { "uri": uri(&file) },
                "options": { "tabSize": 2, "insertSpaces": true },
            }),
        );
        served.push(apply(text, &edits));
    }
    let status = Command::new(env!("CARGO_BIN_EXE_rsvelte"))
        .args(["format", "src/A.svelte", "src/B.svelte"])
        .current_dir(&root)
        .status()
        .expect("run rsvelte format");
    assert!(status.success());
    let written = ["src/A.svelte", "src/B.svelte"]
        .map(|name| std::fs::read_to_string(root.join(name)).expect("file"));
    assert_eq!(served, written);
    assert_ne!(written[0], UNFORMATTED);
    assert_eq!(client.exit(), Some(0));
}

#[test]
fn a_broken_configuration_is_shown_and_a_fixed_one_is_read_again() {
    let root = Scratch::new(&[
        (".oxlintrc.json", "{ not json"),
        ("src/A.svelte", COMPONENT),
    ]);
    let (mut client, _) = Client::start(&root, true);
    let shown = client.notification("window/showMessage");
    assert_eq!(shown["type"], 1, "{shown}");
    let file = root.join("src/A.svelte");
    client.open(&file, COMPONENT);
    let pull = |client: &mut Client| {
        client.request(
            "textDocument/diagnostic",
            &json!({ "textDocument": { "uri": uri(&file) } }),
        )["items"]
            .clone()
    };
    let before = pull(&mut client);
    std::fs::write(root.join(".oxlintrc.json"), CONFIG).expect("config");
    client.notify(
        "workspace/didChangeWatchedFiles",
        &json!({ "changes": [{ "uri": uri(&root.join(".oxlintrc.json")), "type": 2 }] }),
    );
    let after = pull(&mut client);
    let count = |items: &Value| items.as_array().map_or(0, Vec::len);
    assert_eq!(
        count(&after),
        linted(&root, "src/A.svelte").len(),
        "{after}"
    );
    assert_ne!(before, after);
    assert_eq!(client.exit(), Some(0));
}

#[test]
fn a_file_that_does_not_parse_is_left_as_it_is_without_an_error() {
    // The client would show an error on each save; the lint reports the parse error.
    let root = Scratch::new(&[
        ("a.ts", "let x = ;\n"),
        ("b.js", "let x = ;\n"),
        ("c.svelte", "<p>{</p>\n"),
    ]);
    let (mut client, _) = Client::start(&root, true);
    for name in ["a.ts", "b.js", "c.svelte"] {
        let file = root.join(name);
        client.open(&file, &std::fs::read_to_string(&file).expect("file"));
        let edits = client.request(
            "textDocument/formatting",
            &json!({
                "textDocument": { "uri": uri(&file) },
                "options": { "tabSize": 2, "insertSpaces": true },
            }),
        );
        assert!(
            edits.as_array().is_none_or(Vec::is_empty),
            "{name}: {edits}"
        );
        let report = client.request(
            "textDocument/diagnostic",
            &json!({ "textDocument": { "uri": uri(&file) } }),
        );
        let errors = (report["items"].as_array().expect("items").iter())
            .filter(|d| d["severity"] == 1)
            .count();
        assert!(errors > 0, "{name}: {report}");
    }
    assert_eq!(client.exit(), Some(0));
}
