//! `ComponentEvents` — events a component declares or forwards.

use std::collections::HashMap;

use oxc_ast::ast as oxc;
use oxc_span::GetSpan;
use rustc_hash::FxHashMap;

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
        if self.dispatcher_decls.is_empty() {
            return;
        }
        let (template_events, script_events) =
            scan_dispatch_calls(source, &self.dispatcher_decls, inst_range, mod_range);
        for evt in template_events.into_iter().chain(script_events) {
            if !self.events.contains_key(evt) {
                self.dispatched_order.push(evt.to_string());
                self.add(evt.to_string(), None);
            }
        }
    }

    /// Get event entries for the return statement, in official insertion order.
    /// Returns (name, value) pairs like ("hi", "__sveltets_2_customEvent").
    pub fn get_event_entries(&self) -> impl ExactSizeIterator<Item = (&str, &'static str)> {
        self.dispatched_order
            .iter()
            .map(|name| (name.as_str(), "__sveltets_2_customEvent"))
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

fn scan_dispatch_calls<'source>(
    source: &'source str,
    decls: &[(String, u32)],
    inst_range: Option<(u32, u32)>,
    mod_range: Option<(u32, u32)>,
) -> (Vec<&'source str>, Vec<&'source str>) {
    scan_dispatch_calls_with_observer(source, decls, inst_range, mod_range, || {})
}

fn scan_dispatch_calls_with_observer<'source>(
    source: &'source str,
    decls: &[(String, u32)],
    inst_range: Option<(u32, u32)>,
    mod_range: Option<(u32, u32)>,
    mut observe_identifier: impl FnMut(),
) -> (Vec<&'source str>, Vec<&'source str>) {
    let mut dispatcher_indices: FxHashMap<&str, (usize, usize)> =
        FxHashMap::with_capacity_and_hasher(decls.len(), Default::default());
    let mut next_dispatcher = vec![usize::MAX; decls.len()];
    for (index, (name, _)) in decls.iter().enumerate() {
        dispatcher_indices
            .entry(name.as_str())
            .and_modify(|(_, tail)| {
                next_dispatcher[*tail] = index;
                *tail = index;
            })
            .or_insert((index, index));
    }

    let bytes = source.as_bytes();
    let is_ident = |b: u8| b.is_ascii_alphanumeric() || b == b'_' || b == b'$';
    let in_range = |idx: usize, range: Option<(u32, u32)>| {
        range.is_some_and(|(start, end)| idx >= start as usize && idx < end as usize)
    };
    let mut template_events = Vec::new();
    let mut script_events = Vec::new();
    let mut idx = 0usize;

    while idx < bytes.len() {
        if !is_ident(bytes[idx]) {
            idx += 1;
            continue;
        }

        let start = idx;
        idx += 1;
        while idx < bytes.len() && is_ident(bytes[idx]) {
            idx += 1;
        }
        observe_identifier();

        if start > 0 && bytes[start - 1] == b'.' {
            continue;
        }
        let Some(&(mut dispatcher_index, _)) = dispatcher_indices.get(&source[start..idx]) else {
            continue;
        };

        let mut p = idx;
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
        if p >= bytes.len() || p == name_start || in_range(start, mod_range) {
            continue;
        }
        let event = &source[name_start..p];

        loop {
            if in_range(start, inst_range) {
                if start as u32 > decls[dispatcher_index].1 {
                    script_events.push(event);
                }
            } else {
                template_events.push(event);
            }
            dispatcher_index = next_dispatcher[dispatcher_index];
            if dispatcher_index == usize::MAX {
                break;
            }
        }
    }

    (template_events, script_events)
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
    use std::fmt::Write as _;

    use super::*;

    fn event_names(events: &ComponentEvents) -> Vec<&str> {
        events.get_event_entries().map(|(name, _)| name).collect()
    }

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

    #[test]
    fn dispatch_scan_preserves_template_script_and_module_ordering() {
        let source = concat!(
            "dispatch('template-before');",
            "<script context=\"module\">dispatch('module');</script>",
            "<script>",
            "dispatch('before-declaration');",
            "const dispatch = createEventDispatcher();",
            "dispatch('script-after');",
            "</script>",
            "<button onclick={() => dispatch('template-after')}></button>",
        );
        let module_start = source.find("dispatch('module')").unwrap() as u32;
        let module_end = module_start + "dispatch('module')".len() as u32;
        let instance_start = source.find("dispatch('before-declaration')").unwrap() as u32;
        let instance_end = source.rfind("</script>").unwrap() as u32;
        let declaration = source.find("const dispatch").unwrap() as u32;
        let mut events = ComponentEvents::new();
        events
            .dispatcher_decls
            .push(("dispatch".to_string(), declaration));

        events.collect_dispatched_events(
            source,
            Some((instance_start, instance_end)),
            Some((module_start, module_end)),
        );

        assert_eq!(
            event_names(&events),
            vec!["template-before", "template-after", "script-after"]
        );
    }

    #[test]
    fn dispatch_scan_preserves_textual_boundaries_and_quotes() {
        let source = concat!(
            "dispatchLong('long');",
            "longdispatch('prefix');",
            "object.dispatch('member');",
            "object. dispatch('spaced-member');",
            "dispatch\n('newline-before-paren');",
            "dispatch(\n'single');",
            "dispatch(\"double\");",
            "dispatch(`backtick`);",
            "\"dispatch('inside-string')\";",
            "/* dispatch('inside-comment') */",
        );
        let mut events = ComponentEvents::new();
        events.dispatcher_decls.push(("dispatch".to_string(), 0));

        events.collect_dispatched_events(source, None, None);

        assert_eq!(
            event_names(&events),
            vec![
                "spaced-member",
                "single",
                "double",
                "backtick",
                "inside-string",
                "inside-comment",
            ]
        );
    }

    #[test]
    fn dispatch_scan_preserves_duplicate_dispatcher_declaration_gates() {
        let source = " dispatch('first'); dispatch('second'); dispatch('third');";
        let second = source.find("dispatch('second')").unwrap() as u32;
        let third = source.find("dispatch('third')").unwrap() as u32;
        let decls = vec![
            ("dispatch".to_string(), second),
            ("dispatch".to_string(), 0),
            ("dispatch".to_string(), third),
        ];

        let (_, script_events) =
            scan_dispatch_calls(source, &decls, Some((0, source.len() as u32)), None);

        assert_eq!(script_events, vec!["first", "second", "third", "third"]);
    }

    #[test]
    fn dispatch_scan_visits_large_source_once_for_1_16_and_128_dispatchers() {
        let mut source = "noise_token ".repeat(16_384);
        for index in 0..128 {
            let _ = write!(source, " dispatch{index}('event{index}');");
        }

        for dispatcher_count in [1, 16, 128] {
            let decls: Vec<(String, u32)> = (0..dispatcher_count)
                .map(|index| (format!("dispatch{index}"), 0))
                .collect();
            let mut identifiers_visited = 0;
            let (template_events, script_events) =
                scan_dispatch_calls_with_observer(&source, &decls, None, None, || {
                    identifiers_visited += 1;
                });

            assert_eq!(template_events.len(), dispatcher_count);
            assert!(script_events.is_empty());
            assert_eq!(identifiers_visited, 16_384 + 128 * 2);
            assert_eq!(template_events[0], "event0");
            assert_eq!(
                template_events[dispatcher_count - 1],
                format!("event{}", dispatcher_count - 1)
            );
        }
    }
}
