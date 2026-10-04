use std::cell::OnceCell;

use rsvelte_kernel::performance::buffer_pool;
use rsvelte_kernel::source::index::TypedIndex;
use rsvelte_stylesheet::matcher;
use rsvelte_stylesheet::syntax_tree::{ComplexSelector, Simple, StyleSheet};
use rsvelte_svelte_hir::compiler_syntax_tree::{
    Attribute, AttributeValue, CompilerNodeIdentifier, CompilerSyntaxTree,
};
use rustc_hash::FxHashMap;

use super::is_dom;

#[derive(Default)]
struct Bucket {
    start: u32,
    end: u32,
    selected: bool,
}

pub(super) struct Candidates<'a> {
    tree: &'a CompilerSyntaxTree,
    has_compound_classes: bool,
    dom: OnceCell<DomCandidates>,
    unknown: Vec<CompilerNodeIdentifier>,
    classes: FxHashMap<&'a str, Bucket>,
    entries: Vec<CompilerNodeIdentifier>,
}

impl<'a> Candidates<'a> {
    pub(super) fn new(
        tree: &'a CompilerSyntaxTree,
        source: &'a str,
        sheet: &'a StyleSheet,
    ) -> Self {
        let mut candidates = Self {
            tree,
            has_compound_classes: false,
            dom: OnceCell::new(),
            unknown: Vec::new(),
            classes: FxHashMap::default(),
            entries: Vec::new(),
        };
        rsvelte_stylesheet::scope::visit_selectors(sheet, |selector| {
            let mut classes = selector_classes(selector, sheet, source);
            if let Some(class) = classes.next() {
                candidates.classes.entry(class).or_default();
            }
            for class in classes {
                candidates.has_compound_classes = true;
                candidates.classes.entry(class).or_default();
            }
        });
        if candidates.classes.is_empty() {
            return candidates;
        }
        for (identifier, element) in tree.elements() {
            if !is_dom(element) {
                continue;
            }
            let attributes = tree.attributes(element.attributes);
            if attributes.iter().any(|attribute| {
                matches!(attribute.value, AttributeValue::Spread(_))
                    || attribute.name.text(source).eq_ignore_ascii_case("class")
                        && matches!(
                            attribute.value,
                            AttributeValue::Bind(_)
                                | AttributeValue::Expression { .. }
                                | AttributeValue::Shorthand(_)
                                | AttributeValue::Interpolated(_)
                        )
            }) {
                if candidates.unknown.capacity() == 0 {
                    candidates.unknown = buffer_pool::take_keyed::<UnknownClasses, _>();
                }
                candidates.unknown.push(identifier);
            } else {
                classes(attributes, source, |class| {
                    if let Some(bucket) = candidates.classes.get_mut(class) {
                        bucket.end = bucket
                            .end
                            .checked_add(1)
                            .expect("class index overflows u32");
                    }
                });
            }
        }
        candidates.select_classes(sheet, source);
        let mut end = 0_u32;
        #[expect(
            clippy::iter_over_hash_type,
            reason = "Each class stores its range; bucket order is private."
        )]
        for bucket in candidates.classes.values_mut() {
            let length = bucket.end;
            bucket.start = end;
            bucket.end = end;
            end = end.checked_add(length).expect("class index overflows u32");
        }
        if end != 0 {
            candidates.entries = buffer_pool::take_keyed::<ClassEntries, _>();
            candidates
                .entries
                .resize(end as usize, CompilerNodeIdentifier::new(0));
        }
        let mut unknown = candidates.unknown.iter().peekable();
        for (identifier, element) in tree.elements() {
            if unknown.peek() == Some(&&identifier) {
                unknown.next();
                continue;
            }
            if !is_dom(element) {
                continue;
            }
            classes(tree.attributes(element.attributes), source, |class| {
                if let Some(bucket) = candidates.classes.get_mut(class)
                    && (bucket.end == bucket.start
                        || candidates.entries[bucket.end as usize - 1] != identifier)
                {
                    candidates.entries[bucket.end as usize] = identifier;
                    bucket.end += 1;
                }
            });
        }
        candidates
    }

    fn select_classes(&mut self, sheet: &StyleSheet, source: &str) {
        if self.has_compound_classes {
            rsvelte_stylesheet::scope::visit_selectors(sheet, |selector| {
                let selected = selector_classes(selector, sheet, source)
                    .filter_map(|class| self.classes.get_key_value(class))
                    .min_by_key(|(_, bucket)| bucket.end)
                    .map(|(&class, _)| class);
                if let Some(class) = selected {
                    self.classes
                        .get_mut(class)
                        .expect("selector classes were registered before counting")
                        .selected = true;
                }
            });
            self.classes.retain(|_, bucket| bucket.selected);
        }
    }

    pub(super) fn matching(
        &self,
        selector: &ComplexSelector,
        sheet: &StyleSheet,
        source: &str,
    ) -> impl Iterator<Item = CompilerNodeIdentifier> + '_ {
        let mut classes = selector_classes(selector, sheet, source);
        let bucket = if self.has_compound_classes {
            classes
                .filter_map(|class| self.classes.get(class))
                .min_by_key(|bucket| bucket.end - bucket.start)
        } else {
            classes.next().and_then(|class| self.classes.get(class))
        };
        let (known, unknown) = bucket.map_or_else(
            || (&[][..], &[][..]),
            |bucket| {
                let known = &self.entries[bucket.start as usize..bucket.end as usize];
                (known, self.unknown.as_slice())
            },
        );
        let dom: &[CompilerNodeIdentifier] = if bucket.is_none() {
            &self
                .dom
                .get_or_init(|| DomCandidates::new(self.tree))
                .elements
        } else {
            &[]
        };
        known.iter().chain(unknown).chain(dom).copied()
    }
}

struct ClassEntries;
struct UnknownClasses;

impl Drop for Candidates<'_> {
    fn drop(&mut self) {
        buffer_pool::give_keyed::<ClassEntries, _>(std::mem::take(&mut self.entries));
        buffer_pool::give_keyed::<UnknownClasses, _>(std::mem::take(&mut self.unknown));
    }
}

struct DomCandidates {
    elements: Vec<CompilerNodeIdentifier>,
}

impl DomCandidates {
    fn new(tree: &CompilerSyntaxTree) -> Self {
        let mut elements = buffer_pool::take_keyed::<Self, _>();
        elements.extend(
            tree.elements()
                .filter_map(|(identifier, element)| is_dom(element).then_some(identifier)),
        );
        Self { elements }
    }
}

impl Drop for DomCandidates {
    fn drop(&mut self) {
        buffer_pool::give_keyed::<Self, _>(std::mem::take(&mut self.elements));
    }
}

fn selector_classes<'a>(
    selector: &'a ComplexSelector,
    sheet: &'a StyleSheet,
    source: &'a str,
) -> impl Iterator<Item = &'a str> {
    selector
        .parts
        .iter()
        .rev()
        .find(|relative| !matcher::is_global(source, relative))
        .into_iter()
        .flat_map(|relative| &relative.simple)
        .filter_map(|simple| match simple {
            Simple::Class { name, .. } => Some(sheet.text(*name, source)),
            _ => None,
        })
}

fn classes(attributes: &[Attribute], source: &str, mut visit: impl FnMut(&str)) {
    for attribute in attributes {
        match &attribute.value {
            AttributeValue::Class(_) => visit(attribute.name.text(source)),
            AttributeValue::Static(value)
                if attribute.name.text(source).eq_ignore_ascii_case("class") =>
            {
                for class in value.split_ascii_whitespace() {
                    visit(class);
                }
            }
            _ => {}
        }
    }
}
