//! oxfmt's `sortTailwindcss` in a component, as prettier-plugin-tailwindcss sorts one.
//!
//! The scripts' function calls and the style sheet's `@apply` sort through oxc's formatters, on
//! the session's sorter. The class attributes of the template sort here, before the component
//! prints, as the plugin's `transformSvelte` sorts them before prettier-plugin-svelte prints.

use std::sync::{Arc, Mutex, PoisonError};

use oxc_ast::ast::{StringLiteral, TemplateLiteral};
use oxc_ast_visit::{Visit, walk};
use oxc_formatter::SortTailwindcssOptions;
use oxc_formatter_core::TailwindSorter;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Component, Part, Range, TemplateNode,
};

/// The project's Tailwind CSS, which a host provides.
pub trait ClassSorter: Send + Sync {
    /// Each class list sorted as the plugin's `sortClassAttributes` sorts it.
    ///
    /// # Errors
    ///
    /// Why the classes cannot be sorted.
    fn sort(&self, lists: Vec<String>) -> Result<Vec<String>, String>;

    /// The classes of each list in Tailwind CSS's order, as the plugin's `sortClassList` puts them
    /// without removing a duplicate, each with whether Tailwind CSS knows it.
    ///
    /// # Errors
    ///
    /// Why the classes cannot be ordered.
    fn order(&self, lists: Vec<Vec<String>>) -> Result<Vec<Vec<(String, bool)>>, String>;

    /// Whether each of `names`, in the order the plugin reads them, is an attribute whose classes
    /// sort, as the plugin's matcher tells: `sortTailwindcss` names it, or names a regular
    /// expression (`/…/flags`) it matches. `None` is the name of a spread or an attachment, which
    /// the plugin tests as `undefined`.
    ///
    /// # Errors
    ///
    /// Why the names cannot be matched.
    fn match_attributes(&self, names: Vec<Option<String>>) -> Result<Vec<bool>, String>;
}

/// oxfmt's `sortTailwindcss`, with the sorter of the component's project, for one component.
#[derive(Clone)]
pub struct Tailwind {
    /// The functions whose classes the scripts sort, and the attributes besides `class` whose
    /// classes the template sorts, by name.
    pub javascript: Arc<SortTailwindcssOptions>,
    /// Keeps a class written twice in an attribute.
    pub preserve_duplicates: bool,
    sorter: Arc<dyn ClassSorter>,
    /// The first failure of the sorter oxc's formatters call, which cannot fail: it leaves the
    /// classes as they are.
    failure: Arc<Mutex<Option<String>>>,
}

impl std::fmt::Debug for Tailwind {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Tailwind")
            .field("javascript", &self.javascript)
            .field("preserve_duplicates", &self.preserve_duplicates)
            .finish_non_exhaustive()
    }
}

impl PartialEq for Tailwind {
    fn eq(&self, other: &Self) -> bool {
        Arc::ptr_eq(&self.javascript, &other.javascript)
            && self.preserve_duplicates == other.preserve_duplicates
            && Arc::ptr_eq(&self.sorter, &other.sorter)
    }
}

impl Eq for Tailwind {}

impl Tailwind {
    #[must_use]
    pub fn new(
        javascript: Arc<SortTailwindcssOptions>,
        preserve_duplicates: bool,
        sorter: Arc<dyn ClassSorter>,
    ) -> Self {
        Self {
            javascript,
            preserve_duplicates,
            sorter,
            failure: Arc::default(),
        }
    }

    /// The sorter oxc's formatters call on the session.
    pub(crate) fn session_sorter(&self) -> TailwindSorter {
        let sorter = Arc::clone(&self.sorter);
        let failure = Arc::clone(&self.failure);
        Arc::new(move |lists: Vec<String>| {
            let len = lists.len();
            match sorter.sort(lists.clone()) {
                Ok(answer) if answer.len() == len => answer,
                result => {
                    let error = result.map_or_else(
                        |error| error,
                        |answer| format!("the sorter gave {} class lists for {len}", answer.len()),
                    );
                    (failure.lock().unwrap_or_else(PoisonError::into_inner)).get_or_insert(error);
                    lists
                }
            }
        })
    }

