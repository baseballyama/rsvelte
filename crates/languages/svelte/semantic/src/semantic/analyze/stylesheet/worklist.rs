use rsvelte_kernel::index::TypedIndex;
use rsvelte_kernel::performance::buffer_pool;

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
mod tests;
