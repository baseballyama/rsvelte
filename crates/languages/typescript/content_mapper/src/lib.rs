use std::collections::HashMap;
use std::io::{BufRead, Write};

use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use serde::Deserialize;
use serde_json::value::RawValue;

const MAX_MESSAGE_BYTES: usize = 64 * 1024 * 1024;

#[derive(Deserialize)]
struct Request {
    jsonrpc: String,
    id: RequestId,
    method: String,
    // Decoded per method: `flatten` cannot carry the raw `options` of `openProject`.
    #[serde(rename = "params")]
    parameters: Box<RawValue>,
}

#[derive(Deserialize)]
#[serde(untagged)]
enum RequestId {
    Number(u64),
    String(String),
}

enum Method {
    Initialize(InitializeParameters),
    OpenProject(OpenProjectParameters),
    CloseProject(ProjectParameters),
    Transform(TransformParameters),
}

#[derive(Deserialize)]
struct InitializeParameters {
    #[serde(rename = "positionEncodings")]
    position_encodings: Vec<String>,
}

#[derive(Deserialize)]
struct OpenProjectParameters {
    #[serde(rename = "projectHandle")]
    project_handle: String,
    /// `contentMappers[].options` of the project's tsconfig, as written.
    options: Option<Box<RawValue>>,
}

#[derive(Deserialize)]
struct ProjectParameters {
    #[serde(rename = "projectHandle")]
    project_handle: String,
}

#[derive(Deserialize)]
struct TransformParameters {
    #[serde(rename = "fileName")]
    file_name: String,
    content: String,
    #[serde(rename = "projectHandle")]
    project_handle: String,
}

impl Request {
    fn method(&self) -> Result<Method, Box<dyn std::error::Error>> {
        let parameters = self.parameters.get();
        Ok(match self.method.as_str() {
            "initialize" => Method::Initialize(serde_json::from_str(parameters)?),
            "openProject" => Method::OpenProject(serde_json::from_str(parameters)?),
            "closeProject" => Method::CloseProject(serde_json::from_str(parameters)?),
            "transform" => Method::Transform(serde_json::from_str(parameters)?),
            other => return Err(format!("unknown method `{other}`").into()),
        })
    }
}

/// One file to transform.
#[derive(Debug, Clone, Copy)]
pub struct Input<'a> {
    pub file_name: &'a str,
    pub content: &'a str,
    /// The JSON of `contentMappers[].options` in the file's project, if any.
    pub options: Option<&'a str>,
}

/// # Errors
/// Returns transport errors, invalid requests, or transform failures.
pub fn serve(
    diagnostic_source: &str,
    transform: impl FnMut(Input<'_>, &mut StructuredDataWriter) -> Result<(), String>,
) -> Result<(), Box<dyn std::error::Error>> {
    serve_on(
        std::io::stdin().lock(),
        std::io::stdout().lock(),
        diagnostic_source,
        transform,
    )
}

fn serve_on(
    mut input: impl BufRead,
    mut output: impl Write,
    diagnostic_source: &str,
    mut transform: impl FnMut(Input<'_>, &mut StructuredDataWriter) -> Result<(), String>,
) -> Result<(), Box<dyn std::error::Error>> {
    let mut projects: HashMap<String, Option<Box<RawValue>>> = HashMap::new();
    let mut initialized = false;
    while let Some(message) = read_message(&mut input)? {
        let request: Request = serde_json::from_slice(&message)?;
        if request.jsonrpc != "2.0" {
            return Err("expected JSON-RPC 2.0".into());
        }
        let method = request.method()?;
        // A file that cannot be transformed fails alone; the session goes on for the others.
        if let Method::Transform(TransformParameters {
            file_name,
            content,
            project_handle,
        }) = &method
            && let Some(options) = projects.get(project_handle)
        {
            let mut response = response_to(&request.id);
            response.key("result");
            let input = Input {
                file_name,
                content,
                options: options.as_deref().map(RawValue::get),
            };
            if let Err(message) = transform(input, &mut response) {
                response = response_to(&request.id);
                response
                    .key("error")
                    .begin_object()
                    .key("code")
                    .write_number(TRANSFORM_FAILED)
                    .key("message")
                    .write_string(&format!("{file_name}: {message}"))
                    .end_object();
            }
            send(&mut output, response)?;
            continue;
        }
        let mut response = response_to(&request.id);
        response.key("result");
        match method {
            Method::Initialize(InitializeParameters { position_encodings }) => {
                if !position_encodings
                    .iter()
                    .any(|encoding| encoding == "utf-8")
                {
                    return Err("the host must support UTF-8 positions".into());
                }
                initialized = true;
                response
                    .begin_object()
                    .key("positionEncoding")
                    .write_string("utf-8")
                    .key("diagnosticSource")
                    .write_string(diagnostic_source)
                    .end_object();
            }
            Method::OpenProject(OpenProjectParameters {
                project_handle,
                options,
            }) if initialized => {
                projects.insert(project_handle, options);
                response
                    .begin_object()
                    .key("configIdentity")
                    .write_string("")
                    .end_object();
            }
            Method::CloseProject(ProjectParameters { project_handle }) if initialized => {
                projects.remove(&project_handle);
                response.null();
            }
            _ => return Err("invalid content mapper lifecycle".into()),
        }
        send(&mut output, response)?;
    }
    Ok(())
}

fn response_to(id: &RequestId) -> StructuredDataWriter {
    let mut response = StructuredDataWriter::new(false);
    response
        .begin_object()
        .key("jsonrpc")
        .write_string("2.0")
        .key("id");
    match id {
        RequestId::Number(id) => response.write_number(*id),
        RequestId::String(id) => response.write_string(id),
    };
    response
}

/// JSON-RPC's code for an error inside the server.
const TRANSFORM_FAILED: i32 = -32603;

fn send(output: &mut impl Write, mut response: StructuredDataWriter) -> std::io::Result<()> {
    response.end_object();
    let body = response.finish();
    write!(output, "Content-Length: {}\r\n\r\n{}", body.len(), body)?;
    output.flush()
}

fn read_message(input: &mut impl BufRead) -> Result<Option<Vec<u8>>, Box<dyn std::error::Error>> {
    let mut length = None;
    let mut line = String::new();
    loop {
        line.clear();
        if input.read_line(&mut line)? == 0 {
            return if length.is_none() {
                Ok(None)
            } else {
                Err("incomplete message header".into())
            };
        }
        if line == "\r\n" {
            break;
        }
        let (name, value) = line
            .trim_end()
            .split_once(':')
            .ok_or("invalid message header")?;
        if name.eq_ignore_ascii_case("Content-Length") {
            if length.is_some() {
                return Err("duplicate content length".into());
            }
            length = Some(value.trim().parse::<usize>()?);
        }
    }
    let length = length.ok_or("missing content length")?;
    if length > MAX_MESSAGE_BYTES {
        return Err("message exceeds size limit".into());
    }
    let mut body = vec![0; length];
    input.read_exact(&mut body)?;
    Ok(Some(body))
}

mod mappings;
pub use mappings::write_mappings;

mod precomputed;
pub use precomputed::serve_precomputed;

#[cfg(test)]
mod tests;
