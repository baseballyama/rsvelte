use std::path::Path;

use super::Shares;

#[test]
fn each_share_is_half_a_part_of_what_is_left_and_every_file_is_taken_once() {
    let names: Vec<String> = (0..10).map(|i| i.to_string()).collect();
    let files: Vec<&Path> = names.iter().map(Path::new).collect();
    let shares = Shares::new(&files, 3);
    let sizes: Vec<usize> = std::iter::from_fn(|| shares.take().map(<[_]>::len)).collect();
    assert_eq!(sizes, [2, 2, 1, 1, 1, 1, 1, 1]);
}

#[test]
fn no_files_make_no_share() {
    let shares = Shares::new(&[], 4);
    assert_eq!(shares.take(), None);
}
