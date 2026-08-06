//! One-pass bracket/token index over the `Vec<char>` the identifier rewriters walk.
//!
//! The rewriters ask the same handful of "what encloses this position?" questions
//! once per *matched identifier*, and each question used to be answered by a
//! backward scan that could run to the start of the expression — O(n) work fired
//! O(n) times. Building this index costs one forward pass per rewrite pass, the
//! same order as materializing the `Vec<char>` itself, and answers each question
//! in O(1) (or O(nesting depth) for the enclosing-scope chains).
//!
//! The scans this replaces track their own depth counters, and those counters
//! clamp at zero rather than going negative. That is exactly a forward stack that
//! pops only when non-empty, which is how the stacks below are maintained — so
//! the answers agree even on unbalanced text. `RSVELTE_INDEX_ORACLE` runs both
//! routes and compares them.

/// Sentinel for "no such position"; `u32::MAX` cannot be a real index because the
/// rewriters only run on expression text far below 4 GiB.
const NONE: u32 = u32::MAX;

pub(super) struct ScanIndex {
    /// Innermost enclosing `{`, pairing braces only.
    encl_brace: Vec<u32>,
    /// Innermost enclosing `[`, pairing square brackets only.
    encl_bracket: Vec<u32>,
    /// Innermost enclosing `(`, pairing parentheses only.
    encl_paren: Vec<u32>,
    /// Innermost enclosing `(`/`[`/`{` when any closer pops any opener, which is
    /// how the arrow-parameter scan counts depth.
    encl_any: Vec<u32>,
    /// For each opening bracket, the closer that popped it under that same
    /// type-agnostic pairing.
    close_any: Vec<u32>,
    /// For each `)`, its matching `(` under parenthesis-only pairing.
    open_paren: Vec<u32>,
    /// Nearest `{` or `}` before each position, at any nesting.
    prev_brace_any: Vec<u32>,
    /// Nearest `=>` (index of the `>`) before each position at the same
    /// parenthesis nesting level.
    prev_arrow: Vec<u32>,
    /// Nearest `;` before each position at the same type-agnostic nesting level.
    prev_semi: Vec<u32>,
    /// When the first non-whitespace character is `{`, whether that group holds a
    /// `;` at its own depth — the object-literal-vs-block-statement test.
    leading_brace_has_semicolon: Option<bool>,
}

impl ScanIndex {
    pub(super) fn new(chars: &[char]) -> Self {
        let n = chars.len();
        let mut encl_brace = vec![NONE; n + 1];
        let mut encl_bracket = vec![NONE; n + 1];
        let mut encl_paren = vec![NONE; n + 1];
        let mut encl_any = vec![NONE; n + 1];
        let mut close_any = vec![NONE; n];
        let mut open_paren = vec![NONE; n];
        let mut prev_brace_any = vec![NONE; n + 1];
        let mut prev_arrow = vec![NONE; n + 1];
        let mut prev_semi = vec![NONE; n + 1];

        let mut brace_stack: Vec<u32> = Vec::new();
        let mut bracket_stack: Vec<u32> = Vec::new();
        // Each parenthesis frame restores the enclosing level's last `=>`, and
        // each type-agnostic frame restores its last `;`, on close.
        let mut paren_stack: Vec<(u32, u32)> = Vec::new();
        let mut any_stack: Vec<(u32, u32)> = Vec::new();
        let mut cur_arrow = NONE;
        let mut cur_semi = NONE;
        let mut cur_brace = NONE;

        for i in 0..n {
            encl_brace[i] = brace_stack.last().copied().unwrap_or(NONE);
            encl_bracket[i] = bracket_stack.last().copied().unwrap_or(NONE);
            encl_paren[i] = paren_stack.last().map_or(NONE, |&(p, _)| p);
            encl_any[i] = any_stack.last().map_or(NONE, |&(p, _)| p);
            prev_brace_any[i] = cur_brace;
            prev_arrow[i] = cur_arrow;
            prev_semi[i] = cur_semi;

            let pos = i as u32;
            match chars[i] {
                '{' => {
                    brace_stack.push(pos);
                    any_stack.push((pos, cur_semi));
                    cur_semi = NONE;
                    cur_brace = pos;
                }
                '[' => {
                    bracket_stack.push(pos);
                    any_stack.push((pos, cur_semi));
                    cur_semi = NONE;
                }
                '(' => {
                    paren_stack.push((pos, cur_arrow));
                    cur_arrow = NONE;
                    any_stack.push((pos, cur_semi));
                    cur_semi = NONE;
                }
                '}' | ']' | ')' => {
                    if chars[i] == '}' {
                        brace_stack.pop();
                        cur_brace = pos;
                    } else if chars[i] == ']' {
                        bracket_stack.pop();
                    } else if let Some((open, saved)) = paren_stack.pop() {
                        open_paren[i] = open;
                        cur_arrow = saved;
                    }
                    if let Some((open, saved)) = any_stack.pop() {
                        close_any[open as usize] = pos;
                        cur_semi = saved;
                    }
                }
                ';' => cur_semi = pos,
                '>' if i > 0 && chars[i - 1] == '=' => cur_arrow = pos,
                _ => {}
            }
        }
        encl_brace[n] = brace_stack.last().copied().unwrap_or(NONE);
        encl_bracket[n] = bracket_stack.last().copied().unwrap_or(NONE);
        encl_paren[n] = paren_stack.last().map_or(NONE, |&(p, _)| p);
        encl_any[n] = any_stack.last().map_or(NONE, |&(p, _)| p);
        prev_brace_any[n] = cur_brace;
        prev_arrow[n] = cur_arrow;
        prev_semi[n] = cur_semi;

        Self {
            encl_brace,
            encl_bracket,
            encl_paren,
            encl_any,
            close_any,
            open_paren,
            prev_brace_any,
            prev_arrow,
            prev_semi,
            leading_brace_has_semicolon: leading_brace_has_semicolon(chars),
        }
    }

