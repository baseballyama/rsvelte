//! CSS selector-to-element matching for scoped hash application.
//!
//! This module implements proper CSS selector matching against template elements,
//! mirroring the official compiler's css-prune.js. It considers combinators
//! (>, space, +, ~) when determining which elements should be scoped.

use rustc_hash::{FxHashMap, FxHashSet};

use crate::ast::template::{self, Fragment, TemplateNode};

/// Represents the value of an attribute for CSS matching purposes.
#[derive(Debug, Clone)]
pub enum AttrValue {
    /// Boolean attribute (e.g., `<div hidden>`)
    Boolean,
    /// Static text value (e.g., `<div class="foo">`)
    Static(String),
    /// Dynamic/expression value that can't be statically determined
    Dynamic,
    /// A dynamic attribute with known possible values (e.g., `class={[...]}`).
    /// Used to avoid false-positive matches when the class expression is an
    /// array of literal strings.
    PossibleValues(Vec<String>),
}

/// Gather all possible string values for a class expression.
/// Returns `None` if any value cannot be statically determined (UNKNOWN).
/// Mirrors `gather_possible_values` in the official compiler's utils.js.
fn gather_possible_values(
    node: &serde_json::Value,
    is_class: bool,
    is_nested: bool,
    values: &mut Vec<String>,
    unknown: &mut bool,
) {
    if *unknown {
        return;
    }
    let ty = node.get("type").and_then(|t| t.as_str()).unwrap_or("");
    match ty {
        "Literal" => {
            if let Some(v) = node.get("value") {
                if let Some(s) = v.as_str() {
                    values.push(s.to_string());
                } else if let Some(b) = v.as_bool() {
                    values.push(b.to_string());
                } else if let Some(n) = v.as_i64() {
                    values.push(n.to_string());
                } else if let Some(n) = v.as_f64() {
                    values.push(n.to_string());
                } else if v.is_null() {
                    values.push("null".to_string());
                }
            }
        }
        "TemplateLiteral" => {
            // Only handle template literals with no interpolations
            let expressions = node.get("expressions").and_then(|e| e.as_array());
            let quasis = node.get("quasis").and_then(|q| q.as_array());
            if let (Some(exprs), Some(qs)) = (expressions, quasis)
                && exprs.is_empty()
                && qs.len() == 1
                && let Some(cooked) = qs[0]
                    .get("value")
                    .and_then(|v| v.get("cooked"))
                    .and_then(|c| c.as_str())
            {
                values.push(cooked.to_string());
                return;
            }
            *unknown = true;
        }
        "ConditionalExpression" => {
            if let Some(cons) = node.get("consequent") {
                gather_possible_values(cons, is_class, is_nested, values, unknown);
            }
            if let Some(alt) = node.get("alternate") {
                gather_possible_values(alt, is_class, is_nested, values, unknown);
            }
        }
        "LogicalExpression" => {
            let op = node.get("operator").and_then(|o| o.as_str()).unwrap_or("");
            if op == "&&" {
                // Gather left values into a temp set to detect UNKNOWN
                let mut left_values = Vec::new();
                let mut left_unknown = false;
                if let Some(l) = node.get("left") {
                    gather_possible_values(
                        l,
                        is_class,
                        is_nested,
                        &mut left_values,
                        &mut left_unknown,
                    );
                }
                if left_unknown {
                    // add non-nullish falsy values unless class+nested
                    if !is_class || !is_nested {
                        values.push(String::new());
                        values.push("false".to_string());
                        values.push("NaN".to_string());
                        values.push("0".to_string());
                    }
                } else {
                    for v in left_values {
                        // Only falsy non-nullish values: empty string, "false", "NaN", "0"
                        if (v.is_empty() || v == "false" || v == "NaN" || v == "0")
                            && (!is_class || !is_nested)
                        {
                            values.push(v);
                        }
                    }
                }
                if let Some(r) = node.get("right") {
                    gather_possible_values(r, is_class, is_nested, values, unknown);
                }
            } else {
                if let Some(l) = node.get("left") {
                    gather_possible_values(l, is_class, is_nested, values, unknown);
                }
                if let Some(r) = node.get("right") {
                    gather_possible_values(r, is_class, is_nested, values, unknown);
                }
            }
        }
        "ArrayExpression" if is_class => {
            if let Some(elements) = node.get("elements").and_then(|e| e.as_array()) {
                for entry in elements {
                    if !entry.is_null() {
                        gather_possible_values(entry, is_class, true, values, unknown);
                    }
                }
            }
        }
        "ObjectExpression" if is_class => {
            if let Some(properties) = node.get("properties").and_then(|p| p.as_array()) {
                for property in properties {
                    let prop_ty = property.get("type").and_then(|t| t.as_str()).unwrap_or("");
                    if prop_ty != "Property" {
                        *unknown = true;
                        continue;
                    }
                    let computed = property
                        .get("computed")
                        .and_then(|c| c.as_bool())
                        .unwrap_or(false);
                    if computed {
                        *unknown = true;
                        continue;
                    }
                    if let Some(key) = property.get("key") {
                        let key_ty = key.get("type").and_then(|t| t.as_str()).unwrap_or("");
                        if key_ty == "Identifier" {
                            if let Some(name) = key.get("name").and_then(|n| n.as_str()) {
                                values.push(name.to_string());
                                continue;
                            }
                        } else if key_ty == "Literal"
                            && let Some(v) = key.get("value")
                        {
                            if let Some(s) = v.as_str() {
                                values.push(s.to_string());
                                continue;
                            } else if let Some(n) = v.as_i64() {
                                values.push(n.to_string());
                                continue;
                            }
                        }
                    }
                    *unknown = true;
                }
            }
        }
        _ => {
            *unknown = true;
        }
    }
}

/// Gather all statically-determinable values for an attribute expression.
/// Mirrors upstream `get_possible_values(chunk, is_class)` in 2-analyze/css/utils.js.
fn get_possible_attr_values(
    expr: &crate::ast::js::Expression,
    is_class: bool,
) -> Option<Vec<String>> {
    let json = expr.as_json();
    let mut values = Vec::new();
    let mut unknown = false;
    gather_possible_values(json, is_class, false, &mut values, &mut unknown);
    if unknown { None } else { Some(values) }
}

/// Compute the full set of possible concatenated values for a Sequence
/// attribute (mix of text and expression parts). Mirrors the official
/// compiler's `attribute_matches` chunk-combination logic.
fn sequence_possible_values(
    parts: &[template::AttributeValuePart],
    is_class: bool,
) -> Option<Vec<String>> {
    let mut possible_values: std::collections::BTreeSet<String> = std::collections::BTreeSet::new();
    let mut prev_values: Vec<String> = Vec::new();

    for part in parts {
        // Determine the possible values for this chunk.
        let chunk_possible: Vec<String> = match part {
            template::AttributeValuePart::Text(text) => vec![text.data.to_string()],
            template::AttributeValuePart::ExpressionTag(tag) => {
                let mut values = Vec::new();
                let mut unknown = false;
                gather_possible_values(
                    tag.expression.as_json(),
                    is_class,
                    is_class,
                    &mut values,
                    &mut unknown,
                );
                if unknown {
                    return None;
                }
                values
            }
        };

        if !prev_values.is_empty() {
            let mut start_with_space: Vec<String> = Vec::new();
            let mut remaining: Vec<String> = Vec::new();
            for v in &chunk_possible {
                if v.starts_with(|c: char| c.is_whitespace()) {
                    start_with_space.push(v.clone());
                } else {
                    remaining.push(v.clone());
                }
            }

            if !remaining.is_empty() {
                if !start_with_space.is_empty() {
                    for pv in &prev_values {
                        possible_values.insert(pv.clone());
                    }
                }
                let mut combined = Vec::new();
                for pv in &prev_values {
                    for v in &remaining {
                        combined.push(format!("{}{}", pv, v));
                    }
                }
                prev_values = combined;
                for v in &start_with_space {
                    if v.ends_with(|c: char| c.is_whitespace()) {
                        possible_values.insert(v.clone());
                    } else {
                        prev_values.push(v.clone());
                    }
                }
                if prev_values.len() > 20 {
                    return None;
                }
                continue;
            } else {
                for pv in &prev_values {
                    possible_values.insert(pv.clone());
                }
                prev_values = Vec::new();
            }
        }
        for v in &chunk_possible {
            if v.ends_with(|c: char| c.is_whitespace()) {
                possible_values.insert(v.clone());
            } else {
                prev_values.push(v.clone());
            }
        }
        if prev_values.len() < chunk_possible.len() {
            prev_values.push(" ".to_string());
        }
        if prev_values.len() > 20 {
            return None;
        }
    }

    for pv in prev_values {
        possible_values.insert(pv);
    }

    Some(possible_values.into_iter().collect())
}

/// Info about a template element for CSS matching.
#[derive(Debug, Clone)]
pub struct ElementInfo {
    pub tag_name: String,
    pub has_spread: bool,
    /// Whether this is a dynamic element (<svelte:element>), which matches any type selector
    pub is_dynamic: bool,
    /// All attributes on the element (name, value pairs)
    pub attributes: Vec<(String, AttrValue)>,
    /// Whether there's a bind:xxx directive (attribute name -> true)
    pub bind_names: Vec<String>,
    /// Whether there's a style directive
    pub has_style_directive: bool,
    /// Whether the element has a class directive
    pub class_directive_names: Vec<String>,
}

impl ElementInfo {
    pub fn from_element(el: &template::RegularElement) -> Self {
        Self::from_attributes(&el.name, &el.attributes, false)
    }

    pub fn from_svelte_element(el: &template::SvelteDynamicElement) -> Self {
        Self::from_attributes("", &el.attributes, true)
    }

    fn from_attributes(
        tag_name: &str,
        attributes: &[template::Attribute],
        is_dynamic: bool,
    ) -> Self {
        use template::Attribute;

        let mut has_spread = false;
        let mut attr_pairs: Vec<(String, AttrValue)> = Vec::new();
        let mut bind_names = Vec::new();
        let mut has_style_directive = false;
        let mut class_directive_names = Vec::new();

        for attr in attributes {
            match attr {
                Attribute::Attribute(a) => {
                    let attr_name = a.name.to_string();
                    match &a.value {
                        template::AttributeValue::True(_) => {
                            // Boolean attribute
                            attr_pairs.push((attr_name.clone(), AttrValue::Boolean));
                        }
                        template::AttributeValue::Sequence(parts) => {
                            let mut static_parts = Vec::new();
                            let mut is_all_text = true;
                            for part in parts {
                                if let template::AttributeValuePart::Text(text) = part {
                                    static_parts.push(text.data.to_string());
                                } else {
                                    is_all_text = false;
                                }
                            }
                            if is_all_text && !static_parts.is_empty() {
                                let full_value = static_parts.join("");
                                attr_pairs.push((attr_name.clone(), AttrValue::Static(full_value)));
                            } else {
                                // Try to compute possible values across all chunks, so
                                // selectors like `.foo` or `[data-x='y']` can be pruned
                                // when the value isn't a candidate token. Mirrors the
                                // official compiler's `attribute_matches` chunk logic in
                                // css-prune.js (applies to every attribute, not just class).
                                let is_class = attr_name == "class";
                                if let Some(possible) = sequence_possible_values(parts, is_class) {
                                    attr_pairs.push((
                                        attr_name.clone(),
                                        AttrValue::PossibleValues(possible),
                                    ));
                                } else {
                                    attr_pairs.push((attr_name.clone(), AttrValue::Dynamic));
                                }
                            }
                        }
                        template::AttributeValue::Expression(expr_tag) => {
                            let is_class = attr_name == "class";
                            if let Some(possible) =
                                get_possible_attr_values(&expr_tag.expression, is_class)
                            {
                                attr_pairs
                                    .push((attr_name.clone(), AttrValue::PossibleValues(possible)));
                            } else {
                                attr_pairs.push((attr_name.clone(), AttrValue::Dynamic));
                            }
                        }
                    }
                }
                Attribute::ClassDirective(cd) => {
                    class_directive_names.push(cd.name.to_string());
                }
                Attribute::SpreadAttribute(_) => {
                    has_spread = true;
                }
                Attribute::BindDirective(bd) => {
                    bind_names.push(bd.name.to_string());
                }
                Attribute::StyleDirective(_) => {
                    has_style_directive = true;
                }
                _ => {}
            }
        }

        Self {
            tag_name: tag_name.to_string(),
            has_spread,
            is_dynamic,
            attributes: attr_pairs,
            bind_names,
            has_style_directive,
            class_directive_names,
        }
    }
}

/// Parsed CSS simple selector.
#[derive(Debug, Clone)]
pub enum CssSimpleSelector {
    Type(String),
    Class(String),
    Id(String),
    /// Attribute selector with optional name, matcher, value, flags
    Attribute {
        name: String,
        matcher: Option<String>,
        value: Option<String>,
        flags: Option<String>,
    },
    PseudoClass(String, Option<Vec<CssComplexSelector>>),
    PseudoElement,
    Nesting,
}

