//! The stdio transport the server runs on.
//!
//! `lsp_server::Connection::stdio` ends its reader thread on the first frame
//! whose body will not deserialize, which closes the connection and takes the
//! whole server down — one malformed message from any client, extension or
//! proxy in the chain and every open document loses its language features. A
//! body that failed to parse has already been consumed in full, so the stream is
//! still framed correctly at that point and the message can simply be dropped.
//! A malformed *header* is different: the reader no longer knows where the next
//! frame starts, and that stays fatal.

use std::io::{self, BufRead};
use std::thread::{self, JoinHandle};

use crossbeam_channel::{Receiver, Sender, bounded};
use lsp_server::{Connection, Message};

use crate::log;

/// The reader and writer threads of [`stdio`], joined after the server stops.
pub struct IoThreads {
    reader: JoinHandle<io::Result<()>>,
    writer: JoinHandle<io::Result<()>>,
}

impl IoThreads {
    /// # Errors
    ///
    /// Returns the first I/O error either thread ended with.
    pub fn join(self) -> io::Result<()> {
        match self.reader.join() {
            Ok(result) => result?,
            Err(payload) => std::panic::resume_unwind(payload),
        }
        match self.writer.join() {
            Ok(result) => result,
            Err(payload) => std::panic::resume_unwind(payload),
        }
    }
}

/// A `Connection` over stdin/stdout that survives an undecodable message.
#[must_use]
pub fn stdio() -> (Connection, IoThreads) {
    let (writer_sender, writer_receiver) = bounded::<Message>(0);
    let writer = thread::Builder::new()
        .name("LspServerWriter".to_owned())
        .spawn(move || write_loop(&writer_receiver))
        .expect("spawn LSP writer thread");

    let (reader_sender, reader_receiver) = bounded::<Message>(0);
    let reader = thread::Builder::new()
        .name("LspServerReader".to_owned())
        .spawn(move || read_loop(&reader_sender))
        .expect("spawn LSP reader thread");

    (
        Connection {
            sender: writer_sender,
            receiver: reader_receiver,
        },
        IoThreads { reader, writer },
    )
}

fn write_loop(receiver: &Receiver<Message>) -> io::Result<()> {
    let stdout = io::stdout();
    let mut stdout = stdout.lock();
    for message in receiver {
        message.write(&mut stdout)?;
    }
    Ok(())
}

fn read_loop(sender: &Sender<Message>) -> io::Result<()> {
    let stdin = io::stdin();
    let mut stdin = stdin.lock();
    loop {
        let Some(body) = read_frame(&mut stdin)? else {
            return Ok(());
        };
        let message: Message = match serde_json::from_slice(&body) {
            Ok(message) => message,
            Err(err) => {
                log::warn(format_args!("dropping undecodable message: {err}"));
                continue;
            }
        };
        let is_exit = matches!(&message, Message::Notification(n) if n.method == "exit");
        if sender.send(message).is_err() {
            return Ok(());
        }
        if is_exit {
            return Ok(());
        }
    }
}

/// The body of the next frame, or `None` at end of input.
fn read_frame(reader: &mut impl BufRead) -> io::Result<Option<Vec<u8>>> {
    let mut length = None;
    loop {
        let mut line = String::new();
        if reader.read_line(&mut line)? == 0 {
            return Ok(None);
        }
        let line = line.trim_end_matches(['\r', '\n']);
        if line.is_empty() {
            break;
        }
        let Some((name, value)) = line.split_once(':') else {
            return Err(io::Error::new(
                io::ErrorKind::InvalidData,
                format!("malformed header: {line:?}"),
            ));
        };
        if name.eq_ignore_ascii_case("Content-Length") {
            length = Some(value.trim().parse::<usize>().map_err(|err| {
                io::Error::new(
                    io::ErrorKind::InvalidData,
                    format!("bad Content-Length: {err}"),
                )
            })?);
        }
    }
    let Some(length) = length else {
        return Err(io::Error::new(
            io::ErrorKind::InvalidData,
            "frame without a Content-Length header",
        ));
    };
    let mut body = vec![0u8; length];
    reader.read_exact(&mut body)?;
    Ok(Some(body))
}
