//! Supervised LSP transport for a `tsgo --lsp -stdio` child process.

use std::collections::{BTreeMap, VecDeque};
use std::ffi::OsString;
use std::fmt;
use std::io::{self, BufReader, BufWriter};
use std::path::PathBuf;
use std::process::{Child, ChildStdin, Command, ExitStatus, Stdio};
use std::thread::{self, JoinHandle};
use std::time::{Duration, Instant};

use crossbeam_channel::{Receiver, Sender, after, select, tick, unbounded};
use lsp_server::{ErrorCode, Message, Notification, Request, RequestId, Response};
use lsp_types::{Uri, WorkspaceFolder};
use serde_json::{Map, Value, json};

use crate::uri::uri_to_path;

const INITIALIZE_ID_PREFIX: &str = "rsvelte-tsgo-initialize";
const SHUTDOWN_ID: &str = "rsvelte-tsgo-shutdown";
const CHILD_POLL_INTERVAL: Duration = Duration::from_millis(50);
const SHUTDOWN_TIMEOUT: Duration = Duration::from_millis(500);

/// Settings returned when tsgo asks its LSP client for configuration.
///
/// tsgo consumes the VS Code-style nested shape, not the flat TypeScript
/// preference names. Construction rejects values with no setting leaf so an
/// accidental `{}` cannot reset all of tsgo's preferences.
#[derive(Clone, Debug, PartialEq)]
pub struct TsgoPreferences(Value);

impl TsgoPreferences {
    /// Validate a nested tsgo configuration value.
    pub fn new(value: Value) -> Result<Self, InvalidPreferences> {
        if !matches!(&value, Value::Object(_)) || !contains_setting(&value) {
            return Err(InvalidPreferences);
        }
        Ok(Self(value))
    }

    #[must_use]
    pub fn as_value(&self) -> &Value {
        &self.0
    }
}

impl Default for TsgoPreferences {
    fn default() -> Self {
        Self(json!({
            "preferences": {
                "importModuleSpecifierEnding": "index"
            },
            "suggest": {
                "autoImports": true
            },
            "inlayHints": {
                "parameterNames": {
                    "enabled": "all",
                    "suppressWhenArgumentMatchesName": false
                },
                "parameterTypes": { "enabled": true },
                "variableTypes": {
                    "enabled": true,
                    "suppressWhenTypeMatchesName": true
                },
                "propertyDeclarationTypes": { "enabled": true },
                "functionLikeReturnTypes": { "enabled": true },
                "enumMemberValues": { "enabled": true }
            },
            "referencesCodeLens": {
                "enabled": true,
                "showOnAllFunctions": true
            },
            "implementationsCodeLens": {
                "enabled": true,
                "showOnInterfaceMethods": true
            }
        }))
    }
}

impl TryFrom<Value> for TsgoPreferences {
    type Error = InvalidPreferences;

    fn try_from(value: Value) -> Result<Self, Self::Error> {
        Self::new(value)
    }
}

impl From<TsgoPreferences> for Value {
    fn from(preferences: TsgoPreferences) -> Self {
        preferences.0
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct InvalidPreferences;

impl fmt::Display for InvalidPreferences {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str("tsgo preferences must be a non-empty nested object")
    }
}

impl std::error::Error for InvalidPreferences {}

fn contains_setting(value: &Value) -> bool {
    match value {
        Value::Object(object) => object.values().any(contains_setting),
        Value::Array(items) => items.iter().any(contains_setting),
        Value::Null => false,
        Value::Bool(_) | Value::Number(_) | Value::String(_) => true,
    }
}

/// Everything needed to recreate the tsgo process after a crash.
#[derive(Clone, Debug)]
pub struct TsgoConfig {
    pub executable: PathBuf,
    /// Arguments inserted before the fixed `--lsp -stdio` pair.
    pub args_prefix: Vec<OsString>,
    pub current_dir: Option<PathBuf>,
    pub root_uri: Option<Uri>,
    pub workspace_folders: Vec<WorkspaceFolder>,
    /// The editor's initialize params, retained except for child-owned fields.
    pub editor_initialize_params: Value,
    /// Raw configuration layers. Final settings are recursively merged as
    /// default → editor → language → shared (`js/ts`).
    pub shared_preferences: Value,
    pub editor_preferences: Value,
    pub typescript_preferences: Value,
    pub javascript_preferences: Value,
    pub restart_delay: Duration,
}

impl TsgoConfig {
    #[must_use]
    pub fn new(executable: impl Into<PathBuf>) -> Self {
        Self {
            executable: executable.into(),
            args_prefix: Vec::new(),
            current_dir: None,
            root_uri: None,
            workspace_folders: Vec::new(),
            editor_initialize_params: json!({}),
            shared_preferences: json!({}),
            editor_preferences: json!({}),
            typescript_preferences: json!({}),
            javascript_preferences: json!({}),
            restart_delay: Duration::from_millis(250),
        }
    }

    fn initialize_params(&self) -> Value {
        initialize_params(self)
    }
}

/// A complete open document body retained for crash recovery.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct OpenBuffer {
    pub uri: Uri,
    pub language_id: String,
    pub version: i32,
    pub text: String,
}

impl OpenBuffer {
    #[must_use]
    pub fn new(
        uri: Uri,
        language_id: impl Into<String>,
        version: i32,
        text: impl Into<String>,
    ) -> Self {
        Self {
            uri,
            language_id: language_id.into(),
            version,
            text: text.into(),
        }
    }
}

