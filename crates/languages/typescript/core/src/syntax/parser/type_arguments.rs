//! Whether a `<` after an expression opens type arguments (`f<T>(x)`) or compares (`a < b`).
//!
//! From the `<`, the tokens are read with a count of open angles and brackets until the angles
//! close or a token no type argument list can hold appears. Asked at each `<` of `a < b < c …`,
//! that read is `O(n)` per `<`. Instead, one read answers every `<` it passes at its own bracket
//! depth: the read stops at the same token for all of them, and each is answered by the first
//! point where the angles it opened are closed. A bracket group is summarized once (where it
//! ends, how its angles change), so reads at other depths jump over it.

use rustc_hash::FxHashMap;

use super::{LexedToken, Lexer, Parser, T};

/// What [`Parser::type_arguments_before_call`] has worked out, by lexer position.
#[derive(Debug, Default)]
pub(super) struct Angles {
    /// Per position just after a `<`: the answer.
    answers: FxHashMap<u32, bool>,
    /// Per position just after an opening bracket: its group, `None` when it does not close.
    groups: FxHashMap<u32, Option<Group>>,
}

/// A bracket group as the read sees it.
#[derive(Clone, Copy, Debug)]
struct Group {
    /// The lexer position after the closing bracket.
    end: u32,
    /// How the angle count changes from the opening bracket to the closing one.
    change: i32,
    /// The lowest the angle count gets inside, after an angle operator, from the opening bracket.
    lowest: Option<i32>,
}

/// A `<` waiting for its answer: the count it closes at or below, and its position.
#[derive(Clone, Copy)]
struct Pending {
    closed_at: i32,
    key: u32,
    count: i32,
}

/// How an operator changes the angle count, if it is one a type argument list can hold.
fn angle_change(text: &str) -> Option<i32> {
    match text {
        "<" => Some(1),
        ">" => Some(-1),
        ">>" => Some(-2),
        ">>>" => Some(-3),
        "|" | "&" | "-" => Some(0),
        _ => None,
    }
}

impl Parser<'_, '_> {
    /// Whether the `<` here opens a type argument list after an expression. TypeScript reads
    /// `f<T>(x)` as a call with type arguments where JavaScript reads two comparisons; outside
    /// brackets, a token no type can contain means a comparison, and so does a `>` that an operand
    /// follows on the same line (`a < b > c`).
    pub(super) fn type_arguments_before_call(&self) -> bool {
        let key = self.lex.position as u32;
        if let Some(&answer) = self.angles.borrow().answers.get(&key) {
            return answer;
        }
        self.read_angles(self.lex)
    }

    /// Reads from just after a `<` at `l`, answering it and every `<` at its depth that the read
    /// passes while one is waiting; returns the first one's answer.
    fn read_angles(&self, mut l: Lexer<'_>) -> bool {
        let mut scratch = Vec::new();
        let start = l.position as u32;
        // The angle count from just after the first `<`, outside brackets.
        let mut count = 0i32;
        let mut pending = vec![Pending {
            closed_at: -1,
            key: start,
            count: 0,
        }];
        let mut answers = Vec::new();
        while !pending.is_empty() {
            let Ok(t) = l.next(&mut scratch) else {
                break;
            };
            match t.t {
                T::LParen | T::LBracket | T::LBrace => {
                    let Some(group) = self.angle_group(l) else {
                        break;
                    };
                    if let Some(lowest) = group.lowest {
                        // Inside brackets, closing the angles at all means a comparison.
                        while let Some(p) = pending.pop_if(|p| p.closed_at >= count + lowest) {
                            answers.push((p.key, false));
                        }
                    }
                    count += group.change;
                    l.position = group.end as usize;
                }
                T::Op => {
                    let text = self.text(t);
                    let Some(change) = angle_change(text) else {
                        break;
                    };
                    count += change;
                    let mut follows = None;
                    while let Some(p) = pending.pop_if(|p| p.closed_at >= count) {
                        let answer = 1 + count - p.count == 0
                            && *follows.get_or_insert_with(|| {
                                let mut after = l;
                                after
                                    .next(&mut scratch)
                                    .is_ok_and(|next| self.follows_type_arguments(next))
                            });
                        answers.push((p.key, answer));
                    }
                    if text == "<" {
                        pending.push(Pending {
                            closed_at: count - 1,
                            key: l.position as u32,
                            count,
                        });
                    }
                }
                T::Identifier
                | T::String
                | T::Number
                | T::Dot
                | T::Comma
                | T::Question
                | T::Colon
                | T::Arrow
                | T::Ellipsis => {}
                _ => break,
            }
        }
        answers.extend(pending.iter().map(|p| (p.key, false)));
        let mut angles = self.angles.borrow_mut();
        angles.answers.extend(answers);
        angles.answers[&start]
    }

