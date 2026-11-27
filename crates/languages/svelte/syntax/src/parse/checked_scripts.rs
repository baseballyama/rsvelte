//! The script elements svelte-check reads a component's language off, which it finds whether or
//! not Svelte's parser accepts the component: the language server's `extractTags`, over the root
//! nodes its `parseHtml` reads with vscode-html-languageservice's scanner, which skips Svelte's
//! `{…}` in content and in start tags.

mod scanner;

use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use scanner::{Scanner, State, Token, matching_brace_end};

/// The scripts svelte-check reads a component by.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct CheckedScripts<'a> {
    /// Whether it reads the component as TypeScript: its first instance script or its first
    /// module script is, as `getScriptKindFromAttributes` reads their attributes.
    pub typescript: bool,
    /// What it checks when svelte2tsx throws: the content of the first instance script, else of
    /// the first module script.
    pub content: Option<&'a str>,
}

/// The scripts svelte-check reads `text` by.
#[must_use]
pub fn checked_scripts(text: &str) -> CheckedScripts<'_> {
    let roots = root_nodes(text);
    let scripts: Vec<&Node<'_>> = (roots.iter().enumerate())
        .filter(|(index, node)| {
            node.tag == Some("script")
                && outside_control_flow(text, &roots, *index)
                && outside_raw_markup_tag(text, &roots, *index)
        })
        .map(|(_, node)| node)
        .collect();
    let module =
        |node: &Node<'_>| node.attribute("context") == Some("module") || node.has("module");
    let instance = scripts.iter().find(|node| !module(node));
    let module = scripts.iter().find(|node| module(node));
    let typescript = [instance, module].into_iter().flatten().any(|node| {
        rsvelte_markup_syntax::script_language::checked_as_typescript(|name| node.attribute(name))
    });
    CheckedScripts {
        typescript,
        content: instance.or(module).map(|node| node.content(text)),
    }
}

/// A node `parseHtml` reads, with the offsets `extractTags` reads of it.
struct Node<'a> {
    tag: Option<&'a str>,
    start: usize,
    end: usize,
    start_tag_end: Option<usize>,
    /// Where the end tag that closes it starts, if one does.
    end_tag_start: Option<usize>,
    parent: Option<usize>,
    /// Each attribute's name and its text: quoted, an expression, or none.
    attributes: Vec<(&'a str, Option<&'a str>)>,
}

impl<'a> Node<'a> {
    fn has(&self, name: &str) -> bool {
        self.attributes.iter().any(|(at, _)| *at == name)
    }

    /// `parseAttributes`: the last value given, without its outer quotes, or a valueless
    /// attribute's name.
    fn attribute(&self, name: &str) -> Option<&'a str> {
        let (at, value) = self.attributes.iter().rfind(|(at, _)| *at == name)?;
        let Some(value) = value else {
            return Some(at);
        };
        Some(
            ['"', '\'']
                .into_iter()
                .find_map(|quote| value.strip_prefix(quote)?.strip_suffix(quote))
                .filter(|_| value.len() >= 2)
                .unwrap_or(value),
        )
    }

    /// `transformToTagInfo`'s content: from the end of the start tag, else the start, to the end
    /// tag's start, else the end.
    fn content<'t>(&self, text: &'t str) -> &'t str {
        let start = self.start_tag_end.unwrap_or(self.start);
        &text[start..self.end_tag_start.unwrap_or(self.end)]
    }

    const fn is_same_tag(&self, tag: Option<&str>) -> bool {
        match (self.tag, tag) {
            (None, tag) => tag.is_none(),
            (Some(own), Some(tag)) => own.eq_ignore_ascii_case(tag),
            (Some(_), None) => false,
        }
    }
}

/// vscode-html-languageservice's default void elements.
const VOID_ELEMENTS: [&str; 14] = [
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source",
    "track", "wbr",
];