/// Parsed CSS relative selector (simple selectors + combinator).
#[derive(Debug, Clone)]
pub struct CssRelativeSelector {
    pub combinator: Option<String>,
    pub selectors: Vec<CssSimpleSelector>,
    pub is_global: bool,
    pub is_global_like: bool,
}

/// Parsed CSS complex selector (list of relative selectors).
#[derive(Debug, Clone)]
pub struct CssComplexSelector {
    pub children: Vec<CssRelativeSelector>,
}

/// Extract all CSS complex selectors from the stylesheet JSON.
pub fn extract_css_selectors(stylesheet: &crate::ast::css::StyleSheet) -> Vec<CssComplexSelector> {
    let mut selectors = Vec::new();
    for child in &stylesheet.children {
        extract_selectors_from_css_node(child, &mut selectors, &[]);
    }
    // A bare `:global` marker (the prelude of a `:global { ... }` BLOCK, no
    // args) makes everything AT AND AFTER it global. A nested global block
    // desugars to e.g. `article :global aside p`; without flagging the
    // `:global` and its tail as global, the bare `:global` compound matches
    // every element in `element_matches_simple_selectors`, so intermediate
    // ancestors get wrongly scoped (e.g. `<header>` for
    // `article { p {} :global { aside p {} } }`). Marking the tail global lets
    // `truncate_globals` strip it, leaving only the scoped prefix (`article`).
    for sel in &mut selectors {
        mark_global_block_tail(sel);
    }
    selectors
}

/// True when a relative selector is a bare `:global` marker — a single
/// `:global` pseudo-class with no argument list. This is the prelude of a
/// `:global { ... }` BLOCK (as opposed to the inline `:global(sel)` form,
/// which carries args).
fn is_bare_global_relative(rel: &CssRelativeSelector) -> bool {
    rel.selectors.len() == 1
        && matches!(
            &rel.selectors[0],
            CssSimpleSelector::PseudoClass(name, args) if name == "global" && args.is_none()
        )
}

/// Flag a bare `:global` block marker and every relative selector after it as
/// global, so `truncate_globals` / ancestor matching treat them as unscoped.
fn mark_global_block_tail(sel: &mut CssComplexSelector) {
    if let Some(pos) = sel.children.iter().position(is_bare_global_relative) {
        for rel in &mut sel.children[pos..] {
            rel.is_global = true;
        }
    }
}

fn extract_selectors_from_css_node(
    node: &serde_json::Value,
    selectors: &mut Vec<CssComplexSelector>,
    parent_selectors: &[CssComplexSelector],
) {
    let node_type = match node.get("type").and_then(|t| t.as_str()) {
        Some(t) => t,
        None => return,
    };
    match node_type {
        "Rule" => {
            if let Some(metadata) = node.get("metadata")
                && metadata
                    .get("is_global_block")
                    .and_then(|v| v.as_bool())
                    .unwrap_or(false)
            {
                return;
            }
            // Parse this rule's own prelude selectors
            let mut own_selectors: Vec<CssComplexSelector> = Vec::new();
            if let Some(prelude) = node.get("prelude")
                && let Some(complex_selectors) = prelude.get("children").and_then(|c| c.as_array())
            {
                for cs in complex_selectors {
                    if let Some(parsed) = parse_complex_selector(cs) {
                        own_selectors.push(parsed);
                    }
                }
            }

            // Determine the effective selectors for this rule, substituting `&`
            // (NestingSelector) with the parent rule's selectors. If there is no
            // parent rule, the selectors are used as-is. If the child selector
            // contains an explicit `&`, we replace it. If it doesn't, and we have
            // parents, the default is descendant of parent (like `parent &`).
            let effective: Vec<CssComplexSelector> = if parent_selectors.is_empty() {
                own_selectors.clone()
            } else {
                let mut out: Vec<CssComplexSelector> = Vec::new();
                for own in &own_selectors {
                    for parent in parent_selectors {
                        out.push(substitute_nesting(own, parent));
                    }
                }
                out
            };

            for sel in effective.iter().cloned() {
                selectors.push(sel);
            }

            // Recurse into nested rules with the effective selectors as the new
            // parent_selectors context.
            if let Some(block) = node.get("block")
                && let Some(children) = block.get("children").and_then(|c| c.as_array())
            {
                for child in children {
                    extract_selectors_from_css_node(child, selectors, &effective);
                }
            }
        }
        "Atrule" => {
            let is_keyframes = node
                .get("name")
                .and_then(|n| n.as_str())
                .is_some_and(|name| {
                    matches!(
                        name,
                        "keyframes" | "-webkit-keyframes" | "-moz-keyframes" | "-o-keyframes"
                    )
                });
            if !is_keyframes
                && let Some(block) = node.get("block")
                && let Some(children) = block.get("children").and_then(|c| c.as_array())
            {
                for child in children {
                    extract_selectors_from_css_node(child, selectors, parent_selectors);
                }
            }
        }
        _ => {}
    }
}

/// Substitute `&` in `child` with `parent`. If `child` has no explicit `&`, the
/// substitution is `parent <child>` (descendant combinator). The returned selector
/// represents the fully-resolved selector as if written at the top level.
fn substitute_nesting(
    child: &CssComplexSelector,
    parent: &CssComplexSelector,
) -> CssComplexSelector {
    let has_nesting = child.children.iter().any(|rel| {
        rel.selectors
            .iter()
            .any(|s| matches!(s, CssSimpleSelector::Nesting))
    });

    if !has_nesting {
        // No explicit `&`: treat as descendant of parent
        let mut combined = parent.children.clone();
        // First child selector of `child` becomes descendant of parent
        for (i, rel) in child.children.iter().enumerate() {
            let mut r = rel.clone();
            if i == 0 && r.combinator.is_none() {
                r.combinator = Some(" ".to_string());
            }
            combined.push(r);
        }
        return CssComplexSelector { children: combined };
    }

    // Replace each relative selector that contains `&`:
    // - If the relative selector is ONLY `&`, replace it with the full parent chain.
    // - If it's `&.foo` or similar, replace the `&` simple selector with the
    //   parent's LAST relative selector's simple selectors (so `&:hover` becomes
    //   `.parent:hover`). Earlier relative selectors of parent are prepended.
    let mut result: Vec<CssRelativeSelector> = Vec::new();
    for rel in &child.children {
        let has_nest = rel
            .selectors
            .iter()
            .any(|s| matches!(s, CssSimpleSelector::Nesting));
        if !has_nest {
            result.push(rel.clone());
            continue;
        }

        // If `&` is the ONLY simple selector, replace with parent's entire chain
        if rel.selectors.len() == 1 {
            // Inline parent selectors at this position
            for (i, prel) in parent.children.iter().enumerate() {
                let mut pr = prel.clone();
                if i == 0 {
                    // Preserve this child relative selector's combinator on the
                    // first parent relative selector.
                    pr.combinator = rel.combinator.clone();
                }
                result.push(pr);
            }
            continue;
        }

        // Otherwise `&.foo` or `&:hover`: prepend parent's earlier relatives,
        // and merge parent's LAST relative's simple selectors with the non-`&`
        // simple selectors in `rel`.
        if let Some((last_parent, earlier_parent)) = parent.children.split_last() {
            for (i, prel) in earlier_parent.iter().enumerate() {
                let mut pr = prel.clone();
                if i == 0 {
                    pr.combinator = rel.combinator.clone();
                }
                result.push(pr);
            }
            let mut merged = last_parent.clone();
            if earlier_parent.is_empty() {
                merged.combinator = rel.combinator.clone();
            }
            // Append this rel's non-nesting simple selectors to parent's last
            for s in &rel.selectors {
                if !matches!(s, CssSimpleSelector::Nesting) {
                    merged.selectors.push(s.clone());
                }
            }
            result.push(merged);
        } else {
            // No parent to substitute with — keep the rel as-is minus the nesting
            let mut r = rel.clone();
            r.selectors
                .retain(|s| !matches!(s, CssSimpleSelector::Nesting));
            result.push(r);
        }
    }

    CssComplexSelector { children: result }
}

fn parse_complex_selector(cs: &serde_json::Value) -> Option<CssComplexSelector> {
    let children = cs.get("children")?.as_array()?;
    let mut relative_selectors = Vec::new();
    for rel in children {
        if let Some(parsed) = parse_relative_selector(rel) {
            relative_selectors.push(parsed);
        }
    }
    if relative_selectors.is_empty() {
        return None;
    }
    Some(CssComplexSelector {
        children: relative_selectors,
    })
}

fn parse_relative_selector(rel: &serde_json::Value) -> Option<CssRelativeSelector> {
    let combinator = rel.get("combinator").and_then(|c| {
        if c.is_null() {
            None
        } else {
            c.get("name")
                .and_then(|n| n.as_str())
                .map(|s| s.to_string())
        }
    });

    let is_global = rel
        .get("metadata")
        .and_then(|m| m.get("is_global"))
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    let selectors_json = rel.get("selectors")?.as_array()?;

    // Compute `is_global_like` the way upstream's css-analyze.js RelativeSelector
    // visitor does (the parser does not store this metadata in the JSON AST):
    // 1. every selector is a pseudo-class/pseudo-element AND the first is
    //    `:host` or a `::view-transition*` pseudo-element, or
    // 2. any selector is `:root` and none is `:has`.
    let is_global_like = rel
        .get("metadata")
        .and_then(|m| m.get("is_global_like"))
        .and_then(|v| v.as_bool())
        .unwrap_or_else(|| compute_is_global_like(selectors_json));
    let mut selectors = Vec::new();
    for sel in selectors_json {
        if let Some(parsed) = parse_simple_selector(sel) {
            selectors.push(parsed);
        }
    }

    Some(CssRelativeSelector {
        combinator,
        selectors,
        is_global,
        is_global_like,
    })
}

/// Mirror of upstream css-analyze.js RelativeSelector visitor's
/// `is_global_like` computation (lines 156-181).
fn compute_is_global_like(selectors_json: &[serde_json::Value]) -> bool {
    let ty = |s: &serde_json::Value| {
        s.get("type")
            .and_then(|t| t.as_str())
            .unwrap_or("")
            .to_string()
    };
    let name = |s: &serde_json::Value| {
        s.get("name")
            .and_then(|n| n.as_str())
            .unwrap_or("")
            .to_string()
    };

    if !selectors_json.is_empty()
        && selectors_json.iter().all(|s| {
            matches!(
                ty(s).as_str(),
                "PseudoClassSelector" | "PseudoElementSelector"
            )
        })
    {
        let first = &selectors_json[0];
        let first_ty = ty(first);
        let first_name = name(first);
        if (first_ty == "PseudoClassSelector" && first_name == "host")
            || (first_ty == "PseudoElementSelector"
                && matches!(
                    first_name.as_str(),
                    "view-transition"
                        | "view-transition-group"
                        | "view-transition-old"
                        | "view-transition-new"
                        | "view-transition-image-pair"
                ))
        {
            return true;
        }
    }

    selectors_json
        .iter()
        .any(|s| ty(s) == "PseudoClassSelector" && name(s) == "root")
        && !selectors_json
            .iter()
            .any(|s| ty(s) == "PseudoClassSelector" && name(s) == "has")
}

fn parse_simple_selector(sel: &serde_json::Value) -> Option<CssSimpleSelector> {
    let sel_type = sel.get("type")?.as_str()?;
    match sel_type {
        "TypeSelector" => {
            let name = sel.get("name")?.as_str()?.to_string();
            Some(CssSimpleSelector::Type(name))
        }
        "ClassSelector" => {
            let name = sel.get("name")?.as_str()?.to_string();
            Some(CssSimpleSelector::Class(decode_css_escape(&name)))
        }
        "IdSelector" => {
            let name = sel.get("name")?.as_str()?.to_string();
            Some(CssSimpleSelector::Id(decode_css_escape(&name)))
        }
        "AttributeSelector" => {
            let name = sel
                .get("name")
                .and_then(|n| n.as_str())
                .unwrap_or("")
                .to_string();
            let matcher = sel
                .get("matcher")
                .and_then(|m| if m.is_null() { None } else { m.as_str() })
                .map(|s| s.to_string());
            let value = sel
                .get("value")
                .and_then(|v| if v.is_null() { None } else { v.as_str() })
                .map(|s| s.to_string());
            let flags = sel
                .get("flags")
                .and_then(|f| if f.is_null() { None } else { f.as_str() })
                .map(|s| s.to_string());
            Some(CssSimpleSelector::Attribute {
                name,
                matcher,
                value,
                flags,
            })
        }
        "PseudoClassSelector" => {
            let name = sel.get("name")?.as_str()?.to_string();
            let args = sel.get("args").and_then(|args| {
                if args.is_null() {
                    return None;
                }
                let children = args.get("children")?.as_array()?;
                let mut complex_selectors = Vec::new();
                for cs in children {
                    if let Some(parsed) = parse_complex_selector(cs) {
                        complex_selectors.push(parsed);
                    }
                }
                Some(complex_selectors)
            });
            Some(CssSimpleSelector::PseudoClass(name, args))
        }
        "PseudoElementSelector" => Some(CssSimpleSelector::PseudoElement),
        "NestingSelector" => Some(CssSimpleSelector::Nesting),
        _ => None,
    }
}

