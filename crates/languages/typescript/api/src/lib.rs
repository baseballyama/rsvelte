//! A client for the API of native TypeScript 7.1 (`tsc --api`): one checker process, asked over
//! its stdin and stdout. Type checking and typed lint ask the same snapshot.

use std::io::{BufReader, BufWriter, Read};
use std::path::{Path, PathBuf};
use std::process::{Child, ChildStdin, ChildStdout, Command, Stdio};

use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use serde::Deserialize;

/// A running `tsc --api`. Requests are serial; the process ends when the session drops.
#[derive(Debug)]
pub struct Session {
    child: Child,
    input: BufWriter<ChildStdin>,
    output: BufReader<ChildStdout>,
    program: String,
}

/// A program the checker built from one tsconfig, in one snapshot.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Project {
    pub snapshot: u64,
    pub handle: u64,
    /// The root files the tsconfig names, after its `files`, `include` and `exclude`.
    pub root_files: Vec<PathBuf>,
}

/// What the checker reads before the disk: files by their full text, and links to directories on
/// the disk.
#[derive(Debug, Default)]
pub struct Layer {
    pub files: Vec<(PathBuf, String)>,
    /// A link path, then the disk directory it reaches.
    pub links: Vec<(PathBuf, PathBuf)>,
}

#[derive(Debug, Deserialize, PartialEq, Eq)]
pub struct Diagnostic {
    #[serde(rename = "fileName")]
    pub file_name: Option<PathBuf>,
    /// UTF-16 offsets in the original text of the file; -1 for a diagnostic of the program.
    #[serde(rename = "pos")]
    pub start_offset: i64,
    #[serde(rename = "end")]
    pub end_offset: i64,
    #[serde(rename = "startPosition")]
    pub start_position: Option<Position>,
    #[serde(rename = "endPosition")]
    pub end_position: Option<Position>,
    pub code: u32,
    pub category: u8,
    pub text: String,
    #[serde(rename = "messageChain", default)]
    pub message_chain: Vec<Self>,
}

/// Zero-based, with the character in UTF-16 code units.
#[derive(Debug, Deserialize, Clone, Copy, PartialEq, Eq)]
pub struct Position {
    pub line: u32,
    pub character: u32,
}

impl Diagnostic {
    /// The message chain, one line per link, indented two spaces per level, as
    /// `ts.flattenDiagnosticMessageText(…, "\n")` renders it.
    #[must_use]
    pub fn flattened_message(&self) -> String {
        let mut out = self.text.clone();
        flatten(&self.message_chain, 1, &mut out);
        out
    }
}

fn flatten(chain: &[Diagnostic], level: usize, out: &mut String) {
    for link in chain {
        out.push('\n');
        out.extend(std::iter::repeat_n("  ", level));
        out.push_str(&link.text);
        flatten(&link.message_chain, level + 1, out);
    }
}

#[derive(Deserialize)]
struct Snapshot {
    snapshot: u64,
    projects: Vec<ProjectResponse>,
}

#[derive(Deserialize)]
struct ProjectResponse {
    handle: u64,
    #[serde(rename = "configFileName")]
    config_file_name: PathBuf,
    #[serde(rename = "parsedCommandLine")]
    parsed: Option<ParsedCommandLine>,
}

#[derive(Deserialize)]
struct ParsedCommandLine {
    #[serde(rename = "fileNames", default)]
    file_names: Vec<PathBuf>,
}

/// Which diagnostics of a program to ask for.
#[derive(Debug, Clone, Copy)]
pub enum DiagnosticKind {
    /// Errors in the tsconfig and the options.
    Program,
    Syntactic,
    Semantic,
}

impl DiagnosticKind {
    const fn method(self) -> &'static str {
        match self {
            Self::Program => "getProgramDiagnostics",
            Self::Syntactic => "getSyntacticDiagnostics",
            Self::Semantic => "getSemanticDiagnostics",
        }
    }
}

impl Session {
    /// Starts `program arguments --api` in `directory`, with content mappers allowed to run.
    /// `arguments` start the checker, such as a script for `node`; the API mode takes no
    /// compiler options.
    ///
    /// # Errors
    /// The program cannot start, or does not answer `initialize`.
    pub fn start(program: &Path, arguments: &[String], directory: &Path) -> Result<Self, String> {
        let name = program.display().to_string();
        let mut child = Command::new(program)
            .args(arguments)
            .arg("--api")
            .arg("--cwd")
            .arg(directory)
            .arg(format!(
                "--useCaseSensitiveFileNames={}",
                case_sensitive(directory)
            ))
            .arg("--runExternalCode")
            .current_dir(directory)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .spawn()
            .map_err(|e| format!("{name}: {e}"))?;
        let (Some(input), Some(output)) = (child.stdin.take(), child.stdout.take()) else {
            return Err(format!("{name}: no pipes"));
        };
        let mut session = Self {
            child,
            input: BufWriter::new(input),
            output: BufReader::new(output),
            program: name,
        };
        if let Err(e) = session.request("initialize", b"null") {
            // A checker without the API mode prints its usage or errors instead of a message.
            let mut printed = Vec::new();
            drop(session.output.read_to_end(&mut printed));
            let printed = String::from_utf8_lossy(&printed);
            return Err(format!("{e}: {}", printed.trim()));
        }
        Ok(session)
    }