/// `parseHtml`'s root nodes, with their attributes.
fn root_nodes(text: &str) -> Vec<Node<'_>> {
    let mut parse = Parse {
        text,
        nodes: Vec::new(),
        current: None,
        pending: None,
        scanner: Scanner::new(text, 0, State::WithinContent),
    };
    let mut end_tag_start = 0;
    let mut end_tag_name: Option<String> = None;
    loop {
        let token = parse.scanner.scan();
        let (offset, end) = (parse.scanner.token_offset, parse.scanner.position);
        match token {
            Token::Eos => break,
            Token::StartTagOpen => parse.open(offset),
            Token::StartTag => {
                if let Some(node) = parse.current {
                    parse.nodes[node].tag = Some(&text[offset..end]);
                }
            }
            Token::StartTagClose => parse.close_start_tag(offset, end),
            Token::StartTagSelfClose => {
                if let Some(node) = parse.current {
                    parse.nodes[node].end = end;
                    parse.nodes[node].start_tag_end = Some(end);
                    parse.current = parse.nodes[node].parent;
                }
            }
            Token::EndTagOpen => {
                end_tag_start = offset;
                end_tag_name = None;
            }
            Token::EndTag => end_tag_name = Some(text[offset..end].to_lowercase()),
            Token::EndTagClose => parse.close(end_tag_name.as_deref(), end_tag_start, end),
            Token::AttributeName => {
                if let Some(node) = parse.current {
                    let attributes = &mut parse.nodes[node].attributes;
                    attributes.push((&text[offset..end], None));
                    parse.pending = Some((node, attributes.len() - 1));
                }
            }
            Token::DelimiterAssign if text.as_bytes().get(end) == Some(&b'{') => {
                let value_end = matching_brace_end(text, end);
                parse.restart(value_end, State::WithinTag);
                parse.finish(end, value_end);
            }
            Token::Whitespace if text.as_bytes().get(end) == Some(&b'{') => {
                let value_end = matching_brace_end(text, end);
                // `<div a = {…}>`, else a spread or a shorthand.
                let value = parse.scanner.state == State::BeforeAttributeValue;
                parse.restart(value_end, State::WithinTag);
                if value {
                    parse.finish(end, value_end);
                } else if let Some(node) = parse.current
                    && !text[end + 1..].starts_with("...")
                {
                    let name = substring(text, end + 1, value_end.saturating_sub(1));
                    let name = name.trim_matches(is_ecmascript_whitespace);
                    (parse.nodes[node].attributes).push((name, Some(&text[end..value_end])));
                }
            }
            Token::AttributeValue => parse.attribute_value(offset, end),
            Token::Unknown => parse.comment_in_tag(offset),
            Token::Content => {
                let expressions_end = skip_expressions(text, offset, end);
                parse.restart(expressions_end, State::WithinContent);
            }
            _ => {}
        }
    }
    while let Some(node) = parse.current {
        parse.nodes[node].end = text.len();
        parse.current = parse.nodes[node].parent;
    }
    let mut nodes = parse.nodes;
    nodes.retain(|node| node.parent.is_none());
    nodes
}

/// `parseHtml`'s state: the nodes so far, the one open, and the attribute awaiting its value.
struct Parse<'a> {
    text: &'a str,
    nodes: Vec<Node<'a>>,
    current: Option<usize>,
    pending: Option<(usize, usize)>,
    scanner: Scanner<'a>,
}

impl Parse<'_> {
    fn open(&mut self, start: usize) {
        self.nodes.push(Node {
            tag: None,
            start,
            end: self.text.len(),
            start_tag_end: None,
            end_tag_start: None,
            parent: self.current,
            attributes: Vec::new(),
        });
        self.current = Some(self.nodes.len() - 1);
    }

    fn close_start_tag(&mut self, offset: usize, end: usize) {
        let Some(node) = self.current else {
            return;
        };
        self.nodes[node].end = end;
        if end > offset {
            self.nodes[node].start_tag_end = Some(end);
            if (self.nodes[node].tag).is_some_and(|tag| VOID_ELEMENTS.contains(&tag)) {
                self.current = self.nodes[node].parent;
            }
        } else {
            // The pseudo close of a start tag that another `<` ends.
            self.current = self.nodes[node].parent;
        }
    }

    /// An end tag closes the nearest open node of its name, and every node open inside it.
    fn close(&mut self, name: Option<&str>, end_tag_start: usize, end: usize) {
        let mut matched = self.current;
        while let Some(node) = matched
            && !self.nodes[node].is_same_tag(name)
        {
            matched = self.nodes[node].parent;
        }
        let Some(matched) = matched else {
            return;
        };
        while let Some(open) = self.current
            && open != matched
        {
            self.nodes[open].end = end_tag_start;
            self.current = self.nodes[open].parent;
        }
        self.nodes[matched].end = end;
        self.nodes[matched].end_tag_start = Some(end_tag_start);
        self.current = self.nodes[matched].parent;
    }

    fn restart(&mut self, at: usize, state: State) {
        if at > self.scanner.position {
            self.scanner = Scanner::new(self.text, at, state);
        }
    }

    /// `finishAttribute`: the awaiting attribute's value is `start..end`.
    fn finish(&mut self, start: usize, end: usize) {
        if let Some((node, attribute)) = self.pending.take()
            && self.current == Some(node)
        {
            self.nodes[node].attributes[attribute].1 = Some(&self.text[start..end]);
        }
    }

    /// `parseAttributeValue`: a quoted value runs past the `{…}` in it to its closing quote.
    fn attribute_value(&mut self, start: usize, end: usize) {
        let quote = self.text.as_bytes()[start];
        if quote != b'"' && quote != b'\'' {
            self.finish(start, end);
            return;
        }
        let mut value_end = skip_expressions(self.text, start, end);
        if value_end > end {
            value_end = memchr::memchr(quote, &self.text.as_bytes()[value_end..])
                .map_or(self.text.len(), |at| value_end + at + 1);
            self.restart(value_end, State::WithinTag);
        }
        self.finish(start, value_end);
    }

    /// A `//` or `/* */` comment in a start tag, which the scanner reads as unknown characters.
    fn comment_in_tag(&mut self, offset: usize) {
        let inside_tag = matches!(
            self.scanner.state,
            State::WithinTag
                | State::AfterAttributeName
                | State::BeforeAttributeValue
                | State::AfterOpeningStartTag
        );
        let rest = &self.text[offset..];
        let end = if let Some(comment) = rest.strip_prefix("//") {
            memchr::memchr(b'\n', comment.as_bytes()).map_or(self.text.len(), |at| offset + 2 + at)
        } else if let Some(comment) = rest.strip_prefix("/*") {
            memchr::memmem::find(comment.as_bytes(), b"*/")
                .map_or(self.text.len(), |at| offset + 2 + at + 2)
        } else {
            return;
        };
        if inside_tag {
            self.restart(end, State::WithinTag);
        }
    }
}

