//! The `events` literal of the component export — mirrors
//! `svelte2tsx/nodes/ComponentEvents.ts`.

use std::fmt::Write as _;

use indexmap::{IndexMap, map::Entry};
use rustc_hash::FxBuildHasher;

use super::super::script::{ComponentEvents, ExportedNames};
use super::super::template;

struct ForwardedEventValues<'a> {
    first: &'a str,
    rest: Vec<&'a str>,
}

impl<'a> ForwardedEventValues<'a> {
    fn new(value: &'a str) -> Self {
        Self {
            first: value,
            rest: Vec::new(),
        }
    }

    fn overwrite(&mut self, value: &'a str) {
        self.first = value;
        self.rest.clear();
    }

    fn append(&mut self, value: &'a str) {
        self.rest.push(value);
    }

    fn is_single(&self) -> bool {
        self.rest.is_empty()
    }
}

type ForwardedEvents<'a> = IndexMap<&'a str, ForwardedEventValues<'a>, FxBuildHasher>;

fn group_forwarded_events(
    events: &[(String, String, template::ForwardedEventKind)],
) -> ForwardedEvents<'_> {
    group_forwarded_events_with_observer(events, || {})
}

fn group_forwarded_events_with_observer<'a>(
    events: &'a [(String, String, template::ForwardedEventKind)],
    mut observe_lookup: impl FnMut(),
) -> ForwardedEvents<'a> {
    let mut grouped: ForwardedEvents<'a> =
        IndexMap::with_capacity_and_hasher(events.len(), FxBuildHasher);
    for (name, value, kind) in events {
        observe_lookup();
        match grouped.entry(name.as_str()) {
            Entry::Occupied(mut entry) => match kind {
                template::ForwardedEventKind::Element => {
                    entry.get_mut().overwrite(value);
                }
                template::ForwardedEventKind::Component => {
                    entry.get_mut().append(value);
                }
            },
            Entry::Vacant(entry) => {
                entry.insert(ForwardedEventValues::new(value));
            }
        }
    }
    grouped
}

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
        let grouped = group_forwarded_events(&template_info.element_events);
        for (name, values) in grouped {
            if values.is_single() {
                event_parts.push(format!("'{name}':{}", values.first));
            } else {
                let mut part = format!("'{name}':__sveltets_2_unionType({}", values.first);
                for value in values.rest {
                    write!(part, ", {value}").expect("writing to a String cannot fail");
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

    fn forwarded(
        name: &str,
        value: &str,
        kind: template::ForwardedEventKind,
    ) -> (String, String, template::ForwardedEventKind) {
        (name.to_string(), value.to_string(), kind)
    }

    #[test]
    fn forwarded_events_preserve_first_key_order_through_overwrite() {
        let template_info = template::TemplateInfo {
            element_events: vec![
                forwarded(
                    "alpha",
                    "alpha-component-first",
                    template::ForwardedEventKind::Component,
                ),
                forwarded(
                    "beta",
                    "beta-element-first",
                    template::ForwardedEventKind::Element,
                ),
                forwarded(
                    "gamma",
                    "gamma-component-first",
                    template::ForwardedEventKind::Component,
                ),
                forwarded(
                    "alpha",
                    "alpha-element-overwrite",
                    template::ForwardedEventKind::Element,
                ),
                forwarded(
                    "beta",
                    "beta-element-overwrite",
                    template::ForwardedEventKind::Element,
                ),
            ],
            ..Default::default()
        };

        assert_eq!(
            build_events_str(
                &ExportedNames::default(),
                &template_info,
                &ComponentEvents::default()
            ),
            "{'alpha':alpha-element-overwrite, 'beta':beta-element-overwrite, \
             'gamma':gamma-component-first}"
        );
    }

    #[test]
    fn forwarded_component_unions_retain_encounter_order_after_overwrite() {
        let template_info = template::TemplateInfo {
            element_events: vec![
                forwarded(
                    "alpha",
                    "alpha-component-before-overwrite",
                    template::ForwardedEventKind::Component,
                ),
                forwarded(
                    "alpha",
                    "alpha-element-overwrite",
                    template::ForwardedEventKind::Element,
                ),
                forwarded(
                    "alpha",
                    "alpha-component-second",
                    template::ForwardedEventKind::Component,
                ),
                forwarded(
                    "alpha",
                    "alpha-component-third",
                    template::ForwardedEventKind::Component,
                ),
            ],
            ..Default::default()
        };

        assert_eq!(
            build_events_str(
                &ExportedNames::default(),
                &template_info,
                &ComponentEvents::default()
            ),
            "{'alpha':__sveltets_2_unionType(alpha-element-overwrite, \
             alpha-component-second, alpha-component-third)}"
        );
    }

    #[test]
    fn forwarded_event_grouping_uses_one_lookup_per_unique_or_repeated_event() {
        for event_count in [32, 256, 1024] {
            let unique: Vec<_> = (0..event_count)
                .map(|index| {
                    forwarded(
                        &format!("event-{index}"),
                        &format!("value-{index}"),
                        template::ForwardedEventKind::Element,
                    )
                })
                .collect();
            let mut unique_lookups = 0;
            let unique_grouped =
                group_forwarded_events_with_observer(&unique, || unique_lookups += 1);

            assert_eq!(unique_lookups, event_count);
            assert_eq!(unique_grouped.len(), event_count);
            for index in 0..event_count {
                let (name, values) = unique_grouped.get_index(index).unwrap();
                assert_eq!(*name, format!("event-{index}"));
                assert_eq!(values.first, format!("value-{index}"));
                assert!(values.rest.is_empty());
            }

            let unique_name_count = event_count / 4;
            let mut repeated = Vec::with_capacity(event_count);
            for occurrence in 0..4 {
                for index in 0..unique_name_count {
                    repeated.push(forwarded(
                        &format!("event-{index}"),
                        &format!("value-{occurrence}-{index}"),
                        if occurrence == 2 {
                            template::ForwardedEventKind::Element
                        } else {
                            template::ForwardedEventKind::Component
                        },
                    ));
                }
            }
            let mut repeated_lookups = 0;
            let repeated_grouped =
                group_forwarded_events_with_observer(&repeated, || repeated_lookups += 1);

            assert_eq!(repeated_lookups, event_count);
            assert_eq!(repeated_grouped.len(), unique_name_count);
            for index in 0..unique_name_count {
                let (name, values) = repeated_grouped.get_index(index).unwrap();
                assert_eq!(*name, format!("event-{index}"));
                assert_eq!(values.first, format!("value-2-{index}"));
                assert_eq!(values.rest, [format!("value-3-{index}")]);
            }
        }
    }
}