/// Messages produced by the supervised child.
#[derive(Clone, Debug)]
pub enum TsgoEvent {
    /// Initialization and open-buffer replay have both completed.
    Ready {
        generation: u64,
        capabilities: Value,
    },
    /// A message not consumed by the lifecycle/configuration layer.
    Message { generation: u64, message: Message },
    /// An unexpected exit, transport failure, or initialization failure.
    Crashed {
        generation: u64,
        status: Option<ExitStatus>,
        error: String,
    },
}

/// The handle used by the language-server loop.
pub struct TsgoClient {
    commands: Sender<ClientCommand>,
    events: Receiver<TsgoEvent>,
    supervisor: Option<JoinHandle<()>>,
}

impl TsgoClient {
    /// Start a supervisor. Child startup and initialization complete
    /// asynchronously and are reported through [`TsgoEvent::Ready`].
    pub fn spawn(config: TsgoConfig) -> io::Result<Self> {
        let (commands, command_receiver) = unbounded();
        let (event_sender, events) = unbounded();
        let supervisor = thread::Builder::new()
            .name("rsvelte-tsgo-supervisor".to_string())
            .spawn(move || supervise(config, command_receiver, event_sender))?;
        Ok(Self {
            commands,
            events,
            supervisor: Some(supervisor),
        })
    }

    /// Receiver suitable for adding directly to the server's `select!` loop.
    #[must_use]
    pub const fn events(&self) -> &Receiver<TsgoEvent> {
        &self.events
    }

    /// Forward an editor request, notification, or response unchanged.
    pub fn forward(&self, message: Message) -> Result<(), TsgoClientClosed> {
        self.send(ClientCommand::Forward(message))
    }

    /// Open a virtual or real document and retain its full body for replay.
    pub fn open_buffer(&self, buffer: OpenBuffer) -> Result<(), TsgoClientClosed> {
        self.send(ClientCommand::Open(buffer))
    }

    /// Replace an open document's full body. Unknown documents are opened.
    pub fn change_buffer(&self, buffer: OpenBuffer) -> Result<(), TsgoClientClosed> {
        self.send(ClientCommand::Change(buffer))
    }

    /// Close a retained document.
    pub fn close_buffer(&self, uri: Uri) -> Result<(), TsgoClientClosed> {
        self.send(ClientCommand::Close(uri))
    }

    /// Replace the four raw settings layers used to answer future
    /// `workspace/configuration` requests.
    pub fn update_configuration(
        &self,
        shared: Value,
        editor: Value,
        typescript: Value,
        javascript: Value,
    ) -> Result<(), TsgoClientClosed> {
        self.send(ClientCommand::UpdateConfiguration {
            shared,
            editor,
            typescript,
            javascript,
        })
    }

    /// Replace the workspace values used by the next child initialize.
    ///
    /// A current directory outside the updated root/folder set is replaced by
    /// the first remaining folder, then the root. This keeps restart working
    /// after the primary workspace folder is removed.
    pub fn update_workspace(
        &self,
        root_uri: Option<Uri>,
        workspace_folders: Vec<WorkspaceFolder>,
        current_dir: Option<PathBuf>,
    ) -> Result<(), TsgoClientClosed> {
        self.send(ClientCommand::UpdateWorkspace {
            root_uri,
            workspace_folders,
            current_dir,
        })
    }

    /// Replace the current process and replay every retained buffer.
    pub fn restart(&self) -> Result<(), TsgoClientClosed> {
        self.send(ClientCommand::Restart)
    }

    /// Stop the child and join the supervisor thread.
    pub fn shutdown(mut self) {
        let _ = self.commands.send(ClientCommand::Shutdown);
        self.join_supervisor();
    }

    fn send(&self, command: ClientCommand) -> Result<(), TsgoClientClosed> {
        self.commands.send(command).map_err(|_| TsgoClientClosed)
    }

    fn join_supervisor(&mut self) {
        if let Some(supervisor) = self.supervisor.take() {
            let _ = supervisor.join();
        }
    }
}

impl Drop for TsgoClient {
    fn drop(&mut self) {
        let _ = self.commands.send(ClientCommand::Shutdown);
        self.join_supervisor();
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct TsgoClientClosed;

impl fmt::Display for TsgoClientClosed {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str("tsgo client supervisor has stopped")
    }
}

impl std::error::Error for TsgoClientClosed {}

enum ClientCommand {
    Forward(Message),
    Open(OpenBuffer),
    Change(OpenBuffer),
    Close(Uri),
    UpdateConfiguration {
        shared: Value,
        editor: Value,
        typescript: Value,
        javascript: Value,
    },
    UpdateWorkspace {
        root_uri: Option<Uri>,
        workspace_folders: Vec<WorkspaceFolder>,
        current_dir: Option<PathBuf>,
    },
    Restart,
    Shutdown,
}

enum ReaderEvent {
    Message(Message),
    Eof,
    Error(String),
}

struct ChildProcess {
    child: Child,
    stdin: Option<BufWriter<ChildStdin>>,
    messages: Receiver<ReaderEvent>,
    reader: Option<JoinHandle<()>>,
}

impl ChildProcess {
    fn spawn(config: &TsgoConfig) -> io::Result<Self> {
        let mut command = Command::new(&config.executable);
        command
            .args(&config.args_prefix)
            .arg("--lsp")
            .arg("-stdio")
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit());
        if let Some(current_dir) = &config.current_dir {
            command.current_dir(current_dir);
        }
        let mut child = command.spawn()?;
        let stdin = child
            .stdin
            .take()
            .ok_or_else(|| io::Error::other("tsgo stdin was not piped"))?;
        let stdout = child
            .stdout
            .take()
            .ok_or_else(|| io::Error::other("tsgo stdout was not piped"))?;
        let (sender, messages) = unbounded();
        let reader = thread::Builder::new()
            .name("rsvelte-tsgo-reader".to_string())
            .spawn(move || {
                let mut stdout = BufReader::new(stdout);
                loop {
                    match Message::read(&mut stdout) {
                        Ok(Some(message)) => {
                            if sender.send(ReaderEvent::Message(message)).is_err() {
                                return;
                            }
                        }
                        Ok(None) => {
                            let _ = sender.send(ReaderEvent::Eof);
                            return;
                        }
                        Err(error) => {
                            let _ = sender.send(ReaderEvent::Error(error.to_string()));
                            return;
                        }
                    }
                }
            })?;
        Ok(Self {
            child,
            stdin: Some(BufWriter::new(stdin)),
            messages,
            reader: Some(reader),
        })
    }

