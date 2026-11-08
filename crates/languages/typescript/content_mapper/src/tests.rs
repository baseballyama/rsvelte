use rsvelte_kernel::output::structured_data::StructuredDataWriter;

fn message(body: &str) -> String {
    format!("Content-Length: {}\r\n\r\n{body}", body.len())
}

#[test]
fn a_failed_transform_fails_only_its_file() {
    let input = [
        concat!(
            r#"{"jsonrpc":"2.0","id":1,"method":"initialize","#,
            r#""params":{"positionEncodings":["utf-8"]}}"#
        ),
        r#"{"jsonrpc":"2.0","id":2,"method":"openProject","params":{"projectHandle":"p"}}"#,
        concat!(
            r#"{"jsonrpc":"2.0","id":3,"method":"transform","#,
            r#""params":{"fileName":"bad.svelte","content":"","projectHandle":"p"}}"#
        ),
        concat!(
            r#"{"jsonrpc":"2.0","id":4,"method":"transform","#,
            r#""params":{"fileName":"good.svelte","content":"","projectHandle":"p"}}"#
        ),
    ]
    .map(message)
    .concat();
    let mut output = Vec::new();
    let transform = |file: &str, _: &str, out: &mut StructuredDataWriter| {
        if file == "bad.svelte" {
            return Err("cannot read it".to_owned());
        }
        out.write_string("done");
        Ok(())
    };
    super::serve_on(input.as_bytes(), &mut output, "test", transform).expect("the session ends");
    let output = String::from_utf8(output).expect("UTF-8");
    let expected = [
        concat!(
            r#"{"jsonrpc":"2.0","id":1,"#,
            r#""result":{"positionEncoding":"utf-8","diagnosticSource":"test"}}"#
        ),
        r#"{"jsonrpc":"2.0","id":2,"result":{"configIdentity":""}}"#,
        concat!(
            r#"{"jsonrpc":"2.0","id":3,"#,
            r#""error":{"code":-32603,"message":"bad.svelte: cannot read it"}}"#
        ),
        r#"{"jsonrpc":"2.0","id":4,"result":"done"}"#,
    ]
    .map(message)
    .concat();
    assert_eq!(output, expected);
}
