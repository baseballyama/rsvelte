//! Server-side logging.
//!
//! stdout carries the JSON-RPC session, so anything written there that is not
//! a framed LSP message corrupts the stream beyond recovery — every diagnostic
//! about the server itself goes to stderr instead.

use std::fmt::Display;

pub fn warn(message: impl Display) {
    eprintln!("rsvelte-language-server: {message}");
}
