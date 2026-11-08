//! The derived-artifact database: "compute once" for everything a document's tasks need.
//!
//! An [`Artifact`] is a pure function of the document (and of other artifacts). A
//! [`DocumentContext`] holds one lazily-filled slot per registered artifact; `context.get::<A>()`
//! computes `A` on first use and returns the cached value afterwards. Tasks never call parsers
//! directly — they ask for artifacts — so tasks can share the same parsed document.
//!
//! A [`Facet`] is a question plugins can answer (a TypeScript view, say). Each provider declares
//! which documents it handles. `context.facet::<F>()` runs the matching provider once and caches
//! the answer. A task written against a facet does not need to name a plugin's artifacts.
//!
//! A `DocumentContext` belongs to one worker thread for the lifetime of one document (it is
//! deliberately `!Sync`); parallelism is across documents. Asking for an artifact while it is being
//! computed (a dependency cycle) panics.

use std::any::{Any, TypeId as TypeIdentifier};
use std::cell::OnceCell;
#[cfg(feature = "trace-artifacts")]
use std::cell::RefCell;

use rustc_hash::FxHashMap;

use crate::computation::pipeline::Document;
use crate::performance::{buffer_pool, measurement};
use crate::source::positions::LineIndex;

pub trait Artifact: 'static {
    type Output: 'static;
    /// Also the metrics phase name.
    const NAME: &'static str;
    fn compute(context: &DocumentContext<'_>) -> Self::Output;
}

pub trait Facet: 'static {
    type Output: 'static;
    /// Also the metrics phase name.
    const NAME: &'static str;
}

#[cfg(feature = "trace-artifacts")]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct ArtifactAccess {
    pub name: &'static str,
    pub cached: bool,
}

/// How a plugin answers a facet; boxed as `dyn Any` inside [`FacetEntry`].
type Provider<F> = Box<dyn Fn(&DocumentContext<'_>) -> <F as Facet>::Output + Send + Sync>;

struct FacetEntry {
    slot: usize,
    providers: Vec<FacetProvider>,
}

struct FacetProvider {
    identifier: &'static str,
    applies: Box<dyn Fn(&Document) -> bool + Send + Sync>,
    compute: Box<dyn Any + Send + Sync>,
}

#[derive(Default)]
pub struct ArtifactRegistry {
    index: FxHashMap<TypeIdentifier, usize>,
    names: Vec<&'static str>,
    facets: FxHashMap<TypeIdentifier, FacetEntry>,
}

impl std::fmt::Debug for ArtifactRegistry {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("ArtifactRegistry")
            .field("names", &self.names)
            .finish_non_exhaustive()
    }
}

impl ArtifactRegistry {
    /// # Panics
    ///
    /// If another artifact or facet uses `A::NAME`.
    pub fn register<A: Artifact>(&mut self) {
        let next = self.names.len();
        if let std::collections::hash_map::Entry::Vacant(e) =
            self.index.entry(TypeIdentifier::of::<A>())
        {
            assert!(
                !self.names.contains(&A::NAME),
                "artifact or facet name `{}` is registered twice",
                A::NAME
            );
            e.insert(next);
            self.names.push(A::NAME);
        }
    }

    /// Registers a provider and its document predicate for facet `F`.
    ///
    /// # Panics
    ///
    /// If `identifier` already provides `F`.
    pub fn provide<F: Facet>(
        &mut self,
        identifier: &'static str,
        applies: impl Fn(&Document) -> bool + Send + Sync + 'static,
        provider: impl Fn(&DocumentContext<'_>) -> F::Output + Send + Sync + 'static,
    ) {
        let next = self.names.len();
        let entry = self
            .facets
            .entry(TypeIdentifier::of::<F>())
            .or_insert_with(|| {
                assert!(
                    !self.names.contains(&F::NAME),
                    "artifact or facet name `{}` is registered twice",
                    F::NAME
                );
                FacetEntry {
                    slot: next,
                    providers: Vec::new(),
                }
            });
        if entry.slot == next {
            self.names.push(F::NAME);
        }
        assert!(
            entry.providers.iter().all(|p| p.identifier != identifier),
            "{identifier} provides facet `{}` twice",
            F::NAME
        );
        let provider: Provider<F> = Box::new(provider);
        entry.providers.push(FacetProvider {
            identifier,
            applies: Box::new(applies),
            compute: Box::new(provider),
        });
    }

    /// Whether a provider handles `document` for facet `F`.
    #[must_use]
    pub fn provides<F: Facet>(&self, document: &Document) -> bool {
        self.facets
            .get(&TypeIdentifier::of::<F>())
            .is_some_and(|e| e.providers.iter().any(|p| (p.applies)(document)))
    }

    #[must_use]
    pub fn names(&self) -> &[&'static str] {
        &self.names
    }

    fn slot<A: Artifact>(&self) -> usize {
        *self
            .index
            .get(&TypeIdentifier::of::<A>())
            .unwrap_or_else(|| panic!("artifact `{}` is not registered", A::NAME))
    }
}

#[derive(Debug)]
pub struct DocumentContext<'a> {
    pub document: &'a Document,
    registry: &'a ArtifactRegistry,
    slots: Vec<OnceCell<Box<dyn Any>>>,
    line_index: OnceCell<LineIndex>,
    #[cfg(feature = "trace-artifacts")]
    computed: RefCell<Vec<&'static str>>,
    #[cfg(feature = "trace-artifacts")]
    accesses: RefCell<Vec<ArtifactAccess>>,
}

