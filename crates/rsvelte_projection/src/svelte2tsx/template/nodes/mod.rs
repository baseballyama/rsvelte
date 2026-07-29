//! Per-node-type template handlers, mirroring `htmlxtojsx_v2/nodes/*.ts`.

pub(super) mod attach_tag;
pub(super) mod await_block;
pub(super) mod comment;
pub(super) mod component_slots;
pub(super) mod const_tag;
pub(super) mod debug_tag;
pub(super) mod declaration_tag;
pub(super) mod dynamic_element;
pub(super) mod each_block;
pub(super) mod element;
pub(super) mod if_else_block;
pub(super) mod inline_component;
pub(super) mod key_block;
pub(super) mod mustache_tag;
pub(super) mod raw_mustache_tag;
pub(super) mod render_tag;
pub(super) mod slot_element;
pub(super) mod snippet_block;
pub(super) mod special_element;
pub(super) mod text;