    fn send(&mut self, message: &Message) -> io::Result<()> {
        let stdin = self
            .stdin
            .as_mut()
            .ok_or_else(|| io::Error::new(io::ErrorKind::BrokenPipe, "tsgo stdin is closed"))?;
        message.write(stdin)
    }

    fn try_wait(&mut self) -> io::Result<Option<ExitStatus>> {
        self.child.try_wait()
    }

    fn finish(mut self, kill: bool) -> Option<ExitStatus> {
        self.stdin.take();
        if kill {
            let _ = self.child.kill();
        }
        let status = self.child.wait().ok();
        if let Some(reader) = self.reader.take() {
            let _ = reader.join();
        }
        status
    }

    fn finish_after_exit(mut self, timeout: Duration) -> Option<ExitStatus> {
        self.stdin.take();
        let deadline = Instant::now() + timeout;
        loop {
            match self.child.try_wait() {
                Ok(Some(status)) => {
                    if let Some(reader) = self.reader.take() {
                        let _ = reader.join();
                    }
                    return Some(status);
                }
                Ok(None) if Instant::now() < deadline => {
                    thread::sleep(Duration::from_millis(10));
                }
                Ok(None) | Err(_) => return self.finish(true),
            }
        }
    }
}

struct Failure {
    status: Option<ExitStatus>,
    error: String,
}

enum ProcessOutcome {
    Restart,
    Shutdown,
    Failed(Failure),
}

struct SupervisorState {
    buffers: BTreeMap<String, OpenBuffer>,
    queued: VecDeque<Message>,
    configuration: TsgoConfiguration,
}

fn supervise(mut config: TsgoConfig, commands: Receiver<ClientCommand>, events: Sender<TsgoEvent>) {
    let mut state = SupervisorState {
        buffers: BTreeMap::new(),
        queued: VecDeque::new(),
        configuration: TsgoConfiguration::from_layers(
            &config.shared_preferences,
            &config.editor_preferences,
            &config.typescript_preferences,
            &config.javascript_preferences,
        ),
    };
    let mut generation = 0_u64;

    loop {
        generation += 1;
        let process = match ChildProcess::spawn(&config) {
            Ok(process) => process,
            Err(error) => {
                let _ = events.send(TsgoEvent::Crashed {
                    generation,
                    status: None,
                    error: format!("failed to start tsgo: {error}"),
                });
                match wait_to_restart(&mut config, &commands, &mut state) {
                    ProcessOutcome::Shutdown => return,
                    ProcessOutcome::Restart | ProcessOutcome::Failed(_) => continue,
                }
            }
        };

        match run_process(
            process,
            &mut config,
            generation,
            &commands,
            &events,
            &mut state,
        ) {
            ProcessOutcome::Shutdown => return,
            ProcessOutcome::Restart => {}
            ProcessOutcome::Failed(failure) => {
                let _ = events.send(TsgoEvent::Crashed {
                    generation,
                    status: failure.status,
                    error: failure.error,
                });
                if matches!(
                    wait_to_restart(&mut config, &commands, &mut state),
                    ProcessOutcome::Shutdown
                ) {
                    return;
                }
            }
        }
    }
}