    /// Opens the projects of `configs` in a new snapshot, in the same order, with `layer` over
    /// the disk.
    ///
    /// # Errors
    /// The checker fails, or does not open a project for each config.
    pub fn open(&mut self, configs: &[&Path], layer: &Layer) -> Result<Vec<Project>, String> {
        let mut w = StructuredDataWriter::new(false);
        w.begin_object().key("openProjects").begin_array();
        for c in configs {
            w.write_string(&c.to_string_lossy());
        }
        w.end_array();
        if !layer.files.is_empty() || !layer.links.is_empty() {
            w.key("fileSystem")
                .begin_object()
                .key("kind")
                .write_string("layer")
                .key("files")
                .begin_object();
            for (path, text) in &layer.files {
                w.key(&path.to_string_lossy()).write_string(text);
            }
            w.end_object().key("symlinks").begin_object();
            for (link, target) in &layer.links {
                w.key(&link.to_string_lossy())
                    .begin_object()
                    .key("target")
                    .write_string(&target.to_string_lossy())
                    .key("host")
                    .write_boolean(true)
                    .end_object();
            }
            w.end_object().end_object();
        }
        w.end_object();
        let response = self.request("createSnapshot", w.finish().as_bytes())?;
        let snapshot: Snapshot = self.decode("createSnapshot", &response)?;
        configs
            .iter()
            .map(|c| {
                snapshot
                    .projects
                    .iter()
                    .find(|p| p.config_file_name == *c)
                    .map(|p| Project {
                        snapshot: snapshot.snapshot,
                        handle: p.handle,
                        root_files: p
                            .parsed
                            .as_ref()
                            .map(|c| c.file_names.clone())
                            .unwrap_or_default(),
                    })
                    .ok_or_else(|| format!("{}: no project for {}", self.program, c.display()))
            })
            .collect()
    }

    /// `files`: `None` for every file of the program.
    ///
    /// # Errors
    /// The checker fails or answers in an unknown shape.
    pub fn diagnostics(
        &mut self,
        project: &Project,
        kind: DiagnosticKind,
        files: Option<&[&Path]>,
    ) -> Result<Vec<Diagnostic>, String> {
        let mut w = StructuredDataWriter::new(false);
        w.begin_object()
            .key("snapshot")
            .write_number(project.snapshot)
            .key("project")
            .write_number(project.handle);
        if let Some(files) = files {
            w.key("files").begin_array();
            for f in files {
                w.write_string(&f.to_string_lossy());
            }
            w.end_array();
        }
        w.end_object();
        let method = kind.method();
        let response = self.request(method, w.finish().as_bytes())?;
        if response.is_empty() {
            return Ok(Vec::new());
        }
        let found: Option<Vec<Diagnostic>> = self.decode(method, &response)?;
        Ok(found.unwrap_or_default())
    }

    /// Frees a snapshot's programs in the checker.
    ///
    /// # Errors
    /// The checker fails.
    pub fn release(&mut self, snapshot: u64) -> Result<(), String> {
        let mut w = StructuredDataWriter::new(false);
        w.begin_object()
            .key("snapshot")
            .write_number(snapshot)
            .end_object();
        self.request("release", w.finish().as_bytes()).map(drop)
    }

    fn decode<'a, T: Deserialize<'a>>(&self, method: &str, bytes: &'a [u8]) -> Result<T, String> {
        serde_json::from_slice(bytes)
            .map_err(|e| format!("{}: `{method}` answered {e}", self.program))
    }

    fn request(&mut self, method: &str, payload: &[u8]) -> Result<Vec<u8>, String> {
        let io = |e: std::io::Error| format!("{}: `{method}`: {e}", self.program);
        transport::write(
            &mut self.input,
            transport::REQUEST,
            method.as_bytes(),
            payload,
        )
        .map_err(io)?;
        loop {
            let message = transport::read(&mut self.output).map_err(io)?;
            let same = message.method == method.as_bytes();
            match message.kind {
                transport::RESPONSE if same => return Ok(message.payload),
                transport::ERROR if same => {
                    return Err(format!(
                        "{}: `{method}`: {}",
                        self.program,
                        String::from_utf8_lossy(&message.payload)
                    ));
                }
                // No callbacks are registered, so the checker reads the file system itself.
                transport::CALL => {
                    transport::write(
                        &mut self.input,
                        transport::CALL_ERROR,
                        &message.method,
                        b"no callbacks",
                    )
                    .map_err(io)?;
                }
                kind => {
                    return Err(format!(
                        "{}: `{method}`: unexpected message {kind} for `{}`",
                        self.program,
                        String::from_utf8_lossy(&message.method)
                    ));
                }
            }
        }
    }
}

impl Drop for Session {
    fn drop(&mut self) {
        // Best effort: the checker exits when its input closes; a kill covers one that hangs.
        drop(self.child.kill());
        drop(self.child.wait());
    }
}

/// Whether the file system at `directory` tells `A` from `a`, as the TypeScript client infers it.
fn case_sensitive(directory: &Path) -> bool {
    let Some(name) = directory.to_str() else {
        return true;
    };
    let swapped: String = name
        .chars()
        .map(|c| {
            if c.is_uppercase() {
                c.to_ascii_lowercase()
            } else {
                c.to_ascii_uppercase()
            }
        })
        .collect();
    swapped == name || !Path::new(&swapped).exists()
}

mod transport;

#[cfg(test)]
mod tests;
