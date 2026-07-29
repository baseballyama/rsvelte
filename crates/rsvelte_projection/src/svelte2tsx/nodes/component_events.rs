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

// Eight caps the linear prefix at 36 comparisons while keeping typical event sets map-free.
const FORWARDED_EVENT_LINEAR_LIMIT: usize = 8;

struct ForwardedEventEntry<'a> {
    name: &'a str,
    values: ForwardedEventValues<'a>,
}

enum GroupedForwardedEvents<'a> {
    Linear(Vec<ForwardedEventEntry<'a>>),
    Indexed(ForwardedEvents<'a>),
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum GroupingOperation {
    LinearComparison,
    IndexedLookup,
    Promotion,
}

impl<'a> GroupedForwardedEvents<'a> {
    fn new(occurrences: usize) -> Self {
        Self::Linear(Vec::with_capacity(
            occurrences.min(FORWARDED_EVENT_LINEAR_LIMIT),
        ))
    }

    fn insert(
        &mut self,
        event: &'a template::ForwardedEvent<'a>,
        observe: &mut impl FnMut(GroupingOperation),
    ) {
        if let Self::Indexed(grouped) = self {
            observe(GroupingOperation::IndexedLookup);
            match grouped.entry(event.name) {
                Entry::Occupied(mut entry) => merge_forwarded_event(entry.get_mut(), event),
                Entry::Vacant(entry) => {
                    entry.insert(ForwardedEventValues::new(event));
                }
            }
            return;
        }

        let Self::Linear(grouped) = self else {
            unreachable!()
        };
        for entry in grouped.iter_mut() {
            observe(GroupingOperation::LinearComparison);
            if entry.name == event.name {
                merge_forwarded_event(&mut entry.values, event);
                return;
            }
        }
        if grouped.len() < FORWARDED_EVENT_LINEAR_LIMIT {
            grouped.push(ForwardedEventEntry {
                name: event.name,
                values: ForwardedEventValues::new(event),
            });
            return;
        }

        observe(GroupingOperation::Promotion);
        let mut indexed =
            IndexMap::with_capacity_and_hasher(FORWARDED_EVENT_LINEAR_LIMIT + 1, FxBuildHasher);
        for entry in grouped.drain(..) {
            indexed.insert(entry.name, entry.values);
        }
        indexed.insert(event.name, ForwardedEventValues::new(event));
        *self = Self::Indexed(indexed);
    }
}

enum GroupedForwardedEventsIntoIter<'a> {
    Linear(std::vec::IntoIter<ForwardedEventEntry<'a>>),
    Indexed(indexmap::map::IntoIter<&'a str, ForwardedEventValues<'a>>),
}

impl<'a> Iterator for GroupedForwardedEventsIntoIter<'a> {
    type Item = (&'a str, ForwardedEventValues<'a>);

    fn next(&mut self) -> Option<Self::Item> {
        match self {
            Self::Linear(entries) => entries.next().map(|entry| (entry.name, entry.values)),
            Self::Indexed(entries) => entries.next(),
        }
    }
}

impl<'a> IntoIterator for GroupedForwardedEvents<'a> {
    type Item = (&'a str, ForwardedEventValues<'a>);
    type IntoIter = GroupedForwardedEventsIntoIter<'a>;

    fn into_iter(self) -> Self::IntoIter {
        match self {
            Self::Linear(entries) => GroupedForwardedEventsIntoIter::Linear(entries.into_iter()),
            Self::Indexed(entries) => GroupedForwardedEventsIntoIter::Indexed(entries.into_iter()),
        }
    }
}

fn merge_forwarded_event<'a>(
    values: &mut ForwardedEventValues<'a>,
    event: &'a template::ForwardedEvent<'a>,
) {
    match event.source {
        template::ForwardedEventSource::Mapped(_) => values.overwrite(event),
        template::ForwardedEventSource::Component(_) => values.append(event),
    }
}

fn group_forwarded_events_with_observer<'a>(
    events: &'a [template::ForwardedEvent<'a>],
    mut observe: impl FnMut(GroupingOperation),
) -> GroupedForwardedEvents<'a> {
    let mut grouped = GroupedForwardedEvents::new(events.len());
    for event in events {
        grouped.insert(event, &mut observe);
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
    build_events_str_with_observer(exported_names, template_info, events, |_| {}, || {})
}

