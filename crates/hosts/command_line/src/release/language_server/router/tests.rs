use serde_json::{Value, json};
use tokio::io::{BufReader, DuplexStream, ReadHalf, WriteHalf};

use super::{Server, serve};
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

    async fn receive(&mut self) -> Value {
        let body = rpc::read(&mut self.input).await.unwrap().unwrap();
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

/// The editor and a server, with the router between them.
fn routed() -> (Peer, Peer, tokio::task::JoinHandle<()>) {
    let (editor, editor_end) = tokio::io::duplex(1 << 16);
    let (server, server_end) = tokio::io::duplex(1 << 16);
    let (editor_input, editor_output) = tokio::io::split(editor_end);
    let (server_output, server_input) = tokio::io::split(server_end);
    let server_end = Server {
        name: "test",
        input: Box::new(server_input),
        output: Box::new(server_output),
    };
    let routing = tokio::spawn(serve(editor_input, editor_output, vec![server_end]));
    (peer(editor), peer(server), routing)
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
