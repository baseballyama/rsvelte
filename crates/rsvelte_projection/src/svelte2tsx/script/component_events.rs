//! `ComponentEvents` — events a component declares or forwards.

use std::collections::HashMap;

use oxc_ast::ast as oxc;
use oxc_span::GetSpan;

use super::ast_utils::binding_pattern_simple_name;

/// Tracks events declared by a component.
///
/// Events can be declared via:
/// - `createEventDispatcher<{ eventName: DetailType }>()` (Svelte 4)
/// - `on:event` forwarding (Svelte 4)
/// - `$props()` with `on*` properties (Svelte 5)
#[derive(Debug, Clone, Default)]
pub struct ComponentEvents {
    /// Map from event name to its type information.
    events: HashMap<String, EventInfo>,
    /// Whether the component forwards all events (uses `$$restProps` with event handlers).
    pub forwards_all_events: bool,
    /// Generic type text from `createEventDispatcher<Type>()`, if any.
    /// Used to generate `{...__sveltets_2_toEventTypings<Type>()}` in the events return.
    pub dispatcher_generic_type: Option<String>,
    /// Locally-created, *untyped* event dispatchers
    /// (`const dispatch = createEventDispatcher()`) as `(name, decl_pos)` where
    /// `decl_pos` is the dispatcher declarator's absolute position in `source`.
    /// Their `dispatch("name")` call sites are scanned across the component to
    /// populate the `events: { name: __sveltets_2_customEvent }` return.
    /// Official only counts an instance-script `dispatch(...)` call when the
    /// dispatcher was already registered during its in-order AST walk — i.e.
    /// the call appears AFTER the declaration — so `decl_pos` is the order gate.
    pub dispatcher_decls: Vec<(String, u32)>,
    /// Dispatched event names in official insertion order: template
    /// `dispatch(...)` calls first (collected as `EventHandler` callees during
    /// the template walk, surfaced when the dispatcher declaration is reached),
    /// then instance-script `dispatch(...)` calls that appear after the
    /// declaration. Preserved (not sorted) for the `events:` return.
    dispatched_order: Vec<String>,
    /// Absolute source positions (end of the `createEventDispatcher` callee, just
    /// before its `(`) of every UNTYPED `createEventDispatcher()` call. When a
    /// `$$Events` interface is present, official `ComponentEventsFromInterface`
    /// prepends `<__sveltets_2_CustomEvents<$$Events>>` here so the untyped
    /// dispatcher picks up the declared event typings.
    pub dispatcher_typing_inject_pos: Vec<u32>,
}

/// Metadata about a single component event.
#[derive(Debug, Clone)]
pub struct EventInfo {
    /// The TypeScript type of the event detail.
    pub detail_type: Option<String>,
}

impl ComponentEvents {
    /// Create a new empty `ComponentEvents`.
    pub fn new() -> Self {
        Self {
            events: HashMap::new(),
            forwards_all_events: false,
            dispatcher_generic_type: None,
            dispatcher_decls: Vec::new(),
            dispatched_order: Vec::new(),
            dispatcher_typing_inject_pos: Vec::new(),
        }
    }

    /// Add an event declaration.
    pub fn add(&mut self, name: String, detail_type: Option<String>) {
        self.events.insert(name, EventInfo { detail_type });
    }

    /// Get all event names.
    pub fn get_event_names(&self) -> Vec<&str> {
        let mut names: Vec<&str> = self.events.keys().map(|s| s.as_str()).collect();
        names.sort();
        names
    }

    /// Check if there are any events declared.
    pub fn is_empty(&self) -> bool {
        self.events.is_empty()
    }

