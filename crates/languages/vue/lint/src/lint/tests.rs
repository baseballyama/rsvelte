use super::kebab_case;

#[test]
fn kebab_case_splits_words_like_upstream() {
    assert_eq!(kebab_case("TodoItem"), "todo-item");
    assert_eq!(kebab_case("todo_item"), "todo-item");
    assert_eq!(kebab_case("counter"), "counter");
    // `\B` before a capital: none at the start, none after `-`.
    assert_eq!(kebab_case("A-B"), "a-b");
}
