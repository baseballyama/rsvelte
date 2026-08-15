//! Thread-local reuse for context text and event buffers.

use std::cell::RefCell;

use crate::command::Buffer;

const MAX_BUFFERS: usize = 8192;
const MAX_TEXT_CAPACITY: usize = 16 * 1024;
const MAX_EVENT_CAPACITY: usize = 1024;
const MAX_LAYOUT_CAPACITY: usize = 1024;

thread_local! {
    static BUFFERS: RefCell<Vec<Buffer>> = const { RefCell::new(Vec::new()) };
}

pub fn take() -> Vec<Buffer> {
    BUFFERS.with(|buffers| std::mem::take(&mut *buffers.borrow_mut()))
}

pub fn give(mut root: Buffer, mut returned: Vec<Buffer>) {
    root.text.clear();
    root.events.clear();
    root.layouts.clear();
    if root.text.capacity() <= MAX_TEXT_CAPACITY
        && root.events.capacity() <= MAX_EVENT_CAPACITY
        && root.layouts.capacity() <= MAX_LAYOUT_CAPACITY
    {
        returned.push(root);
    }
    BUFFERS.with(|buffers| {
        let Ok(mut buffers) = buffers.try_borrow_mut() else {
            return;
        };
        while buffers.len() < MAX_BUFFERS {
            let Some(buffer) = returned.pop() else {
                break;
            };
            if buffer.text.capacity() <= MAX_TEXT_CAPACITY
                && buffer.events.capacity() <= MAX_EVENT_CAPACITY
                && buffer.layouts.capacity() <= MAX_LAYOUT_CAPACITY
            {
                buffers.push(buffer);
            }
        }
    });
}
