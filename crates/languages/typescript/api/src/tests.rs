use super::*;

#[test]
fn a_message_round_trips_through_the_framing() {
    for len in [0, 1, 255, 256, 70_000] {
        let payload = vec![b'x'; len];
        let mut bytes = Vec::new();
        transport::write(&mut bytes, transport::REQUEST, b"getThing", &payload).unwrap();
        let back = transport::read(&mut bytes.as_slice()).unwrap();
        assert_eq!(
            (back.kind, back.method.as_slice(), back.payload.len()),
            (transport::REQUEST, b"getThing".as_slice(), len)
        );
    }
}

#[test]
fn a_truncated_message_is_an_error() {
    let mut bytes = Vec::new();
    transport::write(&mut bytes, transport::RESPONSE, b"m", b"payload").unwrap();
    bytes.pop();
    assert!(transport::read(&mut bytes.as_slice()).is_err());
}

#[test]
fn chains_flatten_two_spaces_per_level() {
    let link = |text: &str, chain: Vec<Diagnostic>| Diagnostic {
        file_name: None,
        start_offset: 0,
        end_offset: 0,
        start_position: None,
        end_position: None,
        code: 0,
        category: 1,
        text: text.to_owned(),
        message_chain: chain,
    };
    let d = link(
        "a",
        vec![link("b", vec![link("c", vec![])]), link("d", vec![])],
    );
    assert_eq!(d.flattened_message(), "a\n  b\n    c\n  d");
}

#[test]
fn a_project_is_named_by_its_handle_or_else_its_id() {
    let beta: ProjectResponse =
        serde_json::from_str(r#"{"id": "/p/tsconfig.json", "configFileName": "/p/tsconfig.json"}"#)
            .unwrap();
    assert_eq!(
        (beta.handle, beta.id.as_deref()),
        (None, Some("/p/tsconfig.json"))
    );
    let later: ProjectResponse =
        serde_json::from_str(r#"{"handle": 1, "configFileName": "/p/tsconfig.json"}"#).unwrap();
    assert_eq!(later.handle, Some(1));
}

#[test]
fn relative_path_targets_start_from_the_paths_base() {
    let parsed: ParsedCommandLine = serde_json::from_str(
        r#"{"options": {"paths": {"$lib/*": ["./src/lib/*"]}, "pathsBasePath": "/p"}}"#,
    )
    .unwrap();
    assert_eq!(
        parsed.options.absolute_paths(),
        [("$lib/*".to_owned(), vec![PathBuf::from("/p/./src/lib/*")])]
    );
}
