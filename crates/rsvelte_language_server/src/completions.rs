//! `textDocument/completion` for Svelte template tags and event modifiers.
//!
//! A port of the official language server's
//! `plugins/svelte/features/getCompletions.ts`.

use lsp_types::{
    CompletionItem, CompletionItemKind, CompletionList, Documentation, InsertTextFormat,
    MarkupContent, MarkupKind, TextEdit,
};

use crate::context::{
    EmbeddedRegions, StartTag, attribute_context, is_component_tag, start_tag_context,
};
use crate::html_data::{self, provider};
use crate::modifiers::MODIFIERS;
use crate::tags::{SvelteTag, latest_opening_tag};
use crate::text::LineIndex;

/// The characters that put the client in a position to want completions.
///
/// A character absent here never reaches the server at all, so the TypeScript
/// and Emmet triggers upstream declares belong in the list even though this
/// module answers none of them — `.` alone is every member completion.
pub const TRIGGER_CHARACTERS: [&str; 19] = [
    "<", " ", "#", "@", ":", "|", "/", ".", "\"", "'", "`", ">", "*", "$", "+", "^", "(", "[", "-",
];

const HTML_COMMENT_START: &str = "<!--";

/// The window the official plugin looks back over — enough for every realistic
/// case, and short enough that a stray `{` far away cannot open a moustache.
const WINDOW: usize = 10;

#[must_use]
pub fn completions(text: &str, offset: usize) -> Option<CompletionList> {
    completions_with_strict_mode(text, offset, false, true)
}

#[must_use]
pub fn completions_with_strict_mode(
    text: &str,
    offset: usize,
    strict_mode: bool,
    markdown_documentation: bool,
) -> Option<CompletionList> {
    build_completions(text, offset, strict_mode, markdown_documentation)
}

fn build_completions(
    text: &str,
    offset: usize,
    strict_mode: bool,
    markdown_documentation: bool,
) -> Option<CompletionList> {
    let embedded = EmbeddedRegions::new(text);
    if let Some(style) = embedded.style_at(offset) {
        // `shouldExcludeCompletion` (`CSSPlugin.ts:585-593`) — `sass` is not on
        // upstream's list because it is answered by emmet, which rsvelte has no
        // port of, so it stays with the CSS provider rather than going silent.
        if matches!(style.language.as_deref(), Some("stylus" | "styl")) {
            return None;
        }
        return crate::css::completions(text, offset);
    }
    // A script body belongs to tsgo, not to the CSS provider.
    if embedded.in_script(offset) {
        return None;
    }
    let before = preceding(text, offset);

    if let Some(prefix) = tag_prefix(text, offset) {
        return Some(html_tag_completions(
            text,
            offset,
            prefix,
            markdown_documentation,
        ));
    }

    if let Some((element_tag, replace)) = match start_tag_context(text, offset) {
        // An event modifier is completed further down, off the same position.
        StartTag::Attribute(attribute)
            if !attribute.in_value && !attribute.can_have_event_modifier() =>
        {
            Some((
                attribute.element_tag,
                attribute.name_start..attribute.name_start + attribute.name.len(),
            ))
        }
        StartTag::Bare { element_tag } => Some((element_tag, offset..offset)),
        StartTag::Attribute(_) | StartTag::TagName { .. } | StartTag::None => None,
    } {
        // `HTMLPlugin.ts:188-191` answers a component's start tag with nothing:
        // its attributes are the component's props, which TypeScript owns.
        if is_component_tag(element_tag) {
            return None;
        }
        let mut list = html_attribute_completions(
            text,
            element_tag,
            replace,
            strict_mode,
            markdown_documentation,
        );
        // `getIdClassCompletion.ts:29`: a `class:` directive's name is a class
        // too, and upstream's CSS plugin contributes it beside the HTML names.
        if let StartTag::Attribute(attribute) = start_tag_context(text, offset)
            && let Some(node_type) = id_class_node_type(attribute.name, false)
        {
            list.items
                .extend(crate::css::id_class_completions(text, node_type).items);
        }
        return Some(list);
    }

    if preceded_by_opening_brace(before) {
        return trigger_character(before).and_then(|trigger| match trigger {
            b'@' => Some(tag_completions(AT_ITEMS)),
            b'#' => Some(tag_completions(HASH_ITEMS)),
            b':' => match latest_opening_tag(text, offset)? {
                SvelteTag::If => Some(tag_completions(IF_CONTINUATIONS)),
                SvelteTag::Each => Some(tag_completions(EACH_CONTINUATIONS)),
                SvelteTag::Await => Some(tag_completions(AWAIT_CONTINUATIONS)),
                _ => None,
            },
            b'/' => match latest_opening_tag(text, offset)? {
                SvelteTag::If => Some(tag_completions(IF_CLOSE)),
                SvelteTag::Each => Some(tag_completions(EACH_CLOSE)),
                SvelteTag::Await => Some(tag_completions(AWAIT_CLOSE)),
                SvelteTag::Key => Some(tag_completions(KEY_CLOSE)),
                SvelteTag::Snippet => Some(tag_completions(SNIPPET_CLOSE)),
                _ => None,
            },
            _ => None,
        });
    }

    if let Some(attribute) = attribute_context(text, offset) {
        if attribute.in_value && attribute.name == "lang" {
            return Some(language_completions(attribute.element_tag));
        }
        if attribute.in_value && attribute.name == "style" {
            return crate::css::completions(text, offset);
        }
        // `CSSPlugin.ts:252` answers a `class=` / `id=` value from the
        // component's own selectors.
        if attribute.in_value
            && let Some(node_type) = id_class_node_type(attribute.name, true)
        {
            return Some(crate::css::id_class_completions(text, node_type));
        }
        if !attribute.can_have_event_modifier() {
            return None;
        }
        return Some(modifier_completions(attribute.name));
    }

    component_documentation(before)
}

