//! The derived-artifact database: "compute once" for everything a document's tasks need.
//!
//! An [`Artifact`] is a pure function of the document (and of other artifacts). A [`Ctx`] holds one
//! lazily-filled slot per registered artifact; `ctx.get::<A>()` computes `A` on first use and
//! returns the cached value afterwards. Tasks never call parsers directly — they ask for artifacts
//! — so running compile, format and lint together parses the document once.
//!
//! A [`Facet`] is a question each language answers its own way (a TypeScript view of the document,
//! say). A language registers a provider for it; `ctx.facet::<F>()` runs the provider of the
//! document's language once and caches the answer like an artifact's. A task written against a
//! facet serves every language that provides it, including documents of several languages in one
//! run, without naming any language's artifacts.
//!
//! A `Ctx` belongs to one worker thread for the lifetime of one document (it is deliberately
//! `!Sync`); parallelism is across documents. Asking for an artifact while it is being computed
//! (a dependency cycle) panics.

use std::any::{Any, TypeId};
use std::cell::{OnceCell, RefCell};

use rustc_hash::FxHashMap;

use crate::metrics;
use crate::pipeline::Document;
use crate::source::LineIndex;

pub trait Artifact: 'static {
    type Output: 'static;
    /// Also the metrics phase name.
    const NAME: &'static str;
    fn compute(ctx: &Ctx<'_>) -> Self::Output;
}

pub trait Facet: 'static {
    type Output: 'static;
    /// Also the metrics phase name.
    const NAME: &'static str;
}

/// How a language answers a facet; boxed as `dyn Any` inside [`FacetEntry`].
type Provider<F> = Box<dyn Fn(&Ctx<'_>) -> <F as Facet>::Output + Send + Sync>;

struct FacetEntry {
    slot: usize,
    /// Per language id, a `Provider<F>`.
    providers: Vec<(&'static str, Box<dyn Any + Send + Sync>)>,
}

#[derive(Default)]
pub struct ArtifactRegistry {
    index: FxHashMap<TypeId, usize>,
    names: Vec<&'static str>,
    facets: FxHashMap<TypeId, FacetEntry>,
}

impl std::fmt::Debug for ArtifactRegistry {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("ArtifactRegistry")
            .field("names", &self.names)
            .finish_non_exhaustive()
    }
}

impl ArtifactRegistry {
    pub fn register<A: Artifact>(&mut self) {
        let next = self.names.len();
        if let std::collections::hash_map::Entry::Vacant(e) = self.index.entry(TypeId::of::<A>()) {
            e.insert(next);
            self.names.push(A::NAME);
        }
    }

    /// Registers how documents of language `lang` answer facet `F`.
    ///
    /// # Panics
    ///
    /// If `lang` already provides `F`.
    pub fn provide<F: Facet>(
        &mut self,
        lang: &'static str,
        provider: impl Fn(&Ctx<'_>) -> F::Output + Send + Sync + 'static,
    ) {
        let next = self.names.len();
        let entry = self
            .facets
            .entry(TypeId::of::<F>())
            .or_insert_with(|| FacetEntry {
                slot: next,
                providers: Vec::new(),
            });
        if entry.slot == next {
            self.names.push(F::NAME);
        }
        assert!(
            entry.providers.iter().all(|(l, _)| *l != lang),
            "{lang} provides facet `{}` twice",
            F::NAME
        );
        let provider: Provider<F> = Box::new(provider);
        entry.providers.push((lang, Box::new(provider)));
    }

    /// Whether documents of language `lang` answer facet `F`.
    #[must_use]
    pub fn provides<F: Facet>(&self, lang: &str) -> bool {
        self.facets
            .get(&TypeId::of::<F>())
            .is_some_and(|e| e.providers.iter().any(|(l, _)| *l == lang))
    }

    #[must_use]
    pub fn names(&self) -> &[&'static str] {
        &self.names
    }

    fn slot<A: Artifact>(&self) -> usize {
        *self
            .index
            .get(&TypeId::of::<A>())
            .unwrap_or_else(|| panic!("artifact `{}` is not registered", A::NAME))
    }
}

#[derive(Debug)]
pub struct Ctx<'a> {
    pub doc: &'a Document,
    registry: &'a ArtifactRegistry,
    slots: Box<[OnceCell<Box<dyn Any>>]>,
    line_index: OnceCell<LineIndex>,
    computed: RefCell<Vec<&'static str>>,
}

impl<'a> Ctx<'a> {
    #[must_use]
    pub fn new(doc: &'a Document, registry: &'a ArtifactRegistry) -> Self {
        let slots = (0..registry.names.len()).map(|_| OnceCell::new()).collect();
        Ctx {
            doc,
            registry,
            slots,
            line_index: OnceCell::new(),
            computed: RefCell::default(),
        }
    }

    #[inline]
    pub fn src(&self) -> &'a str {
        &self.doc.text
    }

    /// # Panics
    ///
    /// If `A` was not registered in this context's registry.
    pub fn get<A: Artifact>(&self) -> &A::Output {
        let slot = &self.slots[self.registry.slot::<A>()];
        slot.get_or_init(|| {
            let _p = metrics::phase(A::NAME);
            self.computed.borrow_mut().push(A::NAME);
            Box::new(A::compute(self))
        })
        .downcast_ref()
        .expect("artifact slot holds its own output type")
    }

    /// The document's language's answer to `F`; `None` when the language does not provide it.
    pub fn facet<F: Facet>(&self) -> Option<&F::Output> {
        let entry = self.registry.facets.get(&TypeId::of::<F>())?;
        let (_, provider) = entry
            .providers
            .iter()
            .find(|(lang, _)| *lang == self.doc.lang)?;
        Some(self.answer::<F>(entry.slot, provider.as_ref()))
    }

    fn answer<F: Facet>(&self, slot: usize, provider: &(dyn Any + Send + Sync)) -> &F::Output {
        self.slots[slot]
            .get_or_init(|| {
                let _p = metrics::phase(F::NAME);
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
        self.line_index.get_or_init(|| LineIndex::new(self.src()))
    }

    /// Artifacts computed so far in this context, in order (for tests and tracing).
    pub fn computed(&self) -> Vec<&'static str> {
        self.computed.borrow().clone()
    }
}
