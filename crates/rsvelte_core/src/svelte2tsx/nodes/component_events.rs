//! The `events` literal of the component export — mirrors
//! `svelte2tsx/nodes/ComponentEvents.ts`.

use super::super::script::{ComponentEvents, ExportedNames};
use super::super::template;

/// Build the `events` object literal for the component export from template info
/// and component events.
pub(crate) fn build_events_str(
    exported_names: &ExportedNames,
    template_info: &template::TemplateInfo,
    events: &ComponentEvents,
) -> String {
    if exported_names.has_events_type {
        "{} as unknown as $$Events".to_string()
    } else {
        let mut event_parts = Vec::new();
        // Official `toDefString` order: typed-dispatcher event typings FIRST,
        // then bubbled/forwarded events, then untyped-dispatch customEvents.
        // Add generic event typing from createEventDispatcher<Type>() first.
        if let Some(ref generic_type) = events.dispatcher_generic_type {
            event_parts.push(format!(
                "...__sveltets_2_toEventTypings<{}>()",
                generic_type
            ));
        }
        // Add element events (forwarded), reducing them exactly like the
        // official `EventHandler` bubbled-events `Map` (event-handler.ts):
        //   * an `Element` forward does a plain `set` (OVERWRITE) — collapsing
        //     duplicate element forwards and clobbering any earlier component
        //     union for that name;
        //   * a `Component` forward CONCATS into the existing entry (so each
        //     forwarding component instance contributes a `unionType` member).
        // Key insertion order (first occurrence) is preserved. A single value is
        // emitted plain; multiple values become `__sveltets_2_unionType(...)`.
        let mut grouped: Vec<(String, Vec<String>)> = Vec::new();
        for (name, value, kind) in &template_info.element_events {
            match kind {
                crate::svelte2tsx::template::ForwardedEventKind::Element => {
                    if let Some(entry) = grouped.iter_mut().find(|(n, _)| n == name) {
                        // Plain overwrite (official `set`): a single value.
                        entry.1 = vec![value.clone()];
                    } else {
                        grouped.push((name.clone(), vec![value.clone()]));
                    }
                }
                crate::svelte2tsx::template::ForwardedEventKind::Component => {
                    if let Some(entry) = grouped.iter_mut().find(|(n, _)| n == name) {
                        entry.1.push(value.clone());
                    } else {
                        grouped.push((name.clone(), vec![value.clone()]));
                    }
                }
            }
        }
        for (name, values) in &grouped {
            if values.len() == 1 {
                event_parts.push(format!("'{}':{}", name, values[0]));
            } else {
                event_parts.push(format!(
                    "'{}':__sveltets_2_unionType({})",
                    name,
                    values.join(", ")
                ));
            }
        }
        // Add custom events from dispatchers (detected during script processing)
        for (name, value) in events.get_event_entries() {
            event_parts.push(format!("'{}': {}", name, value));
        }
        if event_parts.is_empty() {
            "{}".to_string()
        } else {
            format!("{{{}}}", event_parts.join(", "))
        }
    }
}
