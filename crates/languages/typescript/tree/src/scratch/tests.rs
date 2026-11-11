use super::with_scratch_arena;

#[test]
fn a_second_call_reuses_the_first_calls_chunk() {
    let first = with_scratch_arena(|allocator| {
        allocator.alloc_str(&"x".repeat(1 << 20));
        allocator.capacity()
    });
    let second = with_scratch_arena(|allocator| {
        assert_eq!(allocator.used_bytes(), 0);
        allocator.capacity()
    });
    assert!(first >= 1 << 20);
    assert!(
        second >= 1 << 20,
        "the reset arena kept its chunk: {second}"
    );
}

#[test]
fn a_nested_call_gets_its_own_arena() {
    with_scratch_arena(|outer| {
        let kept = outer.alloc_str("outer");
        with_scratch_arena(|inner| {
            assert!(!std::ptr::eq(outer, inner));
            inner.alloc_str("inner");
        });
        assert_eq!(kept, "outer");
    });
}

#[test]
fn a_build_that_fails_gives_its_arena_back() {
    let text = format!("let = ;{}", " ".repeat(1 << 20));
    let failed = crate::Tree::build(&text, |builder| {
        let source_text = builder.source_text();
        builder.parse_program(source_text, 0, oxc_span::SourceType::mjs())
    });
    failed.expect_err("the text does not parse");
    let capacity = with_scratch_arena(oxc_allocator::Allocator::capacity);
    assert!(
        capacity >= 1 << 20,
        "the failed build's arena came back: {capacity}"
    );
}
