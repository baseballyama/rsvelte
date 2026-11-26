//! The server the editor talks to. It hands the editor's messages to the servers behind it and
//! theirs to the editor, with each request under an id of the side it reaches, so the editor
//! sees one server.

use std::collections::HashMap;

use serde::Deserialize;
use serde_json::value::RawValue;
use tokio::io::{AsyncRead, AsyncWrite, BufReader};
use tokio::sync::mpsc;

use super::rpc::{self, Id, Message};

/// A server behind the router: the end the router writes the server's input to, and the end it
/// reads the server's output from.
pub(super) struct Server {
    pub(super) name: &'static str,
    pub(super) input: Box<dyn AsyncWrite + Send + Unpin>,
    pub(super) output: Box<dyn AsyncRead + Send + Unpin>,
}

enum Event {
    Editor(Message),
    EditorClosed,
    Server(usize, Message),
    ServerClosed(usize),
}

/// Routes between the editor, on `input` and `output`, and `servers` until the editor or every
/// server stops.
pub(super) async fn serve(
    input: impl AsyncRead + Send + Unpin + 'static,
    output: impl AsyncWrite + Send + Unpin + 'static,
    servers: Vec<Server>,
) {
    let (events, mut received) = mpsc::unbounded_channel();
    tokio::spawn(read_all(
        input,
        events.clone(),
        Event::Editor,
        Event::EditorClosed,
    ));
    let (editor, editor_writer) = writer(output);
    let mut router = Router {
        editor,
        servers: Vec::new(),
        names: Vec::new(),
        open: servers.len(),
        next_id: 0,
        requests: HashMap::new(),
        by_editor: HashMap::new(),
        server_requests: HashMap::new(),
    };
    for (index, server) in servers.into_iter().enumerate() {
        tokio::spawn(read_all(
            server.output,
            events.clone(),
            move |message| Event::Server(index, message),
            Event::ServerClosed(index),
        ));
        router.servers.push(Some(writer(server.input).0));
        router.names.push(server.name);
    }
    drop(events);
    while let Some(event) = received.recv().await {
        let go_on = match event {
            Event::Editor(message) => {
                router.on_editor(message);
                true
            }
            Event::EditorClosed => false,
            Event::Server(index, message) => {
                router.on_server(index, message);
                true
            }
            Event::ServerClosed(index) => router.closed(index),
        };
        if !go_on {
            break;
        }
    }
    // The editor's writer ends once it has written what the router queued.
    drop(router);
    drop(editor_writer.await);
}

struct Router {
    editor: mpsc::UnboundedSender<Message>,
    /// `None` for a server that stopped.
    servers: Vec<Option<mpsc::UnboundedSender<Message>>>,
    names: Vec<&'static str>,
    /// How many servers still run.
    open: usize,
    next_id: i64,
    /// The editor's id of each request a server answers, by the server and the id it got.
    requests: HashMap<(usize, Id), Id>,
    /// The server and its id of each request of the editor, for the editor's cancellation.
    by_editor: HashMap<Id, (usize, Id)>,
    /// The server and its id of each request it sent the editor, by the id the editor got.
    server_requests: HashMap<Id, (usize, Id)>,
}

impl Router {
    const fn fresh_id(&mut self) -> Id {
        self.next_id += 1;
        Id::Number(self.next_id)
    }

    fn on_editor(&mut self, mut message: Message) {
        if message.is_response() {
            let Some((server, id)) = message
                .id
                .take()
                .and_then(|id| self.server_requests.remove(&id))
            else {
                return;
            };
            message.id = Some(id);
            self.send(server, message);
            return;
        }
        if let Some(editor_id) = message.id.take() {
            let server = 0;
            let id = self.fresh_id();
            self.requests
                .insert((server, id.clone()), editor_id.clone());
            self.by_editor.insert(editor_id, (server, id.clone()));
            message.id = Some(id);
            self.send(server, message);
            return;
        }
        if message.method.as_deref() == Some("$/cancelRequest") {
            let Some((server, id)) =
                cancelled(&message).and_then(|id| self.by_editor.get(&id).cloned())
            else {
                return;
            };
            message.params = cancellation(&id);
            self.send(server, message);
            return;
        }
        for server in 0..self.servers.len() {
            self.send(server, message.clone());
        }
    }

