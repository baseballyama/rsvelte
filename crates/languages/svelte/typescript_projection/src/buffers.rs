use std::ops::{Deref, DerefMut};

use rsvelte_kernel::performance::buffer_pool;

pub(super) struct Buffer<T: 'static>(Vec<T>);

impl<T: 'static> Buffer<T> {
    pub(super) fn new(capacity: usize) -> Self {
        let mut values = buffer_pool::take_keyed::<Self, T>();
        values.reserve(capacity);
        Self(values)
    }
}

impl<T: 'static> Deref for Buffer<T> {
    type Target = Vec<T>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl<T: 'static> DerefMut for Buffer<T> {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

impl<T: 'static> Drop for Buffer<T> {
    fn drop(&mut self) {
        buffer_pool::give_keyed::<Self, T>(std::mem::take(&mut self.0));
    }
}