    /// Scan `source` for `<dispatcher>("eventName", …)` call sites of every
    /// recorded untyped dispatcher and add each event name in official insertion
    /// order. Mirrors `ComponentEventsFromEventsMap`:
    ///
    /// * **Template** `dispatch(...)` calls (those OUTSIDE the instance/module
    ///   `<script>` regions) are collected as `EventHandler` callees during the
    ///   template walk and surfaced (regardless of source order) when the
    ///   dispatcher declaration is reached — so they come FIRST, in template
    ///   source order.
    /// * **Instance-script** `dispatch(...)` calls are only counted when they
    ///   appear AFTER the dispatcher declaration in the in-order AST walk
    ///   (`checkIfCallExpressionIsDispatch` requires the dispatcher to already
    ///   be registered) — so each call's position must exceed its dispatcher's
    ///   `decl_pos`. These come after the template events, in script order.
    ///
    /// `inst_range` / `mod_range` are the `[content_start, end)` byte spans of
    /// the instance and module `<script>` elements (module dispatch calls are
    /// never counted — official only walks the instance script for dispatches).
    pub fn collect_dispatched_events(
        &mut self,
        source: &str,
        inst_range: Option<(u32, u32)>,
        mod_range: Option<(u32, u32)>,
    ) {
        let decls = self.dispatcher_decls.clone();
        if decls.is_empty() {
            return;
        }
        // Every `<dispatcher>("evt", …)` match across the source, as
        // `(call_idx, dispatcher_index, event_name)`, in ascending position.
        let mut matches: Vec<(usize, usize, String)> = Vec::new();
        let bytes = source.as_bytes();
        let is_ident = |b: u8| b.is_ascii_alphanumeric() || b == b'_' || b == b'$';
        for (di, (disp, _)) in decls.iter().enumerate() {
            let dn = disp.as_bytes();
            let mut from = 0usize;
            while let Some(rel) = source[from..].find(disp.as_str()) {
                let idx = from + rel;
                from = idx + 1;
                // Word boundary: not part of a longer identifier / member access.
                if idx > 0 && (is_ident(bytes[idx - 1]) || bytes[idx - 1] == b'.') {
                    continue;
                }
                let mut p = idx + dn.len();
                if p < bytes.len() && is_ident(bytes[p]) {
                    continue;
                }
                while p < bytes.len() && (bytes[p] == b' ' || bytes[p] == b'\t') {
                    p += 1;
                }
                if p >= bytes.len() || bytes[p] != b'(' {
                    continue;
                }
                p += 1;
                while p < bytes.len() && bytes[p].is_ascii_whitespace() {
                    p += 1;
                }
                if p >= bytes.len() || (bytes[p] != b'"' && bytes[p] != b'\'' && bytes[p] != b'`') {
                    continue;
                }
                let quote = bytes[p];
                p += 1;
                let name_start = p;
                while p < bytes.len() && bytes[p] != quote {
                    p += 1;
                }
                if p < bytes.len() {
                    let evt = &source[name_start..p];
                    // Only simple identifier-ish names (skip interpolated/dynamic).
                    if !evt.is_empty() {
                        matches.push((idx, di, evt.to_string()));
                    }
                }
            }
        }
        matches.sort_by_key(|m| m.0);

        let in_range = |idx: usize, r: Option<(u32, u32)>| {
            r.is_some_and(|(a, b)| idx >= a as usize && idx < b as usize)
        };

        // Partition into template-first / script-after-decl groups, each kept in
        // source order, then merge with dedup (first occurrence wins).
        let mut template_events: Vec<String> = Vec::new();
        let mut script_events: Vec<String> = Vec::new();
        for (idx, di, evt) in matches {
            if in_range(idx, mod_range) {
                continue; // module dispatches are not counted
            }
            if in_range(idx, inst_range) {
                let decl_pos = decls[di].1;
                if idx as u32 > decl_pos {
                    script_events.push(evt);
                }
            } else {
                template_events.push(evt);
            }
        }
        for evt in template_events.into_iter().chain(script_events) {
            if !self.events.contains_key(&evt) {
                self.dispatched_order.push(evt.clone());
                self.add(evt, None);
            }
        }
    }

    /// Get event entries for the return statement, in official insertion order.
    /// Returns (name, value) pairs like ("hi", "__sveltets_2_customEvent").
    pub fn get_event_entries(&self) -> Vec<(String, String)> {
        self.dispatched_order
            .iter()
            .map(|name| (name.clone(), "__sveltets_2_customEvent".to_string()))
            .collect()
    }

    /// Entries for the public `events.getAll()` API surface: `(name, type)`
    /// where `type` mirrors upstream's `CustomEvent<detail>` (or
    /// `CustomEvent<any>` when the detail type is unknown). Sorted by name for
    /// determinism; the deprecated `doc` field is not tracked.
    pub fn get_api_entries(&self) -> Vec<(String, String)> {
        let mut entries: Vec<(String, String)> = self
            .events
            .iter()
            .map(|(name, info)| {
                let ty = match &info.detail_type {
                    Some(detail) => format!("CustomEvent<{detail}>"),
                    None => "CustomEvent<any>".to_string(),
                };
                (name.clone(), ty)
            })
            .collect();
        entries.sort_by(|a, b| a.0.cmp(&b.0));
        entries
    }
}

/// Detect `createEventDispatcher<Type>()` calls and extract the generic type.
///
/// Records the type text (e.g. `{a: A}`) in the events struct for use
/// in the return statement's events field.
pub(super) fn detect_create_event_dispatcher(
    declarator: &oxc::VariableDeclarator,
    raw_content: &str,
    events: &mut ComponentEvents,
    content_offset: u32,
) {
    if let Some(ref init) = declarator.init
        && let oxc::Expression::CallExpression(call) = init
        && let oxc::Expression::Identifier(ref callee) = call.callee
        && callee.name == "createEventDispatcher"
    {
        // Check for type arguments: createEventDispatcher<Type>()
        if let Some(ref type_args) = call.type_arguments
            && let Some(first_param) = type_args.params.first()
        {
            let start = first_param.span().start as usize;
            let end = first_param.span().end as usize;
            if start < end && end <= raw_content.len() {
                let type_text = raw_content[start..end].to_string();
                events.dispatcher_generic_type = Some(type_text);
            }
        } else if let Some(name) = binding_pattern_simple_name(&declarator.id) {
            // Untyped dispatcher: record its name + absolute declaration position
            // (`content_offset + declarator.span.start`) so `dispatch("name")`
            // call sites can be scanned — and order-gated against this position —
            // to populate the events return.
            let decl_pos = content_offset + declarator.span.start;
            events.dispatcher_decls.push((name.to_owned(), decl_pos));
            // Record the callee end (before `(`) so a `$$Events` interface can
            // inject `<__sveltets_2_CustomEvents<$$Events>>` onto the untyped call.
            events
                .dispatcher_typing_inject_pos
                .push(content_offset + callee.span.end);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_component_events_empty() {
        let events = ComponentEvents::new();
        assert!(events.is_empty());
        assert!(events.get_event_names().is_empty());
    }

    #[test]
    fn test_component_events_add() {
        let mut events = ComponentEvents::new();
        events.add("click".to_string(), Some("MouseEvent".to_string()));
        assert!(!events.is_empty());
        assert_eq!(events.get_event_names(), vec!["click"]);
    }
}
