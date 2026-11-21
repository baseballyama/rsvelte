use rsvelte_kernel::source::positions::Span;

use super::TransitionDirections;

#[test]
fn a_later_directive_in_a_taken_direction_names_the_earlier_one_first() {
    // Svelte 5.57.3 on `<div transition:fade|global in:fade|local out:fade|local>x</div>`.
    let mut directions = TransitionDirections::default();
    assert!(directions.visit(true, true, Span::new(5, 27)).is_none());
    let error = directions
        .visit(true, false, Span::new(28, 41))
        .expect("an error");
    assert_eq!(error.code, "transition_conflict");
    assert_eq!(
        error.message,
        "Cannot use `transition:` alongside existing `in:` directive\n\
         https://svelte.dev/e/transition_conflict"
    );
}

#[test]
fn a_second_directive_of_one_kind_is_a_duplicate() {
    let mut directions = TransitionDirections::default();
    assert!(directions.visit(false, true, Span::new(5, 10)).is_none());
    assert!(directions.visit(true, false, Span::new(11, 16)).is_none());
    let error = directions
        .visit(false, true, Span::new(17, 22))
        .expect("an error");
    assert_eq!(error.code, "transition_duplicate");
    assert!(
        error
            .message
            .starts_with("Cannot use multiple `out:` directives on a single element\n")
    );
}