/// `getCollectingType` (`getIdClassCompletion.ts:31-42`): which selector kind a
/// position collects, or nothing when it collects neither.
const fn id_class_node_type(name: &str, in_value: bool) -> Option<&'static str> {
    if in_value {
        match name.as_bytes() {
            b"class" => Some("ClassSelector"),
            b"id" => Some("IdSelector"),
            _ => None,
        }
    } else if name.len() >= 6 && matches!(name.as_bytes().first_chunk::<6>(), Some(b"class:")) {
        Some("ClassSelector")
    } else {
        None
    }
}

fn language_completions(element: &str) -> CompletionList {
    let languages: &[&str] = match element {
        "script" => &["js", "ts"],
        "style" => &["css", "scss", "less", "sass", "postcss"],
        _ => &[],
    };
    CompletionList {
        is_incomplete: false,
        items: languages
            .iter()
            .map(|language| CompletionItem {
                label: (*language).to_string(),
                kind: Some(CompletionItemKind::VALUE),
                ..CompletionItem::default()
            })
            .collect(),
    }
}

/// The value snippet `htmlCompletion.js:194-203` appends to an attribute name
/// that is not already followed by `=`.
const ATTRIBUTE_VALUE_PLACEHOLDER: &str = "=\"$1\"";

/// Every attribute the element may carry, as `htmlCompletion.js:185-236` builds
/// them: no server-side filtering by what has been typed — the replace range is
/// what narrows the list — and one snippet `textEdit` per item.
fn html_attribute_completions(
    text: &str,
    element: &str,
    replace: std::ops::Range<usize>,
    strict_mode: bool,
    markdown: bool,
) -> CompletionList {
    // `seenAttributes` (`htmlCompletion.js:205-213`) is a single map, so it
    // does two jobs: it skips a name the tag already carries — not ported, so a
    // written attribute is still offered — and it keeps the FIRST of a repeated
    // name. The provider repeats ten on `div` (eight `on:pointer*` plus
    // `on:mouseenter` / `on:mouseleave`, once from the renamed upstream globals
    // and again from `svelteEvents`) and twelve on `input`.
    let mut seen = std::collections::HashSet::new();
    let index = LineIndex::new(text);
    let range = lsp_types::Range::new(
        index.position(text, replace.start),
        index.position(text, replace.end),
    );
    let assigned = text[replace.end..].trim_start().starts_with('=');
    let (open, close) = if strict_mode {
        ("\"{", "}\"")
    } else {
        ("{", "}")
    };
    CompletionList {
        is_incomplete: false,
        items: provider::attributes(element)
            .into_iter()
            .filter(|provided| seen.insert(provided.name.clone()))
            .map(|provided| {
                let name = provided.name.as_ref();
                let attribute = provided.data;
                // `htmlCompletion.js:227-231`: a valueless attribute takes no
                // `="$1"`, and one with a value set asks the editor to suggest.
                let mut new_text = if assigned || attribute.value_set == Some("v") {
                    name.to_string()
                } else {
                    format!("{name}{ATTRIBUTE_VALUE_PLACEHOLDER}")
                };
                // `HTMLPlugin.ts:211-249` rewrites the placeholder per shape,
                // and a name ending in `:` is a directive keyword rather than
                // an attribute that takes a value.
                let keyword = name.ends_with(':');
                let mut sort_text = None;
                if keyword {
                    new_text = new_text.replace(ATTRIBUTE_VALUE_PLACEHOLDER, "");
                } else if name.starts_with("on") {
                    let modifiers = if name.starts_with("on:") { "$2" } else { "" };
                    new_text = new_text.replace(
                        ATTRIBUTE_VALUE_PLACEHOLDER,
                        &format!("{modifiers}={open}$1{close}"),
                    );
                    if name.starts_with("on:") {
                        sort_text = Some(format!("z{name}"));
                    }
                } else if name.starts_with("bind:") {
                    new_text =
                        new_text.replace(ATTRIBUTE_VALUE_PLACEHOLDER, &format!("={open}$1{close}"));
                }
                CompletionItem {
                    label: name.to_string(),
                    kind: Some(if keyword {
                        CompletionItemKind::KEYWORD
                    } else if attribute.value_set == Some("handler") {
                        // The vendored data carries none, so this arm is
                        // unreachable today and is here to survive a bump.
                        CompletionItemKind::FUNCTION
                    } else {
                        CompletionItemKind::VALUE
                    }),
                    documentation: html_data::documentation::documentation(
                        &html_data::documentation::Entry {
                            description: attribute.description,
                            status: attribute.status.as_ref(),
                            browsers: attribute.browsers,
                            references: attribute.references,
                        },
                        markdown,
                    )
                    .map(|value| html_documentation(markdown, value)),
                    insert_text_format: Some(InsertTextFormat::SNIPPET),
                    sort_text,
                    text_edit: Some(lsp_types::CompletionTextEdit::Edit(TextEdit {
                        range,
                        new_text,
                    })),
                    command: (!assigned && attribute.value_set.is_some_and(|set| set != "v")
                        || name == "style")
                        .then(|| lsp_types::Command {
                            title: "Suggest".to_string(),
                            command: "editor.action.triggerSuggest".to_string(),
                            arguments: None,
                        }),
                    ..CompletionItem::default()
                }
            })
            .collect(),
    }
}

