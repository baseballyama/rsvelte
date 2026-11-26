use rsvelte_svelte_syntax::parse::parse;

/// What svelte 5.59.1's `parse` reports for a target that cannot be assigned, holding a word acorn
/// rejects as it reads it before it checks the target.
const CELLS: &[(&str, Option<(&str, u32)>)] = &[
    (
        "<script>(() => yield) = 1;</script>",
        Some(("The keyword 'yield' is reserved", 15)),
    ),
    (
        "<script>(() => { yield }) = 1;</script>",
        Some(("The keyword 'yield' is reserved", 17)),
    ),
    (
        "<script>(function () { yield }) = 1;</script>",
        Some(("The keyword 'yield' is reserved", 23)),
    ),
    (
        "<script>[(() => yield)] = o;</script>",
        Some(("The keyword 'yield' is reserved", 16)),
    ),
    (
        "<script>(() => yield)++;</script>",
        Some(("The keyword 'yield' is reserved", 15)),
    ),
    (
        "<script>(class { x = arguments }) = 1;</script>",
        Some(("Cannot use 'arguments' in class field initializer", 21)),
    ),
    (
        "<script>(class { x = () => arguments }) = 1;</script>",
        Some(("Cannot use 'arguments' in class field initializer", 27)),
    ),
    (
        "<script>[(class { x = arguments })] = o;</script>",
        Some(("Cannot use 'arguments' in class field initializer", 22)),
    ),
    (
        "<script>(class { x = arguments })++;</script>",
        Some(("Cannot use 'arguments' in class field initializer", 21)),
    ),
    (
        "<script>class A { static { (() => arguments) = 1; } }</script>",
        Some(("Assigning to rvalue", 28)),
    ),
    (
        "<script>class A { static { [(() => arguments)] = o; } }</script>",
        Some(("Assigning to rvalue", 28)),
    ),
    (
        "<script>function* g() { (() => yield) = 1; }</script>",
        Some(("The keyword 'yield' is reserved", 31)),
    ),
    (
        "<script>function f() { (class { x = arguments }) = 1; }</script>",
        Some(("Cannot use 'arguments' in class field initializer", 36)),
    ),
    (
        "<script>(class { x = arguments; y = yield }) = 1;</script>",
        Some(("Cannot use 'arguments' in class field initializer", 21)),
    ),
    (
        "<script>({ a: () => yield } = o);</script>",
        Some(("The keyword 'yield' is reserved", 20)),
    ),
    (
        "<script>for ((() => yield) of o);</script>",
        Some(("The keyword 'yield' is reserved", 20)),
    ),
    (
        "<script>(() => yield, 1) = 2;</script>",
        Some(("The keyword 'yield' is reserved", 15)),
    ),
];

#[test]
fn a_word_acorn_rejects_in_an_unassignable_target_comes_first() {
    let failures: Vec<_> = CELLS
        .iter()
        .filter_map(|&(source, expected)| {
            let read = parse(source).err().map(|error| {
                let message = error.message.lines().next().unwrap_or_default().to_owned();
                (message, error.span.start_offset)
            });
            let expected = expected.map(|(message, at)| (message.to_owned(), at));
            (read != expected).then(|| format!("{source}: {read:?}"))
        })
        .collect();
    assert!(failures.is_empty(), "{}", failures.join("\n"));
}