/// HTML attributes whose enumerated values are case-insensitive per the HTML spec.
const CASE_INSENSITIVE_ATTRIBUTES: &[&str] = &[
    "accept-charset",
    "autocapitalize",
    "autocomplete",
    "behavior",
    "charset",
    "crossorigin",
    "decoding",
    "dir",
    "direction",
    "draggable",
    "enctype",
    "enterkeyhint",
    "fetchpriority",
    "formenctype",
    "formmethod",
    "formtarget",
    "hidden",
    "http-equiv",
    "inputmode",
    "kind",
    "loading",
    "method",
    "preload",
    "referrerpolicy",
    "rel",
    "rev",
    "role",
    "rules",
    "scope",
    "shape",
    "spellcheck",
    "target",
    "translate",
    "type",
    "valign",
    "wrap",
];

/// Whitelisted attributes for specific elements that should be considered as matching.
fn whitelist_attribute_selector(tag_name: &str) -> &'static [&'static str] {
    match tag_name.to_lowercase().as_str() {
        "details" => &["open"],
        "dialog" => &["open"],
        _ => &[],
    }
}

/// Unquote a CSS string value (remove surrounding quotes if present).
fn unquote(s: &str) -> &str {
    if s.len() >= 2 {
        let first = s.as_bytes()[0];
        let last = s.as_bytes()[s.len() - 1];
        if (first == b'"' || first == b'\'') && first == last {
            return &s[1..s.len() - 1];
        }
    }
    s
}

/// Test an attribute value against a CSS attribute selector operator.
fn test_attribute(operator: &str, expected: &str, case_insensitive: bool, value: &str) -> bool {
    let (expected, value) = if case_insensitive {
        (expected.to_lowercase(), value.to_lowercase())
    } else {
        (expected.to_string(), value.to_string())
    };
    match operator {
        "=" => value == expected,
        "~=" => value.split_whitespace().any(|w| w == expected),
        "|=" => format!("{}-", value).starts_with(&format!("{}-", expected)),
        "^=" => value.starts_with(&expected),
        "$=" => value.ends_with(&expected),
        "*=" => value.contains(&expected),
        _ => false,
    }
}

/// Check if an element's attributes match a CSS attribute selector.
fn attribute_matches(
    element: &ElementInfo,
    attr_name: &str,
    expected_value: Option<&str>,
    operator: Option<&str>,
    case_insensitive: bool,
) -> bool {
    // SpreadAttribute makes any attribute potentially present
    if element.has_spread {
        return true;
    }

    let attr_name_lower = attr_name.to_lowercase();

    // Check bind directives
    for bind_name in &element.bind_names {
        if bind_name == attr_name {
            return true;
        }
    }

    // Check style directive
    if attr_name_lower == "style" && element.has_style_directive {
        return true;
    }

    // Check class directive
    if attr_name_lower == "class" {
        for cd_name in &element.class_directive_names {
            if let Some(op) = operator {
                if op == "~=" {
                    if let Some(expected) = expected_value
                        && cd_name == expected
                    {
                        return true;
                    }
                } else {
                    return true;
                }
            } else {
                return true;
            }
        }
    }

    // Check regular attributes
    for (name, value) in &element.attributes {
        if name.to_lowercase() != attr_name_lower {
            continue;
        }

        match value {
            AttrValue::Boolean => {
                // Boolean attribute: matches [attr] but not [attr="value"]
                return operator.is_none();
            }
            AttrValue::Dynamic => {
                // Dynamic attribute: can't determine the value, so assume it could match
                return true;
            }
            AttrValue::PossibleValues(values) => {
                // Dynamic attribute with known possible values - check if any match.
                if expected_value.is_none() {
                    return true;
                }
                if let (Some(op), Some(expected)) = (operator, expected_value) {
                    // Reconstruct concatenated possible strings similar to official
                    // `possible_values` logic. For a simple first-pass, treat each
                    // value as an independent candidate (joined by space when class).
                    let matches = values
                        .iter()
                        .any(|v| test_attribute(op, expected, case_insensitive, v));
                    if !matches && (attr_name_lower == "class" || attr_name_lower == "style") {
                        continue;
                    }
                    return matches;
                }
            }
            AttrValue::Static(attr_val) => {
                // Static attribute: check against the value
                if expected_value.is_none() {
                    return true;
                }
                if let (Some(op), Some(expected)) = (operator, expected_value) {
                    let matches = test_attribute(op, expected, case_insensitive, attr_val);
                    // continue if we still may match against a class/style directive
                    if !matches && (attr_name_lower == "class" || attr_name_lower == "style") {
                        continue;
                    }
                    return matches;
                }
            }
        }
    }

    false
}

/// Check if a relative selector is global or global-like.
fn is_relative_selector_global(rel: &CssRelativeSelector) -> bool {
    if rel.is_global || rel.is_global_like {
        return true;
    }

    if rel.selectors.is_empty() {
        return false;
    }

    // Mirror official compiler's `is_global`: the first selector must be :global,
    // and if it has args, every selector in the relative must be either an
    // unscoped pseudo-class or a pseudo-element.
    let first = &rel.selectors[0];
    if let CssSimpleSelector::PseudoClass(name, args) = first
        && name == "global"
    {
        if args.is_none() {
            return true;
        }
        // :global(...) with args: only if every other selector is a pseudo-element
        // or a pseudo-class that does not scope (mirroring the official compiler).
        return rel.selectors.iter().all(is_unscoped_or_pseudo_element);
    }

    // Check for global-like pseudo-classes (e.g. :host, :root) as the sole selector.
    if rel.selectors.len() == 1
        && let CssSimpleSelector::PseudoClass(name, args) = &rel.selectors[0]
        && is_unscoped_pseudo_class(name, args.is_some())
    {
        return true;
    }

    false
}

/// Check if a pseudo-class is unscoped.
fn is_unscoped_pseudo_class(name: &str, has_args: bool) -> bool {
    match name {
        "host" | "root" => !has_args,
        _ => false,
    }
}

/// Mirror of the official compiler's `is_unscoped_pseudo_class`: returns `true`
/// for pseudo-classes that don't add scoping (everything except `:has`, `:is`,
/// `:where`, and some `:not` forms), or any pseudo-element.
fn is_unscoped_or_pseudo_element(sel: &CssSimpleSelector) -> bool {
    match sel {
        CssSimpleSelector::PseudoElement | CssSimpleSelector::Nesting => true,
        CssSimpleSelector::PseudoClass(name, args) => {
            if name != "has" && name != "is" && name != "where" {
                if name != "not" {
                    return true;
                }
                // :not with args: unscoped if all inner children are single-element.
                if let Some(cs_args) = args.as_ref() {
                    return cs_args.iter().all(|cs| cs.children.len() == 1);
                }
                return true;
            }
            // :has/:is/:where: unscoped only if all inner relatives are themselves global.
            if let Some(cs_args) = args.as_ref() {
                return cs_args
                    .iter()
                    .all(|cs| cs.children.iter().all(is_relative_selector_global));
            }
            false
        }
        _ => false,
    }
}

/// Check if an element matches a set of simple selectors (one RelativeSelector).
fn element_matches_simple_selectors(
    element: &ElementInfo,
    selectors: &[CssSimpleSelector],
) -> bool {
    for selector in selectors {
        match selector {
            CssSimpleSelector::Type(name) => {
                if name != "*"
                    && !element.is_dynamic
                    && !name.eq_ignore_ascii_case(&element.tag_name)
                {
                    return false;
                }
            }
            CssSimpleSelector::Class(name) => {
                if !attribute_matches(element, "class", Some(name), Some("~="), false) {
                    return false;
                }
            }
            CssSimpleSelector::Id(name) => {
                if !attribute_matches(element, "id", Some(name), Some("="), false) {
                    return false;
                }
            }
            CssSimpleSelector::Attribute {
                name,
                matcher,
                value,
                flags,
            } => {
                // Check whitelisted attributes
                let whitelisted = whitelist_attribute_selector(&element.tag_name);
                if whitelisted.iter().any(|w| w.eq_ignore_ascii_case(name)) {
                    continue;
                }

                let expected_value = value.as_deref().map(unquote);

                let ci = flags.as_deref().map(|f| f.contains('i')).unwrap_or(false)
                    || (!flags.as_deref().map(|f| f.contains('s')).unwrap_or(false)
                        && CASE_INSENSITIVE_ATTRIBUTES
                            .iter()
                            .any(|a| a.eq_ignore_ascii_case(name)));

                if !attribute_matches(element, name, expected_value, matcher.as_deref(), ci) {
                    return false;
                }
            }
            CssSimpleSelector::PseudoClass(name, args) => {
                if name == "host" || name == "root" {
                    return false;
                }
                if name == "global" && args.is_none() {
                    return true;
                }
                if name == "global" && args.is_some() {
                    let args = args.as_ref().unwrap();
                    if !args.is_empty() && selectors.len() == 1 {
                        let cs = &args[0];
                        if let Some(last) = cs.children.last() {
                            return element_matches_simple_selectors(element, &last.selectors);
                        }
                    }
                    continue;
                }
                if (name == "is" || name == "where") && args.is_some() {
                    let args = args.as_ref().unwrap();
                    let any_matches = args.iter().any(|cs| {
                        if let Some(last) = cs.children.last() {
                            element_matches_simple_selectors(element, &last.selectors)
                        } else {
                            false
                        }
                    });
                    if !any_matches {
                        return false;
                    }
                }
                // Other pseudo-classes (hover, focus, etc.) always match
            }
            CssSimpleSelector::PseudoElement | CssSimpleSelector::Nesting => {}
        }
    }
    true
}

/// Truncate trailing global selectors from a complex selector's children.
fn truncate_globals(children: &[CssRelativeSelector]) -> &[CssRelativeSelector] {
    let last_non_global = children
        .iter()
        .rposition(|rel| !is_relative_selector_global(rel));
    match last_non_global {
        Some(idx) => &children[..=idx],
        None => &[],
    }
}

/// Check if a complex selector has a sibling combinator (+ or ~).
fn has_sibling_combinator(selector: &CssComplexSelector) -> bool {
    let effective = truncate_globals(&selector.children);
    effective.iter().any(|rel| {
        rel.combinator
            .as_deref()
            .is_some_and(|c| c == "+" || c == "~")
    })
}

/// Extract the callee name from a RenderTag expression.
fn get_render_tag_callee_name(render_tag: &template::RenderTag) -> Option<String> {
    // Use JSON-based approach to avoid arena dependency
    let expr_json = render_tag.expression.as_json();
    let expr = if expr_json.get("type").and_then(|t| t.as_str()) == Some("ChainExpression") {
        expr_json.get("expression").unwrap_or(expr_json)
    } else {
        expr_json
    };
    let callee = expr.get("callee")?;
    if callee.get("type").and_then(|t| t.as_str()) == Some("Identifier") {
        callee
            .get("name")
            .and_then(|n| n.as_str())
            .map(String::from)
    } else {
        None
    }
}

/// Extract the name of a SnippetBlock from its expression.
fn get_snippet_block_name(snippet: &template::SnippetBlock) -> Option<String> {
    snippet.expression.identifier_name().map(String::from)
}

/// Mapping from snippet name to the list of ancestor chains at each render site.
type SnippetAncestorMap = FxHashMap<String, Vec<Vec<ElementInfo>>>;

/// Pre-pass: Walk the template tree to collect render site ancestor chains.
fn collect_render_site_ancestors(fragment: &Fragment) -> SnippetAncestorMap {
    let mut map: SnippetAncestorMap = FxHashMap::default();
    let mut ancestors: Vec<ElementInfo> = Vec::new();
    collect_render_sites_in_fragment(fragment, &mut ancestors, &mut map);
    map
}

fn collect_render_sites_in_fragment(
    fragment: &Fragment,
    ancestors: &mut Vec<ElementInfo>,
    map: &mut SnippetAncestorMap,
) {
    for node in &fragment.nodes {
        collect_render_sites_in_node(node, ancestors, map);
    }
}

