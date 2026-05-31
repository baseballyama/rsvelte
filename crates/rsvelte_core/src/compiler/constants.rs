//! Svelte compiler constants.
//!
//! These constants define flags and other compile-time values used throughout
//! the compiler. They mirror the constants defined in
//! `svelte/packages/svelte/src/constants.js`.

// =============================================================================
// Each Block Flags
// =============================================================================

/// Each block item should be reactive (wrapped in $state)
pub const EACH_ITEM_REACTIVE: i32 = 1;

/// Each block index should be reactive (wrapped in $state)
pub const EACH_INDEX_REACTIVE: i32 = 1 << 1;

/// Each block is controlled (has explicit key)
pub const EACH_IS_CONTROLLED: i32 = 1 << 2;

/// Each block has animate directive
pub const EACH_IS_ANIMATED: i32 = 1 << 3;

/// Each block items are immutable (runes mode)
pub const EACH_ITEM_IMMUTABLE: i32 = 1 << 4;

// =============================================================================
// Props Flags
// =============================================================================

/// Prop is immutable
pub const PROPS_IS_IMMUTABLE: i32 = 1;

/// Component uses runes mode
pub const PROPS_IS_RUNES: i32 = 1 << 1;

/// Prop can be updated (reassigned or mutated)
pub const PROPS_IS_UPDATED: i32 = 1 << 2;

/// Prop is bindable (can be used with bind:)
pub const PROPS_IS_BINDABLE: i32 = 1 << 3;

/// Prop has lazy initial value (wrapped in thunk)
pub const PROPS_IS_LAZY_INITIAL: i32 = 1 << 4;

// =============================================================================
// Binding Flags
// =============================================================================

// TODO: Add binding flags when needed
// pub const BIND_IMMEDIATE: i32 = 1;
// pub const BIND_TWO_WAY: i32 = 1 << 1;

// =============================================================================
// Component Flags
// =============================================================================

// TODO: Add component flags when needed
// pub const COMPONENT_IS_DYNAMIC: i32 = 1;
// pub const COMPONENT_HAS_BINDINGS: i32 = 1 << 1;

// =============================================================================
// Hydration Markers
// =============================================================================

/// Hydration start marker
pub const HYDRATION_START: &str = "[";

/// Hydration start marker for else blocks
pub const HYDRATION_START_ELSE: &str = "[!";

/// Hydration end marker
pub const HYDRATION_END: &str = "]";

/// Block open marker (for hydration boundaries)
pub const BLOCK_OPEN: &str = "<!--[-->";

/// Block open marker for else blocks
pub const BLOCK_OPEN_ELSE: &str = "<!--[!-->";

/// Block close marker (for hydration boundaries)
pub const BLOCK_CLOSE: &str = "<!--]-->";

/// Empty comment marker (for anchors)
pub const EMPTY_COMMENT: &str = "<!---->";

// =============================================================================
// Element Flags
// =============================================================================

/// Element is in a namespace (SVG or MathML)
pub const ELEMENT_IS_NAMESPACED: i32 = 1;

/// Preserve attribute case (for SVG, MathML, or custom elements)
pub const ELEMENT_PRESERVE_ATTRIBUTE_CASE: i32 = 1 << 1;

/// Element is an input element
pub const ELEMENT_IS_INPUT: i32 = 1 << 2;
