use rsvelte_kernel::performance::buffer_pool;
use rsvelte_kernel::source::index::TypedIndex;

const INLINE_CAPACITY: usize = 4;

pub(super) struct Worklist<I: TypedIndex> {
    inline: [Option<I>; INLINE_CAPACITY],
    length: usize,
    overflow: Vec<I>,
}

impl<I: TypedIndex> Worklist<I> {
    pub(super) const fn new() -> Self {
        Self {
            inline: [None; INLINE_CAPACITY],
            length: 0,
            overflow: Vec::new(),
        }
    }

    pub(super) fn push(&mut self, item: I) {
        if self.length < INLINE_CAPACITY {
            self.inline[self.length] = Some(item);
            self.length += 1;
        } else {
            if self.overflow.capacity() == 0 {
                self.overflow = buffer_pool::take_keyed::<Self, _>();
            }
            self.overflow.push(item);
        }
    }

    pub(super) fn pop(&mut self) -> Option<I> {
        if let Some(item) = self.overflow.pop() {
            return Some(item);
        }
        self.length = self.length.checked_sub(1)?;
        self.inline[self.length].take()
    }

    pub(super) fn extend(&mut self, items: impl IntoIterator<Item = I>) {
        for item in items {
            self.push(item);
        }
    }
}

impl<I: TypedIndex> Drop for Worklist<I> {
    fn drop(&mut self) {
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.overflow));
    }
}

#[cfg(test)]
mod tests {
    use rsvelte_kernel::newtype_index;
    use rsvelte_kernel::source::index::TypedIndex;

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
}
