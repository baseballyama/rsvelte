//! The derived-artifact database: "compute once" for everything a document's tasks need.
//!
//! An [`Artifact`] is a pure function of the document (and of other artifacts). A [`Ctx`] holds one
//! lazily-filled slot per registered artifact; `ctx.get::<A>()` computes `A` on first use and
//! returns the cached value afterwards. Tasks never call parsers directly — they ask for artifacts —
//! so running compile, format and lint together parses the document once.
//!
//! A `Ctx` belongs to one worker thread for the lifetime of one document (it is deliberately
//! `!Sync`); parallelism is across documents. Asking for an artifact while it is being computed
//! (a dependency cycle) panics.

use crate::metrics;
use crate::pipeline::Document;
use crate::source::LineIndex;
use rustc_hash::FxHashMap;
use std::any::{Any, TypeId};
use std::cell::{OnceCell, RefCell};

pub trait Artifact: 'static {
    type Output: 'static;
    /// Also the metrics phase name.
    const NAME: &'static str;
    fn compute(ctx: &Ctx) -> Self::Output;
}

#[derive(Default)]
pub struct ArtifactRegistry {
    index: FxHashMap<TypeId, usize>,
    names: Vec<&'static str>,
}

impl ArtifactRegistry {
    pub fn register<A: Artifact>(&mut self) {
        let next = self.names.len();
        if let std::collections::hash_map::Entry::Vacant(e) = self.index.entry(TypeId::of::<A>()) {
            e.insert(next);
            self.names.push(A::NAME);
        }
    }

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

pub struct Ctx<'a> {
    pub doc: &'a Document,
    registry: &'a ArtifactRegistry,
    slots: Box<[OnceCell<Box<dyn Any>>]>,
    line_index: OnceCell<LineIndex>,
    computed: RefCell<Vec<&'static str>>,
}

impl<'a> Ctx<'a> {
    pub fn new(doc: &'a Document, registry: &'a ArtifactRegistry) -> Ctx<'a> {
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

    pub fn line_index(&self) -> &LineIndex {
        self.line_index.get_or_init(|| LineIndex::new(self.src()))
    }

    /// Artifacts computed so far in this context, in order (for tests and tracing).
    pub fn computed(&self) -> Vec<&'static str> {
        self.computed.borrow().clone()
    }
}