fn collect_render_sites_in_node(
    node: &TemplateNode,
    ancestors: &mut Vec<ElementInfo>,
    map: &mut SnippetAncestorMap,
) {
    match node {
        TemplateNode::RegularElement(el) => {
            let element_info = ElementInfo::from_element(el);
            ancestors.push(element_info);
            collect_render_sites_in_fragment(&el.fragment, ancestors, map);
            ancestors.pop();
        }
        TemplateNode::SvelteElement(el) => {
            let element_info = ElementInfo::from_svelte_element(el);
            ancestors.push(element_info);
            collect_render_sites_in_fragment(&el.fragment, ancestors, map);
            ancestors.pop();
        }
        TemplateNode::RenderTag(render_tag) => {
            if let Some(name) = get_render_tag_callee_name(render_tag) {
                map.entry(name).or_default().push(ancestors.clone());
            }
        }
        TemplateNode::Component(comp) => {
            collect_render_sites_in_fragment(&comp.fragment, ancestors, map);
        }
        TemplateNode::IfBlock(if_block) => {
            collect_render_sites_in_fragment(&if_block.consequent, ancestors, map);
            if let Some(ref alt) = if_block.alternate {
                collect_render_sites_in_fragment(alt, ancestors, map);
            }
        }
        TemplateNode::EachBlock(each) => {
            collect_render_sites_in_fragment(&each.body, ancestors, map);
            if let Some(ref fallback) = each.fallback {
                collect_render_sites_in_fragment(fallback, ancestors, map);
            }
        }
        TemplateNode::AwaitBlock(await_block) => {
            if let Some(ref pending) = await_block.pending {
                collect_render_sites_in_fragment(pending, ancestors, map);
            }
            if let Some(ref then) = await_block.then {
                collect_render_sites_in_fragment(then, ancestors, map);
            }
            if let Some(ref catch) = await_block.catch {
                collect_render_sites_in_fragment(catch, ancestors, map);
            }
        }
        TemplateNode::KeyBlock(key) => {
            collect_render_sites_in_fragment(&key.fragment, ancestors, map);
        }
        TemplateNode::SnippetBlock(snippet) => {
            collect_render_sites_in_fragment(&snippet.body, ancestors, map);
        }
        TemplateNode::SvelteHead(head) => {
            collect_render_sites_in_fragment(&head.fragment, ancestors, map);
        }
        TemplateNode::SvelteBoundary(boundary) => {
            collect_render_sites_in_fragment(&boundary.fragment, ancestors, map);
        }
        TemplateNode::SlotElement(slot) => {
            collect_render_sites_in_fragment(&slot.fragment, ancestors, map);
        }
        TemplateNode::TitleElement(title) => {
            collect_render_sites_in_fragment(&title.fragment, ancestors, map);
        }
        _ => {}
    }
}

/// Mark RegularElement nodes in the fragment as scoped based on CSS selector matching.
pub fn mark_elements_scoped(
    fragment: &mut Fragment,
    css_selectors: &[CssComplexSelector],
    analysis: Option<&super::types::ComponentAnalysis>,
) {
    // Pre-pass: collect render site ancestors for each snippet
    let snippet_ancestors = collect_render_site_ancestors(fragment);
    let mut ancestors: Vec<ElementInfo> = Vec::new();
    mark_elements_in_fragment(
        fragment,
        css_selectors,
        &mut ancestors,
        &snippet_ancestors,
        analysis,
    );
}

/// Mark ALL elements in the fragment as scoped (used when @keyframes rules exist).
pub fn mark_all_elements_scoped(fragment: &mut Fragment) {
    for node in &mut fragment.nodes {
        mark_all_elements_scoped_node(node);
    }
}

fn mark_all_elements_scoped_node(node: &mut TemplateNode) {
    match node {
        TemplateNode::RegularElement(el) => {
            el.metadata.scoped = true;
            for child in &mut el.fragment.nodes {
                mark_all_elements_scoped_node(child);
            }
        }
        TemplateNode::SvelteElement(el) => {
            el.metadata.scoped = true;
            for child in &mut el.fragment.nodes {
                mark_all_elements_scoped_node(child);
            }
        }
        TemplateNode::Component(comp) => {
            for child in &mut comp.fragment.nodes {
                mark_all_elements_scoped_node(child);
            }
        }
        TemplateNode::IfBlock(if_block) => {
            for child in &mut if_block.consequent.nodes {
                mark_all_elements_scoped_node(child);
            }
            if let Some(alt) = &mut if_block.alternate {
                for child in &mut alt.nodes {
                    mark_all_elements_scoped_node(child);
                }
            }
        }
        TemplateNode::EachBlock(each) => {
            for child in &mut each.body.nodes {
                mark_all_elements_scoped_node(child);
            }
            if let Some(fallback) = &mut each.fallback {
                for child in &mut fallback.nodes {
                    mark_all_elements_scoped_node(child);
                }
            }
        }
        TemplateNode::AwaitBlock(await_block) => {
            if let Some(pending) = &mut await_block.pending {
                for child in &mut pending.nodes {
                    mark_all_elements_scoped_node(child);
                }
            }
            if let Some(then) = &mut await_block.then {
                for child in &mut then.nodes {
                    mark_all_elements_scoped_node(child);
                }
            }
            if let Some(catch) = &mut await_block.catch {
                for child in &mut catch.nodes {
                    mark_all_elements_scoped_node(child);
                }
            }
        }
        TemplateNode::KeyBlock(key) => {
            for child in &mut key.fragment.nodes {
                mark_all_elements_scoped_node(child);
            }
        }
        TemplateNode::SnippetBlock(snippet) => {
            for child in &mut snippet.body.nodes {
                mark_all_elements_scoped_node(child);
            }
        }
        TemplateNode::SvelteHead(head) => {
            for child in &mut head.fragment.nodes {
                mark_all_elements_scoped_node(child);
            }
        }
        TemplateNode::SvelteBoundary(boundary) => {
            for child in &mut boundary.fragment.nodes {
                mark_all_elements_scoped_node(child);
            }
        }
        _ => {}
    }
}

/// Walk a fragment and mark elements as scoped.
fn mark_elements_in_fragment(
    fragment: &mut Fragment,
    css_selectors: &[CssComplexSelector],
    ancestors: &mut Vec<ElementInfo>,
    snippet_ancestors: &SnippetAncestorMap,
    analysis: Option<&super::types::ComponentAnalysis>,
) {
    // Selectors containing `:has(...)` are handled exclusively by the
    // graph-based pass (which evaluates `:has` faithfully); everything else
    // goes through the direct-matching passes below.
    let direct_selectors: Vec<CssComplexSelector> = css_selectors
        .iter()
        .filter(|s| !selector_contains_has(s))
        .cloned()
        .collect();

    // First pass: mark elements that match CSS selectors directly (type/class/id/ancestor matching)
    for node in &mut fragment.nodes {
        process_node_scoping(node, &direct_selectors, ancestors, snippet_ancestors);
    }

    // Second pass: sibling-combinator and `:has(...)` selectors, evaluated
    // with the upstream-faithful `apply_selector` port over the node graph.
    let mut marks: FxHashSet<(u32, u32)> = FxHashSet::default();
    process_graph_selectors(fragment, css_selectors, analysis, &mut marks);
    if !marks.is_empty() {
        apply_scoping_marks(fragment, &marks);
    }

    // Third pass: propagate scoping to ancestor elements
    propagate_ancestor_scoping(fragment, &direct_selectors, ancestors, snippet_ancestors);
}

/// Process a single node for direct CSS selector matching.
fn process_node_scoping(
    node: &mut TemplateNode,
    css_selectors: &[CssComplexSelector],
    ancestors: &mut Vec<ElementInfo>,
    snippet_ancestors: &SnippetAncestorMap,
) {
    match node {
        TemplateNode::RegularElement(el) => {
            let element_info = ElementInfo::from_element(el);
            el.metadata.scoped = css_selectors.iter().any(|selector| {
                complex_selector_matches_element(selector, &element_info, ancestors)
            });
            ancestors.push(element_info);
            for child in &mut el.fragment.nodes {
                process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
            }
            ancestors.pop();
        }
        TemplateNode::SvelteElement(el) => {
            let element_info = ElementInfo::from_svelte_element(el);
            el.metadata.scoped = css_selectors.iter().any(|selector| {
                complex_selector_matches_element(selector, &element_info, ancestors)
            });
            ancestors.push(element_info);
            for child in &mut el.fragment.nodes {
                process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
            }
            ancestors.pop();
        }
        TemplateNode::Component(comp) => {
            for child in &mut comp.fragment.nodes {
                process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
            }
        }
        TemplateNode::IfBlock(if_block) => {
            for child in &mut if_block.consequent.nodes {
                process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
            }
            if let Some(ref mut alt) = if_block.alternate {
                for child in &mut alt.nodes {
                    process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
                }
            }
        }
        TemplateNode::EachBlock(each) => {
            for child in &mut each.body.nodes {
                process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
            }
            if let Some(ref mut fallback) = each.fallback {
                for child in &mut fallback.nodes {
                    process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
                }
            }
        }
        TemplateNode::AwaitBlock(await_block) => {
            if let Some(ref mut pending) = await_block.pending {
                for child in &mut pending.nodes {
                    process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
                }
            }
            if let Some(ref mut then) = await_block.then {
                for child in &mut then.nodes {
                    process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
                }
            }
            if let Some(ref mut catch) = await_block.catch {
                for child in &mut catch.nodes {
                    process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
                }
            }
        }
        TemplateNode::KeyBlock(key) => {
            for child in &mut key.fragment.nodes {
                process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
            }
        }
        TemplateNode::SnippetBlock(snippet) => {
            // Get the snippet name and look up render site ancestors
            let snippet_name = get_snippet_block_name(snippet);
            let render_ancestors = snippet_name
                .as_ref()
                .and_then(|name| snippet_ancestors.get(name));

            if let Some(render_site_chains) = render_ancestors {
                // Process snippet body with each render site's ancestor chain.
                // This ensures elements inside snippets inherit CSS scoping from
                // where they are rendered ({@render} call site), not where defined.
                for site_ancestors in render_site_chains {
                    let mut merged = site_ancestors.clone();
                    for child in &mut snippet.body.nodes {
                        process_node_scoping(child, css_selectors, &mut merged, snippet_ancestors);
                    }
                }
            } else {
                // No render sites found (or dynamic render), process with current ancestors
                for child in &mut snippet.body.nodes {
                    process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
                }
            }
        }
        TemplateNode::SvelteHead(head) => {
            for child in &mut head.fragment.nodes {
                process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
            }
        }
        TemplateNode::SvelteBoundary(boundary) => {
            for child in &mut boundary.fragment.nodes {
                process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
            }
        }
        TemplateNode::SlotElement(slot) => {
            for child in &mut slot.fragment.nodes {
                process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
            }
        }
        TemplateNode::TitleElement(title) => {
            for child in &mut title.fragment.nodes {
                process_node_scoping(child, css_selectors, ancestors, snippet_ancestors);
            }
        }
        _ => {}
    }
}

/// Apply scoping marks to elements whose (start, end) positions are in the set.
fn apply_scoping_marks(fragment: &mut Fragment, elements_to_scope: &FxHashSet<(u32, u32)>) {
    for node in &mut fragment.nodes {
        match node {
            TemplateNode::RegularElement(el) => {
                if elements_to_scope.contains(&(el.start, el.end)) {
                    el.metadata.scoped = true;
                }
                apply_scoping_marks(&mut el.fragment, elements_to_scope);
            }
            TemplateNode::SvelteElement(el) => {
                if elements_to_scope.contains(&(el.start, el.end)) {
                    el.metadata.scoped = true;
                }
                apply_scoping_marks(&mut el.fragment, elements_to_scope);
            }
            TemplateNode::Component(comp) => {
                apply_scoping_marks(&mut comp.fragment, elements_to_scope);
            }
            TemplateNode::IfBlock(if_block) => {
                apply_scoping_marks(&mut if_block.consequent, elements_to_scope);
                if let Some(ref mut alt) = if_block.alternate {
                    apply_scoping_marks(alt, elements_to_scope);
                }
            }
            TemplateNode::EachBlock(each) => {
                apply_scoping_marks(&mut each.body, elements_to_scope);
                if let Some(ref mut fallback) = each.fallback {
                    apply_scoping_marks(fallback, elements_to_scope);
                }
            }
            TemplateNode::AwaitBlock(await_block) => {
                if let Some(ref mut pending) = await_block.pending {
                    apply_scoping_marks(pending, elements_to_scope);
                }
                if let Some(ref mut then) = await_block.then {
                    apply_scoping_marks(then, elements_to_scope);
                }
                if let Some(ref mut catch) = await_block.catch {
                    apply_scoping_marks(catch, elements_to_scope);
                }
            }
            TemplateNode::KeyBlock(key) => {
                apply_scoping_marks(&mut key.fragment, elements_to_scope);
            }
            TemplateNode::SnippetBlock(snippet) => {
                apply_scoping_marks(&mut snippet.body, elements_to_scope);
            }
            TemplateNode::SvelteHead(head) => {
                apply_scoping_marks(&mut head.fragment, elements_to_scope);
            }
            TemplateNode::SvelteBoundary(boundary) => {
                apply_scoping_marks(&mut boundary.fragment, elements_to_scope);
            }
            TemplateNode::SlotElement(slot) => {
                apply_scoping_marks(&mut slot.fragment, elements_to_scope);
            }
            TemplateNode::TitleElement(title) => {
                apply_scoping_marks(&mut title.fragment, elements_to_scope);
            }
            _ => {}
        }
    }
}

/// Check if a complex selector matches an element, considering combinators.
fn complex_selector_matches_element(
    selector: &CssComplexSelector,
    element: &ElementInfo,
    ancestors: &[ElementInfo],
) -> bool {
    let children = &selector.children;
    if children.is_empty() {
        return false;
    }

    let effective_children = truncate_globals(children);
    if effective_children.is_empty() {
        return false;
    }

    let last = &effective_children[effective_children.len() - 1];
    if !element_matches_simple_selectors(element, &last.selectors) {
        return false;
    }

    if effective_children.len() == 1 {
        return true;
    }

    apply_combinator_chain(
        &effective_children[..effective_children.len() - 1],
        last,
        ancestors,
        ancestors.len(),
    )
}

