//! Comment carry-over for the assembled SSR program.
//!
//! Phase 3 rebuilds the module from re-parsed source slices, so the printer has
//! no single buffer the program's spans index into. This module gives it one: a
//! producer that keeps a statement *registers* the comment region around it and
//! places the emitted statement on the returned base ([`Place`]), parking it in
//! a provisional address range. Once the program is assembled, only the ranges the
//! walk actually reaches are laid out into a synthetic
//! buffer, every span is remapped onto it, and the surviving comments go to
//! [`rsvelte_esrap::print_split`].
//!
//! A region whose statement the transform dropped is never reached, so its
//! comments are dropped with it instead of being flushed inside an unrelated
//! node.

use oxc_allocator::{Allocator, Vec as ArenaVec};
use oxc_ast::ast::{Comment, FunctionBody, Program, Statement};
use oxc_ast_visit::{Visit, VisitMut, walk_mut};
use oxc_span::{GetSpan, Span};

/// Base of the provisional address range. Registered anchors live above it;
/// every other span stays below and is zeroed on the way out, which is how the
/// printer learns it carries no location.
const PROV_BASE: u32 = 1 << 30;

/// A one-byte `\n` pad so the first region starts on a fresh line — a block
/// comment's dedent walks back to the preceding newline for its indent.
const PAD: &str = "\n";

const COMPONENT_BODY_MARKER: Span = Span::new(u32::MAX - 1, u32::MAX - 1);

/// A deliberately-kept `EmptyStatement` (`B::empty_kept`) encodes itself in its
/// span end. Its start still carries the removed source statement's comment
/// position, so the placement passes remap that half while preserving the tag.
fn is_sentinel(span: Span) -> bool {
    span.end == u32::MAX
}

pub fn mark_component_body(body: &mut FunctionBody<'_>) {
    body.span = COMPONENT_BODY_MARKER;
}

/// One registered comment region.
struct Chunk {
    prov_base: u32,
    text: String,
    /// Comments with spans relative to `text`.
    comments: Vec<Comment>,
    position_only: bool,
    expression_anchor: bool,
    component_tail: bool,
    component_tail_nested: bool,
    component_tail_dev_layout: bool,
}

/// The per-compile registry of comment regions.
#[derive(Default)]
pub struct ChunkRegistry {
    chunks: Vec<Chunk>,
    next_prov: u32,
}

impl ChunkRegistry {
    /// Register the source region `text` holding `comments` (spans relative to
    /// `text`) and return the region's provisional base — add a `text`-relative
    /// offset to it to get the address to place a node at. `None` when there is
    /// nothing to carry.
    pub fn register(&mut self, text: &str, comments: &[Comment]) -> Option<u32> {
        self.register_inner(text, comments, false)
    }

    /// Register a region whose anchor is a template expression rather than a
    /// statement.
    pub fn register_expression(&mut self, text: &str, comments: &[Comment]) -> Option<u32> {
        self.register_inner(text, comments, true)
    }

    fn register_inner(
        &mut self,
        text: &str,
        comments: &[Comment],
        expression_anchor: bool,
    ) -> Option<u32> {
        if comments.is_empty() || text.is_empty() {
            return None;
        }
        let len = u32::try_from(text.len()).ok()?;
        let prov_base = PROV_BASE.checked_add(self.next_prov)?;
        // Regions are disjoint, so the next one starts past this one's end.
        self.next_prov = self.next_prov.checked_add(len)?.checked_add(1)?;
        self.chunks.push(Chunk {
            prov_base,
            text: text.to_string(),
            comments: comments.to_vec(),
            position_only: false,
            expression_anchor,
            component_tail: false,
            component_tail_nested: false,
            component_tail_dev_layout: false,
        });
        super::comment_stats::bump::REGISTERED_CHUNKS(1);
        super::comment_stats::bump::REGISTERED_COMMENTS(comments.len() as u64);
        Some(prov_base)
    }

    /// Register a source position that does not own a comment. This is only
    /// needed when a preceding comment-owning statement is reordered past it.
    pub fn register_position(&mut self, text: &str) -> Option<u32> {
        if text.is_empty() {
            return None;
        }
        let len = u32::try_from(text.len()).ok()?;
        let prov_base = PROV_BASE.checked_add(self.next_prov)?;
        self.next_prov = self.next_prov.checked_add(len)?.checked_add(1)?;
        self.chunks.push(Chunk {
            prov_base,
            text: text.to_string(),
            comments: Vec::new(),
            position_only: true,
            expression_anchor: false,
            component_tail: false,
            component_tail_nested: false,
            component_tail_dev_layout: false,
        });
        Some(prov_base)
    }

