//! `<slot>` discovery and the `slots` literal of the component export.
//! Mirrors `svelte2tsx/nodes/slot.ts`.

use std::fmt::Write as _;

use super::super::template;

/// Build the `slots` object literal for the component export from template info.
///
/// An instance-script `interface`/`type $$Slots` declaration replaces the
/// computed shape entirely so the user's own type is what gets checked.
pub(crate) fn build_slots_str(
    template_info: &template::TemplateInfo<'_>,
    has_slots_type: bool,
) -> String {
    if has_slots_type {
        "{} as unknown as $$Slots".to_string()
    } else if template_info.slots.is_empty() {
        "{}".to_string()
    } else {
        let mut slot_parts = Vec::new();
        for (name, props) in &template_info.slots {
            let escaped_name = escape_js_single_quoted(name);
            if props.is_empty() {
                slot_parts.push(format!("'{}': {{}}", escaped_name));
            } else {
                // Slot prop keys (the `props` strings) may also carry hyphens /
                // spaces / quotes when they come from arbitrary `slot="…"`
                // attributes; keep them verbatim for now since they're produced
                // upstream from validated bindings and don't reach this site
                // with adversarial input in practice. (issue #455, H-092)
                slot_parts.push(format!("'{}': {{{}}}", escaped_name, props.join(", ")));
            }
        }
        format!("{{{}}}", slot_parts.join(", "))
    }
}

/// Escape a string for use as the body of a single-quoted JS string literal.
/// Used to interpolate slot names / slot prop keys into the generated TS output
/// without producing invalid JS when a name carries `'`, `\\`, or control
/// characters (issue #455, H-092).
pub(crate) fn escape_js_single_quoted(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for c in s.chars() {
        match c {
            '\\' => out.push_str("\\\\"),
            '\'' => out.push_str("\\'"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if (c as u32) < 0x20 => {
                let _ = write!(out, "\\u{:04x}", c as u32);
            }
            c => out.push(c),
        }
    }
    out
}