/// Check if a relative selector is a "bare" global (matches anything).
/// Returns false for `:global(specific_element)` which must still be matched.
fn is_bare_global(rel: &CssRelativeSelector) -> bool {
    if rel.is_global_like {
        return true;
    }
    // Bare :global (no args) is a wildcard
    if rel.selectors.len() == 1
        && let CssSimpleSelector::PseudoClass(name, args) = &rel.selectors[0]
    {
        if name == "global" && args.is_none() {
            return true;
        }
        if is_unscoped_pseudo_class(name, args.is_some()) {
            return true;
        }
    }
    false
}

/// Try to match an ancestor element against a global-with-args selector like `:global(b)`.
/// Extracts the inner selectors and checks if the element matches them.
fn global_selector_matches_element(rel: &CssRelativeSelector, element: &ElementInfo) -> bool {
    if rel.selectors.len() == 1
        && let CssSimpleSelector::PseudoClass(name, Some(args)) = &rel.selectors[0]
        && name == "global"
    {
        // Check if any complex selector in the args matches the element
        for cs in args {
            if let Some(last) = cs.children.last()
                && element_matches_simple_selectors(element, &last.selectors)
            {
                return true;
            }
        }
        return false;
    }
    false
}

/// Check if a relative selector can match a given element.
/// Handles both regular selectors and :global(x) selectors.
fn selector_matches_element(rel: &CssRelativeSelector, element: &ElementInfo) -> bool {
    if is_bare_global(rel) {
        return true;
    }
    if global_selector_matches_element(rel, element) {
        return true;
    }
    element_matches_simple_selectors(element, &rel.selectors)
}

/// Apply combinator chain backward through ancestors.
fn apply_combinator_chain(
    remaining: &[CssRelativeSelector],
    current_rel: &CssRelativeSelector,
    ancestors: &[ElementInfo],
    cursor: usize,
) -> bool {
    if remaining.is_empty() {
        return true;
    }

    let combinator = current_rel.combinator.as_deref().unwrap_or(" ");

    match combinator {
        ">" => {
            let next_sel = &remaining[remaining.len() - 1];

            if cursor == 0 {
                // No more ancestors known - if remaining are all global (bare or typed),
                // they could match elements outside the component
                return remaining.iter().all(is_relative_selector_global);
            }

            let parent = &ancestors[cursor - 1];
            if selector_matches_element(next_sel, parent) {
                if remaining.len() == 1 {
                    return true;
                }
                return apply_combinator_chain(
                    &remaining[..remaining.len() - 1],
                    next_sel,
                    ancestors,
                    cursor - 1,
                );
            }
            // Parent didn't match. For `>` combinator with a known parent,
            // the global fallback only applies when there are no parents (cursor == 0).
            false
        }
        " " => {
            let next_sel = &remaining[remaining.len() - 1];

            if is_bare_global(next_sel) {
                if remaining.len() == 1 {
                    return true;
                }
                for i in (0..cursor).rev() {
                    if apply_combinator_chain(
                        &remaining[..remaining.len() - 1],
                        next_sel,
                        ancestors,
                        i + 1,
                    ) {
                        return true;
                    }
                }
                return remaining.iter().all(is_relative_selector_global);
            }

            for i in (0..cursor).rev() {
                if selector_matches_element(next_sel, &ancestors[i]) {
                    if remaining.len() == 1 {
                        return true;
                    }
                    if apply_combinator_chain(
                        &remaining[..remaining.len() - 1],
                        next_sel,
                        ancestors,
                        i,
                    ) {
                        return true;
                    }
                }
            }
            // No ancestor matched - fall back to global check
            remaining.iter().all(is_relative_selector_global)
        }
        "+" | "~" => {
            // Sibling combinators are handled by process_sibling_selectors
            // Return false here - the sibling processing pass will handle actual matching
            false
        }
        _ => true,
    }
}

/// Check if an element matches a non-subject (ancestor) part of a selector.
fn element_is_ancestor_in_matching_selector(
    element: &ElementInfo,
    selector: &CssComplexSelector,
) -> bool {
    let children = &selector.children;
    if children.len() < 2 {
        return false;
    }

    let effective_children = truncate_globals(children);
    if effective_children.len() < 2 {
        return false;
    }

    for (idx, child) in effective_children[..effective_children.len() - 1]
        .iter()
        .enumerate()
    {
        if element_matches_simple_selectors(element, &child.selectors) {
            let next = &effective_children[idx + 1];
            let comb = next.combinator.as_deref().unwrap_or(" ");
            if comb == " " || comb == ">" {
                return true;
            }
        }
    }

    false
}

/// Propagate scoping to ancestor elements.
fn propagate_ancestor_scoping(
    fragment: &mut Fragment,
    css_selectors: &[CssComplexSelector],
    ancestors: &mut Vec<ElementInfo>,
    snippet_ancestors: &SnippetAncestorMap,
) {
    for node in &mut fragment.nodes {
        match node {
            TemplateNode::RegularElement(el) => {
                let element_info = ElementInfo::from_element(el);

                if !el.metadata.scoped {
                    el.metadata.scoped = css_selectors.iter().any(|selector| {
                        element_is_ancestor_in_matching_selector(&element_info, selector)
                            && subtree_has_matching_subject(
                                &el.fragment,
                                selector,
                                &element_info,
                                ancestors,
                                snippet_ancestors,
                            )
                    });
                }

                ancestors.push(element_info);
                propagate_ancestor_scoping(
                    &mut el.fragment,
                    css_selectors,
                    ancestors,
                    snippet_ancestors,
                );
                ancestors.pop();
            }
            TemplateNode::Component(comp) => {
                propagate_ancestor_scoping(
                    &mut comp.fragment,
                    css_selectors,
                    ancestors,
                    snippet_ancestors,
                );
            }
            TemplateNode::IfBlock(if_block) => {
                propagate_ancestor_scoping(
                    &mut if_block.consequent,
                    css_selectors,
                    ancestors,
                    snippet_ancestors,
                );
                if let Some(ref mut alt) = if_block.alternate {
                    propagate_ancestor_scoping(alt, css_selectors, ancestors, snippet_ancestors);
                }
            }
            TemplateNode::EachBlock(each) => {
                propagate_ancestor_scoping(
                    &mut each.body,
                    css_selectors,
                    ancestors,
                    snippet_ancestors,
                );
                if let Some(ref mut fallback) = each.fallback {
                    propagate_ancestor_scoping(
                        fallback,
                        css_selectors,
                        ancestors,
                        snippet_ancestors,
                    );
                }
            }
            TemplateNode::AwaitBlock(await_block) => {
                if let Some(ref mut pending) = await_block.pending {
                    propagate_ancestor_scoping(
                        pending,
                        css_selectors,
                        ancestors,
                        snippet_ancestors,
                    );
                }
                if let Some(ref mut then) = await_block.then {
                    propagate_ancestor_scoping(then, css_selectors, ancestors, snippet_ancestors);
                }
                if let Some(ref mut catch) = await_block.catch {
                    propagate_ancestor_scoping(catch, css_selectors, ancestors, snippet_ancestors);
                }
            }
            TemplateNode::KeyBlock(key) => {
                propagate_ancestor_scoping(
                    &mut key.fragment,
                    css_selectors,
                    ancestors,
                    snippet_ancestors,
                );
            }
            TemplateNode::SnippetBlock(snippet) => {
                let snippet_name = get_snippet_block_name(snippet);
                let render_site_chains = snippet_name
                    .as_ref()
                    .and_then(|name| snippet_ancestors.get(name));
                if let Some(chains) = render_site_chains {
                    for site_anc in chains {
                        // Snippet bodies use the render-site ancestor chain
                        // rather than the current one. Clone is bounded by the
                        // (small) chain length and the snippet count.
                        let mut chain = site_anc.clone();
                        propagate_ancestor_scoping(
                            &mut snippet.body,
                            css_selectors,
                            &mut chain,
                            snippet_ancestors,
                        );
                    }
                } else {
                    propagate_ancestor_scoping(
                        &mut snippet.body,
                        css_selectors,
                        ancestors,
                        snippet_ancestors,
                    );
                }
            }
            TemplateNode::SvelteHead(head) => {
                propagate_ancestor_scoping(
                    &mut head.fragment,
                    css_selectors,
                    ancestors,
                    snippet_ancestors,
                );
            }
            TemplateNode::SvelteBoundary(boundary) => {
                propagate_ancestor_scoping(
                    &mut boundary.fragment,
                    css_selectors,
                    ancestors,
                    snippet_ancestors,
                );
            }
            TemplateNode::SvelteElement(el) => {
                let element_info = ElementInfo::from_svelte_element(el);

                if !el.metadata.scoped {
                    el.metadata.scoped = css_selectors.iter().any(|selector| {
                        element_is_ancestor_in_matching_selector(&element_info, selector)
                            && subtree_has_matching_subject(
                                &el.fragment,
                                selector,
                                &element_info,
                                ancestors,
                                snippet_ancestors,
                            )
                    });
                }

                ancestors.push(element_info);
                propagate_ancestor_scoping(
                    &mut el.fragment,
                    css_selectors,
                    ancestors,
                    snippet_ancestors,
                );
                ancestors.pop();
            }
            TemplateNode::SlotElement(slot) => {
                propagate_ancestor_scoping(
                    &mut slot.fragment,
                    css_selectors,
                    ancestors,
                    snippet_ancestors,
                );
            }
            TemplateNode::TitleElement(title) => {
                propagate_ancestor_scoping(
                    &mut title.fragment,
                    css_selectors,
                    ancestors,
                    snippet_ancestors,
                );
            }
            _ => {}
        }
    }
}

/// Check if any element in the subtree matches the subject of a selector.
fn subtree_has_matching_subject(
    fragment: &Fragment,
    selector: &CssComplexSelector,
    ancestor_element: &ElementInfo,
    ancestors: &mut Vec<ElementInfo>,
    snippet_ancestors: &SnippetAncestorMap,
) -> bool {
    // Push the immediate ancestor element onto the shared chain rather than
    // cloning the entire chain. Clone of `ancestor_element` is unavoidable
    // because the caller still owns it.
    ancestors.push(ancestor_element.clone());
    let result =
        subtree_has_matching_subject_inner(fragment, selector, ancestors, snippet_ancestors);
    ancestors.pop();
    result
}

fn subtree_has_matching_subject_inner(
    fragment: &Fragment,
    selector: &CssComplexSelector,
    ancestors: &mut Vec<ElementInfo>,
    snippet_ancestors: &SnippetAncestorMap,
) -> bool {
    let effective = truncate_globals(&selector.children);
    let subject_sel = effective.last();

    for node in &fragment.nodes {
        match node {
            TemplateNode::RegularElement(el) => {
                let element_info = ElementInfo::from_element(el);
                if complex_selector_matches_element(selector, &element_info, ancestors) {
                    return true;
                }
                // For selectors with sibling combinators, the sibling pass may have already
                // scoped this element. Check if it's scoped and matches the subject selector.
                if el.metadata.scoped
                    && let Some(subj) = subject_sel
                    && element_matches_simple_selectors(&element_info, &subj.selectors)
                {
                    return true;
                }
                ancestors.push(element_info);
                let matched = subtree_has_matching_subject_inner(
                    &el.fragment,
                    selector,
                    ancestors,
                    snippet_ancestors,
                );
                ancestors.pop();
                if matched {
                    return true;
                }
            }
            TemplateNode::SvelteElement(el) => {
                let element_info = ElementInfo::from_svelte_element(el);
                if complex_selector_matches_element(selector, &element_info, ancestors) {
                    return true;
                }
                if el.metadata.scoped
                    && let Some(subj) = subject_sel
                    && element_matches_simple_selectors(&element_info, &subj.selectors)
                {
                    return true;
                }
                ancestors.push(element_info);
                let matched = subtree_has_matching_subject_inner(
                    &el.fragment,
                    selector,
                    ancestors,
                    snippet_ancestors,
                );
                ancestors.pop();
                if matched {
                    return true;
                }
            }
            TemplateNode::Component(comp)
                if subtree_has_matching_subject_inner(
                    &comp.fragment,
                    selector,
                    ancestors,
                    snippet_ancestors,
                ) =>
            {
                return true;
            }
            TemplateNode::IfBlock(if_block) => {
                if subtree_has_matching_subject_inner(
                    &if_block.consequent,
                    selector,
                    ancestors,
                    snippet_ancestors,
                ) {
                    return true;
                }
                if let Some(ref alt) = if_block.alternate
                    && subtree_has_matching_subject_inner(
                        alt,
                        selector,
                        ancestors,
                        snippet_ancestors,
                    )
                {
                    return true;
                }
            }
            TemplateNode::EachBlock(each) => {
                if subtree_has_matching_subject_inner(
                    &each.body,
                    selector,
                    ancestors,
                    snippet_ancestors,
                ) {
                    return true;
                }
                if let Some(ref fallback) = each.fallback
                    && subtree_has_matching_subject_inner(
                        fallback,
                        selector,
                        ancestors,
                        snippet_ancestors,
                    )
                {
                    return true;
                }
            }
            TemplateNode::AwaitBlock(await_block) => {
                if let Some(ref pending) = await_block.pending
                    && subtree_has_matching_subject_inner(
                        pending,
                        selector,
                        ancestors,
                        snippet_ancestors,
                    )
                {
                    return true;
                }
                if let Some(ref then) = await_block.then
                    && subtree_has_matching_subject_inner(
                        then,
                        selector,
                        ancestors,
                        snippet_ancestors,
                    )
                {
                    return true;
                }
                if let Some(ref catch) = await_block.catch
                    && subtree_has_matching_subject_inner(
                        catch,
                        selector,
                        ancestors,
                        snippet_ancestors,
                    )
                {
                    return true;
                }
            }
            TemplateNode::KeyBlock(key)
                if subtree_has_matching_subject_inner(
                    &key.fragment,
                    selector,
                    ancestors,
                    snippet_ancestors,
                ) =>
            {
                return true;
            }
            TemplateNode::SnippetBlock(snippet)
                if subtree_has_matching_subject_inner(
                    &snippet.body,
                    selector,
                    ancestors,
                    snippet_ancestors,
                ) =>
            {
                return true;
            }
            TemplateNode::SlotElement(slot)
                if subtree_has_matching_subject_inner(
                    &slot.fragment,
                    selector,
                    ancestors,
                    snippet_ancestors,
                ) =>
            {
                return true;
            }
            TemplateNode::RenderTag(render_tag) => {
                // When we encounter a render tag, follow into the rendered snippet's body
                // to check if it contains matching elements (as descendants of the current ancestors)
                if let Some(name) = get_render_tag_callee_name(render_tag) {
                    // Find snippets with this name in the fragment tree
                    // We can check snippet_ancestors to know if there's a snippet with this name
                    if snippet_ancestors.contains_key(&name) {
                        // Look for snippet blocks with this name in the global fragment
                        // For now, we just return true conservatively - the snippet
                        // could contain matching elements
                        // This is handled by the fact that snippet body elements
                        // are already processed with render-site ancestors
                    }
                }
            }
            _ => {}
        }
    }
    false
}

