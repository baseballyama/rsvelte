//! `selectorPrinting.js` — the element tree and specificity an official CSS
//! selector hover answers with.
//!
//! The pseudo-element/pseudo-class split is a CSS **data** lookup
//! (`isPseudoElementIdentifier`: `/^::?([\w-]+)/` then `getPseudoElement('::' + name)`),
//! not a colon count, so a `PseudoClassSelector` named `before` scores as a
//! pseudo-element and the node type is not the classification.

use serde_json::Value;

use crate::css_data::web;

const SPECIFICITY_LINK: &str =
    "[Selector Specificity](https://developer.mozilla.org/docs/Web/CSS/Specificity)";

#[derive(Default, Clone, Copy, PartialEq, Eq, Debug)]
pub struct Specificity {
    pub id: u32,
    pub attr: u32,
    pub tag: u32,
}

impl Specificity {
    fn add(&mut self, other: Self) {
        self.id += other.id;
        self.attr += other.attr;
        self.tag += other.tag;
    }

    /// `calculateMostSpecificListItem` compares id, then attr, then tag.
    fn key(self) -> (u32, u32, u32) {
        (self.id, self.attr, self.tag)
    }
}

fn field<'a>(node: &'a Value, name: &str) -> Option<&'a Value> {
    node.get(name).filter(|value| !value.is_null())
}

fn name_of(node: &Value) -> &str {
    node.get("name").and_then(Value::as_str).unwrap_or("")
}

fn type_of(node: &Value) -> &str {
    node.get("type").and_then(Value::as_str).unwrap_or("")
}

/// `CSSDataManager.getPseudoElement('::' + name)`. The vendored set spells its
/// entries with both colons and carries no parenthesised form, so the lookup is
/// exact rather than a prefix match.
fn is_pseudo_element_name(name: &str) -> bool {
    let with_colons = format!("::{name}");
    web::PSEUDO_ELEMENTS
        .iter()
        .any(|entry| entry.name == with_colons)
}

/// The text upstream's `PseudoSelector.getText()` yields for the attribute name:
/// the colons and the identifier, never the functional argument.
fn pseudo_text(node: &Value) -> String {
    if type_of(node) == "PseudoElementSelector" {
        format!("::{}", name_of(node))
    } else {
        format!(":{}", name_of(node))
    }
}

fn unquote(value: &str) -> &str {
    let bytes = value.as_bytes();
    if bytes.len() >= 2
        && matches!(bytes[0], b'"' | b'\'')
        && matches!(bytes[bytes.len() - 1], b'"' | b'\'')
    {
        &value[1..value.len() - 1]
    } else {
        value
    }
}

/// `toElement`'s `AttributeSelector` arm: the matcher decides how the value is
/// rendered, and `…` stands for the unconstrained part.
fn attribute_value(node: &Value) -> Option<String> {
    let raw = field(node, "value").and_then(Value::as_str)?;
    let matcher = field(node, "matcher").and_then(Value::as_str)?;
    let value = unquote(raw);
    Some(match matcher {
        "|=" => format!("{value}-\u{2026}"),
        "^=" => format!("{value}\u{2026}"),
        "$=" => format!("\u{2026}{value}"),
        "~=" => format!(" \u{2026} {value} \u{2026} "),
        "*=" => format!("\u{2026}{value}\u{2026}"),
        _ => value.to_string(),
    })
}

/// `Element.addAttr` merges a repeated name by joining with a space, which is
/// what renders `.a.b` as `class="a b"` rather than as two attributes.
fn add_attr(attributes: &mut Vec<(String, String)>, name: &str, value: &str) {
    if let Some(existing) = attributes.iter_mut().find(|(key, _)| key == name) {
        existing.1.push(' ');
        existing.1.push_str(value);
        return;
    }
    attributes.push((name.to_string(), value.to_string()));
}

/// One `RelativeSelector`'s simple selectors, rendered as `toElement` +
/// `doPrintElement` would render them.
fn render_element(relative: &Value) -> String {
    let mut name: Option<String> = None;
    let mut attributes: Vec<(String, String)> = Vec::new();

    for selector in field(relative, "selectors")
        .and_then(Value::as_array)
        .map(Vec::as_slice)
        .unwrap_or_default()
    {
        match type_of(selector) {
            "TypeSelector" => {
                let text = name_of(selector);
                name = Some(if text == "*" { "element" } else { text }.to_string());
            }
            "ClassSelector" => add_attr(&mut attributes, "class", name_of(selector)),
            "IdSelector" => add_attr(&mut attributes, "id", name_of(selector)),
            "PseudoClassSelector" | "PseudoElementSelector" => {
                add_attr(&mut attributes, &pseudo_text(selector), "");
            }
            "AttributeSelector" => {
                let value = attribute_value(selector).unwrap_or_default();
                add_attr(&mut attributes, name_of(selector), &value);
            }
            _ => {}
        }
    }

    let mut out = String::from("<");
    out.push_str(name.as_deref().unwrap_or("element"));
    for (key, value) in &attributes {
        out.push(' ');
        out.push_str(key);
        if !value.is_empty() {
            out.push('=');
            out.push('"');
            out.push_str(unquote(value));
            out.push('"');
        }
    }
    out.push('>');
    out
}

