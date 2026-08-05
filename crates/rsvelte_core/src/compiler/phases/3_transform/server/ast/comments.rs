//! Comment carry-over for the assembled SSR program.
//!
//! Phase 3 rebuilds the module from re-parsed source slices, so the printer has
//! no single buffer the program's spans index into. This module gives it one: a
//! producer that keeps a statement *registers* the comment region preceding it
//! and stamps the emitted statement with the returned anchor, parking it in a
//! provisional address range. Once the program is assembled, only the ranges the
//! walk actually reaches are laid out — in encounter order — into a synthetic
//! buffer, every span is remapped onto it, and the surviving comments go to
//! [`rsvelte_esrap::print_split`].
//!
//! A region whose statement the transform dropped is never reached, so its
//! comments are dropped with it instead of being flushed inside an unrelated
//! node.

use oxc_allocator::{Allocator, Vec as ArenaVec};
use oxc_ast::ast::{Comment, Program, Statement};
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_span::{GetSpan, Span};

/// Base of the provisional address range. Registered anchors live above it;
/// every other span stays below and is zeroed on the way out, which is how the
/// printer learns it carries no location.
const PROV_BASE: u32 = 1 << 30;

/// A one-byte `\n` pad so the first region starts on a fresh line — a block
/// comment's dedent walks back to the preceding newline for its indent.
const PAD: &str = "\n";

/// A deliberately-kept `EmptyStatement` (`B::empty_kept`) encodes itself in its
/// span end, so neither pass may rewrite it.
fn is_sentinel(span: Span) -> bool {
    span.end == u32::MAX
}

/// One registered comment region.
struct Chunk {
    prov_base: u32,
    text: String,
    /// Comments with spans relative to `text`.
    comments: Vec<Comment>,
}

/// The per-compile registry of comment regions.
#[derive(Default)]
pub struct ChunkRegistry {
    chunks: Vec<Chunk>,
    next_prov: u32,
}

impl ChunkRegistry {
    /// Register the source region `text` holding `comments` (spans relative to
    /// `text`) and return the anchor to stamp on the statement they precede.
    /// `None` when there is nothing to carry.
    pub fn register(&mut self, text: &str, comments: &[Comment]) -> Option<u32> {
        if comments.is_empty() || text.is_empty() {
            return None;
        }
        let len = u32::try_from(text.len()).ok()?;
        let prov_base = PROV_BASE.checked_add(self.next_prov)?;
        // The anchor sits at the region's end, so the next region starts past it.
        self.next_prov = self.next_prov.checked_add(len)?.checked_add(1)?;
        self.chunks.push(Chunk {
            prov_base,
            text: text.to_string(),
            comments: comments.to_vec(),
        });
        super::comment_stats::bump::REGISTERED_CHUNKS(1);
        super::comment_stats::bump::REGISTERED_COMMENTS(comments.len() as u64);
        Some(prov_base + len)
    }

    pub fn is_empty(&self) -> bool {
        self.chunks.is_empty()
    }
}

/// Stamps every span of an emitted statement with its anchor, so the printer
/// flushes the registered comments immediately before it.
pub struct SetSpans(pub u32);

impl VisitMut<'_> for SetSpans {
    fn visit_span(&mut self, span: &mut Span) {
        if !is_sentinel(*span) {
            *span = Span::new(self.0, self.0);
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
        self.mark(it.span(), !matches!(it, Statement::EmptyStatement(_)));
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
    for &i in encounter.order.iter().filter(|&&i| encounter.via_stmt[i]) {
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

    if comments.is_empty() {
        return rsvelte_esrap::print(program, "");
    }
    comments.sort_by_key(|c| c.span.start);
    super::comment_stats::bump::EMITTED_COMMENTS(comments.len() as u64);
    program.comments = ArenaVec::from_iter_in(comments, &allocator);

    rsvelte_esrap::print_split(
        program,
        &buf,
        PAD.len() as u32,
        None,
        &[],
        &rsvelte_esrap::PrintOptions::default(),
    )
    .code
}
