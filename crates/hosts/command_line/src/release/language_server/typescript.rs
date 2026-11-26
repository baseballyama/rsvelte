//! TypeScript's features in Svelte components, such as hover and completion, from the language
//! server of the type checker that `rsvelte typecheck` runs. The checker reads each component
//! through the content mapper the check reads it through, from a tsconfig that extends the
//! folder's and exists only in the checker's memory.

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::process::Stdio;

use oxc_language_server::uri_utils::file_path_to_uri;
use rsvelte_typescript_check::{MappedLanguages, TypeChecker, TypeCheckers};
use serde::Deserialize;
use serde_json::value::RawValue;
use tokio::io::{AsyncRead, AsyncWrite, BufReader};
use tokio::sync::mpsc;
use tower_lsp_server::gen_lsp_types::InitializeParams;

use super::folders::{Folder, folders};
use super::rpc::{self, Id, Message};
use crate::configuration;

/// The requests the checker answers for the editor.
pub(super) const METHODS: &[&str] = &[
    "textDocument/hover",
    "textDocument/completion",
    "completionItem/resolve",
    "textDocument/signatureHelp",
    "textDocument/definition",
    "textDocument/typeDefinition",
    "textDocument/implementation",
    "textDocument/references",
    "textDocument/documentHighlight",
    "textDocument/prepareRename",
    "textDocument/rename",
];

/// The capabilities that tell the editor the checker answers [`METHODS`].
pub(super) const CAPABILITIES: &[&str] = &[
    "hoverProvider",
    "completionProvider",
    "signatureHelpProvider",
    "definitionProvider",
    "typeDefinitionProvider",
    "implementationProvider",
    "referencesProvider",
    "documentHighlightProvider",
    "renameProvider",
];

/// Whether the checker answers for the document at `uri`: a component, since the editor's own
/// TypeScript serves the other files.
pub(super) fn components(uri: &str) -> bool {
    uri.ends_with(".svelte")
}

/// The name of the tsconfig the checker opens in each folder. The editor opens none of this name,
/// so the checker reads only the text given here.
const CONFIG: &str = ".rsvelte.tsconfig.json";
/// Where in a folder the content mapper's package is written: the checker starts a mapper only
/// from a package in the workspace.
const PACKAGE: &[&str] = &["node_modules", ".cache", "rsvelte", "content-mapper"];

/// Serves the router on `input` and `output` with the checker of the first workspace folder that
/// type checks, until the router or the checker stops.
pub(super) async fn serve(
    input: impl AsyncRead + Send + Unpin + 'static,
    output: impl AsyncWrite + Send + Unpin + 'static,
) {
    let mut input = BufReader::new(input);
    let (router, written) = rpc::writer(output);
    let Some(initialize) = next(&mut input).await else {
        return;
    };
    let parameters = (initialize.parameters.as_deref())
        .and_then(|parameters| serde_json::from_str::<InitializeParams>(parameters.get()).ok());
    #[expect(
        deprecated,
        reason = "a client without workspace folders sends only its root"
    )]
    let folders = (parameters.as_ref()).map_or_else(Vec::new, |parameters| {
        folders(
            parameters.root_uri.as_ref(),
            parameters
                .workspace_folders_initialize_params
                .workspace_folders
                .as_ref(),
        )
    });
    let prepared = tokio::task::spawn_blocking(move || prepare(&folders)).await;
    let Ok(prepared) = prepared else {
        return;
    };
    for problem in &prepared.problems {
        drop(router.send(log(problem)));
    }
    let started = prepared.checker.as_ref().map(|(checker, directory)| {
        tokio::process::Command::new(&checker.program)
            .args(&checker.arguments)
            .args(["--lsp", "--stdio"])
            .current_dir(directory)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .kill_on_drop(true)
            .spawn()
    });
    match started {
        Some(Ok(mut child)) => {
            let (Some(stdin), Some(stdout)) = (child.stdin.take(), child.stdout.take()) else {
                return;
            };
            let (checker, writing) = rpc::writer(stdin);
            let answering = from_checker(stdout, checker.clone(), router.clone());
            // Either side's end is this server's: the editor's `exit`, or the checker's.
            tokio::select! {
                () = to_checker(&mut input, initialize, &checker, &prepared.configs) => {}
                () = answering => {}
            }
            drop(checker);
            drop(writing.await);
            drop(child.wait().await);
        }
        Some(Err(error)) => {
            drop(router.send(log(&format!("the type checker does not start: {error}"))));
            idle(&mut input, initialize, &router).await;
        }
        None => idle(&mut input, initialize, &router).await,
    }
    drop(router);
    drop(written.await);
}

/// The router's next message, until its input ends.
async fn next(input: &mut BufReader<impl AsyncRead + Unpin>) -> Option<Message> {
    loop {
        let body = rpc::read(input).await.ok()??;
        if let Ok(message) = serde_json::from_slice(&body) {
            return Some(message);
        }
    }
}