/// `SelectorElementBuilder.processSelector`, for the linear chain a Svelte
/// `ComplexSelector` always is. A descendant combinator inserts a `…` label
/// and descends two levels; `+` and `~` step back to the parent, and `~` adds a
/// `⋮` before the sibling.
fn complex_lines(complex: &Value) -> Vec<(usize, String)> {
    let mut lines: Vec<(usize, String)> = Vec::new();
    let mut depth = 0usize;

    for relative in field(complex, "children")
        .and_then(Value::as_array)
        .map(Vec::as_slice)
        .unwrap_or_default()
    {
        let text = render_element(relative);
        let combinator = field(relative, "combinator").map(|node| name_of(node).to_string());
        match combinator.as_deref() {
            None => {
                depth = 0;
                lines.push((0, text));
            }
            Some(">") => {
                depth += 1;
                lines.push((depth, text));
            }
            Some("+") => lines.push((depth, text)),
            Some("~") => {
                lines.push((depth, "\u{22EE}".to_string()));
                lines.push((depth, text));
            }
            // Descendant, and anything a newer grammar adds: upstream's default
            // is the label-and-descend path.
            Some(_) => {
                lines.push((depth + 1, "\u{2026}".to_string()));
                depth += 2;
                lines.push((depth, text));
            }
        }
    }
    lines
}

fn most_specific(complexes: &[Value]) -> Specificity {
    let mut best = Specificity::default();
    for complex in complexes {
        let item = score_complex(complex);
        if item.key() > best.key() {
            best = item;
        }
    }
    best
}

/// The `SelectorList` a functional pseudo carries, as a slice of `ComplexSelector`.
fn args_complexes(selector: &Value) -> Vec<Value> {
    field(selector, "args")
        .and_then(|args| field(args, "children"))
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default()
}

/// `calculateScore`, over one `ComplexSelector`.
pub fn score_complex(complex: &Value) -> Specificity {
    let mut total = Specificity::default();
    for relative in field(complex, "children")
        .and_then(Value::as_array)
        .map(Vec::as_slice)
        .unwrap_or_default()
    {
        for selector in field(relative, "selectors")
            .and_then(Value::as_array)
            .map(Vec::as_slice)
            .unwrap_or_default()
        {
            match type_of(selector) {
                "IdSelector" => total.id += 1,
                "ClassSelector" | "AttributeSelector" => total.attr += 1,
                // The universal selector is ignored.
                "TypeSelector" if name_of(selector) != "*" => total.tag += 1,
                "PseudoClassSelector" | "PseudoElementSelector" => {
                    total.add(score_pseudo(selector));
                }
                _ => {}
            }
        }
    }
    total
}

fn score_pseudo(selector: &Value) -> Specificity {
    let mut score = Specificity::default();
    let name = name_of(selector);
    let lower = name.to_ascii_lowercase();
    let children = args_complexes(selector);

    if is_pseudo_element_name(name) {
        score.tag += 1;
        // `::slotted()` is a pseudo-element plus the specificity of its argument.
        if lower == "slotted" && !children.is_empty() {
            score.add(most_specific(&children));
        }
        return score;
    }
    // `:where()` contributes nothing at all.
    if lower == "where" {
        return score;
    }
    if matches!(lower.as_str(), "not" | "has" | "is") && !children.is_empty() {
        score.add(most_specific(&children));
        return score;
    }
    if matches!(lower.as_str(), "host" | "host-context") && !children.is_empty() {
        score.attr += 1;
        score.add(most_specific(&children));
        return score;
    }
    if matches!(lower.as_str(), "nth-child" | "nth-last-child") {
        // A pseudo-class, plus the most specific complex selector in `of S`.
        score.attr += 1;
        score.add(most_specific(&children));
        return score;
    }
    // Any other pseudo-class, which is the branch `:global` takes.
    score.attr += 1;
    score
}

/// `selectorToMarkedString`: the `html` element tree, and the specificity line.
#[must_use]
pub fn selector_marked_strings(complex: &Value) -> (String, String) {
    let tree = complex_lines(complex)
        .into_iter()
        .map(|(depth, text)| format!("{}{text}", "  ".repeat(depth)))
        .collect::<Vec<_>>()
        .join("\n");
    let score = score_complex(complex);
    let specificity = format!(
        "{SPECIFICITY_LINK}: ({}, {}, {})",
        score.id, score.attr, score.tag
    );
    (tree, specificity)
}

#[cfg(test)]
mod tests {
    use super::*;

    /// The first `ComplexSelector` of the first rule in a `<style>` block.
    fn complex(selector_text: &str) -> Value {
        let source = format!("<style>{selector_text} {{ color: red }}</style>");
        let allocator = rsvelte_core::Allocator::default();
        let root = rsvelte_core::parse(
            &source,
            &allocator,
            rsvelte_core::ParseOptions {
                skip_expression_loc: true,
                lenient_script: true,
                ..rsvelte_core::ParseOptions::default()
            },
        )
        .expect("parses");
        // `root.css` is a typed `StyleSheet`; only its `children` are JSON.
        let css = root.css.as_deref().expect("has a <style>");
        let rule = css.children.first().expect("one rule");
        rule.get("prelude")
            .and_then(|prelude| prelude.get("children"))
            .and_then(Value::as_array)
            .and_then(|children| children.first())
            .cloned()
            .expect("one complex selector")
    }