    fn on_server(&mut self, server: usize, mut message: Message) {
        if message.is_response() {
            let Some(editor_id) = message
                .id
                .take()
                .and_then(|id| self.requests.remove(&(server, id)))
            else {
                return;
            };
            self.by_editor.remove(&editor_id);
            message.id = Some(editor_id);
            self.to_editor(message);
            return;
        }
        if let Some(id) = message.id.take() {
            let editor_id = self.fresh_id();
            self.server_requests.insert(editor_id.clone(), (server, id));
            message.id = Some(editor_id);
        } else if message.method.as_deref() == Some("$/cancelRequest") {
            let asked = cancelled(&message).map(|id| (server, id));
            let Some(editor_id) = (self.server_requests.iter())
                .find(|(_, request)| Some(*request) == asked.as_ref())
                .map(|(editor_id, _)| editor_id.clone())
            else {
                return;
            };
            message.params = cancellation(&editor_id);
        }
        self.to_editor(message);
    }

    /// Answers what `server` left unanswered; whether a server still runs.
    fn closed(&mut self, server: usize) -> bool {
        self.servers[server] = None;
        self.open -= 1;
        let unanswered: Vec<_> = (self.requests.keys())
            .filter(|(of, _)| *of == server)
            .cloned()
            .collect();
        let stopped = format!("rsvelte's {} server stopped", self.names[server]);
        for key in unanswered {
            if let Some(editor_id) = self.requests.remove(&key) {
                self.by_editor.remove(&editor_id);
                // The protocol's InternalError.
                self.to_editor(Message::error(editor_id, -32603, &stopped));
            }
        }
        self.server_requests.retain(|_, (of, _)| *of != server);
        self.open > 0
    }

    /// A queue closes only once its writer stopped, so what is sent to it then is not wanted.
    fn send(&self, server: usize, message: Message) {
        if let Some(Some(input)) = self.servers.get(server) {
            drop(input.send(message));
        }
    }

    fn to_editor(&self, message: Message) {
        drop(self.editor.send(message));
    }
}

/// The id that a `$/cancelRequest` names.
fn cancelled(message: &Message) -> Option<Id> {
    #[derive(Deserialize)]
    struct Cancel {
        id: Id,
    }
    let params = message.params.as_ref()?;
    serde_json::from_str::<Cancel>(params.get())
        .ok()
        .map(|cancel| cancel.id)
}

/// The parameters of a `$/cancelRequest` of `id`.
fn cancellation(id: &Id) -> Option<Box<RawValue>> {
    let id = serde_json::to_string(id).ok()?;
    RawValue::from_string(format!(r#"{{"id":{id}}}"#)).ok()
}

/// Sends each message of `input` as `event`, then `end`. A message that does not decode is
/// dropped, so the next one is still read.
async fn read_all(
    input: impl AsyncRead + Unpin,
    events: mpsc::UnboundedSender<Event>,
    event: impl Fn(Message) -> Event,
    end: Event,
) {
    let mut input = BufReader::new(input);
    while let Ok(Some(body)) = rpc::read(&mut input).await {
        match serde_json::from_slice::<Message>(&body) {
            Ok(message) => {
                if events.send(event(message)).is_err() {
                    return;
                }
            }
            Err(error) => eprintln!("rsvelte lsp: a message that does not decode: {error}"),
        }
    }
    drop(events.send(end));
}

/// A queue of messages to `output`, and the task that writes them until the queue closes.
fn writer(
    mut output: impl AsyncWrite + Send + Unpin + 'static,
) -> (mpsc::UnboundedSender<Message>, tokio::task::JoinHandle<()>) {
    let (sender, mut queue) = mpsc::unbounded_channel::<Message>();
    let task = tokio::spawn(async move {
        while let Some(message) = queue.recv().await {
            if rpc::write(&mut output, &message).await.is_err() {
                return;
            }
        }
    });
    (sender, task)
}

#[cfg(test)]
mod tests;