fn run_process(
    mut process: ChildProcess,
    config: &mut TsgoConfig,
    generation: u64,
    commands: &Receiver<ClientCommand>,
    events: &Sender<TsgoEvent>,
    state: &mut SupervisorState,
) -> ProcessOutcome {
    let initialize_id = RequestId::from(format!("{INITIALIZE_ID_PREFIX}-{generation}"));
    let initialize = Message::Request(Request::new(
        initialize_id.clone(),
        "initialize".to_string(),
        config.initialize_params(),
    ));
    if let Err(error) = process.send(&initialize) {
        return failed_process(process, format!("failed to initialize tsgo: {error}"));
    }

    let poll = tick(CHILD_POLL_INTERVAL);
    let capabilities = loop {
        select! {
            recv(commands) -> command => match command {
                Ok(ClientCommand::Shutdown) | Err(_) => {
                    process.finish(true);
                    return ProcessOutcome::Shutdown;
                }
                Ok(ClientCommand::Restart) => {
                    process.finish(true);
                    return ProcessOutcome::Restart;
                }
                Ok(command) => retain_or_queue(command, state, config),
            },
            recv(process.messages) -> message => match message {
                Ok(ReaderEvent::Message(Message::Response(response))) if response.id == initialize_id => {
                    match response.response_result {
                        Ok(result) => match utf8_capabilities(&result) {
                            Ok(capabilities) => break capabilities,
                            Err(error) => return failed_process(process, error),
                        },
                        Err(error) => {
                            return failed_process(
                                process,
                                format!("tsgo rejected initialize: {} ({})", error.message, error.code),
                            );
                        }
                    }
                }
                Ok(ReaderEvent::Message(message)) => {
                    if let Err(error) = handle_child_message(
                        &mut process,
                        &state.configuration,
                        generation,
                        events,
                        message,
                    ) {
                        return failed_process(process, error);
                    }
                }
                Ok(ReaderEvent::Eof) | Err(_) => {
                    return failed_process(process, "tsgo closed stdout during initialize".to_string());
                }
                Ok(ReaderEvent::Error(error)) => {
                    return failed_process(process, format!("invalid message from tsgo: {error}"));
                }
            },
            recv(poll) -> _ => match process.try_wait() {
                Ok(Some(status)) => {
                    process.finish(false);
                    return ProcessOutcome::Failed(Failure {
                        status: Some(status),
                        error: "tsgo exited during initialize".to_string(),
                    });
                }
                Ok(None) => {}
                Err(error) => return failed_process(process, format!("could not inspect tsgo: {error}")),
            }
        }
    };

    let initialized =
        Message::Notification(Notification::new("initialized".to_string(), json!({})));
    if let Err(error) = process.send(&initialized) {
        return failed_process(
            process,
            format!("failed to finish tsgo initialization: {error}"),
        );
    }
    for buffer in state.buffers.values() {
        if let Err(error) = process.send(&did_open(buffer)) {
            return failed_process(process, format!("failed to replay tsgo buffers: {error}"));
        }
    }
    while let Some(message) = state.queued.pop_front() {
        if let Err(error) = process.send(&message) {
            return failed_process(
                process,
                format!("failed to flush queued tsgo message: {error}"),
            );
        }
    }
    let _ = events.send(TsgoEvent::Ready {
        generation,
        capabilities,
    });

    loop {
        select! {
            recv(commands) -> command => match command {
                Ok(ClientCommand::Forward(message)) => {
                    if let Err(error) = process.send(&message) {
                        return failed_process(process, format!("failed to write to tsgo: {error}"));
                    }
                }
                Ok(ClientCommand::Open(buffer)) | Ok(ClientCommand::Change(buffer)) => {
                    let key = buffer.uri.as_str().to_string();
                    let message = if state.buffers.contains_key(&key) {
                        did_change(&buffer)
                    } else {
                        did_open(&buffer)
                    };
                    state.buffers.insert(key, buffer);
                    if let Err(error) = process.send(&message) {
                        return failed_process(process, format!("failed to update tsgo buffer: {error}"));
                    }
                }
                Ok(ClientCommand::Close(uri)) => {
                    if state.buffers.remove(uri.as_str()).is_some()
                        && let Err(error) = process.send(&did_close(&uri))
                    {
                        return failed_process(process, format!("failed to close tsgo buffer: {error}"));
                    }
                }
                Ok(ClientCommand::UpdateConfiguration { shared, editor, typescript, javascript }) => {
                    state.configuration = TsgoConfiguration::from_layers(
                        &shared,
                        &editor,
                        &typescript,
                        &javascript,
                    );
                    if let Err(error) = process.send(&configuration_changed(&state.configuration)) {
                        return failed_process(process, format!("failed to update tsgo configuration: {error}"));
                    }
                }
                Ok(ClientCommand::UpdateWorkspace { root_uri, workspace_folders, current_dir }) => {
                    update_workspace_config(config, root_uri, workspace_folders, current_dir);
                }
                Ok(ClientCommand::Restart) => {
                    process.finish(true);
                    return ProcessOutcome::Restart;
                }
                Ok(ClientCommand::Shutdown) | Err(_) => {
                    graceful_shutdown(process, &state.configuration);
                    return ProcessOutcome::Shutdown;
                }
            },
            recv(process.messages) -> message => match message {
                Ok(ReaderEvent::Message(message)) => {
                    if let Err(error) = handle_child_message(
                        &mut process,
                        &state.configuration,
                        generation,
                        events,
                        message,
                    ) {
                        return failed_process(process, error);
                    }
                }
                Ok(ReaderEvent::Eof) | Err(_) => {
                    return failed_process(process, "tsgo closed stdout".to_string());
                }
                Ok(ReaderEvent::Error(error)) => {
                    return failed_process(process, format!("invalid message from tsgo: {error}"));
                }
            },
            recv(poll) -> _ => match process.try_wait() {
                Ok(Some(status)) => {
                    process.finish(false);
                    return ProcessOutcome::Failed(Failure {
                        status: Some(status),
                        error: "tsgo exited".to_string(),
                    });
                }
                Ok(None) => {}
                Err(error) => return failed_process(process, format!("could not inspect tsgo: {error}")),
            }
        }
    }
}

fn retain_or_queue(command: ClientCommand, state: &mut SupervisorState, config: &mut TsgoConfig) {
    match command {
        ClientCommand::Forward(message) => state.queued.push_back(message),
        ClientCommand::Open(buffer) | ClientCommand::Change(buffer) => {
            state
                .buffers
                .insert(buffer.uri.as_str().to_string(), buffer);
        }
        ClientCommand::Close(uri) => {
            state.buffers.remove(uri.as_str());
        }
        ClientCommand::UpdateConfiguration {
            shared,
            editor,
            typescript,
            javascript,
        } => {
            state.configuration =
                TsgoConfiguration::from_layers(&shared, &editor, &typescript, &javascript);
        }
        ClientCommand::UpdateWorkspace {
            root_uri,
            workspace_folders,
            current_dir,
        } => update_workspace_config(config, root_uri, workspace_folders, current_dir),
        ClientCommand::Restart | ClientCommand::Shutdown => {}
    }
}