fn tag_prefix(text: &str, offset: usize) -> Option<&str> {
    let before = text.get(..offset)?;
    let start = before.rfind('<')?;
    let prefix = &before[start + 1..];
    (!prefix.starts_with(['/', '!', '?'])
        && !prefix.contains('>')
        && !prefix.chars().any(char::is_whitespace))
    .then_some(prefix)
}

fn html_tag_completions(text: &str, offset: usize, prefix: &str, markdown: bool) -> CompletionList {
    // `collectOpenTagSuggestions` replaces the name already typed, so the
    // client is free to filter and every item carries the same range.
    let index = LineIndex::new(text);
    let range = lsp_types::Range::new(
        index.position(text, offset - prefix.len()),
        index.position(text, offset),
    );
    CompletionList {
        is_incomplete: false,
        items: provider::tags()
            .filter(|tag| tag.name.starts_with(prefix))
            .map(|tag| CompletionItem {
                label: tag.name.to_string(),
                // `collectOpenTagSuggestions` (`htmlCompletion.js:200-212`).
                kind: Some(CompletionItemKind::PROPERTY),
                documentation: html_data::documentation::documentation(
                    &html_data::documentation::Entry {
                        description: tag.description,
                        status: tag.status.as_ref(),
                        browsers: tag.browsers,
                        references: tag.references,
                    },
                    markdown,
                )
                .map(|value| html_documentation(markdown, value)),
                insert_text_format: Some(InsertTextFormat::PLAIN_TEXT),
                text_edit: Some(lsp_types::CompletionTextEdit::Edit(TextEdit {
                    range,
                    new_text: tag.name.to_string(),
                })),
                ..CompletionItem::default()
            })
            .collect(),
    }
}

/// The up-to-`WINDOW` characters in front of `offset`.
fn preceding(text: &str, offset: usize) -> &str {
    let before = text.get(..offset).unwrap_or(text);
    let start = before
        .char_indices()
        .nth_back(WINDOW - 1)
        .map_or(0, |(idx, _)| idx);
    &before[start..]
}

