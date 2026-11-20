//! The `// @ts-check` or `// @ts-nocheck` that svelte-check writes before svelte2tsx's output, so
//! TypeScript reads a script's directive at the top of the file, where it applies.

use rsvelte_kernel::output::emitter::{Atom, Emitter, Mapping};
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::Component;

/// svelte-check's `getTsCheckComment`: the first directive in the line comments that open the
/// instance script, or the module script without one.
pub(super) fn of(component: &Component, source: &str) -> Option<&'static str> {
    let script = component.instance.as_ref().or(component.module.as_ref())?;
    directive(leading_line_comments(script.content.text(source)))
}

/// `/^(\s*\/\/.*\s*)*/`.
fn leading_line_comments(content: &str) -> &str {
    let mut end = 0;
    loop {
        let comment = content[end..].trim_start_matches(is_ecmascript_whitespace);
        let Some(body) = comment.strip_prefix("//") else {
            return &content[..end];
        };
        let line = body.find(is_line_terminator).unwrap_or(body.len());
        let after = body[line..].trim_start_matches(is_ecmascript_whitespace);
        end = content.len() - after.len();
    }
}

/// `/\/\/[ \t   -     　﻿]*(@ts-(no)?check)($|\s)/`,
/// whose space class is `\s` without `\n`, `\r`, `\v` and `\f`.
fn directive(comments: &str) -> Option<&'static str> {
    let bytes = comments.as_bytes();
    (0..bytes.len().saturating_sub(1))
        .filter(|&at| bytes[at] == b'/' && bytes[at + 1] == b'/')
        .find_map(|at| {
            let rest = comments[at + 2..].trim_start_matches(|c| {
                is_ecmascript_whitespace(c) && !matches!(c, '\n' | '\r' | '\u{b}' | '\u{c}')
            });
            [
                ("@ts-check", "// @ts-check\n"),
                ("@ts-nocheck", "// @ts-nocheck\n"),
            ]
            .into_iter()
            .find_map(|(name, line)| {
                let after = rest.strip_prefix(name)?;
                after
                    .chars()
                    .next()
                    .is_none_or(is_ecmascript_whitespace)
                    .then_some(line)
            })
        })
}

/// What JavaScript's `.` does not match.
const fn is_line_terminator(c: char) -> bool {
    matches!(c, '\n' | '\r' | '\u{2028}' | '\u{2029}')
}

/// The projection after `line`, its positions moved past it.
pub(super) fn prepended(line: &str, projection: &Emitter) -> Emitter {
    let shift = u32::try_from(line.len()).expect("a directive line is short");
    let mut out = String::with_capacity(line.len() + projection.out.len());
    out.push_str(line);
    out.push_str(&projection.out);
    Emitter {
        out,
        mappings: projection
            .mappings
            .iter()
            .map(|m| Mapping {
                generated: m.generated + shift,
                ..*m
            })
            .collect(),
        atoms: projection
            .atoms
            .iter()
            .map(|a| Atom {
                generated: Span::new(
                    a.generated.start_offset + shift,
                    a.generated.end_offset + shift,
                ),
                original: a.original,
            })
            .collect(),
    }
}

#[cfg(test)]
mod tests;
