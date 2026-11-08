//! Language-independent layout instructions and a printer.
//!
//! Documents live in an arena ([`LayoutInstructions`]) and are addressed by
//! [`LayoutInstructionIdentifier`], so building a document allocates growing vectors instead of one
//! box per node. Text is either `&'static str` or a slice of the arena's string buffer.
//!
//! The printer is a port of Prettier's `printDocToString` (prettier 3.x): the same modes, the same
//! `fits` with its rest commands and `mustBeFlat`, the same `fill`, group identifiers for `ifBreak`
//! and `indentIfBreak`, re-measuring after a hard line in flat mode, and trailing-whitespace
//! trimming at every line break except a literal line.
//!
//! [`LayoutInstructions::flat_only`] refuses a layout that needs line breaks when its caller
//! supports only the flat form.

use std::num::NonZeroU32;

mod construct;
mod inspect;
mod printer;
mod rewrite;
mod trace;
mod width;

use rsvelte_kernel::performance::buffer_pool;
pub use trace::{GroupDecision, TraceEvent, TraceMode};
pub use width::string_width;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub struct LayoutInstructionIdentifier(u32);

impl LayoutInstructionIdentifier {
    #[must_use]
    pub const fn index(self) -> u32 {
        self.0
    }
}

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
    /// Printable ASCII only, so its width is its length.
    Static(&'static str),
    Text {
        start: u32,
        len: u32,
        width: u32,
    },
    Line(LineKind),
    Concat {
        start: u32,
        len: u32,
    },
    Group {
        start: u32,
        len: u32,
        breaks_line: bool,
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
        group: Option<GroupIdentifier>,
    },
    IndentIfBreak {
        document: LayoutInstructionIdentifier,
        group: GroupIdentifier,
    },
    BreakParent,
    FlatOnly(LayoutInstructionIdentifier),
}

/// What a node's parents need to know about it, in one word so that making a list reads each
/// child once: whether it forces a break (Prettier's `willBreak`), and its width printed flat.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
struct Measure(u32);

impl Measure {
    const BREAKING: Self = Self(Self::BREAKS | Self::UNKNOWN);
    const BREAKS: u32 = 1 << 31;
    /// The width of a node that forces a break or follows a named group: the printer walks it.
    const UNKNOWN: u32 = Self::BREAKS - 1;
    const WALKED: Self = Self(Self::UNKNOWN);

    const fn flat(width: u32) -> Self {
        Self(if width < Self::UNKNOWN {
            width
        } else {
            Self::UNKNOWN
        })
    }

    const fn breaks(self) -> bool {
        self.0 & Self::BREAKS != 0
    }

    const fn width(self) -> Option<u32> {
        let width = self.0 & !Self::BREAKS;
        if width == Self::UNKNOWN {
            None
        } else {
            Some(width)
        }
    }

    /// Of `self` followed by `next`. A break makes the width unknown, so the sum saturates there.
    fn then(self, next: Self) -> Self {
        let width = ((self.0 & !Self::BREAKS) + (next.0 & !Self::BREAKS)).min(Self::UNKNOWN);
        Self(((self.0 | next.0) & Self::BREAKS) | width)
    }
}

/// The document arena. Its buffers come from and go back to
/// [`rsvelte_kernel::performance::buffer_pool`], so a worker processing one file after another
/// reuses their capacity.
#[derive(Debug)]
pub struct LayoutInstructions {
    nodes: Vec<Node>,
    /// Per node, Prettier's `willBreak` (it holds a hard line, a break-parent or a group built
    /// broken) and its flat width. A node only refers to nodes made before it, so both are known
    /// when it is made: `willBreak` is what Prettier's `propagateBreaks` leaves in a group's
    /// `break`, and the width lets `fits` pass a subtree in one step.
    measures: Vec<Measure>,
    children: Vec<LayoutInstructionIdentifier>,
    buffer: String,
    groups: u32,
}

#[derive(Debug)]
pub struct PrintOptions {
    pub width: usize,
    /// `None` for tabs.
    pub indent_spaces: Option<usize>,
    /// Width of one tab of indentation.
    pub tab_width: usize,
}

impl Default for PrintOptions {
    fn default() -> Self {
        Self {
            width: 80,
            indent_spaces: Some(2),
            tab_width: 2,
        }
    }
}

/// A [`LayoutInstructions::flat_only`] layout did not fit on its line.
#[derive(Debug, PartialEq, Eq)]
pub struct Refused;
/// The arena's columns come from the thread's [`buffer_pool`], under this type's key, and go back
/// to it in the reverse order.
impl Default for LayoutInstructions {
    fn default() -> Self {
        Self {
            nodes: buffer_pool::take_keyed::<Self, _>(),
            measures: buffer_pool::take_keyed::<Self, _>(),
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
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.measures));
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