    /// Register a source position for a node that is not a statement — the
    /// hoisted legacy-reactive declarator, whose identifier upstream keeps the
    /// `$: x = …` source `loc` of while the declaration around it stays
    /// loc-less. `expression_anchor` is what keeps it in the layout: the
    /// `Encounter` walk only sees it below statement level.
    pub fn register_anchor(&mut self) -> Option<u32> {
        let prov_base = PROV_BASE.checked_add(self.next_prov)?;
        self.next_prov = self.next_prov.checked_add(2)?;
        self.chunks.push(Chunk {
            prov_base,
            text: String::from(" "),
            comments: Vec::new(),
            position_only: true,
            expression_anchor: true,
            component_tail: false,
            component_tail_nested: false,
            component_tail_dev_layout: false,
        });
        Some(prov_base)
    }

    pub fn is_empty(&self) -> bool {
        self.chunks.is_empty()
    }

    /// Whether `span` already sits in a registered region, i.e. the statement
    /// carrying it anchors comments of its own.
    pub fn anchors(&self, span: Span) -> bool {
        let bases: Vec<(u32, u32)> = self
            .chunks
            .iter()
            .map(|c| (c.prov_base, c.prov_base + c.text.len() as u32))
            .collect();
        // A location-less end (`is_sentinel`) still anchors on its start.
        chunk_of(&bases, Span::new(span.start, span.start)).is_some()
    }

    /// `nested` when the component body is the `$$renderer.component(($$renderer)
    /// => { … })` callback rather than the exported function itself, which is
    /// where the replayed comments have to land.
    pub fn register_component_tail(
        &mut self,
        text: &str,
        comments: &[Comment],
        nested: bool,
        dev_layout: bool,
    ) -> Option<u32> {
        let base = self.register_inner(text, comments, true)?;
        let chunk = self.chunks.last_mut()?;
        chunk.component_tail = true;
        chunk.component_tail_nested = nested;
        chunk.component_tail_dev_layout = dev_layout;
        Some(base)
    }
}

/// How an emitted statement is placed onto its registered region.
pub enum Place {
    /// Collapse every span onto one address, so the whole region's comments
    /// flush immediately before the statement. The only option when the
    /// statement was rebuilt from sub-slices, since its nodes then carry no
    /// coherent set of source positions.
    At(u32),
    /// Shift the spans of a statement re-parsed VERBATIM from the region onto
    /// it, so comments interior to the statement land where the source put
    /// them (upstream keeps the original nodes' `loc` for the same effect).
    Shift(u32),
    /// Remap original absolute source spans into a registered template region.
    /// Generated wrappers use the empty span and remain location-less, while
    /// retained descendants keep the cursor positions upstream sees.
    Remap {
        source_start: u32,
        source_end: u32,
        base: u32,
    },
}

impl VisitMut<'_> for Place {
    fn visit_span(&mut self, span: &mut Span) {
        if is_sentinel(*span) {
            span.start = match *self {
                Place::At(at) => at,
                Place::Shift(by) => span.start + by,
                Place::Remap {
                    source_start,
                    source_end,
                    base,
                } if span.start >= source_start && span.start <= source_end => {
                    base + span.start - source_start
                }
                Place::Remap { .. } => span.start,
            };
            return;
        }
        match *self {
            Place::At(at) => *span = Span::new(at, at),
            // A synthesized node's `SPAN` placeholder must stay location-less;
            // no re-parsed node is empty at offset 0.
            Place::Shift(_) if span.start == 0 && span.end == 0 => {}
            Place::Shift(by) => *span = Span::new(span.start + by, span.end + by),
            Place::Remap { .. } if span.start == 0 && span.end == 0 => {}
            Place::Remap {
                source_start,
                source_end,
                base,
            } if span.start >= source_start && span.end <= source_end => {
                *span = Span::new(
                    base + span.start - source_start,
                    base + span.end - source_start,
                );
            }
            Place::Remap { .. } => {}
        }
    }
}

