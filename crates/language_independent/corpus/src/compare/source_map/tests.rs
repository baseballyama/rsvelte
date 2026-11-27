use super::{Difference, Mapped, difference, vlq};

fn mapped<'a>(javascript: &'a str, mappings: &str, map: &'a mut String) -> Mapped<'a> {
    *map = format!("{{\"version\":3,\"sources\":[\"a.svelte\"],\"mappings\":\"{mappings}\"}}");
    Mapped { javascript, map }
}

fn diff(expected: (&str, &str), actual: (&str, &str)) -> Difference {
    let (mut e, mut a) = (String::new(), String::new());
    difference(
        mapped(expected.0, expected.1, &mut e),
        mapped(actual.0, actual.1, &mut a),
    )
    .unwrap()
}

#[test]
fn decodes_signed_fields() {
    assert_eq!(vlq("AAgBD").unwrap(), [0, 0, 16, -1]);
    vlq("g").unwrap_err();
}

#[test]
fn layout_does_not_count() {
    // `a` maps to 0:0 and `b` to 1:4 in both, on different generated lines and columns.
    let expected = ("let a = b;", "IAAA,IACI");
    let actual = ("let a =\n\tb;", "IAAA;CACI");
    assert_eq!(diff(expected, actual), Difference::default());
}

#[test]
fn counts_each_kind_of_difference() {
    let javascript = "a; b; c;";
    // `a` at 0:0, `b` at 0:3, `c` at 0:6.
    let expected = ("a; b; c;", "AAAA,GAAG,GAAG");
    // `a` unmapped, `b` at 0:4, `c` at 0:6, and nothing else.
    let actual = (javascript, "GAAI,GAAE");
    assert_eq!(
        diff(expected, actual),
        Difference {
            missing: 1,
            extra: 0,
            moved: 1,
        }
    );
    assert_eq!(
        diff(actual, expected),
        Difference {
            missing: 0,
            extra: 1,
            moved: 1,
        }
    );
}

#[test]
fn a_second_identifier_of_a_name_is_its_own_key() {
    let expected = ("a(a);", "AAAA,EAAE");
    let actual = ("a(a);", "AAAA");
    assert_eq!(
        diff(expected, actual),
        Difference {
            missing: 1,
            extra: 0,
            moved: 0,
        }
    );
}