/// Whether the window ends in `{`, optional whitespace, a trigger character and
/// the word typed so far.
fn preceded_by_opening_brace(window: &str) -> bool {
    let bytes = window.as_bytes();
    let mut i = bytes.len();
    while i > 0 && is_word_byte(bytes[i - 1]) {
        i -= 1;
    }
    if i == 0 || !matches!(bytes[i - 1], b'#' | b':' | b'/' | b'@') {
        return false;
    }
    i -= 1;
    while i > 0 && bytes[i - 1].is_ascii_whitespace() {
        i -= 1;
    }
    i > 0 && bytes[i - 1] == b'{'
}

const fn is_word_byte(byte: u8) -> bool {
    byte.is_ascii_alphanumeric() || byte == b'_'
}

/// The trigger character nearest the cursor.
fn trigger_character(window: &str) -> Option<u8> {
    (*b"#/:@")
        .into_iter()
        .filter_map(|char| window.rfind(char as char).map(|idx| (idx, char)))
        .max_by_key(|&(idx, _)| idx)
        .map(|(_, char)| char)
}

/// One completion item, before it is turned into its LSP form.
struct TagItem {
    label: &'static str,
    tag: SvelteTag,
    /// The snippet that closes the block again, where there is one.
    insert_text: Option<&'static str>,
}

const AT_ITEMS: &[TagItem] = &[
    TagItem {
        label: "html",
        tag: SvelteTag::Html,
        insert_text: None,
    },
    TagItem {
        label: "debug",
        tag: SvelteTag::Debug,
        insert_text: None,
    },
    TagItem {
        label: "const",
        tag: SvelteTag::Const,
        insert_text: None,
    },
    TagItem {
        label: "render",
        tag: SvelteTag::Render,
        insert_text: None,
    },
    TagItem {
        label: "attach",
        tag: SvelteTag::Attach,
        insert_text: None,
    },
];

const HASH_ITEMS: &[TagItem] = &[
    TagItem {
        label: "if",
        tag: SvelteTag::If,
        insert_text: Some("if $1}\n\t$2\n{/if"),
    },
    TagItem {
        label: "each",
        tag: SvelteTag::Each,
        insert_text: Some("each $1 as $2}\n\t$3\n{/each"),
    },
    TagItem {
        label: "await :then",
        tag: SvelteTag::Await,
        insert_text: Some("await $1}\n\t$2\n{:then $3} \n\t$4\n{/await"),
    },
    TagItem {
        label: "await then",
        tag: SvelteTag::Await,
        insert_text: Some("await $1 then $2}\n\t$3\n{/await"),
    },
    TagItem {
        label: "key",
        tag: SvelteTag::Key,
        insert_text: Some("key $1}\n\t$2\n{/key"),
    },
    TagItem {
        label: "snippet",
        tag: SvelteTag::Snippet,
        insert_text: Some("snippet $1($2)}\n\t$3\n{/snippet"),
    },
];

const AWAIT_CONTINUATIONS: &[TagItem] = &[
    TagItem {
        label: "then",
        tag: SvelteTag::Await,
        insert_text: None,
    },
    TagItem {
        label: "catch",
        tag: SvelteTag::Await,
        insert_text: None,
    },
];

const EACH_CONTINUATIONS: &[TagItem] = &[TagItem {
    label: "else",
    tag: SvelteTag::Each,
    insert_text: None,
}];

const IF_CONTINUATIONS: &[TagItem] = &[
    TagItem {
        label: "else",
        tag: SvelteTag::If,
        insert_text: None,
    },
    TagItem {
        label: "else if",
        tag: SvelteTag::If,
        insert_text: None,
    },
];

const AWAIT_CLOSE: &[TagItem] = &[TagItem {
    label: "await",
    tag: SvelteTag::Await,
    insert_text: None,
}];

const EACH_CLOSE: &[TagItem] = &[TagItem {
    label: "each",
    tag: SvelteTag::Each,
    insert_text: None,
}];

const IF_CLOSE: &[TagItem] = &[TagItem {
    label: "if",
    tag: SvelteTag::If,
    insert_text: None,
}];

const KEY_CLOSE: &[TagItem] = &[TagItem {
    label: "key",
    tag: SvelteTag::Key,
    insert_text: None,
}];

const SNIPPET_CLOSE: &[TagItem] = &[TagItem {
    label: "snippet",
    tag: SvelteTag::Snippet,
    insert_text: None,
}];

