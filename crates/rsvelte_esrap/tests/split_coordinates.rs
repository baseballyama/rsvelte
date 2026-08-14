//! [`rsvelte_esrap::print_split`] — printing a *reassembled* program, whose
//! comment coordinates and source-map coordinates live in two different buffers.
//!
//! This is the contract rsvelte's client codegen relies on: a program built from
//! independently-parsed generated chunks has no shared coordinate space, so each
//! comment-bearing chunk is re-parsed at its own region of one unified buffer
//! above `loc_base`, and every span below `loc_base` is a synthesized node that
//! must take no part in comment placement (esrap's `if (node.loc)`).
//!
//! The assembly below deliberately mirrors the converter's `Synth`: a
//! comment-free chunk parses at offset 0 (its spans land below `loc_base`, which
//! is exactly what makes it "synthesized" to the printer), and a comment-bearing
//! chunk parses from `pad + text` so its spans land at its region.

use oxc_allocator::{Allocator, GetAllocator, Vec as ArenaVec};
use oxc_ast::ast::{BlockStatement, Program, Statement};
use oxc_ast::builder::AstBuilder;
use oxc_parser::Parser;
use oxc_span::{SourceType, Span};

use rsvelte_esrap::{PrintOptions, print_split};

/// Region of one chunk in the unified buffer, plus the map-space offset it
/// resolves to (`None` = unmapped).
type LocMapEntry = (u32, u32, Option<u32>);

fn source_offset(value: usize) -> u32 {
    u32::try_from(value).expect("test source exceeds the u32 AST coordinate range")
}

/// Builds a reassembled program the way the client converter does.
struct Assembler<'a> {
    ab: AstBuilder<'a>,
    /// The unified buffer comment spans index into; starts as a `loc_base`-long
    /// pad so the first chunk's region begins exactly at `loc_base`.
    source: String,
    loc_base: u32,
    body: Vec<Statement<'a>>,
    comments: Vec<oxc_ast::ast::Comment>,
    loc_map: Vec<LocMapEntry>,
}

impl<'a> Assembler<'a> {
    fn new(allocator: &'a Allocator, loc_base: u32) -> Self {
        let mut source = " ".repeat(loc_base as usize - 1);
        source.push('\n');
        Self {
            ab: AstBuilder::new(allocator),
            source,
            loc_base,
            body: Vec::new(),
            comments: Vec::new(),
            loc_map: Vec::new(),
        }
    }

    fn parse(&self, text: &'a str) -> Program<'a> {
        let ret = Parser::new(self.ab.allocator(), text, SourceType::mjs()).parse();
        assert!(ret.diagnostics.is_empty(), "parse error in {text:?}");
        ret.program
    }

    /// A generated chunk with no comments: parsed in place, so all its spans sit
    /// below `loc_base` and read as synthesized.
    fn push_synthesized(&mut self, text: &str) {
        let owned = self.ab.allocator().alloc_str(text);
        assert!(
            source_offset(owned.len()) < self.loc_base,
            "test chunk must stay below loc_base"
        );
        let program = self.parse(owned);
        assert!(
            program.comments.is_empty(),
            "push_synthesized is for comment-free chunks"
        );
        self.body.extend(program.body);
    }

    /// A comment-bearing chunk: re-parsed from `pad + text` so its spans, and
    /// its comments', land at the chunk's own region of the unified buffer.
    fn push_chunk(&mut self, text: &str, maps_to: Option<u32>) {
        let base = source_offset(self.source.len());
        let mut padded = " ".repeat(base as usize - 1);
        padded.push('\n');
        padded.push_str(text);
        let owned = self.ab.allocator().alloc_str(&padded);
        let program = self.parse(owned);
        assert!(
            !program.comments.is_empty(),
            "push_chunk is for comment-bearing chunks"
        );
        self.source.push_str(text);
        self.source.push('\n');
        self.comments.extend(program.comments.iter().copied());
        self.loc_map
            .push((base, base + source_offset(text.len()), maps_to));
        self.body.extend(program.body);
    }

    fn wrap_body(&mut self, span: Span) {
        let body = ArenaVec::from_iter_in(std::mem::take(&mut self.body), &self.ab);
        self.body
            .push(Statement::BlockStatement(BlockStatement::boxed(
                span, body, &self.ab,
            )));
    }

    fn finish(self) -> Assembled<'a> {
        // The program spans the whole consumed region, so it brackets the
        // leading and trailing comments of the chunks it holds.
        let span = Span::new(self.loc_base, source_offset(self.source.len()));
        let comments = ArenaVec::from_iter_in(self.comments, &self.ab);
        let body = ArenaVec::from_iter_in(self.body, &self.ab);
        let program = Program::new(
            span,
            SourceType::mjs(),
            "",
            comments,
            None,
            ArenaVec::new_in(&self.ab),
            body,
            &self.ab,
        );
        Assembled {
            program,
            source: self.source,
            loc_base: self.loc_base,
            loc_map: self.loc_map,
        }
    }
}

struct Assembled<'a> {
    program: Program<'a>,
    source: String,
    loc_base: u32,
    loc_map: Vec<LocMapEntry>,
}

impl Assembled<'_> {
    fn print(&self) -> String {
        print_split(
            &self.program,
            &self.source,
            self.loc_base,
            None,
            &self.loc_map,
            &PrintOptions::default(),
        )
        .code
    }

    fn print_mapped(&self, map_source: &str) -> rsvelte_esrap::PrintWithMap {
        print_split(
            &self.program,
            &self.source,
            self.loc_base,
            Some(map_source),
            &self.loc_map,
            &PrintOptions::default(),
        )
    }
}