    /// The first failure of the session's sorter, if any.
    pub(crate) fn take_failure(&self) -> Option<String> {
        (self.failure.lock().unwrap_or_else(PoisonError::into_inner)).take()
    }
}

/// A run of the plugin's `sortClasses` on the text at `span`, with `collapseWhitespace: false`, as
/// every run in a component is.
struct Run {
    span: Span,
    ignore_first: bool,
    ignore_last: bool,
    remove_duplicates: bool,
}

/// `source_text` with the classes of the template's attributes sorted, or `None` when they are
/// sorted already.
///
/// # Errors
///
/// Why the sorter cannot order the classes.
pub(crate) fn sorted(
    c: &Component,
    source_text: &str,
    tailwind: &Tailwind,
) -> Result<Option<String>, String> {
    let runs = runs(c, source_text, tailwind)?;
    let splits: Vec<Split<'_>> = (runs.iter())
        .map(|run| Split::new(run.span.text(source_text), run))
        .collect();
    let lists = (splits.iter())
        .filter_map(|split| split.classes.as_ref())
        .map(|classes| classes.iter().map(|&class| class.to_owned()).collect())
        .collect::<Vec<Vec<String>>>();
    if lists.is_empty() {
        return Ok(None);
    }
    let count = lists.len();
    let mut ordered = tailwind.sorter.order(lists)?.into_iter();
    if ordered.len() != count {
        return Err(format!(
            "the sorter ordered {} class lists for {count}",
            ordered.len()
        ));
    }
    let mut edits: Vec<(Span, String)> = Vec::new();
    for (run, split) in runs.iter().zip(splits) {
        let Some(classes) = &split.classes else {
            continue;
        };
        let order = ordered.next().unwrap_or_default();
        if order.len() != classes.len() {
            return Err(format!(
                "the sorter ordered {} classes for {}",
                order.len(),
                classes.len()
            ));
        }
        let text = split.joined(order, run.remove_duplicates);
        if text != run.span.text(source_text) {
            edits.push((run.span, text));
        }
    }
    if edits.is_empty() {
        return Ok(None);
    }
    edits.sort_by_key(|(span, _)| span.start_offset);
    let mut out = String::with_capacity(source_text.len());
    let mut at = 0;
    for (span, text) in edits {
        out.push_str(&source_text[at..span.start_offset as usize]);
        out.push_str(&text);
        at = span.end_offset as usize;
    }
    out.push_str(&source_text[at..]);
    Ok(Some(out))
}

/// The attributes of the template in the order the plugin's `transformSvelte` reads them: an
/// element's, then those of the nodes in it, branch by branch. Its tree keeps `<svelte:options>`
/// out of the template.
fn attributes<'c>(c: &'c Component, source_text: &str) -> Vec<&'c Attribute> {
    fn walk<'c>(c: &'c Component, source_text: &str, nodes: Range, out: &mut Vec<&'c Attribute>) {
        for &node in nodes.get(&c.children) {
            let branches: [Option<Range>; 3] = match &c.nodes[node as usize] {
                TemplateNode::Element {
                    name,
                    attributes,
                    children,
                    ..
                } => {
                    if name.text(source_text) != "svelte:options" {
                        out.extend(attributes.get(&c.attributes));
                    }
                    [Some(*children), None, None]
                }
                TemplateNode::If {
                    consequent,
                    alternate,
                    ..
                } => [Some(*consequent), *alternate, None],
                TemplateNode::Each { body, fallback, .. } => [Some(*body), Some(*fallback), None],
                TemplateNode::Key { body, .. } | TemplateNode::Snippet { body, .. } => {
                    [Some(*body), None, None]
                }
                TemplateNode::Await {
                    pending,
                    then,
                    catch,
                    ..
                } => [Some(*pending), Some(*then), Some(*catch)],
                _ => [None; 3],
            };
            for branch in branches.into_iter().flatten().filter_map(Range::present) {
                walk(c, source_text, branch, out);
            }
        }
    }
    let mut out = Vec::new();
    walk(c, source_text, c.root, &mut out);
    out
}

