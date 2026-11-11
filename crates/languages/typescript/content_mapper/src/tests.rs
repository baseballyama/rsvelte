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
    let transform = |input: super::Input<'_>, out: &mut StructuredDataWriter| {
        if input.file_name == "bad.svelte" {
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

#[test]
fn a_transform_gets_the_options_of_its_project() {
    let input = [
        concat!(
            r#"{"jsonrpc":"2.0","id":1,"method":"initialize","#,
            r#""params":{"positionEncodings":["utf-8"]}}"#
        ),
        concat!(
            r#"{"jsonrpc":"2.0","id":2,"method":"openProject","#,
            r#""params":{"projectHandle":"p","options":{"projections":"/s.json"}}}"#
        ),
        r#"{"jsonrpc":"2.0","id":3,"method":"openProject","params":{"projectHandle":"q"}}"#,
        concat!(
            r#"{"jsonrpc":"2.0","id":4,"method":"transform","#,
            r#""params":{"fileName":"a.svelte","content":"","projectHandle":"p"}}"#
        ),
        concat!(
            r#"{"jsonrpc":"2.0","id":5,"method":"transform","#,
            r#""params":{"fileName":"b.svelte","content":"","projectHandle":"q"}}"#
        ),
    ]
    .map(message)
    .concat();
    let mut seen = Vec::new();
    let transform = |input: super::Input<'_>, out: &mut StructuredDataWriter| {
        seen.push(input.options.map(str::to_owned));
        out.null();
        Ok(())
    };
    super::serve_on(input.as_bytes(), &mut Vec::new(), "test", transform)
        .expect("the session ends");
    assert_eq!(
        seen,
        [Some(r#"{"projections":"/s.json"}"#.to_owned()), None]
    );
}
