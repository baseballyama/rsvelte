//! Upstream `html-tree-validation`: where the HTML parser would repair the tree a template writes.

use rsvelte_svelte_syntax::parse::{AUTOCLOSING_CHILDREN, Autoclosing};

/// Upstream `disallowed_children`, keyed by the parent or ancestor tag.
#[derive(Clone, Copy)]
enum Rule {
    /// Not allowed as a direct child.
    Direct(&'static [&'static str]),
    /// Not allowed at any depth.
    Descendant(&'static [&'static str]),
    /// The only children allowed.
    Only(&'static [&'static str]),
}

const HEADINGS: &[&str] = &["h1", "h2", "h3", "h4", "h5", "h6"];
const ROW_GROUP: &[&str] = &["tr", "style", "script", "template"];

/// What upstream's `disallowed_children` adds to, or overrides in, [`AUTOCLOSING_CHILDREN`].
const RULES: [(&str, Rule); 18] = [
    ("form", Rule::Descendant(&["form"])),
    ("a", Rule::Descendant(&["a"])),
    ("button", Rule::Descendant(&["button"])),
    ("h1", Rule::Descendant(HEADINGS)),
    ("h2", Rule::Descendant(HEADINGS)),
    ("h3", Rule::Descendant(HEADINGS)),
    ("h4", Rule::Descendant(HEADINGS)),
    ("h5", Rule::Descendant(HEADINGS)),
    ("h6", Rule::Descendant(HEADINGS)),
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

/// The rule for `tag` and its slot in [`Ancestors`]: the index of its entry in the two tables,
/// [`RULES`] first since it overrides.
fn rule(tag: &str) -> Option<(usize, Rule)> {
    let slot = match RULES.iter().position(|&(t, _)| t == tag) {
        Some(index) => AUTOCLOSING_CHILDREN.len() + index,
        None => AUTOCLOSING_CHILDREN.iter().position(|&(t, _)| t == tag)?,
    };
    Some((slot, entry(slot).1))
}

fn entry(slot: usize) -> (&'static str, Rule) {
    match AUTOCLOSING_CHILDREN.get(slot) {
        Some(&(tag, Autoclosing::Direct(tags))) => (tag, Rule::Direct(tags)),
        Some(&(tag, Autoclosing::Descendant(tags))) => (tag, Rule::Descendant(tags)),
        None => RULES[slot - AUTOCLOSING_CHILDREN.len()],
    }
}

/// Upstream `is_tag_valid_with_parent`: why `child` (`#text` for text) cannot sit in `parent`.
pub(super) fn invalid_with_parent(child: &str, parent: &str) -> Option<String> {
    if child.contains('-') || parent.contains('-') || parent == "template" {
        return None;
    }
    match rule(parent).map(|(_, rule)| rule) {
        Some(Rule::Direct(tags)) if tags.contains(&child) => {
            return Some(format!(
                "`<{child}>` cannot be a direct child of `<{parent}>`"
            ));
        }
        Some(Rule::Descendant(tags)) if tags.contains(&child) => {
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

/// The nearest element above the parent with each tag of a [`Rule::Descendant`], which upstream's
/// `is_tag_valid_with_ancestor` asks about while it walks up to a component or snippet.
#[derive(Clone, Copy, Default)]
pub(super) struct Ancestors {
    seen: [Option<Seen>; AUTOCLOSING_CHILDREN.len() + RULES.len()],
}

#[derive(Clone, Copy)]
struct Seen {
    depth: u32,
    /// A block lies between it and the node asking, so upstream only warns.
    crossed_block: bool,
    /// A `<dl>` or a custom element lies between, which allows `<dt>` and `<dd>` again.
    reset: bool,
}

impl Ancestors {
    /// `parent`, at `depth`, becomes an ancestor of the children of `element`, its child.
    pub(super) fn below(mut self, parent: (&str, u32, bool), element: &str) -> Self {
        let (tag, depth, crossed_block) = parent;
        if let Some((slot, Rule::Descendant(_))) = rule(tag) {
            self.seen[slot] = Some(Seen {
                depth,
                crossed_block,
                reset: false,
            });
        }
        if element == "dl" || element.contains('-') {
            for seen in self.seen.iter_mut().flatten() {
                seen.reset = true;
            }
        }
        self
    }

    pub(super) fn cross_block(mut self) -> Self {
        for seen in self.seen.iter_mut().flatten() {
            seen.crossed_block = true;
        }
        self
    }

    /// Why `child` cannot sit below its nearest forbidding ancestor, unless a block lies between.
    pub(super) fn invalid(&self, child: &str) -> Option<String> {
        if child.contains('-') {
            return None;
        }
        let (tag, seen) = (self.seen.iter().enumerate())
            .filter_map(|(slot, seen)| Some((entry(slot), (*seen)?)))
            .filter(|&((tag, rule), seen)| {
                let reset = seen.reset && matches!(tag, "dt" | "dd");
                !reset && matches!(rule, Rule::Descendant(tags) if tags.contains(&child))
            })
            .map(|((tag, _), seen)| (tag, seen))
            .max_by_key(|(_, seen)| seen.depth)?;
        (!seen.crossed_block).then(|| format!("`<{child}>` cannot be a descendant of `<{tag}>`"))
    }
}
