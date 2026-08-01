//! `ComponentEvents` — events a component declares or forwards.

use std::collections::HashMap;

use oxc_ast::ast as oxc;
use oxc_ast_visit::Visit;
use oxc_span::GetSpan;
use rustc_hash::FxHashMap;

use super::ast_utils::{
    binding_pattern_simple_name, module_export_name_to_string, property_key_to_string,
};

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
    /// Generic type text of every TYPED `createEventDispatcher<Type>()`, in
    /// declaration order. Official emits one
    /// `...__sveltets_2_toEventTypings<Type>()` spread per typed dispatcher.
    pub dispatcher_generic_types: Vec<String>,
    /// Locally-created, *untyped* event dispatchers
    /// (`const dispatch = createEventDispatcher()`) as `(name, decl_pos)` where
    /// `decl_pos` is the dispatcher declarator's absolute position in `source`.
    /// Their `dispatch("name")` call sites are scanned across the component to
    /// populate the `events: { name: __sveltets_2_customEvent }` return.
    /// Official only counts an instance-script `dispatch(...)` call when the
    /// dispatcher was already registered during its in-order AST walk — i.e.
    /// the call appears AFTER the declaration — so `decl_pos` is the order gate.
    pub dispatcher_decls: Vec<(String, u32)>,
    /// Event names that reach the `events:` return as
    /// `'name': __sveltets_2_customEvent`, in official insertion order — see
    /// `collect_dispatched_events` for how that order is reconstructed.
    dispatched_order: Vec<String>,
    /// Absolute source positions (end of the `createEventDispatcher` callee, just
    /// before its `(`) of every UNTYPED `createEventDispatcher()` call. When a
    /// `$$Events` interface is present, official `ComponentEventsFromInterface`
    /// prepends `<__sveltets_2_CustomEvents<$$Events>>` here so the untyped
    /// dispatcher picks up the declared event typings.
    pub dispatcher_typing_inject_pos: Vec<u32>,
    /// Local name `createEventDispatcher` is imported under. Official refuses to
    /// treat any call as a dispatcher factory until an `import … from 'svelte'`
    /// binds it, so an alias counts and a same-named local does not.
    event_dispatcher_import: Option<String>,
    /// `const x = 'literal'` bindings (any nesting level) in walk order, so a
    /// `dispatch(x)` whose first argument is a traced constant resolves.
    string_vars: Vec<StringVar>,
    /// Event additions recorded during the script walk, replayed in source order
    /// together with the scanned `dispatch(...)` call sites.
    pending: Vec<PendingEvent>,
}

/// A `const x = 'literal'` binding, keyed by its absolute declaration position:
/// official only resolves `dispatch(x)` against declarations its walk already
/// passed.
#[derive(Debug, Clone)]
struct StringVar {
    name: String,
    value: String,
    pos: u32,
}

#[derive(Debug, Clone)]
struct PendingEvent {
    /// Absolute source position the addition happens at in official's walk.
    pos: u32,
    name: String,
    kind: PendingKind,
}

