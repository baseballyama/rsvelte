use rsvelte_svelte_syntax::parse::parse;

/// What svelte 5.59.1's `parse` reports, or `None` where it reads the component.
const CELLS: &[(&str, Option<(&str, u32)>)] = &[
    (
        "<script>class A { static { (await x) = 1; } }</script>",
        Some(("Cannot use await in class static initialization block", 28)),
    ),
    (
        "<script>class A { static { [(await x), (g())] = o; } }</script>",
        Some(("Cannot use await in class static initialization block", 29)),
    ),
    (
        "<script>class A { static { [(g()), (await x)] = o; } }</script>",
        Some(("Cannot use await in class static initialization block", 36)),
    ),
    (
        "<script>class A { static { [(g()), a = await x] = o; } }</script>",
        Some(("Cannot use await in class static initialization block", 39)),
    ),
    (
        "<script>class A { static { for ([(g()), (await x)] of o); } }</script>",
        Some(("Cannot use await in class static initialization block", 41)),
    ),
    (
        "<script>class A { static { (g()) = await x; } }</script>",
        Some(("Assigning to rvalue", 28)),
    ),
    (
        "<script>class A { static { (async () => await x) = 1; } }</script>",
        Some(("Assigning to rvalue", 28)),
    ),
    (
        "<script>class A { static { await x; } } let 1a;</script>",
        Some(("Cannot use await in class static initialization block", 27)),
    ),
    (
        "<script>class A { static { await x; (g()) = 1; } }</script>",
        Some(("Cannot use await in class static initialization block", 27)),
    ),
    (
        "<script>class A { static { (g()) = 1; await x; } }</script>",
        Some(("Assigning to rvalue", 28)),
    ),
    (
        "<script>class A { static { () => await x; } }</script>",
        Some(("Cannot use keyword 'await' outside an async function", 33)),
    ),
    (
        "<script>class A { static { async () => await x; } }</script>",
        None,
    ),
    (
        "<script>class A { static { async (a) => { await a; } } }</script>",
        None,
    ),
    (
        "<script>class A { static { function f() { await x; } } }</script>",
        Some(("Cannot use keyword 'await' outside an async function", 42)),
    ),
    (
        "<script>class A { static { class B { x = await y } } }</script>",
        Some(("Cannot use keyword 'await' outside an async function", 41)),
    ),
];

#[test]
fn an_await_in_a_class_static_block_fails_where_acorn_reads_it() {
    let mut wrong = Vec::new();
    for &(source, expected) in CELLS {
        let error = parse(source).err();
        let read = error.as_ref().map(|error| {
            let message = error.message.lines().next().unwrap_or_default();
            (message, error.span.start_offset)
        });
        if read != expected {
            wrong.push(format!("{source}\n  read {read:?}\n  want {expected:?}"));
        }
    }
    assert!(wrong.is_empty(), "{}", wrong.join("\n"));
}
