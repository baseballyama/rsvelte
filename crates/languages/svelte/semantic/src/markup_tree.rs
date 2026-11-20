//! Upstream `html-tree-validation`: where the HTML parser would repair the tree a template writes.

use rsvelte_svelte_syntax::parse::{AUTOCLOSING_CHILDREN, Autoclosing};

/// Upstream `disallowed_children`, keyed by the parent or ancestor tag.
#[derive(Clone, Copy, Debug)]
pub enum Rule {
    /// Not allowed as a direct child.
    Direct(&'static [&'static str]),
    /// Not allowed at any depth, unless an element of the second list lies between.
    Descendant(&'static [&'static str], &'static [&'static str]),
    /// The only children allowed.
    Only(&'static [&'static str]),
}

impl Rule {
    /// Whether `tag`, lying between this rule's element and a descendant, allows that descendant
    /// again.
    #[must_use]
    pub fn reset_by(self, tag: &str) -> bool {
        matches!(self, Self::Descendant(_, reset_by)
            if !reset_by.is_empty() && (tag.contains('-') || reset_by.contains(&tag)))
    }

    /// Why `child` cannot sit at any depth below `ancestor`, whose rule this is.
    #[must_use]
    pub fn invalid_descendant(self, child: &str, ancestor: &str) -> Option<String> {
        match self {
            Self::Descendant(tags, _) if !child.contains('-') && tags.contains(&child) => Some(
                format!("`<{child}>` cannot be a descendant of `<{ancestor}>`"),
            ),
            _ => None,
        }
    }
}

const HEADINGS: &[&str] = &["h1", "h2", "h3", "h4", "h5", "h6"];
const ROW_GROUP: &[&str] = &["tr", "style", "script", "template"];

/// What upstream's `disallowed_children` adds to, or overrides in, [`AUTOCLOSING_CHILDREN`].
const RULES: [(&str, Rule); 18] = [
    ("form", Rule::Descendant(&["form"], &[])),
    ("a", Rule::Descendant(&["a"], &[])),
    ("button", Rule::Descendant(&["button"], &[])),
    ("h1", Rule::Descendant(HEADINGS, &[])),
    ("h2", Rule::Descendant(HEADINGS, &[])),
    ("h3", Rule::Descendant(HEADINGS, &[])),
    ("h4", Rule::Descendant(HEADINGS, &[])),
    ("h5", Rule::Descendant(HEADINGS, &[])),
    ("h6", Rule::Descendant(HEADINGS, &[])),
    (
        "tr",
        Rule::Only(&["th", "td", "style", "script", "template"]),
    ),
    ("tbody", Rule::Only(ROW_GROUP)),
    ("thead", Rule::Only(ROW_GROUP)),
    ("tfoot", Rule::Only(ROW_GROUP)),
    ("colgroup", Rule::Only(&["col", "template"])),
    (
        "table",
        Rule::Only(&[
            "caption", "colgroup", "tbody", "thead", "tfoot", "style", "script", "template",
        ]),
    ),
    (
        "head",
        Rule::Only(&[
            "base", "basefont", "bgsound", "link", "meta", "title", "noscript", "noframes",
            "style", "script", "template",
        ]),
    ),
    ("html", Rule::Only(&["head", "body", "frameset"])),
    ("frameset", Rule::Only(&["frame"])),
];

/// The number of tags with a rule, so a caller can keep one slot per tag.
pub const SLOTS: usize = AUTOCLOSING_CHILDREN.len() + RULES.len();

/// The rule for `tag` and its slot, below [`SLOTS`]; what `disallowed_children` overrides wins.
#[must_use]
pub fn rule(tag: &str) -> Option<(usize, Rule)> {
    let slot = match RULES.iter().position(|&(t, _)| t == tag) {
        Some(index) => AUTOCLOSING_CHILDREN.len() + index,
        None => AUTOCLOSING_CHILDREN.iter().position(|&(t, _)| t == tag)?,
    };
    Some((slot, entry(slot).1))
}

/// The tag and rule in `slot`, which [`rule`] returned.
#[must_use]
pub fn entry(slot: usize) -> (&'static str, Rule) {
    match AUTOCLOSING_CHILDREN.get(slot) {
        Some(&(tag, Autoclosing::Direct(tags))) => (tag, Rule::Direct(tags)),
        Some(&(tag, Autoclosing::Descendant(tags, reset_by))) => {
            (tag, Rule::Descendant(tags, reset_by))
        }
        None => RULES[slot - AUTOCLOSING_CHILDREN.len()],
    }
}

/// Upstream `is_tag_valid_with_parent`: why `child` (`#text` for text) cannot sit in `parent`.
#[must_use]
pub fn invalid_with_parent(child: &str, parent: &str) -> Option<String> {
    if child.contains('-') || parent.contains('-') || parent == "template" {
        return None;
    }
    match rule(parent).map(|(_, rule)| rule) {
        Some(Rule::Direct(tags)) if tags.contains(&child) => {
            return Some(format!(
                "`<{child}>` cannot be a direct child of `<{parent}>`"
            ));
        }
        Some(Rule::Descendant(tags, _)) if tags.contains(&child) => {
            return Some(format!("`<{child}>` cannot be a child of `<{parent}>`"));
        }
        Some(Rule::Only(tags)) if tags.contains(&child) => return None,
        Some(Rule::Only(tags)) => {
            let allowed: Vec<String> = tags.iter().map(|tag| format!("`<{tag}>`")).collect();
            return Some(format!(
                "`<{child}>` cannot be a child of `<{parent}>`. `<{parent}>` only allows these \
                 children: {}",
                allowed.join(", ")
            ));
        }
        _ => {}
    }
    match child {
        "body" | "caption" | "col" | "colgroup" | "frameset" | "frame" | "head" | "html" => {
            Some(format!("`<{child}>` cannot be a child of `<{parent}>`"))
        }
        "thead" | "tbody" | "tfoot" => Some(format!(
            "`<{child}>` must be the child of a `<table>`, not a `<{parent}>`"
        )),
        "td" | "th" => Some(format!(
            "`<{child}>` must be the child of a `<tr>`, not a `<{parent}>`"
        )),
        "tr" => Some(format!(
            "`<tr>` must be the child of a `<thead>`, `<tbody>`, or `<tfoot>`, not a `<{parent}>`"
        )),
        _ => None,
    }
}

/// Upstream `is_tag_valid_with_ancestor`: `ancestors` runs from the parent outwards, and the last
/// one is the ancestor asked about.
#[must_use]
pub fn invalid_with_ancestor(child: &str, ancestors: &[&str]) -> Option<String> {
    let (&ancestor, between) = ancestors.split_last()?;
    let (_, rule) = rule(ancestor)?;
    if between.iter().any(|tag| rule.reset_by(tag)) {
        return None;
    }
    rule.invalid_descendant(child, ancestor)
}

#[cfg(test)]
mod tests;