/// `sortText` and `preselect` rank these above whatever else the client has to
/// offer inside a moustache.
fn tag_completions(items: &[TagItem]) -> CompletionList {
    CompletionList {
        is_incomplete: false,
        items: items
            .iter()
            .map(|item| CompletionItem {
                label: item.label.to_string(),
                kind: Some(CompletionItemKind::KEYWORD),
                insert_text: item.insert_text.map(str::to_string),
                insert_text_format: Some(InsertTextFormat::SNIPPET),
                sort_text: Some("-1".to_string()),
                preselect: Some(true),
                documentation: Some(markdown(item.tag.documentation().to_string())),
                ..CompletionItem::default()
            })
            .collect(),
    }
}

/// Every modifier that can still be added to `attribute`.
fn modifier_completions(attribute: &str) -> CompletionList {
    CompletionList {
        is_incomplete: false,
        items: MODIFIERS
            .iter()
            .filter(|modifier| {
                !attribute.contains(&format!("|{}", modifier.name))
                    && !modifier
                        .invalid_with
                        .iter()
                        .any(|invalid| attribute.contains(invalid))
            })
            .map(|modifier| CompletionItem {
                label: modifier.name.to_string(),
                kind: Some(CompletionItemKind::EVENT),
                documentation: Some(markdown(modifier.documentation())),
                ..CompletionItem::default()
            })
            .collect(),
    }
}

/// The `<!-- @component -->` doc comment, offered inside an HTML comment.
fn component_documentation(window: &str) -> Option<CompletionList> {
    let start = window.rfind(HTML_COMMENT_START)? + HTML_COMMENT_START.len();
    let typed = window[start..].trim_start();
    if !"@component".contains(typed) {
        return None;
    }
    Some(CompletionList {
        is_incomplete: false,
        items: vec![CompletionItem {
            label: "@component".to_string(),
            kind: Some(CompletionItemKind::SNIPPET),
            insert_text: Some("component\n$1\n".to_string()),
            insert_text_format: Some(InsertTextFormat::SNIPPET),
            filter_text: Some("component".to_string()),
            sort_text: Some("-1".to_string()),
            preselect: Some(true),
            documentation: Some(Documentation::String(
                "Documentation for this component. It will show up on hover. \
                 You can use markdown and code blocks here"
                    .to_string(),
            )),
            ..CompletionItem::default()
        }],
    })
}

/// `generateDocumentation` (`dataProvider.js:197-199`) spells the HTML data
/// tables' prose the way the client asked for it, while the Svelte plugin's own
/// tables (`getCompletions.ts:262`, `getModifierData.ts:52`) are always Markdown.
fn html_documentation(markdown_supported: bool, value: String) -> Documentation {
    Documentation::MarkupContent(MarkupContent {
        kind: if markdown_supported {
            MarkupKind::Markdown
        } else {
            MarkupKind::PlainText
        },
        value,
    })
}

