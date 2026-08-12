//! A thread-local free list of command buffers.
//!
//! One [`Context`](crate::context::Context) is built per syntactic unit the
//! printer has to measure before laying out, so a single print allocates — and
//! then frees — a `Vec<Command>` for nearly every node in the program. The
//! buffers all die at the same moment (when the printed tree is dropped), so
//! instead of returning them to the allocator [`recycle`] parks them here with
//! their capacity intact and the next print takes them back.

use std::cell::RefCell;

use crate::command::Command;

/// Buffers parked for reuse. Bounded because every buffer in a print stays live
/// until the print ends: a large program would otherwise hand back one buffer
/// per node and retain them all.
const MAX_BUFFERS: usize = 8192;

/// Buffers grown past this are dropped rather than parked, so one outlier
/// program does not pin megabytes for the rest of the process.
const MAX_CAPACITY: usize = 1024;

thread_local! {
    static BUFFERS: RefCell<Vec<Vec<Command>>> = const { RefCell::new(Vec::new()) };
}

/// An empty command buffer, reusing a parked allocation when one is available.
pub fn take() -> Vec<Command> {
    BUFFERS.with(|buffers| buffers.borrow_mut().pop().unwrap_or_default())
}

/// Drain a finished command tree, parking every buffer in it for reuse. Replaces
/// the recursive drop of the tree, which did the same walk only to free.
pub fn recycle(root: Vec<Command>) {
    BUFFERS.with(|buffers| {
        let Ok(mut buffers) = buffers.try_borrow_mut() else {
            return;
        };
        let mut pending = vec![root];
        while let Some(mut buffer) = pending.pop() {
            // Draining leaves `buffer`'s allocation available for the pool below.
            #[allow(clippy::iter_with_drain)]
            for command in buffer.drain(..) {
                if let Command::Nested(inner) = command {
                    pending.push(inner);
                }
            }
            if buffers.len() < MAX_BUFFERS && buffer.capacity() <= MAX_CAPACITY {
                buffers.push(buffer);
            }
        }
    });
}
