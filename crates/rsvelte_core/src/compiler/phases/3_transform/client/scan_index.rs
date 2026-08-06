//! One-pass bracket/token index over the `Vec<char>` the identifier rewriters walk.
//!
//! The rewriters ask the same handful of "what encloses this position?" questions
//! once per *matched identifier*, and each question used to be answered by a
//! backward scan that could run to the start of the expression — O(n) work fired
//! O(n) times. This index is built in one forward pass per rewrite pass and
//! answers each question in O(log m), where m counts only the characters that can
//! change an answer (`{}[]();` and `=>`). Storing a row per *character* instead
//! would be simpler but costs more to build than the scans it replaces: real
//! expressions are a few percent brackets, and the rewriter runs the pass once
//! per prop var.
//!
//! The scans this replaces track their own depth counters, and those counters
//! clamp at zero rather than going negative. That is exactly a forward stack that
//! pops only when non-empty, which is how the stacks below are maintained — so
//! the answers agree even on unbalanced text. `RSVELTE_INDEX_ORACLE` runs both
//! routes and compares them.

/// Sentinel for "no such position"; `u32::MAX` cannot be a real index because the
/// rewriters only run on expression text far below 4 GiB.
const NONE: u32 = u32::MAX;

/// Nesting state after the event character at `at` has been processed. A query
/// for position `p` reads the last row with `at < p`.
#[derive(Clone, Copy)]
struct Row {
    at: u32,
    /// Innermost enclosing `{`, pairing braces only.
    encl_brace: u32,
    /// Innermost enclosing `[`, pairing square brackets only.
    encl_bracket: u32,
    /// Innermost enclosing `(`, pairing parentheses only.
    encl_paren: u32,
    /// Innermost enclosing `(`/`[`/`{` when any closer pops any opener, which is
    /// how the arrow-parameter scan counts depth.
    encl_any: u32,
    /// Nearest `{` or `}`, at any nesting.
    prev_brace: u32,
    /// Nearest `=>` (index of the `>`) at the same parenthesis nesting level.
    prev_arrow: u32,
    /// Nearest `;` at the same type-agnostic nesting level.
    prev_semi: u32,
    /// For an opening bracket, the closer that popped it under type-agnostic
    /// pairing; for a `)`, its matching `(` under parenthesis-only pairing.
    partner: u32,
}

const EMPTY: Row = Row {
    at: 0,
    encl_brace: NONE,
    encl_bracket: NONE,
    encl_paren: NONE,
    encl_any: NONE,
    prev_brace: NONE,
    prev_arrow: NONE,
    prev_semi: NONE,
    partner: NONE,
};

pub(super) struct ScanIndex {
    rows: Vec<Row>,
    /// When the first non-whitespace character is `{`, whether that group holds a
    /// `;` at its own depth — the object-literal-vs-block-statement test.
    leading_brace_has_semicolon: Option<bool>,
}

/// Accumulates the index while the caller walks the text, so the rewriter can
/// build its `Vec<char>`, its byte offsets and this index in one pass instead of
/// three. An index built in a pass of its own costs more than the scans it
/// replaces on the small expressions that dominate real components.
pub(super) struct ScanIndexBuilder {
    rows: Vec<Row>,
    // Each frame carries the row index of its opener so the partner link can be
    // filled in on close, plus the enclosing level's `=>` / `;` to restore.
    brace_stack: Vec<u32>,
    bracket_stack: Vec<u32>,
    paren_stack: Vec<(u32, u32)>,
    any_stack: Vec<(u32, usize, u32)>,
    state: Row,
}

impl ScanIndexBuilder {
    pub(super) fn new() -> Self {
        Self {
            rows: Vec::new(),
            brace_stack: Vec::new(),
            bracket_stack: Vec::new(),
            paren_stack: Vec::new(),
            any_stack: Vec::new(),
            state: EMPTY,
        }
    }

