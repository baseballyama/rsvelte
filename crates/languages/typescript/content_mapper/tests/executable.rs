//! The shipped executable answers the protocol. Being an integration test, it also makes
//! `cargo test --workspace` build the executable that other crates' tests start.

use std::io::Write;
use std::process::{Command, Stdio};

#[test]
fn the_executable_answers_initialize_and_ends_with_its_input() {
    let body = concat!(
        r#"{"jsonrpc":"2.0","id":1,"method":"initialize","#,
        r#""params":{"positionEncodings":["utf-8"]}}"#
    );
    let mut child = Command::new(env!("CARGO_BIN_EXE_rsvelte-typescript-content-mapper"))
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("the executable starts");
    let mut stdin = child.stdin.take().expect("piped");
    write!(stdin, "Content-Length: {}\r\n\r\n{body}", body.len()).expect("write");
    drop(stdin);
    let output = child.wait_with_output().expect("the executable ends");
    assert!(output.status.success(), "{output:?}");
    let stdout = String::from_utf8(output.stdout).expect("UTF-8");
    assert!(
        stdout.contains(r#""id":1,"result":{"positionEncoding""#),
        "{stdout}"
    );
}