/// The name the plugin's matcher tests an attribute by: a directive's without its prefix, and none
/// for a spread or an attachment.
fn matcher_name(c: &Component, source_text: &str, attribute: &Attribute) -> Option<String> {
    match attribute.kind {
        AttributeKind::Attribute => Some(attribute.name.text(source_text).to_owned()),
        AttributeKind::Spread | AttributeKind::Attach => None,
        _ => (attribute.directive_name(&c.modifiers)).map(|name| name.text(source_text).to_owned()),
    }
}

/// The runs of `sortClasses` the plugin's `transformSvelte` makes: each text of a class attribute,
/// and each string literal and template literal text in its expressions.
fn runs(c: &Component, source_text: &str, tailwind: &Tailwind) -> Result<Vec<Run>, String> {
    let configured = &tailwind.javascript.attributes;
    // Only the project's JavaScript reads a regular expression as the plugin does.
    let matched = if configured.iter().any(|name| name.starts_with('/')) {
        // Every attribute, directives included: a `g` expression keeps state between tests.
        let names: Vec<Option<String>> = (attributes(c, source_text).into_iter())
            .map(|attribute| matcher_name(c, source_text, attribute))
            .collect();
        let count = names.len();
        let matched = tailwind.sorter.match_attributes(names)?;
        if matched.len() != count {
            return Err(format!(
                "the sorter matched {} attributes for {count}",
                matched.len()
            ));
        }
        Some(matched)
    } else {
        None
    };
    let mut runs = Vec::new();
    for (index, attribute) in attributes(c, source_text).into_iter().enumerate() {
        if attribute.kind != AttributeKind::Attribute {
            continue;
        }
        let name = attribute.name.text(source_text);
        let sorts = name == "class"
            || matched.as_ref().map_or_else(
                || configured.iter().any(|a| a == name),
                |matched| matched[index],
            );
        if !sorts {
            continue;
        }
        let AttributeValue::Parts(parts) = attribute.value else {
            continue;
        };
        let parts = parts.get(&c.parts);
        for (i, part) in parts.iter().enumerate() {
            match *part {
                Part::Text(span) => {
                    let text = span.text(source_text);
                    runs.push(Run {
                        span,
                        ignore_first: i > 0 && !text.starts_with(is_ecmascript_whitespace),
                        ignore_last: i + 1 < parts.len()
                            && !text.ends_with(is_ecmascript_whitespace),
                        remove_duplicates: !tailwind.preserve_duplicates,
                    });
                }
                Part::Expression { expression, .. } => {
                    let mut literals = Literals {
                        source_text,
                        runs: &mut runs,
                    };
                    literals.visit_expression(c.javascript.get_expression(expression));
                }
            }
        }
    }
    Ok(runs)
}

/// The string literals and template literal texts of an expression, which the plugin sorts
/// without removing a duplicate.
struct Literals<'r, 's> {
    source_text: &'s str,
    runs: &'r mut Vec<Run>,
}

impl<'a> Visit<'a> for Literals<'_, '_> {
    fn visit_string_literal(&mut self, it: &StringLiteral<'a>) {
        // The text between the quotes, as written.
        self.runs.push(Run {
            span: Span::new(it.span.start + 1, it.span.end - 1),
            ignore_first: false,
            ignore_last: false,
            remove_duplicates: false,
        });
    }