/// Decode CSS escape sequences in a selector name.
/// E.g., `foo\:bar` → `foo:bar`, `\31 23` → `123`
fn decode_css_escape(name: &str) -> String {
    if !name.contains('\\') {
        return name.to_string();
    }

    let mut result = String::new();
    let mut chars = name.chars().peekable();

    while let Some(c) = chars.next() {
        if c == '\\' {
            if let Some(&next) = chars.peek() {
                if next.is_ascii_hexdigit() {
                    // Read up to 6 hex digits
                    let mut hex_str = String::new();
                    while hex_str.len() < 6 {
                        if let Some(&h) = chars.peek() {
                            if h.is_ascii_hexdigit() {
                                hex_str.push(chars.next().unwrap());
                            } else {
                                break;
                            }
                        } else {
                            break;
                        }
                    }
                    // Parse hex and convert to char
                    if let Ok(code) = u32::from_str_radix(&hex_str, 16)
                        && let Some(decoded) = char::from_u32(code)
                    {
                        result.push(decoded);
                    }
                    // Consume optional single whitespace after hex escape
                    if let Some(&ws) = chars.peek()
                        && (ws == ' ' || ws == '\t' || ws == '\n')
                    {
                        chars.next();
                    }
                } else if next == '\n' {
                    chars.next();
                } else {
                    result.push(chars.next().unwrap());
                }
            }
        } else {
            result.push(c);
        }
    }

    result
}

