//! Upstream `html-tree-validation`: where the HTML parser would repair the tree a template writes.

use rsvelte_svelte_syntax::parse::{AUTOCLOSING_CHILDREN, Autoclosing};

/// Upstream `disallowed_children`, keyed by the parent or ancestor tag.
#[derive(Clone, Copy, Debug)]
enum Rule {
    /// Not allowed as a direct child.
    Direct(&'static [&'static str]),
    /// Not allowed at any depth, unless an element of `reset_by` lies between.
    Descendant {
        tags: &'static [&'static str],
        reset_by: &'static [&'static str],
    },
    /// The only children allowed.
    Only(&'static [&'static str]),
}

impl Rule {
    /// Whether `tag`, lying between this rule's element and a descendant, allows that descendant
    /// again.
    fn is_reset_by(self, tag: &str) -> bool {
        // Upstream's loop over the elements between runs only for a rule with a reset list, so a
        // custom element resets those rules alone.
        matches!(self, Self::Descendant { reset_by, .. }
            if !reset_by.is_empty() && (tag.contains('-') || reset_by.contains(&tag)))
    }

    /// Upstream `is_tag_valid_with_ancestor`'s verdict: whether `child` cannot sit at any depth
    /// below this rule's element, once the walk knows whether an element between resets the rule.
    fn forbids_descendant(self, child: &str, reset: bool) -> bool {
        !reset
            && matches!(self, Self::Descendant { tags, .. }
                if !child.contains('-') && tags.contains(&child))
    }
}

/// Why `child` cannot sit below `ancestor`, whose rule [forbids it](Rule::forbids_descendant).
fn invalid_descendant(child: &str, ancestor: &str) -> String {
    format!("`<{child}>` cannot be a descendant of `<{ancestor}>`")
}

const HEADINGS: &[&str] = &["h1", "h2", "h3", "h4", "h5", "h6"];
const ROW_GROUP: &[&str] = &["tr", "style", "script", "template"];

const fn descendant(tags: &'static [&'static str]) -> Rule {
    Rule::Descendant {
        tags,
        reset_by: &[],
    }
}

/// What upstream's `disallowed_children` adds to, or overrides in, [`AUTOCLOSING_CHILDREN`].
const RULES: [(&str, Rule); 18] = [
    ("form", descendant(&["form"])),
    ("a", descendant(&["a"])),
    ("button", descendant(&["button"])),
    ("h1", descendant(HEADINGS)),
    ("h2", descendant(HEADINGS)),
    ("h3", descendant(HEADINGS)),
    ("h4", descendant(HEADINGS)),
    ("h5", descendant(HEADINGS)),
    ("h6", descendant(HEADINGS)),
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

/// The number of tags with a rule, one slot per tag.
const SLOTS: usize = AUTOCLOSING_CHILDREN.len() + RULES.len();

/// The rule for `tag` and its slot, below [`SLOTS`]; what `disallowed_children` overrides wins.
fn rule(tag: &str) -> Option<(usize, Rule)> {
    let slot = match RULES.iter().position(|&(t, _)| t == tag) {
        Some(index) => AUTOCLOSING_CHILDREN.len() + index,
        None => AUTOCLOSING_CHILDREN.iter().position(|&(t, _)| t == tag)?,
    };
    Some((slot, entry(slot).1))
}

/// The tag and rule in `slot`, which [`rule`] returned.
fn entry(slot: usize) -> (&'static str, Rule) {
    match AUTOCLOSING_CHILDREN.get(slot) {
        Some(&(tag, Autoclosing::Direct(tags))) => (tag, Rule::Direct(tags)),
        Some(&(tag, Autoclosing::Descendant { tags, reset_by })) => {
            (tag, Rule::Descendant { tags, reset_by })
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
        Some(Rule::Descendant { tags, .. }) if tags.contains(&child) => {
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
    let reset = between.iter().any(|tag| rule.is_reset_by(tag));
    rule.forbids_descendant(child, reset)
        .then(|| invalid_descendant(child, ancestor))
}

/// The nearest element above a node's parent with each tag whose rule reaches every depth, for a
/// walk that carries these down instead of keeping the path [`invalid_with_ancestor`] reads.
#[derive(Clone, Copy, Debug, Default)]
pub struct Ancestors {
    seen: [Option<Seen>; SLOTS],
}

#[derive(Clone, Copy, Debug)]
struct Seen {
    depth: u32,
    /// A block lies between it and the node asking, so upstream only warns.
    crossed_block: bool,
    /// An element its rule is reset by lies between, which allows the descendants again.
    reset: bool,
}

impl Ancestors {
    /// `parent` (its tag, its depth, and whether a block lies between it and its own parent)
    /// becomes an ancestor of the children of `element`, its child.
    #[must_use]
    pub fn below(mut self, parent: (&str, u32, bool), element: &str) -> Self {
        let (tag, depth, crossed_block) = parent;
        if let Some((slot, Rule::Descendant { .. })) = rule(tag) {
            self.seen[slot] = Some(Seen {
                depth,
                crossed_block,
                reset: false,
            });
        }
        for (slot, seen) in self.seen.iter_mut().enumerate() {
            if let Some(seen) = seen
                && entry(slot).1.is_reset_by(element)
            {
                seen.reset = true;
            }
        }
        self
    }

    /// A block now lies between every ancestor and the nodes below.
    #[must_use]
    pub fn cross_block(mut self) -> Self {
        for seen in self.seen.iter_mut().flatten() {
            seen.crossed_block = true;
        }
        self
    }

    /// Why `child` cannot sit below its nearest forbidding ancestor, unless a block lies between.
    #[must_use]
    pub fn invalid(&self, child: &str) -> Option<String> {
        let (tag, seen) = (self.seen.iter().enumerate())
            .filter_map(|(slot, seen)| Some((entry(slot), (*seen)?)))
            .filter(|&((_, rule), seen)| rule.forbids_descendant(child, seen.reset))
            .map(|((tag, _), seen)| (tag, seen))
            .max_by_key(|(_, seen)| seen.depth)?;
        (!seen.crossed_block).then(|| invalid_descendant(child, tag))
    }
}

#[cfg(test)]
mod tests;