/// Byte index of `needle` in `haystack`, asserting it appears exactly once.
fn index_of_unique(haystack: &str, needle: &str) -> usize {
    assert_eq!(
        haystack.matches(needle).count(),
        1,
        "{needle:?} should appear exactly once in:\n{haystack}"
    );
    haystack.find(needle).unwrap()
}

#[test]
fn synthesized_statements_do_not_absorb_chunk_comments() {
    let allocator = Allocator::default();
    let mut a = Assembler::new(&allocator, 512);
    a.push_synthesized("foo();");
    a.push_chunk("// lead\nconst x = 1;", None);
    a.push_synthesized("bar();");
    let out = a.finish().print();

    let foo = index_of_unique(&out, "foo();");
    let lead = index_of_unique(&out, "// lead");
    let decl = index_of_unique(&out, "const x = 1;");
    let bar = index_of_unique(&out, "bar();");

    // The comment stays attached to the statement it leads, between the two
    // synthesized statements that carry no location.
    assert!(foo < lead, "comment must not precede `foo()`:\n{out}");
    assert!(lead < decl, "comment must lead its statement:\n{out}");
    assert!(decl < bar, "chunk must stay before `bar()`:\n{out}");
    // The comment sits on its own line directly above the declaration.
    assert!(out.contains("// lead\nconst x = 1;"), "{out}");
}

#[test]
fn trailing_chunk_comment_is_not_dropped() {
    // The comment after the chunk's last statement is only reachable because the
    // program's span brackets the chunk's whole region.
    let allocator = Allocator::default();
    let mut a = Assembler::new(&allocator, 512);
    a.push_chunk("const x = 1;\n// tail note", None);
    let out = a.finish().print();

    assert!(out.contains("const x = 1;"), "{out}");
    index_of_unique(&out, "// tail note");
}

#[test]
fn two_chunks_keep_their_comments_in_order() {
    let allocator = Allocator::default();
    let mut a = Assembler::new(&allocator, 512);
    a.push_chunk("// first\nconst a = 1;", None);
    a.push_synthesized("between();");
    a.push_chunk("// second\nconst b = 2;", None);
    let out = a.finish().print();

    let first = index_of_unique(&out, "// first");
    let decl_a = index_of_unique(&out, "const a = 1;");
    let between = index_of_unique(&out, "between();");
    let second = index_of_unique(&out, "// second");
    let decl_b = index_of_unique(&out, "const b = 2;");

    assert!(
        first < decl_a && decl_a < between && between < second && second < decl_b,
        "chunk comments must stay with their own chunk:\n{out}"
    );
}

#[test]
fn synthesized_body_exhausts_the_comment_cursor() {
    let allocator = Allocator::default();
    let mut a = Assembler::new(&allocator, 512);
    a.push_chunk("// discarded\nconst x = 1;", None);
    a.wrap_body(Span::new(0, 0));
    let out = a.finish().print();

    assert_eq!(out, "{\n\tconst x = 1;\n}");
}

#[test]
fn located_body_resynchronizes_the_comment_cursor() {
    let allocator = Allocator::default();
    let mut a = Assembler::new(&allocator, 512);
    a.push_chunk("// kept\nconst x = 1;", None);
    let span = Span::new(a.loc_base, source_offset(a.source.len()));
    a.wrap_body(span);
    let out = a.finish().print();

    assert_eq!(out, "{\n\t// kept\n\tconst x = 1;\n}");
}

#[test]
fn comment_free_program_prints_without_a_comment_buffer() {
    // Nothing consumed the unified buffer, so no comment machinery runs at all.
    let allocator = Allocator::default();
    let mut a = Assembler::new(&allocator, 512);
    a.push_synthesized("foo();\nbar();");
    let out = a.finish().print();
    assert_eq!(out, "foo();\nbar();");
}

#[test]
fn loc_map_resolves_chunk_positions_back_into_the_source() {
    // Map the chunk's whole region onto the `const count` line of a stand-in
    // original source; every keyword anchor inside the chunk must resolve there.
    let map_source = "<script>\n\tlet count = 0;\n</script>\n";
    let anchor = source_offset(map_source.find("let count").expect("anchor in map source"));

    let allocator = Allocator::default();
    let mut a = Assembler::new(&allocator, 512);
    a.push_chunk("// c\nconst x = 1;", Some(anchor));
    let assembled = a.finish();
    let mapped = assembled.print_mapped(map_source);

    let segs: Vec<_> = mapped.mappings.iter().collect();
    assert!(
        !segs.is_empty(),
        "no mapped segment:\n{:?}",
        mapped.mappings
    );
    // `anchor` is on 0-based line 1, column 1 (the tab). Every segment must land
    // there rather than at a position in the unified comment buffer, which has
    // no line 1 at all.
    // `anchor` is on 0-based line 1, column 1 (the tab). Without `loc_map` the
    // chunk's offsets (past `loc_base`) would resolve off the end of
    // `map_source` instead.
    assert_eq!(
        (segs[0].source_line, segs[0].source_column),
        (1, 1),
        "{segs:?}"
    );
    for seg in &segs {
        assert_eq!(
            seg.source_line, 1,
            "every chunk offset maps to the anchor line: {seg:?}"
        );
    }
}

#[test]
fn unmapped_chunks_emit_no_source_positions() {
    let map_source = "<script>\n\tlet count = 0;\n</script>\n";
    let allocator = Allocator::default();
    let mut a = Assembler::new(&allocator, 512);
    a.push_chunk("// c\nconst x = 1;", None);
    let assembled = a.finish();
    let mapped = assembled.print_mapped(map_source);

    assert!(
        mapped.mappings.is_empty(),
        "a chunk with no source anchor must not emit segments: {:?}",
        mapped.mappings
    );
}
