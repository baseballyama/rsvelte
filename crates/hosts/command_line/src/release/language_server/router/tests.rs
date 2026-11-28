use std::time::Duration;

use serde_json::{Value, json};
use tokio::io::{BufReader, DuplexStream, ReadHalf, WriteHalf};

use super::{Answers, Server, serve};
use crate::release::language_server::rpc;

/// One side of a transport, as a test drives it.
struct Peer {
    input: BufReader<ReadHalf<DuplexStream>>,
    output: WriteHalf<DuplexStream>,
}

impl Peer {
    async fn send(&mut self, message: Value) {
        let message = serde_json::from_value(message).unwrap();
        rpc::write(&mut self.output, &message).await.unwrap();
    }

    /// The next message; a message that never comes fails the test instead of holding it.
    async fn receive(&mut self) -> Value {
        let read = tokio::time::timeout(Duration::from_secs(10), rpc::read(&mut self.input));
        let body = read.await.expect("a message in time").unwrap().unwrap();
        serde_json::from_slice(&body).unwrap()
    }
}

fn peer(stream: DuplexStream) -> Peer {
    let (input, output) = tokio::io::split(stream);
    Peer {
        input: BufReader::new(input),
        output,
    }
}

/// The editor and `count` servers, with the router between them: the first answers the editor's
/// requests.
fn routed_to(count: usize) -> (Peer, Vec<Peer>, tokio::task::JoinHandle<()>) {
    let answers = (0..count)
        .map(|server| {
            if server == 0 {
                Answers::Rest
            } else {
                Answers::Nothing
            }
        })
        .collect();
    routed_with(answers)
}

/// The editor and a server of each of `answers`, with the router between them.
fn routed_with(answers: Vec<Answers>) -> (Peer, Vec<Peer>, tokio::task::JoinHandle<()>) {
    let (editor, editor_end) = tokio::io::duplex(1 << 16);
    let (editor_input, editor_output) = tokio::io::split(editor_end);
    let mut servers = Vec::new();
    let mut ends = Vec::new();
    for answers in answers {
        let (server, server_end) = tokio::io::duplex(1 << 16);
        let (server_output, server_input) = tokio::io::split(server_end);
        ends.push(Server {
            name: "test",
            answers,
            input: Box::new(server_input),
            output: Box::new(server_output),
        });
        servers.push(peer(server));
    }
    let routing = tokio::spawn(serve(editor_input, editor_output, ends));
    (peer(editor), servers, routing)
}

/// The editor and a server, with the router between them.
fn routed() -> (Peer, Peer, tokio::task::JoinHandle<()>) {
    let (editor, mut servers, routing) = routed_to(1);
    (editor, servers.remove(0), routing)
}

#[tokio::test]
async fn the_editor_gets_the_answer_under_its_own_id() {
    let (mut editor, mut server, _routing) = routed();
    editor
        .send(json!({ "jsonrpc": "2.0", "id": "a", "method": "m", "params": [1] }))
        .await;
    let request = server.receive().await;
    assert_eq!(request["method"], "m");
    assert_eq!(request["params"], json!([1]));
    assert!(request["id"].is_number());
    server
        .send(json!({ "jsonrpc": "2.0", "id": request["id"], "result": { "x": 2 } }))
        .await;
    assert_eq!(
        editor.receive().await,
        json!({ "jsonrpc": "2.0", "id": "a", "result": { "x": 2 } }),
    );
}

#[tokio::test]
async fn the_server_gets_the_answer_to_its_request_under_its_own_id() {
    let (mut editor, mut server, _routing) = routed();
    server
        .send(json!({ "jsonrpc": "2.0", "id": "s", "method": "workspace/configuration" }))
        .await;
    let request = editor.receive().await;
    assert_eq!(request["method"], "workspace/configuration");
    editor
        .send(json!({ "jsonrpc": "2.0", "id": request["id"], "result": [] }))
        .await;
    assert_eq!(
        server.receive().await,
        json!({ "jsonrpc": "2.0", "id": "s", "result": [] }),
    );
}

