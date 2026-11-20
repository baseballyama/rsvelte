//! `@vue/shared` `PatchFlags`.

pub(super) const TEXT: i32 = 1;
pub(super) const PROPS: i32 = 8;
pub(super) const FULL_PROPS: i32 = 16;
pub(super) const NEED_HYDRATION: i32 = 32;
pub(super) const STABLE_FRAGMENT: i32 = 64;
pub(super) const KEYED_FRAGMENT: i32 = 128;
pub(super) const UNKEYED_FRAGMENT: i32 = 256;
pub(super) const NEED_PATCH: i32 = 512;
pub(super) const CACHED: i32 = -1;
