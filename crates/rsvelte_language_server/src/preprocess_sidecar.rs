use std::collections::BTreeMap;
use std::fmt;
use std::fs;
use std::io::{self, BufRead, BufReader, BufWriter, Write};
use std::path::{Path, PathBuf};
use std::process::{Child, ChildStdin, Command, ExitStatus, Stdio};
use std::thread::{self, JoinHandle};
use std::time::{Duration, Instant};

use crossbeam_channel::{Receiver, Sender, after, select, tick, unbounded};
use serde::{Deserialize, Serialize};

const SCRIPT: &str = include_str!("preprocess_sidecar.mjs");
const WIRE_PREFIX: &str = "\u{1e}RSVELTE";
const POLL_INTERVAL: Duration = Duration::from_millis(50);
const CONFIG_NAMES: &[&str] = &[
    "svelte.config.js",
    "svelte.config.mjs",
    "svelte.config.cjs",
    "svelte.config.ts",
    "svelte.config.mts",
];

#[derive(Clone, Debug)]
pub struct PreprocessSidecarConfig {
    pub node: PathBuf,
    pub restart_delay: Duration,
    pub max_restart_delay: Duration,
    pub request_timeout: Duration,
    pub max_consecutive_crashes: u32,
}

impl Default for PreprocessSidecarConfig {
    fn default() -> Self {
        Self {
            node: std::env::var_os("RSVELTE_PREPROCESS_NODE")
                .map(PathBuf::from)
                .unwrap_or_else(|| PathBuf::from("node")),
            restart_delay: Duration::from_millis(250),
            max_restart_delay: Duration::from_secs(30),
            request_timeout: Duration::from_secs(30),
            max_consecutive_crashes: 5,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct PreprocessInput {
    pub workspace: PathBuf,
    pub filename: PathBuf,
    pub version: i32,
    pub text: String,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct PreprocessOutput {
    pub generation: u64,
    pub filename: PathBuf,
    pub version: i32,
    pub code: String,
    pub map: Option<String>,
    pub dependencies: Vec<PathBuf>,
    pub config_path: Option<PathBuf>,
    pub has_preprocessor: bool,
}

#[derive(Clone, Debug)]
pub enum PreprocessEvent {
    Ready {
        generation: u64,
    },
    Result(PreprocessOutput),
    Failed {
        generation: u64,
        filename: Option<PathBuf>,
        version: Option<i32>,
        message: String,
    },
    Crashed {
        generation: u64,
        status: Option<ExitStatus>,
        error: String,
    },
    /// Automatic restarts are paused until [`PreprocessSidecar::restart`].
    CircuitOpen {
        generation: u64,
        crashes: u32,
        error: String,
    },
}

pub struct PreprocessSidecar {
    commands: Sender<SidecarCommand>,
    supervisor: Option<JoinHandle<()>>,
}

impl PreprocessSidecar {
    pub fn spawn(
        config: PreprocessSidecarConfig,
        events: Sender<PreprocessEvent>,
    ) -> io::Result<Self> {
        let (commands, receiver) = unbounded();
        let supervisor = thread::Builder::new()
            .name("rsvelte-preprocess-supervisor".to_string())
            .spawn(move || supervise(config, receiver, events))?;
        Ok(Self {
            commands,
            supervisor: Some(supervisor),
        })
    }

    pub fn preprocess(&self, input: PreprocessInput) -> Result<(), PreprocessSidecarClosed> {
        self.commands
            .send(SidecarCommand::Upsert(input))
            .map_err(|_| PreprocessSidecarClosed)
    }

    pub fn remove(&self, filename: PathBuf) -> Result<(), PreprocessSidecarClosed> {
        self.commands
            .send(SidecarCommand::Remove(filename))
            .map_err(|_| PreprocessSidecarClosed)
    }

    pub fn restart(&self) -> Result<(), PreprocessSidecarClosed> {
        self.commands
            .send(SidecarCommand::Restart)
            .map_err(|_| PreprocessSidecarClosed)
    }
}

impl Drop for PreprocessSidecar {
    fn drop(&mut self) {
        let _ = self.commands.send(SidecarCommand::Shutdown);
        if let Some(supervisor) = self.supervisor.take() {
            let _ = supervisor.join();
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct PreprocessSidecarClosed;

impl fmt::Display for PreprocessSidecarClosed {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str("preprocess sidecar supervisor has stopped")
    }
}

impl std::error::Error for PreprocessSidecarClosed {}

enum SidecarCommand {
    Upsert(PreprocessInput),
    Remove(PathBuf),
    Restart,
    Shutdown,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct WireRequest<'a> {
    r#type: &'static str,
    id: u64,
    workspace: &'a Path,
    filename: &'a Path,
    version: i32,
    text: &'a str,
}

#[derive(Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
enum WireEvent {
    Ready {
        #[allow(dead_code)]
        pid: u32,
    },
    Result {
        id: u64,
        filename: PathBuf,
        version: i32,
        code: String,
        map: Option<String>,
        #[serde(default)]
        dependencies: Vec<PathBuf>,
        #[serde(rename = "configPath")]
        config_path: Option<PathBuf>,
        #[serde(rename = "hasPreprocessor")]
        has_preprocessor: bool,
    },
    Error {
        id: Option<u64>,
        filename: Option<PathBuf>,
        version: Option<i32>,
        message: String,
        #[allow(dead_code)]
        stack: Option<String>,
    },
}

enum ReaderEvent {
    Wire(WireEvent),
    Eof,
    Error(String),
}

struct SidecarProcess {
    child: Child,
    stdin: BufWriter<ChildStdin>,
    events: Receiver<ReaderEvent>,
    reader: Option<JoinHandle<()>>,
}

impl SidecarProcess {
    fn spawn(config: &PreprocessSidecarConfig) -> io::Result<Self> {
        let mut child = Command::new(&config.node)
            .arg("--input-type=module")
            .arg("--eval")
            .arg(SCRIPT)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .spawn()?;
        let stdin = child
            .stdin
            .take()
            .ok_or_else(|| io::Error::other("preprocess sidecar stdin was not piped"))?;
        let stdout = child
            .stdout
            .take()
            .ok_or_else(|| io::Error::other("preprocess sidecar stdout was not piped"))?;
        let (sender, events) = unbounded();
        let reader = thread::Builder::new()
            .name("rsvelte-preprocess-reader".to_string())
            .spawn(move || {
                for line in BufReader::new(stdout).lines() {
                    match line {
                        Ok(line) => {
                            let Some(prefix) = line.find(WIRE_PREFIX) else {
                                crate::log::warn(format_args!("preprocess sidecar: {line}"));
                                continue;
                            };
                            if prefix != 0 {
                                crate::log::warn(format_args!(
                                    "preprocess sidecar: {}",
                                    &line[..prefix]
                                ));
                            }
                            match serde_json::from_str(&line[prefix + WIRE_PREFIX.len()..]) {
                                Ok(event) => {
                                    if sender.send(ReaderEvent::Wire(event)).is_err() {
                                        return;
                                    }
                                }
                                Err(error) => crate::log::warn(format_args!(
                                    "invalid preprocess sidecar response: {error}"
                                )),
                            }
                        }
                        Err(error) => {
                            let _ = sender.send(ReaderEvent::Error(error.to_string()));
                            return;
                        }
                    }
                }
                let _ = sender.send(ReaderEvent::Eof);
            })?;
        Ok(Self {
            child,
            stdin: BufWriter::new(stdin),
            events,
            reader: Some(reader),
        })
    }

    fn send(&mut self, id: u64, input: &PreprocessInput) -> io::Result<()> {
        serde_json::to_writer(
            &mut self.stdin,
            &WireRequest {
                r#type: "preprocess",
                id,
                workspace: &input.workspace,
                filename: &input.filename,
                version: input.version,
                text: &input.text,
            },
        )?;
        self.stdin.write_all(b"\n")?;
        self.stdin.flush()
    }

    fn finish(mut self, kill: bool) -> Option<ExitStatus> {
        if kill {
            let _ = self.child.kill();
        }
        let status = self.child.wait().ok();
        if let Some(reader) = self.reader.take() {
            let _ = reader.join();
        }
        status
    }
}

enum ProcessOutcome {
    Restart,
    Shutdown,
    Failed {
        status: Option<ExitStatus>,
        error: String,
        stable: bool,
    },
}

struct PendingRequest {
    filename: PathBuf,
    version: i32,
    sent_at: Instant,
}

enum RestartWait {
    Retry,
    ResetAndRetry,
    Shutdown,
}

fn supervise(
    config: PreprocessSidecarConfig,
    commands: Receiver<SidecarCommand>,
    events: Sender<PreprocessEvent>,
) {
    let mut retained = BTreeMap::<PathBuf, PreprocessInput>::new();
    let mut generation = 0_u64;
    let mut consecutive_crashes = 0_u32;
    loop {
        while retained.is_empty() {
            match commands.recv() {
                Ok(SidecarCommand::Upsert(input)) => {
                    retained.insert(input.filename.clone(), input);
                }
                Ok(SidecarCommand::Remove(_)) | Ok(SidecarCommand::Restart) => {}
                Ok(SidecarCommand::Shutdown) | Err(_) => return,
            }
        }

        generation += 1;
        let process = match SidecarProcess::spawn(&config) {
            Ok(process) => process,
            Err(error) => {
                consecutive_crashes = consecutive_crashes.saturating_add(1);
                let error = format!("failed to start preprocess sidecar: {error}");
                let _ = events.send(PreprocessEvent::Crashed {
                    generation,
                    status: None,
                    error: error.clone(),
                });
                match wait_after_failure(
                    &config,
                    &commands,
                    &events,
                    &mut retained,
                    generation,
                    consecutive_crashes,
                    error,
                ) {
                    RestartWait::Retry => continue,
                    RestartWait::ResetAndRetry => {
                        consecutive_crashes = 0;
                        continue;
                    }
                    RestartWait::Shutdown => return,
                }
            }
        };
        match run_process(
            process,
            generation,
            &config,
            &commands,
            &events,
            &mut retained,
        ) {
            ProcessOutcome::Shutdown => return,
            ProcessOutcome::Restart => consecutive_crashes = 0,
            ProcessOutcome::Failed {
                status,
                error,
                stable,
            } => {
                consecutive_crashes = if stable {
                    1
                } else {
                    consecutive_crashes.saturating_add(1)
                };
                let _ = events.send(PreprocessEvent::Crashed {
                    generation,
                    status,
                    error: error.clone(),
                });
                match wait_after_failure(
                    &config,
                    &commands,
                    &events,
                    &mut retained,
                    generation,
                    consecutive_crashes,
                    error,
                ) {
                    RestartWait::Retry => {}
                    RestartWait::ResetAndRetry => consecutive_crashes = 0,
                    RestartWait::Shutdown => return,
                }
            }
        }
    }
}

fn run_process(
    mut process: SidecarProcess,
    generation: u64,
    config: &PreprocessSidecarConfig,
    commands: &Receiver<SidecarCommand>,
    events: &Sender<PreprocessEvent>,
    retained: &mut BTreeMap<PathBuf, PreprocessInput>,
) -> ProcessOutcome {
    let poll = tick(POLL_INTERVAL);
    let started_at = Instant::now();
    loop {
        select! {
            recv(commands) -> command => match command {
                Ok(SidecarCommand::Upsert(input)) => {
                    retained.insert(input.filename.clone(), input);
                }
                Ok(SidecarCommand::Remove(filename)) => {
                    retained.remove(&filename);
                }
                Ok(SidecarCommand::Restart) => {
                    process.finish(true);
                    return ProcessOutcome::Restart;
                }
                Ok(SidecarCommand::Shutdown) | Err(_) => {
                    process.finish(true);
                    return ProcessOutcome::Shutdown;
                }
            },
            recv(process.events) -> event => match event {
                Ok(ReaderEvent::Wire(WireEvent::Ready { .. })) => break,
                Ok(ReaderEvent::Wire(_)) => {}
                Ok(ReaderEvent::Eof) | Err(_) => {
                    let status = process.finish(true);
                    return process_failed(status, "preprocess sidecar closed stdout during startup", false);
                }
                Ok(ReaderEvent::Error(error)) => {
                    let status = process.finish(true);
                    return ProcessOutcome::Failed {
                        status,
                        error,
                        stable: false,
                    };
                }
            },
            recv(poll) -> _ => {
                if started_at.elapsed() >= config.request_timeout {
                    let status = process.finish(true);
                    return process_failed(status, "preprocess sidecar timed out during startup", false);
                }
                match process.child.try_wait() {
                    Ok(Some(status)) => {
                        process.finish(false);
                        return process_failed(Some(status), "preprocess sidecar exited during startup", false);
                    }
                    Ok(None) => {}
                    Err(error) => {
                        let status = process.finish(true);
                        return ProcessOutcome::Failed {
                            status,
                            error: format!("could not inspect preprocess sidecar: {error}"),
                            stable: false,
                        };
                    }
                }
            },
        }
    }

    let _ = events.send(PreprocessEvent::Ready { generation });
    let mut next_id = 0_u64;
    let mut pending = BTreeMap::<u64, PendingRequest>::new();
    let mut latest = BTreeMap::<PathBuf, u64>::new();
    let replay = retained.values().cloned().collect::<Vec<_>>();
    for input in replay {
        if let Err(error) = send_input(
            &mut process,
            &mut next_id,
            &input,
            &mut pending,
            &mut latest,
        ) {
            let status = process.finish(true);
            return ProcessOutcome::Failed {
                status,
                error: format!("failed to replay preprocess input: {error}"),
                stable: false,
            };
        }
    }

    let mut stable = pending.is_empty();
    loop {
        select! {
            recv(commands) -> command => match command {
                Ok(SidecarCommand::Upsert(input)) => {
                    retained.insert(input.filename.clone(), input.clone());
                    if let Err(error) = send_input(
                        &mut process,
                        &mut next_id,
                        &input,
                        &mut pending,
                        &mut latest,
                    ) {
                        let status = process.finish(true);
                        return ProcessOutcome::Failed {
                            status,
                            error: format!("failed to write preprocess input: {error}"),
                            stable,
                        };
                    }
                }
                Ok(SidecarCommand::Remove(filename)) => {
                    retained.remove(&filename);
                    latest.remove(&filename);
                }
                Ok(SidecarCommand::Restart) => {
                    process.finish(true);
                    return ProcessOutcome::Restart;
                }
                Ok(SidecarCommand::Shutdown) | Err(_) => {
                    process.finish(true);
                    return ProcessOutcome::Shutdown;
                }
            },
            recv(process.events) -> event => match event {
                Ok(ReaderEvent::Wire(WireEvent::Result {
                    id, filename, version, code, map, dependencies, config_path, has_preprocessor
                })) => {
                    let Some(request) = pending.remove(&id) else {
                        continue;
                    };
                    if request.filename != filename || request.version != version {
                        let status = process.finish(true);
                        return ProcessOutcome::Failed {
                            status,
                            error: format!("preprocess sidecar response {id} did not match its request"),
                            stable,
                        };
                    }
                    if latest.get(&filename) != Some(&id) {
                        stable |= pending.is_empty();
                        continue;
                    }
                    stable |= pending.is_empty();
                    let _ = events.send(PreprocessEvent::Result(PreprocessOutput {
                        generation, filename, version, code, map, dependencies, config_path, has_preprocessor,
                    }));
                }
                Ok(ReaderEvent::Wire(WireEvent::Error { id, filename, version, message, .. })) => {
                    if let Some(id) = id {
                        let Some(request) = pending.remove(&id) else {
                            continue;
                        };
                        if filename.as_ref() != Some(&request.filename)
                            || version != Some(request.version)
                        {
                            let status = process.finish(true);
                            return ProcessOutcome::Failed {
                                status,
                                error: format!("preprocess sidecar error {id} did not match its request"),
                                stable,
                            };
                        }
                        if latest.get(&request.filename) != Some(&id) {
                            stable |= pending.is_empty();
                            continue;
                        }
                    }
                    stable |= pending.is_empty();
                    let _ = events.send(PreprocessEvent::Failed {
                        generation, filename, version, message,
                    });
                }
                Ok(ReaderEvent::Wire(WireEvent::Ready { .. })) => {}
                Ok(ReaderEvent::Eof) | Err(_) => {
                    let status = process.finish(true);
                    return process_failed(status, "preprocess sidecar closed stdout", stable);
                }
                Ok(ReaderEvent::Error(error)) => {
                    let status = process.finish(true);
                    return ProcessOutcome::Failed { status, error, stable };
                }
            },
            recv(poll) -> _ => {
                if let Some(request) = pending.values().min_by_key(|request| request.sent_at)
                    && request.sent_at.elapsed() >= config.request_timeout
                {
                    let filename = request.filename.clone();
                    let version = request.version;
                    let message = format!("preprocessing {} timed out", filename.display());
                    let _ = events.send(PreprocessEvent::Failed {
                        generation,
                        filename: Some(filename),
                        version: Some(version),
                        message: message.clone(),
                    });
                    let status = process.finish(true);
                    return process_failed(status, message, stable);
                }
                match process.child.try_wait() {
                    Ok(Some(status)) => {
                        process.finish(false);
                        return process_failed(Some(status), "preprocess sidecar exited", stable);
                    }
                    Ok(None) => {}
                    Err(error) => {
                        let status = process.finish(true);
                        return ProcessOutcome::Failed {
                            status,
                            error: format!("could not inspect preprocess sidecar: {error}"),
                            stable,
                        };
                    }
                }
            },
        }
    }
}

fn send_input(
    process: &mut SidecarProcess,
    next_id: &mut u64,
    input: &PreprocessInput,
    pending: &mut BTreeMap<u64, PendingRequest>,
    latest: &mut BTreeMap<PathBuf, u64>,
) -> io::Result<()> {
    *next_id = next_id.saturating_add(1);
    process.send(*next_id, input)?;
    pending.insert(
        *next_id,
        PendingRequest {
            filename: input.filename.clone(),
            version: input.version,
            sent_at: Instant::now(),
        },
    );
    latest.insert(input.filename.clone(), *next_id);
    Ok(())
}

fn process_failed(
    status: Option<ExitStatus>,
    error: impl Into<String>,
    stable: bool,
) -> ProcessOutcome {
    ProcessOutcome::Failed {
        status,
        error: error.into(),
        stable,
    }
}

fn wait_after_failure(
    config: &PreprocessSidecarConfig,
    commands: &Receiver<SidecarCommand>,
    events: &Sender<PreprocessEvent>,
    retained: &mut BTreeMap<PathBuf, PreprocessInput>,
    generation: u64,
    consecutive_crashes: u32,
    error: String,
) -> RestartWait {
    let circuit_open = consecutive_crashes >= config.max_consecutive_crashes.max(1);
    if circuit_open {
        let _ = events.send(PreprocessEvent::CircuitOpen {
            generation,
            crashes: consecutive_crashes,
            error,
        });
    }
    let timer = (!circuit_open).then(|| after(restart_delay(config, consecutive_crashes)));
    loop {
        if let Some(timer) = &timer {
            select! {
                recv(commands) -> command => match match_restart_command(command, retained) {
                    RestartWait::Retry => {}
                    outcome => return outcome,
                },
                recv(timer) -> _ => return RestartWait::Retry,
            }
        } else {
            match match_restart_command(commands.recv(), retained) {
                RestartWait::Retry => {}
                outcome => return outcome,
            }
        }
    }
}

fn match_restart_command(
    command: Result<SidecarCommand, crossbeam_channel::RecvError>,
    retained: &mut BTreeMap<PathBuf, PreprocessInput>,
) -> RestartWait {
    match command {
        Ok(SidecarCommand::Upsert(input)) => {
            retained.insert(input.filename.clone(), input);
            RestartWait::Retry
        }
        Ok(SidecarCommand::Remove(filename)) => {
            retained.remove(&filename);
            RestartWait::Retry
        }
        Ok(SidecarCommand::Restart) => RestartWait::ResetAndRetry,
        Ok(SidecarCommand::Shutdown) | Err(_) => RestartWait::Shutdown,
    }
}

fn restart_delay(config: &PreprocessSidecarConfig, consecutive_crashes: u32) -> Duration {
    let exponent = consecutive_crashes.saturating_sub(1).min(31);
    config
        .restart_delay
        .saturating_mul(1_u32 << exponent)
        .min(config.max_restart_delay)
}

#[must_use]
pub fn find_preprocess_config(filename: &Path, workspace: &Path) -> Option<PathBuf> {
    let workspace = fs::canonicalize(workspace).ok()?;
    let mut current = fs::canonicalize(filename.parent()?).ok()?;
    loop {
        if !current.starts_with(&workspace) {
            return None;
        }
        for name in CONFIG_NAMES {
            let candidate = current.join(name);
            let Ok(candidate) = fs::canonicalize(candidate) else {
                continue;
            };
            if candidate.starts_with(&workspace) && candidate.is_file() {
                return Some(candidate);
            }
        }
        if current == workspace {
            return None;
        }
        current = current.parent()?.to_path_buf();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::process::Command;

    fn temp_dir(name: &str) -> PathBuf {
        let path = std::env::temp_dir().join(format!(
            "rsvelte-preprocess-{name}-{}-{:?}",
            std::process::id(),
            std::thread::current().id()
        ));
        fs::remove_dir_all(&path).ok();
        fs::create_dir_all(&path).unwrap();
        path
    }

    fn node() -> Option<PathBuf> {
        let node = std::env::var_os("RSVELTE_PREPROCESS_NODE")
            .map(PathBuf::from)
            .unwrap_or_else(|| PathBuf::from("node"));
        Command::new(&node)
            .arg("--version")
            .output()
            .ok()?
            .status
            .success()
            .then_some(node)
    }

    fn test_config(node: PathBuf) -> PreprocessSidecarConfig {
        PreprocessSidecarConfig {
            node,
            restart_delay: Duration::from_millis(10),
            max_restart_delay: Duration::from_millis(40),
            request_timeout: Duration::from_secs(2),
            max_consecutive_crashes: 3,
        }
    }

    fn write_fake_compiler(root: &Path) {
        let package = root.join("node_modules/svelte");
        fs::create_dir_all(&package).unwrap();
        fs::write(
            package.join("package.json"),
            r#"{"name":"svelte","type":"module","exports":{"./compiler":"./compiler.js"}}"#,
        )
        .unwrap();
        fs::write(
            package.join("compiler.js"),
            r#"
export async function preprocess(source, configured, options) {
  const groups = Array.isArray(configured) ? configured : [configured];
  let code = source;
  for (const group of groups) {
    if (!group?.markup) continue;
    const result = await group.markup({ content: code, filename: options?.filename });
    if (result?.code != null) code = result.code;
  }
  return { code, map: null, dependencies: [] };
}
"#,
        )
        .unwrap();
    }

    /// The shape npm actually ships. `svelte/compiler` is a bundle that assigns
    /// its exports through a getter table, which `cjs-module-lexer` cannot read
    /// statically — so `import()` gives a namespace carrying `default` alone and
    /// no `preprocess`. The ESM fake above is the one shape that needed no
    /// unwrapping, which is why the loader's `module.default` gap survived.
    fn write_fake_cjs_compiler(root: &Path) {
        let package = root.join("node_modules/svelte");
        fs::create_dir_all(&package).unwrap();
        fs::write(
            package.join("package.json"),
            r#"{"name":"svelte","exports":{"./compiler":"./compiler.js"}}"#,
        )
        .unwrap();
        fs::write(
            package.join("compiler.js"),
            r#"
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all) __defProp(target, name, { get: all[name], enumerable: true });
};
var api = {};
__export(api, { preprocess: () => preprocess });
async function preprocess(source, configured, options) {
  const groups = Array.isArray(configured) ? configured : [configured];
  let code = source;
  for (const group of groups) {
    if (!group?.markup) continue;
    const result = await group.markup({ content: code, filename: options?.filename });
    if (result?.code != null) code = result.code;
  }
  return { code, map: null, dependencies: [] };
}
module.exports = api;
"#,
        )
        .unwrap();
    }

    fn input(root: &Path, version: i32, text: &str) -> PreprocessInput {
        PreprocessInput {
            workspace: root.to_path_buf(),
            filename: root.join("App.svelte"),
            version,
            text: text.to_string(),
        }
    }

    #[test]
    fn nearest_config_is_confined_to_workspace() {
        let root = temp_dir("config");
        let nested = root.join("packages/app/src");
        fs::create_dir_all(&nested).unwrap();
        fs::write(root.join("svelte.config.js"), "export default {}").unwrap();
        fs::write(
            root.join("packages/app/svelte.config.mjs"),
            "export default {}",
        )
        .unwrap();
        let file = nested.join("App.svelte");
        fs::write(&file, "<p />").unwrap();
        assert_eq!(
            find_preprocess_config(&file, &root),
            Some(fs::canonicalize(root.join("packages/app/svelte.config.mjs")).unwrap())
        );
        fs::remove_dir_all(root).ok();
    }

    #[test]
    fn supervisor_does_not_spawn_node_without_input() {
        let (sender, events) = unbounded();
        let sidecar = PreprocessSidecar::spawn(
            PreprocessSidecarConfig {
                node: PathBuf::from("definitely-not-a-node-executable"),
                restart_delay: Duration::from_millis(1),
                ..PreprocessSidecarConfig::default()
            },
            sender,
        )
        .unwrap();
        drop(sidecar);
        assert!(events.try_recv().is_err());
    }

    #[test]
    fn restart_delay_is_exponential_and_capped() {
        let config = PreprocessSidecarConfig {
            restart_delay: Duration::from_millis(10),
            max_restart_delay: Duration::from_millis(25),
            ..PreprocessSidecarConfig::default()
        };
        assert_eq!(restart_delay(&config, 1), Duration::from_millis(10));
        assert_eq!(restart_delay(&config, 2), Duration::from_millis(20));
        assert_eq!(restart_delay(&config, 3), Duration::from_millis(25));
        assert_eq!(restart_delay(&config, u32::MAX), Duration::from_millis(25));
    }

    #[test]
    fn a_commonjs_svelte_compiler_is_unwrapped() {
        let Some(node) = node() else {
            return;
        };
        let root = temp_dir("cjs-compiler");
        write_fake_cjs_compiler(&root);
        fs::write(
            root.join("svelte.config.mjs"),
            r#"
export default {
  preprocess: {
    markup({ content }) {
      return { code: `processed:${content}` };
    }
  }
};
"#,
        )
        .unwrap();

        let (sender, events) = unbounded();
        let sidecar = PreprocessSidecar::spawn(test_config(node), sender).unwrap();
        sidecar.preprocess(input(&root, 1, "body")).unwrap();
        let output = loop {
            match events.recv_timeout(Duration::from_secs(5)).unwrap() {
                PreprocessEvent::Result(output) => break output,
                PreprocessEvent::Failed { message, .. } => panic!("{message}"),
                PreprocessEvent::Crashed { error, .. }
                | PreprocessEvent::CircuitOpen { error, .. } => panic!("{error}"),
                PreprocessEvent::Ready { .. } => {}
            }
        };
        assert_eq!(output.code, "processed:body");
        assert!(output.has_preprocessor);
        drop(sidecar);
        fs::remove_dir_all(root).ok();
    }

    #[test]
    fn noisy_stdout_does_not_frame_a_stale_result() {
        let Some(node) = node() else {
            return;
        };
        let root = temp_dir("latest");
        write_fake_compiler(&root);
        fs::write(
            root.join("svelte.config.mjs"),
            r#"
import { writeSync } from 'node:fs';
writeSync(1, 'direct fd noise without a newline');
process.stdout.write('config noise without a newline');
export default {
  preprocess: {
    async markup({ content }) {
      if (content === 'slow') await new Promise((resolve) => setTimeout(resolve, 300));
      return { code: `processed:${content}` };
    }
  }
};
"#,
        )
        .unwrap();

        let (sender, events) = unbounded();
        let sidecar = PreprocessSidecar::spawn(test_config(node), sender).unwrap();
        sidecar.preprocess(input(&root, 1, "slow")).unwrap();
        loop {
            if matches!(
                events.recv_timeout(Duration::from_secs(3)).unwrap(),
                PreprocessEvent::Ready { .. }
            ) {
                break;
            }
        }
        sidecar.preprocess(input(&root, 2, "latest")).unwrap();

        let output = loop {
            match events.recv_timeout(Duration::from_secs(3)).unwrap() {
                PreprocessEvent::Result(output) => break output,
                PreprocessEvent::Crashed { error, .. }
                | PreprocessEvent::CircuitOpen { error, .. } => panic!("{error}"),
                PreprocessEvent::Ready { .. } | PreprocessEvent::Failed { .. } => {}
            }
        };
        assert_eq!(output.version, 2);
        assert_eq!(output.code, "processed:latest");
        assert!(events.try_iter().all(|event| !matches!(
            event,
            PreprocessEvent::Result(PreprocessOutput { version: 1, .. })
        )));
        drop(sidecar);
        fs::remove_dir_all(root).ok();
    }

    #[test]
    fn crash_replays_the_latest_input() {
        let Some(node) = node() else {
            return;
        };
        let root = temp_dir("crash-replay");
        write_fake_compiler(&root);
        let marker = root.join("crashed-once");
        let marker = serde_json::to_string(&marker.to_string_lossy()).unwrap();
        fs::write(
            root.join("svelte.config.mjs"),
            format!(
                r#"
import {{ existsSync, writeFileSync }} from 'node:fs';
const marker = {marker};
export default {{
  preprocess: {{
    markup({{ content }}) {{
      if (!existsSync(marker)) {{
        writeFileSync(marker, '1');
        process.exit(17);
      }}
      return {{ code: `replayed:${{content}}` }};
    }}
  }}
}};
"#
            ),
        )
        .unwrap();

        let (sender, events) = unbounded();
        let mut config = test_config(node);
        config.restart_delay = Duration::from_millis(250);
        let sidecar = PreprocessSidecar::spawn(config, sender).unwrap();
        sidecar.preprocess(input(&root, 7, "body")).unwrap();
        let mut crashed_generation = None;
        let output = loop {
            match events.recv_timeout(Duration::from_secs(4)).unwrap() {
                PreprocessEvent::Result(output) => break output,
                PreprocessEvent::Crashed { generation, .. } => {
                    crashed_generation = Some(generation);
                    sidecar.preprocess(input(&root, 8, "new-body")).unwrap();
                }
                PreprocessEvent::CircuitOpen { error, .. } => panic!("{error}"),
                PreprocessEvent::Ready { .. } | PreprocessEvent::Failed { .. } => {}
            }
        };
        assert_eq!(crashed_generation, Some(1));
        assert_eq!(output.generation, 2);
        assert_eq!(output.version, 8);
        assert_eq!(output.code, "replayed:new-body");
        drop(sidecar);
        fs::remove_dir_all(root).ok();
    }

    #[test]
    fn restart_reimports_changed_config_for_the_latest_input() {
        let Some(node) = node() else {
            return;
        };
        let root = temp_dir("config-restart");
        write_fake_compiler(&root);
        let config_path = root.join("svelte.config.mjs");
        let config = |prefix: &str| {
            format!(
                r#"
export default {{
  preprocess: {{
    markup({{ content }}) {{ return {{ code: '{prefix}:' + content }}; }}
  }}
}};
"#
            )
        };
        fs::write(&config_path, config("first")).unwrap();

        let (sender, events) = unbounded();
        let sidecar = PreprocessSidecar::spawn(test_config(node), sender).unwrap();
        sidecar.preprocess(input(&root, 1, "old-body")).unwrap();
        let first = loop {
            match events.recv_timeout(Duration::from_secs(3)).unwrap() {
                PreprocessEvent::Result(output) => break output,
                PreprocessEvent::Crashed { error, .. }
                | PreprocessEvent::CircuitOpen { error, .. } => panic!("{error}"),
                PreprocessEvent::Ready { .. } | PreprocessEvent::Failed { .. } => {}
            }
        };
        assert_eq!(first.generation, 1);
        assert_eq!(first.code, "first:old-body");

        fs::write(&config_path, config("second")).unwrap();
        sidecar.restart().unwrap();
        sidecar.preprocess(input(&root, 2, "latest-body")).unwrap();
        let second = loop {
            match events.recv_timeout(Duration::from_secs(3)).unwrap() {
                PreprocessEvent::Result(output) if output.generation > first.generation => {
                    break output;
                }
                PreprocessEvent::Crashed { error, .. }
                | PreprocessEvent::CircuitOpen { error, .. } => panic!("{error}"),
                PreprocessEvent::Ready { .. }
                | PreprocessEvent::Result(_)
                | PreprocessEvent::Failed { .. } => {}
            }
        };
        assert_eq!(second.generation, 2);
        assert_eq!(second.version, 2);
        assert_eq!(second.code, "second:latest-body");
        drop(sidecar);
        fs::remove_dir_all(root).ok();
    }

    #[cfg(unix)]
    #[test]
    fn config_symlink_cannot_escape_the_workspace() {
        use std::os::unix::fs::symlink;

        let root = temp_dir("config-symlink-root");
        let outside = temp_dir("config-symlink-outside");
        let source = root.join("src/App.svelte");
        fs::create_dir_all(source.parent().unwrap()).unwrap();
        fs::write(&source, "<p />").unwrap();
        let outside_config = outside.join("svelte.config.mjs");
        fs::write(&outside_config, "export default {}").unwrap();
        symlink(&outside_config, root.join("src/svelte.config.mjs")).unwrap();

        assert_eq!(find_preprocess_config(&source, &root), None);
        fs::remove_dir_all(root).ok();
        fs::remove_dir_all(outside).ok();
    }

    #[cfg(unix)]
    #[test]
    fn node_sidecar_skips_an_escaping_nearer_config() {
        use std::os::unix::fs::symlink;

        let Some(node) = node() else {
            return;
        };
        let root = temp_dir("node-config-symlink-root");
        let outside = temp_dir("node-config-symlink-outside");
        write_fake_compiler(&root);
        fs::write(
            root.join("svelte.config.mjs"),
            r#"export default { preprocess: { markup: ({ content }) => ({ code: `safe:${content}` }) } };"#,
        )
        .unwrap();
        fs::write(
            outside.join("svelte.config.mjs"),
            r#"export default { preprocess: { markup: ({ content }) => ({ code: `escaped:${content}` }) } };"#,
        )
        .unwrap();
        let source = root.join("src/App.svelte");
        fs::create_dir_all(source.parent().unwrap()).unwrap();
        fs::write(&source, "body").unwrap();
        symlink(
            outside.join("svelte.config.mjs"),
            root.join("src/svelte.config.mjs"),
        )
        .unwrap();

        let (sender, events) = unbounded();
        let sidecar = PreprocessSidecar::spawn(test_config(node), sender).unwrap();
        sidecar
            .preprocess(PreprocessInput {
                workspace: root.clone(),
                filename: source,
                version: 1,
                text: "body".to_string(),
            })
            .unwrap();
        let result = loop {
            match events.recv_timeout(Duration::from_secs(5)).unwrap() {
                PreprocessEvent::Result(result) => break result,
                PreprocessEvent::Ready { .. }
                | PreprocessEvent::Crashed { .. }
                | PreprocessEvent::CircuitOpen { .. }
                | PreprocessEvent::Failed { .. } => {}
            }
        };
        assert_eq!(result.code, "safe:body");
        drop(sidecar);
        fs::remove_dir_all(root).ok();
        fs::remove_dir_all(outside).ok();
    }

    #[test]
    fn hung_preprocessor_opens_the_restart_circuit() {
        let Some(node) = node() else {
            return;
        };
        let root = temp_dir("timeout");
        write_fake_compiler(&root);
        fs::write(
            root.join("svelte.config.mjs"),
            r#"
export default {
  preprocess: {
    async markup() { await new Promise(() => {}); }
  }
};
"#,
        )
        .unwrap();

        let mut config = test_config(node);
        config.request_timeout = Duration::from_millis(120);
        config.max_consecutive_crashes = 2;
        let (sender, events) = unbounded();
        let sidecar = PreprocessSidecar::spawn(config, sender).unwrap();
        sidecar.preprocess(input(&root, 1, "hang")).unwrap();

        let mut crashes = 0;
        let opened_after = loop {
            match events.recv_timeout(Duration::from_secs(4)).unwrap() {
                PreprocessEvent::Crashed { .. } => crashes += 1,
                PreprocessEvent::CircuitOpen { crashes, .. } => break crashes,
                PreprocessEvent::Ready { .. }
                | PreprocessEvent::Result(_)
                | PreprocessEvent::Failed { .. } => {}
            }
        };
        assert_eq!(crashes, 2);
        assert_eq!(opened_after, 2);
        drop(sidecar);
        fs::remove_dir_all(root).ok();
    }

    #[test]
    fn one_successful_replay_does_not_hide_a_repeatable_crash() {
        let Some(node) = node() else {
            return;
        };
        let root = temp_dir("partial-crash");
        write_fake_compiler(&root);
        fs::write(
            root.join("svelte.config.mjs"),
            r#"
export default {
  preprocess: {
    markup({ content, filename }) {
      if (filename.endsWith('ZBad.svelte')) process.exit(19);
      return { code: `ok:${content}` };
    }
  }
};
"#,
        )
        .unwrap();

        let mut config = test_config(node);
        config.max_consecutive_crashes = 2;
        let (sender, events) = unbounded();
        let sidecar = PreprocessSidecar::spawn(config, sender).unwrap();
        for name in ["Good.svelte", "ZBad.svelte"] {
            sidecar
                .preprocess(PreprocessInput {
                    workspace: root.clone(),
                    filename: root.join(name),
                    version: 1,
                    text: name.to_string(),
                })
                .unwrap();
        }

        let mut saw_success = false;
        let crashes = loop {
            match events.recv_timeout(Duration::from_secs(4)).unwrap() {
                PreprocessEvent::Result(output) => {
                    saw_success |= output.filename.ends_with("Good.svelte");
                }
                PreprocessEvent::CircuitOpen { crashes, .. } => break crashes,
                PreprocessEvent::Ready { .. }
                | PreprocessEvent::Failed { .. }
                | PreprocessEvent::Crashed { .. } => {}
            }
        };
        assert!(saw_success);
        assert_eq!(crashes, 2);
        drop(sidecar);
        fs::remove_dir_all(root).ok();
    }
}
