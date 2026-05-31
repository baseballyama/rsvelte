//! Parser state machine modules.
//!
//! This module contains the parsing logic split into focused files.
//! Each module extends Parser with methods for parsing specific constructs.

mod element;
mod fragment;
mod tag;
mod text;
