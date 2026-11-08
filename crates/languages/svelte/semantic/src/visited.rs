use rsvelte_kernel::performance::buffer_pool;

const WORD_BITS: usize = u64::BITS as usize;

#[derive(Debug, Default)]
pub(crate) struct Visited {
    first: u64,
    rest: Vec<u64>,
}

impl Visited {
    pub(crate) const fn new() -> Self {
        Self {
            first: 0,
            rest: Vec::new(),
        }
    }

    pub(crate) fn insert(&mut self, index: usize) -> bool {
        let word = index / WORD_BITS;
        let bit = 1 << (index % WORD_BITS);
        let slot = if word == 0 {
            &mut self.first
        } else {
            if self.rest.capacity() == 0 {
                self.rest = buffer_pool::take_keyed::<Self, _>();
            }
            if self.rest.len() < word {
                self.rest.resize(word, 0);
            }
            &mut self.rest[word - 1]
        };
        let fresh = *slot & bit == 0;
        *slot |= bit;
        fresh
    }

    pub(crate) fn remove(&mut self, index: usize) {
        let word = index / WORD_BITS;
        let bit = 1 << (index % WORD_BITS);
        if word == 0 {
            self.first &= !bit;
        } else if let Some(slot) = self.rest.get_mut(word - 1) {
            *slot &= !bit;
        }
    }
}

impl Drop for Visited {
    fn drop(&mut self) {
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.rest));
    }
}

#[cfg(test)]
mod tests;
