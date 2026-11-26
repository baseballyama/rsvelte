//! The language server protocol's JSON-RPC messages, each after a `Content-Length` header. A
//! payload stays the text its sender wrote, since the router reads only what it routes by.

use serde::{Deserialize, Deserializer, Serialize, Serializer};
use serde_json::value::RawValue;
use tokio::io::{AsyncBufRead, AsyncBufReadExt, AsyncReadExt, AsyncWrite, AsyncWriteExt};

/// A request's identifier, as its sender chose it.
#[derive(Clone, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(untagged)]
pub(super) enum Id {
    Number(i64),
    String(String),
}

/// A request, a notification or a response.
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub(super) struct Message {
    #[serde(default)]
    jsonrpc: Version,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(super) id: Option<Id>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub(super) method: Option<String>,
    #[serde(
        rename = "params",
        default,
        deserialize_with = "present",
        skip_serializing_if = "Option::is_none"
    )]
    pub(super) parameters: Option<Box<RawValue>>,
    #[serde(
        default,
        deserialize_with = "present",
        skip_serializing_if = "Option::is_none"
    )]
    pub(super) result: Option<Box<RawValue>>,
    #[serde(
        default,
        deserialize_with = "present",
        skip_serializing_if = "Option::is_none"
    )]
    pub(super) error: Option<Box<RawValue>>,
}

/// A member that is there, `null` too: a response's `"result": null` is its answer.
fn present<'de, D: Deserializer<'de>>(deserializer: D) -> Result<Option<Box<RawValue>>, D::Error> {
    Box::<RawValue>::deserialize(deserializer).map(Some)
}

impl Message {
    /// The error response to request `id`.
    pub(super) fn error(id: Id, code: i64, message: &str) -> Self {
        let message = serde_json::to_string(message).unwrap_or_default();
        Self {
            id: Some(id),
            error: RawValue::from_string(format!(r#"{{"code":{code},"message":{message}}}"#)).ok(),
            ..Self::default()
        }
    }

    /// A response: a message with an `id` and no `method`.
    pub(super) const fn is_response(&self) -> bool {
        self.method.is_none() && self.id.is_some()
    }
}

/// The protocol's version, which every message names.
#[derive(Clone, Debug, Default)]
struct Version;

impl Serialize for Version {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.serialize_str("2.0")
    }
}

impl<'de> Deserialize<'de> for Version {
    fn deserialize<D: Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        serde::de::IgnoredAny::deserialize(deserializer).map(|_| Self)
    }
}

/// The next message's body, or `None` at the end of `input`.
pub(super) async fn read(
    input: &mut (impl AsyncBufRead + Unpin),
) -> std::io::Result<Option<Vec<u8>>> {
    let mut length = None;
    let mut line = String::new();
    loop {
        line.clear();
        if input.read_line(&mut line).await? == 0 {
            return Ok(None);
        }
        let header = line.trim_end();
        if header.is_empty() {
            break;
        }
        if let Some((name, value)) = header.split_once(':')
            && name.eq_ignore_ascii_case("content-length")
        {
            length = Some(value.trim().parse::<usize>().map_err(invalid)?);
        }
    }
    let length = length.ok_or_else(|| invalid("a message without a Content-Length header"))?;
    let mut body = vec![0; length];
    input.read_exact(&mut body).await?;
    Ok(Some(body))
}

/// Writes `message` with its header.
pub(super) async fn write(
    output: &mut (impl AsyncWrite + Unpin),
    message: &Message,
) -> std::io::Result<()> {
    let body = serde_json::to_vec(message).map_err(invalid)?;
    let header = format!("Content-Length: {}\r\n\r\n", body.len());
    output.write_all(header.as_bytes()).await?;
    output.write_all(&body).await?;
    output.flush().await
}

fn invalid(error: impl Into<Box<dyn std::error::Error + Send + Sync>>) -> std::io::Error {
    std::io::Error::new(std::io::ErrorKind::InvalidData, error)
}

#[cfg(test)]
mod tests;
