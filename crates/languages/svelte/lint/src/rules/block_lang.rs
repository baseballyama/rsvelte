use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::finding::{Fix, Suggestion};
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_svelte::syntax::syntax_tree::TagAttributes;
use serde::Deserialize;

use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/block-lang",
    files: Files::Components,
    configure,
};

#[derive(Default, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Options {
    #[serde(default)]
    enforce_script_present: bool,
    #[serde(default)]
    enforce_style_present: bool,
    #[serde(default)]
    script: Langs,
    #[serde(default)]
    style: Langs,
}

/// One language or a non-empty list; `None` is the omitted `lang`.
#[derive(Deserialize)]
#[serde(untagged)]
enum Langs {
    One(Option<String>),
    Many(Vec<Option<String>>),
}

impl Default for Langs {
    fn default() -> Self {
        Self::One(None)
    }
}

impl Langs {
    fn into_list(self) -> Result<Vec<Option<String>>, String> {
        match self {
            Self::One(lang) => Ok(vec![lang]),
            Self::Many(list) if list.is_empty() => Err("a language list is empty".to_owned()),
            Self::Many(list) => Ok(list),
        }
    }
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    let options: Options = options.single()?;
    Ok(Box::new(BlockLang {
        script: Block {
            tag: "script",
            enforce_present: options.enforce_script_present,
            allowed: options.script.into_list()?,
        },
        style: Block {
            tag: "style",
            enforce_present: options.enforce_style_present,
            allowed: options.style.into_list()?,
        },
    }))
}

#[derive(Debug)]
struct BlockLang {
    script: Block,
    style: Block,
}

#[derive(Debug)]
struct Block {
    tag: &'static str,
    enforce_present: bool,
    allowed: Vec<Option<String>>,
}

impl SvelteRule for BlockLang {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        let component = file.component().expect("a component rule");
        let source = file.source();
        let mut scripts: Vec<_> = [&component.module, &component.instance]
            .into_iter()
            .flatten()
            .map(|script| (script.span, script.attributes.as_slice()))
            .collect();
        scripts.sort_by_key(|(span, _)| span.start_offset);
        self.script.check(source, &scripts, reporter);
        let styles: Vec<_> = component
            .style
            .iter()
            .map(|style| (style.span, style.attributes.as_slice()))
            .collect();
        self.style.check(source, &styles, reporter);
    }
}

impl Block {
    fn named(&self) -> impl Iterator<Item = &str> {
        self.allowed
            .iter()
            .filter_map(|lang| lang.as_deref().filter(|lang| !lang.is_empty()))
    }

    fn check(
        &self,
        source: &str,
        blocks: &[(Span, &[TagAttributes])],
        reporter: &mut Reporter<'_>,
    ) {
        let tag = self.tag;
        let langs = self.pretty();
        if blocks.is_empty() && self.enforce_present {
            let at = if tag == "script" {
                0
            } else {
                source.len() as u32
            };
            let mut report = Report::point(
                format!(
                    "The <{tag}> block should be present and its lang attribute should be {langs}."
                ),
                // `ESLint`'s `{ line: 1, column: 1 }`: the second character of the first line.
                source.find(['\n', '\r']).unwrap_or(source.len()).min(1) as u32,
            );
            for lang in self.named() {
                report = report.suggest(Suggestion {
                    message_id: None,
                    message: format!(
                        "Add a lang attribute to a <{tag}> block with the value \"{lang}\"."
                    ),
                    fix: Fix::insert(at, format!("<{tag} lang=\"{lang}\">\n</{tag}>\n\n")),
                });
            }
            reporter.report(report);
        }
        for &(span, attributes) in blocks {
            let lang = attributes
                .iter()
                .find(|(name, _)| name.text(source) == "lang");
            let value = lang.map(|(_, value)| value.map_or("", |v| v.text(source)));
            let lower = value.map(str::to_lowercase);
            if self.allowed.contains(&lower) {
                continue;
            }
            let mut report = Report::range(
                format!("The lang attribute of the <{tag}> block should be {langs}."),
                span,
            );
            for suggestion in self.replacements(span, lang) {
                report = report.suggest(suggestion);
            }
            reporter.report(report);
        }
    }

    fn replacements(&self, block: Span, lang: Option<&TagAttributes>) -> Vec<Suggestion> {
        let tag = self.tag;
        let attribute = lang.map(|&(name, value)| {
            // A quoted value starts after `="` and its span leaves out the closing quote.
            let end = value.map_or(name.end_offset, |v| {
                v.end_offset + u32::from(v.start_offset > name.end_offset + 1)
            });
            Span::new(name.start_offset, end)
        });
        if self.named().next().is_none() && self.allowed.contains(&None) {
            return attribute
                .map(|attribute| Suggestion {
                    message_id: None,
                    message: format!("Replace a <{tag}> block with the lang attribute omitted."),
                    fix: Fix::remove(Span::new(attribute.start_offset - 1, attribute.end_offset)),
                })
                .into_iter()
                .collect();
        }
        self.named()
            .map(|lang| {
                let (message, fix) = attribute.map_or_else(
                    || {
                        (
                            format!(
                                "Add lang attribute to a <{tag}> block with the value \"{lang}\"."
                            ),
                            Fix::insert(
                                block.start_offset + 1 + tag.len() as u32,
                                format!(" lang=\"{lang}\""),
                            ),
                        )
                    },
                    |attribute| {
                        (
                            format!(
                                "Replace a <{tag}> block with the lang attribute set to \"{lang}\"."
                            ),
                            Fix::replace(attribute, format!("lang=\"{lang}\"")),
                        )
                    },
                );
                Suggestion {
                    message_id: None,
                    message,
                    fix,
                }
            })
            .collect()
    }

    /// `prettyPrintLangs`.
    fn pretty(&self) -> String {
        let named: Vec<String> = self
            .allowed
            .iter()
            .flatten()
            .map(|lang| format!("\"{lang}\""))
            .collect();
        let either = if self.allowed.contains(&None) {
            "either omitted or "
        } else {
            ""
        };
        match named.as_slice() {
            [] => "omitted".to_owned(),
            [one] => format!("{either}{one}"),
            _ => format!("{either}one of {}", named.join(", ")),
        }
    }
}
