//! The `events` literal of the component export — mirrors
//! `svelte2tsx/nodes/ComponentEvents.ts`.

use std::fmt::Write as _;

use indexmap::{IndexMap, map::Entry};
use rustc_hash::FxBuildHasher;

use super::super::script::{ComponentEvents, ExportedNames};
use super::super::template;

struct ForwardedEventValues<'a> {
    first: &'a template::ForwardedEvent<'a>,
    rest: Vec<&'a template::ForwardedEvent<'a>>,
}

impl<'a> ForwardedEventValues<'a> {
    fn new(value: &'a template::ForwardedEvent<'a>) -> Self {
        Self {
            first: value,
            rest: Vec::new(),
        }
    }

    fn overwrite(&mut self, value: &'a template::ForwardedEvent<'a>) {
        self.first = value;
        self.rest.clear();
    }

    fn append(&mut self, value: &'a template::ForwardedEvent<'a>) {
        self.rest.push(value);
    }

    fn is_single(&self) -> bool {
        self.rest.is_empty()
    }
}

type ForwardedEvents<'a> = IndexMap<&'a str, ForwardedEventValues<'a>, FxBuildHasher>;

fn group_forwarded_events_with_observer<'a>(
    events: &'a [template::ForwardedEvent<'a>],
    mut observe_lookup: impl FnMut(),
) -> ForwardedEvents<'a> {
    let mut grouped: ForwardedEvents<'a> =
        IndexMap::with_capacity_and_hasher(events.len(), FxBuildHasher);
    for event in events {
        observe_lookup();
        match grouped.entry(event.name) {
            Entry::Occupied(mut entry) => match event.source {
                template::ForwardedEventSource::Mapped(_) => {
                    entry.get_mut().overwrite(event);
                }
                template::ForwardedEventSource::Component(_) => {
                    entry.get_mut().append(event);
                }
            },
            Entry::Vacant(entry) => {
                entry.insert(ForwardedEventValues::new(event));
            }
        }
    }
    grouped
}

fn write_forwarded_event_value(
    output: &mut String,
    event: &template::ForwardedEvent<'_>,
    observe_materialization: &mut impl FnMut(),
) {
    observe_materialization();
    match event.source {
        template::ForwardedEventSource::Mapped(mapper) => {
            let mapper = match mapper {
                template::ForwardedEventMapper::Element => "mapElementEvent",
                template::ForwardedEventMapper::Body => "mapBodyEvent",
                template::ForwardedEventMapper::Window => "mapWindowEvent",
            };
            write!(output, "__sveltets_2_{mapper}('{}')", event.name)
                .expect("writing to a String cannot fail");
        }
        template::ForwardedEventSource::Component(component) => {
            write!(
                output,
                "__sveltets_2_bubbleEventDef(__sveltets_2_instanceOf({component}).$$events_def, '{}')",
                event.name
            )
            .expect("writing to a String cannot fail");
        }
    }
}

/// Build the `events` object literal for the component export from template info
/// and component events.
pub(crate) fn build_events_str(
    exported_names: &ExportedNames,
    template_info: &template::TemplateInfo<'_>,
    events: &ComponentEvents,
) -> String {
    build_events_str_with_observer(exported_names, template_info, events, || {}, || {})
}

fn build_events_str_with_observer(
    exported_names: &ExportedNames,
    template_info: &template::TemplateInfo<'_>,
    events: &ComponentEvents,
    mut observe_lookup: impl FnMut(),
    mut observe_materialization: impl FnMut(),
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
        let grouped = group_forwarded_events_with_observer(
            &template_info.element_events,
            &mut observe_lookup,
        );
        for (name, values) in grouped {
            if values.is_single() {
                let mut part = format!("'{name}':");
                write_forwarded_event_value(&mut part, values.first, &mut observe_materialization);
                event_parts.push(part);
            } else {
                let mut part = format!("'{name}':__sveltets_2_unionType(");
                write_forwarded_event_value(&mut part, values.first, &mut observe_materialization);
                for value in values.rest {
                    part.push_str(", ");
                    write_forwarded_event_value(&mut part, value, &mut observe_materialization);
                }
                part.push(')');
                event_parts.push(part);
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

#[cfg(test)]
mod tests {
    use super::*;

    fn mapped(name: &str, mapper: template::ForwardedEventMapper) -> template::ForwardedEvent<'_> {
        template::ForwardedEvent {
            name,
            source: template::ForwardedEventSource::Mapped(mapper),
        }
    }

    fn component<'a>(name: &'a str, target: &'a str) -> template::ForwardedEvent<'a> {
        template::ForwardedEvent {
            name,
            source: template::ForwardedEventSource::Component(target),
        }
    }

    #[test]
    fn forwarded_events_preserve_first_key_order_through_overwrite() {
        let template_info = template::TemplateInfo {
            element_events: vec![
                component("alpha", "AlphaFirst"),
                mapped("beta", template::ForwardedEventMapper::Window),
                component("gamma", "Gamma"),
                mapped("alpha", template::ForwardedEventMapper::Body),
                mapped("beta", template::ForwardedEventMapper::Element),
            ],
            ..Default::default()
        };

        assert_eq!(
            build_events_str(
                &ExportedNames::default(),
                &template_info,
                &ComponentEvents::default()
            ),
            "{'alpha':__sveltets_2_mapBodyEvent('alpha'), \
             'beta':__sveltets_2_mapElementEvent('beta'), \
             'gamma':__sveltets_2_bubbleEventDef(__sveltets_2_instanceOf(Gamma).$$events_def, \
             'gamma')}"
        );
    }

    #[test]
    fn forwarded_component_unions_retain_encounter_order_after_overwrite() {
        let template_info = template::TemplateInfo {
            element_events: vec![
                component("alpha", "Before"),
                mapped("alpha", template::ForwardedEventMapper::Element),
                component("alpha", "Second"),
                component("alpha", "Third"),
            ],
            ..Default::default()
        };

        assert_eq!(
            build_events_str(
                &ExportedNames::default(),
                &template_info,
                &ComponentEvents::default()
            ),
            "{'alpha':__sveltets_2_unionType(__sveltets_2_mapElementEvent('alpha'), \
             __sveltets_2_bubbleEventDef(__sveltets_2_instanceOf(Second).$$events_def, 'alpha'), \
             __sveltets_2_bubbleEventDef(__sveltets_2_instanceOf(Third).$$events_def, 'alpha'))}"
        );
    }

    #[test]
    fn forwarded_event_descriptor_defers_overwritten_materializations_at_scale() {
        let names: Vec<_> = (0..256).map(|index| format!("event-{index}")).collect();
        let mut forwarded = Vec::with_capacity(1024);
        for occurrence in 0..4 {
            for name in &names {
                forwarded.push(if occurrence == 2 {
                    mapped(name, template::ForwardedEventMapper::Element)
                } else {
                    component(name, "Component")
                });
            }
        }
        let template_info = template::TemplateInfo {
            element_events: forwarded,
            ..Default::default()
        };
        let mut lookups = 0;
        let mut materializations = 0;

        let output = build_events_str_with_observer(
            &ExportedNames::default(),
            &template_info,
            &ComponentEvents::default(),
            || lookups += 1,
            || materializations += 1,
        );

        assert_eq!(lookups, 1024);
        assert_eq!(materializations, 512);
        assert_eq!(output.matches("'event-").count(), 768);
        assert_eq!(output.matches(":__sveltets_2_unionType(").count(), 256);
    }
}