/// Answers each request with no result, for a workspace without a checker.
async fn idle(
    input: &mut BufReader<impl AsyncRead + Unpin>,
    initialize: Message,
    router: &mpsc::UnboundedSender<Message>,
) {
    let mut request = Some(initialize);
    while let Some(message) = request.take() {
        match (message.id, message.method.as_deref()) {
            (Some(id), Some(_)) => drop(router.send(Message::empty(id))),
            (None, Some("exit")) => return,
            _ => {}
        }
        request = next(input).await;
    }
}

/// Hands the router's messages to the checker: `initialize` as the checker needs it, and after
/// `initialized` the tsconfig of each folder.
async fn to_checker(
    input: &mut BufReader<impl AsyncRead + Unpin>,
    mut initialize: Message,
    checker: &mpsc::UnboundedSender<Message>,
    configs: &[Opened],
) {
    initialize.parameters = (initialize.parameters.as_deref())
        .and_then(for_checker)
        .or(initialize.parameters);
    drop(checker.send(initialize));
    while let Some(mut message) = next(input).await {
        // The checker reads `null` parameters, which some clients send to `exit`, as wrong ones.
        if message
            .parameters
            .as_deref()
            .is_some_and(|parameters| parameters.get() == "null")
        {
            message.parameters = None;
        }
        let method = message.method.clone();
        drop(checker.send(message));
        if method.as_deref() == Some("exit") {
            return;
        }
        if method.as_deref() == Some("initialized") {
            for config in configs {
                drop(checker.send(config.message()));
            }
        }
    }
}

/// Hands the checker's answers to the router, and answers the checker's own requests: the editor
/// shows only what [`METHODS`] answer.
async fn from_checker(
    output: impl AsyncRead + Unpin,
    checker: mpsc::UnboundedSender<Message>,
    router: mpsc::UnboundedSender<Message>,
) {
    let mut output = BufReader::new(output);
    while let Some(message) = next(&mut output).await {
        match (&message.id, message.method.as_deref()) {
            (Some(_), None) => drop(router.send(message)),
            (Some(id), Some("workspace/configuration")) => {
                drop(checker.send(configuration(id.clone(), &message)));
            }
            (Some(id), Some(_)) => drop(checker.send(Message::empty(id.clone()))),
            // Its diagnostics are the type check's, which the editor already gets.
            (None, _) => {}
        }
    }
}