#[tokio::test]
async fn a_cancellation_names_the_id_the_server_got() {
    let (mut editor, mut server, _routing) = routed();
    editor
        .send(json!({ "jsonrpc": "2.0", "id": 7, "method": "m" }))
        .await;
    let request = server.receive().await;
    editor
        .send(json!({ "jsonrpc": "2.0", "method": "$/cancelRequest", "params": { "id": 7 } }))
        .await;
    assert_eq!(
        server.receive().await,
        json!({ "jsonrpc": "2.0", "method": "$/cancelRequest", "params": { "id": request["id"] } }),
    );
}

#[tokio::test]
async fn notifications_pass_both_ways() {
    let (mut editor, mut server, _routing) = routed();
    let opened =
        json!({ "jsonrpc": "2.0", "method": "textDocument/didOpen", "params": { "a": 1 } });
    editor.send(opened.clone()).await;
    assert_eq!(server.receive().await, opened);
    let published =
        json!({ "jsonrpc": "2.0", "method": "textDocument/publishDiagnostics", "params": {} });
    server.send(published.clone()).await;
    assert_eq!(editor.receive().await, published);
}

#[tokio::test]
async fn a_server_that_stops_leaves_no_request_unanswered() {
    let (mut editor, mut server, routing) = routed();
    editor
        .send(json!({ "jsonrpc": "2.0", "id": 9, "method": "m" }))
        .await;
    server.receive().await;
    drop(server);
    let answer = editor.receive().await;
    assert_eq!(answer["id"], 9);
    assert_eq!(answer["error"]["code"], -32603);
    // The router stops with its last server.
    routing.await.unwrap();
}

#[tokio::test]
async fn every_server_answers_initialize_and_the_editor_gets_the_first_ones_answer() {
    let (mut editor, mut servers, _routing) = routed_to(2);
    editor
        .send(json!({ "jsonrpc": "2.0", "id": "i", "method": "initialize", "params": {} }))
        .await;
    let first = servers[0].receive().await;
    let second = servers[1].receive().await;
    assert_eq!(
        (&first["method"], &second["method"]),
        (&json!("initialize"), &json!("initialize"))
    );
    servers[1]
        .send(json!({ "jsonrpc": "2.0", "id": second["id"], "result": { "from": 1 } }))
        .await;
    servers[0]
        .send(json!({ "jsonrpc": "2.0", "id": first["id"], "result": { "from": 0 } }))
        .await;
    assert_eq!(
        editor.receive().await,
        json!({ "jsonrpc": "2.0", "id": "i", "result": { "from": 0 } }),
    );
}

#[tokio::test]
async fn any_other_request_reaches_the_first_server_alone_and_a_notification_every_server() {
    let (mut editor, mut servers, _routing) = routed_to(2);
    editor
        .send(json!({ "jsonrpc": "2.0", "id": 1, "method": "textDocument/formatting" }))
        .await;
    let opened = json!({ "jsonrpc": "2.0", "method": "textDocument/didOpen", "params": {} });
    editor.send(opened.clone()).await;
    assert_eq!(
        servers[0].receive().await["method"],
        "textDocument/formatting"
    );
    assert_eq!(servers[0].receive().await, opened);
    // The second server's first message is the notification.
    assert_eq!(servers[1].receive().await, opened);
}