/// `skipExpressionInRange`: past each `{…}` that starts in `start..end`.
fn skip_expressions(text: &str, start: usize, end: usize) -> usize {
    let mut index = start;
    while index < end {
        if text.as_bytes()[index] == b'{' {
            index = matching_brace_end(text, index);
        } else {
            index += 1;
        }
    }
    index.max(end)
}

/// JavaScript's `substring`, which swaps its ends when they are in the wrong order.
fn substring(text: &str, start: usize, end: usize) -> &str {
    let (start, end) = (start.min(text.len()), end.min(text.len()));
    &text[start.min(end)..start.max(end)]
}

/// `isNotInsideControlFlowTag`: the text after the node, outside the root nodes, closes no
/// `{#if}`, `{#each}` or `{#await}` before it opens one.
fn outside_control_flow(text: &str, roots: &[Node<'_>], index: usize) -> bool {
    let node = &roots[index];
    if index == 0
        && text[..node.start]
            .trim_matches(is_ecmascript_whitespace)
            .is_empty()
    {
        return true;
    }
    let nodes = &roots[index..];
    let after: String = (nodes.iter().enumerate())
        .map(|(i, node)| {
            let start = if node.start_tag_end.is_some() {
                node.end
            } else {
                node.start + node.tag.map_or(0, str::len)
            };
            let end = nodes.get(i + 1).map_or(text.len(), |next| next.start);
            substring(text, start, end)
        })
        .collect();
    !["if", "each", "await"].into_iter().any(|block| {
        let opens = block_start(&after, block).unwrap_or(text.len());
        let closes = block_end(&after, block).unwrap_or(text.len());
        closes < opens
    })
}

/// `isNotInsideHtmlTag`: the text before the node, outside the root nodes, has no `{@html`
/// after its last `}`.
fn outside_raw_markup_tag(text: &str, roots: &[Node<'_>], index: usize) -> bool {
    let nodes = &roots[..index];
    let before: String = std::iter::once(0)
        .chain(nodes.iter().map(|node| node.end))
        .enumerate()
        .map(|(i, from)| substring(text, from, nodes.get(i).map_or(text.len(), |n| n.start)))
        .collect();
    let raw_markup = raw_markup_tag_starts(&before).last();
    raw_markup.is_none_or(|at| before.rfind('}').is_some_and(|brace| at < brace))
}

/// The bytes after `{` and any whitespace.
fn after_brace(text: &str, at: usize) -> &str {
    text[at + 1..].trim_start_matches(is_ecmascript_whitespace)
}

/// The first match of `{\s*#block\s.*?}`.
fn block_start(text: &str, block: &str) -> Option<usize> {
    memchr::memchr_iter(b'{', text.as_bytes()).find(|&at| {
        after_brace(text, at)
            .strip_prefix('#')
            .and_then(|rest| rest.strip_prefix(block))
            .is_some_and(|rest| {
                rest.starts_with(is_ecmascript_whitespace)
                    && rest[rest.chars().next().map_or(0, char::len_utf8)..].contains('}')
            })
    })
}

/// The first match of `{\s*/block}`.
fn block_end(text: &str, block: &str) -> Option<usize> {
    memchr::memchr_iter(b'{', text.as_bytes()).find(|&at| {
        after_brace(text, at)
            .strip_prefix('/')
            .and_then(|rest| rest.strip_prefix(block))
            .is_some_and(|rest| rest.starts_with('}'))
    })
}

/// Each match of `{\s*@html\s`.
fn raw_markup_tag_starts(text: &str) -> impl Iterator<Item = usize> + '_ {
    memchr::memchr_iter(b'{', text.as_bytes()).filter(|&at| {
        after_brace(text, at)
            .strip_prefix("@html")
            .is_some_and(|rest| rest.starts_with(is_ecmascript_whitespace))
    })
}

#[cfg(test)]
mod tests;
