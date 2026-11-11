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