struct SlotBuffers;

impl<'a> DocumentContext<'a> {
    #[must_use]
    pub fn new(document: &'a Document, registry: &'a ArtifactRegistry) -> Self {
        let mut slots = buffer_pool::take_keyed::<SlotBuffers, _>();
        slots.resize_with(registry.names.len(), OnceCell::new);
        DocumentContext {
            document,
            registry,
            slots,
            line_index: OnceCell::new(),
            #[cfg(feature = "trace-artifacts")]
            computed: RefCell::default(),
            #[cfg(feature = "trace-artifacts")]
            accesses: RefCell::default(),
        }
    }

    #[inline]
    pub fn source_text(&self) -> &'a str {
        &self.document.text
    }

    /// # Panics
    ///
    /// If `A` was not registered in this context's registry.
    pub fn get<A: Artifact>(&self) -> &A::Output {
        let slot = &self.slots[self.registry.slot::<A>()];
        #[cfg(feature = "trace-artifacts")]
        self.accesses.borrow_mut().push(ArtifactAccess {
            name: A::NAME,
            cached: slot.get().is_some(),
        });
        slot.get_or_init(|| {
            let _p = measurement::phase(A::NAME);
            #[cfg(feature = "trace-artifacts")]
            self.computed.borrow_mut().push(A::NAME);
            Box::new(A::compute(self))
        })
        .downcast_ref()
        .expect("artifact slot holds its own output type")
    }

    /// `None` when no provider handles this document.
    ///
    /// # Panics
    ///
    /// If more than one provider handles this document for `F`.
    pub fn facet<F: Facet>(&self) -> Option<&F::Output> {
        let entry = self.registry.facets.get(&TypeIdentifier::of::<F>())?;
        let mut matching = entry
            .providers
            .iter()
            .filter(|p| (p.applies)(self.document));
        let provider = matching.next()?;
        assert!(
            matching.next().is_none(),
            "multiple providers handle facet `{}` for `{}`",
            F::NAME,
            self.document.path
        );
        Some(self.answer::<F>(entry.slot, provider.compute.as_ref()))
    }

    fn answer<F: Facet>(&self, slot: usize, provider: &(dyn Any + Send + Sync)) -> &F::Output {
        #[cfg(feature = "trace-artifacts")]
        self.accesses.borrow_mut().push(ArtifactAccess {
            name: F::NAME,
            cached: self.slots[slot].get().is_some(),
        });
        self.slots[slot]
            .get_or_init(|| {
                let _p = measurement::phase(F::NAME);
                #[cfg(feature = "trace-artifacts")]
                self.computed.borrow_mut().push(F::NAME);
                let provider = provider
                    .downcast_ref::<Provider<F>>()
                    .expect("a facet entry holds its own provider type");
                Box::new(provider(self))
            })
            .downcast_ref()
            .expect("facet slot holds its own output type")
    }

    pub fn line_index(&self) -> &LineIndex {
        self.line_index
            .get_or_init(|| LineIndex::new(self.source_text()))
    }

    /// Artifacts computed so far in this context, in order (for tests and tracing).
    #[cfg(feature = "trace-artifacts")]
    pub fn computed(&self) -> Vec<&'static str> {
        self.computed.borrow().clone()
    }

    #[cfg(feature = "trace-artifacts")]
    pub fn accesses(&self) -> Vec<ArtifactAccess> {
        self.accesses.borrow().clone()
    }
}

impl Drop for DocumentContext<'_> {
    fn drop(&mut self) {
        buffer_pool::give_keyed::<SlotBuffers, _>(std::mem::take(&mut self.slots));
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[cfg(feature = "trace-artifacts")]
    #[test]
    fn access_trace_distinguishes_computation_from_cache_hits() {
        let mut registry = ArtifactRegistry::default();
        registry.register::<First>();
        let document = Document::new("file".into(), String::new()).expect("valid document");
        let context = DocumentContext::new(&document, &registry);
        context.get::<First>();
        context.get::<First>();
        assert_eq!(context.computed(), ["same"]);
        assert_eq!(
            context.accesses(),
            [
                ArtifactAccess {
                    name: "same",
                    cached: false
                },
                ArtifactAccess {
                    name: "same",
                    cached: true
                },
            ]
        );
    }

    struct First;
    impl Artifact for First {
        type Output = ();

        const NAME: &'static str = "same";

        fn compute(_: &DocumentContext<'_>) {}
    }

    struct Second;
    impl Artifact for Second {
        type Output = ();

        const NAME: &'static str = "same";

        fn compute(_: &DocumentContext<'_>) {}
    }

    #[test]
    #[should_panic(expected = "name `same` is registered twice")]
    fn distinct_artifacts_cannot_share_a_name() {
        let mut registry = ArtifactRegistry::default();
        registry.register::<First>();
        registry.register::<Second>();
    }
}
