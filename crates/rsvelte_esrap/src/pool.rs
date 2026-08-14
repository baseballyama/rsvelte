//! Thread-local reuse for context text and event buffers.

use std::cell::RefCell;

use crate::command::Buffer;

const MAX_BUFFERS: usize = 8192;
const MAX_TEXT_CAPACITY: usize = 16 * 1024;
const MAX_EVENT_CAPACITY: usize = 1024;

thread_local! {
    static BUFFERS: RefCell<Vec<Buffer>> = const { RefCell::new(Vec::new()) };
}

pub fn take() -> Buffer {
    BUFFERS.with(|buffers| buffers.borrow_mut().pop().unwrap_or_default())
}

pub fn give(mut buffer: Buffer) {
    buffer.text.clear();
    buffer.events.clear();
    if buffer.text.capacity() > MAX_TEXT_CAPACITY || buffer.events.capacity() > MAX_EVENT_CAPACITY {
        return;
    }
    BUFFERS.with(|buffers| {
        let Ok(mut buffers) = buffers.try_borrow_mut() else {
            return;
        };
        if buffers.len() < MAX_BUFFERS {
            buffers.push(buffer);
        }
    });
}
