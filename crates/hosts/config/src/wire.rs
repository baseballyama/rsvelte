use std::io::{Read, Write};
use std::path::Path;

use rsvelte_kernel::computation::functions::CallError;

pub(crate) const MAX_MESSAGE_BYTES: usize = 16 * 1024 * 1024;

struct Buffer(Vec<u8>);

impl Write for Buffer {
    fn write(&mut self, buf: &[u8]) -> std::io::Result<usize> {
        if buf.len() >= MAX_MESSAGE_BYTES - self.0.len() {
            return Err(std::io::Error::other("configuration request is too large"));
        }
        self.0.extend_from_slice(buf);
        Ok(buf.len())
    }

    fn flush(&mut self) -> std::io::Result<()> {
        Ok(())
    }
}

pub(crate) fn encode(request: &impl serde::Serialize) -> Result<Vec<u8>, CallError> {
    let mut buffer = Buffer(Vec::new());
    serde_json::to_writer(&mut buffer, request).map_err(|error| CallError(error.to_string()))?;
    buffer.0.push(b'\n');
    Ok(buffer.0)
}

pub(crate) fn read(path: &Path) -> Result<String, CallError> {
    let file = std::fs::File::open(path)
        .map_err(|error| CallError(format!("{}: {error}", path.display())))?;
    let mut text = String::new();
    file.take((MAX_MESSAGE_BYTES + 1) as u64)
        .read_to_string(&mut text)
        .map_err(|error| CallError(format!("{}: {error}", path.display())))?;
    if text.len() > MAX_MESSAGE_BYTES {
        return Err(CallError("configuration file is too large".into()));
    }
    Ok(text)
}
