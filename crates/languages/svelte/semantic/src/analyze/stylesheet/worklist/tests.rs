use rsvelte_kernel::index::TypedIndex;
use rsvelte_kernel::newtype_index;

use super::{INLINE_CAPACITY, Worklist};

newtype_index!(
    struct Item;
);

#[test]
fn order_survives_overflow_and_interleaved_pushes() {
    for count in [0, 1, INLINE_CAPACITY, INLINE_CAPACITY + 1, 80] {
        let mut pending = Worklist::new();
        pending.extend((0..count).map(Item::new));
        for expected in (0..count).rev() {
            assert_eq!(pending.pop(), Some(Item::new(expected)));
            pending.push(Item::new(100));
            assert_eq!(pending.pop(), Some(Item::new(100)));
        }
        assert_eq!(pending.pop(), None);
        pending.push(Item::new(2));
        assert_eq!(pending.pop(), Some(Item::new(2)));
        assert_eq!(pending.pop(), None);
    }
}

#[test]
fn dropping_a_partial_walk_cannot_leak_into_the_next_walk() {
    let mut pending = Worklist::new();
    pending.extend((0..80).map(Item::new));
    assert_eq!(pending.pop(), Some(Item::new(79)));
    drop(pending);
    let mut next = Worklist::<Item>::new();
    assert_eq!(next.pop(), None);
    next.extend((0..20).map(Item::new));
    for expected in (0..20).rev() {
        assert_eq!(next.pop(), Some(Item::new(expected)));
    }
    assert_eq!(next.pop(), None);
}