/// Records which regions the assembled program reaches, in the order the walk
/// (and therefore the printer) reaches them.
struct Encounter<'m> {
    bases: &'m [(u32, u32)],
    seen: Vec<bool>,
    order: Vec<usize>,
    /// Per region: whether the walk first reached it as a whole statement.
    via_stmt: Vec<bool>,
}

impl Encounter<'_> {
    fn mark(&mut self, span: Span, is_stmt: bool) {
        if let Some(i) = chunk_of(self.bases, span)
            && !self.seen[i]
        {
            self.seen[i] = true;
            self.via_stmt[i] = is_stmt;
            self.order.push(i);
        }
    }
}

impl<'a> VisitMut<'a> for Encounter<'_> {
    fn visit_statement(&mut self, it: &mut Statement<'a>) {
        // A region only survives if its anchor is still a statement position:
        // reaching it first inside an expression means the owning statement was
        // dropped and only a fragment of it was rehomed elsewhere. Empty
        // statements are filtered out by the printer, so they cannot host one.
        let span = it.span();
        if is_sentinel(span) {
            self.mark(Span::new(span.start, span.start), true);
        } else {
            self.mark(span, !matches!(it, Statement::EmptyStatement(_)));
        }
        walk_mut::walk_statement(self, it);
    }

    fn visit_span(&mut self, span: &mut Span) {
        self.mark(*span, false);
    }
}

/// Moves surviving anchors onto the final buffer and blanks everything else.
struct Remap<'m> {
    bases: &'m [(u32, u32)],
    /// Per region: the final-buffer shift, or `None` when it did not survive.
    shift: &'m [Option<i64>],
}

impl VisitMut<'_> for Remap<'_> {
    fn visit_span(&mut self, span: &mut Span) {
        if is_sentinel(*span) {
            let position = Span::new(span.start, span.start);
            if let Some(delta) = chunk_of(self.bases, position).and_then(|i| self.shift[i]) {
                span.start = (i64::from(span.start) + delta) as u32;
            }
            return;
        }
        if *span == COMPONENT_BODY_MARKER {
            return;
        }
        match chunk_of(self.bases, *span).and_then(|i| self.shift[i]) {
            Some(delta) => {
                span.start = (i64::from(span.start) + delta) as u32;
                span.end = (i64::from(span.end) + delta) as u32;
            }
            None => *span = Span::new(0, 0),
        }
    }
}

struct BodyRegions<'m> {
    regions: &'m [(u32, u32)],
    first: Option<u32>,
    last: Option<u32>,
}

impl Visit<'_> for BodyRegions<'_> {
    fn visit_span(&mut self, span: &Span) {
        if *span == COMPONENT_BODY_MARKER || *span == Span::new(0, 0) {
            return;
        }
        let Some(i) = self
            .regions
            .partition_point(|&(start, _)| start <= span.start)
            .checked_sub(1)
            .filter(|&i| span.start <= self.regions[i].1)
        else {
            return;
        };
        self.first = Some(
            self.first
                .map_or(self.regions[i].0, |v| v.min(self.regions[i].0)),
        );
        self.last = Some(
            self.last
                .map_or(self.regions[i].1, |v| v.max(self.regions[i].1)),
        );
    }
}

struct ResolveComponentBody<'m> {
    regions: &'m [(u32, u32)],
}

impl<'a> VisitMut<'a> for ResolveComponentBody<'_> {
    fn visit_function_body(&mut self, body: &mut FunctionBody<'a>) {
        if body.span == COMPONENT_BODY_MARKER {
            let mut bounds = BodyRegions {
                regions: self.regions,
                first: None,
                last: None,
            };
            for statement in &body.statements {
                bounds.visit_statement(statement);
            }
            body.span = bounds
                .first
                .zip(bounds.last)
                .map_or(Span::new(0, 0), |(start, end)| Span::new(start, end));
        }
        walk_mut::walk_function_body(self, body);
    }
}

/// The region `span` was stamped into, if any. `bases` is sorted by start and
/// its `(start, limit)` ranges are disjoint.
fn chunk_of(bases: &[(u32, u32)], span: Span) -> Option<usize> {
    if span.start < PROV_BASE || is_sentinel(span) {
        return None;
    }
    let i = bases
        .partition_point(|&(b, _)| b <= span.start)
        .checked_sub(1)?;
    (span.start <= bases[i].1).then_some(i)
}

