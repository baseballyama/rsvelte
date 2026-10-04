use std::io::{BufRead, BufReader, Read, Write};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::mpsc::{SyncSender, sync_channel};
use std::sync::{Arc, Mutex};
use std::time::Duration;

use rsvelte_kernel::computation::functions::CallError;
use serde::{Deserialize, Serialize};

use crate::{
    Configuration, FunctionReference, FunctionResolver, LoadedConfiguration, Loader, TextContract,
    TextFunction,
};

const PROTOCOL_VERSION: u32 = 1;
use crate::wire::{self, MAX_MESSAGE_BYTES};
const RESPONSE_TIMEOUT: Duration = Duration::from_secs(30);
const NODE_SERVER: &str = include_str!("../../../../tools/config/node.mjs");

#[derive(Debug)]
pub struct ProcessLoader {
    pub executable: PathBuf,
    pub arguments: Vec<String>,
    pub response_timeout: Duration,
}

impl ProcessLoader {
    #[must_use]
    pub const fn new(executable: PathBuf, arguments: Vec<String>) -> Self {
        Self {
            executable,
            arguments,
            response_timeout: RESPONSE_TIMEOUT,
        }
    }

    #[must_use]
    pub fn node(executable: PathBuf, mut arguments: Vec<String>) -> Self {
        arguments.extend([
            "--input-type=module".into(),
            "--eval".into(),
            NODE_SERVER.into(),
        ]);
        Self::new(executable, arguments)
    }
}

#[derive(Serialize)]
#[serde(tag = "operation", rename_all = "lowercase")]
enum Request<'a> {
    Load {
        version: u32,
        path: &'a Path,
    },
    Call {
        handle: &'a str,
        contract: &'a str,
        version: u32,
        names: &'a [&'a str],
        arguments: &'a [&'a str],
    },
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
struct Response<T> {
    version: u32,
    #[serde(default)]
    error: Option<String>,
    result: Option<T>,
}

#[derive(Debug)]
struct Session {
    child: Child,
    input: SyncSender<Pending>,
    failed: bool,
    response_timeout: Duration,
}

#[derive(Debug)]
struct Pending {
    request: Vec<u8>,
    response: SyncSender<Result<Vec<u8>, CallError>>,
}

impl Session {
    fn request<T: serde::de::DeserializeOwned>(
        &mut self,
        request: &Request<'_>,
    ) -> Result<T, CallError> {
        if self.failed {
            return Err(CallError("configuration runtime has failed".into()));
        }
        let message = wire::encode(request)?;
        match self.exchange(message) {
            Ok(Response {
                error: Some(error),
                result: None,
                ..
            }) => Err(CallError(error)),
            Ok(Response {
                error: None,
                result: Some(result),
                ..
            }) => Ok(result),
            result => {
                self.failed = true;
                drop(self.child.kill());
                Err(result.err().unwrap_or_else(|| {
                    CallError(
                        "configuration response must contain exactly one result or error".into(),
                    )
                }))
            }
        }
    }

    fn exchange<T: serde::de::DeserializeOwned>(
        &self,
        request: Vec<u8>,
    ) -> Result<Response<T>, CallError> {
        let (response, received) = sync_channel(1);
        self.input
            .send(Pending { request, response })
            .map_err(|error| CallError(error.to_string()))?;
        let line = received
            .recv_timeout(self.response_timeout)
            .map_err(|error| CallError(format!("configuration runtime response: {error}")))??;
        let response: Response<T> = serde_json::from_slice(&line)
            .map_err(|error| CallError(format!("invalid configuration response: {error}")))?;
        if response.version != PROTOCOL_VERSION {
            return Err(CallError("configuration protocol version mismatch".into()));
        }
        Ok(response)
    }
}

impl Drop for Session {
    fn drop(&mut self) {
        drop(self.child.kill());
        drop(self.child.wait());
    }
}

#[derive(Debug)]
struct Resolver {
    session: Arc<Mutex<Session>>,
    native: crate::native::Resolver,
}

impl FunctionResolver for Resolver {
    fn resolve(
        &self,
        reference: &FunctionReference,
        contract: &'static TextContract,
    ) -> Result<TextFunction, CallError> {
        let FunctionReference::Runtime { handle } = reference else {
            return self.native.resolve(reference, contract);
        };
        let session = Arc::clone(&self.session);
        let handle = handle.clone();
        Ok(TextFunction::new(contract, move |arguments| {
            session
                .lock()
                .map_err(|error| CallError(error.to_string()))?
                .request(&Request::Call {
                    handle: &handle,
                    contract: contract.identifier,
                    version: contract.version,
                    names: contract.arguments,
                    arguments,
                })
        }))
    }
}

impl Loader for ProcessLoader {
    fn load(&self, path: &Path) -> Result<LoadedConfiguration, CallError> {
        let path = std::fs::canonicalize(path).map_err(|error| CallError(error.to_string()))?;
        let mut child = Command::new(&self.executable)
            .args(&self.arguments)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .spawn()
            .map_err(|error| CallError(format!("{}: {error}", self.executable.display())))?;
        let stdout = child.stdout.take().expect("stdout is piped");
        let mut stdin = child.stdin.take().expect("stdin is piped");
        let (input, requests) = sync_channel::<Pending>(1);
        let mut session = Session {
            input,
            child,
            failed: false,
            response_timeout: self.response_timeout,
        };
        std::thread::Builder::new()
            .name("rsvelte-config-io".into())
            .spawn(move || {
                let mut reader = BufReader::new(stdout);
                while let Ok(pending) = requests.recv() {
                    if let Err(error) = stdin
                        .write_all(&pending.request)
                        .and_then(|()| stdin.flush())
                    {
                        drop(pending.response.send(Err(CallError(error.to_string()))));
                        break;
                    }
                    let mut line = Vec::new();
                    let read = Read::by_ref(&mut reader)
                        .take((MAX_MESSAGE_BYTES + 1) as u64)
                        .read_until(b'\n', &mut line);
                    let result = match read {
                        Err(error) => Err(CallError(error.to_string())),
                        Ok(_) if line.len() > MAX_MESSAGE_BYTES || line.last() != Some(&b'\n') => {
                            Err(CallError(
                                "configuration runtime returned a missing or oversized response"
                                    .into(),
                            ))
                        }
                        Ok(_) => Ok(line),
                    };
                    let failed = result.is_err();
                    if pending.response.send(result).is_err() || failed {
                        break;
                    }
                }
            })
            .map_err(|error| CallError(error.to_string()))?;
        let configuration: Configuration = session.request(&Request::Load {
            version: PROTOCOL_VERSION,
            path: &path,
        })?;
        Ok(LoadedConfiguration {
            configuration,
            functions: Arc::new(Resolver {
                session: Arc::new(Mutex::new(session)),
                native: crate::native::Resolver::new(
                    path.parent().expect("canonical file has a parent"),
                ),
            }),
        })
    }
}