#[derive(Debug, Clone)]
enum PendingKind {
    /// A member of a typed dispatcher's `<{…}>` literal — contributes typing
    /// only; it reaches the `events:` customEvent list solely by colliding with
    /// an already-registered name.
    TypedMember(Option<String>),
    /// A `dispatch('name', …)` call site.
    Dispatched,
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
        Self::default()
    }

    /// Add an event declaration.
    pub fn add(&mut self, name: String, detail_type: Option<String>) {
        self.events.insert(name, EventInfo { detail_type });
    }

    /// Official `ComponentEventsFromEventsMap.addToEvents`: a repeated name
    /// falls back to `CustomEvent<any>` AND joins the dispatched set, which is
    /// what makes two typed dispatchers declaring the same event also emit a
    /// `'name': __sveltets_2_customEvent` entry.
    fn add_to_events(&mut self, name: &str, detail_type: Option<String>) {
        if self.events.contains_key(name) {
            self.events
                .insert(name.to_owned(), EventInfo { detail_type: None });
            self.push_dispatched(name);
        } else {
            self.events
                .insert(name.to_owned(), EventInfo { detail_type });
        }
    }

    /// Mirrors the official `dispatchedEvents` `Set`: insertion-ordered, unique.
    fn push_dispatched(&mut self, name: &str) {
        if !self.dispatched_order.iter().any(|known| known == name) {
            self.dispatched_order.push(name.to_owned());
        }
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
    /// recorded untyped dispatcher and replay every event addition in official
    /// insertion order. Mirrors `ComponentEventsFromEventsMap`:
    ///
    /// * **Template** `dispatch(...)` calls (those OUTSIDE the instance/module
    ///   `<script>` regions) are collected as `EventHandler` callees during the
    ///   template walk and surfaced (regardless of their own source order) when
    ///   the dispatcher declaration is reached, so they order by that
    ///   declaration's position.
    /// * **Instance-script** `dispatch(...)` calls are only counted when they
    ///   appear AFTER the dispatcher declaration in the in-order AST walk
    ///   (`checkIfCallExpressionIsDispatch` requires the dispatcher to already
    ///   be registered) — so each call's position must exceed its dispatcher's
    ///   `decl_pos`.
    /// * **Typed** dispatcher members recorded by the script walk are replayed
    ///   at their declaration's position, interleaved with the above.
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
        let mut pending = std::mem::take(&mut self.pending);
        if !self.dispatcher_decls.is_empty() {
            let (template_events, script_events) = scan_dispatch_calls(
                source,
                &self.dispatcher_decls,
                &self.string_vars,
                inst_range,
                mod_range,
            );
            // A template call surfaces at the declaration that claims it, so it
            // orders against the script by the declaration's position.
            for (name, dispatcher_index) in template_events {
                pending.push(PendingEvent {
                    pos: self.dispatcher_decls[dispatcher_index].1,
                    name: name.to_owned(),
                    kind: PendingKind::Dispatched,
                });
            }
            for (name, pos) in script_events {
                pending.push(PendingEvent {
                    pos,
                    name: name.to_owned(),
                    kind: PendingKind::Dispatched,
                });
            }
        }
        if pending.is_empty() {
            return;
        }

        pending.sort_by_key(|entry| entry.pos);
        for entry in pending {
            match entry.kind {
                PendingKind::TypedMember(detail_type) => {
                    self.add_to_events(&entry.name, detail_type)
                }
                PendingKind::Dispatched => {
                    self.add_to_events(&entry.name, None);
                    self.push_dispatched(&entry.name);
                }
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

/// Template hits carry the index of the dispatcher declaration that claims them;
/// script hits carry the call's own absolute position.
type DispatchScan<'source> = (Vec<(&'source str, usize)>, Vec<(&'source str, u32)>);

fn scan_dispatch_calls<'source>(
    source: &'source str,
    decls: &[(String, u32)],
    string_vars: &'source [StringVar],
    inst_range: Option<(u32, u32)>,
    mod_range: Option<(u32, u32)>,
) -> DispatchScan<'source> {
    scan_dispatch_calls_with_observer(source, decls, string_vars, inst_range, mod_range, || {})
}

/// The value of `name` as official's `stringVars` map would hold it when the
/// walk reaches `before` — the newest declaration the walk already passed.
fn lookup_string_var<'a>(string_vars: &'a [StringVar], name: &str, before: u32) -> Option<&'a str> {
    string_vars
        .iter()
        .rev()
        .find(|var| var.pos < before && var.name == name)
        .map(|var| var.value.as_str())
}

