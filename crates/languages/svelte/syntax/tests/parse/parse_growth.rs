use rsvelte_svelte_syntax::parse::parse;

/// The bytes the parse of `source` takes from its trees' arena.
fn arena_bytes(source: &str) -> usize {
    let component = parse(source).expect("parses");
    component.javascript.allocator().used_bytes()
}

#[test]
fn the_arena_grows_with_the_number_of_template_expressions_not_its_square() {
    for shape in [
        "<p>{x}</p>",
        "{#if a}<p></p>{/if}",
        "{#each a as b}<p></p>{/each}",
        "{#snippet s()}<p></p>{/snippet}",
        "<p title={x}></p>",
    ] {
        let small = arena_bytes(&shape.repeat(1500));
        let large = arena_bytes(&shape.repeat(6000));
        // Four times the input takes about four times the bytes; a square would take sixteen.
        assert!(large < 8 * small, "{shape}: {small} -> {large} bytes");
    }
}