    /// Innermost `{` still open before `pos`. Passing a `{`'s own index walks one
    /// step outwards, so the enclosing-scope chain is a loop over this.
    pub(super) fn enclosing_brace(&self, pos: usize) -> Option<usize> {
        unwrap_idx(self.encl_brace[pos])
    }

    pub(super) fn enclosing_bracket(&self, pos: usize) -> Option<usize> {
        unwrap_idx(self.encl_bracket[pos])
    }

    pub(super) fn enclosing_paren(&self, pos: usize) -> Option<usize> {
        unwrap_idx(self.encl_paren[pos])
    }

    pub(super) fn enclosing_any(&self, pos: usize) -> Option<usize> {
        unwrap_idx(self.encl_any[pos])
    }

    /// The closer that ends the bracket group opened at `open`.
    pub(super) fn closer_of(&self, open: usize) -> Option<usize> {
        unwrap_idx(self.close_any[open])
    }

    /// The `(` matching the `)` at `close`.
    pub(super) fn opener_of(&self, close: usize) -> Option<usize> {
        unwrap_idx(self.open_paren[close])
    }

    pub(super) fn prev_brace(&self, pos: usize) -> Option<usize> {
        unwrap_idx(self.prev_brace_any[pos])
    }

    pub(super) fn prev_arrow(&self, pos: usize) -> Option<usize> {
        unwrap_idx(self.prev_arrow[pos])
    }

    pub(super) fn prev_semicolon(&self, pos: usize) -> Option<usize> {
        unwrap_idx(self.prev_semi[pos])
    }

    pub(super) fn leading_brace_has_semicolon(&self) -> bool {
        self.leading_brace_has_semicolon.unwrap_or(false)
    }
}

fn unwrap_idx(raw: u32) -> Option<usize> {
    (raw != NONE).then_some(raw as usize)
}

fn leading_brace_has_semicolon(chars: &[char]) -> Option<bool> {
    let first = chars.iter().position(|c| !c.is_whitespace())?;
    if chars[first] != '{' {
        return None;
    }
    let mut depth = 0i32;
    for &ch in &chars[first..] {
        match ch {
            '{' => depth += 1,
            '}' => {
                depth -= 1;
                if depth == 0 {
                    break;
                }
            }
            ';' if depth == 1 => return Some(true),
            _ => {}
        }
    }
    Some(false)
}