    fn visit_template_literal(&mut self, it: &TemplateLiteral<'a>) {
        let expressions = it.expressions.len();
        for (i, quasi) in it.quasis.iter().enumerate() {
            let span = Span::new(quasi.span.start, quasi.span.end);
            let text = span.text(self.source_text);
            self.runs.push(Run {
                span,
                ignore_first: i > 0 && !text.starts_with(is_ecmascript_whitespace),
                ignore_last: i < expressions && !text.ends_with(is_ecmascript_whitespace),
                remove_duplicates: false,
            });
        }
        walk::walk_template_literal(self, it);
    }
}

/// The plugin's `sortClasses` up to its call of `sortClassList`: the text cut into classes and the
/// whitespace between them, with what it keeps in place.
struct Split<'t> {
    prefix: String,
    suffix: String,
    whitespace: Vec<&'t str>,
    /// `None` when the plugin returns the text as it is.
    classes: Option<Vec<&'t str>>,
    text: &'t str,
}

/// The whitespace the plugin cuts classes at, `[\t\r\f\n ]`.
const fn separates(c: char) -> bool {
    matches!(c, '\t' | '\r' | '\u{0C}' | '\n' | ' ')
}

impl<'t> Split<'t> {
    fn new(text: &'t str, run: &Run) -> Self {
        let mut split = Self {
            prefix: String::new(),
            suffix: String::new(),
            whitespace: Vec::new(),
            classes: None,
            text,
        };
        if text.is_empty() || text.contains("{{") {
            return split;
        }
        // `classStr.split(/([\t\r\f\n ]+)/)`: classes at the even places, whitespace at the odd.
        let mut classes = Vec::new();
        let mut start = 0;
        let mut chars = text.char_indices().peekable();
        while let Some((i, c)) = chars.next() {
            if !separates(c) {
                continue;
            }
            let mut end = i + c.len_utf8();
            while let Some(&(j, d)) = chars.peek()
                && separates(d)
            {
                end = j + d.len_utf8();
                chars.next();
            }
            classes.push(&text[start..i]);
            split.whitespace.push(&text[i..end]);
            start = end;
        }
        classes.push(&text[start..]);
        if classes.last() == Some(&"") {
            classes.pop();
        }
        let mut classes = std::collections::VecDeque::from(classes);
        let mut whitespace =
            std::collections::VecDeque::from(std::mem::take(&mut split.whitespace));
        if run.ignore_first {
            split
                .prefix
                .push_str(classes.pop_front().unwrap_or_default());
            split
                .prefix
                .push_str(whitespace.pop_front().unwrap_or_default());
        }
        if run.ignore_last {
            split
                .suffix
                .push_str(whitespace.pop_back().unwrap_or_default());
            split
                .suffix
                .push_str(classes.pop_back().unwrap_or_default());
        }
        split.whitespace = whitespace.into();
        split.classes = Some(classes.into());
        split
    }

    /// The rest of `sortClasses`, with the classes in `order`.
    fn joined(self, order: Vec<(String, bool)>, remove_duplicates: bool) -> String {
        if self.classes.is_none() {
            return self.text.to_owned();
        }
        // `sortClassList`: a known class seen before goes, and its index in the sorted list says
        // which whitespace goes with it, one place on.
        let mut removed = Vec::new();
        let mut kept = Vec::with_capacity(order.len());
        let mut seen = std::collections::HashSet::new();
        for (index, (class, known)) in order.into_iter().enumerate() {
            if remove_duplicates {
                if seen.contains(&class) {
                    removed.push(index);
                    continue;
                }
                if known {
                    seen.insert(class.clone());
                }
            }
            kept.push(class);
        }
        let whitespace = (self.whitespace.iter().enumerate())
            .filter(|(index, _)| !removed.contains(&(index + 1)))
            .map(|(_, &whitespace)| whitespace)
            .collect::<Vec<_>>();
        let mut out = self.prefix;
        for (i, class) in kept.iter().enumerate() {
            out.push_str(class);
            out.push_str(whitespace.get(i).copied().unwrap_or_default());
        }
        out.push_str(&self.suffix);
        out
    }
}