const fn markdown(value: String) -> Documentation {
    Documentation::MarkupContent(MarkupContent {
        kind: MarkupKind::Markdown,
        value,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    /// The official test helper: complete at the end of `content`.
    fn labels(content: &str) -> Option<Vec<String>> {
        labels_at(content, content.len())
    }

    fn labels_at(content: &str, offset: usize) -> Option<Vec<String>> {
        completions(content, offset)
            .map(|list| list.items.into_iter().map(|item| item.label).collect())
    }

    /// `seenAttributes` keeps the first of a repeated name. The provider
    /// repeats ten on `div` and twelve on `input`, so an unported dedup shows
    /// up as items upstream does not send.
    #[test]
    fn a_repeated_attribute_name_is_offered_once() {
        for (source, provided) in [("<div ", 258), ("<input ", 298)] {
            let offered = labels(source).expect("attribute completions");
            let unique = offered.iter().collect::<std::collections::HashSet<_>>();
            assert_eq!(
                offered.len(),
                unique.len(),
                "{source} offers {} names, {} of them distinct",
                offered.len(),
                unique.len()
            );
            assert_eq!(
                crate::html_data::provider::attributes(source[1..].trim()).len(),
                provided,
                "the provider itself still repeats them"
            );
        }
    }

    fn all_modifiers() -> Vec<String> {
        MODIFIERS.iter().map(|m| m.name.to_string()).collect()
    }

    #[test]
    fn completes_native_html_and_svelte_tags() {
        assert!(labels("<sv").unwrap().contains(&"svelte:self".to_string()));
        assert_eq!(labels("<tex").unwrap(), ["textarea"]);
    }

    #[test]
    fn completes_svelte_directives_and_element_bindings() {
        assert!(
            labels("<div tra")
                .unwrap()
                .contains(&"transition:".to_string())
        );
        assert!(
            labels("<input bind:")
                .unwrap()
                .contains(&"bind:checked".to_string())
        );
        assert!(
            !labels("<img bind:")
                .unwrap()
                .contains(&"bind:checked".to_string())
        );
        assert!(
            labels("<a data-sveltekit-")
                .unwrap()
                .contains(&"data-sveltekit-preload-code".to_string())
        );
        assert!(
            labels("<video bind:")
                .unwrap()
                .contains(&"bind:duration".to_string())
        );
        assert!(
            labels("<script gen")
                .unwrap()
                .contains(&"generics".to_string())
        );
    }

    #[test]
    fn completes_embedded_language_values() {
        assert!(
            labels("<script lang=\"")
                .unwrap()
                .contains(&"ts".to_string())
        );
        assert!(
            labels("<style lang=\"")
                .unwrap()
                .contains(&"scss".to_string())
        );
    }

    #[test]
    fn nothing_inside_style_or_script() {
        assert!(
            labels_at("<style>h1{color:blue;}</style><p>test</p>", 10)
                .unwrap()
                .contains(&"color".to_string())
        );
        assert_eq!(
            labels_at("<script>const a = true</script><p>test</p>", 10),
            None
        );
    }

    #[test]
    fn nothing_without_a_moustache_in_front() {
        assert_eq!(labels("{nope"), None);
        assert_eq!(labels("not really"), None);
        assert_eq!(labels("{#awa."), None);
    }

    #[test]
    fn hash_offers_every_block() {
        assert_eq!(
            labels("{#").unwrap(),
            ["if", "each", "await :then", "await then", "key", "snippet"]
        );
    }

    #[test]
    fn at_offers_every_tag() {
        assert_eq!(
            labels("{@").unwrap(),
            ["html", "debug", "const", "render", "attach"]
        );
    }

    #[test]
    fn a_block_snippet_closes_itself() {
        let items = completions("{#", 2).unwrap().items;
        let each = items.iter().find(|i| i.label == "each").unwrap();
        assert_eq!(
            each.insert_text.as_deref(),
            Some("each $1 as $2}\n\t$3\n{/each")
        );
        assert_eq!(each.insert_text_format, Some(InsertTextFormat::SNIPPET));
        assert_eq!(each.kind, Some(CompletionItemKind::KEYWORD));
        assert_eq!(each.sort_text.as_deref(), Some("-1"));
        assert_eq!(each.preselect, Some(true));
        assert_eq!(
            items
                .iter()
                .find(|i| i.label == "await :then")
                .unwrap()
                .insert_text
                .as_deref(),
            Some("await $1}\n\t$2\n{:then $3} \n\t$4\n{/await")
        );
        assert_eq!(
            items
                .iter()
                .find(|i| i.label == "snippet")
                .unwrap()
                .insert_text
                .as_deref(),
            Some("snippet $1($2)}\n\t$3\n{/snippet")
        );
    }

    #[test]
    fn a_tag_completion_carries_its_documentation() {
        let items = completions("{@", 2).unwrap().items;
        let html = items.iter().find(|i| i.label == "html").unwrap();
        let Some(Documentation::MarkupContent(content)) = &html.documentation else {
            panic!("expected markdown documentation");
        };
        assert_eq!(content.kind, MarkupKind::Markdown);
        assert_eq!(content.value, SvelteTag::Html.documentation());
        assert!(content.value.starts_with("`{@html ...}`\\\n"));
    }

    /// `generateDocumentation` (`dataProvider.js:197-199`) reads the client's
    /// `documentationFormat`; `getCompletions.ts:262` and `getModifierData.ts:52`
    /// do not, so the two families must answer this differently.
    #[test]
    fn only_the_html_tables_follow_the_client_documentation_format() {
        let kind = |source: &str, offset: usize, label: &str, markdown: bool| {
            let items = completions_with_strict_mode(source, offset, false, markdown)
                .unwrap()
                .items;
            let item = items.iter().find(|i| i.label == label).unwrap();
            let Some(Documentation::MarkupContent(content)) = &item.documentation else {
                panic!("{label} carried no markup documentation");
            };
            content.kind.clone()
        };
        for markdown in [true, false] {
            let expected = if markdown {
                MarkupKind::Markdown
            } else {
                MarkupKind::PlainText
            };
            assert_eq!(kind("<div ", 5, "class", markdown), expected);
            assert_eq!(kind("<di", 3, "div", markdown), expected);
            // The Svelte plugin's own tables are Markdown either way.
            assert_eq!(kind("{@", 2, "html", markdown), MarkupKind::Markdown);
            assert_eq!(
                kind("<div on:click|", 14, "once", markdown),
                MarkupKind::Markdown
            );
        }
    }

    #[test]
    fn a_continuation_needs_an_open_block() {
        assert_eq!(labels("{:"), None);
        assert_eq!(labels("{#if}{/if}{:"), None);
        assert_eq!(labels("{/"), None);
        assert_eq!(labels("{#if}{/if}{/"), None);
        assert_eq!(labels("{#if}{ /if}{/"), None);
    }

    #[test]
    fn continuations_follow_the_open_block() {
        assert_eq!(labels("{#if}{:").unwrap(), ["else", "else if"]);
        assert_eq!(labels("{#each}{:").unwrap(), ["else"]);
        assert_eq!(labels("{#await}{:").unwrap(), ["then", "catch"]);
        assert_eq!(
            labels("{#if}{/if}{#if}{#await}{:").unwrap(),
            ["then", "catch"]
        );
    }

    #[test]
    fn closings_follow_the_open_block() {
        assert_eq!(labels("{#if}{/").unwrap(), ["if"]);
        assert_eq!(labels("{#each}{/").unwrap(), ["each"]);
        assert_eq!(labels("{#await}{/").unwrap(), ["await"]);
        assert_eq!(labels("{#key}{/").unwrap(), ["key"]);
        assert_eq!(labels("{#snippet example()}{/").unwrap(), ["snippet"]);
        assert_eq!(labels("{#if}{/if}{#if}{#await}{/").unwrap(), ["await"]);
    }

    #[test]
    fn the_component_doc_comment_is_offered() {
        let items = completions("<!--@", 5).unwrap().items;
        assert_eq!(items[0].label, "@component");
        assert_eq!(items[0].insert_text.as_deref(), Some("component\n$1\n"));
        assert_eq!(items[0].filter_text.as_deref(), Some("component"));
        assert_eq!(items[0].kind, Some(CompletionItemKind::SNIPPET));
        assert_eq!(items[0].insert_text_format, Some(InsertTextFormat::SNIPPET));
        // Also on the bare comment, and once the word is being typed.
        assert_eq!(labels("<!--").unwrap(), ["@component"]);
        assert_eq!(labels("<!-- @comp").unwrap(), ["@component"]);
        assert_eq!(labels("<!--nope"), None);
    }

    fn modifier_labels(content: &str) -> Vec<String> {
        let offset = content.rfind('|').unwrap() + 1;
        labels_at(content, offset).unwrap()
    }

    #[test]
    fn every_modifier_is_offered_on_a_bare_pipe() {
        assert_eq!(modifier_labels("<div on:click| />"), all_modifiers());
    }

    #[test]
    fn a_modifier_already_present_is_not_offered_again() {
        let expected: Vec<String> = all_modifiers()
            .into_iter()
            .filter(|m| m != "stopPropagation")
            .collect();
        assert_eq!(
            modifier_labels("<div on:click|stopPropagation| />"),
            expected
        );
    }

    #[test]
    fn modifiers_that_conflict_with_one_in_use_are_dropped() {
        let expected: Vec<String> = MODIFIERS
            .iter()
            .filter(|m| m.name != "preventDefault" && !m.invalid_with.contains(&"preventDefault"))
            .map(|m| m.name.to_string())
            .collect();
        assert_eq!(
            expected,
            [
                "stopPropagation",
                "nonpassive",
                "capture",
                "once",
                "self",
                "trusted"
            ]
        );
        assert_eq!(
            modifier_labels("<div on:click|preventDefault| />"),
            expected
        );
    }

    #[test]
    fn a_modifier_completion_carries_its_documentation() {
        let items = completions("<div on:click| />", 14).unwrap().items;
        let once = items.iter().find(|i| i.label == "once").unwrap();
        assert_eq!(once.kind, Some(CompletionItemKind::EVENT));
        let Some(Documentation::MarkupContent(content)) = &once.documentation else {
            panic!("expected markdown documentation");
        };
        assert!(content.value.starts_with("`once` event modifier"));
    }

    #[test]
    fn a_component_gets_no_modifiers() {
        assert_eq!(labels_at("<Widget on:click| />", 17), None);
    }

    #[test]
    fn a_moustache_inside_a_script_body_is_left_alone() {
        let text = "<script>\n  const a = `{#`;\n</script>";
        assert_eq!(labels_at(text, text.find("{#").unwrap() + 2), None);
    }

    #[test]
    fn a_script_body_gets_no_css_completions() {
        let text = "<script>\n  const a = 'style=\"colo';\n</script>";
        assert_eq!(labels_at(text, text.find("colo").unwrap() + 4), None);
    }

    #[test]
    fn a_style_body_is_still_answered_from_css() {
        let text = "<style>\n  h1 { colo }\n</style>";
        assert!(labels_at(text, text.find("colo").unwrap() + 4).is_some());
    }

    #[test]
    fn completion_works_after_astral_text() {
        let text = "<p>💡</p>{#";
        assert_eq!(labels_at(text, text.len()).unwrap()[0], "if");
    }

    fn item(content: &str, offset: usize, label: &str) -> CompletionItem {
        completions(content, offset)
            .unwrap()
            .items
            .into_iter()
            .find(|item| item.label == label)
            .unwrap()
    }

    fn new_text(item: &CompletionItem) -> &str {
        match item.text_edit.as_ref().unwrap() {
            lsp_types::CompletionTextEdit::Edit(edit) => &edit.new_text,
            lsp_types::CompletionTextEdit::InsertAndReplace(_) => unreachable!(),
        }
    }

    /// `htmlCompletion.js` narrows by the replace range, not by filtering, so a
    /// name that shares no prefix with what is typed is still offered.
    #[test]
    fn an_attribute_list_is_not_filtered_by_what_is_typed() {
        let text = "<div zz></div>";
        let offset = text.find("zz").unwrap() + 2;
        assert!(labels_at(text, offset).unwrap().contains(&"id".to_string()));
        let edit = match item(text, offset, "id").text_edit.unwrap() {
            lsp_types::CompletionTextEdit::Edit(edit) => edit,
            lsp_types::CompletionTextEdit::InsertAndReplace(_) => unreachable!(),
        };
        assert_eq!(edit.range.start.character, 5);
        assert_eq!(edit.range.end.character, 7);
        assert_eq!(edit.new_text, "id=\"$1\"");
    }

    #[test]
    fn a_name_already_followed_by_equals_gets_no_value_snippet() {
        let text = "<div i=\"a\"></div>";
        assert_eq!(
            new_text(&item(text, text.find(" i=").unwrap() + 2, "id")),
            "id"
        );
    }

    #[test]
    fn the_snippet_shape_follows_the_attribute_kind() {
        let text = "<div  ></div>";
        let offset = text.find('>').unwrap() - 1;
        assert_eq!(new_text(&item(text, offset, "transition:")), "transition:");
        assert_eq!(
            item(text, offset, "transition:").kind,
            Some(CompletionItemKind::KEYWORD)
        );
        assert_eq!(new_text(&item(text, offset, "on:click")), "on:click$2={$1}");
        assert_eq!(
            item(text, offset, "on:click").sort_text.as_deref(),
            Some("zon:click")
        );
        assert_eq!(new_text(&item(text, offset, "bind:this")), "bind:this={$1}");
        assert_eq!(
            item(text, offset, "id").kind,
            Some(CompletionItemKind::VALUE)
        );
    }

    /// `shouldExcludeCompletion` (`CSSPlugin.ts:585-593`).
    #[test]
    fn a_stylus_block_is_not_answered_from_css() {
        let body = |lang: &str| format!("<style lang=\"{lang}\">\n  h1\n    colo\n</style>");
        for lang in ["stylus", "styl"] {
            let text = body(lang);
            assert_eq!(labels_at(&text, text.find("colo").unwrap() + 4), None);
        }
        let text = body("text/stylus");
        assert_eq!(labels_at(&text, text.find("colo").unwrap() + 4), None);
        // The positive control: a language upstream does not exclude answers.
        let text = body("scss");
        assert!(labels_at(&text, text.find("colo").unwrap() + 4).is_some());
    }

    /// `HTMLPlugin.ts:188-191`: a component's start tag gets no HTML attributes.
    #[test]
    fn a_component_start_tag_gets_no_html_attributes() {
        assert_eq!(labels_at("<Foo cl></Foo>", 7), None);
        assert_eq!(labels_at("<Foo ></Foo>", 5), None);
        // Svelte 5 spells a namespaced component with a dot.
        assert_eq!(labels_at("<a.b cl></a.b>", 7), None);
        // The positive control: the same slot on an element does answer.
        assert!(
            labels_at("<div cl></div>", 7)
                .unwrap()
                .contains(&"class".to_string())
        );
    }
}
