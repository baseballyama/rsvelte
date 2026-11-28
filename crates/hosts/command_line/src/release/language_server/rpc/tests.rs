use super::{Id, Message, read, write};

async fn read_all(bytes: &[u8]) -> Vec<std::io::Result<Option<Vec<u8>>>> {
    let mut input = tokio::io::BufReader::new(bytes);
    let mut bodies = Vec::new();
    loop {
        let body = read(&mut input).await;
        let end = matches!(body, Ok(None) | Err(_));
        bodies.push(body);
        if end {
            return bodies;
        }
    }
}

#[tokio::test]
async fn reads_each_body_after_its_headers() {
    let bodies =
        read_all(b"Content-Length: 2\r\n\r\n{}content-length: 3\r\nContent-Type: x\r\n\r\n[1]")
            .await;
    let bodies: Vec<_> = bodies.into_iter().map(Result::unwrap).collect();
    assert_eq!(bodies, [Some(b"{}".to_vec()), Some(b"[1]".to_vec()), None]);
}

#[tokio::test]
async fn a_body_without_its_length_is_an_error() {
    let bodies = read_all(b"Content-Type: x\r\n\r\n{}").await;
    let [Err(error)] = bodies.as_slice() else {
        panic!("one error, not {bodies:?}");
    };
    assert_eq!(error.kind(), std::io::ErrorKind::InvalidData);
}

#[tokio::test]
async fn writes_the_length_in_bytes_and_keeps_the_payload() {
    let message: Message =
        serde_json::from_str(r#"{"jsonrpc":"2.0","id":"a","method":"m","params":{"x": "é"}}"#)
            .unwrap();
    let mut output = Vec::new();
    write(&mut output, &message).await.unwrap();
    let body = r#"{"jsonrpc":"2.0","id":"a","method":"m","params":{"x": "é"}}"#;
    assert_eq!(
        String::from_utf8(output).unwrap(),
        format!("Content-Length: {}\r\n\r\n{body}", body.len()),
    );
}

#[test]
fn an_error_response_names_its_request() {
    let message = Message::error(Id::Number(3), -32603, "it \"stopped\"");
    assert_eq!(
        serde_json::to_string(&message).unwrap(),
        r#"{"jsonrpc":"2.0","id":3,"error":{"code":-32603,"message":"it \"stopped\""}}"#,
    );
    assert!(message.is_response());
}

#[test]
fn a_null_result_stays_the_answer() {
    let response = r#"{"jsonrpc":"2.0","id":1,"result":null}"#;
    let message: Message = serde_json::from_str(response).unwrap();
    assert!(message.is_response());
    assert_eq!(serde_json::to_string(&message).unwrap(), response);
    let notification: Message = serde_json::from_str(r#"{"method":"exit"}"#).unwrap();
    assert_eq!(
        serde_json::to_string(&notification).unwrap(),
        r#"{"jsonrpc":"2.0","method":"exit"}"#,
    );
}
