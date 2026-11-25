use super::StartTag;

/// The moves of `source`'s name, the space after it and `moves`, which svelte2tsx 0.7.63 maps as
/// these tests say.
fn tag(source: &str, moves: Vec<(u32, u32)>) -> StartTag<'_, std::vec::IntoIter<(u32, u32)>> {
    StartTag {
        source,
        moves: moves.into_iter(),
        end: source.len() as u32,
        moves_runs: true,
    }
}

/// `<Leaf label="x" let:x…`: the moves of the name, the space after it, `label`, `x` and the
/// `let:` name.
fn leaf(source: &str) -> StartTag<'_, std::vec::IntoIter<(u32, u32)>> {
    tag(source, vec![(1, 5), (5, 6), (6, 11), (13, 14), (20, 21)])
}

#[test]
fn a_move_before_the_tag_end_takes_the_character_after_it() {
    // The `>` is the tag's last character, and the space is not.
    assert_eq!(leaf("<Leaf label=\"x\" let:x>").last_character(21), 20);
    assert_eq!(leaf("<Leaf label=\"x\" let:x />").last_character(21), 21);
    // `label` ends where no move starts, the name where the space does.
    assert_eq!(leaf("<Leaf label=\"x\" let:x>").extended(11), 12);
    assert_eq!(leaf("<Leaf label=\"x\" let:x>").extended(5), 5);
}

#[test]
fn appended_text_maps_to_the_last_removed_run() {
    // ` let:` between `"x"` and the `let:` name.
    assert_eq!(leaf("<Leaf label=\"x\" let:x>").last_space(), Some(15));
    // The run after the last move, less its first character.
    let spaced = "<Leaf label=\"x\"   let:x   >";
    let moves = vec![(1, 5), (5, 6), (6, 11), (13, 14), (22, 23)];
    assert_eq!(tag(spaced, moves).last_space(), Some(25));
    // After the deleted newline only the `>` is left, which stays in place.
    let newline = tag("<Foo a={1}\n>", vec![(1, 4), (4, 5), (5, 6), (8, 9)]);
    assert_eq!(newline.last_space(), Some(7));
}

#[test]
fn a_character_of_several_bytes_is_one_step() {
    // U+3000 after the `let:` name, before the `>` and before two spaces.
    let close = leaf("<Leaf label=\"x\" let:x\u{3000}>");
    assert_eq!((close.extended(21), close.last_character(21)), (24, 21));
    let run = leaf("<Leaf label=\"x\" let:x\u{3000}\u{3000}\u{3000}>");
    assert_eq!((run.extended(21), run.last_space()), (24, Some(27)));
    // A name that ends in an astral character.
    let astral = tag("<Leaf let:\u{1d49c}>", vec![(1, 5), (5, 6), (10, 14)]);
    assert_eq!(astral.last_character(14), 10);
}