fn update_workspace_config(
    config: &mut TsgoConfig,
    root_uri: Option<Uri>,
    workspace_folders: Vec<WorkspaceFolder>,
    current_dir: Option<PathBuf>,
) {
    let mut roots = workspace_folders
        .iter()
        .map(|folder| uri_to_path(folder.uri.as_str()))
        .collect::<Vec<_>>();
    if let Some(root_uri) = &root_uri {
        roots.push(uri_to_path(root_uri.as_str()));
    }
    let current_dir = current_dir
        .filter(|current_dir| roots.iter().any(|root| root == current_dir))
        .or_else(|| roots.into_iter().next());
    config.root_uri = root_uri;
    config.workspace_folders = workspace_folders;
    config.current_dir = current_dir;
}

fn wait_to_restart(
    config: &mut TsgoConfig,
    commands: &Receiver<ClientCommand>,
    state: &mut SupervisorState,
) -> ProcessOutcome {
    let restart = after(config.restart_delay);
    loop {
        select! {
            recv(commands) -> command => match command {
                Ok(ClientCommand::Shutdown) | Err(_) => return ProcessOutcome::Shutdown,
                Ok(ClientCommand::Restart) => return ProcessOutcome::Restart,
                Ok(command) => retain_or_queue(command, state, config),
            },
            recv(restart) -> _ => return ProcessOutcome::Restart,
        }
    }
}

fn failed_process(process: ChildProcess, error: String) -> ProcessOutcome {
    let status = process.finish(true);
    ProcessOutcome::Failed(Failure { status, error })
}

fn graceful_shutdown(mut process: ChildProcess, configuration: &TsgoConfiguration) {
    let shutdown_id = RequestId::from(SHUTDOWN_ID.to_string());
    let request = Message::Request(Request::new(
        shutdown_id.clone(),
        "shutdown".to_string(),
        Value::Null,
    ));
    if process.send(&request).is_err() {
        process.finish(true);
        return;
    }

    let deadline = Instant::now() + SHUTDOWN_TIMEOUT;
    while Instant::now() < deadline {
        let timeout = after(deadline.saturating_duration_since(Instant::now()));
        select! {
            recv(process.messages) -> message => match message {
                Ok(ReaderEvent::Message(Message::Response(response))) if response.id == shutdown_id => {
                    let exit = Message::Notification(Notification::new("exit".to_string(), Value::Null));
                    let _ = process.send(&exit);
                    process.finish_after_exit(SHUTDOWN_TIMEOUT);
                    return;
                }
                Ok(ReaderEvent::Message(message)) => {
                    let _ = handle_child_message(
                        &mut process,
                        configuration,
                        0,
                        &unbounded().0,
                        message,
                    );
                }
                Ok(ReaderEvent::Eof | ReaderEvent::Error(_)) | Err(_) => {
                    process.finish(false);
                    return;
                }
            },
            recv(timeout) -> _ => break,
        }
    }
    process.finish(true);
}

fn handle_child_message(
    process: &mut ChildProcess,
    configuration: &TsgoConfiguration,
    generation: u64,
    events: &Sender<TsgoEvent>,
    message: Message,
) -> Result<(), String> {
    if let Message::Request(request) = &message
        && request.method == "workspace/configuration"
    {
        let response = workspace_configuration_response(request, configuration);
        return process
            .send(&Message::Response(response))
            .map_err(|error| format!("failed to answer tsgo configuration request: {error}"));
    }
    events
        .send(TsgoEvent::Message {
            generation,
            message,
        })
        .map_err(|_| "tsgo event receiver was dropped".to_string())
}

#[derive(Clone)]
struct TsgoConfiguration {
    typescript: TsgoPreferences,
    javascript: TsgoPreferences,
}

fn workspace_configuration_response(
    request: &Request,
    configuration: &TsgoConfiguration,
) -> Response {
    let items = request.params.get("items").and_then(Value::as_array);
    match items {
        Some(items) if !items.is_empty() => Response::new_ok(
            request.id.clone(),
            items
                .iter()
                .map(|item| configuration.for_item(item).as_value().clone())
                .collect::<Vec<_>>(),
        ),
        _ => Response::new_err(
            request.id.clone(),
            ErrorCode::InvalidParams as i32,
            "workspace/configuration requires at least one item".to_string(),
        ),
    }
}

impl TsgoConfiguration {
    fn from_layers(shared: &Value, editor: &Value, typescript: &Value, javascript: &Value) -> Self {
        Self {
            typescript: merged_preferences(editor, typescript, shared),
            javascript: merged_preferences(editor, javascript, shared),
        }
    }

    fn for_item(&self, item: &Value) -> &TsgoPreferences {
        match item
            .get("scopeUri")
            .and_then(Value::as_str)
            .and_then(language_from_uri)
            .or_else(|| {
                item.get("section")
                    .and_then(Value::as_str)
                    .and_then(language_from_section)
            }) {
            Some(ConfigurationLanguage::Javascript) => &self.javascript,
            Some(ConfigurationLanguage::Typescript) | None => &self.typescript,
        }
    }
}

#[derive(Clone, Copy)]
enum ConfigurationLanguage {
    Typescript,
    Javascript,
}

fn language_from_section(section: &str) -> Option<ConfigurationLanguage> {
    let section = section.to_ascii_lowercase();
    if section == "javascript" || section.starts_with("javascript.") {
        Some(ConfigurationLanguage::Javascript)
    } else if section == "typescript" || section.starts_with("typescript.") {
        Some(ConfigurationLanguage::Typescript)
    } else {
        None
    }
}

fn merged_preferences(editor: &Value, language: &Value, shared: &Value) -> TsgoPreferences {
    let mut merged = TsgoPreferences::default().0;
    merge_object_layer(&mut merged, editor);
    merge_object_layer(&mut merged, language);
    merge_object_layer(&mut merged, shared);
    if merged.pointer("/preferences/importModuleSpecifierEnding") == Some(&json!("js")) {
        merged["preferences"]["importModuleSpecifierEnding"] = json!("index");
    }
    TsgoPreferences(merged)
}