    fn answer(selector_text: &str) -> (String, String) {
        selector_marked_strings(&complex(selector_text))
    }

    fn spec(selector_text: &str) -> String {
        answer(selector_text).1
    }

    fn tree(selector_text: &str) -> String {
        answer(selector_text).0
    }

    /// Every expected value here was generated by driving
    /// `vscode-css-languageservice@6.3.5`'s `doHover` and printing the raw
    /// `contents` structure — not inferred from a handful of outputs, and not
    /// read through a stringification (the `language: "html"` field of the
    /// MarkedString is metadata, and reads as an `<html>` element if it is).
    fn link(id: u32, attr: u32, tag: u32) -> String {
        format!("{SPECIFICITY_LINK}: ({id}, {attr}, {tag})")
    }

    #[test]
    fn trees_match_the_oracle() {
        assert_eq!(tree("a:hover"), "<a :hover>");
        assert_eq!(tree("p::before"), "<p ::before>");
        assert_eq!(tree(":global(.x)"), "<element :global>");
        assert_eq!(tree(".box:not(.y)"), r#"<element class="box" :not>"#);
        assert_eq!(tree(".a:where(.b)"), r#"<element class="a" :where>"#);
        assert_eq!(tree("*"), "<element>");
        assert_eq!(tree("*.multi"), r#"<element class="multi">"#);
    }

    #[test]
    fn add_attr_merges_a_repeated_name_with_a_space() {
        assert_eq!(tree(".a.b"), r#"<element class="a b">"#);
        assert_eq!(tree("#i.c"), r#"<element id="i" class="c">"#);
        assert_eq!(
            tree(".a:hover:focus"),
            r#"<element class="a" :hover :focus>"#
        );
    }

    #[test]
    fn combinators_place_the_child_at_the_oracle_s_depth() {
        assert_eq!(
            tree(".box span"),
            "<element class=\"box\">\n  \u{2026}\n    <span>"
        );
        assert_eq!(tree("a > b"), "<a>\n  <b>");
        // `+` steps back to the parent, so the sibling sits at the same depth.
        assert_eq!(tree("a + b"), "<a>\n<b>");
        assert_eq!(tree("a ~ b"), "<a>\n\u{22EE}\n<b>");
    }

    #[test]
    fn attribute_matchers_render_their_unconstrained_part() {
        assert_eq!(tree("[href]"), "<element href>");
        assert_eq!(tree(r#"[href^="x"]"#), "<element href=\"x\u{2026}\">");
    }

    #[test]
    fn specificity_matches_the_oracle() {
        assert_eq!(spec("a:hover"), link(0, 1, 1));
        assert_eq!(spec("p::before"), link(0, 0, 2));
        assert_eq!(spec(":global(.x)"), link(0, 1, 0));
        assert_eq!(spec(".box span"), link(0, 1, 1));
        assert_eq!(spec(".box:not(.y)"), link(0, 2, 0));
        assert_eq!(spec(".a.b"), link(0, 2, 0));
        assert_eq!(spec("#i.c"), link(1, 1, 0));
        assert_eq!(spec("a > b"), link(0, 0, 2));
        assert_eq!(spec("[href]"), link(0, 1, 0));
        assert_eq!(spec(".a:hover:focus"), link(0, 3, 0));
        assert_eq!(spec("li:nth-child(2n)"), link(0, 1, 1));
    }

    /// The universal selector is ignored, so it contributes no tag.
    #[test]
    fn the_universal_selector_scores_nothing() {
        assert_eq!(spec("*"), link(0, 0, 0));
        assert_eq!(spec("*.multi"), link(0, 1, 0));
    }

    /// `:where` contributes nothing; `:is` contributes its most specific child.
    /// These are the two branches backing the rule out of a table of answers
    /// gets wrong, because `:global` and `:not` agree under either rule.
    #[test]
    fn functional_pseudo_classes_take_their_own_branches() {
        assert_eq!(spec(".a:where(.b)"), link(0, 1, 0));
        assert_eq!(spec(".a:is(.b, #c)"), link(1, 1, 0));
    }

    /// The single-colon legacy spelling is a pseudo-ELEMENT, because
    /// `isPseudoElementIdentifier` asks the CSS data rather than counting
    /// colons — and rsvelte parses it as a `PseudoClassSelector`, so the node
    /// type is not the classification. No other cell here discriminates this.
    #[test]
    fn a_single_colon_pseudo_element_scores_as_an_element() {
        assert_eq!(spec("p:before"), link(0, 0, 2));
        assert_eq!(spec("p::before"), link(0, 0, 2));
        assert_eq!(tree("p:before"), "<p :before>");
        // Control: a real pseudo-class at the same position scores attr.
        assert_eq!(spec("p:hover"), link(0, 1, 1));
    }
}
