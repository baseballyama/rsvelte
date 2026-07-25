//! The Svelte template tags: the documentation completion and hover both show,
//! and the scan that resolves which block a `{:…}` or `{/…}` belongs to.

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SvelteTag {
    If,
    Each,
    Await,
    Key,
    Snippet,
    Html,
    Debug,
    Const,
    Render,
    Attach,
}

/// The tags that open a block, in the order the official plugin scans them.
pub const LOGIC_TAGS: [SvelteTag; 5] = [
    SvelteTag::Each,
    SvelteTag::If,
    SvelteTag::Await,
    SvelteTag::Key,
    SvelteTag::Snippet,
];

impl SvelteTag {
    pub fn name(self) -> &'static str {
        match self {
            Self::If => "if",
            Self::Each => "each",
            Self::Await => "await",
            Self::Key => "key",
            Self::Snippet => "snippet",
            Self::Html => "html",
            Self::Debug => "debug",
            Self::Const => "const",
            Self::Render => "render",
            Self::Attach => "attach",
        }
    }

    pub fn documentation(self) -> &'static str {
        match self {
            Self::If => IF,
            Self::Each => EACH,
            Self::Await => AWAIT,
            Self::Key => KEY,
            Self::Snippet => SNIPPET,
            Self::Html => HTML,
            Self::Debug => DEBUG,
            Self::Const => CONST,
            Self::Render => RENDER,
            Self::Attach => ATTACH,
        }
    }
}

const AWAIT: &str = r#"`{#await ...}`\
Await blocks allow you to branch on the three possible states of a Promise — pending, fulfilled or rejected.
#### Usage:
`{#await expression}...{:then name}...{:catch name}...{/await}`\
`{#await expression}...{:then name}...{/await}`\
`{#await expression then name}...{/await}`\
\
https://svelte.dev/docs/svelte/await
"#;

const EACH: &str = r#"`{#each ...}`\
Iterating over lists of values can be done with an each block.
#### Usage:
`{#each expression as name}...{/each}`\
`{#each expression as name, index}...{/each}`\
`{#each expression as name, index (key)}...{/each}`\
`{#each expression as name}...{:else}...{/each}`\
\
https://svelte.dev/docs/svelte/each
"#;

const IF: &str = r#"`{#if ...}`\
Content that is conditionally rendered can be wrapped in an if block.
#### Usage:
`{#if expression}...{/if}`\
`{#if expression}...{:else if expression}...{/if}`\
`{#if expression}...{:else}...{/if}`\
\
https://svelte.dev/docs/svelte/if
"#;

const KEY: &str = r#"`{#key expression}...{/key}`\
Key blocks destroy and recreate their contents when the value of an expression changes.\
This is useful if you want an element to play its transition whenever a value changes.\
When used around components, this will cause them to be reinstantiated and reinitialised.
#### Usage:
`{#key expression}...{/key}`\
\
https://svelte.dev/docs/svelte/key
"#;

const SNIPPET: &str = r#"`{#snippet identifier(parameter)}...{/snippet}`\
Snippets allow you to create reusable UI blocks you can render with the {@render ...} tag.
They also function as slot props for components.
#### Usage:
`{#snippet identifier(parameter)}...{/snippet}`\
\
https://svelte.dev/docs/svelte/snippet
"#;

const RENDER: &str = r#"`{@render ...}`\
Renders a snippet with the given parameters.
#### Usage:
`{@render identifier(parameter)}`\
\
https://svelte.dev/docs/svelte/@render
"#;

const HTML: &str = r#"`{@html ...}`\
In a text expression, characters like < and > are escaped; however, with HTML expressions, they're not.
The expression should be valid standalone HTML.
#### Caution
Svelte does not sanitize expressions before injecting HTML.
If the data comes from an untrusted source, you must sanitize it, or you are exposing your users to an XSS vulnerability.
#### Usage:
`{@html expression}`\
\
https://svelte.dev/docs/svelte/@html
"#;

const DEBUG: &str = r#"`{@debug ...}`\
Offers an alternative to `console.log(...)`.
It logs the values of specific variables whenever they change, and pauses code execution if you have devtools open.
It accepts a comma-separated list of variable names (not arbitrary expressions).
#### Usage:
`{@debug}`
`{@debug var1, var2, ..., varN}`\
\
https://svelte.dev/docs/svelte/@debug
"#;

const CONST: &str = r#"`{@const ...}`\
Defines a local constant\
#### Usage:
`{@const a = b + c}`\
\
https://svelte.dev/docs/svelte/@const
"#;

