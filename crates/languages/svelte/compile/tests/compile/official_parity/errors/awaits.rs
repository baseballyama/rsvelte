//! `await` outside an async function: acorn's parse error, wherever it reads one.

use rsvelte_svelte_compile::Target;

use super::{compile, compile_at};

#[test]
fn an_await_outside_an_async_function_raises_acorns_error_where_acorn_reads_one() {
    let error = |source| compile_at(source, Target::Client).err();
    let parse_error = |at| Some(("js_parse_error".to_owned(), (at, at)));
    // From svelte 5.57.3, at the `await`: a class field's initializer, a function and its
    // parameters, an arrow in the template.
    assert_eq!(
        error("<script>class A { x = await (f()); }</script>"),
        parse_error(22)
    );
    assert_eq!(
        error("<script lang=\"ts\">class A { x = await (f()); }</script>"),
        parse_error(32)
    );
    assert_eq!(
        error("<script lang=\"ts\">class A { accessor x = await (f()); }</script>"),
        parse_error(41)
    );
    assert_eq!(
        error("<script>function g() { await f(); }</script>"),
        parse_error(23)
    );
    assert_eq!(
        error("<script>function g(x = await f()) {}</script>"),
        parse_error(23)
    );
    assert_eq!(
        error("<script>let a = (x) => await [x];</script>"),
        parse_error(23)
    );
    assert_eq!(
        error("<script>let a;</script>{() => await a}"),
        parse_error(30)
    );
    // The script's error comes before the enum's, which upstream raises when it erases types.
    assert_eq!(
        error("<script lang=\"ts\">function g() { await (f()); }\nenum E { A }</script>"),
        parse_error(33)
    );
    // Acorn reads an enum's member as TypeScript, where it may await.
    assert_eq!(
        error("<script lang=\"ts\">enum E { A = await (f()) }</script>"),
        Some(("typescript_invalid_feature".to_owned(), (18, 44)))
    );
    assert_eq!(
        error(
            "<script>const g = async () => { class A { m() { return 1; } } await f(); \
             };</script>"
        ),
        None
    );
}

#[test]
fn an_await_outside_an_async_function_is_found_in_every_script_and_template_expression() {
    for (source, expected) in [
        ("<script>function f() { await x; }</script>", true),
        ("<script module>function f() { await x; }</script>", true),
        ("<script>let f = () => 0;</script>{(() => await x)()}", true),
        ("{#if true}{@const y = (() => await x)()}{y}{/if}", true),
        ("<script>async function f() { await x; }</script>", false),
        ("<script>let f = () => 0;</script>{f()}", false),
    ] {
        for target in [Target::Client, Target::Server] {
            let result = compile(source, target);
            assert_eq!(
                result == Err("js_parse_error".to_owned()),
                expected,
                "{source} on {target:?}: {result:?}"
            );
        }
    }
}
