use rsvelte_svelte_syntax::parse::parse;

const AWAIT: &str = "Cannot use keyword 'await' outside an async function";
const UNEXPECTED: &str = "Unexpected token";
const RVALUE: &str = "Assigning to rvalue";

/// What svelte 5.59.1's `parse` reports.
const CELLS: &[(&str, &str, u32)] = &[
    ("<script>(() => await x) = 1;</script>", AWAIT, 15),
    ("<script>(function () { await x }) = 1;</script>", AWAIT, 23),
    ("<script>(class { y = await x }) = 1;</script>", AWAIT, 21),
    ("<script>[(() => await x)] = o;</script>", AWAIT, 16),
    (
        "<script>[(function () { await x })] = o;</script>",
        AWAIT,
        24,
    ),
    ("<script>[(class { y = await x })] = o;</script>", AWAIT, 22),
    ("<script>({ a: (() => await x) } = o);</script>", AWAIT, 21),
    (
        "<script>({ a: (function () { await x }) } = o);</script>",
        AWAIT,
        29,
    ),
    (
        "<script>({ a: (class { y = await x }) } = o);</script>",
        AWAIT,
        27,
    ),
    ("<script>({ ...(() => await x) } = o);</script>", AWAIT, 21),
    (
        "<script>({ ...(function () { await x }) } = o);</script>",
        AWAIT,
        29,
    ),
    (
        "<script>({ ...(class { y = await x }) } = o);</script>",
        AWAIT,
        27,
    ),
    ("<script>for ((() => await x) of o);</script>", AWAIT, 20),
    (
        "<script>for ((function () { await x }) of o);</script>",
        AWAIT,
        28,
    ),
    (
        "<script>for ((class { y = await x }) of o);</script>",
        AWAIT,
        26,
    ),
    ("<script>for ((() => await x) in o);</script>", AWAIT, 20),
    (
        "<script>for ((function () { await x }) in o);</script>",
        AWAIT,
        28,
    ),
    (
        "<script>for ((class { y = await x }) in o);</script>",
        AWAIT,
        26,
    ),
    ("<script>(() => await x)++;</script>", AWAIT, 15),
    ("<script>(function () { await x })++;</script>", AWAIT, 23),
    ("<script>(class { y = await x })++;</script>", AWAIT, 21),
    ("<script>--(() => await x);</script>", AWAIT, 17),
    ("<script>--(function () { await x });</script>", AWAIT, 25),
    ("<script>--(class { y = await x });</script>", AWAIT, 23),
    ("<script>delete (() => await x);</script>", AWAIT, 22),
    (
        "<script>delete (function () { await x });</script>",
        AWAIT,
        30,
    ),
    (
        "<script>delete (class { y = await x });</script>",
        AWAIT,
        28,
    ),
    ("<script>(() => await x) += 1;</script>", AWAIT, 15),
    (
        "<script>(function () { await x }) += 1;</script>",
        AWAIT,
        23,
    ),
    ("<script>(class { y = await x }) += 1;</script>", AWAIT, 21),
    ("<script>(() => await x)() = 1;</script>", AWAIT, 15),
    (
        "<script>(function () { await x })() = 1;</script>",
        AWAIT,
        23,
    ),
    ("<script>(class { y = await x })() = 1;</script>", AWAIT, 21),
    ("<script>(() => { await x })() = 1;</script>", AWAIT, 17),
    (
        "<script>(() => async () => await x) = 1;</script>",
        RVALUE,
        9,
    ),
    (
        "<script>(async () => () => await x) = 1;</script>",
        AWAIT,
        27,
    ),
    ("<script>(async () => await x) = 1;</script>", RVALUE, 9),
    (
        "<script>(class { y = () => await x }) = 1;</script>",
        AWAIT,
        27,
    ),
    (
        "<script>(class { static y = await x }) = 1;</script>",
        AWAIT,
        28,
    ),
    ("<script>({ m() { await x } }) = 1;</script>", AWAIT, 17),
    ("<script>(f()) = await x;</script>", RVALUE, 9),
    (
        "<script>async function h() { (() => await x) = 1; }</script>",
        AWAIT,
        36,
    ),
    (
        "<script>async function h() { [(function () { await x })] = o; }</script>",
        AWAIT,
        45,
    ),
    (
        "<script>async function h() { for ((class { y = await x }) of o); }</script>",
        AWAIT,
        47,
    ),
    (
        "<script>async function h() { (async () => await x) = 1; }</script>",
        RVALUE,
        30,
    ),
    (
        "<script>function h() { (() => await x) = 1; }</script>",
        AWAIT,
        30,
    ),
    (
        "<script>function h() { [(function () { await x })] = o; }</script>",
        AWAIT,
        39,
    ),
    (
        "<script>function h() { for ((class { y = await x }) of o); }</script>",
        AWAIT,
        41,
    ),
    (
        "<script>function h() { (async () => await x) = 1; }</script>",
        RVALUE,
        24,
    ),
    (
        "<script>class H { static { (() => await x) = 1; } }</script>",
        AWAIT,
        34,
    ),
    (
        "<script>class H { static { [(function () { await x })] = o; } }</script>",
        AWAIT,
        43,
    ),
    (
        "<script>class H { static { for ((class { y = await x }) of o); } }</script>",
        AWAIT,
        45,
    ),
    (
        "<script>class H { static { (async () => await x) = 1; } }</script>",
        RVALUE,
        28,
    ),
    ("<script>(({}) as any) = 1;</script>", UNEXPECTED, 14),
    ("<script>(<any>f()) = 1;</script>", UNEXPECTED, 9),
    ("<script>(f() satisfies any) = 1;</script>", UNEXPECTED, 13),
];

#[test]
fn what_an_unassignable_target_holds_is_read() {
    let failures: Vec<_> = CELLS
        .iter()
        .filter_map(|&(source, message, at)| {
            let read = parse(source).err().map(|error| error.code.to_string());
            (read.as_deref() != Some("js_parse_error"))
                .then(|| format!("{source}: {read:?}, where svelte says {message} at {at}"))
        })
        .collect();
    assert!(failures.is_empty(), "{}", failures.join("\n"));
}