#[tokio::test]
async fn the_editor_gets_every_servers_diagnostics_of_a_document_together() {
    let (mut editor, mut servers, _routing) = routed_to(2);
    let publish = |diagnostics: Value| {
        json!({
            "jsonrpc": "2.0",
            "method": "textDocument/publishDiagnostics",
            "params": { "uri": "file:///a", "diagnostics": diagnostics },
        })
    };
    servers[0]
        .send(publish(json!([{ "message": "lint" }])))
        .await;
    assert_eq!(
        editor.receive().await,
        publish(json!([{ "message": "lint" }]))
    );
    servers[1]
        .send(publish(json!([{ "message": "type" }])))
        .await;
    assert_eq!(
        editor.receive().await,
        publish(json!([{ "message": "lint" }, { "message": "type" }])),
    );
    servers[0].send(publish(json!([]))).await;
    assert_eq!(
        editor.receive().await,
        publish(json!([{ "message": "type" }]))
    );
}

#[tokio::test]
async fn a_second_server_that_stopped_does_not_hold_the_shutdown() {
    let (mut editor, mut servers, _routing) = routed_to(2);
    editor
        .send(json!({ "jsonrpc": "2.0", "id": 5, "method": "shutdown" }))
        .await;
    let first = servers[0].receive().await;
    servers[1].receive().await;
    drop(servers.remove(1));
    servers[0]
        .send(json!({ "jsonrpc": "2.0", "id": first["id"], "result": null }))
        .await;
    assert_eq!(
        editor.receive().await,
        json!({ "jsonrpc": "2.0", "id": 5, "result": null }),
    );
}

/// A server that answers hover on components alone.
fn hovers() -> Answers {
    Answers::Features {
        methods: &["textDocument/hover"],
        capabilities: &["hoverProvider"],
        documents: |uri| uri.ends_with(".svelte"),
    }
}

#[tokio::test]
async fn a_feature_on_its_documents_goes_to_its_server_and_none_answers_others() {
    let (mut editor, mut servers, _routing) = routed_with(vec![Answers::Rest, hovers()]);
    let hover = |id: u64, uri: &str| {
        json!({ "jsonrpc": "2.0", "id": id, "method": "textDocument/hover",
                "params": { "textDocument": { "uri": uri }, "position": { "line": 0, "character": 0 } } })
    };
    editor.send(hover(1, "file:///a/App.svelte")).await;
    let request = servers[1].receive().await;
    assert_eq!(
        request["params"]["textDocument"]["uri"],
        "file:///a/App.svelte"
    );
    servers[1]
        .send(json!({ "jsonrpc": "2.0", "id": request["id"], "result": { "contents": "n" } }))
        .await;
    assert_eq!(
        editor.receive().await,
        json!({ "jsonrpc": "2.0", "id": 1, "result": { "contents": "n" } }),
    );
    editor.send(hover(2, "file:///a/main.ts")).await;
    assert_eq!(
        editor.receive().await,
        json!({ "jsonrpc": "2.0", "id": 2, "result": null }),
    );
    // Any other request is the first server's.
    editor
        .send(
            json!({ "jsonrpc": "2.0", "id": 3, "method": "textDocument/formatting",
                      "params": { "textDocument": { "uri": "file:///a/App.svelte" } } }),
        )
        .await;
    assert_eq!(
        servers[0].receive().await["method"],
        "textDocument/formatting"
    );
}

#[tokio::test]
async fn the_editor_gets_the_capabilities_a_feature_server_lends() {
    let (mut editor, mut servers, _routing) = routed_with(vec![Answers::Rest, hovers()]);
    editor
        .send(json!({ "jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {} }))
        .await;
    let answers = [
        json!({ "capabilities": { "documentFormattingProvider": true }, "serverInfo": { "name": "lint" } }),
        json!({ "capabilities": { "hoverProvider": true, "documentFormattingProvider": false } }),
    ];
    for (server, answer) in servers.iter_mut().zip(answers) {
        let request = server.receive().await;
        server
            .send(json!({ "jsonrpc": "2.0", "id": request["id"], "result": answer }))
            .await;
    }
    assert_eq!(
        editor.receive().await,
        json!({ "jsonrpc": "2.0", "id": 1, "result": {
            "capabilities": { "documentFormattingProvider": true, "hoverProvider": true },
            "serverInfo": { "name": "lint" },
        } }),
    );
}