// ============================================================================
// Upstream-faithful sibling / :has matching over a template node graph.
//
// This is a direct port of the relevant parts of the official compiler's
// `2-analyze/css/css-prune.js`: `apply_selector`, `apply_combinator`,
// `relative_selector_might_apply_to_node` (the `:has` / `:not` / `:is` /
// `:where` / `:global` handling), `get_ancestor_elements`,
// `get_descendant_elements`, `get_element_parent`,
// `get_possible_element_siblings`, `get_possible_nested_siblings` and
// `loop_child` — operating on a lightweight arena built from the template
// fragment, with the snippet linkage (`RenderTag.metadata.snippets`,
// `Component.metadata.snippets`, `SnippetBlock.metadata.sites`) resolved
// like the upstream RenderTag / shared/component.js visitors.
// ============================================================================

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Dir {
    Forward,
    Backward,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum SKind {
    Root,
    Regular,
    SvelteElem,
    Slot,
    Component,
    SvelteComponent,
    SvelteSelf,
    RenderTag,
    If,
    Each,
    Await,
    Key,
    Snippet,
    /// Containers that are not blocks (svelte:head, svelte:boundary, title, ...)
    Other,
}

fn is_block_kind(kind: SKind) -> bool {
    matches!(
        kind,
        SKind::If | SKind::Each | SKind::Await | SKind::Key | SKind::Slot
    )
}

struct SNode {
    kind: SKind,
    elem: Option<ElementInfo>,
    start: u32,
    end: u32,
    has_slot_attribute: bool,
    parent: Option<usize>,
    /// Which fragment of the parent contains this node.
    parent_fragment: usize,
    /// Index within that fragment's node list.
    parent_index: usize,
    /// Child fragments. `None` = the fragment slot is absent in the source
    /// (e.g. an `{#if}` without `{:else}`), which makes blocks non-exhaustive.
    fragments: Vec<Option<Vec<usize>>>,
    /// SnippetBlock: the snippet's name. RenderTag: the callee name.
    name: Option<String>,
}

struct SGraph {
    nodes: Vec<SNode>,
    /// renderer node id (RenderTag / Component / SvelteComponent / SvelteSelf)
    /// -> snippet node ids it may render
    renderer_snippets: FxHashMap<usize, Vec<usize>>,
    /// snippet node id -> renderer node ids ("sites")
    snippet_sites: FxHashMap<usize, Vec<usize>>,
}

impl SGraph {
    fn node(&self, id: usize) -> &SNode {
        &self.nodes[id]
    }
}

/// Build the node graph from a template fragment.
fn build_sgraph(fragment: &Fragment, analysis: Option<&super::types::ComponentAnalysis>) -> SGraph {
    let mut graph = SGraph {
        nodes: Vec::new(),
        renderer_snippets: FxHashMap::default(),
        snippet_sites: FxHashMap::default(),
    };
    // Virtual root node owning the top-level fragment.
    graph.nodes.push(SNode {
        kind: SKind::Root,
        elem: None,
        start: 0,
        end: 0,
        has_slot_attribute: false,
        parent: None,
        parent_fragment: 0,
        parent_index: 0,
        fragments: vec![Some(Vec::new())],
        name: None,
    });

    /// Accumulators shared across the recursive `add_fragment` walk.
    #[derive(Default)]
    struct WalkAccum {
        /// (renderer id, callee name or None, resolved-by-structure) collected
        /// during the walk; component "resolved" state tracked separately.
        renderers: Vec<(usize, Option<String>, bool)>,
        component_direct_snippets: FxHashMap<usize, Vec<usize>>,
        all_snippets: Vec<usize>,
        snippets_by_name: FxHashMap<String, Vec<usize>>,
    }
    let mut accum = WalkAccum::default();

    fn add_fragment(
        graph: &mut SGraph,
        nodes: &[TemplateNode],
        parent: usize,
        frag_idx: usize,
        accum: &mut WalkAccum,
    ) {
        for node in nodes {
            let id = graph.nodes.len();
            let (kind, elem, start, end, has_slot_attr, name) = match node {
                TemplateNode::RegularElement(el) => {
                    let has_slot = el.attributes.iter().any(|attr| {
                        if let template::Attribute::Attribute(a) = attr {
                            a.name.as_str().eq_ignore_ascii_case("slot")
                        } else {
                            false
                        }
                    });
                    (
                        SKind::Regular,
                        Some(ElementInfo::from_element(el)),
                        el.start,
                        el.end,
                        has_slot,
                        None,
                    )
                }
                TemplateNode::SvelteElement(el) => (
                    SKind::SvelteElem,
                    Some(ElementInfo::from_svelte_element(el)),
                    el.start,
                    el.end,
                    false,
                    None,
                ),
                TemplateNode::SlotElement(slot) => {
                    (SKind::Slot, None, slot.start, slot.end, false, None)
                }
                TemplateNode::Component(comp) => {
                    (SKind::Component, None, comp.start, comp.end, false, None)
                }
                TemplateNode::SvelteComponent(comp) => (
                    SKind::SvelteComponent,
                    None,
                    comp.start,
                    comp.end,
                    false,
                    None,
                ),
                TemplateNode::SvelteSelf(el) => {
                    (SKind::SvelteSelf, None, el.start, el.end, false, None)
                }
                TemplateNode::RenderTag(rt) => (
                    SKind::RenderTag,
                    None,
                    rt.start,
                    rt.end,
                    false,
                    get_render_tag_callee_name(rt),
                ),
                TemplateNode::IfBlock(b) => (SKind::If, None, b.start, b.end, false, None),
                TemplateNode::EachBlock(b) => (SKind::Each, None, b.start, b.end, false, None),
                TemplateNode::AwaitBlock(b) => (SKind::Await, None, b.start, b.end, false, None),
                TemplateNode::KeyBlock(b) => (SKind::Key, None, b.start, b.end, false, None),
                TemplateNode::SnippetBlock(s) => (
                    SKind::Snippet,
                    None,
                    s.start,
                    s.end,
                    false,
                    get_snippet_block_name(s),
                ),
                TemplateNode::SvelteHead(el)
                | TemplateNode::SvelteBoundary(el)
                | TemplateNode::SvelteFragment(el)
                | TemplateNode::SvelteBody(el)
                | TemplateNode::SvelteDocument(el)
                | TemplateNode::SvelteWindow(el) => {
                    (SKind::Other, None, el.start, el.end, false, None)
                }
                TemplateNode::TitleElement(t) => (SKind::Other, None, t.start, t.end, false, None),
                _ => continue,
            };

            let parent_index = graph.nodes[parent].fragments[frag_idx]
                .as_ref()
                .map(|f| f.len())
                .unwrap_or(0);
            graph.nodes.push(SNode {
                kind,
                elem,
                start,
                end,
                has_slot_attribute: has_slot_attr,
                parent: Some(parent),
                parent_fragment: frag_idx,
                parent_index,
                fragments: Vec::new(),
                name,
            });
            if let Some(frag) = graph.nodes[parent].fragments[frag_idx].as_mut() {
                frag.push(id);
            }

            // Recurse into child fragments.
            let child_fragments: Vec<Option<&Fragment>> = match node {
                TemplateNode::RegularElement(el) => vec![Some(&el.fragment)],
                TemplateNode::SvelteElement(el) => vec![Some(&el.fragment)],
                TemplateNode::SlotElement(slot) => vec![Some(&slot.fragment)],
                TemplateNode::Component(comp) => vec![Some(&comp.fragment)],
                TemplateNode::SvelteComponent(comp) => vec![Some(&comp.fragment)],
                TemplateNode::SvelteSelf(el) => vec![Some(&el.fragment)],
                TemplateNode::IfBlock(b) => {
                    vec![Some(&b.consequent), b.alternate.as_ref()]
                }
                TemplateNode::EachBlock(b) => vec![Some(&b.body), b.fallback.as_ref()],
                TemplateNode::AwaitBlock(b) => {
                    vec![b.pending.as_ref(), b.then.as_ref(), b.catch.as_ref()]
                }
                TemplateNode::KeyBlock(b) => vec![Some(&b.fragment)],
                TemplateNode::SnippetBlock(s) => vec![Some(&s.body)],
                TemplateNode::SvelteHead(el)
                | TemplateNode::SvelteBoundary(el)
                | TemplateNode::SvelteFragment(el)
                | TemplateNode::SvelteBody(el)
                | TemplateNode::SvelteDocument(el)
                | TemplateNode::SvelteWindow(el) => vec![Some(&el.fragment)],
                TemplateNode::TitleElement(t) => vec![Some(&t.fragment)],
                _ => vec![],
            };
            for cf in &child_fragments {
                graph.nodes[id].fragments.push(cf.map(|_| Vec::new()));
            }
            for (i, cf) in child_fragments.iter().enumerate() {
                if let Some(f) = cf {
                    add_fragment(graph, &f.nodes, id, i, accum);
                }
            }

            // Track snippets and renderers.
            match node {
                TemplateNode::SnippetBlock(_) => {
                    accum.all_snippets.push(id);
                    if let Some(n) = graph.nodes[id].name.clone() {
                        accum.snippets_by_name.entry(n).or_default().push(id);
                    }
                }
                TemplateNode::RenderTag(rt) => {
                    let callee = get_render_tag_callee_name(rt);
                    let structurally_resolved = callee.is_some();
                    accum.renderers.push((id, callee, structurally_resolved));
                }
                TemplateNode::Component(_)
                | TemplateNode::SvelteComponent(_)
                | TemplateNode::SvelteSelf(_) => {
                    let attrs = match node {
                        TemplateNode::Component(c) => &c.attributes,
                        TemplateNode::SvelteComponent(c) => &c.attributes,
                        TemplateNode::SvelteSelf(c) => &c.attributes,
                        _ => unreachable!(),
                    };
                    let (resolved, names) = component_snippet_resolution(attrs);
                    if resolved {
                        // Direct `{#snippet}` children of the component.
                        let direct: Vec<usize> = graph.nodes[id].fragments[0]
                            .as_ref()
                            .map(|frag| {
                                frag.iter()
                                    .copied()
                                    .filter(|&c| graph.nodes[c].kind == SKind::Snippet)
                                    .collect()
                            })
                            .unwrap_or_default();
                        accum.component_direct_snippets.insert(id, direct);
                    }
                    accum.renderers.push((id, None, resolved));
                    // Names referenced via `foo={bar}` attributes are resolved
                    // against the snippet name map after the walk (stored in the
                    // otherwise-unused name slot, NUL-separated).
                    if !names.is_empty() {
                        graph.nodes[id].name = Some(names.join("\u{0}"));
                    }
                }
                _ => {}
            }
        }
    }

    add_fragment(&mut graph, &fragment.nodes, 0, 0, &mut accum);
    let WalkAccum {
        renderers,
        component_direct_snippets,
        all_snippets,
        snippets_by_name,
    } = accum;

    // Resolve renderer -> snippets, mirroring 2-analyze/index.js lines 846-855:
    // unresolved renderers link to EVERY local snippet; each linked snippet's
    // `sites` gains the renderer.
    for (renderer, callee, structurally_resolved) in &renderers {
        let node_kind = graph.nodes[*renderer].kind;
        let mut snippet_ids: Vec<usize> = Vec::new();
        let mut resolved = *structurally_resolved;

        if node_kind == SKind::RenderTag {
            if let Some(name) = callee {
                if let Some(ids) = snippets_by_name.get(name) {
                    snippet_ids.extend(ids.iter().copied());
                } else {
                    // Callee doesn't name a local snippet: resolved when it is a
                    // prop / import / unknown global (is_resolved_snippet), else
                    // unresolved.
                    resolved = name_is_resolved_snippet(name, analysis);
                }
            }
        } else {
            // Components: direct `{#snippet}` children (when structurally
            // resolved) plus snippet-named expression attributes.
            if let Some(direct) = component_direct_snippets.get(renderer) {
                snippet_ids.extend(direct.iter().copied());
            }
            if let Some(names) = graph.nodes[*renderer].name.clone() {
                for n in names.split('\u{0}') {
                    if let Some(ids) = snippets_by_name.get(n) {
                        snippet_ids.extend(ids.iter().copied());
                    } else if !name_is_resolved_snippet(n, analysis) {
                        resolved = false;
                    }
                }
            }
        }

        if !resolved {
            snippet_ids = all_snippets.clone();
        }
        snippet_ids.sort_unstable();
        snippet_ids.dedup();
        for s in &snippet_ids {
            graph.snippet_sites.entry(*s).or_default().push(*renderer);
        }
        graph.renderer_snippets.insert(*renderer, snippet_ids);
    }

    graph
}

/// Approximation of upstream `is_resolved_snippet(binding)` using the
/// analysis root bindings: a prop / rest prop / bindable prop / import /
/// unknown (global) identifier cannot reference a locally defined snippet.
fn name_is_resolved_snippet(
    name: &str,
    analysis: Option<&super::types::ComponentAnalysis>,
) -> bool {
    let Some(analysis) = analysis else {
        // No analysis available: treat unknown callees as resolved (no local
        // snippet linkage) to avoid over-linking.
        return true;
    };
    let mut found = false;
    for b in &analysis.root.bindings {
        if b.name != name {
            continue;
        }
        found = true;
        if matches!(
            b.kind,
            crate::compiler::phases::phase2_analyze::scope::BindingKind::Prop
                | crate::compiler::phases::phase2_analyze::scope::BindingKind::BindableProp
                | crate::compiler::phases::phase2_analyze::scope::BindingKind::RestProp
        ) || matches!(
            b.declaration_kind,
            crate::compiler::phases::phase2_analyze::scope::DeclarationKind::Import
        ) || b.initial_node_type.as_deref() == Some("SnippetBlock")
        {
            return true;
        }
    }
    // No binding at all (global) is "resolved" upstream.
    !found
}

/// Mirror of upstream shared/component.js `visit_component` snippet
/// resolution over a component's attributes. Returns (resolved, snippet
/// names referenced through expression attributes).
fn component_snippet_resolution(attributes: &[template::Attribute]) -> (bool, Vec<String>) {
    let mut resolved = true;
    let mut names = Vec::new();
    for attr in attributes {
        match attr {
            template::Attribute::SpreadAttribute(_) | template::Attribute::BindDirective(_) => {
                resolved = false;
            }
            template::Attribute::Attribute(a) => {
                if let template::AttributeValue::Expression(expr_tag) = &a.value {
                    let json = expr_tag.expression.as_json();
                    match json.get("type").and_then(|t| t.as_str()) {
                        Some("Identifier") => {
                            if let Some(n) = json.get("name").and_then(|n| n.as_str()) {
                                names.push(n.to_string());
                            }
                        }
                        Some("Literal") => {}
                        _ => {
                            resolved = false;
                        }
                    }
                }
            }
            _ => {}
        }
    }
    (resolved, names)
}

// ---------------------------------------------------------------------------
// Tree helpers (ports of get_ancestor_elements / get_descendant_elements /
// get_element_parent / get_possible_element_siblings / loop_child)
// ---------------------------------------------------------------------------

/// Port of `get_element_parent`: nearest element ancestor (lexically).
fn g_element_parent(graph: &SGraph, node: usize) -> Option<usize> {
    let mut cur = graph.node(node).parent;
    while let Some(p) = cur {
        match graph.node(p).kind {
            SKind::Regular | SKind::SvelteElem => return Some(p),
            _ => cur = graph.node(p).parent,
        }
    }
    None
}

/// Port of `get_ancestor_elements`.
fn g_ancestor_elements(
    graph: &SGraph,
    node: usize,
    adjacent_only: bool,
    seen: &mut FxHashSet<usize>,
) -> Vec<usize> {
    let mut ancestors = Vec::new();
    let mut cur = graph.node(node).parent;
    while let Some(p) = cur {
        match graph.node(p).kind {
            SKind::Snippet => {
                if seen.insert(p)
                    && let Some(sites) = graph.snippet_sites.get(&p)
                {
                    for site in sites {
                        ancestors.extend(g_ancestor_elements(graph, *site, adjacent_only, seen));
                    }
                }
                break;
            }
            SKind::Regular | SKind::SvelteElem => {
                ancestors.push(p);
                if adjacent_only {
                    break;
                }
                cur = graph.node(p).parent;
            }
            SKind::Root => break,
            _ => cur = graph.node(p).parent,
        }
    }
    ancestors
}

/// Port of `get_descendant_elements`.
fn g_descendant_elements(
    graph: &SGraph,
    node: usize,
    adjacent_only: bool,
    seen: &mut FxHashSet<usize>,
) -> Vec<usize> {
    let mut descendants = Vec::new();
    fn walk_children(
        graph: &SGraph,
        node: usize,
        adjacent_only: bool,
        seen: &mut FxHashSet<usize>,
        out: &mut Vec<usize>,
    ) {
        for frag in graph.node(node).fragments.iter().flatten() {
            for &child in frag {
                match graph.node(child).kind {
                    SKind::Regular | SKind::SvelteElem => {
                        out.push(child);
                        if !adjacent_only {
                            walk_children(graph, child, adjacent_only, seen, out);
                        }
                    }
                    SKind::RenderTag => {
                        if let Some(snippets) = graph.renderer_snippets.get(&child) {
                            for &snippet in snippets {
                                if seen.insert(snippet) {
                                    walk_children(graph, snippet, adjacent_only, seen, out);
                                }
                            }
                        }
                    }
                    _ => {
                        walk_children(graph, child, adjacent_only, seen, out);
                    }
                }
            }
        }
    }
    if graph.node(node).kind == SKind::RenderTag {
        if let Some(snippets) = graph.renderer_snippets.get(&node) {
            for &snippet in snippets.clone().iter() {
                if seen.insert(snippet) {
                    walk_children(graph, snippet, adjacent_only, seen, &mut descendants);
                }
            }
        }
    } else {
        walk_children(graph, node, adjacent_only, seen, &mut descendants);
    }
    descendants
}

/// Ordered map of node id -> "definitely exists".
type SiblingMap = Vec<(usize, bool)>;

fn map_insert(map: &mut SiblingMap, id: usize, definite: bool) {
    if let Some(entry) = map.iter_mut().find(|(eid, _)| *eid == id) {
        entry.1 |= definite;
    } else {
        map.push((id, definite));
    }
}

fn map_extend(map: &mut SiblingMap, from: &SiblingMap) {
    for (id, definite) in from {
        map_insert(map, *id, *definite);
    }
}

fn map_has_definite(map: &SiblingMap) -> bool {
    map.iter().any(|(_, d)| *d)
}

/// Port of `get_possible_element_siblings`.
fn g_possible_element_siblings(
    graph: &SGraph,
    node: usize,
    dir: Dir,
    adjacent_only: bool,
    seen: &mut FxHashSet<usize>,
) -> SiblingMap {
    let mut result: SiblingMap = Vec::new();
    let mut current = node;

    while let Some(parent) = graph.node(current).parent {
        let frag_idx = graph.node(current).parent_fragment;
        let pos = graph.node(current).parent_index as isize;
        let frag = match &graph.node(parent).fragments[frag_idx] {
            Some(f) => f,
            None => break,
        };

        let step: isize = if dir == Dir::Forward { 1 } else { -1 };
        let mut j = pos + step;
        while j >= 0 && (j as usize) < frag.len() {
            let n = frag[j as usize];
            let kind = graph.node(n).kind;
            match kind {
                SKind::Regular if !graph.node(n).has_slot_attribute => {
                    map_insert(&mut result, n, true);
                    if adjacent_only {
                        return result;
                    }
                }
                SKind::Regular => {}
                SKind::SvelteElem => {
                    map_insert(&mut result, n, false);
                }
                SKind::RenderTag => {
                    map_insert(&mut result, n, false);
                    if let Some(snippets) = graph.renderer_snippets.get(&n) {
                        for &snippet in snippets {
                            let nested = g_possible_nested_siblings(
                                graph,
                                snippet,
                                dir,
                                adjacent_only,
                                &mut FxHashSet::default(),
                            );
                            map_extend(&mut result, &nested);
                        }
                    }
                }
                _ if is_block_kind(kind) || kind == SKind::Component => {
                    if kind == SKind::Slot || kind == SKind::Component {
                        map_insert(&mut result, n, false);
                    }
                    let nested = g_possible_nested_siblings(
                        graph,
                        n,
                        dir,
                        adjacent_only,
                        &mut FxHashSet::default(),
                    );
                    let nested_definite = map_has_definite(&nested);
                    map_extend(&mut result, &nested);
                    if adjacent_only && kind != SKind::Component && nested_definite {
                        return result;
                    }
                }
                _ => {}
            }
            j += step;
        }

        current = parent;
        let kind = graph.node(current).kind;
        if kind == SKind::Root {
            break;
        }
        if matches!(
            kind,
            SKind::Component | SKind::SvelteComponent | SKind::SvelteSelf
        ) {
            continue;
        }
        if kind == SKind::Snippet {
            if !seen.insert(current) {
                break;
            }
            if let Some(sites) = graph.snippet_sites.get(&current) {
                for site in sites {
                    let siblings =
                        g_possible_element_siblings(graph, *site, dir, adjacent_only, seen);
                    let definite = map_has_definite(&siblings);
                    map_extend(&mut result, &siblings);
                    if adjacent_only && sites.len() == 1 && definite {
                        return result;
                    }
                }
            }
        }
        if !is_block_kind(kind) {
            break;
        }
        if kind == SKind::Each && frag_idx == 0 {
            // `{#each ...}<a /><b />{/each}` — `<b>` can be a previous sibling
            // of `<a />` (wrap-around).
            let nested = g_possible_nested_siblings(
                graph,
                current,
                dir,
                adjacent_only,
                &mut FxHashSet::default(),
            );
            map_extend(&mut result, &nested);
        }
    }

    result
}

/// Port of `get_possible_nested_siblings`.
fn g_possible_nested_siblings(
    graph: &SGraph,
    node: usize,
    dir: Dir,
    adjacent_only: bool,
    seen: &mut FxHashSet<usize>,
) -> SiblingMap {
    let kind = graph.node(node).kind;
    let mut fragments: Vec<Option<&Vec<usize>>> = Vec::new();
    match kind {
        SKind::Each | SKind::If | SKind::Await | SKind::Key | SKind::Slot => {
            for f in &graph.node(node).fragments {
                fragments.push(f.as_ref());
            }
        }
        SKind::Snippet => {
            if !seen.insert(node) {
                return Vec::new();
            }
            for f in &graph.node(node).fragments {
                fragments.push(f.as_ref());
            }
        }
        SKind::Component => {
            for f in &graph.node(node).fragments {
                fragments.push(f.as_ref());
            }
            if let Some(snippets) = graph.renderer_snippets.get(&node) {
                for &snippet in snippets {
                    for f in &graph.node(snippet).fragments {
                        fragments.push(f.as_ref());
                    }
                }
            }
        }
        _ => {}
    }

    let mut result: SiblingMap = Vec::new();
    let mut exhaustive = kind != SKind::Slot && kind != SKind::Snippet;

    for fragment in fragments {
        let Some(fragment) = fragment else {
            exhaustive = false;
            continue;
        };
        let map = g_loop_child(graph, fragment, dir, adjacent_only, seen);
        exhaustive = exhaustive && map_has_definite(&map);
        map_extend(&mut result, &map);
    }

    if !exhaustive {
        for entry in &mut result {
            entry.1 = false;
        }
    }

    result
}

/// Port of `loop_child`.
fn g_loop_child(
    graph: &SGraph,
    children: &[usize],
    dir: Dir,
    adjacent_only: bool,
    seen: &mut FxHashSet<usize>,
) -> SiblingMap {
    let mut result: SiblingMap = Vec::new();
    let step: isize = if dir == Dir::Forward { 1 } else { -1 };
    let mut i: isize = if dir == Dir::Forward {
        0
    } else {
        children.len() as isize - 1
    };
    while i >= 0 && (i as usize) < children.len() {
        let child = children[i as usize];
        let kind = graph.node(child).kind;
        match kind {
            SKind::Regular => {
                map_insert(&mut result, child, true);
                if adjacent_only {
                    break;
                }
            }
            SKind::SvelteElem => {
                map_insert(&mut result, child, false);
            }
            SKind::RenderTag => {
                if let Some(snippets) = graph.renderer_snippets.get(&child) {
                    for &snippet in snippets {
                        let nested =
                            g_possible_nested_siblings(graph, snippet, dir, adjacent_only, seen);
                        map_extend(&mut result, &nested);
                    }
                }
            }
            _ if is_block_kind(kind) => {
                let child_result =
                    g_possible_nested_siblings(graph, child, dir, adjacent_only, seen);
                let definite = map_has_definite(&child_result);
                map_extend(&mut result, &child_result);
                if adjacent_only && definite {
                    break;
                }
            }
            _ => {}
        }
        i += step;
    }
    result
}

// ---------------------------------------------------------------------------
// Selector application (ports of apply_selector / apply_combinator /
// relative_selector_might_apply_to_node)
// ---------------------------------------------------------------------------

/// Port of upstream `is_global(node)` from 2-analyze/css/utils.js — the
/// strict form used by the opaque-sibling rule (`metadata.is_global`).
fn compute_is_global(selectors: &[CssSimpleSelector]) -> bool {
    let Some(CssSimpleSelector::PseudoClass(name, args)) = selectors.first() else {
        return false;
    };
    name == "global" && (args.is_none() || selectors.iter().all(is_unscoped_or_pseudo_element))
}

fn g_every_is_global(selectors: &[CssRelativeSelector], from: usize, to: usize) -> bool {
    selectors[from..to].iter().all(is_relative_selector_global)
}

/// Graph-based selector matcher: the `apply_selector` /
/// `apply_combinator` / `relative_selector_might_apply_to_node` port family
/// shares the node graph and the `marks` accumulator through this struct
/// instead of threading them through every recursive call.
struct GMatcher<'a> {
    graph: &'a SGraph,
    marks: &'a mut FxHashSet<(u32, u32)>,
}

