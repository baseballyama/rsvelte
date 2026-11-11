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
