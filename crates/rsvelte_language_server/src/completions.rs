//! `textDocument/completion` for Svelte template tags and event modifiers.
//!
//! A port of the official language server's
//! `plugins/svelte/features/getCompletions.ts`.

use lsp_types::{
    CompletionItem, CompletionItemKind, CompletionList, Documentation, InsertTextFormat,
    MarkupContent, MarkupKind,
};

use crate::context::{EmbeddedRegions, attribute_context};
use crate::modifiers::MODIFIERS;
use crate::tags::{SvelteTag, latest_opening_tag};

/// The characters that put the client in a position to want these items.
pub const TRIGGER_CHARACTERS: [&str; 5] = ["#", "@", ":", "/", "|"];

const HTML_COMMENT_START: &str = "<!--";

/// The window the official plugin looks back over — enough for every realistic
/// case, and short enough that a stray `{` far away cannot open a moustache.
const WINDOW: usize = 10;

#[must_use]
pub fn completions(text: &str, offset: usize) -> Option<CompletionList> {
    if EmbeddedRegions::new(text).contains(offset) {
        return None;
    }
    let before = preceding(text, offset);

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
        if !attribute.can_have_event_modifier() {
            return None;
        }
        return Some(modifier_completions(attribute.name));
    }

    component_documentation(before)
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

    fn all_modifiers() -> Vec<String> {
        MODIFIERS.iter().map(|m| m.name.to_string()).collect()
    }

    #[test]
    fn nothing_inside_style_or_script() {
        assert_eq!(
            labels_at("<style>h1{color:blue;}</style><p>test</p>", 10),
            None
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
    fn completion_works_after_astral_text() {
        let text = "<p>💡</p>{#";
        assert_eq!(labels_at(text, text.len()).unwrap()[0], "if");
    }
}
