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

fn runes(source: &str) -> Option<bool> {
    parse(source).expect("the configuration parses").runes
}

#[test]
fn compiler_options_runes_is_read_when_static() {
    assert_eq!(
        runes("export default { compilerOptions: { runes: true } };"),
        Some(true)
    );
    assert_eq!(
        runes("const r = 0; export default { compilerOptions: { runes: r } };"),
        Some(false)
    );
    assert_eq!(
        runes("export default { compilerOptions: { runes: 'yes' } };"),
        Some(true)
    );
    assert_eq!(
        runes("export default { compilerOptions: { runes: null } };"),
        None
    );
    assert_eq!(
        runes("export default { compilerOptions: { runes: () => true } };"),
        None
    );
    assert_eq!(runes("export default { compilerOptions: options };"), None);
    assert_eq!(runes("export default {};"), None);
}

/// `(experimental_async, invalid_option)` of `compilerOptions.experimental.async: <value>`.
fn experimental_async(value: &str) -> (bool, Option<&'static str>) {
    let config = parse(&format!(
        "const config = {{ compilerOptions: {{ experimental: {{ async: {value} }} }} }}; \
         export default config;"
    ))
    .expect("the configuration parses");
    (config.experimental_async, config.invalid_option)
}

/// `ESLint` 10.14.0 + eslint-plugin-svelte 3.23.1 with `svelteConfig` set to each value: `true`
/// compiles with async, `false` and `undefined` without, and any other value fails at 1:1 with
/// `options_invalid_value`.
#[test]
fn compiler_options_experimental_async_must_be_a_boolean() {
    assert_eq!(experimental_async("true"), (true, None));
    assert_eq!(experimental_async("false"), (false, None));
    assert_eq!(experimental_async("undefined"), (false, None));
    for invalid in ["1", "0", "'yes'", "null", "{}"] {
        assert_eq!(
            experimental_async(invalid),
            (false, Some("experimental.async")),
            "{invalid}"
        );
    }
    assert_eq!(experimental_async("process.env.ASYNC"), (false, None));
    let unset = |source: &str| {
        let config = parse(source).expect("the configuration parses");
        (config.experimental_async, config.invalid_option)
    };
    assert_eq!(
        unset("export default { compilerOptions: { experimental: makeExperimental() } };"),
        (false, None)
    );
    assert_eq!(
        unset("export default { compilerOptions: { runes: true } };"),
        (false, None)
    );
}
