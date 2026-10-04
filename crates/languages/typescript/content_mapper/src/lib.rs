use std::collections::HashSet;
use std::io::{BufRead, Write};

use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use serde::Deserialize;

const MAX_MESSAGE_BYTES: usize = 64 * 1024 * 1024;

#[derive(Deserialize)]
struct Request {
    jsonrpc: String,
    id: RequestId,
    #[serde(flatten)]
    method: Method,
}

#[derive(Deserialize)]
#[serde(untagged)]
enum RequestId {
    Number(u64),
    String(String),
}

#[derive(Deserialize)]
#[serde(tag = "method", content = "params", rename_all = "camelCase")]
enum Method {
    Initialize {
        #[serde(rename = "positionEncodings")]
        position_encodings: Vec<String>,
    },
    OpenProject {
        #[serde(rename = "projectHandle")]
        project_handle: String,
    },
    CloseProject {
        #[serde(rename = "projectHandle")]
        project_handle: String,
    },
    Transform {
        #[serde(rename = "fileName")]
        file_name: String,
        content: String,
        #[serde(rename = "projectHandle")]
        project_handle: String,
    },
}

/// # Errors
/// Returns transport errors, invalid requests, or transform failures.
pub fn serve(
    diagnostic_source: &str,
    mut transform: impl FnMut(&str, &str, &mut StructuredDataWriter) -> Result<(), String>,
) -> Result<(), Box<dyn std::error::Error>> {
    let mut input = std::io::stdin().lock();
    let mut output = std::io::stdout().lock();
    let mut projects = HashSet::new();
    let mut initialized = false;
    while let Some(message) = read_message(&mut input)? {
        let request: Request = serde_json::from_slice(&message)?;
        if request.jsonrpc != "2.0" {
            return Err("expected JSON-RPC 2.0".into());
        }
        let mut response = StructuredDataWriter::new(false);
        response
            .begin_object()
            .key("jsonrpc")
            .write_string("2.0")
            .key("id");
        match request.id {
            RequestId::Number(id) => {
                response.write_number(id);
            }
            RequestId::String(id) => {
                response.write_string(&id);
            }
        }
        response.key("result");
        match request.method {
            Method::Initialize { position_encodings } => {
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
            Method::OpenProject { project_handle } if initialized => {
                projects.insert(project_handle);
                response
                    .begin_object()
                    .key("configIdentity")
                    .write_string("")
                    .end_object();
            }
            Method::CloseProject { project_handle } if initialized => {
                projects.remove(&project_handle);
                response.null();
            }
            Method::Transform {
                file_name,
                content,
                project_handle,
            } if projects.contains(&project_handle) => {
                transform(&file_name, &content, &mut response)?;
            }
            _ => return Err("invalid content mapper lifecycle".into()),
        }
        response.end_object();
        let body = response.finish();
        write!(output, "Content-Length: {}\r\n\r\n{}", body.len(), body)?;
        output.flush()?;
    }
    Ok(())
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