fn build_events_str_with_observer(
    exported_names: &ExportedNames,
    template_info: &template::TemplateInfo<'_>,
    events: &ComponentEvents,
    mut observe_grouping: impl FnMut(GroupingOperation),
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
            &mut observe_grouping,
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
    fn forwarded_event_grouping_promotes_after_linear_limit() {
        let names: Vec<_> = (0..=FORWARDED_EVENT_LINEAR_LIMIT)
            .map(|index| format!("event-{index}"))
            .collect();
        let events: Vec<_> = names
            .iter()
            .map(|name| mapped(name, template::ForwardedEventMapper::Element))
            .collect();

        let mut linear_comparisons = 0;
        let mut indexed_lookups = 0;
        let mut promotions = 0;
        let linear = group_forwarded_events_with_observer(
            &events[..FORWARDED_EVENT_LINEAR_LIMIT],
            |operation| match operation {
                GroupingOperation::LinearComparison => linear_comparisons += 1,
                GroupingOperation::IndexedLookup => indexed_lookups += 1,
                GroupingOperation::Promotion => promotions += 1,
            },
        );
        assert!(matches!(linear, GroupedForwardedEvents::Linear(_)));
        assert_eq!(
            linear_comparisons,
            FORWARDED_EVENT_LINEAR_LIMIT * (FORWARDED_EVENT_LINEAR_LIMIT - 1) / 2
        );
        assert_eq!(indexed_lookups, 0);
        assert_eq!(promotions, 0);

        let mut linear_comparisons = 0;
        let mut indexed_lookups = 0;
        let mut promotions = 0;
        let indexed = group_forwarded_events_with_observer(&events, |operation| match operation {
            GroupingOperation::LinearComparison => linear_comparisons += 1,
            GroupingOperation::IndexedLookup => indexed_lookups += 1,
            GroupingOperation::Promotion => promotions += 1,
        });
        assert!(matches!(indexed, GroupedForwardedEvents::Indexed(_)));
        assert_eq!(
            linear_comparisons,
            FORWARDED_EVENT_LINEAR_LIMIT * (FORWARDED_EVENT_LINEAR_LIMIT + 1) / 2
        );
        assert_eq!(indexed_lookups, 0);
        assert_eq!(promotions, 1);
        assert_eq!(
            indexed
                .into_iter()
                .map(|(name, _)| name)
                .collect::<Vec<_>>(),
            names.iter().map(String::as_str).collect::<Vec<_>>()
        );
    }

    #[test]
    fn promoted_forwarded_events_preserve_overwrite_and_union_semantics() {
        let names: Vec<_> = (0..=FORWARDED_EVENT_LINEAR_LIMIT)
            .map(|index| format!("event-{index}"))
            .collect();
        let mut forwarded: Vec<_> = names
            .iter()
            .map(|name| mapped(name, template::ForwardedEventMapper::Element))
            .collect();
        forwarded.extend([
            component(&names[0], "Before"),
            mapped(&names[0], template::ForwardedEventMapper::Body),
            component(&names[0], "After"),
        ]);
        let template_info = template::TemplateInfo {
            element_events: forwarded,
            ..Default::default()
        };

        let output = build_events_str(
            &ExportedNames::default(),
            &template_info,
            &ComponentEvents::default(),
        );
        assert!(output.starts_with(
            "{'event-0':__sveltets_2_unionType(__sveltets_2_mapBodyEvent('event-0'), \
             __sveltets_2_bubbleEventDef(__sveltets_2_instanceOf(After).$$events_def, 'event-0'))"
        ));
        assert!(!output.contains("Before"));
        for index in 0..=FORWARDED_EVENT_LINEAR_LIMIT {
            assert_eq!(output.matches(&format!("'event-{index}':")).count(), 1);
        }
    }

    #[test]
    fn duplicate_heavy_forwarded_events_do_not_promote() {
        let events: Vec<_> = (0..256).map(|_| component("event", "Component")).collect();
        let mut linear_comparisons = 0;
        let mut indexed_lookups = 0;
        let mut promotions = 0;
        let grouped = group_forwarded_events_with_observer(&events, |operation| match operation {
            GroupingOperation::LinearComparison => linear_comparisons += 1,
            GroupingOperation::IndexedLookup => indexed_lookups += 1,
            GroupingOperation::Promotion => promotions += 1,
        });

        assert!(matches!(grouped, GroupedForwardedEvents::Linear(_)));
        assert_eq!(linear_comparisons, events.len() - 1);
        assert_eq!(indexed_lookups, 0);
        assert_eq!(promotions, 0);
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
        let mut linear_comparisons = 0;
        let mut indexed_lookups = 0;
        let mut promotions = 0;
        let mut materializations = 0;

        let output = build_events_str_with_observer(
            &ExportedNames::default(),
            &template_info,
            &ComponentEvents::default(),
            |operation| match operation {
                GroupingOperation::LinearComparison => linear_comparisons += 1,
                GroupingOperation::IndexedLookup => indexed_lookups += 1,
                GroupingOperation::Promotion => promotions += 1,
            },
            || materializations += 1,
        );

        assert_eq!(
            linear_comparisons,
            FORWARDED_EVENT_LINEAR_LIMIT * (FORWARDED_EVENT_LINEAR_LIMIT + 1) / 2
        );
        assert_eq!(indexed_lookups, 1024 - FORWARDED_EVENT_LINEAR_LIMIT - 1);
        assert_eq!(promotions, 1);
        assert_eq!(materializations, 512);
        assert_eq!(output.matches("'event-").count(), 768);
        assert_eq!(output.matches(":__sveltets_2_unionType(").count(), 256);
    }
}