    /// The bracket group whose opening bracket `l` has just read, summarized once.
    fn angle_group(&self, mut l: Lexer<'_>) -> Option<Group> {
        let start = l.position as u32;
        if let Some(&group) = self.angles.borrow().groups.get(&start) {
            return group;
        }
        let mut scratch = Vec::new();
        let mut angles = self.angles.borrow_mut();
        // The open groups: the position after each opening bracket, the count there, and the
        // lowest count inside so far; the count runs from the first bracket.
        let mut open = vec![(start, 0i32, None::<i32>)];
        let mut count = 0i32;
        let lower = |lowest: &mut Option<i32>, value: i32| {
            *lowest = Some(lowest.map_or(value, |l| l.min(value)));
        };
        while let Ok(t) = l.next(&mut scratch) {
            match t.t {
                T::Eof => break,
                T::LParen | T::LBracket | T::LBrace => {
                    let after = l.position as u32;
                    match angles.groups.get(&after) {
                        Some(None) => break,
                        Some(&Some(group)) => {
                            if let (Some(lowest), Some(top)) = (group.lowest, open.last_mut()) {
                                lower(&mut top.2, count + lowest);
                            }
                            count += group.change;
                            l.position = group.end as usize;
                        }
                        None => open.push((after, count, None)),
                    }
                }
                T::RParen | T::RBracket | T::RBrace => {
                    let Some((after, at, lowest)) = open.pop() else {
                        break;
                    };
                    let group = Group {
                        end: l.position as u32,
                        change: count - at,
                        lowest: lowest.map(|lowest| lowest - at),
                    };
                    angles.groups.insert(after, Some(group));
                    let Some(top) = open.last_mut() else {
                        return Some(group);
                    };
                    if let Some(lowest) = lowest {
                        lower(&mut top.2, lowest);
                    }
                }
                T::Op => {
                    let change = angle_change(self.text(t)).unwrap_or(0);
                    if change != 0
                        && let Some(top) = open.last_mut()
                    {
                        count += change;
                        lower(&mut top.2, count);
                    }
                }
                _ => {}
            }
        }
        angles.groups.insert(start, None);
        None
    }

    /// TypeScript's `canFollowTypeArgumentsInExpression`: whether `next`, the token after a
    /// closing `>`, leaves the list type arguments.
    fn follows_type_arguments(&self, next: LexedToken) -> bool {
        match next.t {
            T::LParen | T::Template { .. } => true,
            T::Op if matches!(self.text(next), "<" | ">" | "+" | "-") => false,
            _ if next.newline_before => true,
            T::Op => !matches!(self.text(next), "!" | "~" | "++" | "--"),
            T::Identifier => matches!(self.text(next), "as" | "satisfies" | "in" | "instanceof"),
            T::RParen
            | T::RBracket
            | T::RBrace
            | T::Semi
            | T::Comma
            | T::Colon
            | T::Question
            | T::QuestionDot
            | T::Dot
            | T::Arrow
            | T::Eof => true,
            _ => false,
        }
    }
}

#[cfg(test)]
mod tests;