fn merge_object_layer(target: &mut Value, layer: &Value) {
    let Value::Object(layer) = layer else {
        return;
    };
    let Value::Object(target) = target else {
        unreachable!("built-in tsgo preferences are an object");
    };
    for (key, value) in layer {
        match (target.get_mut(key), value) {
            (Some(Value::Object(existing)), Value::Object(update)) => {
                merge_maps(existing, update);
            }
            _ => {
                target.insert(key.clone(), value.clone());
            }
        }
    }
}

fn merge_maps(target: &mut Map<String, Value>, layer: &Map<String, Value>) {
    for (key, value) in layer {
        match (target.get_mut(key), value) {
            (Some(Value::Object(existing)), Value::Object(update)) => {
                merge_maps(existing, update);
            }
            _ => {
                target.insert(key.clone(), value.clone());
            }
        }
    }
}

fn language_from_uri(uri: &str) -> Option<ConfigurationLanguage> {
    let path = uri
        .split(['?', '#'])
        .next()
        .unwrap_or(uri)
        .to_ascii_lowercase();
    if [".js", ".jsx", ".mjs", ".cjs"]
        .iter()
        .any(|extension| path.ends_with(extension))
    {
        Some(ConfigurationLanguage::Javascript)
    } else if [".ts", ".tsx", ".mts", ".cts"]
        .iter()
        .any(|extension| path.ends_with(extension))
    {
        Some(ConfigurationLanguage::Typescript)
    } else {
        None
    }
}

fn configuration_changed(configuration: &TsgoConfiguration) -> Message {
    Message::Notification(Notification::new(
        "workspace/didChangeConfiguration".to_string(),
        json!({
            "settings": {
                "typescript": configuration.typescript.as_value(),
                "javascript": configuration.javascript.as_value(),
            }
        }),
    ))
}

fn initialize_params(config: &TsgoConfig) -> Value {
    let mut params = match config.editor_initialize_params.clone() {
        Value::Object(params) => params,
        _ => Map::new(),
    };
    params.insert("processId".to_string(), json!(std::process::id()));
    params.insert(
        "rootUri".to_string(),
        config
            .root_uri
            .as_ref()
            .map_or(Value::Null, |uri| json!(uri)),
    );
    params.insert(
        "workspaceFolders".to_string(),
        json!(config.workspace_folders),
    );

    let capabilities = object_entry(&mut params, "capabilities");
    object_entry(capabilities, "workspace").insert("configuration".to_string(), Value::Bool(true));
    let general = object_entry(capabilities, "general");
    let mut encodings = vec![Value::String("utf-8".to_string())];
    if let Some(existing) = general.get("positionEncodings").and_then(Value::as_array) {
        encodings.extend(
            existing
                .iter()
                .filter(|encoding| encoding.as_str() != Some("utf-8"))
                .cloned(),
        );
    }
    general.insert("positionEncodings".to_string(), Value::Array(encodings));
    Value::Object(params)
}

fn object_entry<'a>(object: &'a mut Map<String, Value>, key: &str) -> &'a mut Map<String, Value> {
    let value = object
        .entry(key.to_string())
        .or_insert_with(|| Value::Object(Map::new()));
    if !value.is_object() {
        *value = Value::Object(Map::new());
    }
    value.as_object_mut().expect("object inserted above")
}

fn utf8_capabilities(initialize_result: &Value) -> Result<Value, String> {
    let capabilities = initialize_result
        .get("capabilities")
        .cloned()
        .ok_or_else(|| "tsgo initialize result omitted capabilities".to_string())?;
    match capabilities.get("positionEncoding").and_then(Value::as_str) {
        Some("utf-8") => Ok(capabilities),
        Some(encoding) => Err(format!(
            "tsgo negotiated {encoding}, but the projection mapper requires utf-8"
        )),
        None => Err("tsgo did not negotiate utf-8 position encoding".to_string()),
    }
}

fn did_open(buffer: &OpenBuffer) -> Message {
    Message::Notification(Notification::new(
        "textDocument/didOpen".to_string(),
        json!({
            "textDocument": {
                "uri": buffer.uri,
                "languageId": buffer.language_id,
                "version": buffer.version,
                "text": buffer.text,
            }
        }),
    ))
}

fn did_change(buffer: &OpenBuffer) -> Message {
    Message::Notification(Notification::new(
        "textDocument/didChange".to_string(),
        json!({
            "textDocument": {
                "uri": buffer.uri,
                "version": buffer.version,
            },
            "contentChanges": [{ "text": buffer.text }]
        }),
    ))
}