fn scan_dispatch_calls_with_observer<'source>(
    source: &'source str,
    decls: &[(String, u32)],
    string_vars: &'source [StringVar],
    inst_range: Option<(u32, u32)>,
    mod_range: Option<(u32, u32)>,
    mut observe_identifier: impl FnMut(),
) -> DispatchScan<'source> {
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
        if p >= bytes.len() || in_range(start, mod_range) {
            continue;
        }
        let in_instance_script = in_range(start, inst_range);

        let event = if bytes[p] == b'"' || bytes[p] == b'\'' || bytes[p] == b'`' {
            let quote = bytes[p];
            p += 1;
            let name_start = p;
            while p < bytes.len() && bytes[p] != quote {
                p += 1;
            }
            if p >= bytes.len() || p == name_start {
                continue;
            }
            &source[name_start..p]
        } else if in_instance_script
            && (bytes[p].is_ascii_alphabetic() || bytes[p] == b'_' || bytes[p] == b'$')
        {
            // `dispatch(bla, …)` where `bla` is a traced string constant. Only in
            // the instance script: the template collects callee arguments through
            // `EventHandler`, which reads a literal `.value` and never resolves
            // identifiers.
            let ident_start = p;
            while p < bytes.len() && is_ident(bytes[p]) {
                p += 1;
            }
            let identifier = &source[ident_start..p];
            while p < bytes.len() && bytes[p].is_ascii_whitespace() {
                p += 1;
            }
            // Official requires the WHOLE first argument to be the identifier.
            if p >= bytes.len() || (bytes[p] != b',' && bytes[p] != b')') {
                continue;
            }
            match lookup_string_var(string_vars, identifier, start as u32) {
                Some(value) => value,
                None => continue,
            }
        } else {
            continue;
        };

        loop {
            if in_instance_script {
                if start as u32 > decls[dispatcher_index].1 {
                    script_events.push((event, start as u32));
                }
            } else {
                template_events.push((event, dispatcher_index));
            }
            dispatcher_index = next_dispatcher[dispatcher_index];
            if dispatcher_index == usize::MAX {
                break;
            }
        }
    }

    (template_events, script_events)
}

/// Walk the instance script in source order to collect everything official's
/// `ComponentEvents` learns while walking it: which local name
/// `createEventDispatcher` is imported under, the dispatchers instantiated from
/// it (typed and untyped, at any nesting level) and the string constants a
/// `dispatch(x)` can resolve through.
pub(super) fn collect_event_dispatcher_facts<'a>(
    program: &oxc::Program<'a>,
    raw_content: &str,
    events: &mut ComponentEvents,
    content_offset: u32,
) {
    EventDispatcherCollector {
        events,
        raw_content,
        content_offset,
    }
    .visit_program(program);
}

struct EventDispatcherCollector<'e, 'r> {
    events: &'e mut ComponentEvents,
    raw_content: &'r str,
    content_offset: u32,
}

impl EventDispatcherCollector<'_, '_> {
    /// Source text of `span`, mirroring upstream's `node.getText()`.
    fn text(&self, span: oxc_span::Span) -> Option<String> {
        let (start, end) = (span.start as usize, span.end as usize);
        (start < end && end <= self.raw_content.len())
            .then(|| self.raw_content[start..end].to_owned())
    }

    /// Official `checkIfIsStringLiteralDeclaration`.
    fn note_string_literal_declaration(&mut self, declarator: &oxc::VariableDeclarator<'_>) {
        if let Some(name) = binding_pattern_simple_name(&declarator.id)
            && let Some(oxc::Expression::StringLiteral(literal)) = declarator.init.as_ref()
        {
            self.events.string_vars.push(StringVar {
                name: name.to_owned(),
                value: literal.value.to_string(),
                pos: self.content_offset + declarator.span.start,
            });
        }
    }