impl GMatcher<'_> {
    /// Port of `apply_selector`. Marks every matched element in `marks`.
    fn apply_selector(
        &mut self,
        selectors: &[CssRelativeSelector],
        from: usize,
        to: usize,
        node: usize,
        dir: Dir,
    ) -> bool {
        if from >= to {
            return false;
        }
        let idx = if dir == Dir::Forward { from } else { to - 1 };
        let rel = &selectors[idx];
        let (rest_from, rest_to) = if dir == Dir::Forward {
            (from + 1, to)
        } else {
            (from, to - 1)
        };

        let matched = self.relative_might_apply(rel, selectors, node)
            && self.apply_combinator(rel, selectors, rest_from, rest_to, node, dir);

        if matched {
            let n = self.graph.node(node);
            self.marks.insert((n.start, n.end));
        }

        matched
    }

    /// Port of `apply_combinator`.
    fn apply_combinator(
        &mut self,
        rel: &CssRelativeSelector,
        selectors: &[CssRelativeSelector],
        from: usize,
        to: usize,
        node: usize,
        dir: Dir,
    ) -> bool {
        let combinator: Option<String> = if dir == Dir::Forward {
            if from < to {
                selectors[from].combinator.clone()
            } else {
                None
            }
        } else {
            rel.combinator.clone()
        };
        let Some(comb) = combinator else {
            return true;
        };

        match comb.as_str() {
            " " | ">" => {
                let is_adjacent = comb == ">";
                let parents = if dir == Dir::Forward {
                    g_descendant_elements(self.graph, node, is_adjacent, &mut FxHashSet::default())
                } else {
                    g_ancestor_elements(self.graph, node, is_adjacent, &mut FxHashSet::default())
                };
                let mut parent_matched = false;
                for parent in &parents {
                    if self.apply_selector(selectors, from, to, *parent, dir) {
                        parent_matched = true;
                    }
                }
                parent_matched
                    || (dir == Dir::Backward
                        && (!is_adjacent || parents.is_empty())
                        && g_every_is_global(selectors, from, to))
            }
            "+" | "~" => {
                let siblings = g_possible_element_siblings(
                    self.graph,
                    node,
                    dir,
                    comb == "+",
                    &mut FxHashSet::default(),
                );
                let mut sibling_matched = false;
                for (sibling, _) in &siblings {
                    let kind = self.graph.node(*sibling).kind;
                    if matches!(kind, SKind::RenderTag | SKind::Slot | SKind::Component) {
                        // `{@render foo()}<p>foo</p>` with `:global(.x) + p` is a match
                        if to - from == 1 && compute_is_global(&selectors[from].selectors) {
                            sibling_matched = true;
                        }
                    } else if self.apply_selector(selectors, from, to, *sibling, dir) {
                        sibling_matched = true;
                    }
                }
                sibling_matched
                    || (dir == Dir::Backward
                        && g_element_parent(self.graph, node).is_none()
                        && g_every_is_global(selectors, from, to))
            }
            _ => true,
        }
    }

    /// Port of `relative_selector_might_apply_to_node`, covering the `:has`,
    /// `:not`, `:is`/`:where` and `:global(...)` cases with graph-based matching;
    /// plain simple selectors delegate to `element_matches_simple_selectors`.
    fn relative_might_apply(
        &mut self,
        rel: &CssRelativeSelector,
        complex: &[CssRelativeSelector],
        node: usize,
    ) -> bool {
        let Some(elem) = self.graph.node(node).elem.as_ref() else {
            return false;
        };

        for selector in &rel.selectors {
            match selector {
                CssSimpleSelector::PseudoClass(name, Some(args)) if name == "has" => {
                    // If this is a :has inside a global selector, include the
                    // element itself, because the global part might match an
                    // element outside the component (e.g. `:root:has(.scoped)`).
                    let include_self = complex.iter().any(is_relative_selector_global)
                        || complex.iter().any(|r| {
                            r.selectors.iter().any(|s| {
                                matches!(s, CssSimpleSelector::PseudoClass(n, a)
                                if n == "root" || (n == "global" && a.is_some()))
                            })
                        });

                    let mut matched = false;
                    for cs in args {
                        let truncated = truncate_globals(&cs.children);
                        if truncated.is_empty() {
                            // it was just a :global(...)
                            matched = true;
                            continue;
                        }

                        if include_self {
                            let mut sel_inc: Vec<CssRelativeSelector> = truncated.to_vec();
                            sel_inc[0].combinator = None;
                            if self.apply_selector(&sel_inc, 0, sel_inc.len(), node, Dir::Forward) {
                                matched = true;
                            }
                        }

                        // `.x:has(.y)` is treated as `.x .y`: prepend a synthetic
                        // "any" selector representing the element itself.
                        let mut sel_exc: Vec<CssRelativeSelector> =
                            Vec::with_capacity(truncated.len() + 1);
                        sel_exc.push(CssRelativeSelector {
                            combinator: None,
                            selectors: Vec::new(),
                            is_global: false,
                            is_global_like: false,
                        });
                        let mut first = truncated[0].clone();
                        if first.combinator.is_none() {
                            first.combinator = Some(" ".to_string());
                        }
                        sel_exc.push(first);
                        sel_exc.extend_from_slice(&truncated[1..]);
                        if self.apply_selector(&sel_exc, 0, sel_exc.len(), node, Dir::Forward) {
                            matched = true;
                        }
                    }

                    if !matched {
                        return false;
                    }
                }
                CssSimpleSelector::PseudoClass(name, args) => {
                    if name == "host" || name == "root" {
                        return false;
                    }
                    if name == "global" {
                        if let Some(args) = args {
                            if rel.selectors.len() == 1 {
                                let Some(cs) = args.first() else {
                                    return true;
                                };
                                return self.apply_selector(
                                    &cs.children,
                                    0,
                                    cs.children.len(),
                                    node,
                                    Dir::Backward,
                                );
                            }
                            // `:global(...)` among other selectors: potential match.
                            continue;
                        }
                        // bare `:global` — everything beyond it is global
                        return true;
                    }
                    if name == "not" {
                        if let Some(args) = args {
                            for cs in args {
                                if cs.children.len() > 1 {
                                    // foo:not(bar foo): assume bar is an ancestor of
                                    // foo; scope the element and its ancestors.
                                    let mut el = Some(node);
                                    while let Some(e) = el {
                                        let n = self.graph.node(e);
                                        self.marks.insert((n.start, n.end));
                                        el = g_element_parent(self.graph, e);
                                    }
                                }
                            }
                        }
                        continue;
                    }
                    if (name == "is" || name == "where") && args.is_some() {
                        let mut matched = false;
                        for cs in args.as_ref().unwrap() {
                            let relative = truncate_globals(&cs.children);
                            if relative.is_empty()
                                || self.apply_selector(
                                    relative,
                                    0,
                                    relative.len(),
                                    node,
                                    Dir::Backward,
                                )
                            {
                                matched = true;
                            } else if cs.children.len() > 1 {
                                // foo :is(bar baz): assume bar is an ancestor of foo
                                matched = true;
                            }
                        }
                        if !matched {
                            return false;
                        }
                    }
                    // other pseudo-classes are a potential match
                }
                CssSimpleSelector::PseudoElement | CssSimpleSelector::Nesting => {}
                simple => {
                    if !element_matches_simple_selectors(elem, std::slice::from_ref(simple)) {
                        return false;
                    }
                }
            }
        }

        true
    }
}

/// Whether a complex selector contains a `:has(...)` anywhere.
fn selector_contains_has(selector: &CssComplexSelector) -> bool {
    fn rel_has(rel: &CssRelativeSelector) -> bool {
        rel.selectors.iter().any(|s| match s {
            CssSimpleSelector::PseudoClass(name, args) => {
                (name == "has" && args.is_some())
                    || args
                        .as_ref()
                        .is_some_and(|a| a.iter().any(selector_contains_has))
            }
            _ => false,
        })
    }
    selector.children.iter().any(rel_has)
}

/// Whether a complex selector contains a `:not(...)` with a multi-part
/// complex selector argument (`foo:not(bar foo)`), which upstream handles by
/// scoping the element under test and all of its element ancestors
/// (css-prune.js `:not` branch).
fn selector_contains_complex_not(selector: &CssComplexSelector) -> bool {
    fn rel_has(rel: &CssRelativeSelector) -> bool {
        rel.selectors.iter().any(|s| match s {
            CssSimpleSelector::PseudoClass(name, Some(args)) => {
                (name == "not" && args.iter().any(|cs| cs.children.len() > 1))
                    || args.iter().any(selector_contains_complex_not)
            }
            _ => false,
        })
    }
    selector.children.iter().any(rel_has)
}

/// Run the graph-based pass: every element in the template is tested against
/// every sibling-combinator / `:has` selector via the faithful
/// `apply_selector` port; matched elements (subjects, siblings, ancestors and
/// `:has` inner elements) are collected into `marks`.
fn process_graph_selectors(
    fragment: &Fragment,
    css_selectors: &[CssComplexSelector],
    analysis: Option<&super::types::ComponentAnalysis>,
    marks: &mut FxHashSet<(u32, u32)>,
) {
    let graph_selectors: Vec<&CssComplexSelector> = css_selectors
        .iter()
        .filter(|s| {
            has_sibling_combinator(s)
                || selector_contains_has(s)
                || selector_contains_complex_not(s)
        })
        .collect();
    if graph_selectors.is_empty() {
        return;
    }

    let graph = build_sgraph(fragment, analysis);
    let mut matcher = GMatcher {
        graph: &graph,
        marks,
    };

    for id in 0..matcher.graph.nodes.len() {
        if matcher.graph.node(id).elem.is_none() {
            continue;
        }
        for selector in &graph_selectors {
            let effective = truncate_globals(&selector.children);
            if effective.is_empty() {
                continue;
            }
            matcher.apply_selector(effective, 0, effective.len(), id, Dir::Backward);
        }
    }
}