    /// Feeds the character at `i`, whose predecessor is `prev`.
    pub(super) fn feed(&mut self, i: usize, c: char, prev: Option<char>) {
        let Self {
            rows,
            brace_stack,
            bracket_stack,
            paren_stack,
            any_stack,
            state,
        } = self;
        {
            let pos = i as u32;
            let mut partner = NONE;
            match c {
                '{' | '[' | '(' => {
                    any_stack.push((pos, rows.len(), state.prev_semi));
                    state.prev_semi = NONE;
                    state.encl_any = pos;
                    match c {
                        '{' => {
                            brace_stack.push(pos);
                            state.encl_brace = pos;
                            state.prev_brace = pos;
                        }
                        '[' => {
                            bracket_stack.push(pos);
                            state.encl_bracket = pos;
                        }
                        _ => {
                            paren_stack.push((pos, state.prev_arrow));
                            state.prev_arrow = NONE;
                            state.encl_paren = pos;
                        }
                    }
                }
                '}' | ']' | ')' => {
                    if let Some((_, row, saved_semi)) = any_stack.pop() {
                        rows[row].partner = pos;
                        state.prev_semi = saved_semi;
                    }
                    state.encl_any = any_stack.last().map_or(NONE, |&(p, ..)| p);
                    match c {
                        '}' => {
                            brace_stack.pop();
                            state.encl_brace = brace_stack.last().copied().unwrap_or(NONE);
                            state.prev_brace = pos;
                        }
                        ']' => {
                            bracket_stack.pop();
                            state.encl_bracket = bracket_stack.last().copied().unwrap_or(NONE);
                        }
                        _ => {
                            if let Some((open, saved_arrow)) = paren_stack.pop() {
                                partner = open;
                                state.prev_arrow = saved_arrow;
                            }
                            state.encl_paren = paren_stack.last().map_or(NONE, |&(p, _)| p);
                        }
                    }
                }
                ';' => state.prev_semi = pos,
                '>' if prev == Some('=') => state.prev_arrow = pos,
                _ => return,
            }
            rows.push(Row {
                at: pos,
                partner,
                ..*state
            });
        }
    }

    pub(super) fn finish(self, chars: &[char]) -> ScanIndex {
        let rows = self.rows;
        let leading_brace_has_semicolon = leading_brace(chars).map(|open| {
            // The block-statement test: a `;` directly inside the leading group,
            // i.e. one whose enclosing brace is that group rather than a nested one.
            rows.iter()
                .any(|r| chars[r.at as usize] == ';' && r.encl_brace as usize == open)
        });
        ScanIndex {
            rows,
            leading_brace_has_semicolon,
        }
    }
}

impl ScanIndex {
    pub(super) fn new(chars: &[char]) -> Self {
        let mut builder = ScanIndexBuilder::new();
        let mut prev = None;
        for (i, &c) in chars.iter().enumerate() {
            builder.feed(i, c, prev);
            prev = Some(c);
        }
        builder.finish(chars)
    }

    /// Nesting state for a query at `pos`, i.e. considering only `chars[..pos]`.
    fn state_at(&self, pos: usize) -> &Row {
        let idx = self.rows.partition_point(|r| (r.at as usize) < pos);
        if idx == 0 {
            &EMPTY
        } else {
            &self.rows[idx - 1]
        }
    }

    /// The row for the event character at `pos`, if `pos` holds one.
    fn row_at(&self, pos: usize) -> Option<&Row> {
        let idx = self.rows.partition_point(|r| (r.at as usize) < pos);
        self.rows.get(idx).filter(|r| r.at as usize == pos)
    }

    /// Innermost `{` still open before `pos`. Passing a `{`'s own index walks one
    /// step outwards, so the enclosing-scope chain is a loop over this.
    pub(super) fn enclosing_brace(&self, pos: usize) -> Option<usize> {
        unwrap_idx(self.state_at(pos).encl_brace)
    }

    pub(super) fn enclosing_bracket(&self, pos: usize) -> Option<usize> {
        unwrap_idx(self.state_at(pos).encl_bracket)
    }

    pub(super) fn enclosing_paren(&self, pos: usize) -> Option<usize> {
        unwrap_idx(self.state_at(pos).encl_paren)
    }

    pub(super) fn enclosing_any(&self, pos: usize) -> Option<usize> {
        unwrap_idx(self.state_at(pos).encl_any)
    }

    /// The closer that ends the bracket group opened at `open`.
    pub(super) fn closer_of(&self, open: usize) -> Option<usize> {
        self.row_at(open).and_then(|r| unwrap_idx(r.partner))
    }

    /// The `(` matching the `)` at `close`.
    pub(super) fn opener_of(&self, close: usize) -> Option<usize> {
        self.row_at(close).and_then(|r| unwrap_idx(r.partner))
    }

    pub(super) fn prev_brace(&self, pos: usize) -> Option<usize> {
        unwrap_idx(self.state_at(pos).prev_brace)
    }

    pub(super) fn prev_arrow(&self, pos: usize) -> Option<usize> {
        unwrap_idx(self.state_at(pos).prev_arrow)
    }

    pub(super) fn prev_semicolon(&self, pos: usize) -> Option<usize> {
        unwrap_idx(self.state_at(pos).prev_semi)
    }

    pub(super) fn leading_brace_has_semicolon(&self) -> bool {
        self.leading_brace_has_semicolon.unwrap_or(false)
    }
}

fn unwrap_idx(raw: u32) -> Option<usize> {
    (raw != NONE).then_some(raw as usize)
}

/// Position of the leading `{`, when the first non-whitespace character is one.
fn leading_brace(chars: &[char]) -> Option<usize> {
    let first = chars.iter().position(|c| !c.is_whitespace())?;
    (chars[first] == '{').then_some(first)
}