/// Print `program`, carrying over the comments of every registered region whose
/// statement survived into the output.
pub fn print_with_comments<'a>(
    program: &mut Program<'a>,
    registry: &ChunkRegistry,
    allocator: &'a Allocator,
) -> String {
    if registry.is_empty() {
        return rsvelte_esrap::print(program, "");
    }

    let bases: Vec<(u32, u32)> = registry
        .chunks
        .iter()
        .map(|c| (c.prov_base, c.prov_base + c.text.len() as u32))
        .collect();
    let mut encounter = Encounter {
        bases: &bases,
        seen: vec![false; bases.len()],
        order: Vec::new(),
        via_stmt: vec![false; bases.len()],
    };
    encounter.visit_program(program);

    if super::comment_stats::enabled() {
        for i in 0..bases.len() {
            let n = registry.chunks[i].comments.len() as u64;
            match (encounter.seen[i], encounter.via_stmt[i]) {
                (true, true) => super::comment_stats::bump::REACHED_VIA_STMT(n),
                (true, false) => super::comment_stats::bump::REACHED_NOT_STMT(n),
                (false, _) => super::comment_stats::bump::NEVER_REACHED(n),
            }
        }
    }

    let mut buf = String::from(PAD);
    let mut shift: Vec<Option<i64>> = vec![None; bases.len()];
    let mut comments: Vec<Comment> = Vec::new();
    let order: Vec<usize> = if registry.chunks.iter().any(|chunk| chunk.position_only) {
        (0..registry.chunks.len())
            .filter(|&i| {
                !registry.chunks[i].component_tail
                    && (encounter.via_stmt[i] || registry.chunks[i].expression_anchor)
            })
            .collect()
    } else {
        encounter
            .order
            .iter()
            .copied()
            .filter(|&i| {
                !registry.chunks[i].component_tail
                    && (encounter.via_stmt[i] || registry.chunks[i].expression_anchor)
            })
            .collect()
    };
    for i in order {
        let chunk = &registry.chunks[i];
        let base = buf.len() as u32;
        shift[i] = Some(i64::from(base) - i64::from(chunk.prov_base));
        buf.push_str(&chunk.text);
        // Separates regions by a line, so no region's comments can be mistaken
        // for a trailing comment of the previous one.
        buf.push('\n');
        comments.extend(chunk.comments.iter().map(|c| {
            let mut c = *c;
            c.span = Span::new(c.span.start + base, c.span.end + base);
            c.attached_to = c.span.end;
            c
        }));
    }

    let mut remap = Remap {
        bases: &bases,
        shift: &shift,
    };
    remap.visit_program(program);
    let regions: Vec<(u32, u32)> = bases
        .iter()
        .zip(&shift)
        .filter_map(|(&(start, end), &delta)| {
            delta.map(|delta| {
                (
                    (i64::from(start) + delta) as u32,
                    (i64::from(end) + delta) as u32,
                )
            })
        })
        .collect();
    ResolveComponentBody { regions: &regions }.visit_program(program);

    let mut code = if comments.is_empty() {
        rsvelte_esrap::print(program, "")
    } else {
        comments.sort_by_key(|c| c.span.start);
        super::comment_stats::bump::EMITTED_COMMENTS(comments.len() as u64);
        program.comments = ArenaVec::from_iter_in(comments, &allocator);
        rsvelte_esrap::print_split(
            program,
            &buf,
            PAD.len() as u32,
            None,
            &[],
            &[],
            &rsvelte_esrap::PrintOptions::default(),
        )
        .code
    };
    for chunk in registry.chunks.iter().filter(|chunk| chunk.component_tail) {
        // The last line closing the component body. Production keeps the
        // nested callback's `});` at one indent, while dev prints a multiline
        // call whose callback close owns two indents.
        let (close, indent) = match (chunk.component_tail_nested, chunk.component_tail_dev_layout) {
            (true, true) => ("\n\t\t}", "\n\t\t\t"),
            (true, false) => ("\n\t}", "\n\t\t"),
            (false, _) => ("\n}", "\n\t"),
        };
        for comment in &chunk.comments {
            let raw = &chunk.text[comment.span.start as usize..comment.span.end as usize];
            if let Some(at) = code.rfind(close) {
                code.insert_str(at, &format!("{indent}{raw}"));
            }
        }
    }
    code
}