fn did_close(uri: &Uri) -> Message {
    Message::Notification(Notification::new(
        "textDocument/didClose".to_string(),
        json!({ "textDocument": { "uri": uri } }),
    ))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::str::FromStr;
    use std::sync::atomic::{AtomicU64, Ordering};

    static NEXT_TEMP: AtomicU64 = AtomicU64::new(0);

    #[test]
    fn preferences_reject_empty_nested_settings() {
        assert_eq!(
            TsgoPreferences::new(json!({})).unwrap_err(),
            InvalidPreferences
        );
        assert_eq!(
            TsgoPreferences::new(json!({ "preferences": {} })).unwrap_err(),
            InvalidPreferences
        );
        assert!(TsgoPreferences::new(json!({ "suggest": { "autoImports": true } })).is_ok());
    }

    #[test]
    fn initialize_forces_utf8_first_and_preserves_editor_capabilities() {
        let mut config = TsgoConfig::new("tsgo");
        config.root_uri = Some(Uri::from_str("file:///workspace").unwrap());
        config.workspace_folders = vec![WorkspaceFolder {
            uri: Uri::from_str("file:///workspace").unwrap(),
            name: "workspace".to_string(),
        }];
        config.editor_initialize_params = json!({
            "clientInfo": { "name": "test-editor" },
            "capabilities": {
                "general": { "positionEncodings": ["utf-16", "utf-8"] },
                "textDocument": { "hover": { "contentFormat": ["markdown"] } }
            }
        });

        let params = config.initialize_params();
        assert_eq!(
            params.pointer("/capabilities/general/positionEncodings"),
            Some(&json!(["utf-8", "utf-16"]))
        );
        assert_eq!(
            params.pointer("/capabilities/workspace/configuration"),
            Some(&Value::Bool(true))
        );
        assert_eq!(
            params.pointer("/rootUri"),
            Some(&json!("file:///workspace"))
        );
        assert_eq!(
            params.pointer("/workspaceFolders/0/name"),
            Some(&json!("workspace"))
        );
        assert_eq!(
            params.pointer("/clientInfo/name"),
            Some(&json!("test-editor"))
        );
        assert_eq!(
            params.pointer("/capabilities/textDocument/hover/contentFormat/0"),
            Some(&json!("markdown"))
        );
    }

    #[test]
    fn workspace_update_replaces_a_removed_primary_current_dir() {
        let primary = Uri::from_str("file:///workspace/primary").unwrap();
        let remaining = Uri::from_str("file:///workspace/remaining").unwrap();
        let mut config = TsgoConfig::new("tsgo");
        config.current_dir = Some(uri_to_path(primary.as_str()));
        config.root_uri = Some(primary.clone());
        config.workspace_folders = vec![WorkspaceFolder {
            uri: primary,
            name: "primary".to_string(),
        }];

        let old_current_dir = config.current_dir.clone();
        update_workspace_config(
            &mut config,
            Some(remaining.clone()),
            vec![WorkspaceFolder {
                uri: remaining.clone(),
                name: "remaining".to_string(),
            }],
            old_current_dir,
        );

        assert_eq!(config.root_uri, Some(remaining.clone()));
        assert_eq!(config.workspace_folders[0].uri, remaining);
        assert_eq!(
            config.current_dir,
            Some(PathBuf::from("/workspace/remaining"))
        );
    }

    #[test]
    fn configuration_repeats_the_nested_preferences_per_item() {
        let typescript = TsgoPreferences::new(json!({
            "preferences": { "importModuleSpecifierEnding": "index" },
            "suggest": { "autoImports": true },
            "kind": "typescript"
        }))
        .unwrap();
        let javascript = TsgoPreferences::new(json!({ "kind": "javascript" })).unwrap();
        let configuration = TsgoConfiguration {
            typescript,
            javascript,
        };
        let request = Request::new(
            7.into(),
            "workspace/configuration".to_string(),
            json!({ "items": [{ "section": "typescript" }, { "section": "javascript" }] }),
        );
        let response = workspace_configuration_response(&request, &configuration);
        let result = response.response_result.unwrap();
        assert_eq!(result.as_array().unwrap().len(), 2);
        assert_eq!(
            result.pointer("/1/preferences/importModuleSpecifierEnding"),
            None
        );
        assert_eq!(result.pointer("/1/kind"), Some(&json!("javascript")));
    }

    #[test]
    fn configuration_uses_scope_uri_then_typescript_default_for_unknown_sections() {
        let configuration = TsgoConfiguration {
            typescript: TsgoPreferences::new(json!({ "kind": "typescript" })).unwrap(),
            javascript: TsgoPreferences::new(json!({ "kind": "javascript" })).unwrap(),
        };
        let request = Request::new(
            8.into(),
            "workspace/configuration".to_string(),
            json!({
                "items": [
                    { "section": "unknown", "scopeUri": "file:///src/main.jsx" },
                    { "section": "unknown", "scopeUri": "file:///src/App.svelte.tsx" },
                    { "section": "unknown" }
                ]
            }),
        );
        let result = workspace_configuration_response(&request, &configuration)
            .response_result
            .unwrap();
        assert_eq!(result.pointer("/0/kind"), Some(&json!("javascript")));
        assert_eq!(result.pointer("/1/kind"), Some(&json!("typescript")));
        assert_eq!(result.pointer("/2/kind"), Some(&json!("typescript")));
    }

    #[test]
    fn configuration_merges_layers_and_returns_one_value_for_all_scoped_sections() {
        let configuration = TsgoConfiguration::from_layers(
            &json!({
                "preferences": { "importModuleSpecifierEnding": "js" },
                "priority": "shared"
            }),
            &json!({
                "priority": "editor",
                "editorOnly": true,
                "nested": { "editor": true }
            }),
            &json!({
                "priority": "typescript",
                "nested": { "typescript": true }
            }),
            &json!({ "priority": "javascript" }),
        );
        let items = ["js/ts", "typescript", "javascript", "editor"]
            .into_iter()
            .map(|section| {
                json!({
                    "section": section,
                    "scopeUri": "file:///src/main.js"
                })
            })
            .collect::<Vec<_>>();
        let request = Request::new(
            9.into(),
            "workspace/configuration".to_string(),
            json!({ "items": items }),
        );
        let result = workspace_configuration_response(&request, &configuration)
            .response_result
            .unwrap();
        let items = result.as_array().unwrap();
        assert!(items.windows(2).all(|pair| pair[0] == pair[1]));
        assert_eq!(result.pointer("/0/priority"), Some(&json!("shared")));
        assert_eq!(result.pointer("/0/editorOnly"), Some(&Value::Bool(true)));
        assert_eq!(
            result.pointer("/0/preferences/importModuleSpecifierEnding"),
            Some(&json!("index"))
        );
    }

    #[test]
    fn configuration_refuses_an_empty_item_list() {
        let request = Request::new(
            7.into(),
            "workspace/configuration".to_string(),
            json!({ "items": [] }),
        );
        let defaults = TsgoConfiguration {
            typescript: TsgoPreferences::default(),
            javascript: TsgoPreferences::default(),
        };
        let response = workspace_configuration_response(&request, &defaults);
        assert_eq!(
            response.response_result.unwrap_err().code,
            ErrorCode::InvalidParams as i32
        );
    }

    #[cfg(unix)]
    #[test]
    fn crash_restarts_and_replays_open_buffers() {
        let temp = unique_temp_dir();
        fs::create_dir_all(&temp).unwrap();
        let state = temp.join("generation");
        let remaining = temp.join("remaining");
        fs::create_dir_all(&remaining).unwrap();
        let remaining_uri = crate::uri::path_to_uri(&remaining).unwrap();
        let executable = temp.join("fake-tsgo");
        let helper = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("tests/support/fake_tsgo.rs");
        let rustc = std::env::var_os("RUSTC").unwrap_or_else(|| OsString::from("rustc"));
        assert!(
            Command::new(rustc)
                .arg("--edition=2024")
                .arg(helper)
                .arg("-o")
                .arg(&executable)
                .status()
                .unwrap()
                .success()
        );

        let mut config = TsgoConfig::new(&executable);
        config.args_prefix.push(state.clone().into_os_string());
        config
            .args_prefix
            .push(OsString::from(remaining_uri.as_str()));
        config.current_dir = Some(temp.clone());
        config.root_uri = Some(Uri::from_str("file:///workspace").unwrap());
        config.editor_initialize_params = json!({
            "capabilities": { "general": { "positionEncodings": ["utf-16"] } }
        });
        config.restart_delay = Duration::from_millis(10);
        let client = TsgoClient::spawn(config).unwrap();

        let first = recv_event(&client, Duration::from_secs(5));
        assert!(
            matches!(first, TsgoEvent::Ready { generation: 1, .. }),
            "unexpected first event: {first:?}"
        );
        let uri = Uri::from_str("file:///workspace/App.svelte.tsx").unwrap();
        client
            .open_buffer(OpenBuffer::new(
                uri,
                "typescriptreact",
                4,
                "export default 42;",
            ))
            .unwrap();

        let mut crashed = false;
        let mut ready = false;
        let mut replayed = false;
        let deadline = Instant::now() + Duration::from_secs(10);
        while Instant::now() < deadline && !(crashed && ready && replayed) {
            match recv_event(&client, deadline.saturating_duration_since(Instant::now())) {
                TsgoEvent::Crashed {
                    generation: 1,
                    status: Some(status),
                    ..
                } => {
                    assert_eq!(status.code(), Some(7));
                    crashed = true;
                }
                TsgoEvent::Ready { generation: 2, .. } => ready = true,
                TsgoEvent::Message {
                    generation: 2,
                    message: Message::Notification(notification),
                } if notification.method == "$/test/replayed" => {
                    assert_eq!(notification.params["version"], 4);
                    assert_eq!(notification.params["text"], "export default 42;");
                    replayed = true;
                }
                _ => {}
            }
        }
        assert!(crashed && ready && replayed);

        client
            .update_configuration(
                json!({}),
                json!({}),
                json!({ "kind": "updated-typescript" }),
                json!({ "kind": "updated-javascript" }),
            )
            .unwrap();
        let deadline = Instant::now() + Duration::from_secs(5);
        loop {
            let TsgoEvent::Message {
                generation: 2,
                message: Message::Notification(notification),
            } = recv_event(&client, deadline.saturating_duration_since(Instant::now()))
            else {
                continue;
            };
            if notification.method == "$/test/configUpdated" {
                break;
            }
        }

        client
            .update_workspace(
                Some(remaining_uri.clone()),
                vec![WorkspaceFolder {
                    uri: remaining_uri,
                    name: "remaining".to_string(),
                }],
                Some(temp.clone()),
            )
            .unwrap();
        client.restart().unwrap();

        let mut ready = false;
        let mut replayed = false;
        let deadline = Instant::now() + Duration::from_secs(5);
        while Instant::now() < deadline && !(ready && replayed) {
            match recv_event(&client, deadline.saturating_duration_since(Instant::now())) {
                TsgoEvent::Ready { generation: 3, .. } => ready = true,
                TsgoEvent::Message {
                    generation: 3,
                    message: Message::Notification(notification),
                } if notification.method == "$/test/replayed" => {
                    assert_eq!(notification.params["generation"], 3);
                    assert_eq!(notification.params["version"], 4);
                    assert_eq!(notification.params["text"], "export default 42;");
                    replayed = true;
                }
                _ => {}
            }
        }
        assert!(ready && replayed);
        client.shutdown();
        let _ = fs::remove_dir_all(temp);
    }

    #[cfg(unix)]
    fn recv_event(client: &TsgoClient, timeout: Duration) -> TsgoEvent {
        client
            .events()
            .recv_timeout(timeout)
            .expect("timed out waiting for tsgo event")
    }

    #[cfg(unix)]
    fn unique_temp_dir() -> PathBuf {
        std::env::temp_dir().join(format!(
            "rsvelte-tsgo-client-{}-{}",
            std::process::id(),
            NEXT_TEMP.fetch_add(1, Ordering::Relaxed)
        ))
    }
}
