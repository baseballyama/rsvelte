use super::StartTag;

/// `<Leaf label="x" let:x>`: the moves of the name, the space after it, `label`, `x` and the
/// `let:` name, which svelte2tsx 0.7.63 maps as these tests say.
fn leaf(end: u32, let_name: (u32, u32)) -> StartTag {
    StartTag {
        moves: vec![(1, 5), (5, 6), (6, 11), (13, 14), let_name],
        start: 0,
        end,
        moves_runs: true,
    }
}

#[test]
fn a_move_before_the_tag_end_takes_the_character_after_it() {
    // `let:x>`: the `>` is the tag's last character.
    assert_eq!(leaf(22, (20, 21)).last_character(21), 20);
    // `let:x />`: the space is not.
    assert_eq!(leaf(24, (20, 21)).last_character(21), 21);
    // `label` ends where no move starts, `"x"` where the next one does not either.
    assert_eq!(leaf(22, (20, 21)).extended(11), 12);
    assert_eq!(leaf(22, (20, 21)).extended(5), 5);
}

#[test]
fn appended_text_maps_to_the_last_removed_run() {
    // ` let:` between `"x"` and the `let:` name.
    assert_eq!(leaf(22, (20, 21)).last_space(), Some(15));
    // `<Leaf label="x"   let:x   >`: the run after the last move, less its first character.
    let spaced = StartTag {
        moves: vec![(1, 5), (5, 6), (6, 11), (13, 14), (22, 23)],
        start: 0,
        end: 27,
        moves_runs: true,
    };
    assert_eq!(spaced.last_space(), Some(25));
}
