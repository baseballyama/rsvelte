#[test]
fn keeps_the_order() {
    let items: Vec<usize> = (0..1000).collect();
    assert_eq!(
        super::map(&items, |i| i * 2),
        (0..1000).map(|i| i * 2).collect::<Vec<_>>()
    );
    let none: &[usize] = &[];
    assert_eq!(super::map(none, |i| *i), Vec::<usize>::new());
}
