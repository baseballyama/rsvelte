//! The server the editor talks to. It hands the editor's messages to the servers behind it and
//! theirs to the editor, with each request under an id of the side it reaches, so the editor
//! sees one server.

use std::collections::{BTreeMap, HashMap};
use std::fmt::Write as _;

use serde::Deserialize;
use serde_json::value::RawValue;
use tokio::io::{AsyncRead, AsyncWrite, BufReader};
use tokio::sync::mpsc;

use super::rpc::{self, Id, Message};

/// A server behind the router: the end the router writes the server's input to, and the end it
/// reads the server's output from.
pub(super) struct Server {
    pub(super) name: &'static str,
    pub(super) answers: Answers,
    pub(super) input: Box<dyn AsyncWrite + Send + Unpin>,
    pub(super) output: Box<dyn AsyncRead + Send + Unpin>,
}

/// Which of the editor's requests a server answers.
pub(super) enum Answers {
    /// Each request that no other server answers. The first server answers these.
    Rest,
    /// Only the requests that every server answers.
    Nothing,
    /// The requests of `methods`, on a document whose URI `documents` accepts or on none. The
    /// router answers one on another document with no result, and lends the editor the
    /// `capabilities` of the server's answer to `initialize`.
    Features {
        methods: &'static [&'static str],
        capabilities: &'static [&'static str],
        documents: fn(&str) -> bool,
    },
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
    let (editor, editor_writer) = rpc::writer(output);
    let mut router = Router {
        editor,
        servers: Vec::new(),
        names: Vec::new(),
        answers: Vec::new(),
        open: servers.len(),
        next_id: 0,
        requests: HashMap::new(),
        shared: HashMap::new(),
        by_editor: HashMap::new(),
        server_requests: HashMap::new(),
        published: HashMap::new(),
    };
    for (index, server) in servers.into_iter().enumerate() {
        tokio::spawn(read_all(
            server.output,
            events.clone(),
            move |message| Event::Server(index, message),
            Event::ServerClosed(index),
        ));
        router.servers.push(Some(rpc::writer(server.input).0));
        router.names.push(server.name);
        router.answers.push(server.answers);
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

/// The requests every server answers, so that each starts and stops with the editor. The first
/// server's answer is the editor's.
const EVERY_SERVER: &[&str] = &["initialize", "shutdown"];

struct Router {
    editor: mpsc::UnboundedSender<Message>,
    /// `None` for a server that stopped.
    servers: Vec<Option<mpsc::UnboundedSender<Message>>>,
    names: Vec<&'static str>,
    answers: Vec<Answers>,
    /// How many servers still run.
    open: usize,
    next_id: i64,
    /// What each request a server answers is for, by the server and the id it got.
    requests: HashMap<(usize, Id), Asked>,
    /// Each request of the editor that every server answers, until the last one does.
    shared: HashMap<i64, Shared>,
    /// The server and its id of each request of the editor, for the editor's cancellation.
    by_editor: HashMap<Id, (usize, Id)>,
    /// The server and its id of each request it sent the editor, by the id the editor got.
    server_requests: HashMap<Id, (usize, Id)>,
    /// The diagnostics each server published last for a document, by the server and the URI.
    published: HashMap<(usize, String), Vec<Box<RawValue>>>,
}

/// What a server's answer is for.
enum Asked {
    /// The editor's request of this id, which this server alone answers.
    Alone(Id),
    /// The editor's request that every server answers, by its key in `shared`.
    Shared(i64),
}

struct Shared {
    editor_id: Id,
    /// How many servers have yet to answer.
    waiting: usize,
    /// Each server's answer, by the server.
    answers: Vec<Option<Message>>,
}

impl Router {
    const fn fresh(&mut self) -> i64 {
        self.next_id += 1;
        self.next_id
    }

    fn on_editor(&mut self, mut message: Message) {
        if message.is_response() {
            let Some((server, id)) =
                (message.id.take()).and_then(|id| self.server_requests.remove(&id))
            else {
                return;
            };
            message.id = Some(id);
            self.send(server, message);
            return;
        }
        if let Some(editor_id) = message.id.take() {
            if EVERY_SERVER.contains(&message.method.as_deref().unwrap_or_default()) {
                self.ask_every_server(editor_id, &message);
                return;
            }
            let Some(server) = self.server_of(&message) else {
                self.to_editor(Message::empty(editor_id));
                return;
            };
            let id = Id::Number(self.fresh());
            (self.requests).insert((server, id.clone()), Asked::Alone(editor_id.clone()));
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
            message.parameters = cancellation(&id);
            self.send(server, message);
            return;
        }
        for server in 0..self.servers.len() {
            self.send(server, message.clone());
        }
    }

    /// The server that answers `request`; `None` where none answers it on its document.
    fn server_of(&self, request: &Message) -> Option<usize> {
        let method = request.method.as_deref().unwrap_or_default();
        for (server, answers) in self.answers.iter().enumerate() {
            if let Answers::Features {
                methods, documents, ..
            } = answers
                && methods.contains(&method)
            {
                return document_of(request)
                    .is_none_or(|uri| documents(&uri))
                    .then_some(server);
            }
        }
        Some(0)
    }

    fn ask_every_server(&mut self, editor_id: Id, message: &Message) {
        let key = self.fresh();
        let running: Vec<usize> = (0..self.servers.len())
            .filter(|&server| self.servers[server].is_some())
            .collect();
        self.shared.insert(
            key,
            Shared {
                editor_id,
                waiting: running.len(),
                answers: (0..self.servers.len()).map(|_| None).collect(),
            },
        );
        for server in running {
            let id = Id::Number(self.fresh());
            self.requests
                .insert((server, id.clone()), Asked::Shared(key));
            let mut request = message.clone();
            request.id = Some(id);
            self.send(server, request);
        }
        self.answered(key, 0, None);
    }

    /// Counts the answer of `server`, `None` from a server that stopped, to the request every
    /// server answers, and answers the editor after the last.
    fn answered(&mut self, key: i64, server: usize, answer: Option<Message>) {
        let Some(shared) = self.shared.get_mut(&key) else {
            return;
        };
        if answer.is_some() {
            shared.waiting -= 1;
            shared.answers[server] = answer;
        }
        if shared.waiting > 0 {
            return;
        }
        let Some(shared) = self.shared.remove(&key) else {
            return;
        };
        let stopped = format!("rsvelte's {} server stopped", self.names[0]);
        let mut answers = shared.answers.into_iter();
        let mut answer = (answers.next().flatten())
            .unwrap_or_else(|| Message::error(shared.editor_id.clone(), -32603, &stopped));
        for (lent, server) in answers.zip(&self.answers[1..]) {
            if let (Some(lent), Answers::Features { capabilities, .. }) = (lent, server) {
                answer.result = lend(
                    answer.result.as_deref(),
                    lent.result.as_deref(),
                    capabilities,
                )
                .or(answer.result);
            }
        }
        answer.id = Some(shared.editor_id);
        self.to_editor(answer);
    }

    fn on_server(&mut self, server: usize, mut message: Message) {
        if message.is_response() {
            match message
                .id
                .take()
                .and_then(|id| self.requests.remove(&(server, id)))
            {
                Some(Asked::Alone(editor_id)) => {
                    self.by_editor.remove(&editor_id);
                    message.id = Some(editor_id);
                    self.to_editor(message);
                }
                Some(Asked::Shared(key)) => self.answered(key, server, Some(message)),
                None => {}
            }
            return;
        }
        if let Some(id) = message.id.take() {
            let editor_id = Id::Number(self.fresh());
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
            message.parameters = cancellation(&editor_id);
        } else if message.method.as_deref() == Some("textDocument/publishDiagnostics") {
            // One it cannot read is the editor's to reject.
            if let Some(parameters) = self.published(server, message.parameters.as_deref()) {
                message.parameters = Some(parameters);
            }
        }
        self.to_editor(message);
    }

    /// The parameters that publish every server's diagnostics of the document that `parameters` of
    /// `server` publish.
    fn published(&mut self, server: usize, parameters: Option<&RawValue>) -> Option<Box<RawValue>> {
        #[derive(Deserialize)]
        struct Published {
            uri: String,
            version: Option<i64>,
            diagnostics: Vec<Box<RawValue>>,
        }
        let published: Published = serde_json::from_str(parameters?.get()).ok()?;
        let key = (server, published.uri);
        if published.diagnostics.is_empty() {
            self.published.remove(&key);
        } else {
            self.published.insert(key.clone(), published.diagnostics);
        }
        let uri = key.1;
        let every: Vec<&RawValue> = (0..self.servers.len())
            .filter_map(|of| self.published.get(&(of, uri.clone())))
            .flatten()
            .map(AsRef::as_ref)
            .collect();
        let mut parameters = format!(
            r#"{{"uri":{},"diagnostics":{}"#,
            serde_json::to_string(&uri).ok()?,
            serde_json::to_string(&every).ok()?,
        );
        if let Some(version) = published.version {
            write!(parameters, r#","version":{version}"#).ok()?;
        }
        parameters.push('}');
        RawValue::from_string(parameters).ok()
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
            match self.requests.remove(&key) {
                Some(Asked::Alone(editor_id)) => {
                    self.by_editor.remove(&editor_id);
                    // The protocol's InternalError.
                    self.to_editor(Message::error(editor_id, -32603, &stopped));
                }
                Some(Asked::Shared(shared)) => {
                    if let Some(entry) = self.shared.get_mut(&shared) {
                        entry.waiting -= 1;
                    }
                    self.answered(shared, server, None);
                }
                None => {}
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

/// The URI of the document a request is on, if it names one.
fn document_of(request: &Message) -> Option<String> {
    #[derive(Deserialize)]
    #[serde(rename_all = "camelCase")]
    struct On {
        text_document: Document,
    }
    #[derive(Deserialize)]
    struct Document {
        uri: String,
    }
    let parameters = request.parameters.as_ref()?;
    let on: On = serde_json::from_str(parameters.get()).ok()?;
    Some(on.text_document.uri)
}

/// The answer to `initialize` of `answer` with the `capabilities` of `lent`; `None` where one of
/// them does not read as an answer.
fn lend(
    answer: Option<&RawValue>,
    lent: Option<&RawValue>,
    capabilities: &[&str],
) -> Option<Box<RawValue>> {
    type Object = BTreeMap<String, Box<RawValue>>;
    let mut answer: Object = serde_json::from_str(answer?.get()).ok()?;
    let lent: Object = serde_json::from_str(lent?.get()).ok()?;
    let mut own: Object = serde_json::from_str(answer.get("capabilities")?.get()).ok()?;
    let mut lent: Object = serde_json::from_str(lent.get("capabilities")?.get()).ok()?;
    for capability in capabilities {
        if let Some(value) = lent.remove(*capability) {
            own.insert((*capability).to_owned(), value);
        }
    }
    let own = serde_json::value::to_raw_value(&own).ok()?;
    answer.insert("capabilities".to_owned(), own);
    serde_json::value::to_raw_value(&answer).ok()
}

/// The id that a `$/cancelRequest` names.
fn cancelled(message: &Message) -> Option<Id> {
    #[derive(Deserialize)]
    struct Cancel {
        id: Id,
    }
    let parameters = message.parameters.as_ref()?;
    serde_json::from_str::<Cancel>(parameters.get())
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

#[cfg(test)]
mod tests;
