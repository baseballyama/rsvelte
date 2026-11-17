//! Language-independent layout instructions, in Prettier's doc vocabulary, printed by oxc's
//! printer.
//!
//! Documents live in an arena ([`LayoutInstructions`]) and are addressed by
//! [`LayoutInstructionIdentifier`], so building a document allocates growing vectors instead of one
//! box per node. Text is either `&'static str` or a slice of the arena's string buffer.
//! [`Embedding::print`] lowers a document to `oxc_formatter_core`'s elements and prints them.

use std::num::NonZeroU32;

mod construct;
mod embedding;
mod inspect;
mod lower;
mod rewrite;
mod width;

pub use embedding::{Embedding, Unprinted};
use rsvelte_kernel::performance::buffer_pool;
pub use width::emoji_measured_otherwise;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub struct LayoutInstructionIdentifier(u32);

/// Names a group so that [`LayoutInstructions::if_break_of`] and
/// [`LayoutInstructions::indent_if_break`] can follow its mode.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub struct GroupIdentifier(NonZeroU32);

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
enum LineKind {
    /// Space when flat.
    Normal,
    /// Nothing when flat.
    Soft,
    /// Always a newline; breaks enclosing groups.
    Hard,
    /// Always a newline, without indentation; breaks enclosing groups.
    Literal,
}

#[derive(Clone, Copy, Debug)]
enum Node {
    /// Printable ASCII only.
    Static(&'static str),
    Text {
        start: u32,
        len: u32,
    },
    Line(LineKind),
    Concat {
        start: u32,
        len: u32,
    },
    Group {
        start: u32,
        len: u32,
        identifier: Option<GroupIdentifier>,
    },
    Fill {
        start: u32,
        len: u32,
    },
    Indent(LayoutInstructionIdentifier),
    /// Prettier's `dedent` (`align(-1)`): drops the innermost indentation level.
    Dedent(LayoutInstructionIdentifier),
    IfBreak {
        broken: LayoutInstructionIdentifier,
        flat: LayoutInstructionIdentifier,
        group: GroupIdentifier,
    },
    IndentIfBreak {
        document: LayoutInstructionIdentifier,
        group: GroupIdentifier,
    },
    BreakParent,
    /// Layout another formatter built, which only [`LayoutInstructions::lower`] prints: the
    /// index into the list it is given.
    Embedded(u32),
}

/// The document arena. Its buffers come from and go back to
/// [`rsvelte_kernel::performance::buffer_pool`], so a worker processing one file after another
/// reuses their capacity.
#[derive(Debug)]
pub struct LayoutInstructions {
    nodes: Vec<Node>,
    children: Vec<LayoutInstructionIdentifier>,
    buffer: String,
    groups: u32,
}

/// The arena's columns come from the thread's [`buffer_pool`], under this type's key, and go back
/// to it in the reverse order.
impl Default for LayoutInstructions {
    fn default() -> Self {
        Self {
            nodes: buffer_pool::take_keyed::<Self, _>(),
            children: buffer_pool::take_keyed::<Self, _>(),
            buffer: buffer_pool::take_string::<Self>(),
            groups: 0,
        }
    }
}

impl Drop for LayoutInstructions {
    fn drop(&mut self) {
        buffer_pool::give_string::<Self>(std::mem::take(&mut self.buffer));
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.children));
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.nodes));
    }
}

// Literals stay pointers rather than being copied into the text: removing `Static` makes a node
// 16 bytes but costs more instructions and bytes than it saves (measured by `tools/performance`).
#[cfg(target_pointer_width = "64")]
const _: () = assert!(size_of::<Node>() == 24, "`Node` is 24 bytes");
const _: () = assert!(
    size_of::<Option<GroupIdentifier>>() == 4,
    "`Option<GroupIdentifier>` is 4 bytes"
);

#[cfg(test)]
mod tests;
