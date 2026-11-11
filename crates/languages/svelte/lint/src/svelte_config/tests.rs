use super::parse;

/// `kit.files.routes`, `kit: {}` for a `kit` without it, or `none` without a static `kit`.
fn routes(source: &str) -> String {
    let config = parse(source).expect("the configuration parses");
    match config.kit {
        Some(kit) => kit.files.routes.unwrap_or_else(|| "kit: {}".to_owned()),
        None => "none".to_owned(),
    }
}

#[test]
fn static_routes_are_read() {
    assert_eq!(
        routes("export default { kit: { files: { routes: 'src/pages' } } };"),
        "src/pages"
    );
    assert_eq!(
        routes(
            "const config = { kit: { files: { routes: 'a', 'routes': 'b' } } }; export default \
                config;"
        ),
        "b"
    );
    assert_eq!(
        routes("const files = { routes: 'x' }; export default { kit: { ...{ files } } };"),
        "x"
    );
    assert_eq!(
        routes("const { a: r = 'y' } = {}; export default { kit: { files: { routes: r } } };"),
        "y"
    );
}

/// `getStatic` gives up on the whole object, so `kit.files` is dropped and `kit` is `{}`.
#[test]
fn files_with_code_in_them_are_dropped() {
    assert_eq!(
        routes("export default { kit: { files: { routes: 'a', lib: process.env.LIB } } };"),
        "kit: {}"
    );
    assert_eq!(
        routes("let r = 'a'; export default { kit: { files: { routes: r } } };"),
        "kit: {}"
    );
}

#[test]
fn a_kit_that_is_not_an_object_literal_is_not_read() {
    assert_eq!(routes("export default { kit: makeKit() };"), "none");
    assert_eq!(routes("export default function () {}"), "none");
    assert_eq!(routes("const a = b, b = a; export default a;"), "none");
    assert_eq!(routes("export const x = 1;"), "none");
    parse("export default {").expect_err("does not parse");
}
