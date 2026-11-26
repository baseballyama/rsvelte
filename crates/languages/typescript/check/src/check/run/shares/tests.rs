use std::path::Path;

use super::Shares;

#[test]
fn each_share_is_half_a_part_of_what_is_left_and_every_file_is_taken_once() {
    let names: Vec<String> = (0..10).map(|i| i.to_string()).collect();
    let files: Vec<&Path> = names.iter().map(Path::new).collect();
    let shares = Shares::new(&files, 3, None);
    let sizes: Vec<usize> = std::iter::from_fn(|| shares.take().map(|share| share.len())).collect();
    assert_eq!(sizes, [2, 2, 1, 1, 1, 1, 1, 1]);
}

#[test]
fn no_files_make_no_share() {
    let shares = Shares::new(&[], 4, None);
    assert_eq!(shares.take(), None);
}

#[test]
fn a_helper_starts_only_where_it_checks_for_as_long_as_it_takes_to_open() {
    let ms = std::time::Duration::from_millis;
    // 1 s left after a 100 ms open: each of 1 + 8 processes would check for 100 ms.
    assert_eq!(super::worth_starting(ms(100), ms(10), 10, 1_000), 8);
    // As long to check as to open: no helper is ready before the session is done.
    assert_eq!(super::worth_starting(ms(100), ms(1), 10, 1_000), 0);
    assert_eq!(super::worth_starting(ms(100), ms(10), 0, 1_000), 0);
}

#[test]
fn the_sample_is_its_share_of_the_files_and_then_the_shares_go_on() {
    let names: Vec<String> = (0..100).map(|i| i.to_string()).collect();
    let files: Vec<&Path> = names.iter().map(Path::new).collect();
    let shares = Shares::new(&files, 1, None);
    assert_eq!(
        shares.take_with(|_| 100usize.div_ceil(super::SAMPLE)),
        Some(0..4)
    );
    assert_eq!(shares.left(), 96);
    assert_eq!(shares.take(), Some(4..52));
}