const ATTACH: &str = r#"`{@attach ...}`\
Defines an attachment that is attached to an element or component\
#### Usage:
`<div {@attach (node) => {...}}></div>`\
`<Component {@attach namedAttachment} />`\
\
https://svelte.dev/docs/svelte/@attach
"#;

/// The block that is open — but not yet closed — at `offset`.
pub fn latest_opening_tag(text: &str, offset: usize) -> Option<SvelteTag> {
    let before = text.get(..offset).unwrap_or(text);
    let content = strip_html_comments(before);
    LOGIC_TAGS
        .iter()
        .filter_map(|&tag| last_unclosed_opening(&content, tag.name()).map(|idx| (idx, tag)))
        .max_by_key(|&(idx, _)| idx)
        .map(|(_, tag)| tag)
}

/// Index of the last `{#tag` that has no `{/tag` to answer it.
fn last_unclosed_opening(content: &str, tag: &str) -> Option<usize> {
    let closings = block_tag_indices(content, '/', tag).count();
    let mut openings = 0;
    let mut last = None;
    for idx in block_tag_indices(content, '#', tag) {
        openings += 1;
        last = Some(idx);
    }
    (openings > closings).then_some(last).flatten()
}

/// Every `{`, optional whitespace, `marker`, `tag` in `content`, by the index
/// of the brace.
fn block_tag_indices<'a>(
    content: &'a str,
    marker: char,
    tag: &'a str,
) -> impl Iterator<Item = usize> + 'a {
    content.match_indices('{').filter_map(move |(idx, _)| {
        let rest = content[idx + 1..].trim_start();
        let rest = rest.strip_prefix(marker)?;
        rest.starts_with(tag).then_some(idx)
    })
}

/// Drop every single-line `<!-- … -->`, matching the official plugin's regex —
/// a comment spanning lines is left in place.
fn strip_html_comments(text: &str) -> String {
    let mut out = String::with_capacity(text.len());
    let mut rest = text;
    while let Some(start) = rest.find("<!--") {
        let after = &rest[start + 4..];
        let line_end = after.find(['\n', '\r']).unwrap_or(after.len());
        match after[..line_end].find("-->") {
            Some(end) => {
                out.push_str(&rest[..start]);
                rest = &after[end + 3..];
            }
            None => {
                out.push_str(&rest[..start + 4]);
                rest = after;
            }
        }
    }
    out.push_str(rest);
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    fn latest(text: &str) -> Option<SvelteTag> {
        latest_opening_tag(text, text.len())
    }

    #[test]
    fn no_block_at_all() {
        assert_eq!(latest("{:"), None);
        assert_eq!(latest("plain text"), None);
    }

    #[test]
    fn a_closed_block_does_not_count() {
        assert_eq!(latest("{#if}{/if}{:"), None);
        assert_eq!(latest("{#if}{ /if}{/"), None);
    }

    #[test]
    fn whitespace_after_the_brace_is_allowed() {
        assert_eq!(latest("{ #each }"), Some(SvelteTag::Each));
    }

    #[test]
    fn the_innermost_open_block_wins() {
        assert_eq!(latest("{#if}{/if}{#if}{#await}{:"), Some(SvelteTag::Await));
        assert_eq!(latest("{#await}{#if}"), Some(SvelteTag::If));
    }

    #[test]
    fn commented_out_blocks_are_ignored() {
        assert_eq!(latest("<!-- {#if} -->{:"), None);
        // A comment that spans lines is beyond the official regex, so the tag
        // inside it still counts.
        assert_eq!(latest("<!-- \n {#if} -->{:"), Some(SvelteTag::If));
    }

    #[test]
    fn only_content_before_the_offset_counts() {
        assert_eq!(latest_opening_tag("{#if}{:", 0), None);
        assert_eq!(latest_opening_tag("{#if}{:", 5), Some(SvelteTag::If));
    }

    #[test]
    fn documentation_is_available_for_every_tag() {
        for tag in [
            SvelteTag::If,
            SvelteTag::Each,
            SvelteTag::Await,
            SvelteTag::Key,
            SvelteTag::Snippet,
            SvelteTag::Html,
            SvelteTag::Debug,
            SvelteTag::Const,
            SvelteTag::Render,
            SvelteTag::Attach,
        ] {
            let documentation = tag.documentation();
            assert!(documentation.contains("#### Usage:"), "{}", tag.name());
            assert!(
                documentation.contains("https://svelte.dev/docs/svelte/"),
                "{}",
                tag.name()
            );
        }
    }
}