/// The initialize parameters of the editor, as the checker needs them: with the option that lets
/// it run a content mapper; asking for its configuration, which this server answers; and without
/// the position encodings the editor offers, since the router answers that positions count UTF-16
/// code units, as the protocol does by default.
fn for_checker(parameters: &RawValue) -> Option<Box<RawValue>> {
    let mut parameters: Object = serde_json::from_str(parameters.get()).ok()?;
    let options = RawValue::from_string(r#"{"runExternalCode":true}"#.to_owned()).ok()?;
    parameters.insert("initializationOptions".to_owned(), options);
    let mut capabilities = object(parameters.get("capabilities").map(AsRef::as_ref))?;
    let mut general = object(capabilities.get("general").map(AsRef::as_ref))?;
    general.remove("positionEncodings");
    let mut workspace = object(capabilities.get("workspace").map(AsRef::as_ref))?;
    let asks = RawValue::from_string("true".to_owned()).ok()?;
    workspace.insert("configuration".to_owned(), asks);
    capabilities.insert("general".to_owned(), raw(&general)?);
    capabilities.insert("workspace".to_owned(), raw(&workspace)?);
    parameters.insert("capabilities".to_owned(), raw(&capabilities)?);
    raw(&parameters)
}

type Object = BTreeMap<String, Box<RawValue>>;

/// The members of `value`, none where it is absent.
fn object(value: Option<&RawValue>) -> Option<Object> {
    value.map_or_else(
        || Some(Object::new()),
        |value| serde_json::from_str(value.get()).ok(),
    )
}

fn raw(object: &Object) -> Option<Box<RawValue>> {
    serde_json::value::to_raw_value(object).ok()
}

/// The answer to the checker's `workspace/configuration`: it opens [`CONFIG`] for a project.
fn configuration(id: Id, request: &Message) -> Message {
    #[derive(Deserialize)]
    struct Asked {
        items: Vec<Item>,
    }
    #[derive(Deserialize)]
    struct Item {
        section: Option<String>,
    }
    let items = (request.parameters.as_deref())
        .and_then(|parameters| serde_json::from_str::<Asked>(parameters.get()).ok())
        .map_or_else(Vec::new, |asked| asked.items);
    let typescript = format!(r#"{{"customConfigFileName":"{CONFIG}"}}"#);
    let answers: Vec<&str> = (items.iter())
        .map(|item| match item.section.as_deref() {
            Some("js/ts") => typescript.as_str(),
            _ => "null",
        })
        .collect();
    let result = RawValue::from_string(format!("[{}]", answers.join(","))).ok();
    Message::answer(id, result)
}

fn log(message: &str) -> Message {
    let message = serde_json::to_string(&format!("rsvelte: {message}")).unwrap_or_default();
    let parameters = RawValue::from_string(format!(r#"{{"type":3,"message":{message}}}"#)).ok();
    Message::notification("window/logMessage", parameters)
}

/// What the checker needs before it starts.
struct Prepared {
    /// The checker of the first folder that type checks, and that folder.
    checker: Option<(TypeChecker, PathBuf)>,
    /// The tsconfig the checker opens in each folder that type checks and has a tsconfig.
    configs: Vec<Opened>,
    /// Why a folder gets no TypeScript features, for the editor's log.
    problems: Vec<String>,
}

/// A document the checker gets as open, which the editor does not have.
struct Opened {
    uri: String,
    text: String,
}

impl Opened {
    fn message(&self) -> Message {
        let uri = serde_json::to_string(&self.uri).unwrap_or_default();
        let text = serde_json::to_string(&self.text).unwrap_or_default();
        let parameters = RawValue::from_string(format!(
            r#"{{"textDocument":{{"uri":{uri},"languageId":"jsonc","version":1,"text":{text}}}}}"#
        ))
        .ok();
        Message::notification("textDocument/didOpen", parameters)
    }
}

/// The checker and the tsconfigs of `folders`, as `rsvelte typecheck` run in each would check.
fn prepare(folders: &[Folder]) -> Prepared {
    let mut prepared = Prepared {
        checker: None,
        configs: Vec::new(),
        problems: Vec::new(),
    };
    for folder in folders {
        match folder_config(&folder.given) {
            Ok(Some((checker, config))) => {
                prepared.configs.extend(config);
                if prepared.checker.is_none() {
                    prepared.checker = Some((checker, folder.given.clone()));
                }
            }
            Ok(None) => {}
            Err(error) => prepared.problems.push(format!(
                "no TypeScript features in {}: {error}",
                folder.given.display()
            )),
        }
    }
    prepared
}

/// The checker `rsvelte typecheck` runs in `folder`, with the tsconfig the checker opens there,
/// after the content mapper's package is written; `None` where the folder checks no component.
fn folder_config(folder: &Path) -> Result<Option<(TypeChecker, Option<Opened>)>, String> {
    let installation = super::super::installation(super::super::TYPECHECK);
    let (reg, _) = crate::configured_registry(
        &configuration::Options::default(),
        &[],
        installation,
        folder,
    )?;
    let checker = reg.contributions::<TypeCheckers>().first();
    let mapper = (reg.contributions::<MappedLanguages>().iter())
        .find(|language| language.extension == ".svelte");
    let (Some(checker), Some(mapper)) = (checker, mapper) else {
        return Ok(None);
    };
    let tsconfig = folder.join("tsconfig.json");
    if !tsconfig.is_file() {
        return Ok(Some((checker.clone(), None)));
    }
    let modules = folder.join(PACKAGE[0]);
    if !modules.is_dir() {
        return Err(format!("{} does not exist", modules.display()));
    }
    let package = PACKAGE
        .iter()
        .fold(folder.to_owned(), |path, part| path.join(part));
    write_package(&package, &mapper.content_mapper)
        .map_err(|e| format!("{}: {e}", package.display()))?;
    let package = serde_json::to_string(&package.to_string_lossy()).map_err(|e| e.to_string())?;
    let text = format!(
        r#"{{"extends":"./tsconfig.json","contentMappers":[{{"package":{package},"extensions":[".svelte"]}}]}}"#
    );
    let uri = file_path_to_uri(folder.join(CONFIG))
        .ok_or_else(|| format!("{} is no file URI", folder.display()))?;
    let config = Opened {
        uri: uri.as_str().to_owned(),
        text,
    };
    Ok(Some((checker.clone(), Some(config))))
}

/// Writes the package that tells the checker to start `mapper`, unless it says so already.
fn write_package(package: &Path, mapper: &Path) -> std::io::Result<()> {
    let mapper = serde_json::to_string(&mapper.to_string_lossy())?;
    let text = format!(
        r#"{{"name":"rsvelte-content-mapper","version":"{}","typescript":{{"contentMapper":{{"exec":[{mapper}]}}}}}}"#,
        env!("CARGO_PKG_VERSION")
    );
    let manifest = package.join("package.json");
    if std::fs::read_to_string(&manifest).is_ok_and(|written| written == text) {
        return Ok(());
    }
    std::fs::create_dir_all(package)?;
    std::fs::write(manifest, text)
}