    /// Official `checkIfDeclarationInstantiatedEventDispatcher`.
    fn note_dispatcher_declaration(&mut self, declarator: &oxc::VariableDeclarator<'_>) {
        let Some(name) = binding_pattern_simple_name(&declarator.id) else {
            return;
        };
        let Some(oxc::Expression::CallExpression(call)) = declarator.init.as_ref() else {
            return;
        };
        let oxc::Expression::Identifier(callee) = &call.callee else {
            return;
        };
        if self.events.event_dispatcher_import.as_deref() != Some(callee.name.as_str()) {
            return;
        }

        let decl_pos = self.content_offset + declarator.span.start;
        let typing = call
            .type_arguments
            .as_ref()
            .and_then(|arguments| arguments.params.first());
        let Some(typing) = typing else {
            // Untyped dispatcher: record its name + declaration position so
            // `dispatch("name")` call sites can be scanned and order-gated
            // against it, plus the callee end (before `(`) so a `$$Events`
            // interface can inject `<__sveltets_2_CustomEvents<$$Events>>`.
            self.events
                .dispatcher_decls
                .push((name.to_owned(), decl_pos));
            self.events
                .dispatcher_typing_inject_pos
                .push(self.content_offset + callee.span.end);
            return;
        };

        if let Some(typing_text) = self.text(typing.span()) {
            self.events.dispatcher_generic_types.push(typing_text);
        }
        // Only an inline type literal exposes its event names; a named type is
        // spread verbatim and stays opaque to the event map.
        if let oxc::TSType::TSTypeLiteral(literal) = typing {
            for member in literal.members.iter() {
                if let oxc::TSSignature::TSPropertySignature(signature) = member
                    && let Some(event_name) = property_key_to_string(&signature.key)
                {
                    let detail = signature
                        .type_annotation
                        .as_ref()
                        .and_then(|annotation| self.text(annotation.type_annotation.span()));
                    self.events.pending.push(PendingEvent {
                        pos: decl_pos,
                        name: event_name,
                        kind: PendingKind::TypedMember(detail),
                    });
                }
            }
        }
    }
}

impl<'a> Visit<'a> for EventDispatcherCollector<'_, '_> {
    fn visit_import_declaration(&mut self, it: &oxc::ImportDeclaration<'a>) {
        if self.events.event_dispatcher_import.is_none() {
            self.events.event_dispatcher_import = event_dispatcher_import_local(it);
        }
    }

    fn visit_variable_declarator(&mut self, it: &oxc::VariableDeclarator<'a>) {
        self.note_string_literal_declaration(it);
        self.note_dispatcher_declaration(it);
        oxc_ast_visit::walk::walk_variable_declarator(self, it);
    }
}

/// Official `checkIfImportIsEventDispatcher`: the local name a named
/// `import … from 'svelte'` binds `createEventDispatcher` to, alias included.
fn event_dispatcher_import_local(node: &oxc::ImportDeclaration<'_>) -> Option<String> {
    if node.source.value != "svelte" {
        return None;
    }
    node.specifiers.as_ref()?.iter().find_map(|specifier| {
        let oxc::ImportDeclarationSpecifier::ImportSpecifier(specifier) = specifier else {
            return None;
        };
        (module_export_name_to_string(&specifier.imported) == "createEventDispatcher")
            .then(|| specifier.local.name.to_string())
    })
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
            scan_dispatch_calls(source, &decls, &[], Some((0, source.len() as u32)), None);

        assert_eq!(
            script_events
                .iter()
                .map(|(name, _)| *name)
                .collect::<Vec<_>>(),
            vec!["first", "second", "third", "third"]
        );
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
                scan_dispatch_calls_with_observer(&source, &decls, &[], None, None, || {
                    identifiers_visited += 1;
                });

            assert_eq!(template_events.len(), dispatcher_count);
            assert!(script_events.is_empty());
            assert_eq!(identifiers_visited, 16_384 + 128 * 2);
            assert_eq!(template_events[0].0, "event0");
            assert_eq!(
                template_events[dispatcher_count - 1].0,
                format!("event{}", dispatcher_count - 1)
            );
        }
    }
}
