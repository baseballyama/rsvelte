use rsvelte_core::{CompileOptions, GenerateMode, compile};

#[test]
fn invalid_rune_each_context_points_at_the_entire_each_block() {
    let source = "<script>\n\tlet todos = $state([]);\n</script>\n\n\n{#each todos as $state(todo)}\n  {todo}\n{/each}\n";
    let diagnostic = compile(
        source,
        CompileOptions {
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect_err("a rune name cannot be used as an each context")
    .diagnostic();
    let each_block = "{#each todos as $state(todo)}\n  {todo}\n{/each}";
    let start = source.find(each_block).unwrap() as u32;

    assert_eq!(diagnostic.code.as_deref(), Some("state_invalid_placement"));
    assert_eq!(
        diagnostic.span,
        Some((start, start + each_block.len() as u32))
    );
}
