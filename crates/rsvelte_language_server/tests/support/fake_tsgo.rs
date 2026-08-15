use std::fs;
use std::io::{self, BufRead, Write};
use std::path::PathBuf;

fn main() {
    let state = PathBuf::from(std::env::args_os().nth(1).expect("state path"));
    let updated_uri = std::env::args().nth(2).expect("updated workspace URI");
    let generation = fs::read_to_string(&state)
        .ok()
        .and_then(|generation| generation.parse::<u32>().ok())
        .map_or(1, |generation| generation + 1);
    let expected_cwd = if generation >= 3 {
        state.parent().unwrap().join("remaining")
    } else {
        state.parent().unwrap().to_path_buf()
    };
    assert_eq!(
        std::env::current_dir().unwrap().canonicalize().unwrap(),
        expected_cwd.canonicalize().unwrap()
    );
    let stdin = io::stdin();
    let mut input = stdin.lock();
    let stdout = io::stdout();
    let mut output = stdout.lock();

    let initialize = read_message(&mut input).unwrap();
    assert!(initialize.contains(r#""method":"initialize""#));
    assert!(initialize.contains(r#""positionEncodings":["utf-8","utf-16"]"#));
    assert!(initialize.contains(r#""configuration":true"#));
    if generation >= 3 {
        assert!(
            initialize.contains(&format!(r#""rootUri":"{updated_uri}""#)),
            "{initialize}"
        );
        assert!(
            initialize.contains(&format!(r#""uri":"{updated_uri}""#)),
            "{initialize}"
        );
        assert!(initialize.contains(r#""name":"remaining""#), "{initialize}");
    } else {
        assert!(initialize.contains(r#""rootUri":"file:///workspace""#));
    }
    let initialize_id = json_id(&initialize);
    write_message(
        &mut output,
        &format!(
            r#"{{"jsonrpc":"2.0","id":{initialize_id},"result":{{"capabilities":{{"positionEncoding":"utf-8","hoverProvider":true}}}}}}"#,
        ),
    )
    .unwrap();

    let mut initialized = false;
    let mut configuration_ok = false;
    let mut opened = false;
    let mut replay_sent = false;
    loop {
        let message = read_message(&mut input).unwrap();
        if message.contains(r#""method":"initialized""#) {
            initialized = true;
            write_message(
                &mut output,
                r#"{"jsonrpc":"2.0","id":77,"method":"workspace/configuration","params":{"items":[{"section":"typescript"},{"section":"javascript"}]}}"#,
            )
            .unwrap();
        } else if message.contains(r#""id":77"#) && message.contains(r#""result""#) {
            assert!(message.contains(r#""importModuleSpecifierEnding":"index""#));
            assert!(message.contains(r#""suggest""#), "{message}");
            configuration_ok = true;
        } else if message.contains(r#""method":"textDocument/didOpen""#) {
            assert!(message.contains(r#""version":4"#));
            assert!(message.contains(r#""text":"export default 42;""#));
            opened = true;
        } else if message.contains(r#""method":"workspace/didChangeConfiguration""#) {
            assert!(message.contains(r#""kind":"updated-typescript""#));
            assert!(message.contains(r#""kind":"updated-javascript""#));
            write_message(
                &mut output,
                r#"{"jsonrpc":"2.0","id":78,"method":"workspace/configuration","params":{"items":[{"section":"javascript"},{"section":"unknown","scopeUri":"file:///src/App.tsx"}]}}"#,
            )
            .unwrap();
        } else if message.contains(r#""id":78"#) && message.contains(r#""result""#) {
            let javascript = message.find("updated-javascript").unwrap();
            let typescript = message.find("updated-typescript").unwrap();
            assert!(javascript < typescript);
            write_message(
                &mut output,
                r#"{"jsonrpc":"2.0","method":"$/test/configUpdated","params":{}}"#,
            )
            .unwrap();
        } else if message.contains(r#""method":"shutdown""#) {
            let id = json_id(&message);
            write_message(
                &mut output,
                &format!(r#"{{"jsonrpc":"2.0","id":{id},"result":null}}"#),
            )
            .unwrap();
        } else if message.contains(r#""method":"exit""#) {
            return;
        } else {
            panic!("unexpected message: {message}");
        }

        if initialized && configuration_ok && opened && !replay_sent {
            if generation == 1 {
                fs::write(&state, b"1").unwrap();
                std::process::exit(7);
            }
            fs::write(&state, generation.to_string()).unwrap();
            replay_sent = true;
            write_message(
                &mut output,
                &format!(
                    r#"{{"jsonrpc":"2.0","method":"$/test/replayed","params":{{"generation":{generation},"version":4,"text":"export default 42;"}}}}"#
                ),
            )
            .unwrap();
        }
    }
}

fn read_message(reader: &mut impl BufRead) -> io::Result<String> {
    let mut content_length = None;
    let mut line = String::new();
    loop {
        line.clear();
        reader.read_line(&mut line)?;
        if line == "\r\n" {
            break;
        }
        if let Some(value) = line.strip_prefix("Content-Length: ") {
            content_length = Some(value.trim().parse::<usize>().unwrap());
        }
    }
    let mut body = vec![0; content_length.expect("Content-Length")];
    reader.read_exact(&mut body)?;
    Ok(String::from_utf8(body).unwrap())
}

fn write_message(writer: &mut impl Write, body: &str) -> io::Result<()> {
    write!(writer, "Content-Length: {}\r\n\r\n{body}", body.len())?;
    writer.flush()
}

fn json_id(message: &str) -> &str {
    let rest = message.split_once(r#""id":"#).expect("id").1;
    if let Some(rest) = rest.strip_prefix('"') {
        let end = rest.find('"').expect("string id");
        &message[message.len() - rest.len() - 1..message.len() - rest.len() + end + 1]
    } else {
        let end = rest
            .find(|character: char| !character.is_ascii_digit() && character != '-')
            .unwrap_or(rest.len());
        &rest[..end]
    }
}
